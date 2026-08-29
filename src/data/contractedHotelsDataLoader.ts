import contractedHotelsRaw from './contractedHotels.json';

export interface ProcessedContractedHotel {
  id: string;
  hotel_name: string;
  hotel_code: string;
  star_rating: number;
  city: string;
  state: string;
  country: string;
  city_id?: string;
  state_id?: string;
  country_id?: string;
  cities?: { city_name: string };
  states?: { state_name: string };
  countries?: { country_name: string };
  google_rating?: number | null;
  internal_rating?: number | null;
  contact_number?: string | null;
  email?: string | null;
  meal_plan_supported?: string[] | null;
  featured_image_url?: string | null;
  cat_or_room?: string;
  b2b_cost?: number;
  address?: string;
}

const CITY_STATE_MAP: Record<string, { state: string; country: string }> = {
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
  'Dholavira': { state: 'Gujarat', country: 'India' },
  'Dhordo': { state: 'Gujarat', country: 'India' },
  'Bhuj': { state: 'Gujarat', country: 'India' },
  'Mandvi Beach': { state: 'Gujarat', country: 'India' },
};

/**
 * Builds a display list from the real spreadsheet import (name, city,
 * category, b2b_cost — see contractedHotels.json). This is ONLY shown as a
 * fallback when the real hotels table has zero rows (see
 * HotelContracting.tsx's fetchHotels) — it used to be merged into the live
 * hotel list unconditionally.
 *
 * IMPORTANT: this used to also fabricate contact numbers, emails, Google/
 * internal ratings, and stock photos for these entries — none of that was
 * real data, and it was indistinguishable from genuinely-entered hotels in
 * the UI. Those fields are now left null/unset rather than invented. If you
 * want this data to show real contact info, ratings, or photos, enter these
 * hotels properly through the Hotel Contracting UI instead of relying on
 * this seed list — that's the only way the values will be real.
 */
export function getContractedHotelsMasterList(): ProcessedContractedHotel[] {
  return contractedHotelsRaw.map((h: any, idx: number) => {
    const cityName = (h.city || 'Uttarakhand').trim();
    const mapping = CITY_STATE_MAP[cityName] || { state: 'Uttarakhand', country: 'India' };
    
    let stars = 3;
    const cat = (h.cat_or_room || '').toLowerCase();
    if (cat.includes('luxury') || cat.includes('premium')) {
      stars = 5;
    } else if (cat.includes('standard') || cat.includes('deluxe')) {
      stars = 4;
    } else {
      stars = 3;
    }

    const cleanName = (h.name || 'Contracted Hotel').trim();
    const codePrefix = cleanName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'H');
    const codeCity = cityName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'CT');
    const hotelCode = `${codePrefix}-${codeCity}-${idx + 101}`;

    return {
      id: `contracted-hotel-${idx + 1}`,
      hotel_name: cleanName,
      hotel_code: hotelCode,
      star_rating: stars,
      city: cityName,
      state: mapping.state,
      country: mapping.country,
      city_id: cityName,
      state_id: mapping.state,
      country_id: mapping.country,
      cities: { city_name: cityName },
      states: { state_name: mapping.state },
      countries: { country_name: mapping.country },
      google_rating: null,
      internal_rating: null,
      contact_number: null,
      email: null,
      meal_plan_supported: null,
      featured_image_url: null,
      cat_or_room: h.cat_or_room || 'Standard',
      b2b_cost: h.b2b_cost || 3000,
      address: `${cleanName}, ${cityName}, ${mapping.state}, ${mapping.country}`
    };
  });
}
