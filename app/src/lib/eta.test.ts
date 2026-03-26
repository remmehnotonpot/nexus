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

const createMockShipment = (overrides: Partial<Shipment> = {}): Shipment => ({
  id: 'test-id',
  tracking_number: 'NXS-TEST-001',
  status: 'in-transit',
  origin: { lat: 0, lng: 0, city: 'Origin', country: 'Test' },
  destination: { lat: 10, lng: 10, city: 'Destination', country: 'Test' },
  current: { lat: 5, lng: 5, heading: 45 },
  current_lat: 5,
  current_lng: 5,
  current_heading: 45,
  transport_mode: 'ocean',
  is_live_demo: false,
  estimated_arrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

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
        estimated_arrival: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      });
      
      const result = calculateETA(shipment);
      
      expect(result.isDelayed).toBe(true);
      expect(result.delayHours).toBeGreaterThan(0);
      expect(result.delaySeverity).toBe('severe');
    });

    it('provides delay severity - none', () => {
      const shipment = createMockShipment({
        estimated_arrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      
      const result = calculateETA(shipment);
      
      expect(result.delaySeverity).toBe('none');
    });

    it('uses custom speed when provided', () => {
      const shipment = createMockShipment();
      
      const resultSlow = calculateETA(shipment, 20);
      const resultFast = calculateETA(shipment, 100);
      
      expect(resultSlow.remainingHours).toBeGreaterThan(resultFast.remainingHours);
    });
  });

  describe('generateDelayAlert', () => {
    it('returns null for no delay', () => {
      const shipment = createMockShipment({
        estimated_arrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      const etaResult = calculateETA(shipment);
      
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
      
      expect(alert?.severity).toBe('moderate');
    });

    it('generates severe delay alert', () => {
      const shipment = createMockShipment({
        estimated_arrival: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      });
      const etaResult = calculateETA(shipment);
      
      const alert = generateDelayAlert(etaResult);
      
      expect(alert?.severity).toBe('severe');
    });
  });

  describe('formatRemainingTime', () => {
    it('formats minutes', () => {
      expect(formatRemainingTime(0.5)).toBe('30 mins');
      expect(formatRemainingTime(0.75)).toBe('45 mins');
    });

    it('formats hours', () => {
      expect(formatRemainingTime(5)).toBe('5 hours');
      expect(formatRemainingTime(12.5)).toBe('12.5 hours');
    });

    it('formats days and hours', () => {
      expect(formatRemainingTime(48)).toBe('2d 0h');
      expect(formatRemainingTime(50)).toBe('2d 2h');
    });
  });

  describe('formatDelay', () => {
    it('formats delay in minutes', () => {
      expect(formatDelay(0.5)).toBe('30 mins');
    });

    it('formats delay in hours', () => {
      expect(formatDelay(5)).toBe('5 hours');
    });
  });

  describe('getDelaySeverityColor', () => {
    it('returns correct color classes', () => {
      expect(getDelaySeverityColor('none')).toContain('green');
      expect(getDelaySeverityColor('minor')).toContain('yellow');
      expect(getDelaySeverityColor('moderate')).toContain('orange');
      expect(getDelaySeverityColor('severe')).toContain('red');
    });
  });

  describe('getDelaySeverityBgColor', () => {
    it('returns correct background color classes', () => {
      expect(getDelaySeverityBgColor('none')).toContain('green');
      expect(getDelaySeverityBgColor('minor')).toContain('yellow');
      expect(getDelaySeverityBgColor('moderate')).toContain('orange');
      expect(getDelaySeverityBgColor('severe')).toContain('red');
    });
  });

  describe('getDelaySeverityBadge', () => {
    it('returns correct badge config', () => {
      expect(getDelaySeverityBadge('none').label).toBe('On Time');
      expect(getDelaySeverityBadge('minor').label).toBe('Minor Delay');
      expect(getDelaySeverityBadge('moderate').label).toBe('Moderate Delay');
      expect(getDelaySeverityBadge('severe').label).toBe('Severe Delay');
    });
  });

  describe('ETATracker', () => {
    it('adds entries', () => {
      const tracker = new ETATracker();
      
      tracker.addEntry({
        estimatedArrival: new Date(),
        remainingHours: 10,
        progressPercentage: 50,
      });
      
      expect(tracker.getHistory().length).toBe(1);
    });

    it('limits max entries', () => {
      const tracker = new ETATracker(5);
      
      for (let i = 0; i < 10; i++) {
        tracker.addEntry({
          estimatedArrival: new Date(),
          remainingHours: i,
          progressPercentage: i * 10,
        });
      }
      
      expect(tracker.getHistory().length).toBe(5);
    });

    it('detects improving trend', () => {
      const tracker = new ETATracker();
      
      tracker.addEntry({
        estimatedArrival: new Date(),
        remainingHours: 5,
        progressPercentage: 50,
      });
      
      tracker.addEntry({
        estimatedArrival: new Date(),
        remainingHours: 10,
        progressPercentage: 40,
      });
      
      tracker.addEntry({
        estimatedArrival: new Date(),
        remainingHours: 15,
        progressPercentage: 30,
      });
      
      expect(tracker.getTrend()).toBe('improving');
    });

    it('returns stable trend with few entries', () => {
      const tracker = new ETATracker();
      
      tracker.addEntry({
        estimatedArrival: new Date(),
        remainingHours: 10,
        progressPercentage: 50,
      });
      
      expect(tracker.getTrend()).toBe('stable');
    });

    it('clears history', () => {
      const tracker = new ETATracker();
      
      tracker.addEntry({
        estimatedArrival: new Date(),
        remainingHours: 10,
        progressPercentage: 50,
      });
      
      tracker.clear();
      
      expect(tracker.getHistory().length).toBe(0);
    });
  });
});
