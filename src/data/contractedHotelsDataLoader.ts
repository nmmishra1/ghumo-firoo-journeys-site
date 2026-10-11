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
  'Jodhpur': { state: 'Rajasthan', country: 'India' },
  'Jaipur': { state: 'Rajasthan', country: 'India' },
  'Udaipur': { state: 'Rajasthan', country: 'India' },
  'Jaisalmer': { state: 'Rajasthan', country: 'India' },
  'Pushkar': { state: 'Rajasthan', country: 'India' },
  'Bikaner': { state: 'Rajasthan', country: 'India' },
  'Srinagar': { state: 'Jammu and Kashmir', country: 'India' },
  'Gulmarg': { state: 'Jammu and Kashmir', country: 'India' },
  'Pahalgam': { state: 'Jammu and Kashmir', country: 'India' },
  'Sonmarg': { state: 'Jammu and Kashmir', country: 'India' },
  'Sonamarg': { state: 'Jammu and Kashmir', country: 'India' },
  'Kashmir': { state: 'Jammu and Kashmir', country: 'India' },
  'Manali': { state: 'Himachal Pradesh', country: 'India' },
  'Shimla': { state: 'Himachal Pradesh', country: 'India' },
  'Dharamshala': { state: 'Himachal Pradesh', country: 'India' },
  'Kullu': { state: 'Himachal Pradesh', country: 'India' },
  'North Goa': { state: 'Goa', country: 'India' },
  'South Goa': { state: 'Goa', country: 'India' },
  'Panaji': { state: 'Goa', country: 'India' },
  'Calangute': { state: 'Goa', country: 'India' },
  'Port Blair': { state: 'Andaman and Nicobar Islands', country: 'India' },
  'Havelock': { state: 'Andaman and Nicobar Islands', country: 'India' },
  'Neil Island': { state: 'Andaman and Nicobar Islands', country: 'India' },
};

