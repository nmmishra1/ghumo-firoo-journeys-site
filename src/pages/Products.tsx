
import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { config } from '@/config';
import { pushEvent } from '@/lib/analytics';
import { Helmet } from 'react-helmet-async';
import JsonLd, { buildBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import PackageSlider from '@/components/PackageSlider';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { supabase } from '@/integrations/supabase/client';

// Package data - moved outside component to fix initialization order
const domesticPackages = [
  {
    title: "Rann Utsav Gujarat",
    seoTitle: "4-Day Rann Utsav Gujarat - White Desert Festival with Tent City Kutch & Cultural Performances",
    description: "Experience the magical White Desert festival with luxury Tent City accommodation and authentic Gujarati culture",
    image: "/Kutch-Rann-Utsav-2023-2024.jpg",
    duration: "4 Days",
    price: "Starting from ₹18,500*",
    highlights: ["Luxury Tent City accommodation", "Cultural performances & folk dances", "White Desert sunrise & sunset", "Partnership with Evoke Experiences"],
    slug: "/packages/rann-utsav",
    featured: true,
    category: ["domestic", "premium"]
  },
  {
    title: "Char Dham Yatra",
    seoTitle: "7-Day Char Dham Yatra Package with Helicopter & VIP Darshan - Kedarnath Badrinath Gangotri Yamunotri",
    description: "Sacred pilgrimage to the four holy shrines of Uttarakhand with VIP darshan and helicopter services",
    image: "/Kedarnath.png",
    duration: "7 Days",
    price: "Starting from ₹25,000*",
    highlights: ["VIP darshan at all 4 dhams", "Helicopter option available", "Spiritual journey with guide"],
    slug: "/packages/char-dham-yatra",
    category: ["domestic"]
  },
  {
    title: "Kashmir Paradise",
    seoTitle: "8-Day Kashmir Paradise Tour with Dal Lake Houseboat Stay & Gulmarg Snow Activities - Srinagar Pahalgam",
    description: "Experience the breathtaking beauty of Kashmir valleys with houseboat stay and snow activities",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    duration: "8 Days",
    price: "Starting from ₹22,000*",
    highlights: ["Dal Lake houseboat stay", "Gulmarg gondola ride", "Pahalgam scenic valleys"],
    slug: "/packages/kashmir-paradise",
    category: ["domestic", "honeymoon"]
  },
  {
    title: "Leh Ladakh Adventure",
    seoTitle: "7-Day Leh Ladakh Bike Tour with Pangong Lake & Nubra Valley - High Altitude Adventure",
    description: "Ultimate high-altitude adventure in the Himalayas with bike tours and camping",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    duration: "7 Days",
    price: "Starting from ₹28,000*",
    highlights: ["Pangong Lake camping", "Nubra Valley camel safari", "Khardung La pass"],
    slug: "/packages/leh-ladakh-tour",
    category: ["domestic", "adventure"]
  },
  {
    title: "Golden Triangle",
    seoTitle: "5-Day Golden Triangle Tour - Delhi Agra Jaipur with Taj Mahal & Red Fort - Heritage India",
    description: "Classic India heritage tour covering Delhi, Agra, and Jaipur with UNESCO World Heritage sites",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    duration: "5 Days",
    price: "Starting from ₹18,000*",
    highlights: ["Taj Mahal sunrise visit", "Amber Fort elephant ride", "Red Fort & India Gate"],
    slug: "/packages/golden-triangle",
    category: ["domestic"]
  },
  {
    title: "Rajasthan Royal",
    seoTitle: "12-Day Royal Rajasthan Tour with Palace Hotels & Desert Safari - Jaipur Udaipur Jodhpur Jaisalmer",
    description: "Explore the royal heritage of Rajasthan with palace hotels and desert camping",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3",
    duration: "12 Days",
    price: "Starting from ₹30,000*",
    highlights: ["Heritage palace hotels", "Thar desert safari", "Cultural folk shows"],
    slug: "/packages/rajasthan-royal",
    category: ["domestic", "premium"]
  },
  {
    title: "Kerala Backwaters",
    seoTitle: "6-Day Kerala Backwaters Tour with Houseboat Stay & Munnar Hill Station - God's Own Country",
    description: "Discover Kerala's serene backwaters and lush hill stations with traditional houseboat experience",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3",
    duration: "6 Days",
    price: "Starting from ₹20,000*",
    highlights: ["Alleppey houseboat cruise", "Munnar tea gardens", "Kochi heritage walk"],
    slug: "/packages/kerala-backwaters",
    category: ["domestic", "honeymoon"]
  },
  {
    title: "Goa Beach Holiday",
    seoTitle: "5-Day Goa Beach Holiday with Water Sports & Portuguese Heritage - North & South Goa",
    description: "Perfect beach vacation with water sports, nightlife, and Portuguese colonial heritage",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
    duration: "5 Days",
    price: "Starting from ₹15,000*",
    highlights: ["Beach water sports", "Portuguese churches", "Spice plantation tour"],
    slug: "/packages/goa-beach-holiday",
    category: ["domestic"]
  },
  {
    title: "Himachal Hill Stations",
    seoTitle: "8-Day Himachal Pradesh Tour - Shimla Manali Dharamshala with Adventure Activities",
    description: "Explore the beautiful hill stations of Himachal with adventure activities and scenic beauty",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    duration: "8 Days",
    price: "Starting from ₹24,000*",
    highlights: ["Rohtang Pass adventure", "Dharamshala monasteries", "Shimla toy train ride"],
    slug: "/packages/himachal-hill-stations",
    category: ["domestic", "adventure"]
  }
];

const internationalPackages = [
  {
    title: "Turkey Adventure",
    seoTitle: "9-Day Turkey Adventure - Istanbul Cappadocia Pamukkale with Hot Air Balloon & Turkish Riviera",
    description: "Explore Istanbul's historic sites, Cappadocia's fairy chimneys, and Turkish Riviera beaches",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop",
    duration: "9 Days",
    price: "Starting from ₹75,000*",
    highlights: ["Cappadocia hot air balloon", "Hagia Sophia & Blue Mosque", "Pamukkale thermal pools"],
    slug: "/packages/turkey-adventure",
    category: ["international", "adventure"]
  },
  {
    title: "Dubai Delights",
    seoTitle: "6-Day Dubai Luxury Package with Burj Khalifa Desert Safari & Abu Dhabi - UAE Tour",
    description: "Luxury shopping, desert adventures, and modern architecture in the UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
    duration: "6 Days",
    price: "Starting from ₹45,000*",
    highlights: ["Burj Khalifa 124th floor", "Desert safari with BBQ", "Dubai Mall & Gold Souk"],
    slug: "/packages/dubai-delights",
    category: ["international", "premium"]
  },
  {
    title: "Thailand Tropical",
    seoTitle: "7-Day Thailand Beach Paradise - Bangkok Phuket Phi Phi Islands with Thai Massage & Temples",
    description: "Tropical paradise with pristine beaches, ancient temples, and authentic Thai experiences",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop",
    duration: "7 Days",
    price: "Starting from ₹38,000*",
    highlights: ["Phi Phi Islands speedboat", "Bangkok temple tour", "Thai massage & cuisine"],
    slug: "/packages/thailand-tropical",
    category: ["international"]
  },
  {
    title: "Singapore Malaysia",
    seoTitle: "6-Day Singapore Malaysia Tour with Universal Studios Genting Highlands & Kuala Lumpur",
    description: "Modern cities, world-class theme parks, and cultural diversity across two countries",
    image: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=300&fit=crop",
    duration: "6 Days",
    price: "Starting from ₹42,000*",
    highlights: ["Universal Studios Singapore", "Genting Highlands casino", "Petronas Twin Towers"],
    slug: "/packages/singapore-malaysia",
    category: ["international"]
  },
  {
    title: "Bali Paradise",
    seoTitle: "8-Day Bali Indonesia Tour with Temples Beaches Cultural Shows & Ubud Rice Terraces",
    description: "Island paradise with ancient temples, pristine beaches, and rich Balinese culture",
    image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop",
    duration: "8 Days",
    price: "Starting from ₹48,000*",
    highlights: ["Tanah Lot temple sunset", "Ubud rice terraces", "Kecak fire dance show"],
    slug: "/packages/bali-paradise",
    category: ["international", "honeymoon"]
  },
  {
    title: "Mauritius Bliss",
    seoTitle: "7-Day Mauritius Honeymoon Package with Beach Resorts Water Sports & Ile aux Cerfs",
    description: "Perfect honeymoon destination with pristine beaches and luxury resorts",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
    duration: "7 Days",
    price: "Starting from ₹65,000*",
    highlights: ["Ile aux Cerfs island", "Underwater sea walk", "Romantic beach dinners"],
    slug: "/packages/mauritius-bliss",
    category: ["international", "honeymoon", "premium"]
  },
  {
    title: "Seychelles Escape",
    seoTitle: "6-Day Seychelles Luxury Beach Resort Package with Island Hopping & Praslin Vallee de Mai",
    description: "Luxury beach escape in the Indian Ocean with pristine nature reserves",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop",
    duration: "6 Days",
    price: "Starting from ₹85,000*",
    highlights: ["Praslin Vallee de Mai", "La Digue island cycling", "Anse Source d'Argent beach"],
    slug: "/packages/seychelles-escape",
    category: ["international", "honeymoon", "premium"]
  },
  {
    title: "Grand Europe Tour",
    seoTitle: "15-Day Grand Europe Tour - Paris Rome Switzerland Amsterdam London with Luxury Accommodations",
    description: "Luxury European adventure covering Paris, Rome, Switzerland, Amsterdam & London with premium accommodations",
    image: "https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    duration: "15 Days",
    price: "Starting from ₹2,25,000*",
    highlights: ["5-star luxury hotels", "High-speed train experiences", "Swiss Alps & Jungfraujoch", "Professional local guides"],
    slug: "/packages/europe-grand-tour",
    category: ["international", "premium"]
  },
  {
    title: "Europe Highlights",
    seoTitle: "12-Day Europe Highlights Tour - France Switzerland Italy Vatican City with Eiffel Tower & Swiss Alps",
    description: "Essential European experience covering France, Switzerland, Italy, and Vatican City with premium accommodations",
    image: "https://images.unsplash.com/photo-1471623432079-b009d30b6729?q=80&w=2070&auto=format&fit=crop",
    duration: "12 Days",
    price: "Starting from ₹1,85,000*",
    highlights: ["Eiffel Tower & Seine Cruise", "Swiss Alps & Mount Titlis", "Venice Gondola Ride", "Colosseum & Vatican City"],
    slug: "/packages/europe-highlights",
    category: ["international", "premium"]
  },
  {
    title: "Switzerland & Croatia Discovery",
    seoTitle: "10-Day Switzerland Croatia Tour - Alpine Lakes to Adriatic Coast with Mount Titlis & Plitvice Lakes",
    description: "Alpine lakes to Adriatic coast journey featuring Swiss Alps, Croatian islands, and UNESCO World Heritage sites",
    image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=2006&auto=format&fit=crop",
    duration: "10 Days",
    price: "Starting from ₹1,35,000*",
    highlights: ["Mount Titlis cable car", "Plitvice Lakes UNESCO site", "Croatian island hopping", "Traditional Swiss & Croatian cuisine"],
    slug: "/packages/europe-swiss-croatia",
    category: ["international", "premium"]
  },
  {
    title: "Japan Cherry Blossom",
    seoTitle: "8-Day Japan Cherry Blossom Tour - Tokyo Kyoto Osaka with Mount Fuji & Traditional Temples",
    description: "Experience Japan's cherry blossom season with traditional culture and modern cities",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
    duration: "8 Days",
    price: "Starting from ₹95,000*",
    highlights: ["Mount Fuji day trip", "Kyoto golden pavilion", "Tokyo cherry blossoms"],
    slug: "/packages/japan-cherry-blossom",
    category: ["international", "premium"]
  }
  ,
  {
    title: "Singapore City Delight",
    seoTitle: "5-Day Singapore Package with Universal Studios, Night Safari, Sentosa (PVT)",
    description: "Ibis Novena stay, Universal Studios, Night Safari, Sentosa Cable Car, Wings of Time, Gardens by the Bay with private transfers.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop",
    duration: "5 Days",
    price: "Starting from ₹59,999*",
    highlights: ["Universal Studios", "Night Safari", "Sentosa Cable Car", "Gardens by the Bay"],
    slug: "/packages/singapore-city-delight",
    category: ["international", "premium"]
  },
  {
    title: "Georgia Adventure",
    seoTitle: "9-Day Georgia & Batumi Adventure - Tbilisi Kazbegi Batumi with Caucasus Mountains & Black Sea",
    description: "Experience the best of Georgia from the high Caucasus mountains to the beautiful Black Sea coast in Batumi.",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop",
    duration: "9 Days",
    price: "Starting from ₹82,000*",
    highlights: ["Tbilisi Old Town", "Kazbegi mountain 4x4", "Batumi Black Sea coast", "Kakheti Wine Region"],
    slug: "/packages/georgia-adventure",
    category: ["international", "adventure"]
  }
];

// Combined packages array
const allPackages = [...domesticPackages, ...internationalPackages];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dbPrices, setDbPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchDbPrices = async () => {
      try {
        const res = await fetch('/php-backend/packages.php');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            const priceMap: Record<string, number> = {};
            data.forEach((pkg: any) => {
              if (pkg.slug && pkg.is_active) {
                priceMap[pkg.slug] = Number(pkg.price);
              }
            });
            setDbPrices(priceMap);
          }
        }
      } catch (err) {
        console.error('Error fetching database prices:', err);
      }
    };
    fetchDbPrices();
  }, []);

  const resolvedAllPackages = useMemo(() => {
    return allPackages.map(pkg => {
      const cleanSlug = pkg.slug?.replace(/^\/packages\//, '');
      const dbPrice = dbPrices[cleanSlug || ''];
      if (dbPrice) {
        return {
          ...pkg,
          price: `Starting From ₹${dbPrice.toLocaleString('en-IN')} Per Person`
        };
      }
      // Fallback formatting if DB doesn't have it yet
      const numericString = pkg.price.replace(/[^0-9]/g, '');
      const numericPrice = Number(numericString) || 0;
      return {
        ...pkg,
        price: `Starting From ₹${numericPrice.toLocaleString('en-IN')} Per Person`
      };
    });
  }, [dbPrices]);

  // Get category from URL parameters
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && ['domestic', 'international', 'premium', 'adventure', 'honeymoon'].includes(category)) {
      setActiveCategory(category);
    } else {
      setActiveCategory('all');
    }
  }, [searchParams]);

  // Filter packages based on active category
  const getFilteredPackages = () => {
    if (activeCategory === 'all') {
      return resolvedAllPackages;
    }
    return resolvedAllPackages.filter(pkg => 
      pkg.category && pkg.category.includes(activeCategory)
    );
  };

  const filteredPackages = getFilteredPackages();

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const categories = [
    { id: 'all', label: 'All Packages', count: resolvedAllPackages.length },
    { id: 'domestic', label: 'Domestic Tours', count: resolvedAllPackages.filter(pkg => pkg.category?.includes('domestic')).length },
    { id: 'international', label: 'International Tours', count: resolvedAllPackages.filter(pkg => pkg.category?.includes('international')).length },
    { id: 'premium', label: 'Premium Travel Packages', count: resolvedAllPackages.filter(pkg => pkg.category?.includes('premium')).length },
    { id: 'honeymoon', label: 'Honeymoon Packages', count: resolvedAllPackages.filter(pkg => pkg.category?.includes('honeymoon')).length },
    { id: 'adventure', label: 'Adventure Tours', count: resolvedAllPackages.filter(pkg => pkg.category?.includes('adventure')).length },
  ];

  const baseUrl = config.baseUrl;
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: 'Home', item: `${baseUrl}/` },
    { name: 'Tour Packages', item: `${baseUrl}/products` },
  ]);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: resolvedAllPackages.map((pkg, index) => {
      const priceMatch = pkg.price.match(/[\d,]+/);
      const price = priceMatch ? priceMatch[0].replace(/,/g, '') : '';
      
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: pkg.title,
          description: pkg.description,
          url: pkg.slug ? `${baseUrl}${pkg.slug}` : `${baseUrl}/enquire-now`,
          image: pkg.image,
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: price,
            availability: "https://schema.org/InStock",
            url: pkg.slug ? `${baseUrl}${pkg.slug}` : `${baseUrl}/enquire-now`,
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "IN",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 30,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn"
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: 0,
                currency: "INR"
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "IN"
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 1,
                  unitCode: "d"
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 1,
                  unitCode: "d"
                }
              }
            }
          }
        }
      };
    })
  };

  type PackageCardData = {
    title: string;
    seoTitle?: string;
    description?: string;
    image: string;
    duration: string;
    price: string;
    highlights: string[];
    slug?: string;
  };

  const PackageCard = memo(({ pkg }: { pkg: PackageCardData }) => {
    const highlightsList = useMemo(() => 
      pkg.highlights.slice(0, 3).map((highlight: string, index: number) => (
        <li key={index} className="flex items-start">
          <span className="w-1.5 h-1.5 bg-gradient-warm rounded-full mr-2 mt-1.5 flex-shrink-0 shadow-glow"></span>
          <span className="line-clamp-1">{highlight}</span>
        </li>
      )), [pkg.highlights]
    );

    return (
      <div className="glass-card shadow-glass hover:shadow-glass-lg overflow-hidden hover:scale-105 transition-all duration-300 interactive border border-white/20">
        <div className="relative overflow-hidden">
          <OptimizedImage 
            src={pkg.image} 
            alt={pkg.seoTitle || pkg.title}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
            width={400}
            height={192}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 line-clamp-2">{pkg.title}</h3>
            <span className="text-sm text-blue-600 font-medium ml-2 whitespace-nowrap glass-subtle px-2 py-1 rounded-lg shadow-glass">{pkg.duration}</span>
          </div>
          <p className="text-sm lg:text-base text-gray-600 mb-3 line-clamp-2">{pkg.seoTitle || pkg.description}</p>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">Highlights:</h4>
            <ul className="text-xs lg:text-sm text-gray-600 space-y-1">
              {highlightsList}
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-lg font-bold text-gradient-sunset">{pkg.price}</span>
            <div className="flex gap-2 w-full sm:w-auto">
              {pkg.slug ? (
                <Button asChild size="sm" className="flex-1 sm:flex-none bg-gradient-warm hover:bg-gradient-accent shadow-glow-warm hover:shadow-glow-accent transition-all">
                  <Link to={pkg.slug}>View Package</Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="flex-1 sm:flex-none bg-gradient-warm hover:bg-gradient-accent shadow-glow-warm hover:shadow-glow-accent transition-all">
                  <Link to="/enquire-now">Enquire Now</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <Layout>
      <Helmet>
        <title>Premium Tour Packages — Ghumo Firoo Travels</title>
        <meta name="description" content="Explore premium travel packages: Rann Utsav (Evoke partner), Kashmir, Ladakh, Kerala, Dubai, Bali & Europe. Book custom trips with Ghumo Firoo." />
        <meta name="keywords" content="Ghumo Firoo Travels, Ghumofiroo, Ghumo Firo, Ghumo Phiro, Ghumophiro, travel agency Delhi, Delhi travel agent, tour operator Delhi, travel services New Delhi, Rann Utsav Gujarat, Gujarat Tourism, Premium Travel Packages, Tent City, White Desert, Evoke Experiences, Domestic Tours, International Tours, Char Dham Yatra, Kashmir Paradise, Leh Ladakh Adventure, Kerala Backwaters, Dubai Tours, Bali Packages, Europe Tours, customized travel packages, group tours Delhi, affordable tour packages, best travel agency Delhi, luxury travel packages, honeymoon packages, family tour packages, adventure tours, pilgrimage tours, international tour operator, domestic tour packages, travel agency near me, ghumophirotravel competitor, ghumophiro alternative, best travel agency like ghumo firoo, customized tours from Delhi, premium travel services Delhi" />
        <link rel="canonical" href="https://ghumofiroo.com/products" />
        <link rel="preload" as="image" href="/Kutch-Rann-Utsav-2023-2024.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Premium Tour Packages — Ghumo Firoo Travels" />
        <meta property="og:description" content="Explore premium travel packages including Rann Utsav Gujarat with Evoke partnership, Kashmir, Ladakh, Kerala, Dubai, Bali, Europe." />
        <meta property="og:url" content="https://ghumofiroo.com/products" />
        <meta property="og:image" content="/Kutch-Rann-Utsav-2023-2024.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Premium Tour Packages — Ghumo Firoo Travels" />
        <meta name="twitter:description" content="Explore premium travel packages including Rann Utsav Gujarat with Evoke partnership and more destinations worldwide." />
      </Helmet>
      <JsonLd json={breadcrumbs} />
      <JsonLd json={itemList} />
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <OptimizedImage
            src="/Kutch-Rann-Utsav-2023-2024.jpg"
            alt="Rann Utsav Gujarat White Desert Festival"
            className="absolute inset-0"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Premium Travel Packages</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Embark on extraordinary journeys with our curated collection of premium travel experiences, 
            designed for the discerning traveler.
          </p>
        </div>
      </section>

      {/* Premium Travel Packages Section */}
      <section className="py-16 bg-gradient-to-br from-accent/5 to-secondary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Premium Travel Packages
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Embark on extraordinary journeys with our curated collection of premium travel experiences, 
              designed for the discerning traveler.
            </p>
          </div>
          
          {/* Featured Rann Utsav Package */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto">
                <img
                   src="/Kutch-Rann-Utsav-2023-2024.jpg"
                   alt="Rann Utsav Gujarat White Desert Festival"
                   className="w-full h-full object-cover"
                 />
                <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured Package
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                  Partnership with Evoke
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-accent font-semibold">4 Days</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">Kutch, Gujarat</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Rann Utsav Gujarat
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Experience the magical White Desert festival with luxury Tent City accommodation, 
                  authentic Gujarati culture, and breathtaking desert landscapes. Our exclusive 
                  partnership with Evoke Experiences ensures premium service and authentic experiences.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-gray-700">Luxury Tent City accommodation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-gray-700">Cultural performances & folk dances</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-gray-700">White Desert sunrise & sunset experiences</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-gray-700">Partnership with Evoke Experiences</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl font-bold text-accent">Starting from ₹{(dbPrices['rann-utsav'] || 18500).toLocaleString('en-IN')}*</div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                  <div className="flex gap-3">
                    <Button asChild className="bg-accent hover:bg-accent/90">
                      <Link to="/packages/rann-utsav">View Package</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/enquire-now">Enquire Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation and Filtered Packages */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Navigation */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Explore Our Travel Packages
            </h2>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-accent text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-accent/10 hover:text-accent border border-gray-200'
                  }`}
                >
                  {category.label}
                  <span className="ml-2 text-xs opacity-75">({category.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {pkg.duration}
                  </div>
                  {pkg.category?.includes('premium') && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Premium
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
                  <div className="space-y-2 mb-4">
                    {pkg.highlights.slice(0, 3).map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                        <span className="text-sm text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-accent">{pkg.price}</div>
                      <div className="text-xs text-gray-500">per person</div>
                    </div>
                    <Button asChild size="sm" className="bg-accent hover:bg-accent/90">
                      <Link to={pkg.slug}>View Package</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No packages found for the selected category.</div>
              <Button 
                onClick={() => handleCategoryChange('all')}
                className="mt-4 bg-accent hover:bg-accent/90"
              >
                View All Packages
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Custom Packages */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Custom Tour Packages</h2>
          <p className="text-lg text-gray-600 mb-8">
            Don't see what you're looking for? We create personalized itineraries tailored to your 
            preferences, budget, and travel style. From honeymoon packages to adventure tours, 
            we can craft the perfect journey just for you.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
            <Link to="/custom-tour-packages" onClick={() => { try { pushEvent('custom_tour_click', { source: 'products_page' }); } catch (error) { /* ignore analytics failure */ } }}>Plan My Custom Trip</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
