import { useInfiniteQuery } from "@tanstack/react-query";

interface Article {
  content: string;
  image: string;
  publish: string; // 발행 날짜 필드명
  title: string;
  url: string;
  source: string;
}

export interface BackendApiResponse {
  articles: {
    results: Article[]; // 기사 목록이 'results' 배열 안에 있음
    count?: number; // 총 기사 수 (선택 사항)
    page?: number; // 현재 페이지 번호 (선택 사항)
    pages?: number; // 총 페이지 수 (선택 사항)
  };
  // 기타 응답 필드 (예: uri, info, etc.)
  uri?: string;
  info?: any; // 필요에 따라 더 구체적인 타입으로 정의
}

const fetchGetNews = async ({
  queryKey,
  pageParam = 1,
}: {
  queryKey: any[];
  pageParam?: number;
}): Promise<BackendApiResponse> => {
  // queryKey에서 검색 쿼리를 추출합니다. (예: ["news-infinite", "APPLE"])
  const [_key, query] = queryKey;
  const url = `/get-news/getNewsAPI/${query}/${pageParam}`;

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
  return response.json() as Promise<BackendApiResponse>;
};

export const useInfiniteGetNews = (query: string) => {
  return useInfiniteQuery({
    queryKey: ["news-infinite", query], // 쿼리 키에 검색 쿼리 포함
    queryFn: fetchGetNews,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선하게 유지
    refetchOnWindowFocus: false, // 창에 다시 포커스될 때 재요청하지 않음

    initialPageParam: 1, // 첫 번째 페이지 파라미터의 초기값

    getNextPageParam: (lastPage: BackendApiResponse, allPages) => {
      // lastPage에 타입 명시
      const articlesPerPage = 20; // 백엔드에서 한 번에 가져오는 기사 수와 일치해야 합니다.
      if (
        lastPage.articles &&
        lastPage.articles.results.length < articlesPerPage
      ) {
        return undefined; // 더 이상 가져올 데이터가 없으면 undefined 반환
      }
      // 다음 페이지 번호는 현재까지 로드된 페이지 수 + 1
      return allPages.length + 1;
    },

    retry: 3, // 에러 발생 시 재시도 횟수
  });
};
