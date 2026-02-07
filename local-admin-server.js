/**
 * Local admin server for editing blog posts before publishing to Git.
 * Run: node local-admin-server.js   (or: npm run admin)
 * Then open http://localhost:3333, go to a blog post, click "Admin: Edit this post",
 * edit, and use "Save to file (local)" to write data/blogs.json.
 * Commit and push to Git to publish.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3333;
const ROOT = path.join(__dirname);
const BLOGS_PATH = path.join(ROOT, 'data', 'blogs.json');
const PRODUCTS_PATH = path.join(ROOT, 'data', 'products.json');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.writeHead(404);
    res.end('Not found');
  });
  res.setHeader('Content-Type', contentType);
  stream.pipe(res);
}

function saveBlogs(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (!Array.isArray(data.posts)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Expected { posts: [...] }' }));
      }
      fs.mkdirSync(path.dirname(BLOGS_PATH), { recursive: true });
      fs.writeFileSync(BLOGS_PATH, JSON.stringify({ posts: data.posts }, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  });
}

function saveProducts(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (!Array.isArray(data.products) || !Array.isArray(data.gallery)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({ ok: false, error: 'Expected { products: [...], gallery: [...] }' })
        );
      }
      fs.mkdirSync(path.dirname(PRODUCTS_PATH), { recursive: true });
      fs.writeFileSync(
        PRODUCTS_PATH,
        JSON.stringify({ products: data.products, gallery: data.gallery }, null, 2)
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'POST' && url === '/api/save-blogs') {
    return saveBlogs(req, res);
  }

  if (req.method === 'POST' && url === '/api/save-products') {
    return saveProducts(req, res);
  }

  let filePath = path.join(ROOT, url === '/' ? 'index.html' : url);

  if (path.extname(filePath) === '') {
    filePath = url.endsWith('/') ? path.join(filePath, 'index.html') : filePath + '.html';
  }

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404);
    return res.end('Not found');
  }

  serveFile(filePath, res);
});

/* 🔑 IMPORTANT FIX: bind to 0.0.0.0 instead of 127.0.0.1 */
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Local admin server running at: http://0.0.0.0:${PORT}`);
  console.log('Edit a post, then use "Save to file (local)" in the admin panel.');
  console.log('Then commit and push to Git to publish.');
});
