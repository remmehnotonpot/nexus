/**
 * Shipment Validation Schemas
 * Phase 5 Workflow Audit - Split schemas for customer vs staff flows
 */

import { z } from 'zod';

// ============================================
// Base Schemas (Shared)
// ============================================

/**
 * Location schema for origin/destination/current position
 */
export const locationSchema = z.object({
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  city: z.string().optional(),
  country: z.string().optional(),
});

/**
 * Address schema for structured addresses
 */
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

/**
 * Transport mode enum
 */
export const transportModeSchema = z.enum(['air', 'ocean', 'road', 'rail', 'multimodal']);

// ============================================
// Canonical Status Schemas (Phase 5)
// ============================================

/**
 * Intake statuses - customers can only create with these
 */
export const intakeStatusSchema = z.enum([
  'pending_dropoff',
  'scheduled_for_pickup',
]);

/**
 * Active statuses - admin transitions shipments here
 */
export const activeStatusSchema = z.enum([
  'in_transit',
  'customs',
  'out_for_delivery',
  'exception',
]);

/**
 * Terminal statuses - end of lifecycle
 */
export const terminalStatusSchema = z.enum([
  'delivered',
  'cancelled',
  'returned',
]);

/**
 * All canonical shipment statuses
 */
export const shipmentStatusSchema = z.union([
  intakeStatusSchema,
  activeStatusSchema,
  terminalStatusSchema,
]);

// ============================================
// Customer Shipment Request Schema
// ============================================

/**
 * CustomerShipmentRequestSchema
 * 
 * Customers can create shipment requests with:
 * - Origin/destination addresses
 * - Preferred dates
 * - Transport mode preference
 * - Cargo description (no weight/dimensions - audited later)
 * - Status MUST be pending_dropoff or scheduled_for_pickup
 * 
 * Customers CANNOT set:
 * - Actual weight/dimensions (audited by staff)
 * - Pricing fields
 * - Any status other than intake states
 */
export const customerShipmentRequestSchema = z.object({
  tracking_number: z.string().min(1, 'Tracking number is required'),
  
  // Status: MUST be intake state only
  status: intakeStatusSchema,
  
  // Origin
  origin_address: addressSchema,
  origin_lat: z.number().optional(),
  origin_lng: z.number().optional(),
  
  // Destination
  destination_address: addressSchema,
  destination_lat: z.number().optional(),
  destination_lng: z.number().optional(),
  
  // Service preferences
  transport_mode: transportModeSchema,
  service_type: z.enum(['express', 'standard', 'economy']).default('standard'),
  
  // Cargo description only (weight/dimensions audited later)
  cargo_description: z.string().optional(),
  cargo_type: z.enum(['general', 'hazardous', 'perishable', 'fragile', 'high_value']).default('general'),
  pieces: z.number().int().positive().default(1),
  declared_value: z.number().positive().optional(),
  currency: z.string().default('USD'),
  
  // Dates
  pickup_date: z.string().datetime().optional(),
  delivery_date: z.string().datetime().optional(),
});

// ============================================
// Staff Shipment Creation Schema
// ============================================

/**
 * StaffShipmentCreateSchema
 * 
 * Staff can create full shipments with:
 * - All customer request fields
 * - Customer assignment
 * - Actual weight/dimensions
 * - Pricing information
 * - Any valid status
 */
export const staffShipmentCreateSchema = z.object({
  tracking_number: z.string().min(1, 'Tracking number is required'),
  
  // Status: Can be any valid status
  status: shipmentStatusSchema,
  
  // Customer assignment
  customer_id: z.string().uuid('Customer ID is required'),
  
  // Origin
  origin_address: addressSchema,
  origin_lat: z.number().optional(),
  origin_lng: z.number().optional(),
  
  // Destination
  destination_address: addressSchema,
  destination_lat: z.number().optional(),
  destination_lng: z.number().optional(),
  
  // Service details
  transport_mode: transportModeSchema,
  service_type: z.enum(['express', 'standard', 'economy']).default('standard'),
  
  // Cargo - staff can set actual values
  weight_kg: z.number().positive('Weight is required'),
  volume_cbm: z.number().positive().optional(),
  cargo_description: z.string().optional(),
  cargo_type: z.enum(['general', 'hazardous', 'perishable', 'fragile', 'high_value']).default('general'),
  pieces: z.number().int().positive().default(1),
  declared_value: z.number().positive().optional(),
  currency: z.string().default('USD'),
  
  // Dates
  pickup_date: z.string().datetime().optional(),
  delivery_date: z.string().datetime().optional(),
  
  // Assignment
  assigned_driver_id: z.string().uuid().optional(),
  assigned_vehicle_id: z.string().optional(),
  
  // Commercial
  base_rate: z.number().nonnegative().optional(),
  fuel_surcharge: z.number().nonnegative().optional(),
  additional_charges: z.record(z.number(), z.number()).optional(),
  total_amount: z.number().nonnegative().optional(),
});

