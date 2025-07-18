import React, { useState } from "react";
import { useCompanies } from "../hooks/useCompanies"; // API 호출 훅 임포트

// --- 타입 정의 ---
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

const YEAR_OPTIONS = [1, 2, 3, 4, 5, 10];

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  onReset,
  isSearching,
}) => {
  // [수정] useCompanies 훅을 호출하여 회사 목록을 동적으로 가져옵니다.
  const {
    data: companies,
    isLoading: isLoadingCompanies,
    error: companiesError,
  } = useCompanies();

  const [selectedCik, setSelectedCik] = useState<string>("");
  const [selectedYears, setSelectedYears] = useState<number>(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCik) {
      alert("회사를 선택해주세요.");
      return;
    }

    // [수정] API로 받아온 companies 배열에서 선택된 회사 정보를 찾습니다.
    const selectedCompany = companies?.find(
      (company) => company.sec_code === selectedCik
    );

    if (selectedCompany) {
      // 찾은 정보를 바탕으로 onSearch 함수를 호출합니다.
      onSearch({
        cik: selectedCompany.sec_code,
        companyName: selectedCompany.title,
        years: selectedYears,
        ticker: selectedCompany.ticker_code,
      });
    } else {
      alert("선택된 회사 정보를 찾을 수 없습니다.");
    }
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
        disabled={isLoadingCompanies || !!companiesError} // 로딩 중이거나 에러 발생 시 비활성화
      >
        <option value="">
          {isLoadingCompanies
            ? "회사 목록 로딩 중..."
            : companiesError
            ? "목록 로드 실패"
            : "-- 회사 선택 --"}
        </option>
        {/* [수정] API로 받아온 companies 데이터로 드롭다운 메뉴를 동적으로 생성합니다. */}
        {companies?.map((company) => (
          <option key={company.ticker_code} value={company.sec_code}>
            {company.title} ({company.ticker_code})
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
