// ============================================
// Swish Portal - Enterprise Types (Phase 5)
// ============================================

import type { Database } from './database';

// Export database types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// ============================================
// Legacy Types (for backward compatibility)
// ============================================
export interface Location {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  heading?: number;
}

export interface TrackingLog {
  id: string;
  shipment_id: string;
  lat: number;
  lng: number;
  timestamp: string;
  location_name?: string;
  event_type?: 'location-update' | 'checkpoint' | 'customs-clearance' | 'departure' | 'arrival' | 'delay';
}

export interface SimulationPath {
  id: string;
  name: string;
  description?: string;
  transport_mode: TransportMode;
  path_data: [number, number][];
  origin_city?: string;
  destination_city?: string;
  estimated_duration_hours?: number;
}

export type NotificationType = 
  | 'status-update' 
  | 'delay-alert' 
  | 'delivery-confirmation' 
  | 'customs-hold' 
  | 'payment-due';

export type Theme = 'light' | 'dark' | 'system';

// Legacy Shipment type for backward compatibility
export interface LegacyShipment {
  id: string;
  tracking_number: string;
  customer_id?: string;
  status: LegacyShipmentStatus;
  origin: Location;
  destination: Location;
  current?: Location;
  transport_mode: TransportMode;
  is_live_demo?: boolean;
  estimated_arrival?: string;
  actual_arrival?: string;
  weight_kg?: number;
  volume_cbm?: number;
  goods_description?: string;
  created_at?: string;
  updated_at?: string;
}

type LegacyShipmentStatus = 'pending' | 'in-transit' | 'customs' | 'delivered' | 'delayed' | 'out-for-delivery';

// ============================================
// User Roles (Phase 5A)
// ============================================
export type UserRole = 
  | 'super_admin'      // Platform owners
  | 'operations_manager' // Oversees all operations
  | 'logistics_coordinator' // Creates/manages shipments
  | 'driver'           // Mobile field staff
  | 'warehouse_staff'  // Warehouse operations
  | 'customer_support' // Help customers
  | 'customer'         // External clients
  | 'viewer';          // Read-only (accounting, etc.)

export const USER_ROLES: Record<UserRole, { label: string; description: string }> = {
  super_admin: { label: 'Super Admin', description: 'Full platform access' },
  operations_manager: { label: 'Operations Manager', description: 'Oversees all operations' },
  logistics_coordinator: { label: 'Logistics Coordinator', description: 'Creates and manages shipments' },
  driver: { label: 'Driver', description: 'Mobile field staff' },
  warehouse_staff: { label: 'Warehouse Staff', description: 'Warehouse operations' },
  customer_support: { label: 'Customer Support', description: 'Help customers' },
  customer: { label: 'Customer', description: 'External clients' },
  viewer: { label: 'Viewer', description: 'Read-only access' },
};

// ============================================
// Core Entity Types (from database)
// ============================================
export type Profile = Tables<'profiles'>;
export type Customer = Tables<'customers'>;
export type Shipment = Tables<'shipments'>;
export type Invoice = Tables<'invoices'>;
export type Document = Tables<'documents'>;
export type Exception = Tables<'exceptions'>;
export type ShipmentMilestone = Tables<'shipment_milestones'>;
export type ShipmentStatusHistory = Tables<'shipment_status_history'>;
export type ActivityLog = Tables<'activity_logs'>;
export type TrackingUpdate = Tables<'tracking_updates'>;
export type Facility = Tables<'facilities'>;
export type Quote = Tables<'quotes'>;

// ============================================
// Enums & Constants
// ============================================
export const SHIPMENT_STATUS = [
  'pending',
  'in_transit',
  'customs',
  'out_for_delivery',
  'delivered',
  'exception',
  'cancelled',
] as const;

export type ShipmentStatus = typeof SHIPMENT_STATUS[number];

export interface StatusChangeEvent {
  shipmentId: string;
  trackingNumber: string;
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  location?: string;
  timestamp: string;
}

// Legacy status mapping
export const STATUS_MAP: Record<LegacyShipmentStatus, ShipmentStatus> = {
  'pending': 'pending',
  'in-transit': 'in_transit',
  'customs': 'customs',
  'delivered': 'delivered',
  'delayed': 'exception',
  'out-for-delivery': 'out_for_delivery',
};

export const REVERSE_STATUS_MAP: Record<ShipmentStatus, LegacyShipmentStatus> = {
  'pending': 'pending',
  'in_transit': 'in-transit',
  'customs': 'customs',
  'delivered': 'delivered',
  'exception': 'delayed',
  'out_for_delivery': 'out-for-delivery',
  'cancelled': 'delivered',
};

