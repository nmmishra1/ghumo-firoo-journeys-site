import { supabase } from '@/integrations/supabase/client';

export interface ItineraryDay {
  id?: string;
  package_slug: string;
  day_number: number;
  title: string;
  description: string;
  activities?: string[];
  overnight_stay?: string;
  meals?: string;
}

const LOCAL_STORAGE_ITINERARIES_KEY = 'ghumo_firoo_db_package_itineraries';

// Baseline Hardcoded Itineraries Seed Data for All Packages
export const INITIAL_PACKAGE_ITINERARIES: Record<string, Omit<ItineraryDay, 'package_slug'>[]> = {
  "char-dham-yatra-from-delhi": [
    {
      day_number: 1,
      title: "Delhi Pickup → Drive to Haridwar (220 km / 6 hrs) → Ganga Aarti",
      description: "Chauffeured pickup from Delhi Airport / Railway Station / Home. Scenic highway drive to sacred Haridwar. Hotel check-in, permit registration, and evening VIP Ganga Aarti at Har Ki Pauri ghat.",
      activities: ["Delhi Pickup", "Highway Drive to Haridwar", "Hotel Check-in", "VIP Har Ki Pauri Ganga Aarti"]
    },
    {
      day_number: 2,
      title: "Haridwar to Barkot via Mussoorie & Kempty Falls (210 km / 7 hrs)",
      description: "Morning drive along Yamuna River valley towards Barkot via Mussoorie hill station. Stop at famous Kempty Falls for scenic views. Arrive Barkot, check-in to Himalayan resort, biometric permit verification for Yamunotri.",
      activities: ["Mussoorie En-route Visit", "Kempty Falls Stop", "Yamuna Valley Drive", "Barkot Resort Check-in"]
    },
    {
      day_number: 3,
      title: "Barkot to Janki Chatti → Trek to Yamunotri Dham (6km) → Return Barkot",
      description: "Early morning drive to Janki Chatti (45 km). Begin 6km holy trek (on foot / pony / palki) to Yamunotri Temple at 10,804 ft. Holy dip in Surya Kund thermal springs, Divya Shila worship, Darshan at Yamunotri Temple, and trek back to Janki Chatti for return drive to Barkot.",
      activities: ["Janki Chatti Drive", "Yamunotri 6km Trek", "Surya Kund Thermal Dip", "Divya Shila Worship", "Yamunotri Darshan"]
    },
    {
      day_number: 4,
      title: "Barkot to Uttarkashi (100 km / 4 hrs) → Kashi Vishwanath Temple",
      description: "Picturesque drive along Bhagirathi River to Uttarkashi. Check-in to riverside hotel. Afternoon visit to ancient Kashi Vishwanath Temple and Shakti Temple (featuring 26ft heavy iron spear).",
      activities: ["Bhagirathi Valley Drive", "Uttarkashi Hotel Check-in", "Kashi Vishwanath Temple", "Shakti Temple Visit"]
    },
    {
      day_number: 5,
      title: "Uttarkashi to Gangotri Dham via Harsil Valley → Return Uttarkashi (200 km)",
      description: "Day excursion to Gangotri Dham via picturesque Harsil Apple Valley. Take a holy dip in icy Bhagirathi River. Gangotri Mata Temple Darshan, Bhagirathi Puja, and leisurely walk through Harsil pine forests before returning to Uttarkashi.",
      activities: ["Harsil Valley Drive", "Bhagirathi River Dip", "Gangotri Temple Darshan", "Harsil Apple Orchard Walk"]
    },
    {
      day_number: 6,
      title: "Uttarkashi to Guptkashi via Tehri Dam Lake (220 km / 8 hrs)",
      description: "Long scenic drive passing Tehri Dam lake view point and Mandakini River valley to Guptkashi (base for Kedarnath Yatra). Check-in to resort, biometric permit verification, and orientation for Kedarnath trek.",
      activities: ["Tehri Dam Viewpoint", "Mandakini Valley Drive", "Guptkashi Check-in", "Kedarnath Trek Briefing"]
    },
    {
      day_number: 7,
      title: "Guptkashi to Gaurikund → Trek / Chopper to Kedarnath Dham → Evening Aarti",
      description: "Early morning transfer to Gaurikund. Trek 16 km (or shuttle chopper flight from Sersi/Phata helipad) to Kedarnath Temple at 11,755 ft. VIP temple queue entry, evening Shiv Aarti, and night stay near Kedarnath temple.",
      activities: ["Gaurikund Transfer", "Kedarnath Trek / Chopper Flight", "VIP Temple Entry", "Evening Shiv Aarti", "Night Stay near Temple"]
    },
    {
      day_number: 8,
      title: "Kedarnath Temple Abhishekam → Trek Down to Guptkashi",
      description: "Early morning Abhishekam Puja at Kedarnath Jyotirlinga. Trek down to Gaurikund and transfer back to Guptkashi resort for rest and evening Shiv Parvati Temple Darshan.",
      activities: ["Kedarnath Abhishekam Puja", "Trek Down to Gaurikund", "Guptkashi Resort Rest", "Guptkashi Temple Visit"]
    },
    {
      day_number: 9,
      title: "Guptkashi to Badrinath Dham via Chopta & Joshimath (190 km / 7 hrs)",
      description: "Scenic drive via Chopta alpine meadows (Mini Switzerland) and Joshimath (visit Narsingh Temple). Arrive Badrinath, take a holy dip in thermal hot springs at Tapt Kund, and attend evening Badrivishal Aarti.",
      activities: ["Chopta Meadows Drive", "Joshimath Narsingh Temple", "Tapt Kund Thermal Dip", "Badrivishal Evening Aarti"]
    },
    {
      day_number: 10,
      title: "Badrinath Morning Darshan → Mana First Indian Village → Rudraprayag",
      description: "Morning Puja at Badrinath Temple. Tour Mana Village (India's first border village) to see Vyas Gufa, Ganesh Gufa & Saraswati River Bhim Pul. Afternoon drive to Rudraprayag at Alaknanda-Mandakini river confluence.",
      activities: ["Badrivishal Puja", "Mana Border Village Tour", "Vyas & Ganesh Gufa", "Bhim Pul", "Rudraprayag Sangam View"]
    },
    {
      day_number: 11,
      title: "Rudraprayag to Haridwar via Devprayag & Rishikesh Ram Jhula",
      description: "Drive along Alaknanda River to Devprayag (confluence of Bhagirathi & Alaknanda to form Ganga). Tour Rishikesh Laxman Jhula, Ram Jhula, and Parmarth Niketan Ganga Aarti before proceeding to Haridwar hotel.",
      activities: ["Devprayag Sangam Visit", "Rishikesh Ram Jhula", "Parmarth Niketan Aarti", "Haridwar Hotel Stay"]
    },
    {
      day_number: 12,
      title: "Haridwar to Delhi Drop-off (220 km / 6 hrs)",
      description: "Breakfast, checkout, and chauffeured drive back to Delhi with drop-off at Airport / Railway Station / Residence.",
      activities: ["Haridwar Checkout", "Highway Drive to Delhi", "Delhi Station/Airport Drop-off"]
    }
  ],
  "do-dham-yatra": [
    {
      day_number: 1,
      title: "Haridwar / Dehradun Pickup → Drive to Guptkashi (210 km / 7 hrs)",
      description: "Pickup from Haridwar / Dehradun. Drive through Mandakini river valley to Guptkashi. Check-in to resort, permit verification, and briefing for Kedarnath trek.",
      activities: ["Haridwar/Dehradun Pickup", "Mandakini Valley Drive", "Guptkashi Resort Stay"]
    },
    {
      day_number: 2,
      title: "Guptkashi to Gaurikund → Trek / Chopper to Kedarnath Dham",
      description: "Transfer to Gaurikund. Trek 16 km or shuttle chopper flight to Kedarnath Dham. VIP Temple entry, evening Shiv Aarti, and night stay near temple.",
      activities: ["Kedarnath Trek / Chopper", "VIP Temple Entry", "Evening Shiv Aarti"]
    },
    {
      day_number: 3,
      title: "Kedarnath Abhishekam Puja → Trek Down to Guptkashi",
      description: "Morning Puja at Kedarnath Jyotirlinga. Trek down to Gaurikund and transfer back to Guptkashi resort for rest.",
      activities: ["Kedarnath Abhishekam", "Trek Down Gaurikund", "Guptkashi Resort Rest"]
    },
    {
      day_number: 4,
      title: "Guptkashi to Badrinath Dham via Chopta Meadows (190 km)",
      description: "Drive via Chopta alpine meadows and Joshimath Narsingh Temple to Badrinath Dham. Holy dip at Tapt Kund thermal springs & Badrivishal evening Aarti.",
      activities: ["Chopta Meadows Drive", "Tapt Kund Thermal Dip", "Badrivishal Evening Aarti"]
    },
    {
      day_number: 5,
      title: "Badrinath Temple Darshan → Mana Village → Haridwar Drop-off",
      description: "Morning Temple Darshan, Mana First Indian Village tour (Vyas Gufa, Bhim Pul), and drive back via Devprayag to Haridwar/Rishikesh drop-off.",
      activities: ["Badrinath Darshan", "Mana Village Tour", "Devprayag Sangam", "Haridwar Station Drop-off"]
    }
  ],
  "kashmir-glory-6d5n": [
    {
      day_number: 1,
      title: "Srinagar Airport Pickup → Houseboat Check-in & Shikara Ride",
      description: "Chauffeured pickup from Srinagar Airport (SXR). Transfer to luxury Dal Lake Cedar Houseboat. Afternoon 1-hour romantic Shikara ride across Dal Lake visiting Floating Post Office & Meena Bazaar.",
      activities: ["Srinagar Airport Pickup", "Dal Lake Houseboat Check-in", "Sunset Shikara Ride", "Floating Market Visit"]
    },
    {
      day_number: 2,
      title: "Srinagar to Gulmarg Excursion → Gondola Cable Car Ride (Phase 1 & 2)",
      description: "Drive to Gulmarg Meadow of Flowers (55 km / 2 hrs). Ride the world's highest Gondola Cable Car to Kongdoori (Phase 1) and Apharwat Peak (Phase 2 at 14,000 ft). Snow activities and return to Srinagar hotel.",
      activities: ["Gulmarg Scenic Drive", "Gondola Phase 1 & 2 Passes", "Apharwat Snow Peak View", "Golf Course Photo Stop"]
    },
    {
      day_number: 3,
      title: "Srinagar to Pahalgam Valley → Betaab & Aru Valley Tour",
      description: "Drive to Pahalgam Valley of Shepherds (90 km / 3 hrs) via Saffron fields of Pampore and Avantipur ruins. Visit Betaab Valley, Aru Valley, and Lidder River bank.",
      activities: ["Pampore Saffron Fields", "Avantipur Temple Ruins", "Betaab Valley Excursion", "Lidder River Walk"]
    },
    {
      day_number: 4,
      title: "Pahalgam to Sonmarg Meadow of Gold Day Trip",
      description: "Day excursion to Sonmarg (Meadow of Gold) along the Sind River. Optional pony ride to Thajiwas Glacier. Return to Srinagar hotel.",
      activities: ["Sind River Valley Drive", "Sonmarg Meadow Tour", "Thajiwas Glacier Trek / Pony", "Srinagar Hotel Stay"]
    },
    {
      day_number: 5,
      title: "Srinagar Local Sightseeing → Mughal Gardens & Shankaracharya Temple",
      description: "Tour famous Mughal Gardens: Nishat Bagh (Garden of Pleasure), Shalimar Bagh (Abode of Love), Pari Mahal, and ancient Shankaracharya Temple hilltop panoramic view.",
      activities: ["Nishat & Shalimar Gardens", "Pari Mahal Viewpoint", "Shankaracharya Hill Temple", "Lal Chowk Craft Shopping"]
    },
    {
      day_number: 6,
      title: "Srinagar Hotel Checkout → Airport Drop-off",
      description: "Breakfast, Kashmiri dry fruit shopping, and chauffeured drop-off at Srinagar Airport for departure flight.",
      activities: ["Kashmiri Craft Shopping", "Srinagar Airport Drop-off"]
    }
  ],
  "rann-utsav-2d1n": [
    {
      day_number: 1,
      title: "Bhuj Pickup → Transfer to Dhordo Tent City → White Rann Sunset",
      description: "Pickup from Bhuj Station/Airport. Transfer to Dhordo Tent City (85 km). Traditional Kutchi welcome, check-in to AC Cottage/Tent. Lunch, evening transfer to White Rann for magnificent sunset and cultural folk dance performance at Tent City.",
      activities: ["Bhuj Pickup", "Dhordo Tent City Check-in", "Traditional Garba & Folk Dance", "White Rann Sunset View"]
    },
    {
      day_number: 2,
      title: "White Rann Sunrise → Gandhi Nu Gam Craft Village → Bhuj Drop-off",
      description: "Early morning camel cart ride to White Rann for sunrise over salt desert. Breakfast, check-out, visit Gandhi Nu Gam handicraft village (Kutchi embroidery & pottery), and transfer to Bhuj Airport/Station.",
      activities: ["White Rann Sunrise Camel Cart", "Gandhi Nu Gam Handicraft Tour", "Bhuj Craft Shopping", "Bhuj Airport Drop-off"]
    }
  ]
};

