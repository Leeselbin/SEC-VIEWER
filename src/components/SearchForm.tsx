import React, { useState } from "react";

const COMPANIES: { [key: string]: string } = {
  NVDA: "0001045810",
  MSFT: "0000789019",
  AAPL: "0000320193",
  AMZN: "0001018724",
  GOOGL: "0001652044",
  META: "0001326801",
  AVGO: "0001730168",
  "BRK-B": "0001067983",
  TSLA: "0001318605",
  JPM: "0000019617",
  WMT: "0000104169",
  V: "0001403161",
  LLY: "0000059478",
  ORCL: "0001341439",
  NFLX: "0001065280",
  MA: "0001141391",
  XOM: "0000034088",
  COST: "0000909832",
  CBOE: "0001374310",
  // GOOG: "0001652044",
};

const YEAR_OPTIONS = [1, 2, 3, 4, 5, 10];

export interface SearchParams {
  cik: string;
  companyName: string;
  years: number;
  ticker: string;
}

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  onReset: () => void;
  isSearching: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  onReset,
  isSearching,
}) => {
  const [selectedCik, setSelectedCik] = useState<string>("");
  const [selectedYears, setSelectedYears] = useState<number>(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCik) {
      alert("회사를 선택해주세요.");
      return;
    }
    const companyName =
      Object.keys(COMPANIES).find((name) => COMPANIES[name] === selectedCik) ||
      "";

    console.log("companyName :", companyName);
    onSearch({
      cik: selectedCik,
      companyName,
      years: selectedYears,
      ticker: companyName,
    });
  };

  const handleReset = () => {
    setSelectedCik("");
    setSelectedYears(3);
    onReset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "20px",
      }}
    >
      <select
        value={selectedCik}
        onChange={(e) => setSelectedCik(e.target.value)}
        required
      >
        <option value="">-- 회사 선택 --</option>
        {Object.entries(COMPANIES).map(([name, cik]) => (
          <option key={cik} value={cik}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={selectedYears}
        onChange={(e) => setSelectedYears(Number(e.target.value))}
      >
        {YEAR_OPTIONS.map((year) => (
          <option key={year} value={year}>
            최근 {year}년
          </option>
        ))}
      </select>

      <button type="submit" disabled={isSearching || !selectedCik}>
        {isSearching ? "조회 중..." : "검색"}
      </button>

      <button type="button" onClick={handleReset} disabled={isSearching}>
        초기화
      </button>
    </form>
  );
};

export default SearchForm;
