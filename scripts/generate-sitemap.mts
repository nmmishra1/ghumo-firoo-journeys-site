import fs from 'fs/promises';
import path from 'path';
import { blogPosts } from '../src/data/blogData.tsx';
import { MASTER_DESTINATIONS } from '../src/data/masterDestinations.ts';
import { CURATED_DESTINATION_GUIDES } from '../src/data/curatedDestinationContent.ts';
import { STATIC_PACKAGE_REGISTRY } from '../src/data/packages/staticRegistry.ts';
import { individualPackages } from '../src/data/packages/individualPackages.ts';

const siteUrl = 'https://ghumofiroo.com';
const outputDir = path.resolve(process.cwd(), 'dist');
const sitemapPath = path.join(outputDir, 'sitemap.xml');
const robotsPath = path.join(outputDir, 'robots.txt');
const today = new Date().toISOString().split('T')[0];

const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/blog',
  '/career',
  '/products',
  '/profile',
  '/booking',
  '/privacy-policy',
  '/cookie-policy',
  '/terms-conditions',
  '/terms-of-service',
  '/refund-policy',
  '/reviews',
  '/review',
  '/custom-tour-packages',
  '/packages',
  '/explore-india',
  '/enquire-now',
  '/enquire-success',
  '/thank-you',
  '/guides',
  '/landing/char-dham-helicopter',
  '/landing/char-dham-road',
];

const packageRoutes = [
  '/packages/char-dham-yatra',
  '/packages/europe-swiss-croatia',
  '/packages/europe-grand-tour',
  '/packages/europe-highlights',
  '/packages/rajasthan-royal',
  '/packages/kashmir-paradise',
  '/packages/kerala-backwaters',
  '/packages/goa-beach-holiday',
  '/packages/himachal-hill-stations',
  '/packages/golden-triangle',
  '/packages/leh-ladakh-tour',
  '/packages/dubai-delights',
  '/packages/thailand-tropical',
  '/packages/singapore-malaysia',
  '/packages/singapore-city-delight',
  '/packages/bali-paradise',
  '/packages/japan-cherry-blossom',
  '/packages/turkey-adventure',
  '/packages/mauritius-bliss',
  '/packages/seychelles-escape',
  '/packages/rann-utsav',
  '/packages/jaisalmer-tour',
  '/packages/georgia-adventure',
  '/packages/char-dham-yatra-from-delhi',
  '/packages/char-dham-yatra-from-haridwar',
  '/packages/char-dham-yatra-from-dehradun',
];

const blogRoutes = blogPosts.map((post) => `/blog/${post.slug}`);

const getDynamicPackageAndBlogRoutes = async () => {
  const extraPackageRoutes: string[] = [];
  const extraBlogRoutes: string[] = [];

  // 1. Sync modularized packages from STATIC_PACKAGE_REGISTRY & individualPackages
  Object.keys(STATIC_PACKAGE_REGISTRY).forEach((slug) => {
    if (slug && slug.trim()) {
      extraPackageRoutes.push(`/packages/${slug.trim()}`);
    }
  });
  individualPackages.forEach((pkg: any) => {
    if (pkg?.slug && String(pkg.slug).trim()) {
      extraPackageRoutes.push(`/packages/${String(pkg.slug).trim()}`);
    }
  });

  // 2. Sync JSON-persisted CRM blogs from php-backend/blogs_data.json
  try {
    const blogsJsonPath = path.resolve(process.cwd(), 'php-backend', 'blogs_data.json');
    const rawBlogs = await fs.readFile(blogsJsonPath, 'utf8');
    const parsedBlogs = JSON.parse(rawBlogs);
    if (Array.isArray(parsedBlogs)) {
      parsedBlogs.forEach((b: any) => {
        if (b?.slug && String(b.slug).trim()) {
          extraBlogRoutes.push(`/blog/${String(b.slug).trim()}`);
        }
      });
    }
  } catch (e) {
    // Ignore if blogs_data.json is absent
  }

  // 3. Optional build-time sync from live MySQL API if configured via env
  const apiBase = process.env.SEO_SYNC_API_URL || process.env.VITE_API_BASE_URL || '';
  if (apiBase && apiBase.startsWith('http')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const [pkgsRes, blogsRes] = await Promise.all([
        fetch(`${apiBase.replace(/\/$/, '')}/packages.php`, { signal: controller.signal }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${apiBase.replace(/\/$/, '')}/blogs.php`, { signal: controller.signal }).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);
      clearTimeout(timeout);
      if (Array.isArray(pkgsRes)) {
        pkgsRes.forEach((p: any) => {
          if (p?.slug && p.is_active !== false && p.is_active !== 0) {
            extraPackageRoutes.push(`/packages/${String(p.slug).trim()}`);
          }
        });
      }
      if (Array.isArray(blogsRes)) {
        blogsRes.forEach((b: any) => {
          if (b?.slug) {
            extraBlogRoutes.push(`/blog/${String(b.slug).trim()}`);
          }
        });
      }
    } catch (e) {
      // Safe fallback when offline during build
    }
  }

  return { extraPackageRoutes, extraBlogRoutes };
};

const getGuideRoutes = async () => {
  const guidesDir = path.resolve(process.cwd(), 'src', 'content', 'destinations');
  const entries = await fs.readdir(guidesDir);
  return entries
    .filter((entry) => entry.endsWith('.json'))
    .map((entry) => `/guides/${entry.replace(/\.json$/, '')}`);
};

const getPriority = (route: string) => {
  if (route === '/') return '1.0';
  if (route.startsWith('/packages') || route.startsWith('/guides') || route.startsWith('/blog')) return '0.8';
  if (route === '/packages' || route === '/guides' || route === '/blog') return '0.8';
  if (route === '/enquire-now' || route === '/thank-you' || route === '/enquire-success') return '0.7';
  return '0.6';
};

const buildUrlEntry = (route: string) => {
  const loc = route === '/' ? `${siteUrl}/` : `${siteUrl}${route.endsWith('/') ? route : route + '/'}`;
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${getPriority(route)}</priority>\n  </url>`;
};

async function generate() {
  const guideRoutes = await getGuideRoutes();
  const { extraPackageRoutes, extraBlogRoutes } = await getDynamicPackageAndBlogRoutes();
  const curatedSlugs: string[] = [];
  Object.values(CURATED_DESTINATION_GUIDES).forEach(g => {
    g.slugs.forEach(s => curatedSlugs.push(`/explore-india/${s}`));
  });
  const destinationRoutes = MASTER_DESTINATIONS.map(d => `/explore-india/${d.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const routes = Array.from(
    new Set([
      ...staticRoutes,
      ...packageRoutes,
      ...extraPackageRoutes,
      ...blogRoutes,
      ...extraBlogRoutes,
      ...guideRoutes,
      ...curatedSlugs,
      ...destinationRoutes
    ])
  ).sort();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(buildUrlEntry).join('\n')}\n</urlset>\n`;

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(sitemapPath, sitemap, 'utf8');

  const publicDir = path.resolve(process.cwd(), 'public');
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');

  console.log(`Generated sitemap with ${routes.length} URLs at ${sitemapPath} and public/sitemap.xml`);
}

generate().catch((error) => {
  console.error('Failed to generate sitemap:', error);
  process.exit(1);
});
