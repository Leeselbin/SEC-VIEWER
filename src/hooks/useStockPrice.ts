import { useQuery } from "@tanstack/react-query";
import { parseISO, endOfWeek, endOfMonth } from "date-fns";

// --- 타입 정의 ---
// API가 반환하는 개별 주가 데이터의 타입
interface RawStockData {
  date: string;
  close_value: number;
}

// 차트에 사용될 최종 데이터 포인트의 타입
export interface StockChartPoint {
  x: number; // 날짜를 타임스탬프로 저장하여 차트에서 시간순으로 인식
  y: number; // 종가
}

// 일/주/월별로 가공된 최종 차트 데이터의 타입
export interface StockChartData {
  daily: StockChartPoint[];
  weekly: StockChartPoint[];
  monthly: StockChartPoint[];
}

// --- API 호출 및 데이터 처리 로직 ---
/**
 * 특정 티커의 주가 데이터를 N년치 가져와 가공하는 함수
 * @param ticker - 회사 티커 심볼 (예: "AAPL")
 * @param years - 조회할 기간 (예: 3 -> API가 3년치 데이터를 반환)
 */
const fetchStockData = async (
  ticker: string,
  years: number
): Promise<StockChartData> => {
  // API는 years 파라미터로 한번에 N년치 데이터를 반환하므로, API를 한 번만 호출합니다.

  const url = `/stock-api/getFinData/${ticker}/${years}/`;

  let apiData: RawStockData[] = [];

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // API 호출 자체가 실패한 경우
      throw new Error(`주가 데이터 API 호출 오류: ${response.status}`);
    }
    apiData = await response.json();
  } catch (error) {
    console.error(`${years}년치 주가 데이터를 가져오는 중 오류 발생:`, error);
    // 네트워크 오류 등이 발생하면 빈 데이터를 반환합니다.
    return { daily: [], weekly: [], monthly: [] };
  }

  if (!apiData || apiData.length === 0) {
    // API가 빈 배열을 반환한 경우
    console.warn(`${ticker}의 주가 데이터가 비어있습니다.`);
    return { daily: [], weekly: [], monthly: [] };
  }

  // [데이터 처리 로직] - 이 부분은 이전과 동일합니다.
  // 중복 제거 및 시간순으로 정렬합니다.
  const uniqueData = Array.from(
    new Map(apiData.map((item) => [item.date, item])).values()
  );
  uniqueData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 차트에 사용하기 좋은 형태로 가공하고, 일/주/월별로 그룹화합니다.
  const daily: StockChartPoint[] = uniqueData.map((d) => ({
    x: parseISO(d.date).getTime(),
    y: d.close_value,
  }));

  const weeklyMap = new Map<string, StockChartPoint>();
  daily.forEach((d) => {
    const weekEnd = endOfWeek(d.x, { weekStartsOn: 1 })
      .toISOString()
      .split("T")[0];
    weeklyMap.set(weekEnd, d);
  });
  const weekly = Array.from(weeklyMap.values());

  const monthlyMap = new Map<string, StockChartPoint>();
  daily.forEach((d) => {
    const monthEnd = endOfMonth(d.x).toISOString().split("T")[0];
    monthlyMap.set(monthEnd, d);
  });
  const monthly = Array.from(monthlyMap.values());

  return { daily, weekly, monthly };
};

// --- 커스텀 훅 ---
/**
 * React 컴포넌트에서 주가 데이터를 쉽게 사용하기 위한 훅
 * @param ticker - 회사 티커 심볼
 * @param years - 조회할 기간
 */
export const useStockPrice = (ticker: string | undefined, years: number) => {
  return useQuery<StockChartData, Error>({
    queryKey: ["stockPrice", ticker, years],
    queryFn: () => fetchStockData(ticker!, years),
    enabled: !!ticker, // ticker가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 60, // 1시간 동안 데이터를 신선하게 유지
    refetchOnWindowFocus: false,
  });
};
