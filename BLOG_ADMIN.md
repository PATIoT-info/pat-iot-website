# How to Add and Edit Blogs (Admin Guide)

Blogs are stored in **`data/blogs.json`**. To add new posts or edit existing ones, update this file. No coding is required—just edit the JSON.

## How users see your changes

**Visitors only see updates after the updated `data/blogs.json` is on your Git repo and the site is redeployed.**

1. **Save** your edits (see below: "Save to file (local)" when running locally, or "Download blogs.json" and replace the file when on the live site).
2. **Commit and push** the updated `data/blogs.json` to your Git repository (e.g. GitHub).
3. If you use **GitHub Pages** (or similar), the site rebuilds from the repo; after a minute or two, users will see the updated blogs.

So: **edit in admin → save to `data/blogs.json` → commit & push to Git → site updates for everyone.**

## Editing locally (before publishing to Git)

When you run the site **locally** (on your machine before or after pushing to Git), you can edit posts in the browser and save directly to **`data/blogs.json`** so you can commit and push.

1. **Start the local admin server** (from the project folder):
   ```bash
   npm run admin
   ```
   Or: `node local-admin-server.js`  
   The server runs at **http://127.0.0.1:3333** (or the port shown).

2. **Open the site** in your browser: **http://127.0.0.1:3333**

3. **Go to Blogs** → open any post → scroll to the bottom → click **"Admin: Edit this post"**.

4. **Edit** the post in the admin form, then click **"Update preview"** to see changes.

5. **Save to file** – Click **"Save to file (local)"**. This writes your changes to **`data/blogs.json`** in the project folder. You’ll see “Saved to data/blogs.json” when it’s done.

6. **Publish** – Commit and push to Git. Your published site (e.g. GitHub Pages) will then show the updated posts.

