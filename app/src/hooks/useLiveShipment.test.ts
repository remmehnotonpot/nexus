import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveShipment } from './useLiveShipment';
import { SIMULATION_PATHS } from './useSimulation';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-shipment-id' }, error: null }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      })),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('useLiveShipment', () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
});
