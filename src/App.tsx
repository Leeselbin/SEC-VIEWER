import React, { useState } from "react";
import SearchForm, { SearchParams } from "./components/SearchForm"; // SearchForm 임포트
import FinancialDataTable from "./components/FinacialDataTable";

const App: React.FC = () => {
  // 검색 조건을 상태로 관리. 초기값은 null.
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  // '검색' 버튼을 눌렀을 때 호출될 함수
  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
  };

  // '초기화' 버튼을 눌렀을 때 호출될 함수
  const handleReset = () => {
    setSearchParams(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SEC 재무 데이터 뷰어</h1>
        <SearchForm
          onSearch={handleSearch}
          onReset={handleReset}
          isSearching={false}
        />
      </header>
      <main className="content">
        {searchParams ? (
          <FinancialDataTable
            companyName={searchParams.companyName}
            cik={searchParams.cik}
            years={searchParams.years}
          />
        ) : (
          <p style={{ textAlign: "center" }}>
            📈 회사와 기간을 선택하고 검색 버튼을 눌러주세요.
          </p>
        )}
      </main>
    </div>
  );
};

export default App;
