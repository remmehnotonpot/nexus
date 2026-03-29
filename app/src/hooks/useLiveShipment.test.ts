import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveShipment } from './useLiveShipment';
import { SIMULATION_PATHS } from './useSimulation';
import { createMockShipment } from '@/test/mocks/data';

const apiMocks = vi.hoisted(() => ({
  updateShipmentLocation: vi.fn().mockResolvedValue(undefined),
  batchInsertTrackingLogs: vi.fn().mockResolvedValue(undefined),
  createShipment: vi.fn().mockResolvedValue({
    id: 'new-shipment-id',
    tracking_number: 'NXS-NEW-001',
    status: 'pending_dropoff',
    origin_address: { street: '', city: 'Shanghai', country: 'China' },
    destination_address: { street: '', city: 'Los Angeles', country: 'USA' },
    origin_lat: 31.2304,
    origin_lng: 121.4737,
    destination_lat: 34.0522,
    destination_lng: -118.2437,
    current_lat: 31.2304,
    current_lng: 121.4737,
    current_heading: 0,
    transport_mode: 'ocean',
    weight_kg: 15000,
    volume_cbm: 45.5,
    delivery_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
  }),
  updateShipment: vi.fn().mockImplementation(async (id: string, updates: Record<string, unknown>) => ({
    id,
    tracking_number: 'NXS-EXISTING-001',
    status: 'pending_dropoff',
    origin_address: { street: '', city: 'Shanghai', country: 'China' },
    destination_address: { street: '', city: 'Los Angeles', country: 'USA' },
    origin_lat: 31.2304,
    origin_lng: 121.4737,
    destination_lat: 34.0522,
    destination_lng: -118.2437,
    current_lat: 31.2304,
    current_lng: 121.4737,
    current_heading: 0,
    transport_mode: 'ocean',
    weight_kg: 15000,
    volume_cbm: 45.5,
    delivery_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    ...updates,
  })),
  updateShipmentStatus: vi.fn().mockResolvedValue(undefined),
  subscribeToShipmentUpdates: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
}));

vi.mock('@/lib/api/shipments', () => apiMocks);

describe('useLiveShipment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useLiveShipment());

    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.isPaused).toBe(false);
    expect(result.current.state.dbSyncStatus).toBe('idle');
    expect(result.current.state.totalUpdates).toBe(0);
    expect(result.current.shipmentId).toBeNull();
    expect(result.current.trackingNumber).toBeNull();
  });

  it('selects a path', () => {
    const { result } = renderHook(() => useLiveShipment());
    const path = SIMULATION_PATHS[0];

    act(() => {
      result.current.selectPath(path);
    });

    expect(result.current.selectedPath).toEqual(path);
  });

  it('sets speed multiplier', () => {
    const { result } = renderHook(() => useLiveShipment());

    act(() => {
      result.current.setSpeedMultiplier(5);
    });

    expect(result.current.state.speedMultiplier).toBe(5);
  });

  it('cleans up on unmount', () => {
    const { result, unmount } = renderHook(() => useLiveShipment());
    const path = SIMULATION_PATHS[0];

    act(() => {
      result.current.selectPath(path);
    });

    unmount();

    expect(result.current.shipmentId).toBeNull();
  });

  it('attaches an existing shipment to a selected path', async () => {
    const { result } = renderHook(() => useLiveShipment());
    const shipment = createMockShipment({
      id: 'existing-shipment-id',
      tracking_number: 'NXS-EXISTING-001',
      status: 'delivered',
    });
    const path = SIMULATION_PATHS[1];

    await act(async () => {
      const updatedShipment = await result.current.attachShipmentToPath(shipment, path);
      expect(updatedShipment.id).toBe('existing-shipment-id');
      expect(updatedShipment.tracking_number).toBe('NXS-EXISTING-001');
    });

    expect(result.current.shipmentId).toBe('existing-shipment-id');
    expect(result.current.trackingNumber).toBe('NXS-EXISTING-001');
    expect(apiMocks.updateShipment).toHaveBeenCalled();
  });
});
