import { useEffect, useRef, useCallback, useMemo } from "react";
import { useInfiniteGetNews } from "../hooks/useGetNews"; // 훅 불러오기
import NewsList, { Article } from "../components/news-page/NewsList"; // NewsList 컴포넌트와 Article 인터페이스 불러오기

const NewsPage = () => {
  let query = "APPLE"; // 검색 쿼리 (예시: 특정 토픽이나 키워드)
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteGetNews(query);

  const observerElem = useRef<HTMLDivElement>(null); // HTMLDivElement로 타입 명시

  const allArticles: Article[] = useMemo(() => {
    return (
      data?.pages?.flatMap(
        (page: Article[]) => page || [] // page에 Article[] 타입 명시 (타입 에러 방지)
      ) || []
    );
  }, [data]); // data가 변경될 때만 다시 계산

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      // target이 화면에 보이고 (isIntersecting), 다음 페이지가 있으며 (hasNextPage),
      // 현재 다음 페이지를 가져오는 중이 아닐 때 (isFetchingNextPage) 다음 페이지를 요청합니다.
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage(); // 다음 페이지 요청
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  ); // 의존성 배열

  // Intersection Observer 설정
  useEffect(() => {
    const element = observerElem.current; // 관찰할 DOM 요소
    if (!element) return; // 요소가 없으면 아무것도 하지 않습니다.

    // Intersection Observer 인스턴스 생성
    const observer = new IntersectionObserver(handleObserver, {
      root: null, // 뷰포트를 루트(관찰 대상의 가시성을 확인할 때 사용되는 컨테이너)로 사용합니다.
      rootMargin: "0px", // 뷰포트 경계에서 여유 공간을 0px로 설정합니다.
      threshold: 1.0, // 요소가 100% 보일 때 콜백을 실행합니다. (0.1은 10% 보일 때)
    });

    observer.observe(element); // 관찰 시작

    // 컴포넌트 언마운트 시 관찰을 중지하여 메모리 누수를 방지합니다.
    return () => {
      observer.unobserve(element);
    };
  }, [handleObserver]); // handleObserver 함수가 변경될 때만 useEffect를 다시 실행합니다.

  // 데이터가 로드될 때마다 콘솔에 출력 (디버깅용)
  useEffect(() => {
    if (data) {
      console.log("Fetched data pages:", data.pages);
      console.log("All articles:", allArticles);
    }
  }, [data, allArticles]);

  return (
    <div style={{ paddingBottom: "50px", fontFamily: "Inter, sans-serif" }}>
      {" "}
      <NewsList articles={allArticles} />
      {/* 로딩 중이거나 다음 페이지를 가져오는 중일 때 표시 */}
      {isLoading &&
        allArticles.length === 0 && ( // 초기 로딩 중일 때 (아직 기사가 없을 때)
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              fontSize: "1.2em",
              color: "#555",
            }}
          >
            뉴스 불러오는 중...
          </div>
        )}
      {isFetchingNextPage && ( // 다음 페이지를 가져오는 중일 때
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            fontSize: "1.2em",
            color: "#555",
          }}
        >
          뉴스 더 불러오는 중...
        </div>
      )}
      {/* Intersection Observer가 관찰할 요소 */}
      {/* 다음 페이지가 있을 때만 이 요소를 렌더링하여 무한 스크롤 트리거로 사용합니다. */}
      {hasNextPage && (
        <div
          ref={observerElem}
          style={{ height: "50px", visibility: "hidden" }}
        >
          {/* 이 div는 화면 하단에 위치하여 스크롤 감지 트리거 역할을 합니다. */}
        </div>
      )}
      {/* 모든 데이터를 로드했을 때 메시지 (선택 사항) */}
      {!hasNextPage && !isLoading && !error && allArticles.length > 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            fontSize: "1.2em",
            color: "#555",
          }}
        >
          모든 뉴스를 불러왔습니다.
        </div>
      )}
    </div>
  );
};

export default NewsPage;
