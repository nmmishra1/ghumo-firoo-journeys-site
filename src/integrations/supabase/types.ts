export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          active_status: boolean | null
          activity_category: string
          activity_code: string
          activity_name: string
          activity_type: string | null
          adult_cost: number | null
          cancellation_policy: string | null
          child_cost: number | null
          country_id: string | null
          created_at: string | null
          description: string | null
          destination: string | null
          duration: string | null
          exclusions: string[] | null
          gst_included: boolean | null
          gst_percentage: number | null
          highlights: string[] | null
          id: string
          image_url: string | null
          inclusions: string[] | null
          selling_cost: number | null
          state_id: string | null
          sub_category: string | null
          supplier_cost: number | null
          supplier_name: string | null
          updated_at: string | null
        }
        Insert: {
          active_status?: boolean | null
          activity_category?: string
          activity_code: string
          activity_name: string
          activity_type?: string | null
          adult_cost?: number | null
          cancellation_policy?: string | null
          child_cost?: number | null
          country_id?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string | null
          duration?: string | null
          exclusions?: string[] | null
          gst_included?: boolean | null
          gst_percentage?: number | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          inclusions?: string[] | null
          selling_cost?: number | null
          state_id?: string | null
          sub_category?: string | null
          supplier_cost?: number | null
          supplier_name?: string | null
          updated_at?: string | null
        }
        Update: {
          active_status?: boolean | null
          activity_category?: string
          activity_code?: string
          activity_name?: string
          activity_type?: string | null
          adult_cost?: number | null
          cancellation_policy?: string | null
          child_cost?: number | null
          country_id?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string | null
          duration?: string | null
          exclusions?: string[] | null
          gst_included?: boolean | null
          gst_percentage?: number | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          inclusions?: string[] | null
          selling_cost?: number | null
          state_id?: string | null
          sub_category?: string | null
          supplier_cost?: number | null
          supplier_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          deletion_notes: string | null
          deletion_reason: string | null
          id: string
          ip_address: string | null
          lead_id: string | null
          new_value: string | null
          old_value: string | null
          user_email: string
          user_name: string
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string
          deletion_notes?: string | null
          deletion_reason?: string | null
          id: string
          ip_address?: string | null
          lead_id?: string | null
          new_value?: string | null
          old_value?: string | null
          user_email: string
          user_name: string
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          deletion_notes?: string | null
          deletion_reason?: string | null
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          new_value?: string | null
          old_value?: string | null
          user_email?: string
          user_name?: string
          user_role?: string | null
        }
        Relationships: []
      }
      brochure_downloads: {
        Row: {
          destination: string | null
          id: string
          lead_id: string | null
          timestamp: string
        }
        Insert: {
          destination?: string | null
          id?: string
          lead_id?: string | null
          timestamp?: string
        }
        Update: {
          destination?: string | null
          id?: string
          lead_id?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      cab_contract_rates: {
        Row: {
          active_status: boolean | null
          airport_name: string | null
          base_cost: number | null
          base_km_included: number | null
          contract_id: string | null
          created_at: string | null
          daily_rate: number | null
          driver_allowance: number | null
          extra_hour_cost: number | null
          extra_km_charge: number | null
          extra_km_cost: number | null
          gst_amount: number | null
          gst_included: boolean | null
          gst_percentage: number | null
          hotel_area: string | null
          hours_included: number | null
          id: string
          is_tax_overridden: boolean | null
          km_included: number | null
          markup_amount: number | null
          markup_percentage: number | null
          max_km_included: number | null
          meet_greet_charges: number | null
          min_km_per_day: number | null
          night_allowance: number | null
          night_charges: number | null
          parking_charges: number | null
          permit_charges: number | null
          profit_margin: number | null
          rate_model: string | null
          rate_per_km: number | null
          route_id: string | null
          season: string | null
          selling_cost: number | null
          sightseeing_destination: string | null
          state_tax: number | null
          supplier_cost: number | null
          tax_audit_logs: Json | null
          tax_override_reason: string | null
          toll_charges: number | null
          transfer_cost: number | null
          updated_at: string | null
          vehicle_cost: number | null
          vehicle_id: string | null
          waiting_charges: number | null
        }
        Insert: {
          active_status?: boolean | null
          airport_name?: string | null
          base_cost?: number | null
          base_km_included?: number | null
          contract_id?: string | null
          created_at?: string | null
          daily_rate?: number | null
          driver_allowance?: number | null
          extra_hour_cost?: number | null
          extra_km_charge?: number | null
          extra_km_cost?: number | null
          gst_amount?: number | null
          gst_included?: boolean | null
          gst_percentage?: number | null
          hotel_area?: string | null
          hours_included?: number | null
          id?: string
          is_tax_overridden?: boolean | null
          km_included?: number | null
          markup_amount?: number | null
          markup_percentage?: number | null
          max_km_included?: number | null
          meet_greet_charges?: number | null
          min_km_per_day?: number | null
          night_allowance?: number | null
          night_charges?: number | null
          parking_charges?: number | null
          permit_charges?: number | null
          profit_margin?: number | null
          rate_model?: string | null
          rate_per_km?: number | null
          route_id?: string | null
          season?: string | null
          selling_cost?: number | null
          sightseeing_destination?: string | null
          state_tax?: number | null
          supplier_cost?: number | null
          tax_audit_logs?: Json | null
          tax_override_reason?: string | null
          toll_charges?: number | null
          transfer_cost?: number | null
          updated_at?: string | null
          vehicle_cost?: number | null
          vehicle_id?: string | null
          waiting_charges?: number | null
        }
        Update: {
          active_status?: boolean | null
          airport_name?: string | null
          base_cost?: number | null
          base_km_included?: number | null
          contract_id?: string | null
          created_at?: string | null
          daily_rate?: number | null
          driver_allowance?: number | null
          extra_hour_cost?: number | null
          extra_km_charge?: number | null
          extra_km_cost?: number | null
          gst_amount?: number | null
          gst_included?: boolean | null
          gst_percentage?: number | null
          hotel_area?: string | null
          hours_included?: number | null
          id?: string
          is_tax_overridden?: boolean | null
          km_included?: number | null
          markup_amount?: number | null
          markup_percentage?: number | null
          max_km_included?: number | null
          meet_greet_charges?: number | null
          min_km_per_day?: number | null
          night_allowance?: number | null
          night_charges?: number | null
          parking_charges?: number | null
          permit_charges?: number | null
          profit_margin?: number | null
          rate_model?: string | null
          rate_per_km?: number | null
          route_id?: string | null
          season?: string | null
          selling_cost?: number | null
          sightseeing_destination?: string | null
          state_tax?: number | null
          supplier_cost?: number | null
          tax_audit_logs?: Json | null
          tax_override_reason?: string | null
          toll_charges?: number | null
          transfer_cost?: number | null
          updated_at?: string | null
          vehicle_cost?: number | null
          vehicle_id?: string | null
          waiting_charges?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cab_contract_rates_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "cab_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cab_contract_rates_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "cab_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cab_contract_rates_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "cab_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      cab_contracts: {
        Row: {
          active_status: boolean | null
          contract_name: string
          created_at: string | null
          id: string
          supplier_id: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          active_status?: boolean | null
          contract_name: string
          created_at?: string | null
          id?: string
          supplier_id?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          active_status?: boolean | null
          contract_name?: string
          created_at?: string | null
          id?: string
          supplier_id?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cab_contracts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "cab_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      cab_rates: {
        Row: {
          ac_type: string | null
          active: boolean | null
          base_rate: number
          created_at: string
          driver_allowance: number | null
          id: string
          rate_type: string
          seating_capacity: number
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          ac_type?: string | null
          active?: boolean | null
          base_rate: number
          created_at?: string
          driver_allowance?: number | null
          id?: string
          rate_type: string
          seating_capacity: number
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          ac_type?: string | null
          active?: boolean | null
          base_rate?: number
          created_at?: string
          driver_allowance?: number | null
          id?: string
          rate_type?: string
          seating_capacity?: number
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      cab_routes: {
        Row: {
          active_status: boolean | null
          country: string | null
          created_at: string | null
          destination: string
          distance_km: number | null
          id: string
          maps_link: string | null
          route_type: string | null
          source: string
          state: string | null
          travel_time: string | null
          updated_at: string | null
        }
        Insert: {
          active_status?: boolean | null
          country?: string | null
          created_at?: string | null
          destination: string
          distance_km?: number | null
          id?: string
          maps_link?: string | null
          route_type?: string | null
          source: string
          state?: string | null
          travel_time?: string | null
          updated_at?: string | null
        }
        Update: {
          active_status?: boolean | null
          country?: string | null
          created_at?: string | null
          destination?: string
          distance_km?: number | null
          id?: string
          maps_link?: string | null
          route_type?: string | null
          source?: string
          state?: string | null
          travel_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cab_suppliers: {
        Row: {
          active_status: boolean | null
          commission_percentage: number | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          gst_number: string | null
          id: string
          mobile: string | null
          pan_number: string | null
          payment_terms: string | null
          supplier_code: string | null
          supplier_name: string
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          active_status?: boolean | null
          commission_percentage?: number | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          mobile?: string | null
          pan_number?: string | null
          payment_terms?: string | null
          supplier_code?: string | null
          supplier_name: string
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          active_status?: boolean | null
          commission_percentage?: number | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          mobile?: string | null
          pan_number?: string | null
          payment_terms?: string | null
          supplier_code?: string | null
          supplier_name?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      cab_vehicles: {
        Row: {
          active_status: boolean | null
          availability_status: string | null
          capacity_adults: number | null
          capacity_children: number | null
          created_at: string | null
          id: string
          luggage_capacity: string | null
          updated_at: string | null
          vehicle_category: string | null
          vehicle_images: string[] | null
          vehicle_type: string
        }
        Insert: {
          active_status?: boolean | null
          availability_status?: string | null
          capacity_adults?: number | null
          capacity_children?: number | null
          created_at?: string | null
          id?: string
          luggage_capacity?: string | null
          updated_at?: string | null
          vehicle_category?: string | null
          vehicle_images?: string[] | null
          vehicle_type: string
        }
        Update: {
          active_status?: boolean | null
          availability_status?: string | null
          capacity_adults?: number | null
          capacity_children?: number | null
          created_at?: string | null
          id?: string
          luggage_capacity?: string | null
          updated_at?: string | null
          vehicle_category?: string | null
          vehicle_images?: string[] | null
          vehicle_type?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          active_status: boolean
          city_name: string
          created_at: string
          destination_type: string
          id: string
          state_id: string
        }
        Insert: {
          active_status?: boolean
          city_name: string
          created_at?: string
          destination_type?: string
          id?: string
          state_id: string
        }
        Update: {
          active_status?: boolean
          city_name?: string
          created_at?: string
          destination_type?: string
          id?: string
          state_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          active_status: boolean
          country_code: string
          country_name: string
          created_at: string
          id: string
        }
        Insert: {
          active_status?: boolean
          country_code: string
          country_name: string
          created_at?: string
          id?: string
        }
        Update: {
          active_status?: boolean
          country_code?: string
          country_name?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      crm_invitations: {
        Row: {
          business_type: string
          city: string | null
          company_name: string
          country: string | null
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: string
          state: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_type: string
          city?: string | null
          company_name: string
          country?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role: string
          state?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_type?: string
          city?: string | null
          company_name?: string
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: string
          state?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_users: {
        Row: {
          active_status: boolean
          auth_user_id: string | null
          avatar_url: string | null
          business_type: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          designation: string | null
          email: string
          expected_bookings: number | null
          id: string
          mobile_number: string | null
          name: string
          reason_for_access: string | null
          rejection_reason: string | null
          role: string
          state: string | null
          status: string
          updated_at: string
        }
        Insert: {
          active_status?: boolean
          auth_user_id?: string | null
          avatar_url?: string | null
          business_type?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          designation?: string | null
          email: string
          expected_bookings?: number | null
          id?: string
          mobile_number?: string | null
          name: string
          reason_for_access?: string | null
          rejection_reason?: string | null
          role: string
          state?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          active_status?: boolean
          auth_user_id?: string | null
          avatar_url?: string | null
          business_type?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          designation?: string | null
          email?: string
          expected_bookings?: number | null
          id?: string
          mobile_number?: string | null
          name?: string
          reason_for_access?: string | null
          rejection_reason?: string | null
          role?: string
          state?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      destination_groups: {
        Row: {
          city_names: string[]
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          city_names: string[]
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          city_names?: string[]
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      destinations: {
        Row: {
          average_cost: number | null
          best_season: string | null
          id: string
          name: string
          popular_activities: string[] | null
          sub_destinations: string[] | null
        }
        Insert: {
          average_cost?: number | null
          best_season?: string | null
          id?: string
          name: string
          popular_activities?: string[] | null
          sub_destinations?: string[] | null
        }
        Update: {
          average_cost?: number | null
          best_season?: string | null
          id?: string
          name?: string
          popular_activities?: string[] | null
          sub_destinations?: string[] | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          file_url: string | null
          id: string
          lead_id: string
          name: string
          size: string
          type: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          file_url?: string | null
          id?: string
          lead_id: string
          name: string
          size: string
          type: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          file_url?: string | null
          id?: string
          lead_id?: string
          name?: string
          size?: string
          type?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          metadata: Json | null
          recipient: string
          retry_count: number
          sent_at: string | null
          status: string
          subject: string
          template: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json | null
          recipient: string
          retry_count?: number
          sent_at?: string | null
          status?: string
          subject: string
          template: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json | null
          recipient?: string
          retry_count?: number
          sent_at?: string | null
          status?: string
          subject?: string
          template?: string
        }
        Relationships: []
      }
      excursions: {
        Row: {
          active: boolean | null
          adult_rate: number
          category: string | null
          child_rate: number | null
          city: string
          created_at: string
          description: string | null
          duration_hours: number | null
          excursion_code: string
          excursion_name: string
          id: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          adult_rate: number
          category?: string | null
          child_rate?: number | null
          city: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          excursion_code: string
          excursion_name: string
          id?: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          adult_rate?: number
          category?: string | null
          child_rate?: number | null
          city?: string
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          excursion_code?: string
          excursion_name?: string
          id?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_by: string | null
          created_date: string
          id: string
          lead_source: string | null
          modified_by: string | null
          modified_date: string | null
          payment_date: string
          reference_number: string | null
          remarks: string | null
          sub_category: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          category: string
          created_by?: string | null
          created_date?: string
          id: string
          lead_source?: string | null
          modified_by?: string | null
          modified_date?: string | null
          payment_date: string
          reference_number?: string | null
          remarks?: string | null
          sub_category: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_by?: string | null
          created_date?: string
          id?: string
          lead_source?: string | null
          modified_by?: string | null
          modified_date?: string | null
          payment_date?: string
          reference_number?: string | null
          remarks?: string | null
          sub_category?: string
          vendor_name?: string | null
        }
        Relationships: []
      }
      hotel_categories: {
        Row: {
          active_status: boolean
          category_name: string
          created_at: string
          id: string
        }
        Insert: {
          active_status?: boolean
          category_name: string
          created_at?: string
          id?: string
        }
        Update: {
          active_status?: boolean
          category_name?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      hotel_contract_rates: {
        Row: {
          active_status: boolean
          blackout_dates: string[]
          child_with_bed_rate: number
          child_without_bed_rate: number
          contract_id: string
          created_at: string
          double_rate: number
          extra_adult_rate: number
          extra_child_rate: number | null
          five_bed_rate: number
          gst_amount: number | null
          gst_percentage: number | null
          id: string
          is_tax_overridden: boolean | null
          markup: number | null
          meal_plan_id: string
          net_cost: number | null
          peak_season_surcharge: number
          quad_rate: number
          rate_type: string | null
          room_category_id: string
          season_id: string | null
          selling_cost: number | null
          single_rate: number
          six_bed_rate: number
          supplier_cost: number | null
          tax_audit_logs: Json | null
          tax_override_reason: string | null
          triple_rate: number
          weekend_surcharge: number
        }
        Insert: {
          active_status?: boolean
          blackout_dates?: string[]
          child_with_bed_rate?: number
          child_without_bed_rate?: number
          contract_id: string
          created_at?: string
          double_rate?: number
          extra_adult_rate?: number
          extra_child_rate?: number | null
          five_bed_rate?: number
          gst_amount?: number | null
          gst_percentage?: number | null
          id?: string
          is_tax_overridden?: boolean | null
          markup?: number | null
          meal_plan_id: string
          net_cost?: number | null
          peak_season_surcharge?: number
          quad_rate?: number
          rate_type?: string | null
          room_category_id: string
          season_id?: string | null
          selling_cost?: number | null
          single_rate?: number
          six_bed_rate?: number
          supplier_cost?: number | null
          tax_audit_logs?: Json | null
          tax_override_reason?: string | null
          triple_rate?: number
          weekend_surcharge?: number
        }
        Update: {
          active_status?: boolean
          blackout_dates?: string[]
          child_with_bed_rate?: number
          child_without_bed_rate?: number
          contract_id?: string
          created_at?: string
          double_rate?: number
          extra_adult_rate?: number
          extra_child_rate?: number | null
          five_bed_rate?: number
          gst_amount?: number | null
          gst_percentage?: number | null
          id?: string
          is_tax_overridden?: boolean | null
          markup?: number | null
          meal_plan_id?: string
          net_cost?: number | null
          peak_season_surcharge?: number
          quad_rate?: number
          rate_type?: string | null
          room_category_id?: string
          season_id?: string | null
          selling_cost?: number | null
          single_rate?: number
          six_bed_rate?: number
          supplier_cost?: number | null
          tax_audit_logs?: Json | null
          tax_override_reason?: string | null
          triple_rate?: number
          weekend_surcharge?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotel_contract_rates_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "hotel_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_contract_rates_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_contract_rates_room_category_id_fkey"
            columns: ["room_category_id"]
            isOneToOne: false
            referencedRelation: "room_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_contract_rates_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_contracts: {
        Row: {
          active_status: boolean
          cancellation_policy: string | null
          contract_name: string
          created_at: string
          currency: string
          gst_percentage: number
          hotel_id: string
          id: string
          payment_policy: string | null
          supplier_id: string | null
          valid_from: string
          valid_to: string
        }
        Insert: {
          active_status?: boolean
          cancellation_policy?: string | null
          contract_name: string
          created_at?: string
          currency?: string
          gst_percentage?: number
          hotel_id: string
          id?: string
          payment_policy?: string | null
          supplier_id?: string | null
          valid_from: string
          valid_to: string
        }
        Update: {
          active_status?: boolean
          cancellation_policy?: string | null
          contract_name?: string
          created_at?: string
          currency?: string
          gst_percentage?: number
          hotel_id?: string
          id?: string
          payment_policy?: string | null
          supplier_id?: string | null
          valid_from?: string
          valid_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_contracts_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_contracts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "hotel_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_facilities: {
        Row: {
          active_status: boolean
          created_at: string
          facility_name: string
          id: string
        }
        Insert: {
          active_status?: boolean
          created_at?: string
          facility_name: string
          id?: string
        }
        Update: {
          active_status?: boolean
          created_at?: string
          facility_name?: string
          id?: string
        }
        Relationships: []
      }
      hotel_facility_mapping: {
        Row: {
          facility_id: string
          hotel_id: string
        }
        Insert: {
          facility_id: string
          hotel_id: string
        }
        Update: {
          facility_id?: string
          hotel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_facility_mapping_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "hotel_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_facility_mapping_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_images: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          image_url: string
          is_featured: boolean
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          image_url: string
          is_featured?: boolean
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          image_url?: string
          is_featured?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "hotel_images_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_rates: {
        Row: {
          active: boolean | null
          child_with_bed_rate: number
          child_without_bed_rate: number
          created_at: string
          double_occupancy_rate: number
          extra_adult_rate: number
          five_bed_rate: number
          hotel_id: string
          id: string
          quad_occupancy_rate: number
          room_category: string
          season: string
          single_occupancy_rate: number
          six_bed_rate: number
          triple_occupancy_rate: number
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          active?: boolean | null
          child_with_bed_rate?: number
          child_without_bed_rate?: number
          created_at?: string
          double_occupancy_rate?: number
          extra_adult_rate?: number
          five_bed_rate?: number
          hotel_id: string
          id?: string
          quad_occupancy_rate?: number
          room_category: string
          season: string
          single_occupancy_rate?: number
          six_bed_rate?: number
          triple_occupancy_rate?: number
          updated_at?: string
          valid_from: string
          valid_to: string
        }
        Update: {
          active?: boolean | null
          child_with_bed_rate?: number
          child_without_bed_rate?: number
          created_at?: string
          double_occupancy_rate?: number
          extra_adult_rate?: number
          five_bed_rate?: number
          hotel_id?: string
          id?: string
          quad_occupancy_rate?: number
          room_category?: string
          season?: string
          single_occupancy_rate?: number
          six_bed_rate?: number
          triple_occupancy_rate?: number
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_rates_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_suppliers: {
        Row: {
          active_status: boolean
          commission_percentage: number | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          mobile: string | null
          payment_terms: string | null
          supplier_name: string
          supplier_type: string
        }
        Insert: {
          active_status?: boolean
          commission_percentage?: number | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mobile?: string | null
          payment_terms?: string | null
          supplier_name: string
          supplier_type?: string
        }
        Update: {
          active_status?: boolean
          commission_percentage?: number | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mobile?: string | null
          payment_terms?: string | null
          supplier_name?: string
          supplier_type?: string
        }
        Relationships: []
      }
      hotels: {
        Row: {
          active: boolean | null
          active_status: boolean | null
          address: string | null
          brochure_pdf_url: string | null
          cancellation_policy: string | null
          category_id: string | null
          check_in_time: string | null
          check_out_time: string | null
          child_policy: string | null
          city: string
          city_id: string | null
          contact_email: string | null
          contact_number: string | null
          contact_person: string | null
          country: string | null
          country_id: string | null
          created_at: string
          destination_group: string
          email: string | null
          extra_bed_policy: string | null
          featured_image_url: string | null
          gallery_urls: string[] | null
          google_rating: number | null
          gps_coordinates: string | null
          hotel_code: string
          hotel_name: string
          id: string
          internal_rating: number | null
          logo_url: string | null
          maps_location: string | null
          meal_plan_supported: string[] | null
          nearest_airport: string | null
          nearest_railway: string | null
          photos: string[] | null
          star_rating: number | null
          state: string | null
          state_id: string | null
          supplier_name: string | null
          updated_at: string
          video_urls: string[] | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          active_status?: boolean | null
          address?: string | null
          brochure_pdf_url?: string | null
          cancellation_policy?: string | null
          category_id?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          child_policy?: string | null
          city: string
          city_id?: string | null
          contact_email?: string | null
          contact_number?: string | null
          contact_person?: string | null
          country?: string | null
          country_id?: string | null
          created_at?: string
          destination_group?: string
          email?: string | null
          extra_bed_policy?: string | null
          featured_image_url?: string | null
          gallery_urls?: string[] | null
          google_rating?: number | null
          gps_coordinates?: string | null
          hotel_code: string
          hotel_name: string
          id?: string
          internal_rating?: number | null
          logo_url?: string | null
          maps_location?: string | null
          meal_plan_supported?: string[] | null
          nearest_airport?: string | null
          nearest_railway?: string | null
          photos?: string[] | null
          star_rating?: number | null
          state?: string | null
          state_id?: string | null
          supplier_name?: string | null
          updated_at?: string
          video_urls?: string[] | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          active_status?: boolean | null
          address?: string | null
          brochure_pdf_url?: string | null
          cancellation_policy?: string | null
          category_id?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          child_policy?: string | null
          city?: string
          city_id?: string | null
          contact_email?: string | null
          contact_number?: string | null
          contact_person?: string | null
          country?: string | null
          country_id?: string | null
          created_at?: string
          destination_group?: string
          email?: string | null
          extra_bed_policy?: string | null
          featured_image_url?: string | null
          gallery_urls?: string[] | null
          google_rating?: number | null
          gps_coordinates?: string | null
          hotel_code?: string
          hotel_name?: string
          id?: string
          internal_rating?: number | null
          logo_url?: string | null
          maps_location?: string | null
          meal_plan_supported?: string[] | null
          nearest_airport?: string | null
          nearest_railway?: string | null
          photos?: string[] | null
          star_rating?: number | null
          state?: string | null
          state_id?: string | null
          supplier_name?: string | null
          updated_at?: string
          video_urls?: string[] | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "hotel_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotels_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotels_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotels_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          adult_count: number
          child_count: number | null
          cost_per_person: number | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_feedback: Json | null
          customer_name: string
          customer_phone: string | null
          destinations: string[]
          excursion_cost: number | null
          final_cost: number | null
          hotel_cost: number | null
          id: string
          infant_count: number | null
          internal_comments: Json | null
          is_template: boolean | null
          itinerary_code: string
          itinerary_name: string
          last_viewed_at: string | null
          lead_id: string | null
          markup_percentage: number | null
          modified_by: string | null
          notes: string | null
          package_type: string | null
          review_request_sent: boolean | null
          status: string | null
          total_cost: number | null
          total_guests: number
          total_nights: number
          transport_cost: number | null
          travel_end_date: string
          travel_start_date: string
          updated_at: string
          version_history: Json | null
          view_count: number | null
          views_metadata: Json | null
        }
        Insert: {
          adult_count?: number
          child_count?: number | null
          cost_per_person?: number | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_feedback?: Json | null
          customer_name: string
          customer_phone?: string | null
          destinations: string[]
          excursion_cost?: number | null
          final_cost?: number | null
          hotel_cost?: number | null
          id?: string
          infant_count?: number | null
          internal_comments?: Json | null
          is_template?: boolean | null
          itinerary_code: string
          itinerary_name: string
          last_viewed_at?: string | null
          lead_id?: string | null
          markup_percentage?: number | null
          modified_by?: string | null
          notes?: string | null
          package_type?: string | null
          review_request_sent?: boolean | null
          status?: string | null
          total_cost?: number | null
          total_guests?: number
          total_nights: number
          transport_cost?: number | null
          travel_end_date: string
          travel_start_date: string
          updated_at?: string
          version_history?: Json | null
          view_count?: number | null
          views_metadata?: Json | null
        }
        Update: {
          adult_count?: number
          child_count?: number | null
          cost_per_person?: number | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_feedback?: Json | null
          customer_name?: string
          customer_phone?: string | null
          destinations?: string[]
          excursion_cost?: number | null
          final_cost?: number | null
          hotel_cost?: number | null
          id?: string
          infant_count?: number | null
          internal_comments?: Json | null
          is_template?: boolean | null
          itinerary_code?: string
          itinerary_name?: string
          last_viewed_at?: string | null
          lead_id?: string | null
          markup_percentage?: number | null
          modified_by?: string | null
          notes?: string | null
          package_type?: string | null
          review_request_sent?: boolean | null
          status?: string | null
          total_cost?: number | null
          total_guests?: number
          total_nights?: number
          transport_cost?: number | null
          travel_end_date?: string
          travel_start_date?: string
          updated_at?: string
          version_history?: Json | null
          view_count?: number | null
          views_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itineraries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itineraries_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "crm_users"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_days: {
        Row: {
          accommodation_city: string | null
          city: string
          created_at: string
          date: string
          day_number: number
          description: string | null
          id: string
          itinerary_id: string
          meals: string[] | null
          metadata: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          accommodation_city?: string | null
          city: string
          created_at?: string
          date: string
          day_number: number
          description?: string | null
          id?: string
          itinerary_id: string
          meals?: string[] | null
          metadata?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          accommodation_city?: string | null
          city?: string
          created_at?: string
          date?: string
          day_number?: number
          description?: string | null
          id?: string
          itinerary_id?: string
          meals?: string[] | null
          metadata?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_days_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_excursions: {
        Row: {
          adult_count: number
          adult_rate: number
          child_count: number | null
          child_rate: number | null
          created_at: string
          excursion_date: string
          excursion_id: string
          excursion_time: string | null
          id: string
          itinerary_day_id: string
          itinerary_id: string
          total_cost: number
          updated_at: string
        }
        Insert: {
          adult_count?: number
          adult_rate: number
          child_count?: number | null
          child_rate?: number | null
          created_at?: string
          excursion_date: string
          excursion_id: string
          excursion_time?: string | null
          id?: string
          itinerary_day_id: string
          itinerary_id: string
          total_cost: number
          updated_at?: string
        }
        Update: {
          adult_count?: number
          adult_rate?: number
          child_count?: number | null
          child_rate?: number | null
          created_at?: string
          excursion_date?: string
          excursion_id?: string
          excursion_time?: string | null
          id?: string
          itinerary_day_id?: string
          itinerary_id?: string
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_excursions_excursion_id_fkey"
            columns: ["excursion_id"]
            isOneToOne: false
            referencedRelation: "excursions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_excursions_itinerary_day_id_fkey"
            columns: ["itinerary_day_id"]
            isOneToOne: false
            referencedRelation: "itinerary_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_excursions_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_hotels: {
        Row: {
          check_in_date: string
          check_out_date: string
          created_at: string
          gst_cost: number | null
          hotel_id: string
          hotel_rate_id: string | null
          id: string
          itinerary_day_id: string | null
          itinerary_id: string
          meal_plan: string
          nights: number
          rate_per_night: number
          room_category: string
          room_configuration: Json
          room_cost: number | null
          special_requests: string | null
          total_cost: number
          updated_at: string
        }
        Insert: {
          check_in_date: string
          check_out_date: string
          created_at?: string
          gst_cost?: number | null
          hotel_id: string
          hotel_rate_id?: string | null
          id?: string
          itinerary_day_id?: string | null
          itinerary_id: string
          meal_plan: string
          nights: number
          rate_per_night: number
          room_category: string
          room_configuration?: Json
          room_cost?: number | null
          special_requests?: string | null
          total_cost: number
          updated_at?: string
        }
        Update: {
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          gst_cost?: number | null
          hotel_id?: string
          hotel_rate_id?: string | null
          id?: string
          itinerary_day_id?: string | null
          itinerary_id?: string
          meal_plan?: string
          nights?: number
          rate_per_night?: number
          room_category?: string
          room_configuration?: Json
          room_cost?: number | null
          special_requests?: string | null
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_hotels_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_hotels_itinerary_day_id_fkey"
            columns: ["itinerary_day_id"]
            isOneToOne: false
            referencedRelation: "itinerary_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_hotels_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_transport: {
        Row: {
          base_cost: number | null
          cab_rate_id: string | null
          created_at: string
          distance_km: number | null
          driver_cost: number | null
          gst_cost: number | null
          gst_included: boolean | null
          gst_percentage: number | null
          id: string
          itinerary_day_id: string | null
          itinerary_id: string
          markup_amount: number | null
          markup_percentage: number | null
          parking_charges: number | null
          permit_charges: number | null
          pickup_date: string | null
          pickup_time: string | null
          profit_margin: number | null
          rate: number
          rate_type: string
          route_from: string
          route_to: string
          selling_cost: number | null
          state_tax: number | null
          supplier_cost: number | null
          toll_charges: number | null
          total_cost: number
          transport_type: string
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          base_cost?: number | null
          cab_rate_id?: string | null
          created_at?: string
          distance_km?: number | null
          driver_cost?: number | null
          gst_cost?: number | null
          gst_included?: boolean | null
          gst_percentage?: number | null
          id?: string
          itinerary_day_id?: string | null
          itinerary_id: string
          markup_amount?: number | null
          markup_percentage?: number | null
          parking_charges?: number | null
          permit_charges?: number | null
          pickup_date?: string | null
          pickup_time?: string | null
          profit_margin?: number | null
          rate: number
          rate_type: string
          route_from: string
          route_to: string
          selling_cost?: number | null
          state_tax?: number | null
          supplier_cost?: number | null
          toll_charges?: number | null
          total_cost: number
          transport_type: string
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          base_cost?: number | null
          cab_rate_id?: string | null
          created_at?: string
          distance_km?: number | null
          driver_cost?: number | null
          gst_cost?: number | null
          gst_included?: boolean | null
          gst_percentage?: number | null
          id?: string
          itinerary_day_id?: string | null
          itinerary_id?: string
          markup_amount?: number | null
          markup_percentage?: number | null
          parking_charges?: number | null
          permit_charges?: number | null
          pickup_date?: string | null
          pickup_time?: string | null
          profit_margin?: number | null
          rate?: number
          rate_type?: string
          route_from?: string
          route_to?: string
          selling_cost?: number | null
          state_tax?: number | null
          supplier_cost?: number | null
          toll_charges?: number | null
          total_cost?: number
          transport_type?: string
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_transport_cab_rate_id_fkey"
            columns: ["cab_rate_id"]
            isOneToOne: false
            referencedRelation: "cab_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_transport_itinerary_day_id_fkey"
            columns: ["itinerary_day_id"]
            isOneToOne: false
            referencedRelation: "itinerary_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_transport_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_journey: {
        Row: {
          agent: string | null
          id: string
          lead_id: string | null
          remarks: string | null
          status: string
          timestamp: string
        }
        Insert: {
          agent?: string | null
          id: string
          lead_id?: string | null
          remarks?: string | null
          status: string
          timestamp?: string
        }
        Update: {
          agent?: string | null
          id?: string
          lead_id?: string | null
          remarks?: string | null
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_journey_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          adult_count: number | null
          agent_name: string | null
          assigned_to: string | null
          attached_packages: Json | null
          brochure_email_status: string | null
          brochure_requested: boolean | null
          brochure_sent: boolean | null
          brochure_sent_date: string | null
          budget: string | null
          call_follow_up: string | null
          call_summary: string | null
          child_count: number | null
          city: string | null
          communication_method: string | null
          company_name: string | null
          contact_number: string | null
          country: string | null
          created_at: string
          created_by: string | null
          customer_category: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          customer_type: string | null
          days_since_last_contact: number | null
          deleted_at: string | null
          deleted_by: string | null
          deleted_by_role: string | null
          deletion_notes: string | null
          deletion_reason: string | null
          destinations: string | null
          discussion_notes: string | null
          discussions: Json | null
          duration: string | null
          email: string | null
          email_history: Json | null
          email_sent_count: number | null
          email_sent_date: string | null
          email_status: string | null
          enquiry_number: string | null
          expected_booking_value: number | null
          follow_up_date: string | null
          hotel_category: string | null
          id: string
          infant_count: number | null
          interests: string | null
          last_contact_date: string | null
          last_email_sent_date: string | null
          lead_created_date: string | null
          lead_destination: string[] | null
          lead_id: string | null
          lead_prospect: string | null
          lead_purchased_date: string | null
          lost_reason: string | null
          next_action: string | null
          next_call_time: string | null
          next_payment_due_date: string | null
          notes: string | null
          number_of_nights: number | null
          number_of_travelers: number | null
          package_cost: number | null
          package_name: string
          package_price: number
          package_type: string | null
          pdf_file_name: string | null
          priority: string | null
          source: string | null
          status: 'New' | 'Assigned' | 'Follow-up Due' | 'Quote Sent' | 'Booking Confirmed' | 'Closed Lost'
          total_pax_count: number | null
          tour_description: string | null
          transport_preference: string | null
          travel_interest: string | null
          travel_month: string | null
          travel_theme: string | null
          trip_end_date: string | null
          trip_start_date: string | null
          updated_at: string
          user_id: string | null
          whatsapp_number: string | null
        }
        Insert: {
          adult_count?: number | null
          agent_name?: string | null
          assigned_to?: string | null
          attached_packages?: Json | null
          brochure_email_status?: string | null
          brochure_requested?: boolean | null
          brochure_sent?: boolean | null
          brochure_sent_date?: string | null
          budget?: string | null
          call_follow_up?: string | null
          call_summary?: string | null
          child_count?: number | null
          city?: string | null
          communication_method?: string | null
          company_name?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          customer_category?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          customer_type?: string | null
          days_since_last_contact?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_by_role?: string | null
          deletion_notes?: string | null
          deletion_reason?: string | null
          destinations?: string | null
          discussion_notes?: string | null
          discussions?: Json | null
          duration?: string | null
          email?: string | null
          email_history?: Json | null
          email_sent_count?: number | null
          email_sent_date?: string | null
          email_status?: string | null
          enquiry_number?: string | null
          expected_booking_value?: number | null
          follow_up_date?: string | null
          hotel_category?: string | null
          id: string
          infant_count?: number | null
          interests?: string | null
          last_contact_date?: string | null
          last_email_sent_date?: string | null
          lead_created_date?: string | null
          lead_destination?: string[] | null
          lead_id?: string | null
          lead_prospect?: string | null
          lead_purchased_date?: string | null
          lost_reason?: string | null
          next_action?: string | null
          next_call_time?: string | null
          next_payment_due_date?: string | null
          notes?: string | null
          number_of_nights?: number | null
          number_of_travelers?: number | null
          package_cost?: number | null
          package_name: string
          package_price?: number
          package_type?: string | null
          pdf_file_name?: string | null
          priority?: string | null
          source?: string | null
          state?: string | null
          status: 'New' | 'Assigned' | 'Follow-up Due' | 'Quote Sent' | 'Booking Confirmed' | 'Closed Lost'
          total_pax_count?: number | null
          tour_description?: string | null
          transport_preference?: string | null
          travel_interest?: string | null
          travel_month?: string | null
          travel_theme?: string | null
          trip_end_date?: string | null
          trip_start_date?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          adult_count?: number | null
          agent_name?: string | null
          assigned_to?: string | null
          attached_packages?: Json | null
          brochure_email_status?: string | null
          brochure_requested?: boolean | null
          brochure_sent?: boolean | null
          brochure_sent_date?: string | null
          budget?: string | null
          call_follow_up?: string | null
          call_summary?: string | null
          child_count?: number | null
          city?: string | null
          communication_method?: string | null
          company_name?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          customer_category?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          customer_type?: string | null
          days_since_last_contact?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_by_role?: string | null
          deletion_notes?: string | null
          deletion_reason?: string | null
          destinations?: string | null
          discussion_notes?: string | null
          discussions?: Json | null
          duration?: string | null
          email?: string | null
          email_history?: Json | null
          email_sent_count?: number | null
          email_sent_date?: string | null
          email_status?: string | null
          enquiry_number?: string | null
          expected_booking_value?: number | null
          follow_up_date?: string | null
          hotel_category?: string | null
          id?: string
          infant_count?: number | null
          interests?: string | null
          last_contact_date?: string | null
          last_email_sent_date?: string | null
          lead_created_date?: string | null
          lead_destination?: string[] | null
          lead_id?: string | null
          lead_prospect?: string | null
          lead_purchased_date?: string | null
          lost_reason?: string | null
          next_action?: string | null
          next_call_time?: string | null
          next_payment_due_date?: string | null
          notes?: string | null
          number_of_nights?: number | null
          number_of_travelers?: number | null
          package_cost?: number | null
          package_name?: string
          package_price?: number
          package_type?: string | null
          pdf_file_name?: string | null
          priority?: string | null
          source?: string | null
          state?: string | null
          status?: 'New' | 'Assigned' | 'Follow-up Due' | 'Quote Sent' | 'Booking Confirmed' | 'Closed Lost'
          total_pax_count?: number | null
          tour_description?: string | null
          transport_preference?: string | null
          travel_interest?: string | null
          travel_month?: string | null
          travel_theme?: string | null
          trip_end_date?: string | null
          trip_start_date?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      login_audit_logs: {
        Row: {
          action: string
          browser: string | null
          created_at: string
          id: string
          ip_address: string | null
          user_email: string
        }
        Insert: {
          action: string
          browser?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          user_email: string
        }
        Update: {
          action?: string
          browser?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          user_email?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          id: string
          meal_plan_name: string
        }
        Insert: {
          id: string
          meal_plan_name: string
        }
        Update: {
          id?: string
          meal_plan_name?: string
        }
        Relationships: []
      }
      package_name_templates: {
        Row: {
          created_at: string | null
          id: string
          template_format: string
          theme: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          template_format: string
          theme?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          template_format?: string
          theme?: string | null
        }
        Relationships: []
      }
      package_templates: {
        Row: {
          cities: string[]
          created_at: string
          default_nights: number[]
          destination_group: string
          id: string
          is_active: boolean | null
          template_name: string
        }
        Insert: {
          cities: string[]
          created_at?: string
          default_nights: number[]
          destination_group: string
          id?: string
          is_active?: boolean | null
          template_name: string
        }
        Update: {
          cities?: string[]
          created_at?: string
          default_nights?: number[]
          destination_group?: string
          id?: string
          is_active?: boolean | null
          template_name?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          best_time: string | null
          category: string[] | null
          destinations: string[] | null
          difficulty: string | null
          duration: string | null
          exclusions: string[] | null
          faqs: Json | null
          flight_routes: Json | null
          group_size: string | null
          highlights: string[] | null
          id: string
          image: string | null
          images: string[] | null
          inclusions: string[] | null
          is_active: boolean | null
          itinerary: Json | null
          map_locations: Json | null
          name: string
          package_type: string | null
          price: number | null
          quick_facts: Json | null
          rating: number | null
          reviews: number | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string | null
          updated_at: string | null
          virtual_tour: Json | null
        }
        Insert: {
          best_time?: string | null
          category?: string[] | null
          destinations?: string[] | null
          difficulty?: string | null
          duration?: string | null
          exclusions?: string[] | null
          faqs?: Json | null
          flight_routes?: Json | null
          group_size?: string | null
          highlights?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          inclusions?: string[] | null
          is_active?: boolean | null
          itinerary?: Json | null
          map_locations?: Json | null
          name: string
          package_type?: string | null
          price?: number | null
          quick_facts?: Json | null
          rating?: number | null
          reviews?: number | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string | null
          updated_at?: string | null
          virtual_tour?: Json | null
        }
        Update: {
          best_time?: string | null
          category?: string[] | null
          destinations?: string[] | null
          difficulty?: string | null
          duration?: string | null
          exclusions?: string[] | null
          faqs?: Json | null
          flight_routes?: Json | null
          group_size?: string | null
          highlights?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          inclusions?: string[] | null
          is_active?: boolean | null
          itinerary?: Json | null
          map_locations?: Json | null
          name?: string
          package_type?: string | null
          price?: number | null
          quick_facts?: Json | null
          rating?: number | null
          reviews?: number | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string | null
          updated_at?: string | null
          virtual_tour?: Json | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_received: number
          created_at: string
          id: string
          lead_id: string | null
          payment_date: string
          payment_mode: string
          received_by: string | null
          reference_number: string | null
          remarks: string | null
        }
        Insert: {
          amount_received: number
          created_at?: string
          id: string
          lead_id?: string | null
          payment_date: string
          payment_mode: string
          received_by?: string | null
          reference_number?: string | null
          remarks?: string | null
        }
        Update: {
          amount_received?: number
          created_at?: string
          id?: string
          lead_id?: string | null
          payment_date?: string
          payment_mode?: string
          received_by?: string | null
          reference_number?: string | null
          remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          cab_rating: number
          created_at: string | null
          customer_name: string
          destination: string
          featured: boolean | null
          hotel_rating: number
          id: string
          lead_id: string | null
          package_name: string
          photos: string[] | null
          rating: number
          review_text: string | null
          sightseeing_rating: number
          status: string | null
          travel_date: string
          trip_planning_rating: number
          updated_at: string | null
          verified: boolean | null
          video_url: string | null
        }
        Insert: {
          booking_id?: string | null
          cab_rating: number
          created_at?: string | null
          customer_name: string
          destination: string
          featured?: boolean | null
          hotel_rating: number
          id?: string
          lead_id?: string | null
          package_name: string
          photos?: string[] | null
          rating: number
          review_text?: string | null
          sightseeing_rating: number
          status?: string | null
          travel_date: string
          trip_planning_rating: number
          updated_at?: string | null
          verified?: boolean | null
          video_url?: string | null
        }
        Update: {
          booking_id?: string | null
          cab_rating?: number
          created_at?: string | null
          customer_name?: string
          destination?: string
          featured?: boolean | null
          hotel_rating?: number
          id?: string
          lead_id?: string | null
          package_name?: string
          photos?: string[] | null
          rating?: number
          review_text?: string | null
          sightseeing_rating?: number
          status?: string | null
          travel_date?: string
          trip_planning_rating?: number
          updated_at?: string | null
          verified?: boolean | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      room_categories: {
        Row: {
          active_status: boolean
          bed_type: string | null
          created_at: string
          facilities: string[] | null
          hotel_id: string
          id: string
          max_adults: number
          max_children: number
          room_category_name: string
          room_description: string | null
          room_images: string[] | null
          room_size: string | null
        }
        Insert: {
          active_status?: boolean
          bed_type?: string | null
          created_at?: string
          facilities?: string[] | null
          hotel_id: string
          id?: string
          max_adults?: number
          max_children?: number
          room_category_name: string
          room_description?: string | null
          room_images?: string[] | null
          room_size?: string | null
        }
        Update: {
          active_status?: boolean
          bed_type?: string | null
          created_at?: string
          facilities?: string[] | null
          hotel_id?: string
          id?: string
          max_adults?: number
          max_children?: number
          room_category_name?: string
          room_description?: string | null
          room_images?: string[] | null
          room_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_categories_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          end_date: string
          hotel_id: string
          id: string
          season_name: string
          season_type: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          hotel_id: string
          id?: string
          season_name: string
          season_type: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          hotel_id?: string
          id?: string
          season_name?: string
          season_type?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasons_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      sightseeings: {
        Row: {
          active_status: boolean | null
          adult_cost: number | null
          category: string | null
          child_cost: number | null
          country_id: string | null
          created_at: string | null
          description: string | null
          destination: string
          duration: string | null
          exclusions: string[] | null
          gst_included: boolean | null
          gst_percentage: number | null
          highlights: string[] | null
          id: string
          image_url: string | null
          inclusions: string[] | null
          is_full_day: boolean | null
          is_half_day: boolean | null
          selling_cost: number | null
          sightseeing_code: string
          sightseeing_name: string
          state_id: string | null
          sub_category: string | null
          supplier_cost: number | null
          supplier_name: string | null
          updated_at: string | null
          vehicle_required: boolean | null
        }
        Insert: {
          active_status?: boolean | null
          adult_cost?: number | null
          category?: string | null
          child_cost?: number | null
          country_id?: string | null
          created_at?: string | null
          description?: string | null
          destination: string
          duration?: string | null
          exclusions?: string[] | null
          gst_included?: boolean | null
          gst_percentage?: number | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          inclusions?: string[] | null
          is_full_day?: boolean | null
          is_half_day?: boolean | null
          selling_cost?: number | null
          sightseeing_code: string
          sightseeing_name: string
          state_id?: string | null
          sub_category?: string | null
          supplier_cost?: number | null
          supplier_name?: string | null
          updated_at?: string | null
          vehicle_required?: boolean | null
        }
        Update: {
          active_status?: boolean | null
          adult_cost?: number | null
          category?: string | null
          child_cost?: number | null
          country_id?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string
          duration?: string | null
          exclusions?: string[] | null
          gst_included?: boolean | null
          gst_percentage?: number | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          inclusions?: string[] | null
          is_full_day?: boolean | null
          is_half_day?: boolean | null
          selling_cost?: number | null
          sightseeing_code?: string
          sightseeing_name?: string
          state_id?: string | null
          sub_category?: string | null
          supplier_cost?: number | null
          supplier_name?: string | null
          updated_at?: string | null
          vehicle_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sightseeings_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sightseeings_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          active_status: boolean
          country_id: string
          created_at: string
          id: string
          state_code: string
          state_name: string
        }
        Insert: {
          active_status?: boolean
          country_id: string
          created_at?: string
          id?: string
          state_code: string
          state_name: string
        }
        Update: {
          active_status?: boolean
          country_id?: string
          created_at?: string
          id?: string
          state_code?: string
          state_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "states_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      visas: {
        Row: {
          active_status: boolean | null
          country_id: string | null
          created_at: string | null
          gst_included: boolean | null
          gst_percentage: number | null
          id: string
          notes: string | null
          processing_time: string | null
          required_documents: string[] | null
          selling_cost: number | null
          supplier_cost: number | null
          supplier_name: string | null
          updated_at: string | null
          validity: string | null
          visa_code: string
          visa_name: string
          visa_type: string
        }
        Insert: {
          active_status?: boolean | null
          country_id?: string | null
          created_at?: string | null
          gst_included?: boolean | null
          gst_percentage?: number | null
          id?: string
          notes?: string | null
          processing_time?: string | null
          required_documents?: string[] | null
          selling_cost?: number | null
          supplier_cost?: number | null
          supplier_name?: string | null
          updated_at?: string | null
          validity?: string | null
          visa_code: string
          visa_name: string
          visa_type?: string
        }
        Update: {
          active_status?: boolean | null
          country_id?: string | null
          created_at?: string | null
          gst_included?: boolean | null
          gst_percentage?: number | null
          id?: string
          notes?: string | null
          processing_time?: string | null
          required_documents?: string[] | null
          selling_cost?: number | null
          supplier_cost?: number | null
          supplier_name?: string | null
          updated_at?: string | null
          validity?: string | null
          visa_code?: string
          visa_name?: string
          visa_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "visas_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_itinerary_code: { Args: never; Returns: string }
      get_completed_itinerary_for_review: {
        Args: { booking_ref: string }
        Returns: {
          customer_name: string
          destinations: string[]
          id: string
          itinerary_name: string
          lead_id: string
          package_type: string
          travel_end_date: string
          travel_start_date: string
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_user_name: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      is_admin_user: { Args: never; Returns: boolean }
      is_approved_user: { Args: never; Returns: boolean }
      mark_review_request_sent: {
        Args: { itin_ids: string[] }
        Returns: undefined
      }
      send_pending_review_emails_fetch: {
        Args: never
        Returns: {
          customer_email: string
          customer_name: string
          destinations: string[]
          id: string
          itinerary_code: string
        }[]
      }
      verify_itinerary_for_review: {
        Args: { booking_ref: string }
        Returns: {
          customer_name: string
          destinations: string[]
          error_code: string
          error_message: string
          id: string
          is_valid: boolean
          itinerary_name: string
          lead_id: string
          package_type: string
          travel_end_date: string
          travel_start_date: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
