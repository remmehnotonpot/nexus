// =====================================================
// SWISH PORTAL - TYPE DEFINITIONS
// =====================================================

export interface Location {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  customer_id?: string;
  status: ShipmentStatus;
  origin: Location;
  destination: Location;
  current: {
    lat: number;
    lng: number;
    heading: number;
  };
  current_lat?: number;
  current_lng?: number;
  current_heading?: number;
  transport_mode: TransportMode;
  is_live_demo: boolean;
  estimated_arrival: string;
  actual_arrival?: string;
  weight_kg?: number;
  volume_cbm?: number;
  goods_description?: string;
  created_at: string;
  updated_at: string;
}

export type ShipmentStatus = 
  | 'pending' 
  | 'in-transit' 
  | 'customs' 
  | 'delivered' 
  | 'delayed' 
  | 'out-for-delivery';

export type TransportMode = 'air' | 'ocean' | 'road' | 'rail';

export interface TrackingLog {
  id: string;
  shipment_id: string;
  lat: number;
  lng: number;
  timestamp: string;
  location_name?: string;
  event_type: TrackingEventType;
}

export type TrackingEventType = 
  | 'location-update' 
  | 'checkpoint' 
  | 'customs-clearance' 
  | 'departure' 
  | 'arrival' 
  | 'delay';

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  shipment_id?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string;
  paid_date?: string;
  description?: string;
  created_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Notification {
  id: string;
  customer_id: string;
  shipment_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type NotificationType = 
  | 'status-update' 
  | 'delay-alert' 
  | 'delivery-confirmation' 
  | 'customs-hold' 
  | 'payment-due';

export interface StatusChangeEvent {
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  shipmentId: string;
  trackingNumber: string;
  timestamp: Date;
  location?: string;
}

export interface SimulationPath {
  id: string;
  name: string;
  description?: string;
  transport_mode: TransportMode;
  path_data: [number, number][];
  origin_city: string;
  destination_city: string;
  estimated_duration_hours: number;
}

export interface DashboardStats {
  active_shipments: number;
  delivered_this_month: number;
  total_spend: number;
  pending_invoices: number;
}

export interface ShipmentWithTracking extends Shipment {
  tracking_history: TrackingLog[];
}

// Mapbox related types
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  heading: number;
  type: TransportMode;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

// Form types
export interface TrackingSearchForm {
  trackingNumber: string;
}

export interface CallbackRequestForm {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
}

// Advertisement types
export interface Advertisement {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string;
  position: 'sidebar' | 'banner' | 'inline';
}

// Database type placeholder
export interface Database {
  public: {
    Tables: {
      shipments: {
        Row: Shipment;
        Insert: Partial<Shipment>;
        Update: Partial<Shipment>;
      };
      tracking_logs: {
        Row: TrackingLog;
        Insert: Partial<TrackingLog>;
        Update: Partial<TrackingLog>;
      };
      invoices: {
        Row: Invoice;
        Insert: Partial<Invoice>;
        Update: Partial<Invoice>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification>;
        Update: Partial<Notification>;
      };
    };
  };
}
