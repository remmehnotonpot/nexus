import { useState, useCallback, useRef, useEffect } from 'react';
import type { SimulationPath, TransportMode, ShipmentStatus } from '@/types';

// Predefined simulation paths
export const SIMULATION_PATHS: SimulationPath[] = [
  {
    id: 'path-1',
    name: 'Shanghai to Los Angeles (Ocean)',
    description: 'Major transpacific shipping route',
    transport_mode: 'ocean',
    path_data: [
      [31.2304, 121.4737],
      [32.0, 125.0],
      [35.0, 140.0],
      [38.0, 160.0],
      [37.0, 180.0],
      [35.0, -160.0],
      [34.0, -140.0],
      [33.7, -118.2],
    ],
    origin_city: 'Shanghai, China',
    destination_city: 'Los Angeles, USA',
    estimated_duration_hours: 336,
  },
  {
    id: 'path-2',
    name: 'Rotterdam to New York (Ocean)',
    description: 'Transatlantic shipping route',
    transport_mode: 'ocean',
    path_data: [
      [51.9244, 4.4777],
      [50.0, 0.0],
      [48.0, -20.0],
      [45.0, -40.0],
      [42.0, -60.0],
      [40.7, -74.0],
    ],
    origin_city: 'Rotterdam, Netherlands',
    destination_city: 'New York, USA',
    estimated_duration_hours: 168,
  },
  {
    id: 'path-3',
    name: 'Dubai to London (Air)',
    description: 'Major air freight corridor',
    transport_mode: 'air',
    path_data: [
      [25.2048, 55.2708],
      [28.0, 45.0],
      [35.0, 30.0],
      [42.0, 20.0],
      [48.0, 10.0],
      [51.5, -0.1],
    ],
    origin_city: 'Dubai, UAE',
    destination_city: 'London, UK',
    estimated_duration_hours: 8,
  },
  {
    id: 'path-4',
    name: 'Singapore to Sydney (Ocean)',
    description: 'Asia-Pacific shipping route',
    transport_mode: 'ocean',
    path_data: [
      [1.3521, 103.8198],
      [-5.0, 110.0],
      [-15.0, 120.0],
      [-25.0, 130.0],
      [-33.9, 151.2],
    ],
    origin_city: 'Singapore',
    destination_city: 'Sydney, Australia',
    estimated_duration_hours: 120,
  },
  {
    id: 'path-5',
    name: 'Hong Kong to Hamburg (Rail)',
    description: 'China-Europe rail corridor',
    transport_mode: 'rail',
    path_data: [
      [22.3193, 114.1694],
      [30.0, 110.0],
      [40.0, 80.0],
      [50.0, 40.0],
      [53.5, 10.0],
    ],
    origin_city: 'Hong Kong, China',
    destination_city: 'Hamburg, Germany',
    estimated_duration_hours: 288,
  },
];

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  progress: number;
  currentPosition: [number, number] | null;
  heading: number;
  speedMultiplier: number;
}

export interface UseSimulationReturn {
  state: SimulationState;
  selectedPath: SimulationPath | null;
  selectPath: (path: SimulationPath | null) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setSpeedMultiplier: (speed: number) => void;
}

