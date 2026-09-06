import React from 'react';
import { Helmet } from 'react-helmet-async';
import { config } from '@/config';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  /** Canonical URL for the page; if omitted, `url` is used. */
  canonicalUrl?: string;
  /** Page path or full URL; used when `canonicalUrl` is not provided. */
  url?: string;
  /** Optional alias used by some pages. */
  ogImage?: string;
  type?: 'website' | 'article' | 'blog';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  geo?: {
    region?: string;
    placename?: string;
    position?: string;
    icbm?: string;
    latitude?: string;
    longitude?: string;
  };
  /** Optional custom JSON-LD block(s) to inject. */
  structuredData?: object | object[];
  /** When true, sets robots to noindex,nofollow. */
  noindex?: boolean;
}

const MAX_TITLE_LEN = 60;
const MOBILE_TITLE_LEN = 50;
const MIN_TITLE_LEN = 20;
const MAX_DESC_LEN = 160;
const MOBILE_DESC_LEN = 130;
const MIN_DESC_LEN = 120;

function clampAtWordBoundary(input: string, maxLen: number) {
  if (!input) return input;
  if (input.length <= maxLen) return input;
  const trimmed = input.slice(0, maxLen);
  const idx = trimmed.lastIndexOf(' ');
  return (idx > 0 ? trimmed.slice(0, idx) : trimmed).trim();
}

