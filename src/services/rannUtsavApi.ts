// API Service for Rann Utsav Package Calculation, Season Detection & Bookings

export interface CalculationPayload {
  check_in: string;
  check_out: string;
  adults: number;
  children_6_12: number;
  children_under_6: number;
  accommodation: string;
  transfer: string;
  activities: string[];
  coupon_code?: string;
}

export interface CalculationResponse {
  status: string;
  input: {
    check_in: string;
    check_out: string;
    nights: number;
    days: number;
    adults: number;
    children_6_12: number;
    children_under_6: number;
    total_occupants: number;
  };
  season: {
    tier: number;
    name: string;
    type?: string;
    surcharge_per_pax: number;
  };
  coupon?: {
    applied: boolean;
    code: string;
    details?: {
      discount_percent: number;
      label: string;
    };
    discount_amount: number;
  };
  breakdown: {
    room_label: string;
    room_sub: string;
    room_total: number;
    cab_label: string;
    cab_sub: string;
    cab_total: number;
    activities: string[];
    activities_total: number;
    subtotal: number;
    discount?: number;
    discounted_subtotal?: number;
    tax_18_percent: number;
  };
  pricing: {
    total_package_fare: number;
    per_person_fare: number;
  };
}

export const rannUtsavApi = {
  /**
   * Fetch backend ratecard structure
   */
  async getRateCard(): Promise<any> {
    try {
      const response = await fetch('/php-backend/rann_utsav_rates.php');
      if (!response.ok) throw new Error('Failed to fetch ratecard');
      return await response.json();
    } catch (error) {
      console.warn("Backend API offline, using fallback client ratecard", error);
      return null;
    }
  },

  /**
   * Send pricing parameters & coupon code to PHP backend calculation endpoint
   */
  async calculateFare(payload: CalculationPayload): Promise<CalculationResponse> {
    try {
      const response = await fetch('/php-backend/rann_utsav_rates.php', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn("Backend API offline or unreachable, utilizing fallback client calculation engine:", error);
      throw error;
    }
  },
};
