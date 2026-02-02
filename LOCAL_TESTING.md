# Local Testing vs Published Site

## Why the site might not work when opening `index.html` directly

When you **double-click `index.html`** or open it via `file://` protocol, the site may have issues because:

1. **CORS restrictions** - Browsers block loading JSON files (`data/blogs.json`) via `file://` protocol
2. **Security restrictions** - Some JavaScript features don't work with `file://`
3. **Path issues** - Relative paths might not resolve correctly

## ✅ The site WILL work when published to Git/GitHub Pages

When you publish to **GitHub Pages** (or any web server), the site works perfectly because:

1. ✅ Files are served over **HTTP/HTTPS** (not `file://`)
2. ✅ No CORS issues - same-origin requests work fine
3. ✅ All paths resolve correctly
4. ✅ All JavaScript features work as expected

## How to test locally before publishing

### Option 1: Use the local admin server (recommended)
```bash
npm run admin
```
Then open **http://127.0.0.1:3333** in your browser.

### Option 2: Use a simple HTTP server
```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server

# PHP
php -S localhost:8000
```
Then open **http://localhost:8000** in your browser.

### Option 3: Use VS Code Live Server extension
- Install "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"

## Summary

- ❌ **Opening `index.html` directly** (`file://`) → May have issues (CORS, security)
- ✅ **Published to GitHub Pages** → Works perfectly (HTTP/HTTPS)
- ✅ **Local server** (`npm run admin` or `python -m http.server`) → Works perfectly

**Your site will work fine when published to Git!** The issues you see are only when opening files directly via `file://` protocol.