export const TRANSPORT_MODE = [
  'air',
  'ocean',
  'road',
  'rail',
  'multimodal',
] as const;

export type TransportMode = typeof TRANSPORT_MODE[number];

export const SERVICE_TYPE = [
  'express',
  'standard',
  'economy',
] as const;

export type ServiceType = typeof SERVICE_TYPE[number];

export const CARGO_TYPE = [
  'general',
  'hazardous',
  'perishable',
  'fragile',
  'high_value',
] as const;

export type CargoType = typeof CARGO_TYPE[number];

export const DOCUMENT_TYPE = [
  'bol',
  'pod',
  'commercial_invoice',
  'packing_list',
  'customs_declaration',
  'certificate_of_origin',
  'photo_pickup',
  'photo_delivery',
  'damage_report',
] as const;

export type DocumentType = typeof DOCUMENT_TYPE[number];

export const MILESTONE_TYPE = [
  'pickup',
  'origin_facility',
  'departure',
  'transit',
  'arrival',
  'customs',
  'destination_facility',
  'delivery',
] as const;

export type MilestoneType = typeof MILESTONE_TYPE[number];

export const EXCEPTION_TYPE = [
  'delay',
  'damage',
  'missed_pickup',
  'missed_delivery',
  'customs_hold',
  'address_issue',
  'vehicle_breakdown',
] as const;

export type ExceptionType = typeof EXCEPTION_TYPE[number];

export const EXCEPTION_SEVERITY = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export type ExceptionSeverity = typeof EXCEPTION_SEVERITY[number];

// ============================================
// Address Type
// ============================================
export interface Address {
  street: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  lat?: number;
  lng?: number;
}

// ============================================
// Extended Shipment with Relations
// ============================================
export interface ShipmentWithRelations extends Shipment {
  customer?: Customer;
  driver?: Profile;
  milestones?: ShipmentMilestone[];
  documents?: Document[];
  exceptions?: Exception[];
  status_history?: ShipmentStatusHistory[];
}

// Helper to convert database shipment to legacy format
export function toLegacyShipment(shipment: Shipment): LegacyShipment {
  const originAddr = (shipment.origin_address || {}) as Record<string, string>;
  const destAddr = (shipment.destination_address || {}) as Record<string, string>;
  
  return {
    id: shipment.id,
    tracking_number: shipment.tracking_number,
    customer_id: shipment.customer_id || undefined,
    status: REVERSE_STATUS_MAP[shipment.status as ShipmentStatus] || 'pending',
    origin: {
      lat: shipment.origin_lat || 0,
      lng: shipment.origin_lng || 0,
      city: originAddr.city,
      country: originAddr.country,
    },
    destination: {
      lat: shipment.destination_lat || 0,
      lng: shipment.destination_lng || 0,
      city: destAddr.city,
      country: destAddr.country,
    },
    current: shipment.current_lat ? {
      lat: shipment.current_lat,
      lng: shipment.current_lng || 0,
      heading: shipment.current_heading || undefined,
    } : undefined,
    transport_mode: (shipment.transport_mode === 'multimodal' ? 'road' : shipment.transport_mode) as Exclude<TransportMode, 'multimodal'>,
    weight_kg: shipment.weight_kg,
    volume_cbm: shipment.volume_cbm || undefined,
    goods_description: shipment.cargo_description || undefined,
    estimated_arrival: shipment.delivery_date || undefined,
    created_at: shipment.created_at || undefined,
    updated_at: shipment.updated_at || undefined,
  };
}

// ============================================
// Dashboard Stats
// ============================================
export interface DashboardStats {
  todayPickups: number;
  pickupsPending: number;
  inTransit: number;
  inTransitDelayed: number;
  deliveriesToday: number;
  deliveriesWithIssue: number;
  exceptionsTotal: number;
  exceptionsNeedAttention: number;
}

// ============================================
// Operations Filters
// ============================================
export interface ShipmentFilters {
  status?: ShipmentStatus;
  transportMode?: TransportMode;
  customerId?: string;
  driverId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

// ============================================
// Status Update Form Data
// ============================================
export interface StatusUpdateData {
  status: ShipmentStatus;
  subStatus?: string;
  location?: {
    lat: number;
    lng: number;
    name?: string;
  };
  notes?: string;
  notifyCustomer?: boolean;
  milestoneId?: string;
}

// ============================================
// Mobile-specific Types
// ============================================
export interface MobileShipmentCardData {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  eta?: string;
  transportMode: TransportMode;
}

export interface BottomNavItem {
  icon: string;
  label: string;
  href: string;
  highlight?: boolean;
  badge?: number;
}

// ============================================
// Auth Types
// ============================================
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  department?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
  phone?: string;
}
