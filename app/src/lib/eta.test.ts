import { describe, it, expect } from 'vitest';
import { 
  calculateETA,
  calculateDistance,
  generateDelayAlert,
  formatRemainingTime,
  formatDelay,
  getDelaySeverityColor,
  getDelaySeverityBgColor,
  getDelaySeverityBadge,
  ETATracker
} from './eta';
import type { Shipment } from '@/types';

const createMockShipment = (overrides: Partial<Shipment> = {}): Shipment => {
  const base: Shipment = {
    id: 'test-id',
    tracking_number: 'NXS-TEST-001',
    status: 'in_transit',
    origin_address: { street: '', city: 'Origin', country: 'Test' },
    destination_address: { street: '', city: 'Destination', country: 'Test' },
    origin_lat: 0,
    origin_lng: 0,
    destination_lat: 10,
    destination_lng: 10,
    current_lat: 5,
    current_lng: 5,
    current_heading: 45,
    transport_mode: 'ocean',
    weight_kg: 1000,
    delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Additional fields required by new schema
    additional_charges: null,
    assigned_driver_id: null,
    assigned_vehicle_id: null,
    base_rate: null,
    cargo_description: null,
    cargo_type: null,
    created_by: null,
    currency: null,
    customer_id: null,
    declared_value: null,
    estimated_transit_days: null,
    fuel_surcharge: null,
    pickup_date: null,
    pieces: null,
    service_type: null,
    sub_status: null,
    total_amount: null,
    updated_by: null,
    volume_cbm: null,
  };
  return { ...base, ...overrides };
};

