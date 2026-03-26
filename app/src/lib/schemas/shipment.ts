/**
 * Shipment Validation Schemas
 * Zod schemas for shipment data validation
 */

import { z } from 'zod';

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
 * Transport mode enum
 */
export const transportModeSchema = z.enum(['air', 'ocean', 'road', 'rail']);

/**
 * Shipment status enum
 */
export const shipmentStatusSchema = z.enum([
  'pending',
  'in-transit',
  'customs',
  'delivered',
  'delayed',
  'out-for-delivery',
]);

/**
 * Shipment creation schema
 */
export const createShipmentSchema = z.object({
  tracking_number: z.string().min(1, 'Tracking number is required'),
  status: shipmentStatusSchema.default('pending'),
  origin_city: z.string().min(1, 'Origin city is required'),
  origin_country: z.string().optional(),
  origin_lat: z.number(),
  origin_lng: z.number(),
  destination_city: z.string().min(1, 'Destination city is required'),
  destination_country: z.string().optional(),
  destination_lat: z.number(),
  destination_lng: z.number(),
  current_lat: z.number().optional(),
  current_lng: z.number().optional(),
  current_heading: z.number().default(0),
  transport_mode: transportModeSchema,
  estimated_arrival: z.string().datetime(),
  weight_kg: z.number().positive().optional(),
  volume_cbm: z.number().positive().optional(),
  goods_description: z.string().optional(),
  is_live_demo: z.boolean().default(false),
});

/**
 * Shipment update schema
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

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
export type TrackingLogInput = z.infer<typeof trackingLogSchema>;
