import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimulation, SIMULATION_PATHS, generateTrackingNumber, getTransportIcon, getStatusColor, getStatusLabel } from './useSimulation';

describe('useSimulation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useSimulation());

    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.isPaused).toBe(false);
    expect(result.current.state.currentIndex).toBe(0);
    expect(result.current.state.progress).toBe(0);
    expect(result.current.state.currentPosition).toBeNull();
    expect(result.current.state.speedMultiplier).toBe(1);
    expect(result.current.selectedPath).toBeNull();
  });

  it('selects a path', () => {
    const { result } = renderHook(() => useSimulation());
    const path = SIMULATION_PATHS[0];

    act(() => {
      result.current.selectPath(path);
    });

    expect(result.current.selectedPath).toEqual(path);
    expect(result.current.state.currentPosition).toEqual(path.path_data[0]);
  });

  it('clears path when null is selected', () => {
    const { result } = renderHook(() => useSimulation());
    const path = SIMULATION_PATHS[0];

    act(() => {
      result.current.selectPath(path);
    });

    act(() => {
      result.current.selectPath(null);
    });

    expect(result.current.selectedPath).toBeNull();
  });

  it('pauses simulation', () => {
    const { result } = renderHook(() => useSimulation());
    const path = SIMULATION_PATHS[0];

    act(() => {
      result.current.selectPath(path);
      result.current.start();
      result.current.pause();
    });

    expect(result.current.state.isPaused).toBe(true);
  });

  it('resumes simulation', () => {
    const { result } = renderHook(() => useSimulation());
    const path = SIMULATION_PATHS[0];

    act(() => {
      result.current.selectPath(path);
      result.current.start();
      result.current.pause();
      result.current.resume();
    });

    expect(result.current.state.isPaused).toBe(false);
  });

  it('stops simulation', () => {
    const { result } = renderHook(() => useSimulation());
    const path = SIMULATION_PATHS[0];

    act(() => {
      result.current.selectPath(path);
      result.current.start();
      result.current.stop();
    });

    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.isPaused).toBe(false);
  });

  it('resets simulation', () => {
    const { result } = renderHook(() => useSimulation());
    const path = SIMULATION_PATHS[0];

    act(() => {
      result.current.selectPath(path);
      result.current.start();
      result.current.reset();
    });

    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.progress).toBe(0);
  });

  it('sets speed multiplier', () => {
    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.setSpeedMultiplier(5);
    });

    expect(result.current.state.speedMultiplier).toBe(5);
  });

  it('does not start without path', () => {
    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.start();
    });

    expect(result.current.state.isRunning).toBe(false);
  });

  describe('helper functions', () => {
    it('generates tracking number', () => {
      const trackingNumber = generateTrackingNumber();

      expect(trackingNumber).toMatch(/^NXS-/);
      expect(trackingNumber.length).toBeGreaterThan(10);
    });

    it('returns transport icon names', () => {
      expect(getTransportIcon('air')).toBe('Plane');
      expect(getTransportIcon('ocean')).toBe('Ship');
      expect(getTransportIcon('road')).toBe('Truck');
      expect(getTransportIcon('rail')).toBe('Train');
    });

    it('returns status colors', () => {
      expect(getStatusColor('pending')).toBe('bg-yellow-500');
      expect(getStatusColor('in-transit')).toBe('bg-blue-500');
      expect(getStatusColor('delivered')).toBe('bg-green-500');
      expect(getStatusColor('delayed')).toBe('bg-red-500');
      expect(getStatusColor('customs')).toBe('bg-orange-500');
      expect(getStatusColor('out-for-delivery')).toBe('bg-purple-500');
    });

    it('returns status labels', () => {
      expect(getStatusLabel('pending')).toBe('Pending');
      expect(getStatusLabel('in-transit')).toBe('In Transit');
      expect(getStatusLabel('delivered')).toBe('Delivered');
      expect(getStatusLabel('delayed')).toBe('Delayed');
      expect(getStatusLabel('customs')).toBe('In Customs');
      expect(getStatusLabel('out-for-delivery')).toBe('Out for Delivery');
    });
  });
});
