// Comprehensive Geographic Master Registry for States, Cities, and Countries

export const INDIAN_STATES: string[] = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export const INTERNATIONAL_STATE_COUNTRY_MAP: Record<string, string> = {
  'Jakarta': 'Indonesia',
  'Bali': 'Indonesia',
  'West Java': 'Indonesia',
  'Central Java': 'Indonesia',
  'East Java': 'Indonesia',
  'Interlaken': 'Switzerland',
  'Zurich': 'Switzerland',
  'Geneva': 'Switzerland',
  'Lucerne': 'Switzerland',
  'Bern': 'Switzerland',
  'Valais': 'Switzerland',
  'Île-de-France (Paris)': 'France',
  'Paris': 'France',
  'Provence-Alpes-Côte d\'Azur': 'France',
  'Ho Chi Minh City': 'Vietnam',
  'Hanoi': 'Vietnam',
  'Da Nang': 'Vietnam',
  'Quang Ninh': 'Vietnam',
  'Kaafu Atoll': 'Maldives',
  'Male': 'Maldives',
  'Alif Alif Atoll': 'Maldives',
  'Kedah': 'Malaysia',
  'Penang': 'Malaysia',
  'Selangor': 'Malaysia',
  'Kuala Lumpur': 'Malaysia',
  'Sabah': 'Malaysia',
  'Bangkok': 'Thailand',
  'Phuket': 'Thailand',
  'Krabi': 'Thailand',
  'Chonburi (Pattaya)': 'Thailand',
  'Surat Thani (Koh Samui)': 'Thailand',
  'Dubai': 'United Arab Emirates',
  'Abu Dhabi': 'United Arab Emirates',
  'Sharjah': 'United Arab Emirates',
  'Singapore': 'Singapore'
};

