const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/forgotpass',
        createProxyMiddleware({
            target: 'http://localhost:5000', // Updated to match the backend's running port
            changeOrigin: true,
        })
    );
};
