import React, { useState } from "react";
import { ProcessedRecord, useCompanyFacts } from "../hooks/useCompanyFacts";
import FinancialDataView from "./FinacialDataView";
import ModalDataView from "./Modal/ModalDataView";

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

  const handleRowClick = (record: ProcessedRecord) => {
    setSelectedRecord(record);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
  };

  if (!cik) {
    return (
      <p style={{ textAlign: "center" }}>
        📈 회사를 선택하여 재무 데이터를 조회하세요.
      </p>
    );
  }

  return (
    <>
      <FinancialDataView
        companyName={companyName}
        years={years}
        records={data}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRowClick={handleRowClick}
      />
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
