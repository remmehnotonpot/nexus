"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Shipment, TrackingUpdate, ShipmentStatusHistory } from '@/types';
import type { Notification } from '@/lib/api/notifications';

// ============================================
// Real-time Shipment Updates Hook
// ============================================

interface UseRealtimeShipmentOptions {
  onUpdate?: (shipment: Shipment) => void;
  onLocationChange?: (lat: number, lng: number, heading?: number) => void;
  onStatusChange?: (status: string, previousStatus: string) => void;
}

export function useRealtimeShipment(
  shipmentId: string | null,
  options: UseRealtimeShipmentOptions = {}
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { onUpdate, onLocationChange, onStatusChange } = options;

  useEffect(() => {
    if (!shipmentId) return;

    // Create realtime channel for shipment updates
    const channel = supabase
      .channel(`shipment-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `id=eq.${shipmentId}`,
        },
        (payload) => {
          const newShipment = payload.new as Shipment;
          const oldShipment = payload.old as Shipment;

          setLastUpdate(new Date());
          onUpdate?.(newShipment);

          // Check for location change
          if (
            newShipment.current_lat !== oldShipment.current_lat ||
            newShipment.current_lng !== oldShipment.current_lng
          ) {
            onLocationChange?.(
              newShipment.current_lat ?? 0,
              newShipment.current_lng ?? 0,
              newShipment.current_heading ?? undefined
            );
          }

          // Check for status change
          if (newShipment.status !== oldShipment.status) {
            onStatusChange?.(newShipment.status, oldShipment.status);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [shipmentId, onUpdate, onLocationChange, onStatusChange]);

  return { isConnected, lastUpdate };
}

// ============================================
// Real-time Tracking Updates Hook
// ============================================

interface UseRealtimeTrackingOptions {
  onTrackingUpdate?: (update: TrackingUpdate) => void;
}

export function useRealtimeTracking(
  shipmentId: string | null,
  options: UseRealtimeTrackingOptions = {}
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<TrackingUpdate[]>([]);
  const { onTrackingUpdate } = options;

  useEffect(() => {
    if (!shipmentId) return;

    const channel = supabase
      .channel(`tracking-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tracking_updates',
          filter: `shipment_id=eq.${shipmentId}`,
        },
        (payload) => {
          const update = payload.new as TrackingUpdate;
          setUpdates((prev) => [update, ...prev]);
          onTrackingUpdate?.(update);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [shipmentId, onTrackingUpdate]);

  return { isConnected, updates };
}

// ============================================
// Real-time Notifications Hook
// ============================================

interface UseRealtimeNotificationsOptions {
  onNotification?: (notification: Notification) => void;
  markAsRead?: boolean;
}

export function useRealtimeNotifications(
  customerId: string | null,
  options: UseRealtimeNotificationsOptions = {}
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { onNotification } = options;

  useEffect(() => {
    if (!customerId) return;

    const channel = supabase
      .channel(`notifications-${customerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          onNotification?.(notification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? notification : n))
          );
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [customerId, onNotification]);

  const markAllAsRead = useCallback(async () => {
    if (!customerId) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('customer_id', customerId)
      .eq('is_read', false);

    setUnreadCount(0);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  }, [customerId]);

  return { 
    isConnected, 
    notifications, 
    unreadCount, 
    markAllAsRead,
  };
}

// ============================================
// Real-time Status History Hook
// ============================================

interface UseRealtimeStatusHistoryOptions {
  onStatusHistory?: (history: ShipmentStatusHistory) => void;
}

export function useRealtimeStatusHistory(
  shipmentId: string | null,
  options: UseRealtimeStatusHistoryOptions = {}
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState<ShipmentStatusHistory[]>([]);
  const { onStatusHistory } = options;

  useEffect(() => {
    if (!shipmentId) return;

    const channel = supabase
      .channel(`status-history-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shipment_status_history',
          filter: `shipment_id=eq.${shipmentId}`,
        },
        (payload) => {
          const entry = payload.new as ShipmentStatusHistory;
          setHistory((prev) => [entry, ...prev]);
          onStatusHistory?.(entry);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [shipmentId, onStatusHistory]);

  return { isConnected, history };
}

// ============================================
// Connection Status Hook
// ============================================

export function useRealtimeConnection() {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const channel = supabase.channel('connection-check')
      .subscribe((status) => {
        setConnectionState(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { isOnline, connectionState, isConnected: isOnline && connectionState === 'connected' };
}

// ============================================
// Broadcast Channel Hook (for cross-tab communication)
// ============================================

export function useBroadcastChannel(channelName: string) {
  const [lastMessage, setLastMessage] = useState<unknown>(null);

  useEffect(() => {
    const channel = supabase.channel(channelName);
    
    channel
      .on('broadcast', { event: '*' }, (payload) => {
        setLastMessage(payload);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [channelName]);

  const sendMessage = useCallback(
    async (event: string, payload: unknown) => {
      const channel = supabase.channel(channelName);
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    },
    [channelName]
  );

  return { lastMessage, sendMessage };
}
