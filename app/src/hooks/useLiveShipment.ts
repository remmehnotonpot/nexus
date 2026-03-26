"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  updateShipmentLocation, 
  batchInsertTrackingLogs, 
  createShipment as apiCreateShipment,
  updateShipmentStatus as apiUpdateShipmentStatus,
  subscribeToShipmentUpdates 
} from '@/lib/api/shipments';
import { useSimulation, SIMULATION_PATHS, generateTrackingNumber } from './useSimulation';
import type { SimulationPath, ShipmentStatus, TrackingLog } from '@/types';

// Batch configuration for tracking logs
const BATCH_SIZE = 5;
const BATCH_INTERVAL_MS = 2000;
const MAX_RETRIES = 3;

export interface LiveShipmentState {
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  progress: number;
  currentPosition: [number, number] | null;
  heading: number;
  speedMultiplier: number;
  dbSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: Date | null;
  totalUpdates: number;
}

export interface TrackingLogEntry {
  shipmentId: string;
  lat: number;
  lng: number;
  eventType: string;
  locationName?: string;
  retryCount: number;
}

export interface UseLiveShipmentReturn {
  state: LiveShipmentState;
  selectedPath: SimulationPath | null;
  shipmentId: string | null;
  trackingNumber: string | null;
  selectPath: (path: SimulationPath | null) => void;
  createShipment: (path: SimulationPath) => Promise<string>;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setSpeedMultiplier: (speed: number) => void;
  updateShipmentStatus: (status: ShipmentStatus) => Promise<void>;
  simulationLogs: string[];
}

