import type React from 'react';

type PageMetaInput = {
  heading?: string;
  keyPoints?: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  valueProps?: string[];
};

type GeneratedSEO = {
  title: string;
  description: string;
  keywords: string;
};

const MAX_TITLE = 60;
const MAX_DESC = 160;

function clamp(input: string, maxLen: number) {
  if (!input) return input;
  if (input.length <= maxLen) return input;
  const trimmed = input.slice(0, maxLen);
  const idx = trimmed.lastIndexOf(' ');
  return (idx > 0 ? trimmed.slice(0, idx) : trimmed).trim();
}

const baseKeywords = [
  'Ghumo Firoo Travels',
  'best travel agency Delhi 2026',
  'tour packages India',
  'travel packages from Delhi',
  'holiday packages India',
  'honeymoon travel packages',
  'tour operator in Delhi',
  'destination guides India',
  'Char Dham Yatra 2026',
  'Rajasthan heritage tours',
  'Europe tour packages from India',
  'luxury travel agent Delhi',
  'affordable tour packages India',
  'custom travel planning 2026',
];

const routeTemplates: Record<string, (meta?: PageMetaInput) => GeneratedSEO> = {
  '/': () => ({
    title: clamp('Best Travel Agency in Delhi 2026 | Custom Tour Packages India', MAX_TITLE),
    description: clamp('Book your dream vacation with Ghumo Firoo Travels. Expert planning for Char Dham Yatra, Europe, Rajasthan & more. Trusted 2026 travel services in Delhi.', MAX_DESC),
    keywords: [...baseKeywords, 'holiday deals 2026', 'travel services Delhi', 'certified travel agency'].join(', '),
  }),
  '/about': () => ({
    title: clamp('About Us | Best Tour Operators in Delhi 2026', MAX_TITLE),
    description: clamp('Learn why Ghumo Firoo is the top-rated travel agency in Delhi. 15+ years of excellence in crafting custom domestic and international tours.', MAX_DESC),
    keywords: [...baseKeywords, 'about us', 'tour operator profile', 'travel agency history'].join(', '),
  }),
  '/contact': () => ({
    title: clamp('Contact Us | Travel Agency in Munirka Delhi 2026', MAX_TITLE),
    description: clamp('Get in touch with Ghumo Firoo Travels for 2026 bookings. Visit our Munirka office or call/WhatsApp for expert travel assistance.', MAX_DESC),
    keywords: [...baseKeywords, 'contact details', 'Munirka travel office', 'travel assistance Delhi'].join(', '),
  }),
  '/products': () => ({
    title: clamp('All Tour Packages | Domestic & International Deals', MAX_TITLE),
    description: clamp('Browse curated packages across India and abroad—family trips, honeymoons and group tours with transparent pricing.', MAX_DESC),
    keywords: [...baseKeywords, 'tour packages list', 'family trips', 'honeymoon packages'].join(', '),
  }),
  '/packages': () => ({
    title: clamp('2026 Tour Packages | Handpicked Holiday Deals', MAX_TITLE),
    description: clamp('Discover handpicked 2026 tour packages from Delhi. From spiritual Char Dham Yatra to luxury Europe tours and honeymoon escapes, find your perfect itinerary here.', MAX_DESC),
    keywords: [...baseKeywords, 'best holiday packages 2026', 'seasonal tour deals', 'custom itineraries', 'honeymoon packages', 'pilgrimage tour packages'].join(', '),
  }),
  '/blog': () => ({
    title: clamp('Travel Blog 2026 | Expert Guides & Offbeat Destinations', MAX_TITLE),
    description: clamp('Explore India\'s hidden gems and travel planning advice with our expert blog. Tips for Char Dham, Europe visas, honeymoon trips and budget getaways.', MAX_DESC),
    keywords: [...baseKeywords, 'travel tips 2026', 'offbeat India guides', 'destination inspiration', 'travel planning advice'].join(', '),
  }),
  '/guides': () => ({
    title: clamp('Travel Guides | India & International Destination Planning', MAX_TITLE),
    description: clamp('Find destination guides, itinerary planning advice, and travel tips for Indian and international tours. Perfect for Char Dham, Rajasthan, Europe and honeymoon planning.', MAX_DESC),
    keywords: [...baseKeywords, 'travel guides', 'destination planning', 'itinerary guides', 'guide to India tours', 'honeymoon itinerary'].join(', '),
  }),
  '/sightseeing': () => ({
    title: clamp('Top Sightseeing & Activities in India 2026 | Ghumo Firoo', MAX_TITLE),
    description: clamp('Explore iconic attractions, scenic highways, heritage monuments & adventure activities across India with Ghumo Firoo. Book curated tour packages.', MAX_DESC),
    keywords: [...baseKeywords, 'sightseeing India', 'activities 2026', 'Road to Heaven Dholavira', 'Kalo Dungar', 'Kedarnath trek'].join(', '),
  }),
  '/activities': () => ({
    title: clamp('Top Sightseeing & Activities in India 2026 | Ghumo Firoo', MAX_TITLE),
    description: clamp('Explore iconic attractions, scenic highways, heritage monuments & adventure activities across India with Ghumo Firoo. Book curated tour packages.', MAX_DESC),
    keywords: [...baseKeywords, 'sightseeing India', 'activities 2026', 'Road to Heaven Dholavira', 'Kalo Dungar', 'Kedarnath trek'].join(', '),
  }),
  '/career': () => ({
    title: clamp('Careers at Ghumo Firoo | Join Our Travel Team', MAX_TITLE),
    description: clamp('Build a career in travel—apply for roles in planning, support and digital operations at Ghumo Firoo.', MAX_DESC),
    keywords: [...baseKeywords, 'careers', 'jobs', 'travel industry'].join(', '),
  }),
  '/booking': () => ({
    title: clamp('Secure Booking | Reserve Your Trip with Confidence', MAX_TITLE),
    description: clamp('Reserve tours securely with transparent pricing, clear inclusions, and responsive support throughout your journey.', MAX_DESC),
    keywords: [...baseKeywords, 'booking', 'secure payment', 'transparent pricing'].join(', '),
  }),
  '/privacy-policy': () => ({
    title: clamp('Privacy Policy | Your Data & Booking Protection', MAX_TITLE),
    description: clamp('Understand how we protect your data and payments with secure systems and responsible practices.', MAX_DESC),
    keywords: [...baseKeywords, 'privacy', 'data protection', 'security'].join(', '),
  }),
  '/refund-policy': () => ({
    title: clamp('Refund Policy | Cancellations & Customer Support', MAX_TITLE),
    description: clamp('Review refund and cancellation terms—transparent policies and dedicated support for fair resolutions.', MAX_DESC),
    keywords: [...baseKeywords, 'refund policy', 'cancellations', 'support'].join(', '),
  }),
  '/terms': () => ({
    title: clamp('Terms & Conditions | Travel Services Agreement', MAX_TITLE),
    description: clamp('Read our service terms—booking rules, inclusions, and responsibilities for smooth travel experiences.', MAX_DESC),
    keywords: [...baseKeywords, 'terms and conditions', 'service terms'].join(', '),
  }),
  '/terms-of-service': () => ({
    title: clamp('Terms of Service | Using Ghumo Firoo Platforms', MAX_TITLE),
    description: clamp('Usage terms for our website and services, covering account access, content and acceptable use.', MAX_DESC),
    keywords: [...baseKeywords, 'terms of service', 'acceptable use'].join(', '),
  }),
  '/not-found': () => ({
    title: clamp('Page Not Found | Explore Tours with Ghumo Firoo', MAX_TITLE),
    description: clamp('This page doesn’t exist. Explore our tours and contact support for quick assistance.', MAX_DESC),
    keywords: [...baseKeywords, '404', 'support', 'explore tours'].join(', '),
  }),
  '/crm': () => ({
    title: clamp('Ghumo Firoo CRM | Internal Operations Portal', MAX_TITLE),
    description: clamp('Internal portal for managing leads, bookings and reviews. Restricted access for staff.', MAX_DESC),
    keywords: [...baseKeywords, 'CRM', 'internal', 'operations'].join(', '),
  }),
  '/auth': () => ({
    title: clamp('Account Access | Login to Ghumo Firoo Portal', MAX_TITLE),
    description: clamp('Secure login for staff and partners to access CRM tools and resources.', MAX_DESC),
    keywords: [...baseKeywords, 'login', 'account access', 'portal'].join(', '),
  }),
};