export function useSimulation(
  onPositionUpdate?: (position: [number, number], heading: number) => void
): UseSimulationReturn {
  const [selectedPath, setSelectedPath] = useState<SimulationPath | null>(null);
  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    isPaused: false,
    currentIndex: 0,
    progress: 0,
    currentPosition: null,
    heading: 0,
    speedMultiplier: 1,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(0);

  // Calculate heading between two points
  const calculateHeading = useCallback((from: [number, number], to: [number, number]): number => {
    const [lat1, lng1] = from;
    const [lat2, lng2] = to;
    
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    let heading = Math.atan2(y, x) * (180 / Math.PI);
    heading = (heading + 360) % 360;
    
    return heading;
  }, []);

  // Interpolate between two points
  const interpolate = useCallback(
    (from: [number, number], to: [number, number], progress: number): [number, number] => {
      const lat = from[0] + (to[0] - from[0]) * progress;
      const lng = from[1] + (to[1] - from[1]) * progress;
      return [lat, lng];
    },
    []
  );

  const clearSimulationInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const runSimulation = useCallback(() => {
    if (!selectedPath) return;

    const path = selectedPath.path_data;
    const baseStepDuration = 2000; // 2 seconds per point at 1x speed
    const updateInterval = 100; // Update every 100ms for smooth animation
    
    // Adjust step duration based on speed multiplier
    // Higher speed = fewer interpolation steps between points
    const adjustedStepDuration = baseStepDuration / state.speedMultiplier;
    const stepsPerPoint = Math.max(1, Math.round(adjustedStepDuration / updateInterval));

    intervalRef.current = setInterval(() => {
      setState(prev => {
        const currentIdx = currentIndexRef.current;
        
        if (currentIdx >= path.length - 1) {
          clearSimulationInterval();
          return {
            ...prev,
            isRunning: false,
            isPaused: false,
            progress: 100,
          };
        }

        const from = path[currentIdx];
        const to = path[currentIdx + 1];
        const stepProgress = (prev.progress % (100 / (path.length - 1))) / (100 / (path.length - 1));
        
        const newProgress = prev.progress + (100 / (path.length - 1) / stepsPerPoint);
        const newIndex = Math.floor((newProgress / 100) * (path.length - 1));
        
        if (newIndex > currentIdx) {
          currentIndexRef.current = newIndex;
        }

        const position = interpolate(from, to, stepProgress);
        const heading = calculateHeading(from, to);

        onPositionUpdate?.(position, heading);

        return {
          ...prev,
          progress: Math.min(newProgress, 100),
          currentIndex: newIndex,
          currentPosition: position,
          heading,
        };
      });
    }, updateInterval);
  }, [selectedPath, state.speedMultiplier, interpolate, calculateHeading, onPositionUpdate, clearSimulationInterval]);

  const selectPath = useCallback((path: SimulationPath | null) => {
    setSelectedPath(path);
    if (path) {
      setState({
        isRunning: false,
        isPaused: false,
        currentIndex: 0,
        progress: 0,
        currentPosition: path.path_data[0],
        heading: 0,
        speedMultiplier: 1,
      });
      currentIndexRef.current = 0;
    }
  }, []);

  const setSpeedMultiplier = useCallback((speed: number) => {
    setState(prev => ({
      ...prev,
      speedMultiplier: speed,
    }));
  }, []);

  const start = useCallback(() => {
    if (!selectedPath) return;
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));
    
    runSimulation();
  }, [selectedPath, runSimulation]);

  const pause = useCallback(() => {
    clearSimulationInterval();
    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, [clearSimulationInterval]);

  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: false,
    }));
    runSimulation();
  }, [runSimulation]);

  const stop = useCallback(() => {
    clearSimulationInterval();
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
    }));
  }, [clearSimulationInterval]);

  const reset = useCallback(() => {
    clearSimulationInterval();
    if (selectedPath) {
      setState({
        isRunning: false,
        isPaused: false,
        currentIndex: 0,
        progress: 0,
        currentPosition: selectedPath.path_data[0],
        heading: 0,
        speedMultiplier: state.speedMultiplier, // Keep current speed
      });
      currentIndexRef.current = 0;
    }
  }, [selectedPath, state.speedMultiplier, clearSimulationInterval]);

  useEffect(() => {
    return () => {
      clearSimulationInterval();
    };
  }, [clearSimulationInterval]);

  return {
    state,
    selectedPath,
    selectPath,
    start,
    pause,
    resume,
    stop,
    reset,
    setSpeedMultiplier,
  };
}

// Mock Supabase client for simulation
export const mockSupabaseClient = {
  from: (table: string) => ({
    update: (data: unknown) => ({
      eq: async (column: string, value: string) => {
        console.log(`[Mock Supabase] UPDATE ${table} SET`, data, `WHERE ${column} = ${value}`);
        return { data: null, error: null };
      },
    }),
    insert: (data: Record<string, unknown>) => ({
      select: async () => {
        console.log(`[Mock Supabase] INSERT INTO ${table}`, data);
        return { data: [{ id: 'mock-id', ...data }], error: null };
      },
    }),
    select: async (columns?: string) => {
      console.log(`[Mock Supabase] SELECT ${columns || '*'} FROM ${table}`);
      return { data: [], error: null };
    },
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => {
        return { unsubscribe: () => {} };
      },
    }),
  }),
};

// Helper to generate tracking number
export function generateTrackingNumber(): string {
  const prefix = 'NXS';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Helper to get transport mode icon
export function getTransportIcon(mode: TransportMode): string {
  const icons: Record<TransportMode, string> = {
    air: 'Plane',
    ocean: 'Ship',
    road: 'Truck',
    rail: 'Train',
    multimodal: 'Package',
  };
  return icons[mode];
}

// Helper to get status color (using new schema status values)
export function getStatusColor(status: ShipmentStatus): string {
  const colors: Record<ShipmentStatus, string> = {
    pending_dropoff: 'bg-amber-500',
    scheduled_for_pickup: 'bg-blue-500',
    in_transit: 'bg-sky-500',
    customs: 'bg-orange-500',
    delivered: 'bg-green-500',
    exception: 'bg-red-500',
    out_for_delivery: 'bg-purple-500',
    cancelled: 'bg-gray-500',
    returned: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
}

// Helper to get status label (using new schema status values)
export function getStatusLabel(status: ShipmentStatus): string {
  const labels: Record<ShipmentStatus, string> = {
    pending_dropoff: 'Pending Drop-off',
    scheduled_for_pickup: 'Scheduled for Pickup',
    in_transit: 'In Transit',
    customs: 'In Customs',
    delivered: 'Delivered',
    exception: 'Exception',
    out_for_delivery: 'Out for Delivery',
    cancelled: 'Cancelled',
    returned: 'Returned',
  };
  return labels[status] || status;
}
