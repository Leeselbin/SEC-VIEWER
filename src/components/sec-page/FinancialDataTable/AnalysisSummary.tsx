import React from "react";
import Accordion from "../../common/Accordion";
import { AnalysisResult } from "../../../hooks/useCompanyAnalysis";

interface AnalysisSummaryProps {
  result: AnalysisResult;
}

const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
  const barContainerStyle: React.CSSProperties = {
    width: "100px",
    height: "20px",
    backgroundColor: "#e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
  };
  const barFillStyle: React.CSSProperties = {
    width: `${score * 20}%`,
    height: "100%",
    backgroundColor: "#4caf50",
    transition: "width 0.5s ease-in-out",
  };
  return (
    <div style={barContainerStyle}>
      <div style={barFillStyle}></div>
    </div>
  );
};

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ result }) => {
  return (
    <Accordion title="종합 재무 분석 (5단계 평가)" defaultOpen={true}>
      <div
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>총점: </span>
          <span
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: result.evaluationColor,
            }}
          >
            {result.totalScore}
          </span>
          <span style={{ fontSize: "20px" }}> / 25</span>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: result.evaluationColor,
              marginTop: "10px",
            }}
          >
            {result.evaluation}
          </div>
        </div>
        <div>
          {result.steps.map((step, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>
                  {index + 1}단계: {step.label}
                </div>
                <div style={{ fontSize: "12px", color: "#777" }}>
                  {step.description}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <ScoreBar score={step.score} />
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                  {step.score} / 5 점
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Accordion>
  );
};

export default AnalysisSummary;
