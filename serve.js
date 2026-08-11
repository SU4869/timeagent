// 零依赖静态服务器：用于把 TimeAgent_Web 在局域网内提供给手机访问。
// 用法：node serve.js  然后手机浏览器打开 http://<本机局域网IP>:8080
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(root, path.normalize(urlPath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`TimeAgent 本地服务已启动：`);
  console.log(`  本机访问:   http://localhost:${port}`);
  console.log(`  手机访问:   http://<本机局域网IP>:${port}`);
  console.log(`  按 Ctrl+C 停止`);
});