export const CITY_TO_STATE_COUNTRY_MAP: Record<string, { state: string; country: string }> = {
  // Uttarakhand
  'Janki Chatti': { state: 'Uttarakhand', country: 'India' },
  'Kedarnath': { state: 'Uttarakhand', country: 'India' },
  'Uttarkashi': { state: 'Uttarakhand', country: 'India' },
  'Sonprayag': { state: 'Uttarakhand', country: 'India' },
  'Sitapur': { state: 'Uttarakhand', country: 'India' },
  'Pipalkoti': { state: 'Uttarakhand', country: 'India' },
  'Badrinath Dham': { state: 'Uttarakhand', country: 'India' },
  'Badrinath': { state: 'Uttarakhand', country: 'India' },
  'Barkot': { state: 'Uttarakhand', country: 'India' },
  'Rudraprayag': { state: 'Uttarakhand', country: 'India' },
  'Chopta': { state: 'Uttarakhand', country: 'India' },
  'Joshimath': { state: 'Uttarakhand', country: 'India' },
  'Rishikesh': { state: 'Uttarakhand', country: 'India' },
  'Harsil': { state: 'Uttarakhand', country: 'India' },
  'Haridwar': { state: 'Uttarakhand', country: 'India' },
  'Mussoorie': { state: 'Uttarakhand', country: 'India' },
  'Nainital': { state: 'Uttarakhand', country: 'India' },
  'Auli': { state: 'Uttarakhand', country: 'India' },
  'Dehradun': { state: 'Uttarakhand', country: 'India' },
  'Jim Corbett': { state: 'Uttarakhand', country: 'India' },
  'Kausani': { state: 'Uttarakhand', country: 'India' },
  'Ranikhet': { state: 'Uttarakhand', country: 'India' },
  'Almora': { state: 'Uttarakhand', country: 'India' },
  'Guptkashi': { state: 'Uttarakhand', country: 'India' },

  // Gujarat
  'Dholavira': { state: 'Gujarat', country: 'India' },
  'Dhordo': { state: 'Gujarat', country: 'India' },
  'Bhuj': { state: 'Gujarat', country: 'India' },
  'Mandvi Beach': { state: 'Gujarat', country: 'India' },
  'Mandvi': { state: 'Gujarat', country: 'India' },
  'Hodka': { state: 'Gujarat', country: 'India' },
  'Ahmedabad': { state: 'Gujarat', country: 'India' },
  'Kutch': { state: 'Gujarat', country: 'India' },
  'Gir': { state: 'Gujarat', country: 'India' },
  'Somnath': { state: 'Gujarat', country: 'India' },
  'Dwarka': { state: 'Gujarat', country: 'India' },
  'Vadodara': { state: 'Gujarat', country: 'India' },
  'Statue of Unity': { state: 'Gujarat', country: 'India' },

  // Kerala
  'Alleppey': { state: 'Kerala', country: 'India' },
  'Alappuzha': { state: 'Kerala', country: 'India' },
  'Thekkady': { state: 'Kerala', country: 'India' },
  'Kovalam': { state: 'Kerala', country: 'India' },
  'Thiruvananthapuram': { state: 'Kerala', country: 'India' },
  'Trivandrum': { state: 'Kerala', country: 'India' },
  'Munnar': { state: 'Kerala', country: 'India' },
  'Varkala': { state: 'Kerala', country: 'India' },
  'Kochi': { state: 'Kerala', country: 'India' },
  'Cochin': { state: 'Kerala', country: 'India' },
  'Wayanad': { state: 'Kerala', country: 'India' },
  'Kumarakom': { state: 'Kerala', country: 'India' },
  'Poovar': { state: 'Kerala', country: 'India' },
  'Marari': { state: 'Kerala', country: 'India' },
  'Vagamon': { state: 'Kerala', country: 'India' },
  'Bekal': { state: 'Kerala', country: 'India' },
  'Athirappilly': { state: 'Kerala', country: 'India' },
  'Kozhikode': { state: 'Kerala', country: 'India' },

  // Himachal Pradesh
  'Manali': { state: 'Himachal Pradesh', country: 'India' },
  'Shimla': { state: 'Himachal Pradesh', country: 'India' },
  'Dharamshala': { state: 'Himachal Pradesh', country: 'India' },
  'Dalhousie': { state: 'Himachal Pradesh', country: 'India' },
  'Kasol': { state: 'Himachal Pradesh', country: 'India' },
  'Spiti': { state: 'Himachal Pradesh', country: 'India' },
  'Kaza': { state: 'Himachal Pradesh', country: 'India' },
  'Jibhi': { state: 'Himachal Pradesh', country: 'India' },

  // Rajasthan
  'Jaipur': { state: 'Rajasthan', country: 'India' },
  'Udaipur': { state: 'Rajasthan', country: 'India' },
  'Jodhpur': { state: 'Rajasthan', country: 'India' },
  'Jaisalmer': { state: 'Rajasthan', country: 'India' },
  'Pushkar': { state: 'Rajasthan', country: 'India' },
  'Mount Abu': { state: 'Rajasthan', country: 'India' },
  'Bikaner': { state: 'Rajasthan', country: 'India' },
  'Ranthambore': { state: 'Rajasthan', country: 'India' },

  // Goa
  'North Goa': { state: 'Goa', country: 'India' },
  'South Goa': { state: 'Goa', country: 'India' },
  'Panaji': { state: 'Goa', country: 'India' },
  'Calangute': { state: 'Goa', country: 'India' },
  'Candolim': { state: 'Goa', country: 'India' },

  // Jammu and Kashmir & Ladakh
  'Srinagar': { state: 'Jammu and Kashmir', country: 'India' },
  'Gulmarg': { state: 'Jammu and Kashmir', country: 'India' },
  'Pahalgam': { state: 'Jammu and Kashmir', country: 'India' },
  'Sonamarg': { state: 'Jammu and Kashmir', country: 'India' },
  'Leh': { state: 'Ladakh', country: 'India' },
  'Nubra Valley': { state: 'Ladakh', country: 'India' },
  'Pangong': { state: 'Ladakh', country: 'India' },

  // International
  'Jakarta City': { state: 'Jakarta', country: 'Indonesia' },
  'Ubud': { state: 'Bali', country: 'Indonesia' },
  'Seminyak': { state: 'Bali', country: 'Indonesia' },
  'Kuta': { state: 'Bali', country: 'Indonesia' },
  'Interlaken City': { state: 'Interlaken', country: 'Switzerland' },
  'Grindelwald': { state: 'Interlaken', country: 'Switzerland' },
  'Lauterbrunnen': { state: 'Interlaken', country: 'Switzerland' },
  'Zurich City': { state: 'Zurich', country: 'Switzerland' },
  'Paris City': { state: 'Île-de-France (Paris)', country: 'France' },
  'Ho Chi Minh': { state: 'Ho Chi Minh City', country: 'Vietnam' },
  'Hanoi City': { state: 'Hanoi', country: 'Vietnam' },
  'Male City': { state: 'Kaafu Atoll', country: 'Maldives' },
  'Maafushi': { state: 'Kaafu Atoll', country: 'Maldives' },
  'Langkawi': { state: 'Kedah', country: 'Malaysia' },
  'Kuala Lumpur City': { state: 'Kuala Lumpur', country: 'Malaysia' },
  'Bangkok City': { state: 'Bangkok', country: 'Thailand' },
  'Patong': { state: 'Phuket', country: 'Thailand' },
  'Pattaya': { state: 'Chonburi (Pattaya)', country: 'Thailand' },
  'Dubai City': { state: 'Dubai', country: 'United Arab Emirates' },
  'Marina': { state: 'Dubai', country: 'United Arab Emirates' },
  'Downtown Dubai': { state: 'Dubai', country: 'United Arab Emirates' },
  'Singapore City': { state: 'Singapore', country: 'Singapore' },
  'Sentosa': { state: 'Singapore', country: 'Singapore' }
};

export function resolveGeography(cityName?: string | null, rawState?: string | null, rawCountry?: string | null): { city: string; state: string; country: string } {
  const c = String(cityName || '').trim();
  const s = String(rawState || '').trim();
  const co = String(rawCountry || '').trim();

  // 1. Direct city lookup
  if (c && CITY_TO_STATE_COUNTRY_MAP[c]) {
    const entry = CITY_TO_STATE_COUNTRY_MAP[c];
    return {
      city: c,
      state: entry.state,
      country: entry.country
    };
  }

  // 2. Case-insensitive city lookup
  if (c) {
    const cLower = c.toLowerCase();
    for (const [k, v] of Object.entries(CITY_TO_STATE_COUNTRY_MAP)) {
      if (k.toLowerCase() === cLower) {
        return {
          city: c,
          state: v.state,
          country: v.country
        };
      }
    }
  }

  // 3. Known Indian State check
  if (s) {
    const sLower = s.toLowerCase();
    const matchedIndianState = INDIAN_STATES.find(st => st.toLowerCase() === sLower);
    if (matchedIndianState) {
      return {
        city: c || matchedIndianState,
        state: matchedIndianState,
        country: 'India'
      };
    }

    // 4. Known International State check
    for (const [stName, countryName] of Object.entries(INTERNATIONAL_STATE_COUNTRY_MAP)) {
      if (stName.toLowerCase() === sLower) {
        return {
          city: c || stName,
          state: stName,
          country: countryName
        };
      }
    }
  }

  // 5. Fallback
  return {
    city: c || 'Uttarakhand',
    state: s || 'Uttarakhand',
    country: co || 'India'
  };
}
