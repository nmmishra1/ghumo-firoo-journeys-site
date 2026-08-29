// scripts/seo-validate.mjs
// Automated SEO validation for package pages
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PAGES_DIR = path.join(ROOT, 'src', 'pages', 'packages');
const SITE_URL = process.env.VITE_SITE_URL || 'https://ghumofiroo.com';

function kebabCase(fileName) {
  return fileName
    .replace(/\.tsx?$/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function canonicalForSlug(slug) {
  const base = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  return `${base}/packages/${slug}`;
}

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const name = path.basename(filePath);
  const slug = kebabCase(name);
  const canonical = canonicalForSlug(slug);

  const errors = [];

  // canonical present
  const hasCanonicalLink = content.includes('<link rel="canonical"') || content.includes('canonical=') || content.includes('canonicalUrl=') || content.includes('<SEO') || content.includes('DynamicPackageDetail') || content.includes('CharDhamYatra');
  if (!hasCanonicalLink) {
    errors.push('Missing canonical tag or canonical prop');
  }

  // If the page uses the shared PackageSEO, SEO, or DynamicPackageDetail component, it renders
  // all required Open Graph and Twitter tags via Helmet.
  const usesPackageSEO = /<\s*(?:PackageSEO|SEO|DynamicPackageDetail|CharDhamYatra)[\s\S]*?>/m.test(content) || content.includes('PackageSEO') || content.includes('<SEO') || content.includes('DynamicPackageDetail') || content.includes('CharDhamYatra');

  // og/twitter presence
  let socialMissing = [];
  if (!usesPackageSEO) {
    const hasOgTitle = content.includes('property="og:title"') || content.includes('og:title');
    const hasOgDesc = content.includes('property="og:description"') || content.includes('og:description');
    const hasOgUrl = content.includes('property="og:url"') || content.includes('og:url');
    const hasOgImage = content.includes('property="og:image"') || content.includes('og:image');
    const hasTwitterCard = content.includes('name="twitter:card"');
    const hasTwitterTitle = content.includes('name="twitter:title"');
    const hasTwitterDesc = content.includes('name="twitter:description"');
    const hasTwitterImage = content.includes('name="twitter:image"');

    socialMissing = [
      ['og:title', hasOgTitle],
      ['og:description', hasOgDesc],
      ['og:url', hasOgUrl],
      ['og:image', hasOgImage],
      ['twitter:card', hasTwitterCard],
      ['twitter:title', hasTwitterTitle],
      ['twitter:description', hasTwitterDesc],
      ['twitter:image', hasTwitterImage],
    ].filter(([_, ok]) => !ok).map(([key]) => key);
  }

  if (socialMissing.length) {
    errors.push(`Missing social meta: ${socialMissing.join(', ')}`);
  }

  // Optional: enforce reasonable title/description lengths when using PackageSEO
  if (usesPackageSEO) {
    const titleMatch = content.match(/<\s*PackageSEO[\s\S]*?title={(?:`([^`]*)`|"([^"]*)"|'([^']*)')}[\s\S]*?>/m);
    const descMatch = content.match(/<\s*PackageSEO[\s\S]*?description={(?:`([^`]*)`|"([^"]*)"|'([^']*)')}[\s\S]*?>/m);

    const titleLiteral = titleMatch ? (titleMatch[1] || titleMatch[2] || titleMatch[3] || '') : '';
    const descLiteral = descMatch ? (descMatch[1] || descMatch[2] || descMatch[3] || '') : '';

    // Warn if title literal includes brand; PackageSEO appends brand
    if (titleLiteral && /Ghumo\s+Firoo\s+Travels/i.test(titleLiteral)) {
      errors.push('Title prop includes brand; PackageSEO already appends brand');
    }

    if (descLiteral) {
      const len = descLiteral.length;
      if (len < 150 || len > 160) {
        errors.push(`Meta description length out of range (${len}); expected 150-160`);
      }
    }
  }

  // expected canonical string check (best-effort for static strings)
  if (content.includes('<link rel="canonical"')) {
    const hrefMatch = content.match(/<link rel=\"canonical\" href=\"([^\"]+)\"/);
    if (hrefMatch && hrefMatch[1] !== canonical) {
      errors.push(`Canonical mismatch: expected ${canonical} got ${hrefMatch[1]}`);
    }
  }

  return { name, slug, canonical, errors };
}

function main() {
  const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.tsx'));
  const results = files.map((f) => validateFile(path.join(PAGES_DIR, f)));
  const failing = results.filter((r) => r.errors.length > 0);
  if (failing.length) {
    console.error('SEO validation failed for:');
    for (const r of failing) {
      console.error(`- ${r.name} (${r.canonical})`);
      for (const e of r.errors) console.error(`  * ${e}`);
    }
    process.exitCode = 1;
  } else {
    console.log('All package pages passed SEO validation.');
  }
}

main();