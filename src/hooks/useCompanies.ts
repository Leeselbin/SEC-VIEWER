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
    throw new Error("회사 목록을 가져오는 데 실패했습니다.");
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
