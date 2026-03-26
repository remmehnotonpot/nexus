import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLiveTracking } from './useLiveTracking';

// Mock Supabase - must be defined inside vi.mock due to hoisting
vi.mock('@/lib/supabase', () => {
  type MockChannel = {
    on: ReturnType<typeof vi.fn>;
    subscribe: ReturnType<typeof vi.fn>;
    unsubscribe: ReturnType<typeof vi.fn>;
    _callback: ((payload: { new: Record<string, unknown>; old: Record<string, unknown> | null }) => void) | null;
  };

  const mockChannel: MockChannel = {
    on: vi.fn(function(this: MockChannel, _event: string, _config: unknown, callback: (payload: { new: Record<string, unknown>; old: Record<string, unknown> | null }) => void) {
      this._callback = callback;
      return this;
    }),
    subscribe: vi.fn(function(this: MockChannel, callback?: (status: string) => void) {
      if (callback) callback('SUBSCRIBED');
      return this;
    }),
    unsubscribe: vi.fn(),
    _callback: null,
  };

  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'test-shipment-id',
                tracking_number: 'NXS-TEST-001',
                status: 'in-transit',
                origin: { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China' },
                destination: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' },
                current: { lat: 35.0, lng: 140.0, heading: 45 },
                current_lat: 35.0,
                current_lng: 140.0,
                current_heading: 45,
                transport_mode: 'ocean',
                is_live_demo: true,
                estimated_arrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tracking_updates: [],
              },
              error: null,
            }),
          })),
        })),
      })),
      channel: vi.fn(() => mockChannel),
      removeChannel: vi.fn(),
    },
  };
});

vi.mock('@/lib/api/shipments', () => ({
  getShipmentByTrackingNumber: vi.fn(async (trackingNumber: string) => {
    if (trackingNumber === 'NXS-TEST-001') {
      return {
        id: 'test-shipment-id',
        tracking_number: 'NXS-TEST-001',
        status: 'in-transit',
        origin: { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China' },
        destination: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' },
        current: { lat: 35.0, lng: 140.0, heading: 45 },
        current_lat: 35.0,
        current_lng: 140.0,
        current_heading: 45,
        transport_mode: 'ocean',
        is_live_demo: true,
        estimated_arrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tracking_updates: [],
      };
    }
    return null;
  }),
}));

describe('useLiveTracking', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useLiveTracking(null));

    expect(result.current.shipment).toBeNull();
    expect(result.current.currentPosition).toBeNull();
    expect(result.current.heading).toBe(0);
    expect(result.current.trackingHistory).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.connectionStatus).toBe('disconnected');
    expect(result.current.lastUpdateTime).toBeNull();
  });

  it('fetches shipment data when tracking number is provided', async () => {
    const { result } = renderHook(() => useLiveTracking('NXS-TEST-001'));

    // Should start loading
    expect(result.current.isLoading).toBe(true);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.shipment).not.toBeNull();
    expect(result.current.shipment?.tracking_number).toBe('NXS-TEST-001');
    expect(result.current.currentPosition).toEqual([35.0, 140.0]);
    expect(result.current.heading).toBe(45);
  });

  it('sets error when shipment is not found', async () => {
    const { result } = renderHook(() => useLiveTracking('INVALID-TRACKING'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Shipment not found');
    expect(result.current.shipment).toBeNull();
  });

  it('updates connection status correctly', async () => {
    const { result } = renderHook(() => useLiveTracking('NXS-TEST-001'));

    // Initially disconnected, then connecting when shipment loads
    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('connected');
    });
  });

  it('allows manual refresh of shipment data', async () => {
    const { result } = renderHook(() => useLiveTracking('NXS-TEST-001'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Trigger a refresh
    act(() => {
      result.current.refresh();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
