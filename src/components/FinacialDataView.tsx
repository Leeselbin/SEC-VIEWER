import React, { useState } from "react";
import { ProcessedRecord } from "../hooks/useCompanyAnalysis";

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

  if (!records || records.length === 0) {
    return (
      <p style={{ textAlign: "center" }}>상세 재무제표 데이터가 없습니다.</p>
    );
  }

  // --- 스타일 정의 ---
  const tableContainerStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    marginBottom: "50px",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    minWidth: "1200px",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  };

  const tableHeaderStyle: React.CSSProperties = {
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    backgroundColor: "#f8f9fa",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  };

  const tableBodyContainerStyle: React.CSSProperties = {
    height: "450px", // 이 높이만큼만 스크롤 영역으로 지정
    overflowY: "auto", // 세로 스크롤바 생성
    overflowX: "auto", // 가로 스크롤바 생성
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

  // [수정] 헤더와 데이터 테이블의 컬럼 너비를 동기화하기 위한 컴포넌트
  const ColGroup = () => (
    <colgroup>
      <col style={{ width: "120px" }} />
      <col style={{ width: "120px" }} />
      <col style={{ width: "90px" }} />
      <col style={{ width: "90px" }} />
      <col style={{ width: "250px" }} />
      <col style={{ width: "150px" }} />
      <col style={{ width: "100px" }} />
      <col style={{ width: "300px" }} />
      <col style={{ width: "100px" }} />
      <col style={{ width: "120px" }} />
    </colgroup>
  );

  return (
    <div>
      <div style={tableContainerStyle}>
        {/* 헤더 전용 테이블 */}
        <table style={tableStyle}>
          <ColGroup />
          <thead>
            <tr>
              <th style={tableHeaderStyle}>제출일</th>
              <th style={tableHeaderStyle}>종료일</th>
              <th style={tableHeaderStyle}>회계연도</th>
              <th style={tableHeaderStyle}>회계분기</th>
              <th style={tableHeaderStyle}>재무항목</th>
              <th style={tableHeaderStyle}>값</th>
              <th style={tableHeaderStyle}>단위</th>
              <th style={tableHeaderStyle}>항목설명</th>
              <th style={tableHeaderStyle}>공시서류</th>
              <th style={tableHeaderStyle}>시작일</th>
            </tr>
          </thead>
        </table>
        {/* 데이터(body) 전용 스크롤 컨테이너 */}
        <div style={tableBodyContainerStyle}>
          <table style={tableStyle}>
            <ColGroup />
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
    </div>
  );
};

export default FinancialDataView;
