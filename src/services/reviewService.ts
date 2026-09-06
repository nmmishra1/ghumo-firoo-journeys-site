import { supabase } from '@/integrations/supabase/client';

export interface GoogleReview {
  id: string;
  reviewer_name: string;
  reviewer_photo?: string;
  rating: number;
  review_text: string;
  review_date: string;
  location?: string;
  verified: boolean;
  helpful_count?: number;
  created_at: string;
  updated_at: string;
  platform?: 'google' | 'tripadvisor' | 'facebook' | 'website';
  response?: string;
  photos?: string[];
  video_url?: string | null;
  hotel_rating?: number;
  cab_rating?: number;
  sightseeing_rating?: number;
  trip_planning_rating?: number;
  booking_id?: string | null;
  lead_id?: string | number | null;
  package_name?: string | null;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  recentCount: number;
  responseRate: number;
}

export interface ReviewSubscription {
  unsubscribe: () => void;
}

// Fallback mock reviews in case database is empty or connection fails
const mockReviews: GoogleReview[] = [
  {
    id: 'google_1',
    reviewer_name: 'Rajesh Gupta',
    reviewer_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    review_text: 'Our Char Dham Yatra with Ghumo Firoo was absolutely divine! The helicopter service to Kedarnath saved us so much time, and the spiritual guides were incredibly knowledgeable. Every darshan was perfectly arranged. This was truly a life-changing pilgrimage experience.',
    review_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Kashmir',
    verified: true,
    helpful_count: 24,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    platform: 'website'
  },
  {
    id: 'google_2',
    reviewer_name: 'Meera Shah',
    reviewer_photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    review_text: 'Our 15-day Grand Europe Tour exceeded all expectations! From the romantic Seine cruise in Paris to the breathtaking Swiss Alps train journey, every moment was magical. The local guides in each country were exceptional. Worth every penny!',
    review_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Europe',
    verified: true,
    helpful_count: 18,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    platform: 'website'
  },
  {
    id: 'google_3',
    reviewer_name: 'Dr. Anil Sharma',
    reviewer_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    rating: 5,
    review_text: 'The Royal Rajasthan Heritage Tour was phenomenal! Staying in the palace hotels of Udaipur and Jodhpur felt like living in a fairy tale. The desert safari in Jaisalmer and cultural performances were unforgettable. Ghumo Firoo truly understands luxury travel.',
    review_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Rajasthan',
    verified: true,
    helpful_count: 32,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    platform: 'website'
  }
];

const mapDbReviewToGoogleReview = (db: any): GoogleReview => {
  return {
    id: db.id,
    reviewer_name: db.customer_name,
    reviewer_photo: (db.photos && db.photos.length > 0) ? db.photos[0] : `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1472099645785-5658abf4ff4e' : '1494790108755-2616b612b786'}?w=80&h=80&fit=crop&crop=face`,
    rating: db.rating,
    review_text: db.review_text || '',
    review_date: db.travel_date || db.created_at,
    location: db.destination,
    verified: db.verified ?? true,
    created_at: db.created_at,
    updated_at: db.updated_at,
    platform: 'website',
    photos: db.photos || [],
    video_url: db.video_url,
    hotel_rating: db.hotel_rating,
    cab_rating: db.cab_rating,
    sightseeing_rating: db.sightseeing_rating,
    trip_planning_rating: db.trip_planning_rating
  };
};

const computeStats = (reviews: GoogleReview[]): ReviewStats => {
  const total = reviews.length;
  const averageRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const ratingDistribution: { [key: number]: number } = {};
  for (let i = 1; i <= 5; i++) {
    ratingDistribution[i] = reviews.filter(r => r.rating === i).length;
  }
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = reviews.filter(r => new Date(r.review_date) >= thirtyDaysAgo).length;
  
  const reviewsWithResponses = reviews.filter(r => r.response && r.response.trim().length > 0).length;
  const responseRate = total > 0 ? (reviewsWithResponses / total) * 100 : 0;
  
  return { total, averageRating, ratingDistribution, recentCount, responseRate };
};

