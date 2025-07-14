import React from 'react';
import { useCompanyFacts } from '../hooks/useCompanyFacts';
import FinancialDataView from './FinacialDataView';


// Props 타입 정의
interface FinancialDataTableProps {
  companyName: string;
  cik: string;
  years: number;
}

const FinancialDataTable: React.FC<FinancialDataTableProps> = ({ companyName, cik, years }) => {
  const { data, error, isLoading, isFetching } = useCompanyFacts(cik, companyName, years);


  if (!cik) {
    return <p style={{ textAlign: 'center' }}>📈 회사를 선택하여 재무 데이터를 조회하세요.</p>;
  }

  return (
    <FinancialDataView
      companyName={companyName}
      years={years}
      records={data}
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
    />
  );
};

export default FinancialDataTable;