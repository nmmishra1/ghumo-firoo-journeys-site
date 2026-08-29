// src/lib/seo.ts
// Utilities for generating canonical URLs and validating SEO metadata

import { config } from '@/config';

const DEFAULT_SITE_URL = config.baseUrl;

function ensureNoTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function slugifyPackageName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

export function canonicalForPackage(nameOrSlug: string) {
  const base = ensureNoTrailingSlash(DEFAULT_SITE_URL);
  const slug = /\//.test(nameOrSlug) ? nameOrSlug : slugifyPackageName(nameOrSlug);
  return `${base}/packages/${slug}`;
}

export function isValidCanonical(url: string, expectedSlug: string) {
  const base = ensureNoTrailingSlash(DEFAULT_SITE_URL);
  const expected = `${base}/packages/${expectedSlug}`;
  return ensureNoTrailingSlash(url) === expected;
}

export default {
  slugifyPackageName,
  canonicalForPackage,
  isValidCanonical,
};