const API_BASE = '/api/reviews';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const reviewService = {
  // Get all approved reviews
  async getAllReviews(): Promise<GoogleReview[]> {
    try {
      const res = await fetch(`${API_BASE}?status=Approved`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      const reviews = data.reviews || [];
      return reviews.map(mapDbReviewToGoogleReview);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  // Get reviews with pagination
  async getReviews(limit: number = 10, offset: number = 0): Promise<GoogleReview[]> {
    try {
      const res = await fetch(`${API_BASE}?status=Approved&limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      const reviews = data.reviews || [];
      return reviews.map(mapDbReviewToGoogleReview);
    } catch (error) {
      console.error('Error fetching paginated reviews:', error);
      return [];
    }
  },

  // Get featured reviews
  async getFeaturedReviews(limit: number = 6): Promise<GoogleReview[]> {
    try {
      // Query approved reviews directly
      const res = await fetch(`${API_BASE}?status=Approved&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      const reviews = data.reviews || [];
      
      // Sort featured first, then highest rating
      reviews.sort((a: any, b: any) => {
        if (b.featured !== a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return (b.rating || 0) - (a.rating || 0);
      });
      
      return reviews.slice(0, limit).map(mapDbReviewToGoogleReview);
    } catch (error) {
      console.error('Error fetching featured reviews:', error);
      return [];
    }
  },

  // Add a new review
  async addReview(review: Omit<GoogleReview, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const authHeaders = await getAuthHeader();
      const payload = {
        customer_name: review.reviewer_name,
        destination: review.location || 'India',
        rating: review.rating,
        review_text: review.review_text,
        photos: review.photos || [],
        verified: review.verified ? 1 : 0,
        status: 'Pending',
        featured: 0,
        cab_rating: review.cab_rating ?? review.rating,
        hotel_rating: review.hotel_rating ?? review.rating,
        sightseeing_rating: review.sightseeing_rating ?? review.rating,
        trip_planning_rating: review.trip_planning_rating ?? review.rating,
        booking_id: review.booking_id || null,
        lead_id: review.lead_id ? Number(review.lead_id) : null,
        package_name: review.package_name || 'Custom Tour Package',
        travel_date: review.review_date ? new Date(review.review_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
      
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add review');
      }

      const data = await res.json();
      return data.id;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // Update a review
  async updateReview(id: string, updates: Partial<GoogleReview>): Promise<void> {
    try {
      const authHeaders = await getAuthHeader();
      const dbUpdates: any = {};
      if (updates.reviewer_name) dbUpdates.customer_name = updates.reviewer_name;
      if (updates.rating) dbUpdates.rating = updates.rating;
      if (updates.review_text) dbUpdates.review_text = updates.review_text;
      if (updates.location) dbUpdates.destination = updates.location;
      if (updates.photos) dbUpdates.photos = updates.photos;
      if (updates.verified !== undefined) dbUpdates.verified = updates.verified ? 1 : 0;
      if (updates.video_url !== undefined) dbUpdates.video_url = updates.video_url;
      if (updates.response !== undefined) dbUpdates.response = updates.response;
      if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
      
      const res = await fetch(`${API_BASE}?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(dbUpdates)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete a review
  async deleteReview(id: string): Promise<void> {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Get review statistics
  async getReviewStats(): Promise<ReviewStats> {
    try {
      const reviews = await this.getAllReviews();
      return computeStats(reviews);
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return computeStats([]);
    }
  },

  // Real-time subscription to reviews (replaced with polling)
  subscribeToReviews(callback: (reviews: GoogleReview[]) => void): ReviewSubscription {
    this.getAllReviews().then(callback);
    
    const intervalId = setInterval(async () => {
      const updatedReviews = await this.getAllReviews();
      callback(updatedReviews);
    }, 30000);
      
    return {
      unsubscribe: () => {
        clearInterval(intervalId);
      }
    };
  },

  // Refresh reviews (no-op since subscription handles it)
  async refreshReviews(): Promise<void> {
    // Left for backward compatibility
  },

  // Get reviews by platform
  async getReviewsByPlatform(platform: 'google' | 'tripadvisor' | 'facebook' | 'website'): Promise<GoogleReview[]> {
    try {
      const allReviews = await this.getAllReviews();
      return allReviews.filter(review => review.platform === platform || (!review.platform && platform === 'website'));
    } catch (error) {
      console.error('Error fetching reviews by platform:', error);
      return [];
    }
  },

  // Fetch reviews for a specific destination
  async getReviewsByDestination(
    destination: string, 
    limit: number = 10
  ): Promise<GoogleReview[]> {
    try {
      const encodedDest = encodeURIComponent(destination);
      const res = await fetch(
        `${API_BASE}?status=Approved` +
        `&destination=${encodedDest}&limit=${limit}`
      );
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      if (!data.reviews || data.reviews.length === 0) {
        // Fallback to featured reviews if no destination-specific ones
        return this.getFeaturedReviews(limit);
      }
      return data.reviews.map(mapDbReviewToGoogleReview);
    } catch (error) {
      console.error('Error fetching reviews by destination:', error);
      return this.getFeaturedReviews(limit);
    }
  },

  // Fetch reviews for a specific hotel
  async getReviewsByHotel(hotelId: string): Promise<GoogleReview[]> {
    try {
      const res = await fetch(`${API_BASE}?status=Approved&hotel_id=${encodeURIComponent(hotelId)}`);
      if (!res.ok) throw new Error('Failed to fetch reviews by hotel');
      const data = await res.json();
      const reviews = data.reviews || [];
      return reviews.map(mapDbReviewToGoogleReview);
    } catch (error) {
      console.error(`Error fetching reviews for hotel ${hotelId}:`, error);
      return [];
    }
  }
};