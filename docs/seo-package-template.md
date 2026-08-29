# Package Page SEO & Social Metadata Template

This guide defines the required SEO and social metadata for all package pages and provides code snippets and procedures to keep them consistent.

## URL Structure
- Canonical URL must follow: `/packages/${package_name}`.
- `package_name` uses kebab-case derived from the page file name (e.g., `EuropeSwissCroatia.tsx` → `europe-swiss-croatia`).
- Trailing slashes are redirected server-side to the canonical path.

## Required Tags
Include the following inside the page component using `react-helmet-async`:

```tsx
import { Helmet } from 'react-helmet-async';
import { canonicalForPackage } from '@/lib/seo';

const slug = 'europe-swiss-croatia';
const canonical = canonicalForPackage(slug);
const fullTitle = '10-Day Switzerland & Croatia Discovery';
const description = '10-day Switzerland & Croatia tour: Zurich, Lucerne, Interlaken, Plitvice, Split, Dubrovnik. Boutique stays, breakfasts, guided sightseeing, cable cars, island cruise, transfers.';
const socialImage = 'https://cdn.ghumofiroo.com/og/europe-swiss-croatia-1200x630.jpg';

<Helmet>
  <title>{`${fullTitle} | Ghumo Firoo Travels`}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />

  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={socialImage} />
  <meta property="og:image:alt" content={`${fullTitle} – Ghumo Firoo Travels`} />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={socialImage} />
  <meta name="twitter:image:alt" content={`${fullTitle} – Ghumo Firoo Travels`} />
</Helmet>
```

## Titles & Descriptions
- Page `<title>`: `${Full Package Name} | Ghumo Firoo Travels`.
- Open Graph/Twitter titles: `${Full Package Name}` (no brand suffix).
- Description: concise, keyword-rich marketing copy, 120–160 characters.

## Image Specifications
- Dimensions: minimum `1200x630` px.
- Format: `JPEG` or `PNG`.
- Max size: `1MB` after compression.
- Quality: optimize with no visible artifacts; suggest `mozjpeg` quality ~0.78 or PNG quantization.
- Hosting: stable CDN URL; avoid query parameters for cacheability.
- Alt text: `${Full Package Name} – Ghumo Firoo Travels`.

## Canonical Generation
Use the shared helper to ensure consistent canonical URLs:

```ts
// src/lib/seo.ts
canonicalForPackage('europe-swiss-croatia');
```

## Structured Data (optional but recommended)
- Use existing `JsonLd` helpers (`Product`, `Breadcrumb`, `FAQ`) from `src/components/seo/JsonLd.tsx` when applicable.

## Validation & QA
- Run `npm run seo:validate` before build or deployment.
- The build pipeline runs validation automatically (`npm run build`).
- Manually spot-check in browser DevTools: verify `<head>` contains canonical and social tags; confirm `document.title` and `meta[name="description"]`.
- Use social debuggers:
  - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
  - Twitter Card Validator: https://cards-dev.twitter.com/validator
  - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
  - WhatsApp shares: test on mobile devices.

## Version Control & Update Procedures
- For new packages, add tags per this template in the initial commit.
- If marketing copy or images change, update `<Helmet>` fields and the CDN asset. Keep filenames stable when possible; otherwise update canonical image URLs.
- Always run `npm run seo:validate` and preview locally after changes.