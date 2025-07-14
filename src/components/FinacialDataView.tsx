import React, { useState } from 'react';
import { ProcessedRecord } from '../hooks/useCompanyFacts';

interface FinancialDataViewProps {
  companyName: string;
  years: number;
  records: ProcessedRecord[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  onRowClick: (record: ProcessedRecord) => void; 
}

const FinancialDataView: React.FC<FinancialDataViewProps> = ({
  companyName,
  years,
  records,
  isLoading,
  isFetching,
  error,
  onRowClick,
}) => {

  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  
  if (isLoading) {
    return <p style={{ textAlign: 'center' }}>{companyName} 데이터 로딩 중...</p>;
  }

  if (error) {
    return <p style={{ color: 'red', textAlign: 'center' }}>데이터 로딩 실패: {error.message}</p>;
  }

  if (!records || records.length === 0) {
    return <p style={{ textAlign: 'center' }}>표시할 데이터가 없습니다.</p>;
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>
        {companyName} 재무 데이터 (최근 {years}년)
        {isFetching && <span style={{ fontSize: '14px', marginLeft: '10px' }}>🔄</span>}
      </h2>
      <div style={{ overflowX: 'auto', border: '1px solid #ddd' }}>
        <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ ...tableHeaderStyle, width: '120px' }}>제출일</th>
              <th style={{ ...tableHeaderStyle, width: '120px' }}>종료일</th>
              <th style={{ ...tableHeaderStyle, width: '90px' }}>회계연도</th>
              <th style={{ ...tableHeaderStyle, width: '90px' }}>회계분기</th>
              <th style={{ ...tableHeaderStyle, width: '250px' }}>재무항목</th>
              <th style={{ ...tableHeaderStyle, width: '150px' }}>값</th>
              <th style={{ ...tableHeaderStyle, width: '100px' }}>단위</th>
              <th style={{ ...tableHeaderStyle, width: '300px' }}>항목설명</th>
              <th style={{ ...tableHeaderStyle, width: '100px' }}>공시서류</th>
              <th style={{ ...tableHeaderStyle, width: '120px' }}>시작일</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, index) => (
              <tr key={`${rec.제출일}-${rec.재무항목}-${index}`} 
              style={{ borderBottom: '1px solid #ddd',

                backgroundColor: hoveredRowIndex === index ? '#f5f5f5' : 'transparent'
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
                <td style={{ ...tableCellStyle, textAlign: 'right' }}>{rec.값.toLocaleString()}</td>
                <td style={tableCellStyle}>{rec.단위}</td>
                <td style={ellipsisCellStyle} title={rec.항목설명}>
                  {rec.항목설명}
                </td>
                <td style={tableCellStyle}>{rec.공시서류}</td>
                <td style={tableCellStyle}>{rec.시작일 || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 스타일 정의 ---
const tableHeaderStyle: React.CSSProperties = { 
  padding: '12px', 
  textAlign: 'left', 
  borderBottom: '2px solid #ddd',
  backgroundColor: '#f8f9fa',
  fontWeight: 'bold',
  whiteSpace: 'nowrap'
};

const tableCellStyle: React.CSSProperties = { 
  padding: '10px 12px',
  borderBottom: '1px solid #eee',
  verticalAlign: 'top' 
};

// [수정 3] 말줄임표(...)를 위한 새로운 스타일 객체
const ellipsisCellStyle: React.CSSProperties = {
  ...tableCellStyle,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};


export default FinancialDataView;