const SEO: React.FC<SEOProps> = ({
  title = 'Ghumo Firoo Travels — Trusted Delhi Travel Agency',
  description = 'Plan your perfect journey with Ghumo Firoo Travels — trusted Delhi travel agency for Char Dham, Europe and Rajasthan tours. Expert planning, secure bookings and friendly support for unforgettable experiences.',
  keywords = 'Ghumo Firoo Travels, Ghumofiroo, Ghumo Firo, Ghumo Phiro, Ghumophiro, travel agency Delhi, Delhi travel agent, tour operator Delhi, travel services New Delhi, best travel agency Delhi, travel agency near me, Char Dham Yatra, Europe tours, Rajasthan heritage tours, travel agency India, Kedarnath Badrinath tour, Switzerland Croatia tours, Grand Europe tours, Udaipur Jaisalmer packages, spiritual pilgrimage, luxury travel, customized tours, heritage tours, European vacation packages, Rann Utsav Gujarat, Kashmir tours, Leh Ladakh packages, Kerala backwaters, Dubai tours, Bali packages, customized travel packages, group tours Delhi, affordable tour packages, honeymoon packages, family tour packages, adventure tours, pilgrimage tours, international tour operator, domestic tour packages, ghumophirotravel competitor, ghumophiro alternative, best travel agency like ghumo firoo, premium travel services Delhi, evoke experiences partner, travel agency Munirka, South Delhi travel agent',
  image = '/ghumo-firoo-logo.png',
  imageAlt = 'Ghumo Firoo Travels brand image',
  canonicalUrl,
  url = 'https://ghumofiroo.com',
  ogImage,
  type = 'website',
  author = 'Ghumo Firoo Travels',
  publishedTime,
  modifiedTime,
  siteName = 'Ghumo Firoo Travels',
  twitterCard = 'summary_large_image',
  geo,
  structuredData,
  noindex = false,
}) => {
  // Mobile-optimized logic: Prefer strict limits for better mobile display while allowing up to standard desktop limits
  const baseTitle = title.includes('Ghumo Firoo') ? title : `${title} | Ghumo Firoo Travels`;
  const geoData = geo ?? {
    region: 'IN-DL',
    placename: 'New Delhi',
    position: '28.549333982444654;77.16911131508083',
    icbm: '28.549333982444654,77.16911131508083',
    latitude: '28.549333982444654',
    longitude: '77.16911131508083'
  };
  
  // Logic: Warn if title exceeds mobile limit but clamp at desktop limit
  const fullTitle = clampAtWordBoundary(baseTitle, MAX_TITLE_LEN);
  if (fullTitle.length > MOBILE_TITLE_LEN) {
    // Optional: Log warning for development
    // console.warn(`[SEO] Title "${fullTitle}" exceeds mobile safe length of ${MOBILE_TITLE_LEN} chars.`);
  }

  const preferredUrl = canonicalUrl ?? url;
  const fullUrl = preferredUrl.startsWith('http') ? preferredUrl : `${config.baseUrl}${preferredUrl}`;
  const selectedImage = ogImage ?? image;
  const fullImageUrl = selectedImage.startsWith('http') ? selectedImage : `${config.baseUrl}${selectedImage}`;
  
  // Logic: Warn if description exceeds mobile limit but clamp at desktop limit
  const finalDescription = clampAtWordBoundary(description, MAX_DESC_LEN);
  if (finalDescription.length > MOBILE_DESC_LEN) {
    // Optional: Log warning for development
    // console.warn(`[SEO] Description exceeds mobile safe length of ${MOBILE_DESC_LEN} chars.`);
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      <link rel="alternate" href={fullUrl} hrefLang="en" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:site_name" content={siteName} />
      {author && <meta property="article:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {geoData && (
        <>
          {geoData.region && <meta name="geo.region" content={geoData.region} />}
          {geoData.placename && <meta name="geo.placename" content={geoData.placename} />}
          {geoData.position && <meta name="geo.position" content={geoData.position} />}
          {geoData.icbm && <meta name="ICBM" content={geoData.icbm} />}
        </>
      )}
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@GhumoFiroo" />
      <meta name="twitter:creator" content="@GhumoFiroo" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />
      
      {/* Default JSON-LD for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["TravelAgency", "Organization"],
          "@id": "https://ghumofiroo.com/#organization",
          "name": "Ghumo Firoo Travels",
          "legalName": "Ghumo Firoo Travels",
          "foundingDate": "2017",
          "brand": {
            "@type": "Brand",
            "name": "Ghumo Firoo Travels"
          },
          "url": "https://ghumofiroo.com",
          "logo": "https://ghumofiroo.com/ghumo-firoo-logo.png",
          "image": "https://ghumofiroo.com/ghumo-firoo-logo.png",
          "telephone": ["+91-9910987264", "+91-9870229792"],
          "email": "info@ghumofiroo.com",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-9910987264",
            "contactType": "customer service",
            "areaServed": "IN",
            "availableLanguage": "en"
          },
          "sameAs": [
            "https://maps.google.com/?cid=13837651037593674526",
            "https://www.tripadvisor.com/Search?q=Ghumo%20Firoo%20Travels",
            "https://www.facebook.com/ghumofirootravels",
            "https://www.instagram.com/ghumofirootravels/",
            "https://x.com/GhumoFiroo",
            "https://www.youtube.com/@ghumofirootravels"
          ],
          "hasCredential": [
            {
              "@type": "EducationalOccupationalCredential",
              "credentialCategory": "Government Registration",
              "name": "MSME Registered Enterprise",
              "recognizedBy": {
                "@type": "GovernmentOrganization",
                "name": "Ministry of Micro, Small and Medium Enterprises, Government of India"
              }
            },
            {
              "@type": "EducationalOccupationalCredential",
              "credentialCategory": "National Integrated Database of Hospitality Industry",
              "name": "NIDHI Verified Travel Operator",
              "recognizedBy": {
                "@type": "GovernmentOrganization",
                "name": "Ministry of Tourism, Government of India"
              }
            }
          ],
          "award": [
            "Best Agency for Rann Utsav",
            "Official Evoke Experiences Partner",
            "MSME Verified Travel Operator"
          ],
          "knowsAbout": [
            "Char Dham Yatra",
            "Kedarnath Helicopter Packages",
            "Evoke Tent City Dhordo Booking",
            "Europe Tour Packages",
            "Kashmir Holidays",
            "Best Agency for Rann Utsav"
          ],
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Shop No. 210, 2nd Floor, Pratap Complex, Metro Gate Number 3, near Munirka, Baba Gangnath Market",
            "addressLocality": "Munirka",
            "addressRegion": "Delhi",
            "postalCode": "110067",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "28.5562",
            "longitude": "77.1877"
          },
          "hasMap": "https://maps.google.com/?cid=13837651037593674526",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.7",
            "reviewCount": "50",
            "bestRating": "5",
            "worstRating": "1"
          }
        }).replace(/</g, '\\u003c')}
      </script>

      {/* Custom JSON-LD structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData).replace(/</g, '\\u003c')}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
