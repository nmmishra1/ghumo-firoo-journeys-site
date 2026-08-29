// Route prefetcher utility for lightning-fast client-side navigation
const prefetchedRoutes = new Set<string>();

const routeLoaders: Record<string, () => Promise<any>> = {
  '/': () => import('@/pages/Index'),
  '/about': () => import('@/pages/About'),
  '/contact': () => import('@/pages/Contact'),
  '/blog': () => import('@/pages/Blog'),
  '/packages': () => import('@/pages/Packages'),
  '/enquire-now': () => import('@/pages/EnquireNow'),
  '/packages/char-dham-yatra': () => import('@/pages/packages/CharDhamYatra'),
  '/packages/rann-utsav': () => import('@/pages/packages/RannUtsav'),
  '/packages/kashmir-paradise': () => import('@/pages/packages/KashmirParadise'),
  '/packages/europe': () => import('@/pages/packages/Europe'),
  '/packages/rajasthan-royal': () => import('@/pages/packages/RajasthanRoyal'),
  '/packages/kerala-backwaters': () => import('@/pages/packages/KeralaBackwaters'),
  '/packages/himachal-hill-stations': () => import('@/pages/packages/HimachalHillStations'),
  '/packages/dubai-delights': () => import('@/pages/packages/DubaiDelights'),
  '/packages/singapore-malaysia': () => import('@/pages/packages/SingaporeMalaysia'),
  '/packages/thailand-tropical': () => import('@/pages/packages/ThailandTropical'),
  '/packages/japan-cherry-blossom': () => import('@/pages/packages/JapanCherryBlossom'),
  '/packages/bali-paradise': () => import('@/pages/packages/BaliParadise'),
  '/packages/georgia-adventure': () => import('@/pages/packages/GeorgiaAdventure'),
  '/packages/goa-beach-holiday': () => import('@/pages/packages/GoaBeachHoliday'),
  '/landing/char-dham-helicopter': () => import('@/pages/landing/CharDhamHeli'),
  '/landing/char-dham-road': () => import('@/pages/landing/CharDhamRoad'),
  '/custom-tour-packages': () => import('@/pages/CustomTourPackages'),
};

export function prefetchRoute(path: string): void {
  if (!path || prefetchedRoutes.has(path)) return;
  prefetchedRoutes.add(path);

  // If path starts with /packages/ and isn't static, prefetch DynamicPackageDetail
  if (path.startsWith('/packages/') && !routeLoaders[path]) {
    import('@/pages/packages/DynamicPackageDetail').catch(() => {});
  } else if (routeLoaders[path]) {
    routeLoaders[path]().catch(() => {});
  }
}
