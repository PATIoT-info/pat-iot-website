# Admin Mode Guide - How to Edit Content

This guide explains how to access admin mode and make changes to your website content.

## 📝 Blog Admin Mode

### Method 1: Blog Admin Page (Recommended - Works on Published Site!)

1. **Go to Blog Admin**:
   - **Published Site**: `https://patiot-info.github.io/pat-iot-website/blog-admin.html?admin=1`
   - **Local**: `http://127.0.0.1:3333/blog-admin.html?admin=1`
   - Or click **"Admin: Manage Blog Posts"** button on the blog page

2. **Manage All Posts**:
   - View all blog posts in one place
   - Click **"Edit"** to modify any post
   - Click **"Delete"** to remove a post
   - Click **"Add New Blog Post"** to create a new one

3. **Edit/Create Post**:
   - Fill in all fields (Title, Slug, Excerpt, Content, Date, Category, etc.)
   - Add images with captions
   - Click **"Save Post"** to save changes

4. **Download and Upload**:
   - Click **"Download blogs.json"** to download the updated file
   - Click **"Upload to GitHub"** button (opens GitHub editor)
   - In GitHub: Delete all content → Paste downloaded content → Commit changes
   - Website updates automatically in 1-2 minutes!

### Method 2: Edit Individual Blog Post

1. **Open Blog Post**:
   - Go to: `https://patiot-info.github.io/pat-iot-website/blog.html`
   - Click on any blog post to open it

2. **Access Admin Panel**:
   - Scroll to the bottom of the blog post
   - Click **"Admin: Edit this post"** link
   - OR add `?edit=1` to the URL

3. **Edit Content**:
   - Modify title, content, author, date, etc.
   - Click **"Update preview"** to see changes
   - Click **"Download blogs.json"** to download
   - Click **"Upload to GitHub"** to upload changes

4. **Publish Changes**:
   - Follow upload instructions shown in admin panel
   - Or commit and push manually:
     ```bash
     git add data/blogs.json
     git commit -m "Updated blog post"
     git push origin main
     ```

## 🛍️ Products Admin Mode

### Access Products Admin

1. **Start Local Server**:
   ```bash
   npm run admin
   ```

2. **Open Products Admin**:
   - Visit: `http://127.0.0.1:3333/products-admin.html?admin=1`
   - OR: `http://127.0.0.1:3333/products-admin.html` (admin mode auto-detects)

### Edit Products

1. **Edit Existing Product**:
   - Click "Edit" next to any product
   - Modify: Name, Caption, Image URL, Order
   - Click "Save Changes"

2. **Add New Product**:
   - Fill in the "Add Product" form:
     - Name (e.g., "Smart Touch Switch Boards")
     - Caption (description)
     - Image URL (path to image)
     - Order (display order, e.g., 1, 2, 3)
   - Click "Add Product"

3. **Delete Product**:
   - Click "Delete" next to the product
   - Confirm deletion

### Edit Gallery Images

1. **Edit Gallery Item**:
   - Scroll to "Gallery Images" section
   - Click "Edit" next to any gallery image
   - Modify: Image URL, Alt text, Order
   - Click "Save Changes"

2. **Add Gallery Image**:
   - Fill in the "Add Gallery Image" form:
     - Image URL
     - Alt text (for accessibility)
     - Order (display order)
   - Click "Add Gallery Image"

3. **Delete Gallery Image**:
   - Click "Delete" next to the image
   - Confirm deletion

### Save Products Changes

1. **Local Save** (with server running):
   - Click **"Save to Server (Local)"**
   - Changes saved to `data/products.json`

2. **Download JSON** (without server):
   - Click **"Download JSON"**
   - Manually replace `data/products.json` with downloaded file

3. **Publish to GitHub**:
   ```bash
   git add data/products.json
   git commit -m "Updated products"
   git push origin main
   ```

## 🔧 Quick Reference URLs

### Published Website (Works Directly!):
- **Blog Admin**: `https://patiot-info.github.io/pat-iot-website/blog-admin.html?admin=1`
- **Products Admin**: `https://patiot-info.github.io/pat-iot-website/products-admin.html?admin=1`
- Blog List: `https://patiot-info.github.io/pat-iot-website/blog.html`
- Blog Post (Edit): `https://patiot-info.github.io/pat-iot-website/blog-post.html?slug=post-slug&edit=1`

### Local Development (with server):
- Homepage: `http://127.0.0.1:3333/`
- Blog Admin: `http://127.0.0.1:3333/blog-admin.html?admin=1`
- Blog List: `http://127.0.0.1:3333/blog.html`
- Blog Post (Edit): `http://127.0.0.1:3333/blog-post.html?slug=post-slug&edit=1`
- New Blog Post: `http://127.0.0.1:3333/blog-post.html?new=1&edit=1`
- Products Admin: `http://127.0.0.1:3333/products-admin.html?admin=1`

### Published Website:
- Homepage: `https://patiot-info.github.io/pat-iot-website/`
- Blog List: `https://patiot-info.github.io/pat-iot-website/blog.html`
- Blog Post: `https://patiot-info.github.io/pat-iot-website/blog-post.html?slug=post-slug`

## ⚠️ Important Notes

1. **Local Server Required**: 
   - Admin features that save files require the local server running
   - Without server, you can only download JSON files manually

2. **Image Paths**:
   - Use relative paths: `images/products/product-name.jpg`
   - Or full URLs: `https://patiot-info.github.io/pat-iot-website/images/products/product-name.jpg`

3. **Publishing Changes**:
   - Always commit and push changes to GitHub after editing
   - GitHub Pages updates automatically (may take 1-2 minutes)

4. **Backup**:
   - Keep backups of `data/blogs.json` and `data/products.json`
   - Or use Git to revert if needed

## 🚀 Workflow Summary

### For Blog Posts (Published Site):
1. Go to → `https://patiot-info.github.io/pat-iot-website/blog-admin.html?admin=1`
2. Edit/Add posts → Download blogs.json
3. Upload to GitHub → Click "Upload to GitHub" button
4. Commit changes → Done! (Website updates automatically)

### For Products (Published Site):
1. Go to → `https://patiot-info.github.io/pat-iot-website/products-admin.html?admin=1`
2. Edit/Add products → Download products.json
3. Upload to GitHub → Click "Upload to GitHub" button
4. Commit changes → Done! (Website updates automatically)

### For Local Development:
1. Start server → `npm run admin`
2. Open admin pages → Edit content → Save locally
3. Commit & push → `git add . && git commit -m "Update" && git push`

## 📞 Need Help?

- Check `BLOG_ADMIN.md` for detailed blog admin instructions
- Check console (F12) for any errors
- Make sure local server is running before saving changes
