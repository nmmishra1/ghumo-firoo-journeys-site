export interface DestinationHierarchy {
  country: string;
  state: string;
  city: string;
  destination: string;
  attractions: string[];
  activities: string[];
  suggestedPackages?: string[];
}

export const STATIC_HIERARCHIES: Record<string, Omit<DestinationHierarchy, 'city' | 'destination'>> = {
  'haridwar': {
    country: 'India',
    state: 'Uttarakhand',
    attractions: ['Har Ki Pauri', 'Mansa Devi Temple', 'Chandi Devi Temple'],
    activities: ['Ganga Aarti', 'Temple Ropeway Tour', 'Spiritual Walk'],
    suggestedPackages: ['Char Dham', 'Uttarakhand Explorer', 'Spiritual Uttarakhand', 'Haridwar Day Tour']
  },
  'rishikesh': {
    country: 'India',
    state: 'Uttarakhand',
    attractions: ['Ram Jhula', 'Laxman Jhula', 'Triveni Ghat', 'Neer Garh Waterfall'],
    activities: ['River Rafting', 'Bungee Jumping', 'Camping', 'Yoga Session'],
    suggestedPackages: ['Char Dham', 'Spiritual Uttarakhand', 'Uttarakhand Adventure', 'Rishikesh Weekend Getaway']
  },
  'nainital': {
    country: 'India',
    state: 'Uttarakhand',
    attractions: ['Naini Lake', 'Mall Road', 'Snow View Point', 'Tiffin Top'],
    activities: ['Boating', 'Cable Car Ride', 'Lake Trekking'],
    suggestedPackages: ['Nainital Escape', 'Kumaon Hills Tour', 'Uttarakhand Explorer']
  },
  'srinagar': {
    country: 'India',
    state: 'Jammu & Kashmir',
    attractions: ['Dal Lake', 'Mughal Gardens', 'Shalimar Bagh', 'Nishat Bagh'],
    activities: ['Shikara Ride', 'Houseboat Stay', 'Local Shopping'],
    suggestedPackages: ['Kashmir Paradise', 'Srinagar Houseboat Special', 'Valley Explorer']
  },
  'dubai': {
    country: 'UAE',
    state: 'Dubai',
    attractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Miracle Garden'],
    activities: ['At The Top Visit', 'Desert Safari', 'Dhow Cruise', 'Skydiving'],
    suggestedPackages: ['Dubai Highlights', 'Luxury Dubai Desert Escape', 'UAE Wonders']
  },
  'phuket': {
    country: 'Thailand',
    state: 'Phuket',
    attractions: ['Phi Phi Islands', 'Patong Beach', 'Big Buddha', 'Wat Chalong'],
    activities: ['Snorkeling', 'Island Hopping', 'Scuba Diving'],
    suggestedPackages: ['Phuket Island Dream', 'Thailand Tropical Getaway', 'Phi Phi Explorer']
  },
  'singapore': {
    country: 'Singapore',
    state: 'Singapore City',
    attractions: ['Universal Studios', 'Gardens by the Bay', 'Marina Bay Sands', 'Night Safari', 'Sentosa Island'],
    activities: ['Amusement Rides', 'Cloud Forest Walk', 'Skypark Observation Deck'],
    suggestedPackages: ['Singapore Family Fun', 'City & Island Explorer', 'Singapore Malaysia Combo']
  },
  'paris': {
    country: 'France',
    state: 'Île-de-France',
    attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
    activities: ['Seine River Cruise', 'Museum Tour', 'Summit Climbing'],
    suggestedPackages: ['Paris Romance', 'French Heritage Tour', 'European Highlights']
  },
  'interlaken': {
    country: 'Switzerland',
    state: 'Bernese Oberland',
    attractions: ['Jungfraujoch', 'Harder Kulm', 'Lake Thun', 'Lake Brienz'],
    activities: ['Train Ride to Top', 'Paragliding', 'Scenic Cruise'],
    suggestedPackages: ['Swiss Alpine Wonders', 'Interlaken Active Adventure', 'Jungfrau Ski & Sun']
  }
};

/**
 * Resolves the full destination hierarchy for a given city name.
 */
export async function resolveDestinationHierarchy(cityName: string): Promise<DestinationHierarchy> {
  const normalizedKey = cityName.toLowerCase().trim();
  
  // 1. Check static lookup fallback first
  const staticMatch = STATIC_HIERARCHIES[normalizedKey];
  if (staticMatch) {
    return {
      country: staticMatch.country,
      state: staticMatch.state,
      city: cityName,
      destination: cityName,
      attractions: staticMatch.attractions,
      activities: staticMatch.activities,
      suggestedPackages: staticMatch.suggestedPackages || ['Custom Package']
    };
  }

  // Default values
  const defaultVal: DestinationHierarchy = {
    country: 'India',
    state: 'Other',
    city: cityName,
    destination: cityName,
    attractions: [],
    activities: [],
    suggestedPackages: ['Custom Package']
  };

  try {
    const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

    let cityData: any = null;
    try {
      const cRes = await fetch(`${API_BASE}/api.php?table=cities&city_name=${encodeURIComponent(cityName)}`);
      if (cRes.ok) {
        const arr = await cRes.json();
        if (Array.isArray(arr) && arr.length > 0) {
          cityData = arr[0];
        }
      }
    } catch (e) {
      console.error(e);
    }

    let attractions: string[] = [];
    let activities: string[] = [];
    
    try {
      const dRes = await fetch(`${API_BASE}/api.php?table=destinations&name=${encodeURIComponent(cityName)}`);
      if (dRes.ok) {
        const arr = await dRes.json();
        const destData = Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
        if (destData) {
          if (destData.sub_destinations) {
            attractions = Array.isArray(destData.sub_destinations)
              ? destData.sub_destinations
              : typeof destData.sub_destinations === 'string'
              ? JSON.parse(destData.sub_destinations)
              : [];
          }
          if (destData.popular_activities) {
            activities = Array.isArray(destData.popular_activities)
              ? destData.popular_activities
              : typeof destData.popular_activities === 'string'
              ? JSON.parse(destData.popular_activities)
              : [];
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (cityData) {
      const stateName = cityData.state || '';
      const countryName = cityData.country || 'India';
      const cityNameReal = cityData.city_name || cityData.name || cityName;
      let suggestedPackages = [`${cityNameReal} Escape`, `${cityNameReal} Explorer`, `${stateName} Highlights`].filter(Boolean);

      return {
        country: countryName,
        state: stateName || 'Other',
        city: cityNameReal,
        destination: cityNameReal,
        attractions,
        activities,
        suggestedPackages
      };
    }

    return {
      ...defaultVal,
      attractions,
      activities
    };
  } catch (err) {
    console.error('Failed to resolve hierarchy:', err);
    return defaultVal;
  }
}
