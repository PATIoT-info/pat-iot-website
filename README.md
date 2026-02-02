# PAT IoT Solutions - Website

A modern, responsive website for PAT IoT Solutions - Smart Home Automation & IoT Solutions company.

## 🌐 Live Website

Once published on GitHub Pages, your website will be available at:
`https://yourusername.github.io/repository-name/`

## 📁 Project Structure

```
whitelion/
├── index.html              # Main homepage
├── blog.html              # Blog listing page
├── blog-post.html         # Individual blog post page
├── products-admin.html    # Admin panel for products
├── styles.css             # All CSS styles
├── script.js              # JavaScript functionality
├── data/
│   ├── blogs.json         # Blog posts data
│   └── products.json      # Products and gallery data
├── images/                # All images
├── videos/                # Video files
└── local-admin-server.js  # Local development server
```

## 🚀 Features

- **Responsive Design**: Works on all devices (desktop, tablet, mobile)
- **Hero Video Scroll-to-Scrub**: Interactive video playback controlled by scroll
- **Blog System**: Dynamic blog posts with admin editing capabilities
- **Product Gallery**: Showcase products and gallery images
- **Contact Form**: Email integration for inquiries
- **Social Media Links**: Facebook, Instagram, LinkedIn integration

## 📝 Setup Instructions

### Local Development

1. **Install Node.js** (optional, for local admin server)
   ```bash
   npm install
   ```

2. **Run Local Server** (for admin features)
   ```bash
   npm run admin
   # or
   node local-admin-server.js
   ```

3. **Open in Browser**
   - With server: `http://127.0.0.1:3333`
   - Without server: Open `index.html` directly

### Publishing to GitHub Pages

1. **Initialize Git** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Create repository (e.g., `pat-iot-website`)
   - **Don't** initialize with README

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/pat-iot-website.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to repository → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main**, Folder: **/ (root)**
   - Click **Save**

5. **Your site will be live at:**
   `https://yourusername.github.io/pat-iot-website/`

## 🛠️ Admin Features

### Blog Admin
- Edit blog posts locally
- Add/delete posts
- See `BLOG_ADMIN.md` for details

### Products Admin
- Manage products and gallery images
- Access via `products-admin.html?admin=1`

## 📧 Contact

- **Email**: marketing@patiot.in
- **Facebook**: [PAT IoT Solutions](https://www.facebook.com/share/182eKatbLq/)
- **Instagram**: [@patiot.solutions](https://www.instagram.com/patiot.solutions?igsh=MWFiZjkxdm1nNnRjdg==)
- **LinkedIn**: [PAT IoT Solutions](https://www.linkedin.com/in/pat-iot-solutions-65b1a4375)

## 📄 License

© 2026 PAT IoT Solutions. All rights reserved.
