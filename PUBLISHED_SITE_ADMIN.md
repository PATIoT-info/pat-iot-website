# Editing Content on Published Website

You can now edit content directly on your published website without needing a local server!

## 🌐 Editing on Published Site

### For Blog Posts:

**Option 1: Blog Admin Page (Recommended - Manage All Posts)**

1. **Go to Blog Admin**: `https://patiot-info.github.io/pat-iot-website/blog-admin.html?admin=1`
   - Or click **"Admin: Manage Blog Posts"** button on the blog page

2. **Manage Posts**:
   - View all blog posts in one place
   - Click **"Edit"** to modify any post
   - Click **"Delete"** to remove a post
   - Click **"Add New Blog Post"** to create a new one

3. **Edit/Create Post**:
   - Fill in all fields (Title, Slug, Excerpt, Content, Date, Category, Images, etc.)
   - Click **"Save Post"** to save changes

4. **Download and Upload**:
   - Click **"Download blogs.json"** to download the updated file
   - Click **"Upload to GitHub"** button (opens GitHub editor)
   - In GitHub: Delete all content → Paste downloaded content → Commit changes
   - Website updates automatically in 1-2 minutes!

**Option 2: Edit Individual Post**

1. **Go to your published website**: `https://patiot-info.github.io/pat-iot-website/`

2. **Open any blog post** and scroll to the bottom

3. **Click "Admin: Edit this post"** - The admin panel will appear

4. **Make your changes** and click **"Update preview"** to see changes

5. **Download and Upload** (same as Option 1)

### For Products & Gallery:

1. **Go to**: `https://patiot-info.github.io/pat-iot-website/products-admin.html?admin=1`

2. **Edit products or gallery images**

3. **Click "Download JSON"** to download `products.json`

4. **Upload to GitHub**:
   - Go to: https://github.com/PATIoT-info/pat-iot-website
   - Navigate to `data/products.json`
   - Click **pencil icon** → Delete all → Paste new content → Commit

## 📝 Quick Steps Summary

### Blog Editing:
```
Published Site → Blog Post → Admin Edit → Download JSON → GitHub → Edit File → Paste → Commit
```

### Products Editing:
```
Published Site → Products Admin → Edit → Download JSON → GitHub → Edit File → Paste → Commit
```

## 🔄 Alternative: Direct GitHub Editing

You can also edit directly on GitHub without downloading:

1. Go to: https://github.com/PATIoT-info/pat-iot-website
2. Navigate to `data/blogs.json` or `data/products.json`
3. Click the **pencil icon** (Edit)
4. Make your changes directly in the JSON
5. Click **"Commit changes"**

## ⚡ Pro Tip: Use GitHub's Web Editor

1. Go to your repository: https://github.com/PATIoT-info/pat-iot-website
2. Click on any file (e.g., `data/blogs.json`)
3. Click the pencil icon to edit
4. Make changes and commit
5. Changes go live automatically!

## 📋 JSON File Locations

- **Blogs**: `data/blogs.json`
- **Products**: `data/products.json`

Both files are in the `data/` folder of your repository.

## 🎯 Quick Access URLs

### Blog Admin:
- **Published**: `https://patiot-info.github.io/pat-iot-website/blog-admin.html?admin=1`
- **Local**: `http://127.0.0.1:3333/blog-admin.html?admin=1`

### Products Admin:
- **Published**: `https://patiot-info.github.io/pat-iot-website/products-admin.html?admin=1`
- **Local**: `http://127.0.0.1:3333/products-admin.html?admin=1`
