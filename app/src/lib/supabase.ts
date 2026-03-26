import { createClient } from '@supabase/supabase-js';

// These would normally come from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client without strict typing
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for common operations

export async function getShipmentByTrackingNumber(trackingNumber: string) {
  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      tracking_updates (*)
    `)
    .eq('tracking_number', trackingNumber)
    .single();

  if (error) throw error;
  return data;
}

export async function getShipmentsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateShipmentLocation(
  shipmentId: string,
  lat: number,
  lng: number,
  heading?: number
) {
  const { error } = await supabase
    .from('shipments')
    .update({
      current_lat: lat,
      current_lng: lng,
      current_heading: heading,
      updated_at: new Date().toISOString(),
    })
    .eq('id', shipmentId);

  if (error) throw error;
}

export async function addTrackingLog(
  shipmentId: string,
  lat: number,
  lng: number,
  eventType: string = 'location-update',
  locationName?: string
) {
  const { error } = await supabase.from('tracking_updates').insert({
    shipment_id: shipmentId,
    lat,
    lng,
    source: eventType,
    metadata: locationName ? { location_name: locationName } : undefined,
  });

  if (error) throw error;
}

export async function getInvoicesByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getNotificationsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('customer_id', customerId)
    .eq('is_read', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

// Realtime subscriptions
export function subscribeToShipmentUpdates(
  shipmentId: string,
  callback: (payload: unknown) => void
) {
  return supabase
    .channel(`shipment-${shipmentId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'shipments',
        filter: `id=eq.${shipmentId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToTrackingLogs(
  shipmentId: string,
  callback: (payload: unknown) => void
) {
  return supabase
    .channel(`tracking-${shipmentId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tracking_updates',
        filter: `shipment_id=eq.${shipmentId}`,
      },
      callback
    )
    .subscribe();
}
