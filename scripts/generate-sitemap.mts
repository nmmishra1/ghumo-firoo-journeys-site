import fs from 'fs/promises';
import path from 'path';
import { blogPosts } from '../src/data/blogData.tsx';

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
  '/terms-conditions',
  '/terms-of-service',
  '/refund-policy',
  '/custom-tour-packages',
  '/packages',
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
  return `  <url>\n    <loc>${siteUrl}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${getPriority(route)}</priority>\n  </url>`;
};

async function generate() {
  const guideRoutes = await getGuideRoutes();
  const routes = Array.from(
    new Set([...staticRoutes, ...packageRoutes, ...blogRoutes, ...guideRoutes])
  ).sort();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(buildUrlEntry).join('\n')}\n</urlset>\n`;

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(sitemapPath, sitemap, 'utf8');

  console.log(`Generated sitemap with ${routes.length} URLs at ${sitemapPath}`);
}

generate().catch((error) => {
  console.error('Failed to generate sitemap:', error);
  process.exit(1);
});