describe('ETA Calculations', () => {
  describe('calculateDistance', () => {
    it('calculates distance accurately', () => {
      const london = { lat: 51.5074, lng: -0.1278 };
      const paris = { lat: 48.8566, lng: 2.3522 };
      
      const distance = calculateDistance(london, paris);
      
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(400);
    });

    it('returns 0 for same point', () => {
      const point = { lat: 0, lng: 0 };
      
      const distance = calculateDistance(point, point);
      
      expect(distance).toBe(0);
    });

    it('calculates equator distance', () => {
      const point1 = { lat: 0, lng: 0 };
      const point2 = { lat: 0, lng: 1 };
      
      const distance = calculateDistance(point1, point2);
      
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(120);
    });
  });

  describe('calculateETA', () => {
    it('calculates ETA correctly', () => {
      const shipment = createMockShipment();
      
      const result = calculateETA(shipment);
      
      expect(result.estimatedArrival).toBeInstanceOf(Date);
      expect(result.remainingHours).toBeGreaterThan(0);
      expect(result.remainingDistance).toBeGreaterThan(0);
      expect(result.progressPercentage).toBeGreaterThanOrEqual(0);
      expect(result.progressPercentage).toBeLessThanOrEqual(100);
    });

    it('calculates progress correctly at start', () => {
      const shipment = createMockShipment({
        current_lat: 0,
        current_lng: 0,
      });
      
      const result = calculateETA(shipment);
      
      expect(result.progressPercentage).toBe(0);
    });

    it('calculates progress correctly at destination', () => {
      const shipment = createMockShipment({
        current_lat: 10,
        current_lng: 10,
      });
      
      const result = calculateETA(shipment);
      
      expect(result.progressPercentage).toBe(100);
    });

    it('detects delays', () => {
      const shipment = createMockShipment({
        delivery_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      });
      
      const result = calculateETA(shipment);
      
      expect(result.isDelayed).toBe(true);
      expect(result.delayHours).toBeGreaterThan(0);
    });

    it('returns on-time when no delay', () => {
      const shipment = createMockShipment({
        delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
      });
      
      const result = calculateETA(shipment);
      
      expect(result.status).toBe('on-time');
    });

    it('uses custom speed when provided', () => {
      const shipment = createMockShipment();
      
      const resultSlow = calculateETA(shipment, 50);
      const resultFast = calculateETA(shipment, 100);
      
      expect(resultSlow.remainingHours).toBeGreaterThan(resultFast.remainingHours);
    });

    it('handles different transport modes', () => {
      const modes = ['air', 'ocean', 'road', 'rail', 'multimodal'] as const;
      
      modes.forEach(mode => {
        const shipment = createMockShipment({ transport_mode: mode });
        const result = calculateETA(shipment);
        
        expect(result.remainingHours).toBeGreaterThan(0);
        expect(result.progressPercentage).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('generateDelayAlert', () => {
    it('returns null for on-time shipments', () => {
      const etaResult = {
        estimatedArrival: new Date(),
        remainingHours: 10,
        remainingDistance: 100,
        progressPercentage: 50,
        isDelayed: false,
        delaySeverity: 'none' as const,
        delayHours: 0,
        status: 'on-time' as const,
      };
      
      const alert = generateDelayAlert(etaResult);
      
      expect(alert).toBeNull();
    });

    it('generates minor delay alert', () => {
      const etaResult = {
        estimatedArrival: new Date(),
        remainingHours: 10,
        remainingDistance: 100,
        progressPercentage: 50,
        isDelayed: true,
        delaySeverity: 'minor' as const,
        delayHours: 3,
        status: 'delayed' as const,
      };
      
      const alert = generateDelayAlert(etaResult);
      
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('minor');
      expect(alert?.recommendedAction).toContain('Monitor');
    });

    it('generates moderate delay alert', () => {
      const etaResult = {
        estimatedArrival: new Date(),
        remainingHours: 10,
        remainingDistance: 100,
        progressPercentage: 50,
        isDelayed: true,
        delaySeverity: 'moderate' as const,
        delayHours: 15,
        status: 'delayed' as const,
      };
      
      const alert = generateDelayAlert(etaResult);
      
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('moderate');
    });

    it('generates severe delay alert', () => {
      const etaResult = {
        estimatedArrival: new Date(),
        remainingHours: 10,
        remainingDistance: 100,
        progressPercentage: 50,
        isDelayed: true,
        delaySeverity: 'severe' as const,
        delayHours: 30,
        status: 'delayed' as const,
      };
      
      const alert = generateDelayAlert(etaResult);
      
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('severe');
      expect(alert?.recommendedAction).toContain('escalation');
    });
  });

  describe('formatRemainingTime', () => {
    it('formats minutes when less than 1 hour', () => {
      expect(formatRemainingTime(0.5)).toBe('30 mins');
    });

    it('formats hours when less than 24 hours', () => {
      expect(formatRemainingTime(5.5)).toBe('5.5 hours');
    });

    it('formats days when 24 hours or more', () => {
      expect(formatRemainingTime(48)).toBe('2d 0h');
    });
  });

  describe('formatDelay', () => {
    it('formats minutes when less than 1 hour', () => {
      expect(formatDelay(0.75)).toBe('45 mins');
    });

    it('formats hours when 1 hour or more', () => {
      expect(formatDelay(5.5)).toBe('5.5 hours');
    });
  });

  describe('getDelaySeverityColor', () => {
    it('returns correct colors for each severity', () => {
      expect(getDelaySeverityColor('none')).toBe('text-green-500');
      expect(getDelaySeverityColor('minor')).toBe('text-yellow-500');
      expect(getDelaySeverityColor('moderate')).toBe('text-orange-500');
      expect(getDelaySeverityColor('severe')).toBe('text-red-500');
    });
  });

  describe('getDelaySeverityBgColor', () => {
    it('returns correct background colors for each severity', () => {
      expect(getDelaySeverityBgColor('none')).toContain('bg-green-500');
      expect(getDelaySeverityBgColor('minor')).toContain('bg-yellow-500');
      expect(getDelaySeverityBgColor('moderate')).toContain('bg-orange-500');
      expect(getDelaySeverityBgColor('severe')).toContain('bg-red-500');
    });
  });

  describe('getDelaySeverityBadge', () => {
    it('returns correct badge config for each severity', () => {
      const none = getDelaySeverityBadge('none');
      expect(none.label).toBe('On Time');
      
      const minor = getDelaySeverityBadge('minor');
      expect(minor.label).toBe('Minor Delay');
      
      const moderate = getDelaySeverityBadge('moderate');
      expect(moderate.label).toBe('Moderate Delay');
      
      const severe = getDelaySeverityBadge('severe');
      expect(severe.label).toBe('Severe Delay');
    });
  });

  describe('ETATracker', () => {
    it('tracks ETA history', () => {
      const tracker = new ETATracker();
      
      tracker.addEntry({
        estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000),
        remainingHours: 24,
        progressPercentage: 50,
      });
      
      const history = tracker.getHistory();
      expect(history).toHaveLength(1);
    });

    it('limits history to max entries', () => {
      const tracker = new ETATracker(3);
      
      for (let i = 0; i < 5; i++) {
        tracker.addEntry({
          estimatedArrival: new Date(),
          remainingHours: i,
          progressPercentage: i * 10,
        });
      }
      
      const history = tracker.getHistory();
      expect(history).toHaveLength(3);
    });

    it('detects improving trend', () => {
      const tracker = new ETATracker();
      
      // Add entries with decreasing remaining hours (improving = less time remaining)
      // Note: Entries are added with unshift, so history is [newest, ..., oldest]
      // For improving trend: recent entries should have LESS remaining hours than older ones
      tracker.addEntry({ estimatedArrival: new Date(), remainingHours: 16, progressPercentage: 60 });
      tracker.addEntry({ estimatedArrival: new Date(), remainingHours: 18, progressPercentage: 55 });
      tracker.addEntry({ estimatedArrival: new Date(), remainingHours: 20, progressPercentage: 50 });
      
      expect(tracker.getTrend()).toBe('improving');
    });

    it('detects worsening trend', () => {
      const tracker = new ETATracker();
      
      // Add entries with increasing remaining hours (worsening = more time remaining)
      // History order: [newest, ..., oldest]
      tracker.addEntry({ estimatedArrival: new Date(), remainingHours: 24, progressPercentage: 40 });
      tracker.addEntry({ estimatedArrival: new Date(), remainingHours: 22, progressPercentage: 45 });
      tracker.addEntry({ estimatedArrival: new Date(), remainingHours: 20, progressPercentage: 50 });
      
      expect(tracker.getTrend()).toBe('worsening');
    });

    it('detects stable trend', () => {
      const tracker = new ETATracker();
      
      // Small changes within 1 hour threshold
      tracker.addEntry({ estimatedArrival: new Date(), remainingHours: 10, progressPercentage: 50 });
      tracker.addEntry({ estimatedArrival: new Date(), remainingHours: 10.4, progressPercentage: 52 });
      tracker.addEntry({ estimatedArrival: new Date(), remainingHours: 10.8, progressPercentage: 54 });
      
      expect(tracker.getTrend()).toBe('stable');
    });

    it('clears history', () => {
      const tracker = new ETATracker();
      
      tracker.addEntry({ estimatedArrival: new Date(), remainingHours: 10, progressPercentage: 50 });
      tracker.clear();
      
      expect(tracker.getHistory()).toHaveLength(0);
    });
  });
});
