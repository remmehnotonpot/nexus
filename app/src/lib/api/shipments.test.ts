import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getShipmentByTrackingNumber,
  getShipmentsByCustomer,
  getDemoShipments,
  updateShipmentLocation,
  updateShipmentStatus,
  addTrackingLog,
  batchInsertTrackingLogs,
  createShipment,
  subscribeToShipmentUpdates,
  subscribeToTrackingLogs,
} from './shipments';
import { createMockShipment } from '@/test/mocks/data';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('Shipments API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getShipmentByTrackingNumber', () => {
    it('fetches shipment by tracking number', async () => {
      const mockShipment = createMockShipment({ tracking_number: 'NXS-TEST-001' });
      const mockData = { ...mockShipment, tracking_logs: [] };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getShipmentByTrackingNumber('NXS-TEST-001');

      expect(result).toEqual(mockData);
    });

    it('throws error for non-existent tracking number', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(getShipmentByTrackingNumber('INVALID')).rejects.toThrow();
    });
  });

  describe('getShipmentsByCustomer', () => {
    it('fetches shipments by customer', async () => {
      const mockShipments = [createMockShipment({ id: '1' }), createMockShipment({ id: '2' })];
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockShipments, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getShipmentsByCustomer('customer-123');

      expect(result).toHaveLength(2);
    });

    it('throws error on fetch error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(getShipmentsByCustomer('customer-123')).rejects.toThrow();
    });
  });

  describe('getDemoShipments', () => {
    it('fetches demo shipments', async () => {
      const mockShipments = [createMockShipment({ transport_mode: 'ocean' })];
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockShipments, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getDemoShipments();

      expect(result).toHaveLength(1);
    });
  });

  describe('updateShipmentLocation', () => {
    it('updates shipment location', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(updateShipmentLocation('ship-123', 31.2304, 121.4737, 45)).resolves.not.toThrow();
    });

    it('handles update errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(updateShipmentLocation('ship-123', 0, 0)).rejects.toThrow();
    });
  });

  describe('updateShipmentStatus', () => {
    it('updates shipment status', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(updateShipmentStatus('ship-123', 'in-transit')).resolves.not.toThrow();
    });
  });

  describe('addTrackingLog', () => {
    it('adds tracking log entry', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(addTrackingLog('ship-123', 31.2304, 121.4737, 'departure', 'Shanghai')).resolves.not.toThrow();
    });

    it('handles insert errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(addTrackingLog('ship-123', 0, 0)).rejects.toThrow();
    });
  });

  describe('batchInsertTrackingLogs', () => {
    it('batch inserts tracking logs', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as unknown as ReturnType<typeof supabase.from>);

      const logs = [
        { shipment_id: 'ship-1', lat: 0, lng: 0, event_type: 'location-update' as const },
        { shipment_id: 'ship-1', lat: 1, lng: 1, event_type: 'checkpoint' as const },
      ];

      await expect(batchInsertTrackingLogs(logs)).resolves.not.toThrow();
    });
  });

  describe('createShipment', () => {
    it('creates new shipment', async () => {
      const mockShipment = createMockShipment();
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockShipment, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await createShipment(mockShipment);

      expect(result).toEqual(mockShipment);
    });

    it('handles creation errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(createShipment(createMockShipment())).rejects.toThrow();
    });
  });

  describe('subscribeToShipmentUpdates', () => {
    it('subscribes to real-time updates', () => {
      const mockChannel = {
        on: vi.fn().mockReturnValue({
          subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
        }),
        unsubscribe: vi.fn(),
      };
      
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as unknown as ReturnType<typeof supabase.channel>);

      const callback = vi.fn();
      const subscription = subscribeToShipmentUpdates('ship-123', callback);

      expect(subscription).toBeDefined();
    });
  });

  describe('subscribeToTrackingLogs', () => {
    it('subscribes to tracking logs', () => {
      const mockChannel = {
        on: vi.fn().mockReturnValue({
          subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
        }),
        unsubscribe: vi.fn(),
      };
      
      vi.mocked(supabase.channel).mockReturnValue(mockChannel as unknown as ReturnType<typeof supabase.channel>);

      const callback = vi.fn();
      const subscription = subscribeToTrackingLogs('ship-123', callback);

      expect(subscription).toBeDefined();
    });
  });
});