- The **"Save to file (local)"** button only appears when you’re on **localhost** (e.g. http://127.0.0.1:3333). On the live site you’ll only see **"Download blogs.json"**; use that and replace the file in your repo if you edit from the published site.

## File location

- **Blog data:** `data/blogs.json`
- **Blog listing page:** `blog.html` (shows all posts from the JSON)
- **Single post page:** `blog-post.html?slug=your-post-slug` (full post content)

## Admin: Add or edit post info (on the post page)

1. **Open a post** – From the blog listing, click any post (or go to `blog-post.html?slug=post-slug`).
2. **Turn on Admin edit** – On that post page, scroll to the bottom. Below the “Back to Blogs” link you’ll see a button-style link: **“Admin: Edit this post”**. Click it to open the admin panel. Or add **`&edit=1`** to the URL (e.g. `blog-post.html?slug=welcome-to-pat-iot-solutions&edit=1`).
3. **Edit the post** – An admin panel appears with fields: Title, Excerpt, Content (HTML), Date, Category, Main image, Author, Read time, and a list of **Post images** (src + caption). Use **Add image** to add more pics with captions.
4. **Update preview** – Click **"Update preview"** to refresh the post view above with your changes.
5. **Save for all users** – If you’re running locally: click **"Save to file (local)"** to write **`data/blogs.json`** directly. If you’re on the published site: click **"Download blogs.json"** and replace your repo’s **`data/blogs.json`** with the downloaded file. Then commit and push so everyone sees the updates.

So: **click post → Admin: Edit this post → edit → Update preview → Save to file (local)** or **Download blogs.json** → then commit and push to Git.

## Adding a new blog post (via JSON)

1. Open `data/blogs.json` in a text editor.
2. Inside the `"posts"` array, add a new object. Use this structure:

```json
{
  "id": "7",
  "slug": "your-unique-url-slug",
  "title": "Your Post Title",
  "excerpt": "Short summary shown on the blog listing (one or two sentences).",
  "content": "<p>Full post content in HTML. Use <p> for paragraphs.</p><p>More paragraphs...</p>",
  "date": "2026-02-01",
  "category": "Company",
  "image": "images/hero-image.jpg",
  "author": "PAT IOT Team",
  "readTime": "3 min read",
  "images": [
    { "src": "images/hero-image.jpg", "caption": "Caption for this image" },
    { "src": "images/products/smart-touch-switch.jpg", "caption": "Another pic with caption" }
  ]
}
```

### Field guide

| Field     | Required | Description |
|----------|----------|-------------|
| **id**   | Yes      | Unique number or string (e.g. `"7"`). |
| **slug** | Yes      | URL-friendly name used in links (e.g. `my-new-post`). No spaces; use hyphens. |
| **title**| Yes      | Post title shown on cards and on the post page. |
| **excerpt** | Yes   | Short summary shown on the blog listing. |
| **content**  | Yes   | Full post body. Use HTML: `<p>...</p>`, `<strong>...</strong>`, `<ul><li>...</li></ul>`, etc. |
| **date** | Yes      | Publication date in `YYYY-MM-DD` format. |
| **category** | Yes   | One of: `Company`, `Products`, `Solutions`, `Tips`, or any label you want. |
| **image**| Optional | Main image path (e.g. `images/hero-image.jpg`). Shown at top of the post. |
| **author** | Optional | Author name (e.g. `"PAT IOT Team"`). Shown under the date. |
| **readTime** | Optional | e.g. `"3 min read"`. Shown next to date and author. |
| **images** | Optional | Array of pics shown inside the post. Each item: `{ "src": "path/to/image.jpg", "caption": "Optional caption" }`. You can add as many as you like; each appears in a gallery below the main content with optional caption. |

### Categories you can use

- **Company** – Company news, updates, team
- **Products** – Product details, launches, how-tos
- **Solutions** – Services, installations, use cases
- **Tips** – Smart home tips, guides, industry insights

You can also use your own category names; they will appear as-is on the blog.

## Editing an existing post

1. Open `data/blogs.json`.
2. Find the post in the `"posts"` array (match by `id` or `slug`).
3. Change `title`, `excerpt`, `content`, `date`, `category`, or `image` as needed.
4. Save the file. Refresh `blog.html` to see changes.

## Example: product-focused post

```json
{
  "id": "8",
  "slug": "new-dali-panel-launch",
  "title": "New DALI Touch Panel Launch",
  "excerpt": "We've launched an updated DALI touch panel with improved dimming and scene control.",
  "content": "<p>Our new DALI touch panel offers smoother dimming and more scene presets.</p><p>It is available in 2-gang and 4-gang versions. Contact us for pricing and installation.</p>",
  "date": "2026-02-10",
  "category": "Products",
  "image": "images/products/dali-touch-panels.jpg"
}
```

## Example: company update

```json
{
  "id": "9",
  "slug": "office-relocation-hyderabad",
  "title": "Office Relocation in Hyderabad",
  "excerpt": "Our new office in Kondapur is now open for client meetings and demos.",
  "content": "<p>We have moved to a larger space to better serve our clients.</p><p>Visit us at D-2, 3rd Floor, CMC layout, Kondapur. Call ahead to schedule a demo.</p>",
  "date": "2026-01-20",
  "category": "Company",
  "image": "images/hero-image.jpg"
}
```

## Important notes

1. **JSON syntax** – Keep commas between objects, but no comma after the last item in the array. Missing or extra commas will break the file.
2. **Slug** – Each post must have a unique `slug`; it is used in the URL (e.g. `blog-post.html?slug=new-dali-panel-launch`).
3. **Images** – Paths are relative to the site root. Put images in `images/` (e.g. `images/blog/my-photo.jpg`) and reference them as `images/blog/my-photo.jpg`.
4. **HTML in content** – You can use simple HTML in `content`: `<p>`, `<strong>`, `<em>`, `<ul>`, `<li>`, `<a href="...">`. Avoid complex or broken HTML.

## After editing

- Save `data/blogs.json`.
- Refresh the blog listing page (`blog.html`) to see new or updated posts.
- Click a post to open its full page (`blog-post.html?slug=...`).

No server or database is required; the site reads from the JSON file when the page loads.