// ============================================
// Staff Induction Audit Schema (Phase 5)
// ============================================

/**
 * StaffInductionSchema
 * 
 * When admin/ops inducts a shipment (moves from intake to active),
 * they must provide audit data:
 * - Actual weight and dimensions
 * - Admin performing the audit
 * - Optional photos and notes
 */
export const staffInductionSchema = z.object({
  shipment_id: z.string().uuid('Shipment ID is required'),
  
  // Actual audited values
  actual_weight_kg: z.number().positive('Actual weight is required'),
  actual_dimensions: z.object({
    length: z.number().positive('Length is required'),
    width: z.number().positive('Width is required'),
    height: z.number().positive('Height is required'),
  }),
  
  // Audit metadata
  audited_by: z.string().uuid('Admin ID is required'),
  audited_at: z.string().datetime().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
  
  // New status after induction (must be active state)
  new_status: activeStatusSchema.optional(),
});

// ============================================
// Status Update Schema (Restricted)
// ============================================

/**
 * StatusTransitionSchema
 * 
 * Status updates must:
 * - Follow the allowed transition graph
 * - Include audit metadata
 */
export const statusTransitionSchema = z.object({
  shipment_id: z.string().uuid(),
  new_status: shipmentStatusSchema,
  previous_status: shipmentStatusSchema.optional(),
  changed_by: z.string().uuid(),
  changed_by_role: z.enum([
    'super_admin',
    'operations_manager',
    'logistics_coordinator',
  ]),
  reason: z.string().optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  location_name: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================
// Legacy Schemas (for backward compatibility)
// ============================================

/**
 * @deprecated Use customerShipmentRequestSchema or staffShipmentCreateSchema
 */
export const createShipmentSchema = staffShipmentCreateSchema;

/**
 * @deprecated Use statusTransitionSchema for status updates
 */
export const updateShipmentSchema = z.object({
  status: shipmentStatusSchema.optional(),
  current_lat: z.number().optional(),
  current_lng: z.number().optional(),
  current_heading: z.number().optional(),
  estimated_arrival: z.string().datetime().optional(),
  actual_arrival: z.string().datetime().optional(),
  weight_kg: z.number().positive().optional(),
  volume_cbm: z.number().positive().optional(),
  goods_description: z.string().optional(),
});

/**
 * Tracking log schema
 */
export const trackingLogSchema = z.object({
  shipment_id: z.string().uuid(),
  lat: z.number(),
  lng: z.number(),
  location_name: z.string().optional(),
  event_type: z.enum([
    'location-update',
    'checkpoint',
    'customs-clearance',
    'departure',
    'arrival',
    'delay',
  ]),
});

// ============================================
// Type Exports
// ============================================

export type CreateShipmentInput = z.infer<typeof staffShipmentCreateSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
export type TrackingLogInput = z.infer<typeof trackingLogSchema>;

// Phase 5 types
export type CustomerShipmentRequestInput = z.infer<typeof customerShipmentRequestSchema>;
export type StaffShipmentCreateInput = z.infer<typeof staffShipmentCreateSchema>;
export type StaffInductionInput = z.infer<typeof staffInductionSchema>;
export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>;
export type ShipmentStatus = z.infer<typeof shipmentStatusSchema>;
export type IntakeStatus = z.infer<typeof intakeStatusSchema>;
export type ActiveStatus = z.infer<typeof activeStatusSchema>;
export type TerminalStatus = z.infer<typeof terminalStatusSchema>;
