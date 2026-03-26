import type { Shipment, TrackingLog, Invoice, TransportMode, ShipmentStatus } from '@/types';

export const createMockShipment = (overrides?: Partial<Shipment>): Shipment => {
  const base: Shipment = {
    id: 'test-id-1',
    tracking_number: 'NXS-TEST-001',
    status: 'in_transit',
    origin_address: { street: '', city: 'Shanghai', country: 'China' },
    destination_address: { street: '', city: 'Los Angeles', country: 'USA' },
    origin_lat: 31.2304,
    origin_lng: 121.4737,
    destination_lat: 34.0522,
    destination_lng: -118.2437,
    current_lat: 35,
    current_lng: 140,
    current_heading: 45,
    transport_mode: 'ocean',
    weight_kg: 15000,
    volume_cbm: 45.5,
    delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Additional fields required by new schema - explicitly set to null
    additional_charges: null,
    assigned_driver_id: null,
    assigned_vehicle_id: null,
    base_rate: null,
    cargo_description: null,
    cargo_type: null,
    created_by: null,
    currency: null,
    customer_id: null,
    declared_value: null,
    estimated_transit_days: null,
    fuel_surcharge: null,
    pickup_date: null,
    pieces: null,
    service_type: null,
    sub_status: null,
    total_amount: null,
    updated_by: null,
  };
  return { ...base, ...overrides };
};

export const createMockTrackingLog = (overrides?: Partial<TrackingLog>): TrackingLog => {
  const base: TrackingLog = {
    id: 'log-id-1',
    shipment_id: 'test-id-1',
    lat: 35,
    lng: 140,
    timestamp: new Date().toISOString(),
    event_type: 'location-update',
  };
  return { ...base, ...overrides };
};

export const createMockInvoice = (overrides?: Partial<Invoice>): Invoice => {
  const base: Invoice = {
    id: 'inv-id-1',
    invoice_number: 'INV-001',
    customer_id: null,
    shipment_id: null,
    amount: 1000,
    total_amount: 1000,
    currency: 'USD',
    status: 'sent',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: null,
    paid_date: null,
    notes: null,
    created_at: new Date().toISOString(),
    created_by: null,
    payment_method: null,
    payment_reference: null,
    tax_amount: null,
  };
  return { ...base, ...overrides };
};

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
    status: 'exception',
    transport_mode: 'road',
  }),
];
