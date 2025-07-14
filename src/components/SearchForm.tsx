import React, { useState } from 'react';


const COMPANIES: { [key: string]: string } = {
  "NVIDIA": "0001045810",
  "Apple": "0000320193",
  "UBER": "0001490978"
};

const YEAR_OPTIONS = [1, 2, 3, 4, 5, 10];

export interface SearchParams {
  cik: string;
  companyName: string;
  years: number;
}

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  onReset: () => void;
  isSearching: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, onReset, isSearching }) => {
  const [selectedCik, setSelectedCik] = useState<string>('');
  const [selectedYears, setSelectedYears] = useState<number>(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCik) {
      alert('회사를 선택해주세요.');
      return;
    }
    const companyName = Object.keys(COMPANIES).find(name => COMPANIES[name] === selectedCik) || '';
    onSearch({ cik: selectedCik, companyName, years: selectedYears });
  };

  const handleReset = () => {
    setSelectedCik('');
    setSelectedYears(3);
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
      <select value={selectedCik} onChange={(e) => setSelectedCik(e.target.value)} required>
        <option value="">-- 회사 선택 --</option>
        {Object.entries(COMPANIES).map(([name, cik]) => (
          <option key={cik} value={cik}>{name}</option>
        ))}
      </select>
      
      <select value={selectedYears} onChange={(e) => setSelectedYears(Number(e.target.value))}>
        {YEAR_OPTIONS.map(year => (
          <option key={year} value={year}>최근 {year}년</option>
        ))}
      </select>

      <button type="submit" disabled={isSearching || !selectedCik}>
        {isSearching ? '조회 중...' : '검색'}
      </button>

      <button type="button" onClick={handleReset} disabled={isSearching}>
        초기화
      </button>
    </form>
  );
};

export default SearchForm;