/**
 * Shipments API Layer
 * Database operations for shipments with Supabase
 */

import { supabase } from '@/lib/supabase';
import { NotFoundError, DatabaseError } from '@/lib/errors';
import type { Shipment, TrackingUpdate, ShipmentStatusHistory } from '@/types';

/**
 * Get a shipment by tracking number with full tracking history
 */
export async function getShipmentByTrackingNumber(
  trackingNumber: string
): Promise<(Shipment & {
  tracking_updates: TrackingUpdate[];
  shipment_status_history: ShipmentStatusHistory[];
  status_history: ShipmentStatusHistory[];
}) | null> {
  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      tracking_updates!left (*),
      shipment_status_history!left (*)
    `)
    .eq('tracking_number', trackingNumber)
    .maybeSingle();

  if (error) {
    console.error('Error fetching shipment:', error);
    throw new DatabaseError('Failed to fetch shipment');
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    tracking_updates: data.tracking_updates || [],
    shipment_status_history: data.shipment_status_history || [],
    // Keep a stable field for views that already read status_history.
    status_history: data.shipment_status_history || [],
  } as Shipment & {
    tracking_updates: TrackingUpdate[];
    shipment_status_history: ShipmentStatusHistory[];
    status_history: ShipmentStatusHistory[];
  };
}

/**
 * Get all shipments for a customer
 */
export async function getShipmentsByCustomer(customerId: string): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shipments:', error);
    throw new DatabaseError('Failed to fetch shipments');
  }

  return data || [];
}

/**
 * Get example shipments for public/demo surfaces.
 * The live schema no longer includes `is_live_demo`, so this returns
 * the most recent shipments instead of filtering on a removed column.
 */
export async function getDemoShipments(): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching demo shipments:', error);
    throw new DatabaseError('Failed to fetch demo shipments');
  }

  return data || [];
}

/**
 * Update shipment location
 */
export async function updateShipmentLocation(
  shipmentId: string,
  lat: number,
  lng: number,
  heading?: number
): Promise<void> {
  const { error } = await supabase
    .from('shipments')
    .update({
      current_lat: lat,
      current_lng: lng,
      current_heading: heading ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', shipmentId);

  if (error) {
    console.error('Error updating shipment location:', error);
    throw new DatabaseError('Failed to update shipment location');
  }
}

/**
 * Update shipment status
 */
export async function updateShipmentStatus(
  shipmentId: string,
  status: Shipment['status']
): Promise<void> {
  const { error } = await supabase
    .from('shipments')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'delivered' ? { actual_arrival: new Date().toISOString() } : {}),
    })
    .eq('id', shipmentId);

  if (error) {
    console.error('Error updating shipment status:', error);
    throw new DatabaseError('Failed to update shipment status');
  }
}

/**
 * Add tracking log entry
 */
export async function addTrackingLog(
  shipmentId: string,
  lat: number,
  lng: number,
  eventType: TrackingUpdate['source'] = 'manual',
  locationName?: string
): Promise<void> {
  const { error } = await supabase.from('tracking_updates').insert({
    shipment_id: shipmentId,
    lat,
    lng,
    source: eventType,
    metadata: locationName ? { location_name: locationName } : undefined,
  });

  if (error) {
    console.error('Error adding tracking log:', error);
    throw new DatabaseError('Failed to add tracking log');
  }
}

/**
 * Batch insert tracking logs
 */
export async function batchInsertTrackingLogs(
  logs: Array<{
    shipment_id: string;
    lat: number;
    lng: number;
    source: TrackingUpdate['source'];
    metadata?: { location_name?: string };
  }>
): Promise<void> {
  const { error } = await supabase.from('tracking_updates').insert(logs);

  if (error) {
    console.error('Error batch inserting tracking logs:', error);
    throw new DatabaseError('Failed to batch insert tracking logs');
  }
}

/**
 * Create new shipment
 */
export async function createShipment(
  shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>
): Promise<Shipment> {
  const { data, error } = await supabase
    .from('shipments')
    .insert(shipment)
    .select()
    .single();

  if (error) {
    console.error('Error creating shipment:', error);
    throw new DatabaseError('Failed to create shipment');
  }

  if (!data) {
    throw new DatabaseError('No data returned from create shipment');
  }

  return data;
}

/**
 * Subscribe to real-time shipment updates
 */
export function subscribeToShipmentUpdates(
  shipmentId: string,
  callback: (payload: { new: Shipment; old: Shipment | null }) => void
) {
  return supabase
    .channel(`shipment-${shipmentId}`)
    .on(
      'postgres_changes' as const,
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'shipments',
        filter: `id=eq.${shipmentId}`,
      },
      (payload: unknown) => callback(payload as { new: Shipment; old: Shipment | null })
    )
    .subscribe();
}

/**
 * Subscribe to tracking logs for a shipment
 */
export function subscribeToTrackingLogs(
  shipmentId: string,
  callback: (payload: { new: TrackingUpdate }) => void
) {
  return supabase
    .channel(`tracking-${shipmentId}`)
    .on(
      'postgres_changes' as const,
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tracking_updates',
        filter: `shipment_id=eq.${shipmentId}`,
      },
      (payload: unknown) => callback(payload as { new: TrackingUpdate })
    )
    .subscribe();
}

/**
 * Record a tracking update for audit trail
 */
export async function recordTrackingUpdate(
  shipmentId: string,
  lat: number,
  lng: number,
  source: string,
  metadata?: {
    heading?: number;
    speed_kmh?: number;
    accuracy?: number;
    battery_level?: number;
  },
  recordedBy?: string
): Promise<void> {
  const { error } = await supabase.from('tracking_updates').insert({
    shipment_id: shipmentId,
    lat,
    lng,
    source,
    recorded_by: recordedBy,
    ...metadata,
  });

  if (error) {
    console.error('Error recording tracking update:', error);
    throw new DatabaseError('Failed to record tracking update');
  }
}

/**
 * Get all shipments with optional filters
 */
export async function getShipments(filters?: {
  customerId?: string;
  status?: string;
  limit?: number;
}): Promise<Shipment[]> {
  let query = supabase.from('shipments').select('*');

  if (filters?.customerId) {
    query = query.eq('customer_id', filters.customerId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shipments:', error);
    throw new DatabaseError('Failed to fetch shipments');
  }

  return data || [];
}
