// src/components/InvestmentMetricsTable.tsx
import React from "react";
import { InvestmentMetric } from "../hooks/useCompanyFacts";

interface InvestmentMetricsTableProps {
  metrics: InvestmentMetric[];
}

const InvestmentMetricsTable: React.FC<InvestmentMetricsTableProps> = ({
  metrics,
}) => {
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
    textAlign: "right",
  };

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}
    >
      <h3 style={{ textAlign: "center", marginTop: 0 }}>주요 투자 지표</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...tableHeaderStyle, textAlign: "left" }}>회계연도</th>
            <th style={tableHeaderStyle}>ROE (%)</th>
            <th style={tableHeaderStyle}>ROA (%)</th>
            <th style={tableHeaderStyle}>부채비율 (%)</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.year}>
              <td style={{ ...tableCellStyle, textAlign: "left" }}>
                {metric.year}
              </td>
              <td style={tableCellStyle}>{metric.roe?.toFixed(2) ?? "N/A"}</td>
              <td style={tableCellStyle}>{metric.roa?.toFixed(2) ?? "N/A"}</td>
              <td style={tableCellStyle}>
                {metric.debtToEquity?.toFixed(2) ?? "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default InvestmentMetricsTable;
