import { useQuery } from "@tanstack/react-query";

const fetchPolarityPress = async (ticker_code: string) => {
  const url = `/polarityPress-api/getSentimentAnalysis/${ticker_code}/`;
  const response = await fetch(url);

  if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
  const data = await response.json();

  return data;
};

// --- 커스텀 훅 ---
/**
 * 뉴스 기사 수집후 긍정,부정 판단 API
 * @param ticker - 회사 티커 심볼
 */
export const usePolarityPress = (ticker: string) => {
  return useQuery({
    queryKey: ["polarityPress", ticker],
    queryFn: () => fetchPolarityPress(ticker),
    enabled: !!ticker, // ticker가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 60, // 1시간 동안 데이터를 신선하게 유지
    refetchOnWindowFocus: false,
  });
};
