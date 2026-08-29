import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GooglePlacesReview {
  author_name: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description?: string; // e.g., "2 weeks ago"
  text: string;
  time?: number; // Unix timestamp
}

function mapPlacesReviewToApp(r: GooglePlacesReview, idx: number) {
  const date = r.time ? new Date(r.time * 1000).toISOString() : new Date().toISOString();
  return {
    id: `${date}-${idx}`,
    reviewer_name: r.author_name,
    reviewer_photo: r.profile_photo_url,
    rating: r.rating,
    review_text: r.text,
    review_date: date,
    location: 'Google Reviews',
    verified: true,
    helpful_count: undefined,
    created_at: date,
    updated_at: date,
  };
}

async function fetchGoogleReviews(placeId: string, apiKey: string, limit?: number) {
  const fields = encodeURIComponent("reviews,rating,user_ratings_total");
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Places API error: ${res.status}`);
  const data = await res.json();
  if (data.status !== 'OK') throw new Error(`Google Places API returned status ${data.status}`);

  const reviews: GooglePlacesReview[] = data.result?.reviews || [];
  const mapped = reviews.map(mapPlacesReviewToApp);
  return {
    reviews: typeof limit === 'number' ? mapped.slice(0, limit) : mapped,
    total: data.result?.user_ratings_total || mapped.length,
    averageRating: data.result?.rating || (mapped.length ? mapped.reduce((s: number, r: any) => s + r.rating, 0) / mapped.length : 0)
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? Number(limitParam) : undefined;

    const placeId = url.searchParams.get('placeId') || Deno.env.get('GOOGLE_PLACES_PLACE_ID');
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!apiKey) throw new Error('Missing GOOGLE_PLACES_API_KEY');
    if (!placeId) throw new Error('Missing placeId (query) or GOOGLE_PLACES_PLACE_ID (env)');

    const payload = await fetchGoogleReviews(placeId, apiKey, limit);

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('fetch-google-reviews error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
