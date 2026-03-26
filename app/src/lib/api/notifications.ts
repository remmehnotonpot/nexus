/**
 * Notifications API Layer
 * Database operations for notifications with Supabase
 */

import { supabase } from '@/lib/supabase';
import { DatabaseError } from '@/lib/errors';
import type { Tables, TablesInsert } from '@/types';

export type Notification = Tables<'notifications'>;
export type CreateNotificationInput = TablesInsert<'notifications'>;

/**
 * Get notifications for a customer
 */
export async function getCustomerNotifications(
  customerId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Notification[]; count: number }> {
  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('is_read', false);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError(`Failed to fetch notifications: ${error.message}`);
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(customerId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .eq('is_read', false);

  if (error) {
    throw new DatabaseError(`Failed to get unread count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Failed to mark notification as read: ${error.message}`);
  }

  return data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(customerId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('customer_id', customerId)
    .eq('is_read', false);

  if (error) {
    throw new DatabaseError(`Failed to mark all notifications as read: ${error.message}`);
  }
}

/**
 * Create a notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Failed to create notification: ${error.message}`);
  }

  return data;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    throw new DatabaseError(`Failed to delete notification: ${error.message}`);
  }
}

/**
 * Send notification for shipment status change
 */
export async function sendStatusChangeNotification(
  customerId: string,
  shipmentId: string,
  trackingNumber: string,
  newStatus: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _previousStatus?: string
): Promise<Notification> {
  const statusMessages: Record<string, { title: string; message: string; type: string }> = {
    pending: {
      title: 'Shipment Created',
      message: `Your shipment ${trackingNumber} has been created and is awaiting pickup.`,
      type: 'status_update',
    },
    in_transit: {
      title: 'Shipment In Transit',
      message: `Your shipment ${trackingNumber} is now in transit.`,
      type: 'status_update',
    },
    customs: {
      title: 'Customs Clearance',
      message: `Your shipment ${trackingNumber} is undergoing customs clearance.`,
      type: 'customs_hold',
    },
    out_for_delivery: {
      title: 'Out for Delivery',
      message: `Your shipment ${trackingNumber} is out for delivery today!`,
      type: 'status_update',
    },
    delivered: {
      title: 'Shipment Delivered',
      message: `Your shipment ${trackingNumber} has been successfully delivered.`,
      type: 'delivery_confirmation',
    },
    exception: {
      title: 'Shipment Exception',
      message: `Your shipment ${trackingNumber} has an exception. Please check tracking details.`,
      type: 'delay_alert',
    },
  };

  const config = statusMessages[newStatus] || {
    title: 'Status Update',
    message: `Your shipment ${trackingNumber} status has been updated to ${newStatus}.`,
    type: 'status_update',
  };

  return createNotification({
    customer_id: customerId,
    shipment_id: shipmentId,
    title: config.title,
    message: config.message,
    type: config.type,
    is_read: false,
  });
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  customerId: string,
  callback: (payload: { new: Notification }) => void
) {
  return supabase
    .channel(`notifications-${customerId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `customer_id=eq.${customerId}`,
      },
      (payload) => callback(payload as unknown as { new: Notification })
    )
    .subscribe();
}
