import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Star, ShieldCheck, Hotel, Car, ShieldAlert, Utensils } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EnhancedRouteMap from '@/components/packages/EnhancedRouteMap';
import FlightRouteMap from '@/components/packages/FlightRouteMap';
import PackageSidebar from '@/components/packages/PackageSidebar';
import ModernPackageHero from '@/components/packages/ModernPackageHero';
import PackageSEO from '@/components/seo/PackageSEO';
import FAQSection from '@/components/sections/FAQSection';
import { buildTouristTripJsonLd } from '@/components/seo/JsonLd';
import NotFound from '@/pages/NotFound';
import { StickyCTA } from '@/components/common/StickyCTA';
import { HotelList } from '@/components/shared/HotelList';
import { AttractionCard } from '@/components/packages/AttractionCard';
import PackageVariantSelector, { PackageVariant } from '@/components/packages/PackageVariantSelector';
import VariantDetails from '@/components/packages/VariantDetails';
import PremiumTimeline, { cleanMojibakeText } from '@/components/packages/PremiumTimeline';
import { getDestinationFaqs } from '@/data/destinationFaqs';
import { itineraryService } from '@/services/itineraryService';

interface DynamicPackageDetailProps {
  slug?: string;
  fallbackData?: any;
  fallback?: React.ReactNode;
}

import { STATIC_PACKAGE_REGISTRY } from '@/data/packages/staticRegistry';

