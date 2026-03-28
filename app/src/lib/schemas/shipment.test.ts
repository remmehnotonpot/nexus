import { describe, it, expect } from 'vitest';
import { 
  createShipmentSchema, 
  updateShipmentSchema, 
  trackingLogSchema,
  locationSchema,
  transportModeSchema,
  shipmentStatusSchema 
} from './shipment';

describe('Shipment Schemas', () => {
  describe('createShipmentSchema', () => {
    it('validates valid shipment data', () => {
      const validData = {
        tracking_number: 'NXS-TEST-001',
        status: 'in_transit',
        customer_id: '550e8400-e29b-41d4-a716-446655440000',
        origin_address: {
          street: '123 Port Ave',
          city: 'Shanghai',
          country: 'China',
        },
        origin_lat: 31.2304,
        origin_lng: 121.4737,
        destination_address: {
          street: '456 Harbor Blvd',
          city: 'Los Angeles',
          country: 'USA',
        },
        destination_lat: 34.0522,
        destination_lng: -118.2437,
        transport_mode: 'ocean',
        weight_kg: 100,
        pickup_date: new Date().toISOString(),
        delivery_date: new Date().toISOString(),
      };

      const result = createShipmentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const invalidData = {
        origin_city: 'Shanghai',
        origin_lat: 31.2304,
      };

      const result = createShipmentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('validates latitude bounds in location schema', () => {
      const invalidLocation = {
        lat: 100,
        lng: 0,
      };

      const result = locationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });
  });

  describe('locationSchema', () => {
    it('validates valid coordinates', () => {
      const validLocation = {
        lat: 40.7128,
        lng: -74.006,
        city: 'New York',
        country: 'USA',
      };

      const result = locationSchema.safeParse(validLocation);
      expect(result.success).toBe(true);
    });

    it('rejects out of bounds latitude', () => {
      const invalidLocation = {
        lat: 91,
        lng: 0,
      };

      const result = locationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });

    it('rejects out of bounds longitude', () => {
      const invalidLocation = {
        lat: 0,
        lng: 181,
      };

      const result = locationSchema.safeParse(invalidLocation);
      expect(result.success).toBe(false);
    });
  });

  describe('transportModeSchema', () => {
    it('accepts valid transport modes', () => {
      const validModes = ['air', 'ocean', 'road', 'rail'];
      
      validModes.forEach(mode => {
        const result = transportModeSchema.safeParse(mode);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid transport mode', () => {
      const result = transportModeSchema.safeParse('invalid-mode');
      expect(result.success).toBe(false);
    });
  });

  describe('shipmentStatusSchema', () => {
    it('accepts valid status values', () => {
      const validStatuses = [
        'pending_dropoff', 
        'scheduled_for_pickup', 
        'in_transit', 
        'customs', 
        'delivered', 
        'exception', 
        'out_for_delivery',
        'cancelled',
        'returned'
      ];
      
      validStatuses.forEach(status => {
        const result = shipmentStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateShipmentSchema', () => {
    it('validates partial updates', () => {
      const updateData = {
        status: 'in_transit',
        current_lat: 35.0,
        current_lng: 140.0,
      };

      const result = updateShipmentSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });
  });

  describe('trackingLogSchema', () => {
    it('validates valid tracking log', () => {
      const validLog = {
        shipment_id: '550e8400-e29b-41d4-a716-446655440000',
        lat: 31.2304,
        lng: 121.4737,
        event_type: 'location-update',
        location_name: 'Shanghai Port',
      };

      const result = trackingLogSchema.safeParse(validLog);
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID for shipment_id', () => {
      const invalidLog = {
        shipment_id: 'invalid-uuid',
        lat: 31.2304,
        lng: 121.4737,
        event_type: 'location-update',
      };

      const result = trackingLogSchema.safeParse(invalidLog);
      expect(result.success).toBe(false);
    });
  });
});