export function useLiveShipment(): UseLiveShipmentReturn {
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  
  // Batch queue for tracking logs
  const trackingLogQueue = useRef<TrackingLogEntry[]>([]);
  const batchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToShipmentUpdates> | null>(null);

  // Enhanced simulation state with sync status
  const [liveState, setLiveState] = useState<LiveShipmentState>({
    isRunning: false,
    isPaused: false,
    currentIndex: 0,
    progress: 0,
    currentPosition: null,
    heading: 0,
    speedMultiplier: 1,
    dbSyncStatus: 'idle',
    lastSyncTime: null,
    totalUpdates: 0,
  });

  // Add log entry
  const addLog = useCallback((message: string) => {
    setSimulationLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 99),
    ]);
  }, []);

  // Update database sync status
  const setSyncStatus = useCallback((status: LiveShipmentState['dbSyncStatus']) => {
    setLiveState(prev => ({ ...prev, dbSyncStatus: status }));
  }, []);

  // Update shipment location in database
  const updateLocation = useCallback(async (
    id: string,
    lat: number,
    lng: number,
    heading: number
  ): Promise<void> => {
    setSyncStatus('syncing');
    
    try {
      await updateShipmentLocation(id, lat, lng, heading);

      setLiveState(prev => ({
        ...prev,
        dbSyncStatus: 'synced',
        lastSyncTime: new Date(),
        totalUpdates: prev.totalUpdates + 1,
      }));
    } catch (error) {
      console.error('Failed to update shipment location:', error);
      setSyncStatus('error');
      addLog(`Error: Failed to sync location`);
    }
  }, [addLog, setSyncStatus]);

  // Add tracking log to batch queue
  const addTrackingLog = useCallback((
    id: string,
    lat: number,
    lng: number,
    eventType: string = 'location-update',
    locationName?: string
  ): void => {
    trackingLogQueue.current.push({
      shipmentId: id,
      lat,
      lng,
      eventType,
      locationName,
      retryCount: 0,
    });
  }, []);

  // Process batch of tracking logs
  const processBatch = useCallback(async () => {
    if (trackingLogQueue.current.length === 0 || !shipmentId) return;

    const batch = trackingLogQueue.current.splice(0, BATCH_SIZE);
    
    try {
      const logs = batch.map(entry => ({
        shipment_id: entry.shipmentId,
        lat: entry.lat,
        lng: entry.lng,
        event_type: entry.eventType as TrackingLog['event_type'],
        location_name: entry.locationName,
      }));

      await batchInsertTrackingLogs(logs);
      addLog(`Batch synced: ${batch.length} tracking logs`);
    } catch (error) {
      console.error('Failed to batch insert tracking logs:', error);
      // Re-queue failed logs if under max retries
      const failedLogs = batch
        .map(entry => ({ ...entry, retryCount: entry.retryCount + 1 }))
        .filter(entry => entry.retryCount < MAX_RETRIES);
      trackingLogQueue.current.unshift(...failedLogs);
    }
  }, [shipmentId, addLog]);

  // Start batch processing
  const startBatchProcessing = useCallback(() => {
    if (batchIntervalRef.current) return;
    
    batchIntervalRef.current = setInterval(() => {
      processBatch();
    }, BATCH_INTERVAL_MS);
  }, [processBatch]);

  // Stop batch processing
  const stopBatchProcessing = useCallback(() => {
    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
      batchIntervalRef.current = null;
    }
    // Process remaining logs
    processBatch();
  }, [processBatch]);

  // Subscribe to real-time updates
  const subscribeToUpdates = useCallback((id: string) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = subscribeToShipmentUpdates(id, (payload) => {
      addLog(`Database update received: ${payload.new.status}`);
    });

    return subscriptionRef.current;
  }, [addLog]);

  // Handle position update from simulation
  const handlePositionUpdate = useCallback((position: [number, number], heading: number) => {
    if (!shipmentId) return;

    // Update database
    updateLocation(shipmentId, position[0], position[1], heading);

    // Queue tracking log
    addTrackingLog(shipmentId, position[0], position[1], 'location-update');

    // Update local state
    setLiveState(prev => ({
      ...prev,
      currentPosition: position,
      heading,
    }));
  }, [shipmentId, updateLocation, addTrackingLog]);

  // Initialize simulation hook
  const {
    state: simulationState,
    selectedPath,
    selectPath: selectSimulationPath,
    start: startSimulation,
    pause: pauseSimulation,
    resume: resumeSimulation,
    stop: stopSimulation,
    reset: resetSimulation,
    setSpeedMultiplier: setSimulationSpeed,
  } = useSimulation(handlePositionUpdate);

  // Sync simulation state with live state
  useEffect(() => {
    setLiveState(prev => ({
      ...prev,
      isRunning: simulationState.isRunning,
      isPaused: simulationState.isPaused,
      currentIndex: simulationState.currentIndex,
      progress: simulationState.progress,
      currentPosition: simulationState.currentPosition,
      heading: simulationState.heading,
      speedMultiplier: simulationState.speedMultiplier,
    }));
  }, [simulationState]);

  // Create shipment from simulation path
  const createShipment = useCallback(async (path: SimulationPath): Promise<string> => {
    const newTrackingNumber = generateTrackingNumber();
    
    try {
      setSyncStatus('syncing');
      
      const shipment = await apiCreateShipment({
        tracking_number: newTrackingNumber,
        status: 'pending',
        origin: {
          lat: path.path_data[0][0],
          lng: path.path_data[0][1],
          city: path.origin_city,
          country: '',
        },
        destination: {
          lat: path.path_data[path.path_data.length - 1][0],
          lng: path.path_data[path.path_data.length - 1][1],
          city: path.destination_city,
          country: '',
        },
        current: {
          lat: path.path_data[0][0],
          lng: path.path_data[0][1],
          heading: 0,
        },
        current_lat: path.path_data[0][0],
        current_lng: path.path_data[0][1],
        current_heading: 0,
        transport_mode: path.transport_mode,
        is_live_demo: true,
        estimated_arrival: new Date(Date.now() + path.estimated_duration_hours * 60 * 60 * 1000).toISOString(),
      });

      setShipmentId(shipment.id);
      setTrackingNumber(newTrackingNumber);
      setSyncStatus('synced');
      
      // Subscribe to real-time updates
      subscribeToUpdates(shipment.id);
      
      // Add initial tracking log
      addTrackingLog(
        shipment.id,
        path.path_data[0][0],
        path.path_data[0][1],
        'departure',
        path.origin_city
      );

      addLog(`Shipment created: ${newTrackingNumber}`);
      
      return shipment.id;
    } catch (error) {
      console.error('Failed to create shipment:', error);
      setSyncStatus('error');
      addLog(`Error: Failed to create shipment`);
      throw error;
    }
  }, [addLog, addTrackingLog, setSyncStatus, subscribeToUpdates]);

  // Select path and auto-create shipment
  const selectPath = useCallback((path: SimulationPath | null) => {
    selectSimulationPath(path);
    if (path) {
      // Reset shipment state when selecting new path
      setShipmentId(null);
      setTrackingNumber(null);
      setLiveState(prev => ({
        ...prev,
        dbSyncStatus: 'idle',
        lastSyncTime: null,
        totalUpdates: 0,
      }));
    }
  }, [selectSimulationPath]);

  // Set speed multiplier
  const setSpeedMultiplier = useCallback((speed: number) => {
    setSimulationSpeed(speed);
    setLiveState(prev => ({ ...prev, speedMultiplier: speed }));
    addLog(`Speed set to ${speed}x`);
  }, [setSimulationSpeed, addLog]);

  // Update shipment status
  const updateShipmentStatus = useCallback(async (status: ShipmentStatus): Promise<void> => {
    if (!shipmentId) return;

    try {
      await apiUpdateShipmentStatus(shipmentId, status);
      addLog(`Status updated to: ${status}`);

      // Add arrival log if delivered
      if (status === 'delivered' && selectedPath) {
        const lastPoint = selectedPath.path_data[selectedPath.path_data.length - 1];
        addTrackingLog(
          shipmentId,
          lastPoint[0],
          lastPoint[1],
          'arrival',
          selectedPath.destination_city
        );
        // Process final batch
        await processBatch();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      addLog(`Error: Failed to update status`);
    }
  }, [shipmentId, selectedPath, addLog, addTrackingLog, processBatch]);

  // Start simulation with status update
  const start = useCallback(() => {
    startSimulation();
    startBatchProcessing();
    updateShipmentStatus('in-transit');
    addLog('Simulation started');
  }, [startSimulation, startBatchProcessing, updateShipmentStatus, addLog]);

  // Pause simulation
  const pause = useCallback(() => {
    pauseSimulation();
    addLog('Simulation paused');
  }, [pauseSimulation, addLog]);

  // Resume simulation
  const resume = useCallback(() => {
    resumeSimulation();
    startBatchProcessing();
    addLog('Simulation resumed');
  }, [resumeSimulation, startBatchProcessing, addLog]);

  // Stop simulation
  const stop = useCallback(() => {
    stopSimulation();
    stopBatchProcessing();
    addLog('Simulation stopped');
  }, [stopSimulation, stopBatchProcessing, addLog]);

  // Reset simulation
  const reset = useCallback(() => {
    resetSimulation();
    stopBatchProcessing();
    trackingLogQueue.current = [];
    setShipmentId(null);
    setTrackingNumber(null);
    setLiveState(prev => ({
      ...prev,
      dbSyncStatus: 'idle',
      lastSyncTime: null,
      totalUpdates: 0,
    }));
    addLog('Simulation reset');
  }, [resetSimulation, stopBatchProcessing, addLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBatchProcessing();
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [stopBatchProcessing]);

  return {
    state: liveState,
    selectedPath,
    shipmentId,
    trackingNumber,
    selectPath,
    createShipment,
    start,
    pause,
    resume,
    stop,
    reset,
    setSpeedMultiplier,
    updateShipmentStatus,
    simulationLogs,
  };
}

export default useLiveShipment;
