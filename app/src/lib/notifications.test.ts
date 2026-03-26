import { describe, it, expect, vi } from 'vitest';
import { 
  createStatusNotification,
  simulateNotification,
  simulateNotifications,
  NotificationManager,
  startNotificationSimulation
} from './notifications';
import type { StatusChangeEvent } from './notifications';

describe('Notification System', () => {
  describe('createStatusNotification', () => {
    it('creates status notification', () => {
      const event: StatusChangeEvent = {
        previousStatus: 'pending',
        newStatus: 'in_transit',
        shipmentId: 'ship-123',
        trackingNumber: 'NXS-TEST-001',
        timestamp: new Date().toISOString(),
        location: 'Shanghai',
      };

      const notification = createStatusNotification(event);

      expect(notification.type).toBe('status-update');
      expect(notification.title).toBe('Shipment In Transit');
      expect(notification.shipmentId).toBe('ship-123');
      expect(notification.trackingNumber).toBe('NXS-TEST-001');
      expect(notification.isRead).toBe(false);
    });

    it('creates customs notification', () => {
      const event: StatusChangeEvent = {
        previousStatus: 'in_transit',
        newStatus: 'customs',
        shipmentId: 'ship-123',
        trackingNumber: 'NXS-TEST-001',
        timestamp: new Date().toISOString(),
      };

      const notification = createStatusNotification(event);

      expect(notification.type).toBe('customs-hold');
      expect(notification.title).toBe('Customs Clearance');
    });

    it('creates delivered notification', () => {
      const event: StatusChangeEvent = {
        previousStatus: 'out_for_delivery',
        newStatus: 'delivered',
        shipmentId: 'ship-123',
        trackingNumber: 'NXS-TEST-001',
        timestamp: new Date().toISOString(),
        location: 'Los Angeles',
      };

      const notification = createStatusNotification(event);

      expect(notification.type).toBe('delivery-confirmation');
      expect(notification.title).toBe('Shipment Delivered');
    });

    it('creates exception notification', () => {
      const event: StatusChangeEvent = {
        previousStatus: 'in_transit',
        newStatus: 'exception',
        shipmentId: 'ship-123',
        trackingNumber: 'NXS-TEST-001',
        timestamp: new Date().toISOString(),
      };

      const notification = createStatusNotification(event);

      expect(notification.type).toBe('delay-alert');
      expect(notification.title).toBe('Shipment Exception');
    });
  });

  describe('simulateNotification', () => {
    it('simulates status-update notification', () => {
      const notification = simulateNotification('status-update', 'ship-123', 'NXS-TEST-001');

      expect(notification.type).toBe('status-update');
      expect(notification.shipmentId).toBe('ship-123');
      expect(notification.isRead).toBe(false);
    });

    it('simulates delay-alert notification', () => {
      const notification = simulateNotification('delay-alert', 'ship-123', 'NXS-TEST-001', { reason: 'Weather' });

      expect(notification.type).toBe('delay-alert');
      expect(notification.message).toContain('Weather');
    });

    it('simulates delivery-confirmation notification', () => {
      const notification = simulateNotification('delivery-confirmation', 'ship-123', 'NXS-TEST-001', { location: 'NYC' });

      expect(notification.type).toBe('delivery-confirmation');
      expect(notification.message).toContain('NYC');
    });

    it('simulates payment-due notification', () => {
      const notification = simulateNotification('payment-due', 'ship-123', 'NXS-TEST-001', { amount: 500.50 });

      expect(notification.type).toBe('payment-due');
      expect(notification.message).toContain('$500.50');
    });
  });

  describe('simulateNotifications', () => {
    it('generates specified count of notifications', () => {
      const notifications = simulateNotifications(5);

      expect(notifications.length).toBe(5);
    });

    it('generates notifications with various types', () => {
      const notifications = simulateNotifications(10);

      const types = new Set(notifications.map(n => n.type));
      expect(types.size).toBeGreaterThan(1);
    });

    it('sorts notifications by timestamp', () => {
      const notifications = simulateNotifications(5);

      for (let i = 1; i < notifications.length; i++) {
        expect(new Date(notifications[i - 1].timestamp).getTime()).toBeGreaterThanOrEqual(
          new Date(notifications[i].timestamp).getTime()
        );
      }
    });
  });

  describe('NotificationManager', () => {
    it('adds notification', () => {
      const manager = new NotificationManager();
      const notification = simulateNotification('status-update', 'ship-1', 'NXS-001');

      manager.add(notification);

      expect(manager.getAll().length).toBe(1);
    });

    it('marks notification as read', () => {
      const manager = new NotificationManager();
      const notification = simulateNotification('status-update', 'ship-1', 'NXS-001');
      
      manager.add(notification);
      manager.markAsRead(notification.id);

      const unread = manager.getUnread();
      expect(unread.length).toBe(0);
    });

    it('marks all notifications as read', () => {
      const manager = new NotificationManager();
      
      manager.add(simulateNotification('status-update', 'ship-1', 'NXS-001'));
      manager.add(simulateNotification('delay-alert', 'ship-2', 'NXS-002'));
      
      manager.markAllAsRead();

      expect(manager.getUnreadCount()).toBe(0);
    });

    it('removes notification', () => {
      const manager = new NotificationManager();
      const notification = simulateNotification('status-update', 'ship-1', 'NXS-001');
      
      manager.add(notification);
      manager.remove(notification.id);

      expect(manager.getAll().length).toBe(0);
    });

    it('clears all notifications', () => {
      const manager = new NotificationManager();
      
      manager.add(simulateNotification('status-update', 'ship-1', 'NXS-001'));
      manager.add(simulateNotification('delay-alert', 'ship-2', 'NXS-002'));
      
      manager.clear();

      expect(manager.getAll().length).toBe(0);
    });

    it('filters by type', () => {
      const manager = new NotificationManager();
      
      manager.add(simulateNotification('status-update', 'ship-1', 'NXS-001'));
      manager.add(simulateNotification('delay-alert', 'ship-2', 'NXS-002'));
      manager.add(simulateNotification('status-update', 'ship-3', 'NXS-003'));

      const statusUpdates = manager.getByType('status-update');
      expect(statusUpdates.length).toBe(2);
    });

    it('limits max notifications', () => {
      const manager = new NotificationManager(3);
      
      for (let i = 0; i < 5; i++) {
        manager.add(simulateNotification('status-update', `ship-${i}`, `NXS-00${i}`));
      }

      expect(manager.getAll().length).toBe(3);
    });

    it('notifies listeners on change', () => {
      const manager = new NotificationManager();
      const listener = vi.fn();
      
      const unsubscribe = manager.subscribe(listener);
      manager.add(simulateNotification('status-update', 'ship-1', 'NXS-001'));

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('stops notifying after unsubscribe', () => {
      const manager = new NotificationManager();
      const listener = vi.fn();
      
      const unsubscribe = manager.subscribe(listener);
      unsubscribe();
      
      listener.mockClear();
      
      manager.add(simulateNotification('status-update', 'ship-1', 'NXS-001'));

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('startNotificationSimulation', () => {
    it('returns cleanup function', () => {
      const cleanup = startNotificationSimulation(1000);

      expect(typeof cleanup).toBe('function');
      
      cleanup();
    });
  });
});
