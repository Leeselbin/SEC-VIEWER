
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // 앞으로 /api 로 시작하는 모든 요청을 프록시 처리합니다.
    createProxyMiddleware({
      target: 'https://data.sec.gov', // 데이터를 실제로 요청할 서버 주소
      changeOrigin: true,
    })
  );
};