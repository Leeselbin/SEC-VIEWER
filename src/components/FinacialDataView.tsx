// src/components/FinancialDataView.tsx

import React, { useState } from "react";
import { ProcessedRecord } from "../hooks/useCompanyFacts";

// [수정] isLoading, isFetching, error props 제거
interface FinancialDataViewProps {
  companyName: string;
  years: number;
  records: ProcessedRecord[] | undefined;
  onRowClick: (record: ProcessedRecord) => void;
}

const FinancialDataView: React.FC<FinancialDataViewProps> = ({
  companyName,
  years,
  records,
  onRowClick,
}) => {
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  // [수정] isLoading, error, !records 조건문 제거
  // 부모 컴포넌트가 이들을 이미 처리했기 때문에, 이 컴포넌트는 항상 records가 있다고 가정할 수 있습니다.
  if (!records || records.length === 0) {
    return (
      <p style={{ textAlign: "center" }}>상세 재무제표 데이터가 없습니다.</p>
    );
  }

  // --- 스타일 정의 (이전과 동일) ---
  const tableHeaderStyle: React.CSSProperties = {
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    backgroundColor: "#f8f9fa",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  };
  const tableCellStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top",
  };
  const ellipsisCellStyle: React.CSSProperties = {
    ...tableCellStyle,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  const clickableRowStyle: React.CSSProperties = {
    borderBottom: "1px solid #ddd",
    cursor: "pointer",
  };

  return (
    <div>
      {/* isFetching은 부모가 아닌 여기서 직접 표시해도 괜찮습니다. (백그라운드 업데이트 표시용) */}
      <h3 style={{ textAlign: "center", marginTop: "40px" }}>
        상세 재무제표 (최근 {years}년)
      </h3>
      <div style={{ overflowX: "auto", border: "1px solid #ddd" }}>
        <table
          style={{
            width: "100%",
            minWidth: "1200px",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <thead>{/* ... thead 부분은 동일 ... */}</thead>
          <tbody>
            {records.map((rec, index) => (
              <tr
                key={`${rec.제출일}-${rec.재무항목}-${index}`}
                style={{
                  ...clickableRowStyle,
                  backgroundColor:
                    hoveredRowIndex === index ? "#f5f5f5" : "transparent",
                }}
                onClick={() => onRowClick(rec)}
                onMouseEnter={() => setHoveredRowIndex(index)}
                onMouseLeave={() => setHoveredRowIndex(null)}
              >
                {/* ... td 부분은 동일 ... */}
                <td style={tableCellStyle}>{rec.제출일}</td>
                <td style={tableCellStyle}>{rec.종료일}</td>
                <td style={tableCellStyle}>{rec.회계연도}</td>
                <td style={tableCellStyle}>{rec.회계분기}</td>
                <td style={ellipsisCellStyle} title={rec.재무항목}>
                  {rec.재무항목}
                </td>
                <td style={{ ...tableCellStyle, textAlign: "right" }}>
                  {rec.값.toLocaleString()}
                </td>
                <td style={tableCellStyle}>{rec.단위}</td>
                <td style={ellipsisCellStyle} title={rec.항목설명}>
                  {rec.항목설명}
                </td>
                <td style={tableCellStyle}>{rec.공시서류}</td>
                <td style={tableCellStyle}>{rec.시작일 || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialDataView;
