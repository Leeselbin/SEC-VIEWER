SEC 기업 재무 데이터 뷰어 (SEC Financial Data Viewer) 📊
이 프로젝트는 React와 TypeScript를 사용하여 미국 증권거래위원회(SEC)의 EDGAR API로부터 기업의 재무 데이터를 조회하는 웹 애플리케이션입니다. 사용자는 특정 기업과 기간을 선택하여 재무제표 항목들을 테이블 형태로 확인하고, 각 항목의 상세 정보를 모달 창으로 볼 수 있습니다.

✨ 주요 기능
데이터 조회: 특정 기업(NVIDIA, Apple 등)과 기간(최근 1, 3, 5, 10년)을 선택하여 재무 데이터 조회

상세 정보 모달: 테이블의 특정 행을 클릭 시 해당 항목의 모든 상세 정보를 모달 창으로 표시

효율적인 상태 관리: React Query (@tanstack/react-query)를 사용하여 API 데이터 페칭, 캐싱, 로딩 및 에러 상태를 관리

사용자 친화적 UI: 테이블 행 호버(Hover) 효과, 가로 스크롤, 동적인 제목 등 사용자 경험을 고려한 UI/UX

배포 환경 구성: Netlify 배포를 위한 프록시 설정 (netlify.toml) 포함

🛠️ 기술 스택
React

TypeScript

React Query (@tanstack/react-query)

🚀 로컬 환경에서 실행하기
저장소 복제

Bash

git clone [your-repository-url]
cd [repository-name]
의존성 설치

Bash

npm install
로컬 개발용 프록시 설정
로컬 환경에서 CORS 오류를 방지하기 위해 src 폴더에 setupProxy.js 파일이 필요합니다.

JavaScript

// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://data.sec.gov',
      changeOrigin: true,
    })
  );
};
개발 서버 실행

Bash

npm start
브라우저에서 http://localhost:3000 주소로 접속합니다.

🌐 배포
이 프로젝트는 Netlify를 통해 배포될 수 있도록 설정되어 있습니다. 프로덕션 환경에서의 API 요청은 프로젝트 루트의 netlify.toml 파일에 정의된 프록시 규칙을 통해 처리됩니다.

Ini, TOML

# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://data.sec.gov/api/:splat"
  status = 200
