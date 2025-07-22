import { useQuery } from "@tanstack/react-query";

// --- API 호출 함수 ---
const fetchGetNews = async (query: string, page: number) => {
  const url = `/getNews-api/getNewsAPI/${query}/${page}`;

  const response = await fetch(url);

  return response.json();
};

// --- 커스텀 훅 ---
export const useGetNews = (query: string, page: number) => {
  return useQuery({
    queryKey: ["getNews-api", query, page],
    queryFn: () => fetchGetNews(query, page),
    staleTime: 1000 * 60, // 1분 동안 데이터를 신선하게 유지
    refetchOnWindowFocus: false,
  });
};
