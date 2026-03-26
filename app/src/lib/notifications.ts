/**
 * Notifications System
 * Simulated status change alerts and notifications
 */

import type { ShipmentStatus, NotificationType } from '@/types';

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  shipmentId?: string;
  trackingNumber?: string;
  timestamp: Date;
  isRead: boolean;
}

export interface StatusChangeEvent {
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  shipmentId: string;
  trackingNumber: string;
  timestamp: Date;
  location?: string;
  details?: string;
}

// Status transition messages
const STATUS_MESSAGES: Record<ShipmentStatus, { 
  title: string; 
  message: (trackingNumber: string, location?: string) => string;
  type: NotificationType;
}> = {
  pending: {
    title: 'Shipment Created',
    message: (tn) => `Shipment ${tn} has been created and is awaiting pickup.`,
    type: 'status-update',
  },
  'in-transit': {
    title: 'Shipment In Transit',
    message: (tn, loc) => `Shipment ${tn} is now in transit${loc ? ` near ${loc}` : ''}.`,
    type: 'status-update',
  },
  customs: {
    title: 'Customs Clearance',
    message: (tn, loc) => `Shipment ${tn} is undergoing customs clearance${loc ? ` at ${loc}` : ''}.`,
    type: 'customs-hold',
  },
  'out-for-delivery': {
    title: 'Out for Delivery',
    message: (tn, loc) => `Shipment ${tn} is out for delivery${loc ? ` in ${loc}` : ''}!`,
    type: 'status-update',
  },
  delivered: {
    title: 'Shipment Delivered',
    message: (tn, loc) => `Shipment ${tn} has been successfully delivered${loc ? ` to ${loc}` : ''}.`,
    type: 'delivery-confirmation',
  },
  delayed: {
    title: 'Shipment Delayed',
    message: (tn) => `Shipment ${tn} has been delayed. Please check tracking details for more information.`,
    type: 'delay-alert',
  },
};

/**
 * Generate a unique notification ID
 */
function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a notification from a status change event
 */
export function createStatusNotification(
  event: StatusChangeEvent
): NotificationPayload {
  const config = STATUS_MESSAGES[event.newStatus];
  
  return {
    id: generateNotificationId(),
    type: config.type,
    title: config.title,
    message: config.message(event.trackingNumber, event.location),
    shipmentId: event.shipmentId,
    trackingNumber: event.trackingNumber,
    timestamp: event.timestamp,
    isRead: false,
  };
}

/**
 * Simulate a notification for demo purposes
 */
export function simulateNotification(
  type: NotificationType,
  shipmentId: string,
  trackingNumber: string,
  details?: { location?: string; reason?: string; amount?: number }
): NotificationPayload {
  const notifications: Record<NotificationType, Omit<NotificationPayload, 'id' | 'timestamp' | 'isRead'>> = {
    'status-update': {
      type: 'status-update',
      title: 'Status Update',
      message: `Shipment ${trackingNumber} status has been updated.`,
      shipmentId,
      trackingNumber,
    },
    'delay-alert': {
      type: 'delay-alert',
      title: 'Delay Alert',
      message: `Shipment ${trackingNumber} is experiencing delays${details?.reason ? `: ${details.reason}` : '.'}`,
      shipmentId,
      trackingNumber,
    },
    'delivery-confirmation': {
      type: 'delivery-confirmation',
      title: 'Delivery Confirmed',
      message: `Shipment ${trackingNumber} has been delivered${details?.location ? ` to ${details.location}` : ''}.`,
      shipmentId,
      trackingNumber,
    },
    'customs-hold': {
      type: 'customs-hold',
      title: 'Customs Hold',
      message: `Shipment ${trackingNumber} is being held at customs${details?.location ? ` in ${details.location}` : ''}. Additional documentation may be required.`,
      shipmentId,
      trackingNumber,
    },
    'payment-due': {
      type: 'payment-due',
      title: 'Payment Due',
      message: `Payment of $${details?.amount?.toFixed(2) || '0.00'} is due for shipment ${trackingNumber}.`,
      shipmentId,
      trackingNumber,
    },
  };

  const base = notifications[type];
  
  return {
    ...base,
    id: generateNotificationId(),
    timestamp: new Date(),
    isRead: false,
  };
}

/**
 * Simulate multiple notifications for demo purposes
 */
export function simulateNotifications(count: number = 5): NotificationPayload[] {
  const types: NotificationType[] = [
    'status-update',
    'delay-alert',
    'delivery-confirmation',
    'customs-hold',
    'payment-due',
  ];
  
  const trackingNumbers = [
    'NXS-DEMO-001',
    'NXS-ABC-123',
    'NXS-XYZ-789',
    'NXS-TEST-456',
    'NXS-SHIP-999',
  ];

  const notifications: NotificationPayload[] = [];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const trackingNumber = trackingNumbers[Math.floor(Math.random() * trackingNumbers.length)];
    const shipmentId = `ship-${Math.random().toString(36).substr(2, 9)}`;
    
    notifications.push(
      simulateNotification(type, shipmentId, trackingNumber, {
        location: ['Shanghai', 'Los Angeles', 'Rotterdam', 'Dubai'][Math.floor(Math.random() * 4)],
        reason: ['Weather conditions', 'Port congestion', 'Customs inspection'][Math.floor(Math.random() * 3)],
        amount: Math.random() * 1000 + 100,
      })
    );
  }

  // Sort by timestamp, most recent first
  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Notification manager for handling notification state
 */
export class NotificationManager {
  private notifications: NotificationPayload[] = [];
  private listeners: ((notifications: NotificationPayload[]) => void)[] = [];
  private maxNotifications: number;

  constructor(maxNotifications: number = 100) {
    this.maxNotifications = maxNotifications;
  }

  /**
   * Add a notification
   */
  add(notification: NotificationPayload): void {
    this.notifications.unshift(notification);
    
    // Keep only the most recent notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }
    
    this.notifyListeners();
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      this.notifyListeners();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.notifyListeners();
  }

  /**
   * Remove a notification
   */
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get all notifications
   */
  getAll(): NotificationPayload[] {
    return [...this.notifications];
  }

  /**
   * Get unread notifications
   */
  getUnread(): NotificationPayload[] {
    return this.notifications.filter(n => !n.isRead);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  /**
   * Get notifications by type
   */
  getByType(type: NotificationType): NotificationPayload[] {
    return this.notifications.filter(n => n.type === type);
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: NotificationPayload[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

/**
 * Simulate real-time notifications (for demo purposes)
 */
export function startNotificationSimulation(
  intervalMs: number = 30000,
  onNotification?: (notification: NotificationPayload) => void
): () => void {
  const interval = setInterval(() => {
    if (Math.random() > 0.7) { // 30% chance to generate notification
      const notification = simulateNotification(
        ['status-update', 'delay-alert', 'delivery-confirmation'][Math.floor(Math.random() * 3)] as NotificationType,
        `ship-${Math.random().toString(36).substr(2, 9)}`,
        `NXS-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Math.floor(Math.random() * 999)}`
      );
      
      notificationManager.add(notification);
      onNotification?.(notification);
    }
  }, intervalMs);

  return () => clearInterval(interval);
}
