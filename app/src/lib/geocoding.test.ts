import { describe, it, expect, vi } from 'vitest';
import { 
  calculateDistance,
  calculateETA,
  formatEstimatedArrival,
  debounce,
  shipmentFormSchema
} from './geocoding';

describe('Geocoding Utilities', () => {
  describe('calculateDistance', () => {
    it('calculates distance accurately', () => {
      const from = { lat: 51.5074, lng: -0.1278 };
      const to = { lat: 48.8566, lng: 2.3522 };
      
      const distance = calculateDistance(from, to);
      
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(400);
    });

    it('returns 0 for same coordinates', () => {
      const point = { lat: 40.7128, lng: -74.006 };
      
      const distance = calculateDistance(point, point);
      
      expect(distance).toBe(0);
    });
  });

  describe('calculateETA', () => {
    it('calculates ETA for air transport', () => {
      const from = { lat: 0, lng: 0 };
      const to = { lat: 0, lng: 9 };
      
      const result = calculateETA(from, to, 'air');
      
      expect(result.distance).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.duration).toBeLessThan(2);
    });

    it('calculates ETA for ocean transport', () => {
      const from = { lat: 0, lng: 0 };
      const to = { lat: 0, lng: 4 };
      
      const result = calculateETA(from, to, 'ocean');
      
      expect(result.duration).toBeGreaterThan(10);
    });

    it('calculates ETA for road transport', () => {
      const from = { lat: 0, lng: 0 };
      const to = { lat: 0, lng: 8 };
      
      const result = calculateETA(from, to, 'road');
      
      expect(result.duration).toBeGreaterThan(10);
      expect(result.duration).toBeLessThan(15);
    });

    it('calculates ETA for rail transport', () => {
      const from = { lat: 0, lng: 0 };
      const to = { lat: 0, lng: 6 };
      
      const result = calculateETA(from, to, 'rail');
      
      expect(result.duration).toBeGreaterThan(10);
    });
  });

  describe('formatEstimatedArrival', () => {
    it('formats arrival date', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      
      const arrival = formatEstimatedArrival(24, now);
      
      expect(arrival).toContain('2024-01-02');
    });

    it('uses current date by default', () => {
      const arrival = formatEstimatedArrival(0);
      
      expect(new Date(arrival)).toBeInstanceOf(Date);
    });
  });

  describe('debounce', () => {
    it('delays function execution', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);
      
      debouncedFn();
      expect(fn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });

    it('cancels previous call', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });
  });

  describe('shipmentFormSchema', () => {
    it('validates valid form data', () => {
      const validData = {
        origin: {
          lat: 31.2304,
          lng: 121.4737,
          city: 'Shanghai',
          country: 'China',
          address: 'Shanghai Port',
        },
        destination: {
          lat: 34.0522,
          lng: -118.2437,
          city: 'Los Angeles',
          country: 'USA',
          address: 'LA Port',
        },
        transportMode: 'ocean',
        weightKg: 15000,
        volumeCbm: 45.5,
        goodsDescription: 'Electronics',
        estimatedArrival: new Date().toISOString(),
      };

      const result = shipmentFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('requires origin city', () => {
      const invalidData = {
        origin: {
          lat: 31.2304,
          lng: 121.4737,
          city: '',
          country: 'China',
          address: 'Shanghai Port',
        },
        destination: {
          lat: 34.0522,
          lng: -118.2437,
          city: 'Los Angeles',
          country: 'USA',
          address: 'LA Port',
        },
        transportMode: 'ocean',
        estimatedArrival: new Date().toISOString(),
      };

      const result = shipmentFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('validates latitude bounds', () => {
      const invalidData = {
        origin: {
          lat: 91,
          lng: 121.4737,
          city: 'Shanghai',
          country: 'China',
          address: 'Shanghai Port',
        },
        destination: {
          lat: 34.0522,
          lng: -118.2437,
          city: 'Los Angeles',
          country: 'USA',
          address: 'LA Port',
        },
        transportMode: 'ocean',
        estimatedArrival: new Date().toISOString(),
      };

      const result = shipmentFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('makes weight and volume optional', () => {
      const minimalData = {
        origin: {
          lat: 31.2304,
          lng: 121.4737,
          city: 'Shanghai',
          country: 'China',
          address: 'Shanghai Port',
        },
        destination: {
          lat: 34.0522,
          lng: -118.2437,
          city: 'Los Angeles',
          country: 'USA',
          address: 'LA Port',
        },
        transportMode: 'ocean',
        estimatedArrival: new Date().toISOString(),
      };

      const result = shipmentFormSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });
});
