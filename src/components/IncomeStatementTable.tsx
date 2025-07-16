import React from "react";
import { IncomeStatementData } from "../hooks/useCompanyFacts";

interface IncomeStatementTableProps {
  data: IncomeStatementData;
}

const IncomeStatementTable: React.FC<IncomeStatementTableProps> = ({
  data,
}) => {
  // --- 스타일 정의 (이전과 동일) ---
  const tableContainerStyle: React.CSSProperties = {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginTop: "40px",
  };
  const tableHeaderStyle: React.CSSProperties = {
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    backgroundColor: "#f8f9fa",
    fontWeight: "bold",
  };
  const tableCellStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderBottom: "1px solid #eee",
    textAlign: "left",
  };

  return (
    <div style={tableContainerStyle}>
      {/* [수정] 뷰 전환 버튼 제거 */}
      <h3 style={{ textAlign: "center", marginTop: 0, marginBottom: "20px" }}>
        연간 손익계산서 요약
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...tableHeaderStyle, textAlign: "left" }}>회계연도</th>
            <th style={tableHeaderStyle}>매출 (USD)</th>
            <th style={tableHeaderStyle}>영업이익 (USD)</th>
            <th style={tableHeaderStyle}>순이익 (USD)</th>
          </tr>
        </thead>
        <tbody>
          {/* [수정] data.annual을 직접 사용 */}
          {data.annual.map((rec) => (
            <tr key={rec.year}>
              <td style={{ ...tableCellStyle, textAlign: "left" }}>
                {rec.year}년
              </td>
              <td style={tableCellStyle}>
                {rec.revenue?.toLocaleString() ?? "N/A"}
              </td>
              <td style={tableCellStyle}>
                {rec.operatingIncome?.toLocaleString() ?? "N/A"}
              </td>
              <td style={tableCellStyle}>
                {rec.netIncome?.toLocaleString() ?? "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomeStatementTable;
