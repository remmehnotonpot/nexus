import type { Shipment, TrackingLog, Invoice, TransportMode, ShipmentStatus } from '@/types';

export const createMockShipment = (overrides?: Partial<Shipment>): Shipment => ({
  id: 'test-id-1',
  tracking_number: 'NXS-TEST-001',
  status: 'in-transit' as ShipmentStatus,
  origin: { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China' },
  destination: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' },
  current: { lat: 35, lng: 140, heading: 45 },
  current_lat: 35,
  current_lng: 140,
  current_heading: 45,
  transport_mode: 'ocean' as TransportMode,
  is_live_demo: false,
  estimated_arrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  weight_kg: 15000,
  volume_cbm: 45.5,
  ...overrides,
});

export const createMockTrackingLog = (overrides?: Partial<TrackingLog>): TrackingLog => ({
  id: 'log-id-1',
  shipment_id: 'test-id-1',
  lat: 35,
  lng: 140,
  timestamp: new Date().toISOString(),
  event_type: 'location-update',
  ...overrides,
});

export const createMockInvoice = (overrides?: Partial<Invoice>): Invoice => ({
  id: 'inv-id-1',
  invoice_number: 'INV-001',
  customer_id: 'cust-id-1',
  amount: 1000,
  currency: 'USD',
  status: 'sent',
  issue_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  ...overrides,
});

export const mockShipments: Shipment[] = [
  createMockShipment(),
  createMockShipment({
    id: 'test-id-2',
    tracking_number: 'NXS-TEST-002',
    status: 'delivered',
    transport_mode: 'air',
  }),
  createMockShipment({
    id: 'test-id-3',
    tracking_number: 'NXS-TEST-003',
    status: 'delayed',
    transport_mode: 'road',
  }),
];
