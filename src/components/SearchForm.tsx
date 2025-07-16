import React, { useState } from "react";

const COMPANIES: { [key: string]: string } = {
  Microsoft: "0000789019",
  Apple: "0000320193",
  NVIDIA: "0001045810",
  Amazon: "0001018724",
  "Alphabet (Google)": "0001652044",
  "Meta Platforms": "0001326801",
  "Berkshire Hathaway": "0001067983",
  "Eli Lilly": "0000059478",
  Broadcom: "0001730168",
  "JPMorgan Chase": "0000019617",
  Tesla: "0001318605",
  Visa: "0001403161",
  "Johnson & Johnson": "0000200406",
  Walmart: "0000104169",
  "Exxon Mobil": "0000034088",
  "UnitedHealth Group": "0000731766",
  Mastercard: "0001141391",
  "Procter & Gamble": "0000080424",
  Costco: "0000909832",
  "Home Depot": "0000354950",
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
    onSearch({ cik: selectedCik, companyName, years: selectedYears });
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
