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
  'Mandvi': { state: 'Gujarat', country: 'India' },
  'Hodka': { state: 'Gujarat', country: 'India' },
  'Ahmedabad': { state: 'Gujarat', country: 'India' },
  'Kutch': { state: 'Gujarat', country: 'India' },
  'Alleppey': { state: 'Kerala', country: 'India' },
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
};

/**
 * Builds a display list from the real spreadsheet import (name, city,
 * category, b2b_cost — see contractedHotels.json).
 */
export function getContractedHotelsMasterList(): ProcessedContractedHotel[] {
  return contractedHotelsRaw.map((h: any, idx: number) => {
    const cityName = (h.city || 'Uttarakhand').trim();
    const mapping = CITY_STATE_MAP[cityName] || { 
      state: h.state || 'Uttarakhand', 
      country: h.country || 'India' 
    };
    const hotelState = h.state || mapping.state;
    const hotelCountry = h.country || mapping.country;
    
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
      state: hotelState,
      country: hotelCountry,
      city_id: cityName,
      state_id: hotelState,
      country_id: hotelCountry,
      cities: { city_name: cityName },
      states: { state_name: hotelState },
      countries: { country_name: hotelCountry },
      google_rating: null,
      internal_rating: null,
      contact_number: null,
      email: null,
      meal_plan_supported: ['EP', 'CP', 'MAP', 'AP'],
      featured_image_url: null,
      cat_or_room: h.cat_or_room || 'Standard',
      b2b_cost: h.b2b_cost || 3000,
      address: `${cleanName}, ${cityName}, ${hotelState}, ${hotelCountry}`
    };
  });
}
