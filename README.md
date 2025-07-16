<h2>SEC 기업 재무 데이터 뷰어 (SEC Financial Data Viewer) 📊</h2>
> 이 프로젝트는 React와 TypeScript를 사용하여 미국 증권거래위원회(SEC)의 EDGAR API로부터 기업의 재무 데이터를 조회하는 웹 애플리케이션입니다. 사용자는 특정 기업과 기간을 선택하여 재무제표 항목들을 테이블 형태로 확인하고, 각 항목의 상세 정보를 모달 창으로 볼 수 있습니다.

https://sec-viewer.netlify.app/
---

<h1>✨ 주요 기능</h1>

- 동적 데이터 조회: 특정 기업과 기간(최근 1, 3, 5, 10년)을 선택하여 재무 데이터 검색

- 데이터 시각화: 주요 항목(매출, 영업이익, 순이익)의 YoY(전년 대비) 성장률을 막대그래프로 시각화

- 투자 지표 분석: ROE, ROA, 부채비율 등 핵심 투자 지표를 연도별 테이블로 제공
- 상세 정보 모달: 상세 재무제표 테이블의 특정 행을 클릭 시 모든 정보를 모달 창으로 표시

- 상태 관리: React Query (@tanstack/react-query)를 사용하여 API 데이터 페칭, 캐싱, 로딩 및 에러 상태를 관리

- 배포 환경 구성: Netlify 배포를 위한 프록시 설정 (netlify.toml) 포함

---

## 📈 주요 지표 계산식

이 프로젝트에서 사용된 주요 지표의 계산식은 다음과 같습니다. 모든 계산은 연간 보고서(10-K)를 기준으로 합니다.

- **YoY (전년 대비) 성장률 (%)**

  ```
  ((현재 연도 값 - 이전 연도 값) / |이전 연도 값|) * 100
  ```

- **ROE (자기자본이익률, %)**

  ```
  (당기순이익 / 자본총계) * 100
  (NetIncomeLoss / StockholdersEquity) * 100
  ```

- **ROA (총자산이익률, %)**

  ```
  (당기순이익 / 자산총계) * 100
  (NetIncomeLoss / Assets) * 100
  ```

- **부채비율 (%)**

  ```
  (부채총계 / 자본총계) * 100
  (Liabilities / StockholdersEquity) * 100
  ```

---

<h2>🛠️ 기술 스택</h2>

- React
- TypeScript
- React Query (@tanstack/react-query)

---

<h2>🚀 로컬 환경에서 실행하기</h2>

1. 저장소 복제

```Bash

git clone [your-repository-url]
cd [repository-name]

```

2. 의존성 설치

```Bash

npm install

```

3. 로컬 개발용 프록시 설정
   로컬 환경에서 CORS 오류를 방지하기 위해 src 폴더에 setupProxy.js 파일이 필요합니다.

```JavaScript

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
```

4. 개발 서버 실행

```Bash

npm start
```

브라우저에서 http://localhost:3000 주소로 접속합니다.

---

<h2>🌐 배포</h2>
이 프로젝트는 Netlify를 통해 배포될 수 있도록 설정되어 있습니다. 프로덕션 환경에서의 API 요청은 프로젝트 루트의 netlify.toml 파일에 정의된 프록시 규칙을 통해 처리됩니다.

```Ini, TOML

# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://data.sec.gov/api/:splat"
  status = 200
```
