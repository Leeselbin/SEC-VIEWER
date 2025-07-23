import React, { useState } from "react";

export interface Article {
  content: string;
  image: string;
  publish: string;
  title: string;
  url: string;
  source: string;
}

interface NewsListProps {
  articles: Article[];
}

const NewsList: React.FC<NewsListProps> = ({ articles }) => {
  // 호버된 기사의 URL을 저장하는 상태
  const [hoveredArticleUrl, setHoveredArticleUrl] = useState<string | null>(
    null
  );

  // 기사 클릭 시 원문 링크로 이동하는 핸들러
  const handleRowClick = (url: string) => {
    window.open(url, "_blank", "noopener noreferrer");
  };

  // 인라인 스타일 정의
  const containerStyles: React.CSSProperties = {
    margin: "0 auto",
    padding: "16px",
    maxWidth: "768px", // max-w-3xl (12 * 64px = 768px)
  };

  const headingStyles: React.CSSProperties = {
    fontSize: "30px", // text-3xl
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "24px", // mb-6
    color: "#374151", // text-gray-800
  };

  const listSpaceStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px", // space-y-4
  };

  const newsItemBaseStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: "12px", // rounded-xl
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // shadow-md
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease", // transition-all duration-300
    transform: "translateY(0px)", // transform hover:-translate-y-1
  };

  // 호버 시 적용될 스타일
  const newsItemHoverStyles: React.CSSProperties = {
    boxShadow:
      "0 8px 16px -2px rgba(0, 0, 0, 0.2), 0 4px 8px -2px rgba(0, 0, 0, 0.12)", // 더 강한 그림자
    transform: "translateY(-4px)", // 위로 살짝 이동
    borderColor: "#a7d9f7", // 테두리 색상 변경
  };

  const imageContainerStyles: React.CSSProperties = {
    width: "33.333333%", // w-1/3
    flexShrink: 0, // flex-shrink-0
  };

  const imageStyles: React.CSSProperties = {
    width: "100%", // w-full
    height: "96px", // h-24
    objectFit: "cover", // object-cover
    borderTopLeftRadius: "12px", // rounded-l-xl
    borderBottomLeftRadius: "12px",
  };

  const noImagePlaceholderStyles: React.CSSProperties = {
    width: "100%",
    height: "96px",
    backgroundColor: "#e5e7eb", // bg-gray-200
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280", // text-gray-500
    borderTopLeftRadius: "12px",
    borderBottomLeftRadius: "12px",
  };

  const textContentStyles: React.CSSProperties = {
    width: "66.666667%", // w-2/3
    padding: "16px", // p-4
  };

  const titleStyles: React.CSSProperties = {
    fontSize: "18px", // text-lg
    fontWeight: "600", // font-semibold
    color: "#111827", // text-gray-900
    marginBottom: "8px", // mb-2
    lineHeight: "1.25", // leading-tight
  };

  const dateStyles: React.CSSProperties = {
    fontSize: "14px", // text-sm
    color: "#4b5563", // text-gray-600
    marginBottom: "4px", // 날짜와 출처 사이 간격
  };

  const sourceStyles: React.CSSProperties = {
    fontSize: "12px", // 더 작은 글꼴 크기
    color: "#6b7280", // 더 연한 회색
    fontStyle: "italic", // 이탤릭체
  };

  const loadingErrorStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px",
    fontSize: "18px", // text-lg
  };

  const noNewsTextStyles: React.CSSProperties = {
    color: "#6b7280", // text-gray-500
  };

  if (!articles || articles.length === 0) {
    return (
      <div style={{ ...loadingErrorStyles, ...noNewsTextStyles }}>
        뉴스가 없습니다.
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <h1 style={headingStyles}>최신 뉴스</h1>
      <div style={listSpaceStyles}>
        {articles.map((article) => (
          <div
            key={article.url}
            style={{
              ...newsItemBaseStyles,
              ...(hoveredArticleUrl === article.url ? newsItemHoverStyles : {}), // 호버 시 스타일 적용
            }}
            onClick={() => handleRowClick(article.url)}
            onMouseEnter={() => setHoveredArticleUrl(article.url)} // 마우스 진입 시 상태 업데이트
            onMouseLeave={() => setHoveredArticleUrl(null)} // 마우스 이탈 시 상태 초기화
          >
            {/* 왼쪽: 이미지 섹션 */}
            <div style={imageContainerStyles}>
              {article.image ? (
                <img
                  src={article.image}
                  alt={article.title}
                  style={imageStyles}
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/96x96/e0e0e0/ffffff?text=No+Image`;
                    e.currentTarget.onerror = null;
                  }}
                />
              ) : (
                <div style={noImagePlaceholderStyles}></div>
              )}
            </div>

            {/* 오른쪽: 제목 및 출간 날짜 섹션 */}
            <div style={textContentStyles}>
              <h2 style={titleStyles}>{article.title}</h2>
              <p style={dateStyles}>
                {new Date(article.publish).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {/* 출처 정보 추가 */}
              {article.source && (
                <p style={sourceStyles}>출처: {article.source}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsList;
