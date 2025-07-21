import { useQuery } from "@tanstack/react-query";

/**
 * S&P500 상위 종목 회사명, ticker_code, sec_code 조회
 */
// --- 타입 정의 ---
export interface Company {
  sec_code: string;
  ticker_code: string;
  title: string;
}

// --- API 호출 함수 ---
const fetchCompanies = async (): Promise<Company[]> => {
  // [수정] 프록시를 사용하도록 URL을 상대 경로로 변경합니다.
  const url = "/companies-api/getCompanies";

  const response = await fetch(url);
  if (!response.ok) {
    const failRes = [
      {
        sec_code: "0001045810",
        ticker_code: "NVDA",
        title: "NVIDIA CORP",
      },
      {
        sec_code: "0000789019",
        ticker_code: "MSFT",
        title: "MICROSOFT CORP",
      },
      {
        sec_code: "0000320193",
        ticker_code: "AAPL",
        title: "Apple Inc.",
      },
      {
        sec_code: "0001018724",
        ticker_code: "AMZN",
        title: "AMAZON COM INC",
      },
      {
        sec_code: "0001652044",
        ticker_code: "GOOGL",
        title: "Alphabet Inc.",
      },
      {
        sec_code: "0001326801",
        ticker_code: "META",
        title: "Meta Platforms, Inc.",
      },
      {
        sec_code: "0001730168",
        ticker_code: "AVGO",
        title: "Broadcom Inc.",
      },
      {
        sec_code: "0001318605",
        ticker_code: "TSLA",
        title: "Tesla, Inc.",
      },
      {
        sec_code: "0001067983",
        ticker_code: "BRK-B",
        title: "BERKSHIRE HATHAWAY INC",
      },
      {
        sec_code: "0000019617",
        ticker_code: "JPM",
        title: "JPMORGAN CHASE & CO",
      },
      {
        sec_code: "0000104169",
        ticker_code: "WMT",
        title: "Walmart Inc.",
      },
      {
        sec_code: "0000059478",
        ticker_code: "LLY",
        title: "ELI LILLY & Co",
      },
      {
        sec_code: "0001403161",
        ticker_code: "V",
        title: "VISA INC.",
      },
      {
        sec_code: "0001341439",
        ticker_code: "ORCL",
        title: "ORACLE CORP",
      },
      {
        sec_code: "0001065280",
        ticker_code: "NFLX",
        title: "NETFLIX INC",
      },
      {
        sec_code: "0001141391",
        ticker_code: "MA",
        title: "Mastercard Inc",
      },
      {
        sec_code: "0000034088",
        ticker_code: "XOM",
        title: "EXXON MOBIL CORP",
      },
      {
        sec_code: "0000909832",
        ticker_code: "COST",
        title: "COSTCO WHOLESALE CORP /NEW",
      },
      {
        sec_code: "0001374310",
        ticker_code: "CBOE",
        title: "Cboe Global Markets, Inc.",
      },
      {
        sec_code: "0001652044",
        ticker_code: "GOOG",
        title: "Alphabet Inc.",
      },
    ];

    return failRes;
  }
  return response.json();
};

// --- 커스텀 훅 ---
export const useCompanies = () => {
  return useQuery<Company[], Error>({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    staleTime: Infinity, // 회사 목록은 거의 변하지 않으므로, 한번 가져온 후 다시 가져오지 않도록 설정
    refetchOnWindowFocus: false,
  });
};
