import React, { useState } from "react";
import { ProcessedRecord, useCompanyFacts } from "../hooks/useCompanyFacts";

import ModalDataView from "./Modal/ModalDataView"; // 경로 확인 필요
import YoYChart from "./YoYChart"; // 경로 확인 필요
import InvestmentMetricsTable from "./InvestmentMetricsTable"; // 경로 확인 필요
import AnalysisSummary from "./AnalysisSummary"; // 경로 확인 필요
import FinancialDataView from "./FinacialDataView";

interface FinancialDataTableProps {
  companyName: string;
  cik: string;
  years: number;
}

const FinancialDataTable: React.FC<FinancialDataTableProps> = ({
  companyName,
  cik,
  years,
}) => {
  const { data, error, isLoading } = useCompanyFacts(cik, companyName, years);
  const [selectedRecord, setSelectedRecord] = useState<ProcessedRecord | null>(
    null
  );

  const handleRowClick = (record: ProcessedRecord) => {
    setSelectedRecord(record);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
  };

  if (isLoading)
    return <p style={{ textAlign: "center" }}>데이터 로딩 및 계산 중...</p>;
  if (error)
    return (
      <p style={{ color: "red", textAlign: "center" }}>오류: {error.message}</p>
    );
  if (!data) return <p style={{ textAlign: "center" }}>데이터가 없습니다.</p>;

  return (
    <>
      {data.analysisResult && <AnalysisSummary result={data.analysisResult} />}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          margin: "40px 0",
        }}
      >
        {/* YoY 성장률 */}
        {data.yoyChartData && <YoYChart chartData={data.yoyChartData} />}
        {/* 주요 투자 지표 */}
        {data.investmentMetrics && (
          <InvestmentMetricsTable metrics={data.investmentMetrics} />
        )}
      </div>

      {/* 상세설명 */}
      <FinancialDataView
        companyName={companyName}
        years={years}
        records={data.records}
        onRowClick={handleRowClick}
      />

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
