// Utilities to load content and briefs via Vite's import.meta.glob
import type { DestinationGuide, ContentBrief } from '@/types/content';

// Eagerly import destination guides to enable routing and lists
const guideModules = import.meta.glob('../content/destinations/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, DestinationGuide>;

const briefModules = import.meta.glob('../content/briefs/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, ContentBrief>;

const toSlug = (path: string) => path.split('/').pop()!.replace(/\.json$/i, '');

export const guidesIndex: Record<string, DestinationGuide> = Object.fromEntries(
  Object.entries(guideModules).map(([path, data]) => [data.slug || toSlug(path), data])
);

export const briefsIndex: Record<string, ContentBrief> = Object.fromEntries(
  Object.entries(briefModules).map(([path, data]) => [data.slug || toSlug(path), data])
);

export const listGuides = () => Object.values(guidesIndex);
export const getGuide = (slug: string) => guidesIndex[slug];
export const listBriefs = () => Object.values(briefsIndex);
export const getBrief = (slug: string) => briefsIndex[slug];