const DynamicPackageDetail: React.FC<DynamicPackageDetailProps> = ({ slug: propSlug, fallbackData, fallback }) => {
  const params = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVariantId, setActiveVariantId] = useState<string>('');
  const currentSlug = propSlug || params.slug || window.location.pathname.split('/').pop() || '';
  const isEvokeSlug = currentSlug === 'rann-utsav-2d1n' || currentSlug === 'rann-utsav-3d2n' || currentSlug.includes('tent-city') || currentSlug.includes('rann-utsav-tent');
  const [passengerCount, setPassengerCount] = useState<number>(2);
  const [selectedCabId, setSelectedCabId] = useState<string>('sedan');
  const [dhamAdultsCount, setDhamAdultsCount] = useState<number>(2);
  const [dhamRoomsCount, setDhamRoomsCount] = useState<number>(1);
  const [selectedMealPlan, setSelectedMealPlan] = useState<string>('cp');

  // Evoke 2D/1N Dedicated State & Configuration
  const isEvoke2D1N = currentSlug === 'rann-utsav-2d1n';
  const [selectedEvokeCategory, setSelectedEvokeCategory] = useState<string>('deluxe_ac');
  const [evokeTravelDate, setEvokeTravelDate] = useState<string>('2026-11-15');

  const EVOKE_ACCOMMODATION_CATEGORIES: Record<string, {
    id: string;
    name: string;
    badge: string;
    delta: number;
    icon: string;
    sub: string;
    description: string;
    popular?: boolean;
  }> = {
    deluxe_ac: {
      id: 'deluxe_ac',
      name: 'Deluxe AC Swiss Cottages',
      badge: 'DEFAULT INCLUDED (₹12,500)',
      delta: 0,
      icon: '⛺',
      sub: 'Twin / Double Bed • Air Conditioned • Attached Washroom',
      description: 'Spacious cottage with twin/double beds, attached bath with geyser, and Kutchi aesthetic. Base included stay.'
    },
    ac_premium: {
      id: 'ac_premium',
      name: 'Premium AC Tent',
      badge: '+₹1,000 / PAX UPGRADE',
      delta: 1000,
      icon: '🎪',
      popular: true,
      sub: 'Luxury Fabric Tent • Upgraded Plush Interiors',
      description: 'Upgraded luxury fabric tent featuring plush linens, cozy seating, tea/coffee maker, and modern bathroom amenities.'
    },
    super_premium: {
      id: 'super_premium',
      name: 'Super Premium AC Tent',
      badge: '+₹2,000 / PAX UPGRADE',
      delta: 2000,
      icon: '✨',
      sub: 'Ultra Luxury Tent • Prime Central Zone Location',
      description: 'Prime central location near dining hall & cultural arena. Extra spacious living foyer and executive amenities.'
    },
    rajwadi: {
      id: 'rajwadi',
      name: 'Rajwadi Suite',
      badge: '+₹7,000 / PAX ROYAL UPGRADE',
      delta: 7000,
      icon: '👑',
      sub: 'Royal Heritage 2-Pax Suite • Private Lounge',
      description: 'Opulent royal heritage suite with dedicated living room, antique furniture, VIP check-in, and club lounge access.'
    },
    darbari: {
      id: 'darbari',
      name: 'Darbari Royal Suite',
      badge: '+₹7,000 / PAX PRESIDENTIAL UPGRADE',
      delta: 7000,
      icon: '🏰',
      sub: 'Presidential Suite (Up to 4 Pax) • Dedicated Butler',
      description: 'Grand royal presidential suite with master lounge, dining foyer, private sit-out, luxury bathrobes, and butler service.'
    },
    non_ac: {
      id: 'non_ac',
      name: 'Non AC Swiss Cottages',
      badge: '-₹2,000 / PAX DISCOUNT',
      delta: -2000,
      icon: '🛖',
      sub: 'Traditional Desert Cottage • Attached Bath',
      description: 'Classic desert-style tent with comfortable bedding and attached bathroom. Recommended for chilly winter months (Dec-Jan).'
    }
  };

  const getEvokeSeasonInfo = (inStr: string) => {
    if (!inStr) return { tier: 1, surcharge: 0, label: 'Season 1: Regular Base Tariff (₹0)', categoryName: 'Regular Dates' };
    const dateObj = new Date(inStr);
    if (isNaN(dateObj.getTime())) return { tier: 1, surcharge: 0, label: 'Season 1: Regular Base Tariff (₹0)', categoryName: 'Regular Dates' };

    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    let tier: 1 | 2 | 3 = 1;
    let categoryName = 'Regular Dates';

    if (month === 11) {
      if (day >= 8 && day <= 14) {
        tier = 2;
        categoryName = 'Diwali Week Special';
      } else if (day >= 22 && day <= 25) {
        tier = 2;
        categoryName = 'November Full Moon (Purnima)';
      }
    } else if (month === 12) {
      if (day >= 20) {
        tier = 3;
        categoryName = 'Christmas, New Year & Dec Full Moon Peak';
      } else {
        tier = 2;
        categoryName = 'December Peak Dates';
      }
    } else if (month === 1) {
      if (day >= 1 && day <= 3) {
        tier = 3;
        categoryName = 'New Year Peak Weekend';
      } else if (day >= 20 && day <= 23) {
        tier = 3;
        categoryName = 'January Full Moon (Purnima) Peak';
      } else {
        tier = 2;
        categoryName = 'January Winter Festival Season';
      }
    } else if (month === 2) {
      if (day >= 18 && day <= 21) {
        tier = 2;
        categoryName = 'February Full Moon (Purnima)';
      }
    } else if (month === 3) {
      tier = 1;
      categoryName = 'Season Closing Regular Dates';
    }

    const surcharge = tier === 3 ? 4000 : tier === 2 ? 2000 : 0;
    const label = tier === 3
      ? `Season 3 Peak: ${categoryName} (+₹4,000/pax)`
      : tier === 2
      ? `Season 2: ${categoryName} (+₹2,000/pax)`
      : `Season 1: Regular Dates (₹0 Surcharge)`;

    return { tier, surcharge, label, categoryName };
  };

  useEffect(() => {
    if (passengerCount >= 1 && passengerCount <= 3) {
      if (selectedCabId !== 'sedan') {
        setSelectedCabId('sedan');
      }
    } else if (passengerCount === 4) {
      if (selectedCabId === 'tempo') {
        setSelectedCabId('sedan');
      }
    } else if (passengerCount >= 5 && passengerCount <= 6) {
      if (selectedCabId === 'sedan' || selectedCabId === 'tempo') {
        setSelectedCabId('suv_ertiga');
      }
    } else if (passengerCount >= 7) {
      if (selectedCabId !== 'tempo') {
        setSelectedCabId('tempo');
      }
    }
  }, [passengerCount, selectedCabId]);

  const getInitialVariantId = (variants: any[], slug: string) => {
    if (!variants || variants.length === 0) return '';
    const s = (slug || '').toLowerCase();
    let matched: any = null;
    if (s.includes('2d1n') || s.includes('1n2d') || s.includes('1-night') || s.includes('2-day')) {
      matched = variants.find((v: any) => 
        (v.id && (v.id === '1n2d' || v.id.includes('1n'))) || 
        (v.variant_key && (v.variant_key === '1n2d' || v.variant_key.includes('1n'))) || 
        (v.label && (v.label.includes('1N') || v.label.includes('2D'))) || 
        (v.nights === 1 && v.days === 2)
      );
    } else if (s.includes('3d2n') || s.includes('2n3d') || s.includes('2-night') || s.includes('3-day')) {
      matched = variants.find((v: any) => 
        (v.id && (v.id === '2n3d' || v.id.includes('2n'))) || 
        (v.variant_key && (v.variant_key === '2n3d' || v.variant_key.includes('2n'))) || 
        (v.label && (v.label.includes('2N') || v.label.includes('3D'))) || 
        (v.nights === 2 && v.days === 3)
      );
    } else if (s.includes('4d3n') || s.includes('3n4d') || s.includes('3-night') || s.includes('4-day')) {
      matched = variants.find((v: any) => 
        (v.id && (v.id === '3n4d' || v.id.includes('3n'))) || 
        (v.variant_key && (v.variant_key === '3n4d' || v.variant_key.includes('3n'))) || 
        (v.label && (v.label.includes('3N') || v.label.includes('4D'))) || 
        (v.nights === 3 && v.days === 4)
      );
    } else if (s.includes('5d4n') || s.includes('4n5d') || s.includes('4-night') || s.includes('5-day')) {
      matched = variants.find((v: any) => 
        (v.id && (v.id === '4n5d' || v.id.includes('4n'))) || 
        (v.variant_key && (v.variant_key === '4n5d' || v.variant_key.includes('4n'))) || 
        (v.label && (v.label.includes('4N') || v.label.includes('5D'))) || 
        (v.nights === 4 && v.days === 5)
      );
    } else if (s.includes('day-trip') || s.includes('daytrip')) {
      matched = variants.find((v: any) => 
        (v.id && v.id.includes('day')) || 
        (v.variant_key && v.variant_key.includes('day')) || 
        (v.label && v.label.toLowerCase().includes('day')) || 
        v.nights === 0
      );
    }
    
    // Default to matched variant, or fallback to first overnight / popular variant
    const chosen = matched || variants.find((v: any) => v.nights > 0) || variants[0];
    return String(chosen.id || chosen.variant_key || chosen.variantKey || chosen.label || '');
  };

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        if (!currentSlug) return;

        // 1. Check local catalog cache for CRM package updates
        const localCatalogStr = localStorage.getItem('crm_package_catalog');
        let localPkg: any = null;
        if (localCatalogStr) {
          try {
            const localCatalog = JSON.parse(localCatalogStr);
            if (Array.isArray(localCatalog)) {
              localPkg = localCatalog.find((p: any) => p.slug === currentSlug || p.id === currentSlug);
            }
          } catch (e) {
            console.error('Error parsing local package catalog cache:', e);
          }
        }

        // 2. Prioritize Live Database API Fetch
        const apiBase = import.meta.env.VITE_API_BASE_URL || '/php-backend';
        const endpoint = `${apiBase}/packages.php?slug=${encodeURIComponent(currentSlug)}&include_variants=1`;
        
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const data = await res.json();
            const apiPkg = Array.isArray(data) ? data[0] : (data.package || (data && (data.name || data.title) ? data : null));
            if (apiPkg && (apiPkg.name || apiPkg.title) && (apiPkg.is_active !== false)) {
              const staticRegistryPkg = STATIC_PACKAGE_REGISTRY[currentSlug];
              const finalPkg = {
                ...(staticRegistryPkg || {}),
                ...apiPkg,
                ...(localPkg && Number(localPkg.price) > 3000 ? localPkg : {})
              };
              setPkg(finalPkg);
              if (finalPkg.variants && finalPkg.variants.length > 0) {
                setActiveVariantId(getInitialVariantId(finalPkg.variants, currentSlug));
              }
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Live API fetch unavailable, falling back to static registry:', e);
        }

        // 3. Fallback to Local Static Registry if API has no record or is offline
        const staticRegistryPkg = STATIC_PACKAGE_REGISTRY[currentSlug];

        if (staticRegistryPkg) {
          const mergedPkg = {
            ...staticRegistryPkg,
            ...(localPkg && Number(localPkg.price) > 3000 ? localPkg : {})
          };
          setPkg(mergedPkg);
          if (mergedPkg.variants && mergedPkg.variants.length > 0) {
            setActiveVariantId(getInitialVariantId(mergedPkg.variants, currentSlug));
          }
          setLoading(false);
          return;
        }

        if (localPkg) {
          setPkg(localPkg);
          if (localPkg.variants && localPkg.variants.length > 0) {
            setActiveVariantId(getInitialVariantId(localPkg.variants, currentSlug));
          }
        } else {
          // Fuzzy Slug Matcher to guarantee non-empty fallback for any slug format
          const normSlug = currentSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matchKey = Object.keys(STATIC_PACKAGE_REGISTRY).find(k => {
            const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            return normK === normSlug || normK.includes(normSlug) || normSlug.includes(normK);
          });

          if (matchKey && STATIC_PACKAGE_REGISTRY[matchKey]) {
            setPkg(STATIC_PACKAGE_REGISTRY[matchKey]);
          } else if (normSlug.includes('chardham') || normSlug.includes('dham')) {
            setPkg(STATIC_PACKAGE_REGISTRY['char-dham-yatra-from-haridwar'] || STATIC_PACKAGE_REGISTRY['char-dham-yatra-from-delhi']);
          } else if (normSlug.includes('dodham')) {
            setPkg(STATIC_PACKAGE_REGISTRY['do-dham-yatra']);
          } else if (normSlug.includes('kedarnath')) {
            setPkg(STATIC_PACKAGE_REGISTRY['kedarnath-yatra']);
          } else if (normSlug.includes('georgia')) {
            setPkg(STATIC_PACKAGE_REGISTRY['georgia-adventure'] || STATIC_PACKAGE_REGISTRY['georgia-6d-5n']);
          } else if (normSlug.includes('kashmir')) {
            setPkg(STATIC_PACKAGE_REGISTRY['classic-kashmir-5n6d'] || STATIC_PACKAGE_REGISTRY['grand-kashmir-7n8d']);
          } else if (normSlug.includes('kerala')) {
            setPkg(STATIC_PACKAGE_REGISTRY['kerala-backwaters']);
          } else if (normSlug.includes('singapore')) {
            setPkg(STATIC_PACKAGE_REGISTRY['singapore-5d-4n'] || STATIC_PACKAGE_REGISTRY['singapore-4d-3n']);
          } else if (normSlug.includes('rann') || normSlug.includes('kutch')) {
            setPkg(STATIC_PACKAGE_REGISTRY['rann-utsav-3d2n'] || STATIC_PACKAGE_REGISTRY['rann-utsav-4d3n']);
          } else if (fallbackData) {
            setPkg(fallbackData);
            if (fallbackData.variants && fallbackData.variants.length > 0) {
              setActiveVariantId(getInitialVariantId(fallbackData.variants, currentSlug));
            }
          }
        }
      } catch (err) {
        console.warn('API fetch failed, utilizing registry/fallback data:', err);
        const localCatalogStr = localStorage.getItem('crm_package_catalog');
        let localPkg: any = null;
        if (localCatalogStr) {
          try {
            const localCatalog = JSON.parse(localCatalogStr);
            if (Array.isArray(localCatalog)) {
              localPkg = localCatalog.find((p: any) => p.slug === currentSlug || p.id === currentSlug);
            }
          } catch (e) {}
        }

        let resolvedPkg = localPkg || STATIC_PACKAGE_REGISTRY[currentSlug] || fallbackData;
        if (resolvedPkg) {
          try {
            const dbItinerary = await itineraryService.getItinerary(currentSlug);
            if (dbItinerary && dbItinerary.length > 0) {
              resolvedPkg = {
                ...resolvedPkg,
                itinerary: dbItinerary.map(d => ({
                  day: d.day_number,
                  title: d.title,
                  description: d.description,
                  activities: d.activities || []
                }))
              };
            }
          } catch (err) {
            console.warn('Itinerary DB load skipped:', err);
          }
          setPkg(resolvedPkg);
          if (resolvedPkg.variants && resolvedPkg.variants.length > 0) {
            setActiveVariantId(getInitialVariantId(resolvedPkg.variants, currentSlug));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [currentSlug, fallbackData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1026]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border border-[#C9A25A]/20" />
            <div className="absolute inset-0 rounded-full border-t-[1.5px] border-[#C9A25A] animate-spin" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A]/70">
            Crafting your journey
          </div>
        </div>
      </div>
    );
  }

  const effectivePkg = pkg || fallbackData;

  if (!effectivePkg) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <NotFound />;
  }

  // Format price for display
  const numericPrice = Number(effectivePkg.price) || 0;
  const formattedPrice = numericPrice.toLocaleString('en-IN');

  const packageDetails = {
    title: cleanMojibakeText(effectivePkg.name || effectivePkg.title),
    duration: cleanMojibakeText(effectivePkg.duration || 'Flexible'),
    price: formattedPrice,
    rating: Number(effectivePkg.rating) || 5.0,
    reviews: effectivePkg.reviews || 0,
    image: effectivePkg.image || '',
    destinations: (effectivePkg.destinations || []).map(cleanMojibakeText),
    highlights: (effectivePkg.highlights || []).map(cleanMojibakeText),
    itinerary: (effectivePkg.itinerary || []).map((it: any) => ({
      ...it,
      title: cleanMojibakeText(it.title || it.day_title || ''),
      description: cleanMojibakeText(it.description || ''),
      activities: (it.activities || []).map(cleanMojibakeText)
    })),
    inclusions: (effectivePkg.inclusions || []).map(cleanMojibakeText),
    exclusions: (effectivePkg.exclusions || []).map(cleanMojibakeText)
  };

  const getDestinationGalleryImages = (pkg: any, primaryImg: string) => {
    // If package has explicit multiple images, use them
    if (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 1) {
      return pkg.images;
    }

    const destStr = ((pkg.destinations || []).join(' ') + ' ' + (pkg.name || pkg.title || '') + ' ' + (pkg.slug || '')).toLowerCase();

    let destGallery: string[] = [];

    if (destStr.includes('georgia') || destStr.includes('tbilisi') || destStr.includes('kazbegi') || destStr.includes('gudauri')) {
      destGallery = [
        "/georgia/kazbegi_caucasus_mountain.jpg",
        "/georgia/gudauri_ananuri_fortress.jpg",
        "/georgia/tbilisi_old_town_narikala.jpg",
        "/georgia/sighnaghi_kakheti_wine.jpg",
        "/georgia/martvili_canyon_okatse.jpg",
        "/georgia/uplistsikhe_cave_city.jpg"
      ];
    } else if (destStr.includes('kashmir') || destStr.includes('srinagar') || destStr.includes('gulmarg') || destStr.includes('pahalgam') || destStr.includes('sonamarg')) {
      destGallery = [
        "/kashmir/gulmarg_gondola.jpg",
        "/kashmir/dal_lake_shikara.jpg",
        "/kashmir/pahalgam_betaab_valley.jpg",
        "/kashmir/sonamarg_thajiwas_glacier.jpg",
        "/kashmir/srinagar_mughal_gardens.jpg",
        "/kashmir/doodhpathri_kashmir.jpg",
        "/kashmir/baisaran_valley_pahalgam.jpg",
        "/kashmir/sinthan_top_kashmir.jpg"
      ];
    } else if (destStr.includes('kerala') || destStr.includes('munnar') || destStr.includes('alleppey') || destStr.includes('thekkady') || destStr.includes('kovalam') || destStr.includes('kochi')) {
      destGallery = [
        "/kerala/alleppey_backwaters_houseboat.jpg",
        "/kerala/munnar_tea_estates.jpg",
        "/kerala/eravikulam_nilgiri_tahr.jpg",
        "/kerala/thekkady_periyar_sanctuary.jpg",
        "/kerala/fort_kochi_chinese_nets.jpg",
        "/kerala/kovalam_lighthouse_beach.jpg",
        "/kerala/jatayu_earth_center.jpg",
        "/kerala/vagamon_pine_forest.jpg"
      ];
    } else if (destStr.includes('singapore') || destStr.includes('sentosa') || destStr.includes('marina bay')) {
      destGallery = [
        "/singapore/gardens_by_the_bay.jpg",
        "/singapore/universal_studios.jpg",
        "/singapore/singapore_flyer.jpg",
        "/singapore/jewel_changi.jpg",
        "/singapore/marina_bay_sands.jpg",
        "/singapore/merlion_park.jpg",
        "/singapore/cable_car_sentosa.jpg",
        "/singapore/wings_of_time_sentosa.jpg",
        "/singapore/haji_lane_heritage.jpg",
        "/singapore/mandai_river_wonders.jpg"
      ];
    } else if (destStr.includes('dham') || destStr.includes('kedarnath') || destStr.includes('badrinath') || destStr.includes('yamunotri') || destStr.includes('gangotri')) {
      destGallery = [
        "/Kedarnath.png",
        "/Badrinath.png",
        "/Gangotri.png",
        "/Yamunotri.png"
      ];
    } else if (destStr.includes('rann') || destStr.includes('kutch') || destStr.includes('dhordo') || destStr.includes('utsav')) {
      destGallery = [
        "/rann_utsav_white_desert.jpg",
        "/rann_utsav_tent_city.jpg",
        "/rann_utsav_kalo_dungar.jpg",
        "/rann_utsav_road_to_heaven.jpg",
        "/Rann-Utsav-Gujarat.png"
      ];
    } else if (destStr.includes('europe') || destStr.includes('paris') || destStr.includes('swiss')) {
      destGallery = [
        "/Europe Image New.png",
        "/Europe Image Neww.png",
        "/Europe Image.png"
      ];
    }

    if (destGallery.length > 0) {
      return primaryImg ? Array.from(new Set([primaryImg, ...destGallery])).filter(Boolean) : destGallery;
    }

    const attractionImgs = (pkg.attractions || []).map((a: any) => typeof a === 'object' ? a.image : '').filter(Boolean);
    const combined = Array.from(new Set([primaryImg, ...attractionImgs, ...(pkg.images || [])])).filter(Boolean);
    return combined.length > 0 ? combined : [primaryImg || '/Europe Image New.png'];
  };

  const imagesSlider = getDestinationGalleryImages(effectivePkg, packageDetails.image);
  const packageType = effectivePkg.package_type || effectivePkg.packageType || 'domestic';
  const bestTime = effectivePkg.best_time || effectivePkg.bestTime || 'October to March';
  const groupSize = effectivePkg.group_size || effectivePkg.groupSize || 'Custom Group';
  const difficulty = effectivePkg.difficulty || 'Easy';
  
  const getDynamicMapLocations = (pkg: any) => {
    if (pkg.map_locations && pkg.map_locations.length > 0) return pkg.map_locations;
    if (pkg.mapLocations && pkg.mapLocations.length > 0) return pkg.mapLocations;

    const destStr = ((pkg.destinations || []).join(' ') + ' ' + (pkg.name || pkg.title || '')).toLowerCase();

    if (destStr.includes('dham') || destStr.includes('kedarnath') || destStr.includes('badrinath') || destStr.includes('haridwar')) {
      return [
        { name: 'Haridwar (Gateway to Gods)', coordinates: [29.9457, 78.1642], description: 'Ganga Aarti & Starting Hub' },
        { name: 'Barkot / Guptkashi Base', coordinates: [30.8100, 78.2100], description: 'Scenic Himalayan Base Camp' },
        { name: 'Kedarnath Temple (3,583m)', coordinates: [30.7346, 79.0669], description: 'Venerated High Altitude Shrine' },
        { name: 'Badrinath Temple (3,300m)', coordinates: [30.7433, 79.4938], description: 'Holy Abode of Lord Vishnu' },
        { name: 'Rishikesh Confluence', coordinates: [30.0869, 78.2676], description: 'Triveni Ghat & Spiritual Ending' }
      ];
    } else if (destStr.includes('kashmir') || destStr.includes('srinagar') || destStr.includes('gulmarg') || destStr.includes('pahalgam')) {
      return [
        { name: 'Srinagar (Dal Lake)', coordinates: [34.0837, 74.7973], description: 'Shikara Ride & Luxury Houseboat Stay' },
        { name: 'Gulmarg (2,650m)', coordinates: [34.0484, 74.3805], description: 'World Highest Gondola Cable Car' },
        { name: 'Pahalgam (Valley of Shepherds)', coordinates: [34.0161, 75.3150], description: 'Betaab Valley & Lidder River Walk' },
        { name: 'Sonamarg (Meadow of Gold)', coordinates: [34.3000, 75.2900], description: 'Thajiwas Glacier & Snow Excursion' }
      ];
    } else if (destStr.includes('himachal') || destStr.includes('manali') || destStr.includes('shimla')) {
      return [
        { name: 'Chandigarh Hub', coordinates: [30.7333, 76.7794], description: 'Pickup & Highway Drive' },
        { name: 'Shimla (Mall Road)', coordinates: [31.1048, 77.1734], description: 'Colonial Heritage & Ridge Walk' },
        { name: 'Manali (Solang Valley)', coordinates: [32.2432, 77.1892], description: 'Adventure Sports & Snow Point' },
        { name: 'Rohtang Pass (3,978m)', coordinates: [32.3716, 77.2466], description: 'High Mountain Pass & Glacier Views' }
      ];
    } else if (destStr.includes('kerala') || destStr.includes('munnar') || destStr.includes('alleppey') || destStr.includes('cochin')) {
      return [
        { name: 'Cochin (Kochi Port)', coordinates: [9.9312, 76.2673], description: 'Chinese Fishing Nets & Fort Kochi' },
        { name: 'Munnar (Tea Gardens)', coordinates: [10.0889, 77.0595], description: 'Eravikulam Park & Spice Plantations' },
        { name: 'Thekkady (Periyar Reserve)', coordinates: [9.6031, 77.1610], description: 'Wild Boating & Spice Farm Tour' },
        { name: 'Alleppey (Backwaters)', coordinates: [9.4981, 76.3388], description: 'Overnight Luxury Houseboat Cruise' }
      ];
    } else if (destStr.includes('rajasthan') || destStr.includes('jaipur') || destStr.includes('jaisalmer') || destStr.includes('udaipur')) {
      return [
        { name: 'Jaipur (Pink City)', coordinates: [26.9124, 75.7873], description: 'Amber Fort & Hawa Mahal Tour' },
        { name: 'Jodhpur (Blue City)', coordinates: [26.2389, 73.0243], description: 'Mehrangarh Fort & Umaid Bhawan' },
        { name: 'Jaisalmer (Golden Fort & Dunes)', coordinates: [26.9157, 70.9083], description: 'Thar Desert Camp & Camel Safari' },
        { name: 'Udaipur (City of Lakes)', coordinates: [24.5854, 73.7125], description: 'Lake Pichola Boating & City Palace' }
      ];
    } else if (destStr.includes('rann') || destStr.includes('kutch') || destStr.includes('bhuj') || destStr.includes('utsav')) {
      return [
        { name: 'Bhuj (Airport / Station)', coordinates: [23.2420, 69.6669], description: 'Pickup & Gateway to Kutch' },
        { name: 'Tent City Dhordo (White Rann)', coordinates: [23.7802, 69.5135], description: 'Luxury Tent City & Salt Desert' },
        { name: 'Kalo Dungar (Black Hill 462m)', coordinates: [23.8643, 69.8702], description: 'Panoramic 360° Indo-Pak View' },
        { name: 'Road to Heaven Highway', coordinates: [23.7500, 70.1000], description: '30km Highway Drive across White Waters' },
        { name: "Dholavira UNESCO Ruins", coordinates: [23.8860, 70.3600], description: '5,000-year Harappan Metropolis' },
        { name: 'Mandvi Beach & Royal Palace', coordinates: [22.8333, 69.3500], description: 'Vijay Vilas Palace & Coastal Beach' }
      ];
    } else {
      const dests = pkg.destinations || [pkg.name || pkg.title || 'Central Hub'];
      return dests.map((d: string, idx: number) => ({
        name: d,
        coordinates: [20 + idx * 2, 75 + idx * 2],
        description: `${d} Key Sightseeing & Experience`
      }));
    }
  };

  const mapLocations = getDynamicMapLocations(effectivePkg);
  const faqs = (effectivePkg.faqs && effectivePkg.faqs.length > 0)
    ? effectivePkg.faqs
    : getDestinationFaqs(effectivePkg.slug || currentSlug || effectivePkg.destination || effectivePkg.name || '');
  const flightRoutes = effectivePkg.flight_routes || effectivePkg.flightRoutes || [];

  const virtualTourData = effectivePkg.virtual_tour && Object.keys(effectivePkg.virtual_tour).length > 0 ? effectivePkg.virtual_tour : {
    destination: packageDetails.destinations[0] || 'Destination',
    tourStops: []
  };

  const quickFacts = (effectivePkg.quick_facts && Object.keys(effectivePkg.quick_facts).length > 0) ? effectivePkg.quick_facts : {
    groupSize: groupSize,
    bestTime: bestTime,
    difficulty: difficulty,
    ageLimit: 'All Ages',
    accommodation: effectivePkg.hotels?.[0]?.name ? (effectivePkg.hotels[0].name.length > 20 ? effectivePkg.hotels[0].name.slice(0, 20) + '...' : effectivePkg.hotels[0].name) : 'Hotels Included',
    meals: effectivePkg.hotels?.[0]?.meal_plan ? (effectivePkg.hotels[0].meal_plan.length > 20 ? effectivePkg.hotels[0].meal_plan.slice(0, 20) + '...' : effectivePkg.hotels[0].meal_plan) : 'All Meals Included',
    transport: effectivePkg.inclusions?.some((i: string) => i.toLowerCase().includes('coach')) ? 'Fixed AC Coach' : 'Transfers Included'
  };

  const baseUrl = window.location.origin;
  const canonicalUrl = `${baseUrl}/packages/${effectivePkg.slug || currentSlug}`;
  const seoDesc = effectivePkg.seo_description || `${packageDetails.duration} tour of ${packageDetails.destinations.join(', ')}. Includes stay, transfers, and activities.`;

  // Map variants if available
  const rawVariants: any[] = effectivePkg.variants || [];
  const mappedVariants: PackageVariant[] = rawVariants.map((v: any) => ({
    id: String(v.id || v.variant_key || v.variantKey || v.label),
    label: v.label,
    nights: Number(v.nights || 0),
    days: Number(v.days || 1),
    tag: v.tag,
    pricePerPerson: Number(v.price_per_person || v.pricePerPerson || 0),
    hotelCategory: v.hotel_category || v.hotelCategory || 'Standard Stay',
    groupSize: v.group_size || v.groupSize,
    inclusions: v.inclusions || [],
    exclusions: v.exclusions || [],
    hotels: (v.hotels || []).map((h: any) => ({
      name: h.hotel_name || h.name || '',
      location: h.location || '',
      stars: Number(h.stars || 3),
      highlight: h.highlight || ''
    })),
    excursions: (v.excursions || []).map((e: any) => ({
      name: e.excursion_name || e.name || '',
      description: e.description || '',
      duration: e.duration || '',
      price: e.price,
      included: e.is_included === 1 || e.included === true
    })),
    itinerary: (v.itinerary || []).map((d: any) => ({
      day: Number(d.day_number || d.day || 1),
      timing: d.timing,
      title: d.title || '',
      description: d.description || '',
      activities: d.activities || [],
      meals: d.meals
    }))
  }));

  const hasVariants = mappedVariants.length > 0;
  const activeVariant = hasVariants
    ? mappedVariants.find(v => v.id === activeVariantId) || mappedVariants[0]
    : null;

  const isEvokePackage = Boolean(
    (effectivePkg.slug && (
      effectivePkg.slug === 'rann-utsav-2d1n' || 
      effectivePkg.slug === 'rann-utsav-3d2n' || 
      effectivePkg.slug.includes('tent-city') || 
      effectivePkg.slug.includes('rann-utsav-tent')
    )) ||
    (effectivePkg.name && (effectivePkg.name.toLowerCase().includes('tent city') || effectivePkg.name.toLowerCase().includes('evoke')))
  );

  const CAB_OPTIONS = [
    {
      id: 'sedan',
      name: 'AC Sedan (Swift Dzire / Toyota Etios)',
      minPax: 1,
      maxPax: 4,
      priceTotal: 0,
      icon: '🚙',
      badge: 'Included in Base Fare',
      description: 'Comfortable private sedan with AC for up to 4 travelers'
    },
    {
      id: 'suv_ertiga',
      name: 'AC SUV (Maruti Ertiga / Triber)',
      minPax: 1,
      maxPax: 6,
      priceTotal: 1800,
      icon: '🚘',
      badge: 'Spacious 6-Seater',
      description: 'Extra legroom and comfortable seating for up to 6 passengers'
    },
    {
      id: 'suv_innova',
      name: 'AC Premium SUV (Toyota Innova Crysta)',
      minPax: 1,
      maxPax: 6,
      priceTotal: 3200,
      icon: '🚐',
      badge: 'Recommended ⭐',
      description: 'Luxury captain seats, superior shock absorption, and luggage space'
    },
    {
      id: 'tempo',
      name: 'AC Luxury Tempo Traveller (12-Seater)',
      minPax: 7,
      maxPax: 12,
      priceTotal: 6500,
      icon: '🚌',
      badge: 'Group Special (7-12 Pax)',
      description: 'Exclusive luxury coach for large family & group journeys'
    }
  ];

  const isDhamPackage = Boolean(
    (effectivePkg.slug && (effectivePkg.slug.includes('dham') || effectivePkg.slug.includes('yatra') || effectivePkg.slug.includes('kedarnath') || effectivePkg.slug.includes('badrinath') || effectivePkg.slug.includes('gangotri') || effectivePkg.slug.includes('yamunotri'))) || 
    (effectivePkg.name && (effectivePkg.name.toLowerCase().includes('dham') || effectivePkg.name.toLowerCase().includes('yatra') || effectivePkg.name.toLowerCase().includes('kedarnath') || effectivePkg.name.toLowerCase().includes('badrinath'))) ||
    (effectivePkg.category && Array.isArray(effectivePkg.category) && effectivePkg.category.some((c: string) => c.toLowerCase().includes('yatra') || c.toLowerCase().includes('dham') || c.toLowerCase().includes('pilgrimage')))
  );

  const calculateAllocatedRooms = (pax: number) => {
    if (pax <= 3) return 1;
    if (pax <= 5) return 2;
    if (pax <= 7) return 3;
    if (pax <= 9) return 4;
    if (pax <= 11) return 5;
    return Math.ceil(pax / 2);
  };

  const activeAdults = isDhamPackage ? dhamAdultsCount : passengerCount;
  const activeRooms = isDhamPackage ? dhamRoomsCount : calculateAllocatedRooms(passengerCount);
  const avgPaxPerRoom = activeAdults / Math.max(1, activeRooms);
  
  let occupancyTypeTitle = "Double Sharing Stay";
  let occupancyTypeDesc = "2 Adults sharing 1 Deluxe Room with attached bathroom.";
  let occupancyPriceModifier = 0;

  if (activeAdults === 1 && activeRooms === 1) {
    occupancyTypeTitle = "Single Room Occupancy";
    occupancyTypeDesc = "Private single room for 1 adult. Includes single supplement fare.";
    occupancyPriceModifier = 3500;
  } else if (activeAdults === 3 && activeRooms === 1) {
    occupancyTypeTitle = "Triple Occupancy (1 Deluxe Room + 1 Extra Bed)";
    occupancyTypeDesc = "3 Adults sharing 1 Room with 1 Extra Rollaway Bed / Mattress in Dham Lodge.";
    occupancyPriceModifier = -1500; // Triple sharing rate discount!
  } else if (activeAdults === 3 && activeRooms === 2) {
    occupancyTypeTitle = "1 Double Room + 1 Private Single Room";
    occupancyTypeDesc = "2 Adults in 1 Double Room + 1 Adult in 1 Private Single Room.";
    occupancyPriceModifier = 1150; // Single supplement adjustment
  } else if (activeAdults === 4 && activeRooms === 1) {
    occupancyTypeTitle = "Quad Occupancy (1 Large Family Quad Room)";
    occupancyTypeDesc = "4 Adults sharing 1 Large Quad Family Suite with 2 Double Beds.";
    occupancyPriceModifier = -2800; // Quad sharing max discount!
  } else if (activeAdults === 4 && activeRooms === 2) {
    occupancyTypeTitle = "2 Double Sharing Rooms";
    occupancyTypeDesc = "Standard 2 Double Rooms (2 Adults per room) across all Dham destination hotels.";
    occupancyPriceModifier = 0; // Standard double fare!
  } else if (avgPaxPerRoom <= 1) {
    occupancyTypeTitle = `${activeRooms} Private Single Room${activeRooms > 1 ? 's' : ''}`;
    occupancyTypeDesc = `Separate private single room allocated per adult yatri.`;
    occupancyPriceModifier = 3500;
  } else if (avgPaxPerRoom > 1 && avgPaxPerRoom <= 2) {
    const extraMattressCount = activeAdults - (activeRooms * 2);
    occupancyTypeTitle = `${activeRooms} Double Sharing Room${activeRooms > 1 ? 's' : ''}${extraMattressCount > 0 ? ` + ${extraMattressCount} Extra Bed` : ''}`;
    occupancyTypeDesc = `Standard 2 Adults per room stay across all Dham destination hotels.`;
    occupancyPriceModifier = extraMattressCount > 0 ? -600 : 0;
  } else if (avgPaxPerRoom > 2 && avgPaxPerRoom <= 3) {
    occupancyTypeTitle = `Triple Sharing Stay (${activeRooms} Room${activeRooms > 1 ? 's' : ''} + Extra Beds)`;
    occupancyTypeDesc = `3 Adults per room sharing with extra mattresses in Dham lodges. Reduced rate!`;
    occupancyPriceModifier = -1500;
  } else if (avgPaxPerRoom > 3) {
    occupancyTypeTitle = `Quad Family Suite Stay (${activeRooms} Quad Room${activeRooms > 1 ? 's' : ''})`;
    occupancyTypeDesc = `4 Adults per room sharing large family quad suites. Maximum group savings!`;
    occupancyPriceModifier = -2800;
  }

  const MEAL_OPTIONS = [
    { id: 'cp', label: 'Breakfast Only (CP)', pricePerPax: 0, icon: '☕' },
    { id: 'map', label: 'Breakfast & Dinner (MAP)', pricePerPax: 1300, icon: '🍱' },
    { id: 'ap', label: 'All Meals (AP Plan)', pricePerPax: 2400, icon: '🍽️' },
    { id: 'ep', label: 'No Meals (Room Only)', pricePerPax: -600, icon: '🏨' }
  ];

  const currentMealOption = MEAL_OPTIONS.find(m => m.id === selectedMealPlan) || MEAL_OPTIONS[0];
  const mealPriceModifier = currentMealOption.pricePerPax;

  const selectedCab = CAB_OPTIONS.find(c => c.id === selectedCabId) || CAB_OPTIONS[0];
  const roomsRequired = activeRooms;
  const cabPerPersonSurcharge = Math.round(selectedCab.priceTotal / Math.max(1, passengerCount));
  const basePricePerPerson = activeVariant ? activeVariant.pricePerPerson : numericPrice;

  const evokeCategoryDelta = isEvoke2D1N ? (EVOKE_ACCOMMODATION_CATEGORIES[selectedEvokeCategory]?.delta ?? 0) : 0;
  const evokeSeasonInfo = isEvoke2D1N ? getEvokeSeasonInfo(evokeTravelDate) : null;
  const evokeSeasonDelta = isEvoke2D1N ? (evokeSeasonInfo?.surcharge ?? 0) : 0;

  const finalPricePerPerson = isEvoke2D1N
    ? Math.max(1000, 12500 + evokeCategoryDelta + evokeSeasonDelta + cabPerPersonSurcharge)
    : Math.max(1000, basePricePerPerson + cabPerPersonSurcharge + (isDhamPackage ? occupancyPriceModifier : 0) + mealPriceModifier);
  const formattedFinalPrice = finalPricePerPerson.toLocaleString('en-IN');

  // Build JSON-LD Structured Data
  const jsonLd = buildTouristTripJsonLd({
    name: packageDetails.title,
    description: seoDesc,
    image: packageDetails.image,
    url: canonicalUrl,
    offer: {
      priceCurrency: 'INR',
      includes: 'Hotels, Breakfast, Transfers, Sightseeing',
      price: String(activeVariant ? activeVariant.pricePerPerson : numericPrice),
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0],
      validThrough: '2026-12-31',
      priceValidUntil: '2026-12-31',
      eligibleQuantity: { value: 20, unitCode: 'C62' },
      acceptedPaymentMethod: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI']
    },
    providerName: 'Ghumo Firoo Travels',
    duration: `P${packageDetails.itinerary.length || 5}D`,
    aggregateRating: {
      ratingValue: packageDetails.rating,
      reviewCount: packageDetails.reviews
    },
    itinerary: packageDetails.itinerary.map((item: any) => ({
      position: item.day,
      name: item.title,
      description: item.activities ? item.activities.join('. ') : item.description
    })),
    destination: {
      name: packageDetails.destinations[0] || 'Destination',
      address: packageDetails.destinations.join(', '),
      geo: mapLocations[0] ? {
        latitude: String(mapLocations[0].coordinates?.[0] || '0'),
        longitude: String(mapLocations[0].coordinates?.[1] || '0')
      } : undefined,
      transportation: 'Private AC Vehicle'
    }
  });

  const heroHighlights = packageDetails.highlights && packageDetails.highlights.length > 0
    ? packageDetails.highlights
    : (effectivePkg.attractions ? effectivePkg.attractions.map((a: any) => a.name) : []);

  const imagesForSeo = [packageDetails.image].filter(Boolean);
  const breadcrumbs = [
    { name: 'Home', item: `${baseUrl}/` },
    { name: 'Packages', item: `${baseUrl}/packages` },
    { name: packageDetails.title, item: canonicalUrl },
  ];

  return (
    <Layout>
      <PackageSEO
        title={effectivePkg.seo_title || `${packageDetails.title} | Ghumo Firoo Travels`}
        description={seoDesc}
        keywords={effectivePkg.seo_keywords}
        canonical={canonicalUrl}
        images={imagesForSeo}
        price={activeVariant ? activeVariant.pricePerPerson : numericPrice}
        rating={packageDetails.rating}
        reviews={packageDetails.reviews}
        breadcrumbs={breadcrumbs}
        faqs={faqs}
        structuredData={jsonLd}
        skipProductSchema={true}
      />
      
      <ModernPackageHero
        title={packageDetails.title}
        duration={activeVariant ? `${activeVariant.nights} Nights / ${activeVariant.days} Days` : packageDetails.duration}
        price={`Starting from ₹${activeVariant ? activeVariant.pricePerPerson.toLocaleString('en-IN') : packageDetails.price}*`}
        rating={packageDetails.rating}
        reviews={packageDetails.reviews}
        images={imagesSlider}
        destinations={packageDetails.destinations}
        packageType={packageType}
        highlights={heroHighlights}
        bestTime={bestTime}
        groupSize={groupSize}
        difficulty={difficulty}
        virtualTourData={virtualTourData}
        mapLocations={mapLocations}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans pb-24">
        {/* Package Variant Selector Bar if variants exist */}
        {hasVariants && (
          <PackageVariantSelector
            variants={mappedVariants}
            activeId={activeVariantId || mappedVariants[0].id}
            onChange={setActiveVariantId}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Evoke Tent City Official Booking Engine Cross-Promotion Banner */}
              {isEvokePackage && (
                <div className="bg-gradient-to-r from-amber-500/15 via-[#C9A25A]/20 to-amber-600/15 border-2 border-[#C9A25A]/60 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎪</span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#F3E5AB] bg-[#C9A25A]/30 px-2.5 py-0.5 rounded-full border border-[#C9A25A]/50">
                        Official Evoke Tent City Rates
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-serif font-black text-white">
                      Looking for specific Swiss Cottage types or Live Calendar Dates?
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      Explore official Darbari Suite, Rajwadi Suite, Super Premium & Deluxe AC Tents with live date-wise peak season tariff calculator and instant voucher confirmation.
                    </p>
                  </div>
                  <Link
                    to="/packages/rann-utsav-tent"
                    className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2"
                  >
                    <span>Open Tent Engine</span>
                    <span>→</span>
                  </Link>
                </div>
              )}
              {/* Country / Destination Overview Card */}
              {(effectivePkg.capital || effectivePkg.currency || effectivePkg.visa_type) && (
                <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                    <h2 className="font-serif font-bold text-white text-xl">
                      🌍 Destination Quick Facts
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {effectivePkg.capital && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Capital</span>
                        <span className="text-sm font-bold text-[#E5C378]">{effectivePkg.capital}</span>
                      </div>
                    )}
                    {effectivePkg.currency && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Currency</span>
                        <span className="text-sm font-bold text-[#E5C378]">{effectivePkg.currency}</span>
                      </div>
                    )}
                    {effectivePkg.visa_type && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Visa Type</span>
                        <span className="text-sm font-bold text-[#E5C378]">{effectivePkg.visa_type}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specialized Yatra Pilgrimage Room & Bedding Configurator (Dham Packages Only) */}
              {isDhamPackage && (
                <div className="bg-[#0B1226] border border-[#C9A25A]/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                          ✦ Pilgrimage Room & Bedding Customizer
                        </div>
                        <h2 className="font-serif font-bold text-white text-xl md:text-2xl">
                          Select Adults & Required Rooms
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#C9A25A]/20 text-[#E5C378] border border-[#C9A25A]/40 font-bold text-xs uppercase px-3 py-1">
                        🏔️ Dham Lodge Occupancy Calculator
                      </Badge>
                    </div>
                  </div>

                  {/* Adults, Rooms, & Meal Plan Interactive Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    {/* Adults Counter */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#C9A25A]" /> Total Adults (Pax)
                        </span>
                        <span className="text-xs font-bold text-[#E5C378]">
                          {dhamAdultsCount} Adult{dhamAdultsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-2 rounded-lg justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const newAdults = Math.max(1, dhamAdultsCount - 1);
                            setDhamAdultsCount(newAdults);
                            setPassengerCount(newAdults);
                            if (newAdults === 3) setDhamRoomsCount(1);
                            else setDhamRoomsCount(Math.ceil(newAdults / 2));
                          }}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-base hover:bg-[#C9A25A] hover:text-slate-950 flex items-center justify-center transition-colors disabled:opacity-30"
                          disabled={dhamAdultsCount <= 1}
                        >
                          -
                        </button>
                        <span className="text-sm font-extrabold text-amber-400 font-mono">
                          {dhamAdultsCount} Adult{dhamAdultsCount > 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newAdults = Math.min(20, dhamAdultsCount + 1);
                            setDhamAdultsCount(newAdults);
                            setPassengerCount(newAdults);
                            if (newAdults === 3) setDhamRoomsCount(1);
                            else setDhamRoomsCount(Math.ceil(newAdults / 2));
                          }}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-base hover:bg-[#C9A25A] hover:text-slate-950 flex items-center justify-center transition-colors disabled:opacity-30"
                          disabled={dhamAdultsCount >= 20}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rooms Counter */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Hotel className="w-4 h-4 text-sky-400" /> Rooms Required
                        </span>
                        <span className="text-xs font-bold text-sky-300">
                          {dhamRoomsCount} Room{dhamRoomsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-2 rounded-lg justify-between">
                        <button
                          type="button"
                          onClick={() => setDhamRoomsCount(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-base hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
                          disabled={dhamRoomsCount <= 1}
                        >
                          -
                        </button>
                        <span className="text-sm font-extrabold text-sky-400 font-mono">
                          {dhamRoomsCount} Room{dhamRoomsCount > 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDhamRoomsCount(prev => Math.min(dhamAdultsCount, prev + 1))}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-base hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
                          disabled={dhamRoomsCount >= dhamAdultsCount}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Meal Plan Selector Dropdown */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Utensils className="w-4 h-4 text-emerald-400" /> Meal Plan
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {currentMealOption.label.split('(')[0]}
                        </span>
                      </div>
                      <Select value={selectedMealPlan} onValueChange={setSelectedMealPlan}>
                        <SelectTrigger className="h-9.5 text-xs bg-slate-950/90 border-slate-800 text-emerald-400 font-bold focus:ring-[#C9A25A]">
                          <SelectValue placeholder="Select Meal Plan" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1226] border-slate-700 text-white shadow-2xl z-50">
                          <SelectItem value="cp">☕ Breakfast Only (CP Plan - Default)</SelectItem>
                          <SelectItem value="map">🍱 Breakfast & Dinner (MAP Plan)</SelectItem>
                          <SelectItem value="ap">🍽️ All Meals (Breakfast, Lunch & Dinner - AP)</SelectItem>
                          <SelectItem value="ep">🏨 Room Only / No Meals (EP Plan)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Calculated Sharing Banner */}
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-[#C9A25A]/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-extrabold text-amber-400 flex items-center gap-2">
                        <span>🛏️</span> {occupancyTypeTitle}
                      </div>
                      <div className="text-slate-300 text-[11px] leading-relaxed">
                        {occupancyTypeDesc}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Transport Customizer Card */}
              <div className="bg-[#0B1226] border border-[#C9A25A]/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                        {isEvoke2D1N ? '✦ Official Evoke Tent City 2D/1N Configurator' : '✦ Private Transport Customizer'}
                      </div>
                      <h2 className="font-serif font-bold text-white text-xl md:text-2xl">
                        {isEvoke2D1N ? 'Configure Tent Category, Dates & Cab' : 'Select Private Vehicle / Cab Type'}
                      </h2>
                    </div>
                  </div>

                  {/* Traveler Badge for Dham Packages vs Counter for General Packages */}
                  {isDhamPackage ? (
                    <Badge className="bg-[#C9A25A]/15 border border-[#C9A25A]/40 text-[#E5C378] font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#C9A25A]" />
                      <span>{passengerCount} Adult{passengerCount > 1 ? 's' : ''} Selected Above</span>
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-3 bg-white/5 border border-[#C9A25A]/30 px-4 py-2 rounded-xl">
                      <span className="text-xs text-slate-300 font-medium">Travelers:</span>
                      <button 
                        onClick={() => setPassengerCount(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#C9A25A]/20 text-white font-bold text-sm flex items-center justify-center transition-colors disabled:opacity-30"
                        disabled={passengerCount <= 1}
                      >
                        -
                      </button>
                      <span className="text-sm font-extrabold text-[#E5C378] px-2 min-w-[28px] text-center">
                        {passengerCount} Pax
                      </span>
                      <button 
                        onClick={() => setPassengerCount(prev => Math.min(12, prev + 1))}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#C9A25A]/20 text-white font-bold text-sm flex items-center justify-center transition-colors disabled:opacity-30"
                        disabled={passengerCount >= 12}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* EXCLUSIVE EVOKE 2D/1N STEP 1: ACCOMMODATION CATEGORY SELECTOR */}
                {isEvoke2D1N && (
                  <div className="mb-8 p-5 bg-gradient-to-br from-amber-500/10 via-[#0B1226] to-slate-900 border border-[#C9A25A]/40 rounded-2xl shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#C9A25A] flex items-center gap-1.5">
                          <span>🎪</span> Step 1: Accommodation Category (Evoke Partner Portal)
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          Select Tent City Accommodation Tier
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#C9A25A]/20 text-amber-300 border border-[#C9A25A]/40 px-3 py-1 rounded-full self-start sm:self-auto">
                        <span>Current:</span>
                        <strong className="text-white">{EVOKE_ACCOMMODATION_CATEGORIES[selectedEvokeCategory]?.name}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      All accommodation categories include all gourmet buffet meals (AP Plan), official White Rann border entry permit, evening cultural folk performances, and Bhuj coach transfers.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                      {Object.values(EVOKE_ACCOMMODATION_CATEGORIES).map((cat) => {
                        const isSelected = selectedEvokeCategory === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setSelectedEvokeCategory(cat.id)}
                            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'bg-[#C9A25A]/20 border-[#C9A25A] shadow-[0_0_20px_rgba(201,162,90,0.25)] ring-1 ring-[#C9A25A]'
                                : 'bg-white/5 border-white/10 hover:border-[#C9A25A]/50 hover:bg-white/10'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-2xl">{cat.icon}</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  cat.delta === 0
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : cat.delta > 0
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                }`}>
                                  {cat.badge}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white leading-snug">{cat.name}</h4>
                              <p className="text-[11px] font-semibold text-amber-200/80">{cat.sub}</p>
                              <p className="text-[11px] text-slate-300 font-light leading-relaxed pt-1">
                                {cat.description}
                              </p>
                            </div>

                            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                              <span className="font-mono text-slate-400">
                                {cat.delta === 0 ? 'Base ₹12,500' : cat.delta > 0 ? `+₹${cat.delta.toLocaleString('en-IN')}/pax` : `-₹${Math.abs(cat.delta).toLocaleString('en-IN')}/pax`}
                              </span>
                              {isSelected ? (
                                <span className="text-amber-400 font-black flex items-center gap-1">
                                  ✓ Selected Tier
                                </span>
                              ) : (
                                <span className="text-slate-400 hover:text-white">
                                  Click to Select
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* EXCLUSIVE EVOKE 2D/1N STEP 2: CHECK-IN DATE & FULL MOON DETECTOR */}
                {isEvoke2D1N && (
                  <div className="mb-8 p-5 bg-[#0B1226] border border-[#C9A25A]/40 rounded-2xl shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-[#C9A25A] flex items-center gap-1.5">
                          <span>📅</span> Step 2: Check-In Date & Full Moon (Purnima) Tariff
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          Travel Date & Live Season Rate Calculator
                        </h3>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                        evokeSeasonInfo?.tier === 3
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : evokeSeasonInfo?.tier === 2
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        <span>{evokeSeasonInfo?.tier === 3 ? '🌕' : evokeSeasonInfo?.tier === 2 ? '🌕' : '✨'}</span>
                        <span>{evokeSeasonInfo?.label}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span>Select Check-In Date at Tent City Dhordo:</span>
                        </label>
                        <input
                          type="date"
                          value={evokeTravelDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setEvokeTravelDate(e.target.value)}
                          className="w-full h-11 bg-slate-950 border border-amber-500/40 rounded-xl px-3 text-slate-100 font-bold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                        <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                          <span>ℹ️</span> Season Surcharge Rule:
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {evokeSeasonInfo?.tier === 3
                            ? 'Season 3 Peak (Nov/Dec/Jan Full Moon & Xmas/NY) has an official Evoke surcharge of +₹4,000/person.'
                            : evokeSeasonInfo?.tier === 2
                            ? 'Season 2 (Diwali Week & Feb Full Moon) has an official Evoke surcharge of +₹2,000/person.'
                            : 'Regular Season weekday & non-peak dates carry ₹0 surcharge (Base Tariff Included).'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Test Full Moon Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Quick Pick 2026-27 Peak Full Moon (Purnima) Dates:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { date: '2026-11-24', label: '24 Nov (Nov Full Moon 🌕)' },
                          { date: '2026-12-23', label: '23 Dec (Dec Full Moon 🌕)' },
                          { date: '2027-01-22', label: '22 Jan (Jan Full Moon 🌕)' },
                          { date: '2027-02-20', label: '20 Feb (Feb Full Moon 🌕)' },
                          { date: '2026-11-15', label: '15 Nov (Regular Season ✨)' }
                        ].map((chip) => (
                          <button
                            key={chip.date}
                            type="button"
                            onClick={() => setEvokeTravelDate(chip.date)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                              evokeTravelDate === chip.date
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-500/50 hover:text-white'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Luggage Alert Banner for 4 Adults when Sedan is selected on standard packages */}
                {passengerCount === 4 && selectedCabId === 'sedan' && (
                  <div className="mb-6 p-4 bg-[#C9A25A]/10 border border-[#C9A25A]/40 rounded-xl flex items-start gap-3 text-xs text-[#E5C378] animate-fade-in shadow-md">
                    <span className="text-xl flex-shrink-0">🧳</span>
                    <div>
                      <strong className="font-bold text-white block mb-0.5 text-xs">Luggage Capacity Notice:</strong>
                      4 adults travelling with heavy suitcases might find Sedan boot space tight. We recommend upgrading to <strong>AC SUV (Maruti Ertiga / Triber)</strong> or <strong>AC Premium SUV (Toyota Innova Crysta)</strong> for additional comfort and luggage space.
                    </div>
                  </div>
                )}

                {/* Group Size Notice for 5 & 6 Pax on standard packages */}
                {(passengerCount === 5 || passengerCount === 6) && (
                  <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3 text-xs text-blue-300">
                    <span className="text-base">ℹ️</span>
                    <span>For <strong>{passengerCount} travelers</strong>, 4-seater sedans and tempo travellers are excluded. We recommend spacious 6-seater AC SUVs (Maruti Ertiga or Toyota Innova Crysta) for passenger and luggage capacity.</span>
                  </div>
                )}
                {passengerCount > 6 && (
                  <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3 text-xs text-blue-300">
                    <span className="text-base">ℹ️</span>
                    <span>For groups of <strong>{passengerCount} travelers</strong>, AC Luxury Tempo Traveller is provided for maximum group comfort.</span>
                  </div>
                )}

                {/* Cab Options Grid Filtered Dynamically by Passenger Count */}
                {(() => {
                  let visibleCabs = CAB_OPTIONS;

                  if (passengerCount >= 1 && passengerCount <= 3) {
                    // For 1–3 adults: Only 1 vehicle shown (AC Sedan included in base fare)
                    visibleCabs = CAB_OPTIONS.filter(c => c.id === 'sedan');
                  } else if (passengerCount === 4) {
                    // For 4 adults: Sedan, AC SUV (Ertiga), AC Premium SUV (Innova)
                    visibleCabs = CAB_OPTIONS.filter(c => c.id !== 'tempo');
                  } else if (passengerCount === 5 || passengerCount === 6) {
                    // For 5 & 6 adults: Exclude Sedan and Tempo. Show only AC SUV (Ertiga) & AC Premium SUV (Innova)
                    visibleCabs = CAB_OPTIONS.filter(c => c.id === 'suv_ertiga' || c.id === 'suv_innova');
                  } else if (passengerCount > 6) {
                    // For more than 6 adults (7+): Luxury Tempo Traveller only
                    visibleCabs = CAB_OPTIONS.filter(c => c.id === 'tempo');
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visibleCabs.map((cab) => {
                        const isDisabled = passengerCount > cab.maxPax;
                        const isSelected = selectedCabId === cab.id;
                        const perPersonExtra = Math.round(cab.priceTotal / Math.max(1, passengerCount));

                        return (
                          <div
                            key={cab.id}
                            onClick={() => !isDisabled && setSelectedCabId(cab.id)}
                            className={`p-4 rounded-xl border transition-all duration-200 relative ${
                              isDisabled 
                                ? 'opacity-40 bg-white/5 border-white/5 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#C9A25A]/15 border-[#C9A25A] shadow-[0_0_20px_rgba(201,162,90,0.15)] cursor-pointer'
                                : 'bg-white/5 border-white/10 hover:border-[#C9A25A]/40 hover:bg-white/10 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{cab.icon}</span>
                                <div>
                                  <h3 className="text-sm font-bold text-white leading-tight">{cab.name}</h3>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    Max {cab.maxPax} Pax • Private Vehicle
                                  </span>
                                </div>
                              </div>
                              
                              {/* Clean Feature Badge */}
                              <div className="text-right flex-shrink-0">
                                {cab.id === 'sedan' ? (
                                  <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 uppercase tracking-wider">
                                    INCLUDED
                                  </span>
                                ) : cab.id === 'suv_ertiga' ? (
                                  <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 uppercase tracking-wider">
                                    SPACIOUS 6-SEATER
                                  </span>
                                ) : cab.id === 'suv_innova' ? (
                                  <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-wider">
                                    RECOMMENDED ⭐
                                  </span>
                                ) : (
                                  <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 uppercase tracking-wider">
                                    GROUP SPECIAL
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-300 font-light leading-relaxed mb-2">{cab.description}</p>

                            {/* Status Label */}
                            {isDisabled ? (
                              <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                                ✕ Exceeds vehicle capacity (Max {cab.maxPax} Pax)
                              </span>
                            ) : isSelected ? (
                              <span className="text-[10px] font-bold text-[#C9A25A] flex items-center gap-1">
                                ✓ Selected Vehicle for {passengerCount} Travelers
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                Click to select vehicle
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Dynamic Cost & Room Occupancy Breakdown Summary Box */}
                <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Room Occupancy Calculation */}
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Hotel className="w-3.5 h-3.5 text-[#C9A25A]" /> Room Occupancy
                    </div>
                    <div className="text-sm font-extrabold text-[#E5C378]">
                      {roomsRequired} Room{roomsRequired > 1 ? 's' : ''} Allocated
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">
                      {passengerCount === 1 
                        ? '1 Single / Double Occupancy Room'
                        : passengerCount % 2 !== 0 
                          ? `${Math.floor(passengerCount / 2)} Double + 1 Extra Bed` 
                          : `${roomsRequired} Double Sharing Room${roomsRequired > 1 ? 's' : ''}`}
                    </div>
                  </div>

                  {/* Cab Selection Summary */}
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-sky-400" /> Private Transport
                    </div>
                    <div className="text-sm font-extrabold text-sky-300 truncate">
                      {selectedCab.name.split('(')[0]}
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">
                      Chauffeured Private Vehicle
                    </div>
                  </div>

                  {/* Live Total Cost Calculation */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-[#C9A25A]/40 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-[#C9A25A] uppercase tracking-wider flex items-center gap-1.5">
                      <span>💰</span> Total Package Payable
                    </div>
                    <div className="text-base font-extrabold text-amber-400">
                      ₹{(finalPricePerPerson * passengerCount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      (₹{finalPricePerPerson.toLocaleString('en-IN')}/pax × {passengerCount} Travelers)
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Variant Component view */}
              {hasVariants && activeVariant ? (
                <VariantDetails variant={activeVariant} />
              ) : (
                <>
                  {/* Highlights Card */}
                  {packageDetails.highlights.length > 0 && (
                    <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                            ✦ Signature Highlights
                          </div>
                          <h2 className="font-serif font-bold text-white text-2xl">
                            Package Highlights
                          </h2>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {packageDetails.highlights.map((highlight: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/10 rounded-xl hover:border-[#C9A25A]/40 transition-colors">
                            <div className="w-5 h-5 bg-[#C9A25A]/20 border border-[#C9A25A]/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[#C9A25A] text-xs font-bold">
                              ✓
                            </div>
                            <span className="text-xs font-medium text-slate-200 leading-relaxed">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Itinerary Timeline */}
                  {packageDetails.itinerary.length > 0 && (
                    <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                            ✦ Day-by-Day Timeline
                          </div>
                          <h2 className="font-serif font-bold text-white text-2xl">
                            Detailed Itinerary
                          </h2>
                        </div>
                      </div>
                      <PremiumTimeline itinerary={packageDetails.itinerary} />
                    </div>
                  )}

                  {/* Selected Stays Section */}
                  {((activeVariant?.hotels && activeVariant.hotels.length > 0) || (effectivePkg.hotels && effectivePkg.hotels.length > 0)) && (
                    <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                            ✦ Accommodation
                          </div>
                          <h2 className="font-serif font-bold text-white text-2xl">
                            Selected Hotels & Stays
                          </h2>
                        </div>
                      </div>
                      <HotelList hotels={((activeVariant?.hotels && activeVariant.hotels.length > 0) ? activeVariant.hotels : (isEvoke2D1N ? [{ name: `Tent City Dhordo (${EVOKE_ACCOMMODATION_CATEGORIES[selectedEvokeCategory]?.name})`, location: "Dhordo, Kutch", stars: 5, room_type: EVOKE_ACCOMMODATION_CATEGORIES[selectedEvokeCategory]?.name, meal_plan: "All Meals Included (AP)", image: "/rann_utsav_tent_city.jpg" }] : effectivePkg.hotels)).map((h: any) => {
                        const hName = typeof h === 'string' 
                          ? h 
                          : (h.name || h.hotel_name || h.hotelName || h.title || h.hotel || h.label || 'Premium Hotel / Resort');
                        const hLoc = typeof h === 'object' ? (h.location || h.city || h.destinationTag || h.destination || 'Kutch, Gujarat') : 'Kutch, Gujarat';
                        const hImg = (typeof h === 'object' && h.image) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600';
                        const hStars = Number(typeof h === 'object' ? (h.starRating || h.star_category || h.stars || h.star_rating) : 4) || 4;
                        const hAmens = typeof h === 'object' ? [h.room_type, h.category, h.meal_plan, h.highlight].filter(Boolean) : [];
                        const hPrice = (typeof h === 'object' && (h.priceFrom || h.price_from || h.selling_price)) 
                          ? (typeof (h.priceFrom || h.price_from || h.selling_price) === 'number' ? `₹${Number(h.priceFrom || h.price_from || h.selling_price).toLocaleString('en-IN')}` : String(h.priceFrom || h.price_from || h.selling_price))
                          : undefined;

                        return {
                          name: hName,
                          image: hImg,
                          starRating: hStars,
                          location: hLoc,
                          destinationTag: hLoc,
                          amenities: hAmens,
                          priceFrom: hPrice
                        };
                      })} />
                    </div>
                  )}

                  {/* Inclusions & Exclusions */}
                  {(packageDetails.inclusions.length > 0 || packageDetails.exclusions.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {packageDetails.inclusions.length > 0 && (
                        <div className="bg-[#0B1026] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-1.5 h-5 bg-[#C9A25A] rounded-full" />
                            <h2 className="font-serif font-bold text-white text-lg tracking-tight">
                              What's Included
                            </h2>
                          </div>
                          <ul className="space-y-3">
                            {packageDetails.inclusions.map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="text-[#34d399] font-bold text-sm flex-shrink-0 mt-0.5">✓</span>
                                <span className="text-slate-300 text-xs leading-relaxed font-light">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {packageDetails.exclusions.length > 0 && (
                        <div className="bg-[#0B1026] border border-white/10 rounded-2xl p-6 shadow-xl">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-1.5 h-5 bg-rose-400 rounded-full" />
                            <h2 className="font-serif font-bold text-white text-lg tracking-tight">
                              Not Included
                            </h2>
                          </div>
                          <ul className="space-y-3">
                            {packageDetails.exclusions.map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="text-rose-400 font-bold text-sm flex-shrink-0 mt-0.5">✕</span>
                                <span className="text-slate-400 text-xs leading-relaxed font-light">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Attractions / Highlights Section */}
              {effectivePkg.attractions && effectivePkg.attractions.length > 0 && (
                <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                        ✦ Signature Experiences
                      </div>
                      <h2 className="font-serif font-bold text-white text-2xl">
                        Top Attractions & Highlights
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {effectivePkg.attractions.map((att: any, index: number) => (
                      <AttractionCard 
                        key={index} 
                        title={att.name}
                        description={att.description}
                        image={att.image}
                        destinationTag={att.destinationTag || att.location || att.destination}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="bg-[#0B1026] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                  <h2 className="font-serif font-bold text-white text-lg tracking-tight">
                    Booking & Cancellation Policy
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="text-[#C9A25A] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                      Payment Schedule
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'At booking', value: '25% advance' },
                        { label: '30 days before travel', value: '50% total' },
                        { label: '15 days before travel', value: '100% cleared' },
                        { label: 'Subject to', value: 'Availability' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                          <span className="text-slate-400 text-xs">{row.label}</span>
                          <span className="text-white text-xs font-semibold">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#C9A25A] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                      Cancellation Charges
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Cancel 30+ days before', value: '25%', color: '#34d399' },
                        { label: 'Cancel 15–30 days before', value: '50%', color: '#fbbf24' },
                        { label: 'Cancel 0–15 days before', value: '100%', color: '#f87171' },
                        { label: 'No-show / early checkout', value: 'No refund', color: '#f87171' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                          <span className="text-slate-400 text-xs">{row.label}</span>
                          <span className="text-xs font-bold" style={{ color: row.color }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Routes Section */}
              {flightRoutes.length > 0 && (
                <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl overflow-hidden shadow-xl">
                  <FlightRouteMap 
                    isInternational={packageType === 'international'}
                    destination={packageDetails.destinations[0] || 'Destination'}
                    routes={flightRoutes}
                  />
                </div>
              )}

              {/* Route Map Section */}
              {mapLocations.length > 0 && (
                <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                        ✦ Your Journey
                      </div>
                      <h2 className="font-serif font-bold text-white text-2xl">
                        Tour Route Map
                      </h2>
                    </div>
                  </div>
                  <EnhancedRouteMap locations={mapLocations} />
                </div>
              )}

              {/* FAQ Section */}
              {faqs.length > 0 && (
                <FAQSection 
                  faqs={faqs} 
                  title={`${packageDetails.destinations[0] || 'Destination'} Travel FAQs`}
                  subtitle="Get answers to common questions about planning your vacation."
                  className="py-8 bg-transparent"
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-[88px] space-y-6">
                <PackageSidebar 
                  packageDetails={{
                    title: packageDetails.title,
                    duration: activeVariant ? `${activeVariant.nights}N/${activeVariant.days}D` : packageDetails.duration,
                    price: formattedFinalPrice,
                    rating: packageDetails.rating,
                    reviews: packageDetails.reviews,
                    image: packageDetails.image,
                    destinations: packageDetails.destinations,
                    highlights: packageDetails.highlights,
                    itinerary: (activeVariant?.itinerary && activeVariant.itinerary.length > 0) ? activeVariant.itinerary : packageDetails.itinerary,
                    inclusions: (activeVariant?.inclusions && activeVariant.inclusions.length > 0) ? activeVariant.inclusions : packageDetails.inclusions,
                    exclusions: (activeVariant?.exclusions && activeVariant.exclusions.length > 0) ? activeVariant.exclusions : packageDetails.exclusions,
                    hotels: isEvoke2D1N
                      ? [{ name: `Tent City Dhordo (${EVOKE_ACCOMMODATION_CATEGORIES[selectedEvokeCategory]?.name})`, location: "Dhordo, Kutch", stars: 5, room_type: EVOKE_ACCOMMODATION_CATEGORIES[selectedEvokeCategory]?.name, meal_plan: "All Meals Included (AP)" }]
                      : (activeVariant?.hotels && activeVariant.hotels.length > 0) ? activeVariant.hotels : (effectivePkg.hotels || []),
                    slug: effectivePkg.slug || currentSlug,
                    attractions: effectivePkg.attractions || []
                  } as any}
                  slug={effectivePkg.slug || currentSlug}
                  packageType={packageType}
                  destination={packageDetails.destinations[0] || ""}
                  quickFacts={{
                    ...quickFacts,
                    accommodation: isEvoke2D1N ? EVOKE_ACCOMMODATION_CATEGORIES[selectedEvokeCategory]?.name : quickFacts.accommodation
                  }}
                  selectedCabName={selectedCab.name}
                  selectedCabId={selectedCabId}
                  passengerCount={isDhamPackage ? dhamAdultsCount : passengerCount}
                  adultsCount={isDhamPackage ? dhamAdultsCount : passengerCount}
                  totalPayablePrice={finalPricePerPerson * (isDhamPackage ? dhamAdultsCount : passengerCount)}
                  travelDate={isEvoke2D1N ? evokeTravelDate : undefined}
                  onTravelDateChange={isEvoke2D1N ? setEvokeTravelDate : undefined}
                  evokeTentCategoryName={isEvoke2D1N ? EVOKE_ACCOMMODATION_CATEGORIES[selectedEvokeCategory]?.name : undefined}
                  evokeSeasonName={isEvoke2D1N ? evokeSeasonInfo?.categoryName : undefined}
                  evokeSeasonSurcharge={isEvoke2D1N ? evokeSeasonInfo?.surcharge : undefined}
                />
              </div>
            </div>
        </div>
      </div>
    </div>
      <StickyCTA 
        packageName={packageDetails.title}
        priceText={`₹${formattedFinalPrice}`}
        kicker="Now Viewing"
      />
    </Layout>
  );
};

export default DynamicPackageDetail;
