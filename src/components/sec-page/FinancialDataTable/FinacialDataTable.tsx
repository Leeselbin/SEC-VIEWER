import React, { useState } from "react";
import {
  ProcessedRecord,
  useCompanyAnalysis,
} from "../../../hooks/useCompanyAnalysis";

import YoYChart from "./YoYChart";
import InvestmentMetricsTable from "./InvestmentMetricsTable";
import IncomeStatementTable from "./IncomeStatementTable";
import Accordion from "../../common/Accordion";
import { useStockPrice } from "../../../hooks/useStockPrice";

import AnalysisSummary from "./AnalysisSummary";
import FinancialDataView from "./FinacialDataView";
import StockPriceChart from "./StockPriceChart";
import ModalDetailData from "./ModalDetailData";

interface FinancialDataTableProps {
  companyName: string;
  cik: string;
  years: number;
  ticker: string;
}

const FinancialDataTable: React.FC<FinancialDataTableProps> = ({
  companyName,
  cik,
  years,
  ticker,
}) => {
  const { data, error, isLoading } = useCompanyAnalysis(
    cik,
    companyName,
    years
  );
  const {
    data: stockData,
    error: stockError,
    isLoading: isStockLoading,
  } = useStockPrice(ticker, years);
  // const {
  //   data: polarityData,
  //   error: polarityError,
  //   isLoading: isPolarityLoading,
  // } = usePolarityPress(ticker);

  // console.log("polarityData :", polarityData);

  const [selectedRecord, setSelectedRecord] = useState<ProcessedRecord | null>(
    null
  );

  const handleRowClick = (record: ProcessedRecord) => {
    setSelectedRecord(record);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
  };

  if (isLoading || isStockLoading)
    return <p style={{ textAlign: "center" }}>데이터 로딩 및 계산 중...</p>;
  if (error || stockError)
    return (
      <p style={{ color: "red", textAlign: "center" }}>
        오류: {error?.message}
      </p>
    );
  if (!data) return <p style={{ textAlign: "center" }}>데이터가 없습니다.</p>;

  return (
    <>
      {/* 종합 재무 분석 */}
      {data.analysisResult && <AnalysisSummary result={data.analysisResult} />}

      {/* 주가 차트*/}
      {stockData && (
        <StockPriceChart
          chartData={stockData}
          companyName={companyName}
          ticker={ticker}
        />
      )}

      {/* 주요 투자 지표, YoY 성장률 */}
      <div style={{ display: "grid", margin: "40px 0" }}>
        <Accordion title="성장성 및 투자 지표 시각화" defaultOpen={true}>
          <div
            style={{
              display: "grid",

              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {data.yoyChartData && <YoYChart chartData={data.yoyChartData} />}

            {data.investmentMetrics && (
              <InvestmentMetricsTable metrics={data.investmentMetrics} />
            )}
          </div>
        </Accordion>
      </div>

      {/* 연간 손익계산서 */}
      {data.incomeStatementData && (
        <IncomeStatementTable data={data.incomeStatementData} />
      )}

      {/* 상세설명 */}
      {data.records && (
        <FinancialDataView
          records={data.records}
          onRowClick={handleRowClick}
          years={years}
        />
      )}

      {/* Modal */}
      <ModalDetailData
        isOpen={!!selectedRecord}
        onClose={handleCloseModal}
        selectedRecord={selectedRecord}
      />
    </>
  );
};

export default FinancialDataTable;
