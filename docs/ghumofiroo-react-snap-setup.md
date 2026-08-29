# Adding Prerendering (react-snap) + Per-Route Meta Tags to ghumofiroo.com

Goal: fix duplicate <title>/meta tags and improve Google indexing for a client-side-only
React app (CRA or Vite) with a PHP API backend, deployed on shared hosting.

---

## 1. Install dependencies

```bash
npm install --save-dev react-snap
npm install react-helmet-async
```

---

## 2. Set up react-helmet-async (per-route titles/meta)

Wrap your app root with the provider — in `src/index.js` (CRA) or `src/main.jsx` (Vite):

```jsx
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.hydrate( // use hydrate, not render — required for react-snap to attach correctly
  <HelmetProvider>
    <App />
  </HelmetProvider>,
  document.getElementById('root')
);
```

**Important:** if currently using `ReactDOM.render(...)`, change it to `ReactDOM.hydrate(...)`.
react-snap needs hydrate so it can attach to the pre-rendered static HTML instead of
wiping and re-rendering it.

Then in each page/route component, add a Helmet block with unique content. Example
for a package page:

```jsx
import { Helmet } from 'react-helmet-async';

function CharDhamPackage() {
  return (
    <>
      <Helmet>
        <title>Char Dham Yatra Package 2026 – 11D/10N | Ghumofiroo</title>
        <meta
          name="description"
          content="Complete Char Dham Yatra covering Yamunotri, Gangotri, Kedarnath & Badrinath. Hotel, transport & darshan arrangements included. Check pricing."
        />
      </Helmet>
      {/* existing page content */}
    </>
  );
}
```

Repeat this for every route using the titles/meta already drafted
(ghumofiroo-seo-titles-meta.md) — homepage, about, contact, each package page, blog posts.

---

## 3. Configure react-snap in package.json

Add a `postbuild` script and a `reactSnap` config block:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "postbuild": "react-snap"
  },
  "reactSnap": {
    "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
    "include": [
      "/",
      "/about",
      "/contact",
      "/packages",
      "/enquire-now",
      "/booking",
      "/terms-of-service",
      "/blog"
    ]
  }
}
```

- If using **Vite** instead of CRA: your build script is `vite build`, and `postbuild`
  still runs automatically after `npm run build` as long as npm scripts are used —
  keep the same `"postbuild": "react-snap"` line.
- Add **every route** you want indexed to the `include` array — react-snap won't crawl
  routes it doesn't know about since there's no server-side route list. For many
  package pages, list them all explicitly (react-snap can't auto-discover client-side
  routes on its own).

---

## 4. Run the build and check output

```bash
npm run build
```

Check the `build/` (CRA) or `dist/` (Vite) folder — you should now see subfolders like
`build/about/index.html`, `build/packages/index.html` etc., each containing fully
rendered HTML with the correct title/meta already baked in (view the file directly,
don't just check via browser dev tools).

---

## 5. Deploy to shared hosting

No changes needed to your hosting setup — upload the `build/` (or `dist/`) folder
contents to your shared host exactly as you do today. These are still just static
files; react-snap doesn't require Node running on the server.

**One thing to check:** make sure your `.htaccess` (if using Apache on shared hosting)
still correctly routes deep links to the right static file/folder, since you now have
real folders per route instead of one single index.html handling all client-side routing.
Test a direct URL like `ghumofiroo.com/about` after deploy — it should load the about
page directly, not just when navigated to from the homepage.

---

## 6. Verify it worked

- `curl https://ghumofiroo.com/about` (or "view page source", not inspect element) —
  you should see real content and a unique `<title>` tag, not the generic homepage one.
- Re-run Google's "Request Indexing" in Search Console for a few key pages once deployed.
- Ask me to re-run the OpenRush site audit after deployment to confirm the duplicate
  title/meta issue is resolved.

---

## Notes for Antigravity

- Confirm whether the project uses Create React App (`react-scripts`) or Vite before
  running the install — the `postbuild` hook works the same either way via npm, but
  confirm the build output folder name (`build/` vs `dist/`) and adjust `reactSnap`
  config's file paths if needed.
- Check `package.json` "type" and router setup (react-router-dom version) to ensure
  route paths in `include` match actual defined routes exactly.
- After wiring Helmet into components, do a local `npm run build` test before deploying
  to catch any puppeteer/sandboxing issues (common on some CI/sandboxed environments —
  the `--no-sandbox` flag above usually resolves this).
