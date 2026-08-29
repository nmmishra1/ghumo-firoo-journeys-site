// src/components/seo/JsonLd.tsx
  import React from "react";

  type Offer = {
    priceCurrency: string; // e.g., "INR"
    price: string; // e.g., "79999"
    availability?: "https://schema.org/InStock" | "https://schema.org/PreOrder" | "https://schema.org/OutOfStock";
    url?: string;
    validFrom?: string; // ISO date
    hasMerchantReturnPolicy?: any;
    shippingDetails?: any;
  };

  type AggregateRating = {
    ratingValue: number; // 4.7
    reviewCount: number; // 123
  };

  export function buildProductJsonLd(opts: {
    name: string;
    description: string;
    url: string;
    images: string[];
    brandName?: string;
    sku?: string;
    category?: string; // e.g., "TravelPackage"
    duration?: string; // ISO 8601 e.g., "P7D" for 7 days
    offer: Offer;
    aggregateRating?: AggregateRating;
  }) {
    const {
      name,
      description,
      url,
      images,
      brandName = "Ghumo Firoo Travels",
      sku,
      category = "TravelPackage",
      duration,
      offer,
      aggregateRating,
    } = opts;

    const sanitizePrice = (val?: string) => {
      if (!val) return undefined;
      const digits = String(val).replace(/[^0-9]/g, '');
      if (!digits) return undefined;
      return String(parseInt(digits, 10));
    };
    const safePrice = sanitizePrice(offer.price);

    // Default shipping details (Digital/Service delivery)
    const defaultShippingDetails = {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": 0,
        "currency": "INR"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "IN"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 1,
          "unitCode": "d"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 1,
          "unitCode": "d"
        }
      }
    };

    // Default return policy
    const defaultReturnPolicy = {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "IN",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 30,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    };

    const json: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      description,
      image: images,
      category,
      brand: { "@type": "Brand", name: brandName },
      url,
      offers: {
        "@type": "Offer",
        priceCurrency: offer.priceCurrency,
        price: safePrice,
        availability: offer.availability ?? "https://schema.org/InStock",
        url: offer.url ?? url,
        validFrom: offer.validFrom,
        hasMerchantReturnPolicy: offer.hasMerchantReturnPolicy ?? defaultReturnPolicy,
        shippingDetails: offer.shippingDetails ?? defaultShippingDetails,
      },
    };

    if (sku) json.sku = sku;
    if (duration) {
      json.additionalProperty = [{ "@type": "PropertyValue", name: "duration", value: duration }];
    }
    if (aggregateRating) {
      json.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
      };
    }

    return json;
  }

  export function buildBreadcrumbJsonLd(items: Array<{ name: string; item: string }>) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((it, idx) => {
        const urlStr = it.item.startsWith('/') ? `https://ghumofiroo.com${it.item}` : it.item;
        return {
          "@type": "ListItem",
          position: idx + 1,
          name: it.name,
          item: urlStr,
        };
      }),
    };
  }

  export function buildFaqJsonLd(faqs: Array<{ question: string; answer: string }>) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    };
  }

  // Helper to enforce character limits
  const truncate = (val: string | undefined, max: number) => {
    if (!val) return val;
    const s = String(val);
    if (s.length <= max) return s;
    const cut = s.slice(0, max - 1);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + '…';
  };

  // TouristTrip schema builder
  export function buildTouristTripJsonLd(opts: {
    name: string;
    description: string;
    url: string;
    image?: string | string[];
    itinerary: Array<{ position: number; name: string; description?: string }>;
    offer: { 
      priceCurrency: string; 
      includes?: string; 
      price?: string; 
      availability?: string; 
      validFrom?: string;
      validThrough?: string; // End date
      priceValidUntil?: string; // Booking cutoff
      eligibleQuantity?: { value: number; unitCode: string }; // Max capacity
      acceptedPaymentMethod?: string[]; // Payment options
    };
    providerName?: string;
    duration?: string; // ISO 8601 (e.g., P9D)
    aggregateRating?: AggregateRating;
    reviews?: Array<{ 
      author: string; 
      reviewBody: string; 
      reviewRating: number; 
      datePublished?: string; // Timestamp
      isVerified?: boolean; // Verified purchase
    }>;
    destination?: { 
      name: string; 
      address?: string; 
      geo?: { latitude: string; longitude: string };
      meetingPoint?: string; // Meeting point
      transportation?: string; // Transportation details
      accessibility?: string; // Accessibility features
    };
  }) {
    if (!opts) {
      console.warn("buildTouristTripJsonLd: Missing opts.");
      return {};
    }
    const images = Array.isArray(opts.image) ? opts.image : opts.image ? [opts.image] : [];
    
    const sanitizePrice = (val?: string | number) => {
      if (!val) return undefined;
      const digits = String(val).replace(/[^0-9]/g, '');
      if (!digits) return undefined;
      return String(parseInt(digits, 10));
    };
    
    const primaryOffer = opts.offer || (Array.isArray((opts as any).offers) && (opts as any).offers[0]) || {};
    const safePrice = sanitizePrice(primaryOffer.price);

    // Construct Itinerary if provided
    const itineraryList = opts.itinerary || [];
    const itinerary = itineraryList.length > 0 ? {
      "@type": "ItemList",
      numberOfItems: itineraryList.length,
      itemListElement: itineraryList.map((it) => ({
        "@type": "ListItem",
        position: it.position,
        item: {
          "@type": "TouristAttraction",
          name: it.name,
          description: it.description,
        }
      })),
    } : undefined;

    const json: any = {
      "@context": "https://schema.org",
      "@type": ["TouristTrip", "Product"], // Dual type for better rich snippets
      name: truncate(opts.name || "Luxury Tour Package", 100),
      description: (opts.description || "Bespoke guided travel package with top-tier lodging and transfers.").padEnd(50, ' '),
      url: opts.url || "https://ghumofiroo.com",
      image: images,
      ...(itinerary ? { itinerary } : {}),
      offers: {
        "@type": "Offer",
        priceCurrency: primaryOffer.priceCurrency || "INR",
        ...(safePrice ? { price: safePrice } : {}),
        availability: primaryOffer.availability ?? "https://schema.org/InStock",
        url: primaryOffer.url || opts.url || "https://ghumofiroo.com",
        ...(primaryOffer.validFrom ? { validFrom: primaryOffer.validFrom } : {}),
        ...(primaryOffer.validThrough ? { validThrough: primaryOffer.validThrough } : {}),
        ...(primaryOffer.priceValidUntil ? { priceValidUntil: primaryOffer.priceValidUntil } : {}),
        ...(primaryOffer.acceptedPaymentMethod ? {
          acceptedPaymentMethod: primaryOffer.acceptedPaymentMethod.map((method: string) => ({
             "@type": "PaymentMethod",
             name: method
          }))
        } : {}),
        itemOffered: {
          "@type": "Service",
          name: truncate(opts.name || "Luxury Tour", 100),
          description: truncate(primaryOffer.includes || opts.description || "Bespoke guided travel", 160),
        },
      },
      provider: {
        "@type": "TravelAgency",
        name: opts.providerName || "Ghumo Firoo Travels",
        url: opts.providerUrl || "https://ghumofiroo.com",
      }
    };

    if (primaryOffer.eligibleQuantity) {
      json.offers.inventoryLevel = {
        "@type": "QuantitativeValue",
        value: primaryOffer.eligibleQuantity.value,
        unitCode: primaryOffer.eligibleQuantity.unitCode
      };
    }

    if (opts.duration) {
      json.duration = opts.duration;
    }

    if (opts.aggregateRating) {
      json.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: opts.aggregateRating.ratingValue,
        reviewCount: opts.aggregateRating.reviewCount,
      };
    }

    if (opts.reviews && opts.reviews.length > 0) {
      json.review = opts.reviews.map(r => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.author },
        reviewBody: r.reviewBody,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.reviewRating,
          bestRating: 5,
          worstRating: 1
        },
        datePublished: r.datePublished,
        reviewAspect: r.isVerified ? "Verified Purchase" : undefined
      }));
    }
    
    if (opts.destination) {
       json.destination = {
         "@type": "TouristDestination",
         name: opts.destination.name,
         address: opts.destination.address,
         geo: opts.destination.geo ? {
            "@type": "GeoCoordinates",
            latitude: opts.destination.geo.latitude,
            longitude: opts.destination.geo.longitude
         } : undefined
       };

       if (opts.destination.meetingPoint) {
         json.subEvent = {
            "@type": "Event",
            name: "Meeting Point",
            location: {
               "@type": "Place",
               name: opts.destination.meetingPoint
            }
         };
       }
    }
    
    // Add transportation details if available (usually part of description or separate field in schema)
    if (opts.destination?.transportation) {
        json.amenityFeature = {
            "@type": "LocationFeatureSpecification",
            name: "Transportation",
            value: opts.destination.transportation
        };
    }

    if (opts.destination?.accessibility) {
        json.accessibilityFeature = opts.destination.accessibility;
    }

    return json;
  }

  // Festival schema builder
  export function buildFestivalJsonLd(opts: {
    name: string;
    description: string;
    url: string;
    image?: string | string[];
    startDate: string;
    endDate: string;
    location: { name: string; address?: any; geo?: { latitude: number; longitude: number } };
    offer?: { priceCurrency: string; includes?: string; price?: string };
    organizerName?: string;
  }) {
    const images = Array.isArray(opts.image) ? opts.image : opts.image ? [opts.image] : [];
    const json: any = {
      "@context": "https://schema.org",
      "@type": "Festival",
      name: truncate(opts.name, 60),
      description: truncate(opts.description, 160),
      url: opts.url,
      image: images,
      startDate: opts.startDate,
      endDate: opts.endDate,
      location: {
        "@type": "Place",
        name: opts.location.name,
      },
      organizer: {
        "@type": "TravelAgency",
        name: opts.organizerName || "Ghumo Firoo Travels",
      },
      eventStatus: "https://schema.org/EventScheduled",
    };
    if (opts.location.address) json.location.address = opts.location.address;
    if (opts.location.geo) json.location.geo = { "@type": "GeoCoordinates", ...opts.location.geo };
    if (opts.offer) {
      json.offers = {
        "@type": "Offer",
        priceCurrency: opts.offer.priceCurrency,
        price: opts.offer.price,
        itemOffered: {
          "@type": "Service",
          name: truncate(opts.name, 60),
          description: truncate(opts.offer.includes || opts.description, 160),
        },
      };
    }
    return json;
  }

  // TravelAgency schema builder (for Contact page)
  export function buildTravelAgencyJsonLd(opts: {
    name: string;
    description: string;
    url: string;
    logo?: string;
    telephone?: string;
    email?: string;
    address?: { streetAddress?: string; addressLocality?: string; addressRegion?: string; postalCode?: string; addressCountry?: string };
    geo?: { latitude: string; longitude: string };
    openingHours?: string; // e.g., "Mo-Su 09:00-21:00"
    serviceArea?: { name: string } | Array<{ name: string }>;
    languages?: string[];
    sameAs?: string[];
    priceRange?: string;
    image?: string;
  }) {
    if (!opts || !opts.name) {
      console.warn("buildTravelAgencyJsonLd: Missing required 'name' in opts.");
      return {};
    }
    const json: any = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      name: truncate(opts.name, 60),
      description: truncate(opts.description, 160),
      url: opts.url,
      logo: opts.logo,
      address: opts.address && { "@type": "PostalAddress", ...opts.address },
      geo: opts.geo && {
        "@type": "GeoCoordinates",
        latitude: opts.geo.latitude,
        longitude: opts.geo.longitude,
      },
      openingHours: opts.openingHours,
    };
    if (opts.sameAs) json.sameAs = opts.sameAs;
    if (opts.priceRange) json.priceRange = opts.priceRange;
    if (opts.image) json.image = opts.image;
    
    const contactPoint: any = {
      "@type": "ContactPoint",
      contactType: "customer service",
    };
    if (opts.telephone) contactPoint.telephone = opts.telephone;
    if (opts.languages && opts.languages.length > 0) contactPoint.availableLanguage = opts.languages;
    json.contactPoint = [contactPoint];
    if (opts.email) json.email = opts.email;
    if (opts.serviceArea) json.serviceArea = opts.serviceArea;
    return json;
  }

  // Renders a script tag; okay to live in body for Google.
  export function JsonLd({ json }: { json: object }) {
    const content = JSON.stringify(json).replace(/</g, '\\u003c');
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  export default JsonLd;

// src/lib/analytics.ts

  export type AnalyticsParams = Record<string, any>;

  export function pushEvent(eventName: string, params: AnalyticsParams = {}) {
    try {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({ event: eventName, ...params });

      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("event", eventName, params);
      }
    } catch {
      // no-op
    }
  }
