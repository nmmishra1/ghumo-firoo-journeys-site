import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  Search, Calendar, Users, MapPin, ArrowLeft, X, ChevronDown, CheckCircle2,
  ShieldCheck, FileText, Info, Bus, Clock, Map, Star, Sparkles, Award, Tag,
  Gift, Percent, ChevronRight, Eye, Check, ExternalLink, Compass, Heart, Bed, Plus, Trash2, Shield
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TentAllocation {
  id: number;
  pax: number; // 1 = Single, 2 = Double, 3 = Triple
}

const RannUtsavMockupPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // STEP 1 FORM CONTROLS (MATCHING EVOKE OFFICIAL evplbooking.com)
  const [selectedPackageNights, setSelectedPackageNights] = useState<number>(2); // 1 = 1 Night, 2 = 2 Nights, 3 = 3 Nights, 4 = 4 Nights
  const [selectedAccCategory, setSelectedAccCategory] = useState<string>("ac_premium"); // Darbari, Rajwadi, super_premium, ac_premium, deluxe_ac, non_ac
  const [checkInDate, setCheckInDate] = useState<string>("2026-12-15");
  
  // TENTS & PAX ALLOCATION STATE
  const [tentList, setTentList] = useState<TentAllocation[]>([
    { id: 1, pax: 2 }
  ]);

  // Compute calculated Check-Out Date automatically from Check-In Date + Selected Package Nights
  const checkInTime = new Date(checkInDate).getTime();
  const checkOutDateObj = new Date(checkInDate);
  checkOutDateObj.setDate(checkOutDateObj.getDate() + selectedPackageNights);
  const computedNights = selectedPackageNights;
  const computedDays = computedNights + 1;
  const checkOutDateStr = checkOutDateObj.toISOString().split('T')[0];

  const totalOccupants = tentList.reduce((sum, t) => sum + t.pax, 0);

  // ============================================================================
  // BACKEND-DRIVEN RATES & ITINERARY
  //
  // Fetches the real rate card + itinerary seeded by
  // php-backend/migrations/20260822_seed_evoke_tent_city.php into
  // package_variants/variant_price_rows/variant_itinerary_days. Replaces
  // what used to be hardcoded numbers in this file — some of which were
  // verified wrong against the real rate card (Deluxe AC Swiss Cottage,
  // Darbari Suite, and Rajwadi Suite were all undercharging).
  //
  // The hardcoded objects below (roomRatesPerPersonBaseFallback,
  // pdfItinerariesFallback) are kept ONLY as a loading-state/offline
  // fallback so the page still renders something before the fetch
  // resolves — once backend data loads, it takes over completely.
  // ============================================================================
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '/php-backend';
  const [backendVariants, setBackendVariants] = useState<any[] | null>(null);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api.php?table=packages&slug=rann-utsav-mockup&include_variants=1`);
        if (!res.ok) throw new Error(`Rate card fetch failed (HTTP ${res.status})`);
        const data = await res.json();
        const variants = data?.variants || data?.package?.variants || [];
        if (!cancelled) {
          if (variants.length === 0) {
            setBackendError('No rates found for this package yet — showing indicative pricing. Run the Evoke Tent City seed migration to enable live rates.');
          }
          setBackendVariants(variants);
        }
      } catch (err: any) {
        if (!cancelled) setBackendError(err.message || 'Could not load live rate card — showing indicative pricing.');
      } finally {
        if (!cancelled) setBackendLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [apiBase]);

  // Find the variant matching the currently selected night count (1/2/3).
  const activeVariant = useMemo(() => {
    if (!backendVariants) return null;
    const key = `${computedNights}n`;
    return backendVariants.find((v: any) => v.variant_key === key || v.variantKey === key) || null;
  }, [backendVariants, computedNights]);

  const formatDateRange = (inStr: string, outStr: string) => {
    try {
      const d1 = new Date(inStr);
      const d2 = new Date(outStr);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return `${inStr} – ${outStr}`;
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${d1.getDate()} ${months[d1.getMonth()]} – ${d2.getDate()} ${months[d2.getMonth()]} ${d2.getFullYear()}`;
    } catch {
      return `${inStr} – ${outStr}`;
    }
  };

  const travelDates = formatDateRange(checkInDate, checkOutDateStr);

  // Lightbox & Modal State
  const [galleryOpen, setGalleryOpen] = useState<boolean>(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);

  // Activities & Coupon State
  const [selectedActivities, setSelectedActivities] = useState<string[]>(["road_to_heaven"]);
  const [couponInput, setCouponInput] = useState<string>("RANN10");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("RANN10");
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(10);

  // Gallery Photos Array
  const galleryPhotos = [
    { title: "Great White Rann Salt Desert Sunset Walk", url: "/rann_utsav_white_desert.jpg", tag: "Desert Experience" },
    { title: "Illuminated Praveg Tent City Dhordo Resort", url: "/rann_utsav_tent_city.jpg", tag: "Tent City Resort" },
    { title: "Road to Heaven 30km Salt Highway Drive", url: "/rann_utsav_road_to_heaven.jpg", tag: "Scenic Highway Drive" },
    { title: "Kalo Dungar Black Hill Scenic Viewpoint", url: "/rann_utsav_kalo_dungar.jpg", tag: "Highest Point Kutch" },
    { title: "Gandhi Nu Gam Artisan Handicraft Village", url: "/Rann-Utsav-Gujarat.png", tag: "Kutchi Crafts" },
  ];

  // EXACT OFFICIAL EVOKE TENT CITY CALENDAR SEASON CALCULATOR (Matched to Official Calendar Image)
  const getSeasonInfo = (inStr: string) => {
    if (!inStr) return { tier: 1 as const, surcharge: 0, label: 'Season 1 (Base Regular Rates)' };
    const dateObj = new Date(inStr);
    if (isNaN(dateObj.getTime())) return { tier: 1 as const, surcharge: 0, label: 'Season 1 (Base Regular Rates)' };

    const month = dateObj.getMonth() + 1; // 1-12
    const day = dateObj.getDate();        // 1-31

    let tier: 1 | 2 | 3 = 1;
    let categoryName = 'Base Regular Rates';

    if (month === 11) {
      // NOVEMBER:
      // Yellow (Season 2): 8-14 (Diwali Week), 22-25 (Nov Full Moon)
      // Grey (Season 1): 1-7, 15-21, 26-30
      if ((day >= 8 && day <= 14) || (day >= 22 && day <= 25)) {
        tier = 2;
        categoryName = day <= 14 ? 'Diwali Week' : 'Nov Full Moon';
      }
    } else if (month === 12) {
      // DECEMBER:
      // Orange (Season 3): 20-31 (Xmas, New Year & Dec Full Moon)
      // Yellow (Season 2): 1-19
      if (day >= 20) {
        tier = 3;
        categoryName = 'Christmas, New Year & Full Moon Peak';
      } else {
        tier = 2;
        categoryName = 'December Special Dates';
      }
    } else if (month === 1) {
      // JANUARY:
      // Orange (Season 3): 1-3 (New Year Peak), 20-23 (Jan Full Moon)
      // Yellow (Season 2): 4-19, 24-31
      if ((day >= 1 && day <= 3) || (day >= 20 && day <= 23)) {
        tier = 3;
        categoryName = (day <= 3) ? 'New Year Peak' : 'Jan Full Moon Peak';
      } else {
        tier = 2;
        categoryName = 'January Special Dates';
      }
    } else if (month === 2) {
      // FEBRUARY:
      // Yellow (Season 2): 18-21 (Feb Full Moon)
      // Grey (Season 1): 1-17, 22-28
      if (day >= 18 && day <= 21) {
        tier = 2;
        categoryName = 'Feb Full Moon';
      }
    } else if (month === 3) {
      // MARCH: All Grey (Season 1)
      tier = 1;
      categoryName = 'Base Regular Rates';
    }

    const surchargeMap: Record<number, Record<number, number>> = {
      1: { 1: 0, 2: 0, 3: 0 },
      2: { 1: 2000, 2: 3500, 3: 4500 },
      3: { 1: 4000, 2: 6000, 3: 8000 }
    };

    const surcharge = surchargeMap[tier]?.[computedNights] || 0;

    if (tier === 3) {
      return { tier: 3 as const, surcharge, label: `Season 3 (${categoryName} Surcharge: +₹${surcharge.toLocaleString('en-IN')}/pax)` };
    }
    if (tier === 2) {
      return { tier: 2 as const, surcharge, label: `Season 2 (${categoryName} Surcharge: +₹${surcharge.toLocaleString('en-IN')}/pax)` };
    }
    return { tier: 1 as const, surcharge: 0, label: 'Season 1 (Base Regular Rates)' };
  };

  const seasonInfo = getSeasonInfo(checkInDate);
  const seasonSurcharge = seasonInfo.surcharge;
  const activeSeasonTier = seasonInfo.tier;

  // OFFICIAL EVOKE ACCOMMODATION CATEGORIES — fallback only, used until the
  // backend fetch above resolves (or if it fails). Once `activeVariant` has
  // real price_table rows, roomRatesPerPersonBase (below) is DERIVED from
  // those instead of this object. Do not trust these numbers for a live
  // quote — cross-checking against the real rate card during this fix
  // found several of them wrong (Deluxe AC Swiss Cottage, Darbari Suite,
  // and Rajwadi Suite were all undercharging, Darbari by as much as 50%).
  const roomRatesPerPersonBaseFallback: Record<string, { label: string; sub: string; img: string; rate1N: number; rate2N: number; rate3N: number }> = {
    "darbari": {
      label: "Darbari Royal Suite",
      sub: "Royal VIP Suite • Up to 4 Pax • Private Lounge & Butler Service",
      img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800",
      rate1N: 70000, rate2N: 140000, rate3N: 210000
    },
    "rajwadi": {
      label: "Rajwadi Suite",
      sub: "Royal Heritage Suite • Up to 2 Pax • Premium Lounge",
      img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
      rate1N: 35000, rate2N: 70000, rate3N: 105000
    },
    "super_premium": {
      label: "Super Premium AC Tent",
      sub: "Ultra Luxury AC Tent • Prime Central Tent City Location",
      img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
      rate1N: 10300, rate2N: 20600, rate3N: 30900
    },
    "ac_premium": {
      label: "Premium AC Tent",
      sub: "Luxury AC Tent • Double/Twin Bed & Modern Amenities",
      img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800",
      rate1N: 9300, rate2N: 18600, rate3N: 27900
    },
    "deluxe_ac": {
      label: "Deluxe AC Swiss Cottage",
      sub: "Air-Conditioned Cottage • Comfortable Twin Bed Setup",
      img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
      rate1N: 8300, rate2N: 16600, rate3N: 24900
    },
    "non_ac": {
      label: "Non AC Swiss Cottage",
      sub: "Standard Non-AC Swiss Cottage • Authentic Kutchi Decor",
      img: "/rann_utsav_tent_city.jpg",
      rate1N: 6300, rate2N: 12600, rate3N: 18900
    },
  };

  // Derives the season-tier-correct rate table from the backend's
  // price_table, keeping the fallback's labels/images/copy (those weren't
  // wrong — only some of the numbers were) but replacing every rateNN
  // number with the real, season-aware figure from variant_price_rows.
  // Falls back to the hardcoded object above, unchanged, if the backend
  // hasn't loaded yet or has no rows for a given variant.
  //
  // IMPORTANT: rate1N/rate2N/rate3N mean "price for a 1/2/3-night stay",
  // NOT "season tier 1/2/3" — those are two different axes. The grid that
  // renders this object shows all three night-count options side by side
  // at whatever season is currently active, so this pulls from all three
  // backend variants (1n/2n/3n), each filtered down to the ONE row that
  // matches the currently active season tier — not one row per season.
  const findVariant = (key: '1n' | '2n' | '3n') =>
    (backendVariants || []).find((v: any) => (v.variant_key || v.variantKey) === key) || null;

  const findPriceRow = (variant: any, roomTypeKey: string, seasonTier: number | null) =>
    (variant?.price_table || variant?.priceTable || []).find(
      (r: any) => r.room_type === roomTypeKey && (seasonTier === null ? r.season_tier == null : Number(r.season_tier) === seasonTier)
    );

  const roomRatesPerPersonBase = useMemo(() => {
    if (!backendVariants || backendVariants.length === 0) return roomRatesPerPersonBaseFallback;
    const v1n = findVariant('1n'), v2n = findVariant('2n'), v3n = findVariant('3n');
    const merged: typeof roomRatesPerPersonBaseFallback = { ...roomRatesPerPersonBaseFallback };

    (['darbari', 'rajwadi', 'super_premium', 'ac_premium', 'deluxe_ac', 'non_ac'] as const).forEach((key) => {
      const isSuite = key === 'darbari' || key === 'rajwadi';
      const tier = isSuite ? null : activeSeasonTier; // suites are flat "All Days" rates, no season axis
      const row1N = findPriceRow(v1n, key, tier);
      const row2N = findPriceRow(v2n, key, tier);
      const row3N = findPriceRow(v3n, key, tier);
      if ((row1N || row2N || row3N) && merged[key]) {
        merged[key] = {
          ...merged[key],
          rate1N: Number(row1N?.price_numeric ?? merged[key].rate1N),
          rate2N: Number(row2N?.price_numeric ?? merged[key].rate2N),
          rate3N: Number(row3N?.price_numeric ?? merged[key].rate3N),
        };
      }
    });
    return merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendVariants, activeSeasonTier]);

  // Extra mattress rate for the currently-selected category, at the
  // currently-active season tier and currently-selected night count —
  // replaces the old flat `non_ac ? 5000 : 6000` (which ignored season 1's
  // lower mattress rates and that Super Premium/Deluxe AC don't have a
  // season-1 mattress rate specified at all in the source ratecard).
  const backendExtraMattressRate = useMemo(() => {
    const row = findPriceRow(activeVariant, selectedAccCategory, activeSeasonTier);
    return row?.extra_mattress_rate != null ? Number(row.extra_mattress_rate) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVariant, selectedAccCategory, activeSeasonTier]);

  const activityRateMap: Record<string, { label: string; sub: string; ratePerPerson: number }> = {
    "paramotoring": { label: "White Rann Paramotoring Flight", sub: "Aerial Tandem Desert Flight", ratePerPerson: 2800 },
    "camel_safari": { label: "Sunset Camel Safari Ride", sub: "Traditional Salt Flat Ride", ratePerPerson: 1200 },
    "road_to_heaven": { label: "Road to Heaven Photo Tour", sub: "30km Salt Highway Drive", ratePerPerson: 1500 },
  };

  // OFFICIAL PDF ITINERARY DATA (1N, 2N, 3N) — fallback only, see note above
  // roomRatesPerPersonBaseFallback. This content itself was already checked
  // against the source itinerary documents and matches, so it's also reused
  // directly as the seed data in the backend migration — but once backend
  // data loads, pdfItineraries (below) reads from there, not this constant.
  const pdfItinerariesFallback: Record<number, { title: string; subtitle: string; days: { day: string; title: string; events: { time: string; text: string }[] }[] }> = {
    1: {
      title: "1 Night / 2 Days Official Tent City Package",
      subtitle: "Includes Fixed Bhuj Pickup, White Rann Sunset Walk & Smritivan Earthquake Museum Tour",
      days: [
        {
          day: "Day 1",
          title: "Arrival at Tent City Dhordo & White Rann Sunset Walk",
          events: [
            { time: "08:15 AM - 03:30 PM", text: "Fixed AC Shared Coach pickup from Bhuj Railway Station & Bhuj Airport to Tent City Dhordo (85 km / 1h 45m)." },
            { time: "12:30 PM Onwards", text: "Warm traditional Kutchi welcome and check-in at Tent City Dhordo." },
            { time: "12:30 PM - 02:30 PM", text: "Delicious gourmet lunch served at the respective dining hall." },
            { time: "02:30 PM - 04:30 PM", text: "In-house leisure: Indulge in activities at Skyzilla, Club House, Craft Haat Market, Selfie Points & Art Gallery." },
            { time: "04:00 PM - 05:00 PM", text: "High tea & light Kutchi snacks at dining area." },
            { time: "05:00 PM - 07:00 PM", text: "Grand Sunset visit at breathtaking White Rann salt desert (transfers by bus/camel cart)." },
            { time: "07:30 PM - 10:00 PM", text: "Scrumptious dinner followed by live Kutchi folk music & cultural performance (09:00 PM - 10:30 PM)." }
          ]
        },
        {
          day: "Day 2",
          title: "Morning Yoga, Check-out & Smritivan Earthquake Museum",
          events: [
            { time: "06:00 AM - 07:30 AM", text: "Morning tea & rejuvenating yoga session at Tent City grounds." },
            { time: "07:30 AM - 09:30 AM", text: "Lavish breakfast spread at dining hall." },
            { time: "09:30 AM Onwards", text: "Check-out from Tent City Dhordo." },
            { time: "11:30 AM - 02:00 PM", text: "Complimentary sightseeing tour of Smritivan Earthquake Memorial Museum, Bhuj & drop at Bhuj Airport / Railway Station by AC Coach." }
          ]
        }
      ]
    },
    2: {
      title: "2 Nights / 3 Days Official Tent City Package",
      subtitle: "Includes White Rann Sunrise & Sunset, Kala Dungar Hill Excursion & Smritivan Museum",
      days: [
        {
          day: "Day 1",
          title: "Arrival at Tent City Dhordo & White Rann Sunset Walk",
          events: [
            { time: "08:15 AM - 03:30 PM", text: "Fixed AC Shared Coach pickup from Bhuj Railway Station & Airport to Tent City Dhordo." },
            { time: "12:30 PM Onwards", text: "Check-in at Tent City Dhordo & Lunch at dining area." },
            { time: "02:30 PM - 04:30 PM", text: "In-house activities at Skyzilla, Craft Haat & Rejuvenation Center." },
            { time: "05:00 PM - 07:00 PM", text: "Grand Sunset visit at White Rann salt desert." },
            { time: "07:30 PM - 10:30 PM", text: "Dinner & Kutchi folk cultural evening show." }
          ]
        },
        {
          day: "Day 2",
          title: "White Rann Sunrise, Kala Dungar Excursion & Gandhi Nu Gaam",
          events: [
            { time: "06:00 AM - 07:00 AM", text: "Sunrise Point visit at White Rann to witness morning sun over salt flats & Yoga." },
            { time: "07:30 AM - 10:00 AM", text: "Breakfast at dining hall." },
            { time: "12:30 PM - 02:30 PM", text: "Lunch at dining hall." },
            { time: "03:00 PM - 07:30 PM", text: "Complimentary excursion tour to Kala Dungar (Black Hill - highest point of Kutch) & Gandhi Nu Gaam handicraft artisan village." },
            { time: "07:30 PM - 10:30 PM", text: "Dinner & Kutchi cultural performance." }
          ]
        },
        {
          day: "Day 3",
          title: "Check-out & Smritivan Earthquake Museum Bhuj",
          events: [
            { time: "06:00 AM - 07:30 AM", text: "Morning tea & Yoga." },
            { time: "07:30 AM - 09:30 AM", text: "Breakfast at dining hall." },
            { time: "09:30 AM Onwards", text: "Check-out from Tent City Dhordo." },
            { time: "11:30 AM - 02:00 PM", text: "Complimentary sightseeing at Smritivan Earthquake Memorial Museum, Bhuj & drop at Bhuj Airport / Railway Station by AC Coach." }
          ]
        }
      ]
    },
    3: {
      title: "3 Nights / 4 Days Official Tent City Package",
      subtitle: "Includes Mandvi Beach Excursion, Vijay Vilas Palace, Kala Dungar & Smritivan Museum",
      days: [
        {
          day: "Day 1",
          title: "Arrival at Tent City Dhordo & White Rann Sunset Walk",
          events: [
            { time: "08:15 AM - 03:30 PM", text: "Fixed AC Shared Coach pickup from Bhuj Railway Station & Airport." },
            { time: "12:30 PM Onwards", text: "Check-in at Tent City Dhordo & Lunch." },
            { time: "05:00 PM - 07:00 PM", text: "Grand Sunset visit at White Rann salt desert." },
            { time: "07:30 PM - 10:30 PM", text: "Dinner & Kutchi Folk Cultural Show." }
          ]
        },
        {
          day: "Day 2",
          title: "Complimentary Mandvi Beach, Vijay Vilas Palace & Memorial Tour",
          events: [
            { time: "06:00 AM - 08:00 AM", text: "Morning tea & Breakfast at dining area." },
            { time: "08:00 AM Onwards", text: "Complimentary AC Shared Coach tour to Mandvi Beach (140 km from Dhordo)." },
            { time: "10:30 AM - 12:00 PM", text: "Leisure time at Mandvi Private Beach." },
            { time: "12:30 PM - 02:00 PM", text: "Delicious lunch at private dining area on Mandvi Beach." },
            { time: "02:00 PM - 03:00 PM", text: "Visit Vijay Vilas Palace (1929 Maharao summer resort)." },
            { time: "03:15 PM - 04:15 PM", text: "Visit Shyamji Krishna Varma Memorial." },
            { time: "04:30 PM Onwards", text: "Return journey to Tent City Dhordo with tea & light refreshments." },
            { time: "07:30 PM - 10:30 PM", text: "Dinner & Cultural Performance." }
          ]
        },
        {
          day: "Day 3",
          title: "White Rann Sunrise, Kala Dungar & Gandhi Nu Gaam Craft Village",
          events: [
            { time: "06:00 AM - 07:00 AM", text: "White Rann Sunrise Point & Morning Yoga." },
            { time: "07:30 AM - 10:00 AM", text: "Breakfast at dining area." },
            { time: "12:30 PM - 02:30 PM", text: "Lunch at dining area." },
            { time: "03:00 PM - 07:30 PM", text: "Complimentary excursion to Kala Dungar (Black Hill) & Gandhi Nu Gaam handicraft village." },
            { time: "07:30 PM - 10:30 PM", text: "Dinner & Cultural Night." }
          ]
        },
        {
          day: "Day 4",
          title: "Check-out & Smritivan Earthquake Museum Bhuj",
          events: [
            { time: "06:00 AM - 07:30 AM", text: "Morning tea & Yoga." },
            { time: "07:30 AM - 09:30 AM", text: "Breakfast." },
            { time: "09:30 AM Onwards", text: "Check-out." },
            { time: "11:30 AM - 02:00 PM", text: "Complimentary sightseeing at Smritivan Earthquake Memorial Museum, Bhuj & drop at Bhuj Airport / Railway Station by AC Coach." }
          ]
        }
      ]
    }
  };

  // Derives the itinerary shown to the user from the backend's per-variant
  // day data when available, falling back to pdfItinerariesFallback above
  // otherwise. Keyed by night count (1/2/3) to match how the fallback and
  // the rest of this component already index itinerary content.
  const pdfItineraries = useMemo(() => {
    if (!backendVariants || backendVariants.length === 0) return pdfItinerariesFallback;
    const merged = { ...pdfItinerariesFallback };
    ([1, 2, 3] as const).forEach((nights) => {
      const v = findVariant(`${nights}n` as '1n' | '2n' | '3n');
      const days = v?.itinerary;
      if (v && Array.isArray(days) && days.length > 0) {
        merged[nights] = {
          title: v.label || merged[nights]?.title || `${nights} Night${nights > 1 ? 's' : ''} Package`,
          subtitle: merged[nights]?.subtitle || '',
          days: days.map((d: any) => ({
            day: d.timing || `Day ${d.day_number ?? d.day}`,
            title: d.title,
            events: Array.isArray(d.activities) ? d.activities.map((a: any) => ({ time: a.time, text: a.text })) : []
          }))
        };
      }
    });
    return merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendVariants]);

  // EVOKE RATE CALCULATION ENGINE ACROSS ALL TENTS
  const usingBackendRates = !!backendVariants && backendVariants.length > 0;
  const selectedRoomObj = roomRatesPerPersonBase[selectedAccCategory] || roomRatesPerPersonBase["ac_premium"];
  let baseRoomRatePerAdult = selectedRoomObj.rate3N;
  if (computedNights === 1) baseRoomRatePerAdult = selectedRoomObj.rate1N;
  else if (computedNights === 2) baseRoomRatePerAdult = selectedRoomObj.rate2N;

  // Once backend rates are live, roomRatesPerPersonBase's numbers are
  // already season-tier-correct (they were looked up filtered by
  // activeSeasonTier) — adding seasonSurcharge again below would double
  // it. The fallback object's numbers are Season-1-only by design, so the
  // fallback path still needs the surcharge added separately. This applies
  // that surcharge only when it's actually still needed.
  const effectiveSeasonSurcharge = usingBackendRates ? 0 : seasonSurcharge;
  const extraMattressRate = backendExtraMattressRate ?? (selectedAccCategory === "non_ac" ? 5000 : 6000);

  // Calculate total cost for all tents based on single, double, or triple/multi-occupancy per tent
  let totalRoomCost = 0;
  tentList.forEach((t) => {
    if (selectedAccCategory === "darbari" || selectedAccCategory === "rajwadi") {
      totalRoomCost += baseRoomRatePerAdult * Math.max(1, t.pax);
    } else if (t.pax === 1) {
      const singleTentFare = Math.round((baseRoomRatePerAdult * 2) * 0.75) + Math.round(effectiveSeasonSurcharge * 0.75);
      totalRoomCost += singleTentFare;
    } else if (t.pax === 2) {
      const doubleTentFare = (baseRoomRatePerAdult + effectiveSeasonSurcharge) * 2;
      totalRoomCost += doubleTentFare;
    } else if (t.pax >= 3) {
      const doubleTentFare = (baseRoomRatePerAdult + effectiveSeasonSurcharge) * 2;
      const extraMattressFare = (t.pax - 2) * extraMattressRate;
      totalRoomCost += doubleTentFare + extraMattressFare;
    }
  });

  const currentActivitiesTotal = selectedActivities.reduce((sum, key) => sum + (activityRateMap[key]?.ratePerPerson || 0), 0) * totalOccupants;
  const subtotalFare = totalRoomCost + currentActivitiesTotal;

  // Calculate 10% Discount Coupon if applied
  const discountAmount = appliedCoupon ? Math.round(subtotalFare * (couponDiscountPercent / 100)) : 0;
  const discountedSubtotal = Math.max(0, subtotalFare - discountAmount);
  const taxesAndFees = Math.round(discountedSubtotal * 0.18);
  const totalPackageFare = discountedSubtotal + taxesAndFees;
  const perPersonFare = Math.round(totalPackageFare / Math.max(1, totalOccupants));

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    const validCodes = ['RANN10', 'GHUMO10', 'EARLYBIRD', 'DESERT10'];
    if (validCodes.includes(code)) {
      setAppliedCoupon(code);
      setCouponDiscountPercent(10);
      toast({
        title: "🎉 10% Discount Coupon Applied!",
        description: `Promo Code ${code} successfully applied. You saved 10% on your booking!`,
      });
    } else {
      toast({
        title: "❌ Invalid Promo Code",
        description: "Please enter a valid code like RANN10 or GHUMO10.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    toast({
      title: "Coupon Removed",
      description: "Discount coupon removed from fare breakdown.",
    });
  };

  const toggleActivity = (key: string) => {
    setSelectedActivities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Evoke Tent Allocation Handlers
  const handleTentCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(5, count));
    setTentList((prev) => {
      if (newCount > prev.length) {
        const added: TentAllocation[] = [];
        for (let i = prev.length + 1; i <= newCount; i++) {
          added.push({ id: i, pax: 2 });
        }
        return [...prev, ...added];
      } else {
        return prev.slice(0, newCount);
      }
    });
  };

  const handleTentPaxChange = (tentId: number, pax: number) => {
    setTentList((prev) =>
      prev.map((t) => (t.id === tentId ? { ...t, pax } : t))
    );
  };

  const currentItineraryObj = pdfItineraries[Math.min(3, Math.max(1, computedNights))] || pdfItineraries[2];

  // RICH JSON-LD STRUCTURED DATA FOR GOOGLE SEO
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": "Rann Utsav Kutch Tent City Dhordo",
    "description": "Official Rann Utsav Tent City booking portal by Evoke Experiences. Book 1N to 4N luxury package stays with gourmet Kutchi dining, fixed AC coach transfers from Bhuj, and White Desert tours.",
    "url": "https://ghumofiroo.com/packages/rann-utsav",
    "image": "https://ghumofiroo.com/rann_utsav_white_desert.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dhordo, Kutch",
      "addressRegion": "Gujarat",
      "addressCountry": "IN"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "52400"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": "6300",
      "highPrice": "105000",
      "offerCount": "6",
      "priceValidUntil": "2027-03-31",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="bg-[#050B1A] min-h-screen text-slate-100 font-sans selection:bg-[#D4AF37] selection:text-black">
      <SEO
        title="Rann Utsav 2026-27 Booking | Tent City Dhordo | Evoke Partner"
        description="Book official Rann Utsav 2026-27 packages at Tent City Dhordo. Enjoy AC Deluxe Swiss Tents, White Desert Full Moon & Dholavira tours with free Bhuj transfers."
        keywords="Rann Utsav 2026-27, Tent City Dhordo booking, White Rann of Kutch, Evoke Experiences partner, Rann Utsav package price, Road to Heaven Dholavira, Full Moon Rann Utsav, Kutch tour package from Bhuj"
      />

      {/* JSON-LD FOR SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {backendError && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs text-center py-2 px-4">
          ⚠ {backendError}
        </div>
      )}

      {/* TOP CONSUMER BRANDING HEADER */}
      <header className="bg-[#081226]/95 border-b border-[#D4AF37]/30 sticky top-0 z-50 backdrop-blur-xl shadow-2xl">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold">
              <ArrowLeft className="w-4 h-4 text-[#D4AF37]" /> Home
            </Link>
            <div className="h-5 w-px bg-white/10 hidden sm:block" />
            
            <Link to="/packages/rann-utsav" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
                G
              </div>
              <div>
                <span className="font-serif text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 block leading-tight">
                  GHUMO FIROO JOURNEYS
                </span>
                <span className="text-[10px] font-bold text-slate-300 tracking-wider uppercase block">
                  Authorized Tent City Booking Partner
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300 font-medium">
            <a href="#booking-section" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 text-[#F3E5AB] font-bold">
              <Bed className="w-4 h-4 text-[#D4AF37]" /> Book Package
            </a>
            <a href="#room-categories" className="hover:text-[#D4AF37] transition-colors hidden md:inline">
              Tents & Suites
            </a>
            <a href="#itinerary-timeline" className="hover:text-[#D4AF37] transition-colors hidden md:inline">
              Itinerary
            </a>
            <button onClick={() => setShowPolicyModal(true)} className="hover:text-[#D4AF37] transition-colors hidden sm:flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Policies
            </button>
            <Link to="/auth" className="text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 font-black px-4 py-2 rounded-xl text-xs shadow-lg transition-transform active:scale-95">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* HERO BANNER SECTION */}
      <section className="relative py-12 border-b border-[#D4AF37]/25 overflow-hidden bg-gradient-to-b from-[#081226] via-[#060D1E] to-[#050B1A]">
        <div className="absolute inset-0 bg-[url('/rann_utsav_white_desert.jpg')] bg-cover bg-center opacity-20 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B1A] via-[#050B1A]/85 to-transparent" />

        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3.5 py-1 rounded-full text-xs font-black uppercase text-[#F3E5AB] tracking-widest shadow-md">
                  <Award className="w-4 h-4 text-[#D4AF37]" /> Authorized Tent City Booking Partner
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Best Price Guarantee
                </span>
              </div>

              <h1 className="font-serif text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 tracking-tight leading-tight">
                Rann Utsav Kutch 2026–2027
              </h1>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
                Experience the majestic White Desert at Tent City Dhordo. Includes luxury air-conditioned tent accommodation, all gourmet meals, fixed AC coach transfers from Bhuj Station & Airport, White Rann sunset walks, and live Kutchi cultural nights.
              </p>

              <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-slate-300 flex-wrap">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> All Gourmet Meals Included
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Fixed AC Bus Pickup from Bhuj
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Complimentary Sightseeing Tours
                </div>
              </div>
            </div>

            {/* Stepper Indicator Badge */}
            <div className="bg-[#09142e]/90 border border-[#D4AF37]/40 p-5 rounded-2xl shadow-2xl shrink-0 w-full lg:w-80 space-y-3">
              <span className="text-[10px] text-[#D4AF37] font-mono font-black uppercase tracking-widest block">
                Official Evoke Booking Workflow
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#F3E5AB] font-bold">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-slate-950 font-black text-xs flex items-center justify-center">1</div>
                  <span>Select Package & Tents</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 pl-8">
                  <span>Step 2: Room Selection</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 pl-8">
                  <span>Step 3: Traveler Details</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 pl-8">
                  <span>Step 4: Reservation Summary</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA: SPACIOUS 8-COL / 4-COL LAYOUT */}
      <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10" id="booking-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT MAIN COLUMN: 8 COLS */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* 1. STEP 1 BOOKING ENGINE CARD (MATCHING EVOKE FORM SEQUENCE) */}
            <div className="bg-[#09142e]/90 border border-[#D4AF37]/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
              
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#D4AF37] font-mono font-black uppercase tracking-widest block">Step 1</span>
                  <h2 className="text-xl font-serif font-black text-white">Select Package & Room Configuration</h2>
                </div>
                <span className="text-xs text-[#F3E5AB] font-mono bg-[#D4AF37]/15 px-3 py-1 rounded-full border border-[#D4AF37]/30 font-bold">
                  Instant Rate Calculation
                </span>
              </div>

              {/* SPACIOUS 2-COLUMN FORM GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* FIELD 1: PACKAGE * Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Package <span className="text-rose-400">*</span></span>
                    <span className="text-[10px] text-[#D4AF37] font-mono font-bold">Stay Duration</span>
                  </label>
                  <select
                    value={selectedPackageNights}
                    onChange={(e) => setSelectedPackageNights(parseInt(e.target.value))}
                    className="w-full bg-[#0d1b3d] border border-[#D4AF37]/50 text-white font-bold text-sm rounded-xl p-3.5 focus:outline-none focus:border-[#D4AF37] transition-all shadow-inner"
                  >
                    <option value={1} className="bg-[#091024]">1 Night (2 Days / 1 Night)</option>
                    <option value={2} className="bg-[#091024]">2 Nights (3 Days / 2 Nights)</option>
                    <option value={3} className="bg-[#091024]">3 Nights (4 Days / 3 Nights)</option>
                    <option value={4} className="bg-[#091024]">4 Nights (5 Days / 4 Nights)</option>
                  </select>
                </div>

                {/* FIELD 2: ACCOMMODATION CATEGORY * Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Accommodation Category <span className="text-rose-400">*</span></span>
                    <span className="text-[10px] text-[#F3E5AB] font-mono font-bold">Tent City Dhordo</span>
                  </label>
                  <select
                    value={selectedAccCategory}
                    onChange={(e) => setSelectedAccCategory(e.target.value)}
                    className="w-full bg-[#0d1b3d] border border-[#D4AF37]/50 text-[#F3E5AB] font-extrabold text-sm rounded-xl p-3.5 focus:outline-none focus:border-[#D4AF37] transition-all shadow-inner"
                  >
                    {Object.entries(roomRatesPerPersonBase).map(([key, room]) => (
                      <option key={key} value={key} className="bg-[#091024] text-white">
                        {room.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* FIELD 3: CHECK IN DATE * Picker (Check-out Date auto-calculated) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Check In Date <span className="text-rose-400">*</span></span>
                    <span className="text-[11px] text-slate-400 font-medium">Check-out: <strong className="text-[#F3E5AB]">{checkOutDateStr}</strong></span>
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-[#0d1b3d] border border-[#D4AF37]/50 text-white font-bold text-sm rounded-xl p-3.5 focus:outline-none focus:border-[#D4AF37] transition-all shadow-inner"
                  />
                  {seasonInfo.label && (
                    <div className={`mt-2 p-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                      activeSeasonTier === 3 ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' :
                      activeSeasonTier === 2 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                      'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    }`}>
                      <Sparkles className="w-4 h-4 shrink-0" />
                      {seasonInfo.label}
                    </div>
                  )}
                </div>

                {/* FIELD 4: NO. OF TENTS * Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>No. of Tents Required <span className="text-rose-400">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">Max 5 Tents per booking</span>
                  </label>
                  <select
                    value={tentList.length}
                    onChange={(e) => handleTentCountChange(parseInt(e.target.value))}
                    className="w-full bg-[#0d1b3d] border border-[#D4AF37]/50 text-white font-bold text-sm rounded-xl p-3.5 focus:outline-none focus:border-[#D4AF37] transition-all shadow-inner"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n} className="bg-[#091024]">
                        {n} {n === 1 ? 'Tent / Cottage' : 'Tents / Cottages'}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* TENT / COTTAGE PAX ALLOCATION SECTION */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-extrabold text-[#F3E5AB] flex items-center gap-2">
                    <Bed className="w-4 h-4 text-[#D4AF37]" /> Passenger Occupancy Breakdown ({totalOccupants} Guests Total)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Max 3 Pax Per Tent</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tentList.map((tent, idx) => (
                    <div key={tent.id} className="bg-[#0d1b3d]/90 border border-white/15 p-4 rounded-2xl space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#F3E5AB] text-xs flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F3E5AB] font-black text-xs flex items-center justify-center">
                            T{idx + 1}
                          </span>
                          Tent/Cottage {idx + 1} <span className="text-rose-400">*</span>
                        </span>
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                          {tent.pax === 1 ? '1 Pax (Single - 75% Rate)' : tent.pax === 2 ? '2 Pax (Double)' : '3 Pax (Triple - Extra Bed)'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300 font-semibold block">No. of Pax:</label>
                        <select
                          value={tent.pax}
                          onChange={(e) => handleTentPaxChange(tent.id, parseInt(e.target.value))}
                          className="w-full bg-[#081226] border border-white/20 text-white font-bold text-xs rounded-xl p-3 focus:outline-none focus:border-[#D4AF37]"
                        >
                          <option value={1}>1 Pax (Single Occupancy - 75% Double Rate)</option>
                          <option value={2}>2 Pax (Double Occupancy - Base Adult Rate)</option>
                          <option value={3}>3 Pax (Triple Occupancy - 2 Adults + 1 Extra Bed)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 2. ROOM ACCOMMODATION VISUAL CATEGORY SHOWCASE */}
            <div className="space-y-6" id="room-categories">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#D4AF37] font-mono font-black uppercase tracking-widest block">Step 2</span>
                  <h2 className="text-2xl font-serif font-black text-white">Tent City Dhordo Room Categories</h2>
                </div>
                <span className="text-xs text-slate-400">Click any card to select category</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(roomRatesPerPersonBase).map(([key, room]) => {
                  const isSelected = selectedAccCategory === key;
                  let displayPrice = room.rate3N;
                  if (computedNights === 1) displayPrice = room.rate1N;
                  else if (computedNights === 2) displayPrice = room.rate2N;

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedAccCategory(key)}
                      className={`rounded-3xl border overflow-hidden cursor-pointer transition-all duration-300 relative group ${
                        isSelected
                          ? "bg-[#09142e] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.25)] ring-2 ring-[#D4AF37]"
                          : "bg-[#09142e]/60 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3.5 right-3.5 z-10 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-3 py-1 rounded-full font-black text-xs uppercase shadow-lg flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Selected Category
                        </div>
                      )}

                      <div className="h-44 overflow-hidden relative">
                        <img
                          src={room.img}
                          alt={room.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09142e] via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-4 text-base font-black text-[#F3E5AB] bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-[#D4AF37]/30">
                          ₹{displayPrice.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-300">/pax ({computedNights}N)</span>
                        </span>
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="text-base font-serif font-black text-white">{room.label}</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">{room.sub}</p>

                        <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400 border-t border-white/10">
                          <span>🛏️ Queen / Twin Beds</span>
                          <span>🍽️ All Meals</span>
                          <span>🚌 Bhuj Pickup</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. DAY-BY-DAY ITINERARY TIMELINE FROM PDF */}
            <div className="space-y-6" id="itinerary-timeline">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs text-[#D4AF37] font-mono font-black uppercase tracking-widest block">Step 3</span>
                  <h2 className="text-2xl font-serif font-black text-white">{currentItineraryObj.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{currentItineraryObj.subtitle}</p>
                </div>
                <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/15 px-3 py-1 rounded-full border border-[#D4AF37]/30 font-bold">
                  {computedNights} N / {computedDays} D PDF Schedule
                </span>
              </div>

              {/* Photo Showcase Carousel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => { setSelectedPhotoIndex(0); setGalleryOpen(true); }}
                  className="md:col-span-2 relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer h-48"
                >
                  <img
                    src="/rann_utsav_white_desert.jpg"
                    alt="Great White Rann Sunset Walk"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <span className="text-[10px] uppercase font-black text-[#D4AF37] tracking-widest block">White Desert Sunset</span>
                      <h4 className="text-sm font-serif font-bold text-white">Walk Across Endless Salt Flats</h4>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => { setSelectedPhotoIndex(1); setGalleryOpen(true); }}
                  className="relative rounded-2xl overflow-hidden shadow-lg border border-white/10 group cursor-pointer h-48"
                >
                  <img
                    src="/rann_utsav_tent_city.jpg"
                    alt="Tent City Night"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-3">
                    <h4 className="text-xs font-serif font-bold text-white">Illuminated Tent City Dhordo</h4>
                  </div>
                </div>
              </div>

              {/* Timeline Days Cards */}
              <div className="space-y-6">
                {currentItineraryObj.days.map((dayItem, dIdx) => (
                  <div key={dIdx} className="bg-[#09142e]/80 border border-white/15 rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <span className="px-3.5 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black rounded-lg uppercase shadow-md">
                        {dayItem.day}
                      </span>
                      <h3 className="text-base font-serif font-bold text-white">{dayItem.title}</h3>
                    </div>

                    <div className="space-y-4 pl-2 border-l-2 border-[#D4AF37]/50 ml-3 pt-2">
                      {dayItem.events.map((ev, eIdx) => (
                        <div key={eIdx} className="text-xs space-y-1 pl-4 relative">
                          <div className="w-3 h-3 rounded-full bg-[#D4AF37] absolute -left-[19px] top-1 ring-4 ring-[#050B1A]" />
                          <span className="font-mono text-xs text-[#F3E5AB] font-extrabold block">{ev.time}</span>
                          <p className="text-slate-300 leading-relaxed text-xs">{ev.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. FIXED BHUJ PICKUP TIMINGS CARD */}
            <div className="bg-[#09142e]/90 border border-[#D4AF37]/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Bus className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-base font-serif font-black text-white">Fixed Bhuj Pickup Departure Timings</h3>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-500/40">
                  Included in Package (₹0 Extra)
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Official AC Shared Coach transfers operate from Bhuj Railway Station and Bhuj Airport to Tent City Dhordo (~85 km / 1 hr 45 min drive) at fixed scheduled departure times:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["08:15 AM", "10:00 AM", "01:30 PM", "03:30 PM"].map((t) => (
                  <div key={t} className="bg-[#0d1b3d] border border-white/15 p-3 rounded-xl text-center font-mono text-xs text-slate-200">
                    🚌 <strong>{t}</strong> Departure
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT STICKY FARE SIDEBAR: 4 COLS */}
          <div className="lg:col-span-4" id="sticky-booking-panel">
            <div className="bg-[#09142e]/95 border border-[#D4AF37]/50 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-24">
              
              {/* Sidebar Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                    Package Fare Summary
                  </h3>
                  <p className="text-xs text-slate-400">Official Package Rate Card</p>
                </div>
                <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/15 px-3 py-1 rounded-full border border-[#D4AF37]/30 font-bold">
                  {computedNights} N / {computedDays} D
                </span>
              </div>

              {/* Occupants & Dates Card */}
              <div className="bg-[#0d1b3d] border border-white/15 p-4 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-white text-sm">
                  {travelDates}
                </div>
                <div className="text-slate-300 font-medium">
                  {tentList.length} Tent{tentList.length > 1 ? 's' : ''} • {totalOccupants} Guests Total
                </div>
                
                <div className="text-xs text-[#F3E5AB] pt-2 space-y-1 font-semibold border-t border-white/10">
                  {tentList.map((t, i) => (
                    <div key={i} className="flex justify-between">
                      <span>Tent {i + 1}:</span>
                      <span>{t.pax === 1 ? '1 Pax (Single)' : t.pax === 2 ? '2 Pax (Double)' : '3 Pax (Triple)'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Room & Inclusions Summary */}
              <div className="space-y-3 text-xs border-b border-white/10 pb-4">
                <div>
                  <span className="text-slate-400 font-semibold block text-xs">Room Category:</span>
                  <span className="text-[#F3E5AB] font-bold text-sm block">{roomRatesPerPersonBase[selectedAccCategory]?.label}</span>
                  <span className="text-[11px] text-slate-400 block">{roomRatesPerPersonBase[selectedAccCategory]?.sub}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block text-xs">Transfers & Excursions:</span>
                  <span className="text-emerald-400 font-bold block">Fixed AC Bus Pickup & Included Sightseeing</span>
                </div>
              </div>

              {/* 10% DISCOUNT PROMO WIDGET */}
              <div className="bg-[#061026] border border-[#D4AF37]/40 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    🏷️ Promo / Discount Coupon
                  </span>
                  <span className="text-[10px] font-black uppercase text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
                    10% OFF
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="bg-emerald-500/15 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-emerald-400 block flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Coupon '{appliedCoupon}' Applied!
                      </span>
                      <span className="text-[11px] text-slate-300">10% Flat Discount applied (Saved ₹{discountAmount.toLocaleString('en-IN')})</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-slate-400 hover:text-white p-1"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. RANN10"
                        className="bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs uppercase w-full focus:outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shrink-0 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ITEMIZED FARE SUMMARY BREAKDOWN */}
              <div className="bg-[#0d1b3d] border border-white/15 p-4 rounded-2xl space-y-2 text-xs text-slate-300 font-medium">
                <div className="flex justify-between">
                  <span>Package Subtotal:</span>
                  <span className="text-white font-bold">₹{subtotalFare.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>10% Discount ({appliedCoupon}):</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>GST (18%):</span>
                  <span>+ ₹{taxesAndFees.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Per Person Rate Highlight */}
              <div className="bg-[#D4AF37]/15 border border-[#D4AF37]/40 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">Rate per Person:</span>
                <span className="text-lg font-black text-[#F3E5AB]">₹{perPersonFare.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">/pax</span></span>
              </div>

              {/* Total Price Highlight */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Total Package Price</span>
                  <span className="text-[11px] text-slate-400 block">18% GST Included</span>
                </div>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                  ₹{totalPackageFare.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Book Now Button */}
              <button
                onClick={() => {
                  const categoryObj = roomRatesPerPersonBase[selectedAccCategory] || roomRatesPerPersonBase["ac_premium"];
                  const bookingPayload = {
                    id: "rann-utsav-tent-city",
                    title: `Rann Utsav Kutch (${categoryObj.label})`,
                    price: totalPackageFare,
                    duration: `${computedDays} Days / ${computedNights} Nights`,
                    image: categoryObj.img || "/rann_utsav_white_desert.jpg",
                    description: `Official Evoke Tent City Dhordo Package (${tentList.length} Tent(s), ${totalOccupants} Guests, Check-in: ${checkInDate}, Check-out: ${checkOutDateStr})`,
                    highlights: [
                      "All Gourmet Meals (Breakfast, Lunch, High Tea, Dinner)",
                      "Fixed AC Shared Coach Pickup from Bhuj Station & Airport",
                      "White Rann Sunset & Sunrise Desert Walk Excursions",
                      "Smritivan Earthquake Museum & Live Kutchi Folk Cultural Show"
                    ],
                    checkInDate,
                    checkOutDate: checkOutDateStr,
                    tents: tentList.length,
                    pax: totalOccupants,
                    selectedCategory: categoryObj.label,
                    tentDetails: tentList
                  };

                  localStorage.setItem('pending_booking_payload', JSON.stringify(bookingPayload));
                  toast({
                    title: "⚡ Redirecting to Booking Checkout...",
                    description: `Rann Utsav Package (${tentList.length} Tent, ${totalOccupants} Guests). Total: ₹${totalPackageFare.toLocaleString('en-IN')}`,
                  });
                  navigate('/booking', { state: { packageData: bookingPayload } });
                }}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-slate-950 font-black py-4.5 rounded-2xl shadow-2xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm tracking-wider uppercase"
              >
                Book Package Now
              </button>

              <div className="text-center space-y-2 pt-1">
                <span className="text-[11px] text-slate-400 font-medium block">Pay Securely via Razorpay / PayU</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-2.5 py-1 bg-white/10 rounded-md text-[10px] font-bold text-white border border-white/10">VISA</span>
                  <span className="px-2.5 py-1 bg-white/10 rounded-md text-[10px] font-bold text-white border border-white/10">Mastercard</span>
                  <span className="px-2.5 py-1 bg-white/10 rounded-md text-[10px] font-bold text-white border border-white/10">UPI</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* CANCELLATION POLICY MODAL */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#09142e] border border-[#D4AF37]/50 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowPolicyModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Shield className="w-6 h-6 text-[#D4AF37]" />
              <h3 className="text-xl font-serif font-black text-[#F3E5AB]">Official Evoke Terms & Cancellation Policies</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-2 text-[#D4AF37]">Cancellation Policy</h4>
                <div className="space-y-2">
                  <div className="flex justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-slate-300">&gt; 30 days prior to check-in</span>
                    <span className="font-bold text-emerald-400">90% Refund</span>
                  </div>
                  <div className="flex justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-slate-300">15 to 30 days prior to check-in</span>
                    <span className="font-bold text-amber-400">60% Refund</span>
                  </div>
                  <div className="flex justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-slate-300">&lt; 15 days prior to check-in</span>
                    <span className="font-bold text-rose-400">No Refund (0%)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-2 text-[#D4AF37]">Amendment Charges</h4>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span>Change in Check-in Date</span>
                    <span className="font-bold text-white">10% of total booking amount</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span>Primary Guest Name Change</span>
                    <span className="font-bold text-white">5% of total booking amount</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPolicyModal(false)}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black py-3.5 rounded-xl hover:from-amber-300 hover:to-yellow-400 text-xs transition-colors shadow-lg"
            >
              Close Terms
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN GALLERY LIGHTBOX MODAL */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-[#D4AF37] transition-colors p-2 bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full text-center space-y-4">
            <img
              src={galleryPhotos[selectedPhotoIndex].url}
              alt={galleryPhotos[selectedPhotoIndex].title}
              className="max-h-[75vh] mx-auto rounded-3xl shadow-2xl border border-white/20 object-contain"
            />
            <div>
              <span className="text-xs uppercase font-bold text-[#D4AF37] tracking-wider block">
                {galleryPhotos[selectedPhotoIndex].tag}
              </span>
              <h3 className="text-xl font-serif font-bold text-white">
                {galleryPhotos[selectedPhotoIndex].title}
              </h3>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {galleryPhotos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo.url}
                  alt={photo.title}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-16 h-12 object-cover rounded-xl cursor-pointer transition-all border-2 ${
                    selectedPhotoIndex === idx ? "border-[#D4AF37] scale-110" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RannUtsavMockupPage;
