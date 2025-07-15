// src/FinancialDataTable.tsx
import React, { useState } from "react";
import { ProcessedRecord, useCompanyFacts } from "../hooks/useCompanyFacts";

import ModalDataView from "./Modal/ModalDataView";
import YoYChart from "./YoYChart";
import InvestmentMetricsTable from "./InvestmentMetricsTable";
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
  const { data, error, isLoading, isFetching } = useCompanyFacts(
    cik,
    companyName,
    years
  );
  const [selectedRecord, setSelectedRecord] = useState<ProcessedRecord | null>(
    null
  );

  const handleRowClick = (record: ProcessedRecord) => setSelectedRecord(record);
  const handleCloseModal = () => setSelectedRecord(null);

  if (isLoading)
    return <p style={{ textAlign: "center" }}>데이터 로딩 및 계산 중...</p>;
  if (error)
    return (
      <p style={{ color: "red", textAlign: "center" }}>오류: {error.message}</p>
    );
  if (!data) return <p style={{ textAlign: "center" }}>데이터가 없습니다.</p>;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {data.yoyChartData && <YoYChart chartData={data.yoyChartData} />}
        {data.investmentMetrics && (
          <InvestmentMetricsTable metrics={data.investmentMetrics} />
        )}
      </div>

      <FinancialDataView
        companyName={companyName}
        years={years}
        records={data.records}
        isLoading={isLoading} // FinancialDataView는 이제 로딩 상태를 직접 관리하지 않음
        isFetching={isFetching}
        error={error}
        onRowClick={handleRowClick}
      />
      <ModalDataView isOpen={!!selectedRecord} onClose={handleCloseModal}>
        {selectedRecord && (
          <div>
            <h3>상세 정보 ({selectedRecord.재무항목})</h3>
            <ul>
              {Object.entries(selectedRecord).map(([key, value]) => (
                <li key={key}>
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
