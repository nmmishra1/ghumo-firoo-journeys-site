// scripts/external-seo-audit.mjs
// External-style audit: fetch live pages listed in public/sitemap.xml
// and measure title/meta description lengths, canonical presence.
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SITEMAP_LOCAL = path.join(ROOT, 'public', 'sitemap.xml');
const SITE_URL = process.env.VITE_SITE_URL || 'https://ghumofiroo.com';

function extractUrlsFromSitemap(xml) {
  const urls = [];
  const regex = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) urls.push(m[1]);
  return urls;
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'GhumoFiroo-Audit/1.0' } });
    const html = await res.text();
    return { ok: res.ok, status: res.status, html };
  } catch (e) {
    return { ok: false, status: 0, html: '', error: String(e) };
  }
}

function parseTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

function parseMetaDescription(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/>/i);
  return m ? m[1].trim() : '';
}

function parseCanonical(html) {
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/>/i);
  return m ? m[1].trim() : '';
}

function withinRange(len, min, max) {
  return len >= min && len <= max;
}

async function main() {
  const xml = fs.readFileSync(SITEMAP_LOCAL, 'utf8');
  const urls = extractUrlsFromSitemap(xml);
  const report = [];

  for (const url of urls) {
    const { ok, status, html } = await fetchHtml(url);
    const title = ok ? parseTitle(html) : '';
    const description = ok ? parseMetaDescription(html) : '';
    const canonical = ok ? parseCanonical(html) : '';

    const titleLen = title.length;
    const descLen = description.length;
    const titleOk = withinRange(titleLen, 30, 60);
    const descOk = withinRange(descLen, 150, 160);
    const canonicalOk = Boolean(canonical);

    report.push({
      url,
      status,
      title,
      titleLen,
      titleOk,
      description,
      descLen,
      descOk,
      canonical,
      canonicalOk,
    });
  }

  const failingTitles = report.filter(r => !r.titleOk);
  const failingDescs = report.filter(r => !r.descOk);
  const missingCanon = report.filter(r => !r.canonicalOk);

  const summary = {
    site: SITE_URL,
    totalPages: report.length,
    titleFailures: failingTitles.length,
    descriptionFailures: failingDescs.length,
    canonicalMissing: missingCanon.length,
  };

  const lines = [];
  lines.push(`# External SEO Audit Report`);
  lines.push(`Site: ${summary.site}`);
  lines.push(`Total pages: ${summary.totalPages}`);
  lines.push(`Title failures: ${summary.titleFailures}`);
  lines.push(`Description failures: ${summary.descriptionFailures}`);
  lines.push(`Canonical missing: ${summary.canonicalMissing}`);
  lines.push('');
  for (const r of report) {
    lines.push(`- ${r.url}`);
    lines.push(`  * status: ${r.status}`);
    lines.push(`  * title (${r.titleLen}): ${r.titleOk ? 'OK' : 'OUT_OF_RANGE'} -> ${r.title}`);
    lines.push(`  * meta description (${r.descLen}): ${r.descOk ? 'OK' : 'OUT_OF_RANGE'}`);
    if (!r.descOk) lines.push(`    ${r.description}`);
    lines.push(`  * canonical: ${r.canonicalOk ? r.canonical : 'MISSING'}`);
  }

  const outPath = path.join(ROOT, 'external-seo-audit.txt');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`Audit complete. See external-seo-audit.txt`);
}

main();