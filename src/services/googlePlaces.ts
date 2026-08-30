export interface FetchedHotelMeta {
  hotel_name: string;
  hotel_code?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  phone_number: string;
  website: string;
  email?: string;
  google_rating: number;
  featured_image_url: string;
  star_rating: number;
  destination_group?: string;
  nearest_airport?: string;
  nearest_railway?: string;
  gps_coordinates?: string;
  internal_rating?: number;
  check_in_time?: string;
  check_out_time?: string;
  contact_person?: string;
  cancellation_policy?: string;
  child_policy?: string;
  extra_bed_policy?: string;
  category_name?: string;
  amenities?: string[];
}

export async function fetchHotelMetaFromGoogle(queryOrUrl: string): Promise<FetchedHotelMeta | null> {
  const searchQuery = queryOrUrl.trim();
  if (!searchQuery) return null;

  try {
    const res = await fetch(`/php-backend/fetch_hotel_google.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: searchQuery })
    });
    if (!res.ok) {
      throw new Error(`Proxy error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.success || !data.data) {
      if (data.error) throw new Error(data.error);
      return null;
    }

    return data.data as FetchedHotelMeta;
  } catch (err: any) {
    console.error('Error fetching Google Places hotel data:', err);
    throw err;
  }
}