export function generateSEO(pathname: string, meta?: PageMetaInput, overrides?: Partial<GeneratedSEO>): GeneratedSEO {
  const base = routeTemplates[pathname]?.(meta) ?? {
    title: clamp(`${meta?.heading ?? 'Discover Tours'} | Ghumo Firoo Travels`, MAX_TITLE),
    description: clamp(
      meta?.valueProps?.join(' ') ??
        'Explore memorable trips with trusted planners, inclusive packages and dedicated support.',
      MAX_DESC
    ),
    keywords: [...baseKeywords, meta?.primaryKeyword ?? 'travel'].concat(meta?.secondaryKeywords ?? []).join(', '),
  };
  return {
    title: overrides?.title ?? base.title,
    description: overrides?.description ?? base.description,
    keywords: overrides?.keywords ?? base.keywords,
  };
}

export function validateAllTemplates(): { duplicates: { field: 'title' | 'description'; value: string; routes: string[] }[] } {
  const entries = Object.entries(routeTemplates).map(([route, fn]) => ({ route, data: fn() }));
  const titles = new Map<string, string[]>();
  const descs = new Map<string, string[]>();
  for (const { route, data } of entries) {
    titles.set(data.title, [...(titles.get(data.title) ?? []), route]);
    descs.set(data.description, [...(descs.get(data.description) ?? []), route]);
  }
  const duplicates: { field: 'title' | 'description'; value: string; routes: string[] }[] = [];
  titles.forEach((routes, value) => { if (routes.length > 1) duplicates.push({ field: 'title', value, routes }); });
  descs.forEach((routes, value) => { if (routes.length > 1) duplicates.push({ field: 'description', value, routes }); });
  return { duplicates };
}