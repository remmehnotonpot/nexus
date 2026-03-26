"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getShipmentByTrackingNumber } from '@/lib/api/shipments';
import { locationSchema } from '@/lib/schemas/shipment';
import type { Shipment, TrackingLog, ShipmentStatus } from '@/types';

// =====================================================
// TYPES
// =====================================================

export interface LiveTrackingState {
  /** Current shipment data */
  shipment: Shipment | null;
  /** Current position coordinates [lat, lng] */
  currentPosition: [number, number] | null;
  /** Current heading in degrees */
  heading: number;
  /** Tracking history (breadcrumb trail) */
  trackingHistory: TrackingLog[];
  /** Loading state for initial fetch */
  isLoading: boolean;
  /** Error message if fetch/subscription fails */
  error: string | null;
  /** Real-time connection status */
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  /** Timestamp of last update received */
  lastUpdateTime: Date | null;
}

export interface UseLiveTrackingReturn extends LiveTrackingState {
  /** Refresh shipment data manually */
  refresh: () => Promise<void>;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

/**
 * useLiveTracking - Real-time shipment tracking hook
 * 
 * Fetches initial shipment data and establishes a Supabase Realtime
 * subscription to receive live coordinate updates.
 * 
 * @param trackingNumber - The shipment tracking number to track
 * @returns LiveTrackingState with shipment data and connection status
 * 
 * @example
 * ```tsx
 * const { shipment, currentPosition, isLoading, connectionStatus } = useLiveTracking('NXS-DEMO-001');
 * ```
 */
export function useLiveTracking(trackingNumber: string | null): UseLiveTrackingReturn {
  // Core state
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<TrackingLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<LiveTrackingState['connectionStatus']>('disconnected');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Refs for managing subscription
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const shipmentIdRef = useRef<string | null>(null);

  /**
   * Fetch initial shipment data
   */
  const fetchShipment = useCallback(async () => {
    if (!trackingNumber) {
      setShipment(null);
      setTrackingHistory([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getShipmentByTrackingNumber(trackingNumber);

      if (!data) {
        setError('Shipment not found');
        setShipment(null);
        setTrackingHistory([]);
        return;
      }

      // Validate current position data with Zod
      const lat = data.current_lat ?? 0;
      const lng = data.current_lng ?? 0;
      const positionValidation = locationSchema.safeParse({ lat, lng });

      if (!positionValidation.success) {
        console.warn('Invalid position data received:', positionValidation.error);
      }

      setShipment(data);
      setTrackingHistory(data.tracking_logs || []);
      shipmentIdRef.current = data.id;
      setLastUpdateTime(new Date());
    } catch (err) {
      console.error('Error fetching shipment:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shipment');
    } finally {
      setIsLoading(false);
    }
  }, [trackingNumber]);

  /**
   * Handle real-time update from Supabase
   */
  const handleRealtimeUpdate = useCallback((payload: { new: Record<string, unknown>; old: Record<string, unknown> | null }) => {
    const newData = payload.new;

    // Validate the update payload
    const lat = newData.current_lat as number | undefined;
    const lng = newData.current_lng as number | undefined;
    const heading = newData.current_heading as number | undefined;
    const status = newData.status as ShipmentStatus | undefined;

    // Validate coordinates with Zod
    const positionValidation = locationSchema.safeParse({ lat, lng });
    
    if (!positionValidation.success) {
      console.warn('Invalid position update received:', positionValidation.error);
      return;
    }

    // Update shipment state with new data
    setShipment((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        current_lat: lat ?? prev.current_lat,
        current_lng: lng ?? prev.current_lng,
        current_heading: heading ?? prev.current_heading,
        status: status ?? prev.status,
        updated_at: new Date().toISOString(),
      };
    });

    setLastUpdateTime(new Date());
  }, []);

  /**
   * Subscribe to real-time updates for this shipment
   */
  const subscribeToUpdates = useCallback((shipmentId: string) => {
    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setConnectionStatus('connecting');

    // Create new channel with unique name
    const channelName = `shipment-live-${shipmentId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as const,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `id=eq.${shipmentId}`,
        },
        (payload: unknown) => handleRealtimeUpdate(payload as { new: Record<string, unknown>; old: Record<string, unknown> | null })
      )
      .subscribe((status) => {
        switch (status) {
          case 'SUBSCRIBED':
            setConnectionStatus('connected');
            break;
          case 'CHANNEL_ERROR':
            setConnectionStatus('error');
            setError('Real-time connection error');
            break;
          case 'TIMED_OUT':
            setConnectionStatus('error');
            setError('Real-time connection timed out');
            break;
          case 'CLOSED':
            setConnectionStatus('disconnected');
            break;
        }
      });

    channelRef.current = channel;

    return channel;
  }, [handleRealtimeUpdate]);

  /**
   * Unsubscribe from real-time updates
   */
  const unsubscribeFromUpdates = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  // Initial fetch when tracking number changes
  useEffect(() => {
    fetchShipment();
  }, [fetchShipment]);

  // Subscribe to real-time updates when shipment is loaded
  useEffect(() => {
    if (shipment?.id) {
      subscribeToUpdates(shipment.id);
    }

    return () => {
      unsubscribeFromUpdates();
    };
  }, [shipment?.id, subscribeToUpdates, unsubscribeFromUpdates]);

  // Compute current position from shipment state
  const currentPosition: [number, number] | null = shipment
    ? [
        shipment.current_lat ?? shipment.origin_lat ?? 0,
        shipment.current_lng ?? shipment.origin_lng ?? 0,
      ]
    : null;

  const heading = shipment?.current_heading ?? 0;

  return {
    shipment,
    currentPosition,
    heading,
    trackingHistory,
    isLoading,
    error,
    connectionStatus,
    lastUpdateTime,
    refresh: fetchShipment,
  };
}

export default useLiveTracking;
