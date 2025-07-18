import React, { useState } from "react";
import { ProcessedRecord, useCompanyFacts } from "../hooks/useCompanyFacts";

import ModalDataView from "./Modal/ModalDataView";
import YoYChart from "./YoYChart";
import InvestmentMetricsTable from "./InvestmentMetricsTable";
import AnalysisSummary from "./AnalysisSummary";
import FinancialDataView from "./FinacialDataView";
import IncomeStatementTable from "./IncomeStatementTable";
import Accordion from "./Accordion";
import { useStockPrice } from "../hooks/useStockPrice";
import StockPriceChart from "./StockPriceChart";
import { usePolarityPress } from "../hooks/usePolarityPress";

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
  const { data, error, isLoading } = useCompanyFacts(cik, companyName, years);
  const {
    data: stockData,
    error: stockError,
    isLoading: isStockLoading,
  } = useStockPrice(ticker, years);
  const {
    data: polarityData,
    error: polarityError,
    isLoading: isPolarityLoading,
  } = usePolarityPress(ticker);

  console.log("polarityData :", polarityData);

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
      {data.analysisResult && (
        <Accordion title="종합 재무 분석 (5단계 평가)" defaultOpen={true}>
          <AnalysisSummary result={data.analysisResult} />
        </Accordion>
      )}

      {/* 주가 차트*/}
      <Accordion
        title={`${companyName} (${ticker}) 주가 차트`}
        defaultOpen={true}
      >
        {stockData && (
          <StockPriceChart chartData={stockData} companyName={companyName} />
        )}
      </Accordion>

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
        <Accordion title="손익계산서 요약" defaultOpen={true}>
          <IncomeStatementTable data={data.incomeStatementData} />
        </Accordion>
      )}

      {/* 상세설명 */}
      {data.records && (
        <div style={{ margin: "40px 0 40px" }}>
          <Accordion
            title={`상세 재무제표 (최근 ${years}년)`}
            defaultOpen={true}
          >
            <FinancialDataView
              companyName={companyName}
              years={years}
              records={data.records}
              onRowClick={handleRowClick}
            />
          </Accordion>
        </div>
      )}

      {/* Modal */}
      <ModalDataView isOpen={!!selectedRecord} onClose={handleCloseModal}>
        {selectedRecord && (
          <div>
            <h3
              style={{
                marginTop: 0,
                borderBottom: "2px solid #eee",
                paddingBottom: "10px",
              }}
            >
              상세 정보 ({selectedRecord.재무항목})
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {Object.entries(selectedRecord).map(([key, value]) => (
                <li
                  key={key}
                  style={{
                    padding: "5px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <strong>{key}:</strong> {value?.toString() || "N/A"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </ModalDataView>
    </>
  );
};

export default FinancialDataTable;
