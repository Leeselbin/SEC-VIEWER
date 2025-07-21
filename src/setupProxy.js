const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // SEC 데이터 프록시
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://data.sec.gov",
      changeOrigin: true,
    })
  );

  // 회사 목록 API 프록시
  app.use(
    "/companies-api", // '/companies-api'로 시작하는 요청을 프록시 처리
    createProxyMiddleware({
      target: "https://port-0-work-fount-md5atyx32a28fa6c.sel5.cloudtype.app", // 실제 API 서버 주소
      changeOrigin: true,
      // URL 재작성: '/companies-api/getCompanies' -> '/getCompanies'
      pathRewrite: {
        "^/companies-api": "",
      },
    })
  );

  // 새로운 주가 데이터 API 프록시
  https: app.use(
    "/stock-api",
    createProxyMiddleware({
      target: "https://sec-viewer-api.onrender.com",
      changeOrigin: true,
      pathRewrite: {
        "^/stock-api": "",
      },
    })
  );

  // 뉴스기사 수집후 긍부정 판단 API 프록시
  app.use(
    "/polarityPress-api",
    createProxyMiddleware({
      target: "https://port-0-work-fount-md5atyx32a28fa6c.sel5.cloudtype.app",
      changeOrigin: true,
      pathRewrite: {
        "^/polarityPress-api": "",
      },
    })
  );
};
