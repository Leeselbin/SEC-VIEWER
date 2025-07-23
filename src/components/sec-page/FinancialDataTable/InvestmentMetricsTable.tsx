import React, { useState } from "react";
import { InvestmentMetric } from "../../../hooks/useCompanyAnalysis";

interface InvestmentMetricsTableProps {
  metrics: InvestmentMetric[];
}

const InvestmentMetricsTable: React.FC<InvestmentMetricsTableProps> = ({
  metrics,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // --- [수정] 스타일 객체 개선 ---
  const tableHeaderStyle: React.CSSProperties = {
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    backgroundColor: "#f8f9fa",
    fontWeight: "bold",
    position: "relative", // 툴팁 위치의 기준점
    cursor: "help", // 마우스 커서를 도움말 모양으로 변경
  };

  const tableCellStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderBottom: "1px solid #eee",
    textAlign: "right",
  };

  // 툴팁 컨테이너 스타일
  const tooltipContainerStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "125%", // 헤더 위쪽에 위치
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
    // 애니메이션 효과를 위해 opacity와 visibility를 분리
    transition: "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
  };

  // 툴팁 말풍선 스타일
  const tooltipBubbleStyle: React.CSSProperties = {
    position: "relative",
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "left",
    padding: "10px 15px",
    borderRadius: "8px",
    width: "300px",
    maxWidth: "90vw", // [수정] 화면 너비의 90%를 넘지 않도록 최대 너비 설정
    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
    fontSize: "14px",
    lineHeight: "1.5",
  };

  // 툴팁 꼬리(화살표) 스타일
  const tooltipArrowStyle: React.CSSProperties = {
    content: '""',
    position: "absolute",
    top: "100%",
    left: "50%",
    marginLeft: "-5px",
    borderWidth: "5px",
    borderStyle: "solid",
    borderColor: "#333 transparent transparent transparent",
  };

  const tooltips: { [key: string]: string } = {
    ROE: "자기자본이익률(ROE)은 기업이 자기자본을 활용해 얼마의 이익을 냈는지 나타내는 지표로, 기업의 수익성을 판단하는 데 사용됩니다.",
    ROA: "총자산이익률(ROA)은 기업이 소유한 총자산을 얼마나 효율적으로 사용해 이익을 창출했는지 나타내는 지표입니다.",
    DE: "부채비율은 자기자본 대비 부채의 비율을 나타냅니다. 기업의 재무 안정성을 파악하는 지표로, 보통 100% 이하면 안정적이라고 평가합니다.",
  };

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}
    >
      <h3 style={{ textAlign: "center", marginTop: 0 }}>주요 투자 지표</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                ...tableHeaderStyle,
                textAlign: "left",
                cursor: "default",
              }}
            >
              회계연도
            </th>

            {["ROE", "ROA", "DE"].map((metricKey) => {
              const labels: { [key: string]: string } = {
                ROE: "ROE (%)",
                ROA: "ROA (%)",
                DE: "부채비율 (%)",
              };
              return (
                <th
                  key={metricKey}
                  style={tableHeaderStyle}
                  onMouseEnter={() => setActiveTooltip(metricKey)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {labels[metricKey]}
                  {/* [수정] 툴팁 구조 변경 및 애니메이션 적용 */}
                  <div
                    style={{
                      ...tooltipContainerStyle,
                      opacity: activeTooltip === metricKey ? 1 : 0,
                      visibility:
                        activeTooltip === metricKey ? "visible" : "hidden",
                    }}
                  >
                    <div style={tooltipBubbleStyle}>
                      {tooltips[metricKey]}
                      <div style={tooltipArrowStyle}></div>
                    </div>
                  </div>
                </th>
              );
            })}
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
