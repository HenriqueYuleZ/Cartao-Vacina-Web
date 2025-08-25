const PROXY_CONFIG = {
  "/api/**": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "bypass": function(req, res, proxyOptions) {
      console.log('Proxy request to API:', req.url);
      return null; // Continue with proxy
    }
  }
};

module.exports = PROXY_CONFIG;
