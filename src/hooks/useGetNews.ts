import { useInfiniteQuery } from "@tanstack/react-query";

interface Article {
  content: string;
  image: string;
  publish: string; // 발행 날짜 필드명
  title: string;
  url: string;
  source: string;
}

const fetchGetNews = async ({
  queryKey,
  pageParam = 1,
}: {
  queryKey: any[];
  pageParam?: number;
}): Promise<Article[]> => {
  // queryKey에서 검색 쿼리를 추출합니다. (예: ["news-infinite", "APPLE"])
  const [, query] = queryKey;
  const url = `/getNews-api/getEventNewsAPI/${query}/${pageParam}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `HTTP error! status: ${response.status} - ${
        errorData.error || "Unknown error"
      }`
    );
  }

  // 백엔드에서 반환하는 JSON 데이터를 그대로 반환합니다.
  return response.json() as Promise<Article[]>;
};

export const useInfiniteGetNews = (query: string) => {
  return useInfiniteQuery({
    queryKey: ["news-infinite", query], // 쿼리 키에 검색 쿼리 포함
    queryFn: fetchGetNews,
    staleTime: 1000 * 60, // 1분 동안 데이터를 신선하게 유지
    refetchOnWindowFocus: false, // 창에 다시 포커스될 때 재요청하지 않음

    initialPageParam: 1, // 첫 번째 페이지 파라미터의 초기값

    getNextPageParam: (lastPage: Article[], allPages) => {
      // lastPage에 타입 명시
      const articlesPerPage = 20; // 백엔드에서 한 번에 가져오는 기사 수와 일치해야 합니다.
      const totalPerPage = allPages.length * 20;

      // console.log("lastPage :", lastPage);
      // console.log("allPages :", allPages);
      if (
        lastPage &&
        lastPage.length < articlesPerPage &&
        totalPerPage === lastPage.length
      ) {
        return undefined; // 더 이상 가져올 데이터가 없으면 undefined 반환
      }
      // 다음 페이지 번호는 현재까지 로드된 페이지 수 + 1
      return allPages.length + 1;
    },

    retry: 3, // 에러 발생 시 재시도 횟수
  });
};