// Additional curated master multi-city hotel inventory for complete coverage
const ADDITIONAL_MASTER_HOTELS = [
  // --- KASHMIR CIRCUIT HOTELS ---
  { name: 'The Lalit Grand Palace', city: 'Srinagar', state: 'Jammu and Kashmir', cat: 'Luxury', stars: 5, b2b_cost: 12500 },
  { name: 'Heritage Luxury Cedar Houseboat (Dal Lake)', city: 'Srinagar', state: 'Jammu and Kashmir', cat: 'Premium', stars: 4, b2b_cost: 4500 },
  { name: 'Vivanta Dal View (Taj)', city: 'Srinagar', state: 'Jammu and Kashmir', cat: 'Luxury', stars: 5, b2b_cost: 14000 },
  { name: 'Four Points by Sheraton', city: 'Srinagar', state: 'Jammu and Kashmir', cat: 'Premium', stars: 4, b2b_cost: 6500 },
  { name: 'Hotel Grand Mumtaz', city: 'Srinagar', state: 'Jammu and Kashmir', cat: 'Standard', stars: 4, b2b_cost: 3800 },
  { name: 'Khyber Himalayan Resort & Spa', city: 'Gulmarg', state: 'Jammu and Kashmir', cat: 'Luxury', stars: 5, b2b_cost: 16500 },
  { name: 'Hotel Highlands Park', city: 'Gulmarg', state: 'Jammu and Kashmir', cat: 'Premium', stars: 4, b2b_cost: 7800 },
  { name: 'Nedous Hotel Gulmarg', city: 'Gulmarg', state: 'Jammu and Kashmir', cat: 'Standard', stars: 4, b2b_cost: 4500 },
  { name: 'Pahalgam Hotel', city: 'Pahalgam', state: 'Jammu and Kashmir', cat: 'Premium', stars: 4, b2b_cost: 6200 },
  { name: 'Grand Mumtaz Resorts', city: 'Pahalgam', state: 'Jammu and Kashmir', cat: 'Premium', stars: 4, b2b_cost: 4800 },
  { name: 'Pine N Peak (ITC WelcomHotel)', city: 'Pahalgam', state: 'Jammu and Kashmir', cat: 'Luxury', stars: 5, b2b_cost: 11500 },
  { name: 'Hotel Rah Villas', city: 'Sonmarg', state: 'Jammu and Kashmir', cat: 'Premium', stars: 4, b2b_cost: 5200 },
  { name: 'The Sultan Resort Sonamarg', city: 'Sonmarg', state: 'Jammu and Kashmir', cat: 'Standard', stars: 3, b2b_cost: 3500 },

  // --- RAJASTHAN CIRCUIT HOTELS ---
  { name: 'Trident Jaipur', city: 'Jaipur', state: 'Rajasthan', cat: 'Luxury', stars: 5, b2b_cost: 6500 },
  { name: 'Alsisar Haveli Heritage Hotel', city: 'Jaipur', state: 'Rajasthan', cat: 'Premium', stars: 4, b2b_cost: 4800 },
  { name: 'Fateh Garh Heritage Resort', city: 'Udaipur', state: 'Rajasthan', cat: 'Luxury', stars: 5, b2b_cost: 7200 },
  { name: 'Jagat Niwas Palace Lake View', city: 'Udaipur', state: 'Rajasthan', cat: 'Premium', stars: 4, b2b_cost: 5800 },
  { name: 'Suryagarh Palace', city: 'Jaisalmer', state: 'Rajasthan', cat: 'Luxury', stars: 5, b2b_cost: 9500 },
  { name: 'Desert Springs Resort & Luxury Camp', city: 'Jaisalmer', state: 'Rajasthan', cat: 'Premium', stars: 4, b2b_cost: 4200 },

  // --- HIMACHAL CIRCUIT HOTELS ---
  { name: 'The Himalayan Luxury Resort', city: 'Manali', state: 'Himachal Pradesh', cat: 'Luxury', stars: 5, b2b_cost: 6200 },
  { name: 'Snow Valley Resorts', city: 'Manali', state: 'Himachal Pradesh', cat: 'Premium', stars: 4, b2b_cost: 3800 },
  { name: 'Wildflower Hall Oberoi', city: 'Shimla', state: 'Himachal Pradesh', cat: 'Luxury', stars: 5, b2b_cost: 13500 },
  { name: 'Combermere Luxury Resort', city: 'Shimla', state: 'Himachal Pradesh', cat: 'Premium', stars: 4, b2b_cost: 5200 },

  // --- GOA CIRCUIT HOTELS ---
  { name: 'Novotel Goa Candolim', city: 'North Goa', state: 'Goa', cat: 'Luxury', stars: 5, b2b_cost: 6200 },
  { name: 'Heritage Village Resort & Spa', city: 'South Goa', state: 'Goa', cat: 'Premium', stars: 4, b2b_cost: 5400 },
  { name: 'Taj Fort Aguada Resort & Spa', city: 'North Goa', state: 'Goa', cat: 'Luxury', stars: 5, b2b_cost: 11000 },

  // --- ANDAMAN CIRCUIT HOTELS ---
  { name: 'Symphony Palms Beach Resort', city: 'Havelock', state: 'Andaman and Nicobar Islands', cat: 'Premium', stars: 4, b2b_cost: 6500 },
  { name: 'Sinclairs Bayview Port Blair', city: 'Port Blair', state: 'Andaman and Nicobar Islands', cat: 'Premium', stars: 4, b2b_cost: 5800 },
  { name: 'Taj Exotica Resort & Spa Radhanagar', city: 'Havelock', state: 'Andaman and Nicobar Islands', cat: 'Luxury', stars: 5, b2b_cost: 18500 }
];

/**
 * Builds a display list from the real spreadsheet import (name, city,
 * category, b2b_cost — see contractedHotels.json).
 */
export function getContractedHotelsMasterList(): ProcessedContractedHotel[] {
  const listFromRaw: ProcessedContractedHotel[] = contractedHotelsRaw.map((h: any, idx: number) => {
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

  const rawNames = new Set(listFromRaw.map(h => h.hotel_name.toLowerCase()));

  const listFromAdditional: ProcessedContractedHotel[] = ADDITIONAL_MASTER_HOTELS
    .filter(ah => !rawNames.has(ah.name.toLowerCase()))
    .map((ah, idx) => {
      const codePrefix = ah.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'H');
      const codeCity = ah.city.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'CT');
      return {
        id: `master-hotel-add-${idx + 1}`,
        hotel_name: ah.name,
        hotel_code: `${codePrefix}-${codeCity}-${idx + 500}`,
        star_rating: ah.stars,
        city: ah.city,
        state: ah.state,
        country: 'India',
        city_id: ah.city,
        state_id: ah.state,
        country_id: 'India',
        cities: { city_name: ah.city },
        states: { state_name: ah.state },
        countries: { country_name: 'India' },
        google_rating: null,
        internal_rating: null,
        contact_number: null,
        email: null,
        meal_plan_supported: ['EP', 'CP', 'MAP', 'AP'],
        featured_image_url: null,
        cat_or_room: ah.cat,
        b2b_cost: ah.b2b_cost,
        address: `${ah.name}, ${ah.city}, ${ah.state}, India`
      };
    });

  return [...listFromRaw, ...listFromAdditional];
}