export const itineraryService = {
  // Retrieve itinerary days for a package slug
  getItinerary: async (slug: string): Promise<ItineraryDay[]> => {
    // 1. Try fetching from local storage database cache first
    let localMap: Record<string, ItineraryDay[]> = {};
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ITINERARIES_KEY);
      if (stored) {
        localMap = JSON.parse(stored);
      }
    } catch {
      localMap = {};
    }

    if (localMap[slug] && localMap[slug].length > 0) {
      return localMap[slug].sort((a, b) => a.day_number - b.day_number);
    }

    // 2. Try fetching from Supabase table `package_itineraries`
    try {
      const { data, error } = await supabase
        .from('package_itineraries' as any)
        .select('*')
        .eq('package_slug' as any, slug)
        .order('day_number' as any, { ascending: true });

      if (!error && data && data.length > 0) {
        return data as ItineraryDay[];
      }
    } catch (e) {
      console.warn('DB package_itineraries table query skipped, using baseline:', e);
    }

    // 3. Fallback to baseline hardcoded seed data
    const baseline = INITIAL_PACKAGE_ITINERARIES[slug] || [];
    return baseline.map(day => ({ package_slug: slug, ...day }));
  },

  // Save/Update full day-by-day itinerary for a package
  saveItinerary: async (slug: string, days: Omit<ItineraryDay, 'package_slug'>[]): Promise<boolean> => {
    const formattedDays: ItineraryDay[] = days.map((day, idx) => ({
      package_slug: slug,
      day_number: idx + 1,
      title: day.title || `Day ${idx + 1} Itinerary`,
      description: day.description || '',
      activities: day.activities || [],
      overnight_stay: day.overnight_stay || '',
      meals: day.meals || ''
    }));

    // Save to Local Storage Cache
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ITINERARIES_KEY);
      const map = stored ? JSON.parse(stored) : { ...INITIAL_PACKAGE_ITINERARIES };
      map[slug] = formattedDays;
      localStorage.setItem(LOCAL_STORAGE_ITINERARIES_KEY, JSON.stringify(map));
    } catch (e) {
      console.error('Error saving local itinerary storage:', e);
    }

    // Save to Supabase DB asynchronously
    try {
      // Delete old items for this slug first
      await supabase.from('package_itineraries' as any).delete().eq('package_slug' as any, slug);
      // Insert new items
      await supabase.from('package_itineraries' as any).insert(formattedDays as any);
    } catch (err) {
      console.warn('Supabase package_itineraries sync:', err);
    }

    return true;
  },

  // Seed all initial hardcoded package itineraries into database cache
  seedAllPackageItineraries: async (): Promise<void> => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ITINERARIES_KEY);
      if (!stored) {
        localStorage.setItem(LOCAL_STORAGE_ITINERARIES_KEY, JSON.stringify(INITIAL_PACKAGE_ITINERARIES));
      }
    } catch {}
  }
};
