import React from 'react';
import { Helmet } from 'react-helmet-async';
import JsonLd, { buildProductJsonLd, buildBreadcrumbJsonLd, buildFaqJsonLd } from '@/components/seo/JsonLd';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

interface PackageSEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  canonicalUrl?: string; // alias for canonical
  images?: string[];
  ogImage?: string; // alias for images[0]
  ogType?: string;
  imageAlt?: string;
  price?: number | string; // numeric or numeric string
  priceCurrency?: string; // default: INR
  rating?: number;
  reviews?: number;
  breadcrumbs?: BreadcrumbItem[]; // if omitted, no breadcrumb JSON-LD rendered
  faqs?: FAQItem[]; // if omitted, no FAQ JSON-LD rendered
  brandName?: string; // default: Ghumo Firoo Travels
  /** Optional custom JSON-LD block(s) to inject. */
  geo?: {
    region?: string;
    placename?: string;
    position?: string;
    icbm?: string;
    latitude?: string;
    longitude?: string;
  };
  structuredData?: object | object[];
  /** If true, skips generating the default Product schema (useful if you provide a more detailed TouristTrip schema). */
  skipProductSchema?: boolean;
}

const PackageSEO: React.FC<PackageSEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  canonicalUrl,
  images,
  ogImage,
  ogType = 'product',
  imageAlt,
  price,
  priceCurrency = 'INR',
  rating,
  reviews,
  breadcrumbs,
  faqs,
  brandName = 'Ghumo Firoo Travels',
  geo,
  structuredData,
  skipProductSchema = false,
}) => {
  const finalCanonical = canonicalUrl || canonical || '';
  const finalImages = images && images.length > 0 ? images : ogImage ? [ogImage] : [];

  const toNumericPrice = (p: number | string): string | undefined => {
    if (typeof p === 'number') {
      if (!Number.isFinite(p) || p < 0) return undefined;
      const s = String(p);
      return /^\d+(\.\d+)?$/.test(s) ? s : undefined;
    }
    const digits = String(p).replace(/[^0-9]/g, '');
    if (!digits) return undefined;
    return String(parseInt(digits, 10));
  };
  const numericPrice = toNumericPrice(price);

  // Helper: smart truncate without cutting words
  const smartTruncate = (str: string, max: number) => {
    if (str.length <= max) return str;
    const slice = str.slice(0, max);
    const lastSpace = slice.lastIndexOf(' ');
    return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim();
  };

  // Build final title (avoid duplicate brand, enforce 30-60 chars)
  const titleWithBrand = title.includes(brandName) ? title : `${title} | ${brandName}`;
  const finalTitle = titleWithBrand.length > 60 ? smartTruncate(titleWithBrand, 60) : titleWithBrand;
  if (finalTitle.length < 30 || finalTitle.length > 60) {
    console.warn(`[SEO] Title length out of range (${finalTitle.length}).`, { finalTitle });
  }

  // Enforce meta description 150-160 chars (truncate if longer)
  const finalDescription = description.length > 160 ? smartTruncate(description, 160) : description;
  if (finalDescription.length > 160) {
    console.warn(`[SEO] Description length out of range (${finalDescription.length}).`, { finalDescription });
  }

  const productJson = !skipProductSchema && numericPrice ? buildProductJsonLd({
    name: title,
    description: finalDescription,
    url: finalCanonical,
    images: finalImages,
    category: 'TravelPackage',
    brandName,
    offer: { priceCurrency, price: numericPrice, url: finalCanonical },
    aggregateRating: rating && reviews ? { ratingValue: rating, reviewCount: reviews } : undefined,
  }) : undefined;

  const breadcrumbsJson = breadcrumbs && breadcrumbs.length > 0
    ? buildBreadcrumbJsonLd(breadcrumbs)
    : undefined;

  const geoData = geo ?? {
    region: 'IN-DL',
    placename: 'New Delhi',
    position: '28.549333982444654;77.16911131508083',
    icbm: '28.549333982444654,77.16911131508083',
    latitude: '28.549333982444654',
    longitude: '77.16911131508083',
  };

  const faqJson = faqs && faqs.length > 0
    ? buildFaqJsonLd(faqs)
    : undefined;

  return (
    <>
      <Helmet>
        <title>{finalTitle}</title>
        <meta name="description" content={finalDescription} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta name="robots" content="index, follow" />
        <meta name="author" content={brandName} />
        {finalCanonical && <link rel="canonical" href={finalCanonical} />}
        {finalCanonical && <link rel="alternate" hreflang="en" href={finalCanonical} />}

        {/* Open Graph */}
        <meta property="og:locale" content="en_IN" />
        <meta property="og:site_name" content={brandName} />
        <meta property="og:type" content={ogType} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {finalCanonical && <meta property="og:url" content={finalCanonical} />}
        {finalImages && finalImages[0] && (
          <>
            <meta property="og:image" content={finalImages[0]} />
            <meta property="og:image:secure_url" content={finalImages[0]} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={imageAlt || title} />
          </>
        )}
        {numericPrice && <meta property="og:price:amount" content={numericPrice} />}
        {numericPrice && <meta property="og:price:currency" content={priceCurrency} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={finalTitle} />
        <meta name="twitter:description" content={finalDescription} />
        {finalImages && finalImages[0] && <meta name="twitter:image" content={finalImages[0]} />}
        <>
          {geoData.region && <meta name="geo.region" content={geoData.region} />}
          {geoData.placename && <meta name="geo.placename" content={geoData.placename} />}
          {geoData.position && <meta name="geo.position" content={geoData.position} />}
          {geoData.icbm && <meta name="ICBM" content={geoData.icbm} />}
        </>

        {/* Schema.org JSON-LD */}
        {productJson && <script type="application/ld+json">{JSON.stringify(productJson).replace(/</g, '\\u003c')}</script>}
        {breadcrumbsJson && <script type="application/ld+json">{JSON.stringify(breadcrumbsJson).replace(/</g, '\\u003c')}</script>}
        {faqJson && <script type="application/ld+json">{JSON.stringify(faqJson).replace(/</g, '\\u003c')}</script>}
        {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>}
      </Helmet>
    </>
  );
};

export default PackageSEO;
