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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: Json | null
          assigned_account_manager: string | null
          company_name: string
          contact_name: string
          created_at: string | null
          credit_limit: number | null
          email: string
          id: string
          notes: string | null
          payment_terms: number | null
          phone: string | null
          status: string | null
          tax_id: string | null
        }
        Insert: {
          address?: Json | null
          assigned_account_manager?: string | null
          company_name: string
          contact_name: string
          created_at?: string | null
          credit_limit?: number | null
          email: string
          id?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          status?: string | null
          tax_id?: string | null
        }
        Update: {
          address?: Json | null
          assigned_account_manager?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string | null
          credit_limit?: number | null
          email?: string
          id?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          status?: string | null
          tax_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_account_manager_fkey"
            columns: ["assigned_account_manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          captured_at: string | null
          created_at: string | null
          file_size: number | null
          file_url: string
          filename: string
          id: string
          is_customer_visible: boolean | null
          location_accuracy: number | null
          location_lat: number | null
          location_lng: number | null
          mime_type: string | null
          notes: string | null
          shipment_id: string | null
          signature_url: string | null
          signed_by: string | null
          type: string
          uploaded_by: string | null
          uploaded_by_role: string | null
        }
        Insert: {
          captured_at?: string | null
          created_at?: string | null
          file_size?: number | null
          file_url: string
          filename: string
          id?: string
          is_customer_visible?: boolean | null
          location_accuracy?: number | null
          location_lat?: number | null
          location_lng?: number | null
          mime_type?: string | null
          notes?: string | null
          shipment_id?: string | null
          signature_url?: string | null
          signed_by?: string | null
          type: string
          uploaded_by?: string | null
          uploaded_by_role?: string | null
        }
        Update: {
          captured_at?: string | null
          created_at?: string | null
          file_size?: number | null
          file_url?: string
          filename?: string
          id?: string
          is_customer_visible?: boolean | null
          location_accuracy?: number | null
          location_lat?: number | null
          location_lng?: number | null
          mime_type?: string | null
          notes?: string | null
          shipment_id?: string | null
          signature_url?: string | null
          signed_by?: string | null
          type?: string
          uploaded_by?: string | null
          uploaded_by_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exceptions: {
        Row: {
          created_at: string | null
          description: string
          id: string
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          shipment_id: string | null
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          shipment_id?: string | null
          status?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          shipment_id?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "exceptions_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exceptions_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exceptions_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          address: Json | null
          city: string | null
          code: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          lat: number
          lng: number
          name: string
          operating_hours: Json | null
          phone: string | null
          timezone: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          city?: string | null
          code?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          lat: number
          lng: number
          name: string
          operating_hours?: Json | null
          phone?: string | null
          timezone?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          city?: string | null
          code?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number
          lng?: number
          name?: string
          operating_hours?: Json | null
          phone?: string | null
          timezone?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          payment_reference: string | null
          shipment_id: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          shipment_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          shipment_id?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          is_read: boolean | null
          message: string
          shipment_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          shipment_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          shipment_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          additional_charges: Json | null
          base_rate: number | null
          cargo_description: string
          cargo_type: string
          converted_at: string | null
          converted_shipment_id: string | null
          created_at: string | null
          currency: string | null
          customer_id: string
          declared_value: number | null
          delivery_date: string | null
          destination_address: Json
          destination_lat: number | null
          destination_lng: number | null
          fuel_surcharge: number | null
          id: string
          origin_address: Json
          origin_lat: number | null
          origin_lng: number | null
          pieces: number | null
          pickup_date: string | null
          quote_number: string
          quote_valid_until: string | null
          requires_hazmat: boolean | null
          requires_temperature_control: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_type: string
          special_instructions: string | null
          status: string
          submitted_at: string | null
          temperature_range: string | null
          total_amount: number | null
          transport_mode: string
          updated_at: string | null
          volume_cbm: number | null
          weight_kg: number
        }
        Insert: {
          additional_charges?: Json | null
          base_rate?: number | null
          cargo_description: string
          cargo_type: string
          converted_at?: string | null
          converted_shipment_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id: string
          declared_value?: number | null
          delivery_date?: string | null
          destination_address: Json
          destination_lat?: number | null
          destination_lng?: number | null
          fuel_surcharge?: number | null
          id?: string
          origin_address: Json
          origin_lat?: number | null
          origin_lng?: number | null
          pieces?: number | null
          pickup_date?: string | null
          quote_number: string
          quote_valid_until?: string | null
          requires_hazmat?: boolean | null
          requires_temperature_control?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type: string
          special_instructions?: string | null
          status?: string
          submitted_at?: string | null
          temperature_range?: string | null
          total_amount?: number | null
          transport_mode: string
          updated_at?: string | null
          volume_cbm?: number | null
          weight_kg: number
        }
        Update: {
          additional_charges?: Json | null
          base_rate?: number | null
          cargo_description?: string
          cargo_type?: string
          converted_at?: string | null
          converted_shipment_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string
          declared_value?: number | null
          delivery_date?: string | null
          destination_address?: Json
          destination_lat?: number | null
          destination_lng?: number | null
          fuel_surcharge?: number | null
          id?: string
          origin_address?: Json
          origin_lat?: number | null
          origin_lng?: number | null
          pieces?: number | null
          pickup_date?: string | null
          quote_number?: string
          quote_valid_until?: string | null
          requires_hazmat?: boolean | null
          requires_temperature_control?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type?: string
          special_instructions?: string | null
          status?: string
          submitted_at?: string | null
          temperature_range?: string | null
          total_amount?: number | null
          transport_mode?: string
          updated_at?: string | null
          volume_cbm?: number | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_milestones: {
        Row: {
          actual_date: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          location_address: Json | null
          location_name: string
          notes: string | null
          scheduled_date: string | null
          sequence: number
          shipment_id: string | null
          status: string | null
          type: string
        }
        Insert: {
          actual_date?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_address?: Json | null
          location_name: string
          notes?: string | null
          scheduled_date?: string | null
          sequence: number
          shipment_id?: string | null
          status?: string | null
          type: string
        }
        Update: {
          actual_date?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_address?: Json | null
          location_name?: string
          notes?: string | null
          scheduled_date?: string | null
          sequence?: number
          shipment_id?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_milestones_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_milestones_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_status_history: {
        Row: {
          changed_by: string | null
          changed_by_role: string | null
          created_at: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          new_status: string
          notes: string | null
          previous_status: string
          reason: string | null
          shipment_id: string | null
          sub_status: string | null
        }
        Insert: {
          changed_by?: string | null
          changed_by_role?: string | null
          created_at?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          new_status: string
          notes?: string | null
          previous_status: string
          reason?: string | null
          shipment_id?: string | null
          sub_status?: string | null
        }
        Update: {
          changed_by?: string | null
          changed_by_role?: string | null
          created_at?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          new_status?: string
          notes?: string | null
          previous_status?: string
          reason?: string | null
          shipment_id?: string | null
          sub_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_status_history_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          additional_charges: Json | null
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          base_rate: number | null
          cargo_description: string | null
          cargo_type: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          current_heading: number | null
          current_lat: number | null
          current_lng: number | null
          customer_id: string | null
          declared_value: number | null
          delivery_date: string | null
          destination_address: Json
          destination_lat: number | null
          destination_lng: number | null
          estimated_transit_days: number | null
          fuel_surcharge: number | null
          id: string
          origin_address: Json
          origin_lat: number | null
          origin_lng: number | null
          pickup_date: string | null
          pieces: number | null
          service_type: string | null
          status: string
          sub_status: string | null
          total_amount: number | null
          tracking_number: string
          transport_mode: string
          updated_at: string | null
          updated_by: string | null
          volume_cbm: number | null
          weight_kg: number
        }
        Insert: {
          additional_charges?: Json | null
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          base_rate?: number | null
          cargo_description?: string | null
          cargo_type?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_heading?: number | null
          current_lat?: number | null
          current_lng?: number | null
          customer_id?: string | null
          declared_value?: number | null
          delivery_date?: string | null
          destination_address: Json
          destination_lat?: number | null
          destination_lng?: number | null
          estimated_transit_days?: number | null
          fuel_surcharge?: number | null
          id?: string
          origin_address: Json
          origin_lat?: number | null
          origin_lng?: number | null
          pickup_date?: string | null
          pieces?: number | null
          service_type?: string | null
          status?: string
          sub_status?: string | null
          total_amount?: number | null
          tracking_number: string
          transport_mode: string
          updated_at?: string | null
          updated_by?: string | null
          volume_cbm?: number | null
          weight_kg: number
        }
        Update: {
          additional_charges?: Json | null
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          base_rate?: number | null
          cargo_description?: string | null
          cargo_type?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_heading?: number | null
          current_lat?: number | null
          current_lng?: number | null
          customer_id?: string | null
          declared_value?: number | null
          delivery_date?: string | null
          destination_address?: Json
          destination_lat?: number | null
          destination_lng?: number | null
          estimated_transit_days?: number | null
          fuel_surcharge?: number | null
          id?: string
          origin_address?: Json
          origin_lat?: number | null
          origin_lng?: number | null
          pickup_date?: string | null
          pieces?: number | null
          service_type?: string | null
          status?: string
          sub_status?: string | null
          total_amount?: number | null
          tracking_number?: string
          transport_mode?: string
          updated_at?: string | null
          updated_by?: string | null
          volume_cbm?: number | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "shipments_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_paths: {
        Row: {
          created_at: string | null
          description: string | null
          destination_city: string | null
          estimated_duration_hours: number | null
          id: string
          name: string
          origin_city: string | null
          path_data: Json
          transport_mode: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          destination_city?: string | null
          estimated_duration_hours?: number | null
          id?: string
          name: string
          origin_city?: string | null
          path_data: Json
          transport_mode?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          destination_city?: string | null
          estimated_duration_hours?: number | null
          id?: string
          name?: string
          origin_city?: string | null
          path_data?: Json
          transport_mode?: string | null
        }
        Relationships: []
      }
      tracking_logs: {
        Row: {
          event_type: string | null
          id: string
          lat: number
          lng: number
          location_name: string | null
          shipment_id: string | null
          timestamp: string | null
        }
        Insert: {
          event_type?: string | null
          id?: string
          lat: number
          lng: number
          location_name?: string | null
          shipment_id?: string | null
          timestamp?: string | null
        }
        Update: {
          event_type?: string | null
          id?: string
          lat?: number
          lng?: number
          location_name?: string | null
          shipment_id?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      tracking_updates: {
        Row: {
          accuracy: number | null
          battery_level: number | null
          created_at: string | null
          heading: number | null
          id: string
          lat: number
          lng: number
          metadata: Json | null
          recorded_by: string | null
          shipment_id: string | null
          source: string
          speed_kmh: number | null
        }
        Insert: {
          accuracy?: number | null
          battery_level?: number | null
          created_at?: string | null
          heading?: number | null
          id?: string
          lat: number
          lng: number
          metadata?: Json | null
          recorded_by?: string | null
          shipment_id?: string | null
          source: string
          speed_kmh?: number | null
        }
        Update: {
          accuracy?: number | null
          battery_level?: number | null
          created_at?: string | null
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          metadata?: Json | null
          recorded_by?: string | null
          shipment_id?: string | null
          source?: string
          speed_kmh?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_updates_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_updates_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_shipment_with_tracking: {
        Args: { p_tracking_number: string }
        Returns: {
          shipment: Json
        }[]
      }
      update_shipment_location: {
        Args: {
          p_heading?: number
          p_lat: number
          p_lng: number
          p_shipment_id: string
        }
        Returns: undefined
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
