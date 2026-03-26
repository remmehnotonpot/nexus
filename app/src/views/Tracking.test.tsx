import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Tracking from './Tracking';

// Mock Supabase - must be defined inside vi.mock due to hoisting
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'demo-shipment-id',
              tracking_number: 'NXS-DEMO-001',
              status: 'in-transit',
              origin: { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China' },
              destination: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' },
              current: { lat: 35.0, lng: 140.0, heading: 45 },
              current_lat: 35.0,
              current_lng: 140.0,
              current_heading: 45,
              transport_mode: 'ocean',
              is_live_demo: true,
              estimated_arrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              weight_kg: 15000,
              volume_cbm: 45.5,
              goods_description: 'Electronics - Consumer Goods',
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              tracking_logs: [
                {
                  id: '1',
                  shipment_id: 'demo-shipment-id',
                  lat: 31.2304,
                  lng: 121.4737,
                  timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                  location_name: 'Shanghai Port, China',
                  event_type: 'departure',
                },
              ],
            },
            error: null,
          }),
        })),
      })),
    })),
    channel: vi.fn(() => {
      const mockChannel = {
        on: vi.fn(() => mockChannel),
        subscribe: vi.fn(() => mockChannel),
        unsubscribe: vi.fn(),
      };
      return mockChannel;
    }),
    removeChannel: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock TrackingMap
vi.mock('@/components/TrackingMap', () => ({
  TrackingMap: () => <div data-testid="mock-tracking-map">Map</div>,
}));

// Mock TransportMarker
vi.mock('@/components/TransportMarker', () => ({
  StatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
  LiveBadge: () => <span data-testid="live-badge">LIVE</span>,
}));

describe('Tracking View', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tracking interface', () => {
    render(<Tracking />);
    
    expect(screen.getByText('Track Your Shipment')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter tracking number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /track/i })).toBeInTheDocument();
  });

  it('handles tracking number search', async () => {
    render(<Tracking />);
    
    const input = screen.getByPlaceholderText('Enter tracking number');
    const trackButton = screen.getByRole('button', { name: /track/i });
    
    fireEvent.change(input, { target: { value: 'NXS-DEMO-001' } });
    fireEvent.click(trackButton);
    
    await waitFor(() => {
      expect(input).toHaveValue('NXS-DEMO-001');
    });
  });

  it('shows empty state when no tracking number provided', () => {
    render(<Tracking />);
    
    expect(screen.getByText('Enter a Tracking Number')).toBeInTheDocument();
  });

  it('shows demo tracking numbers', () => {
    render(<Tracking />);
    
    expect(screen.getByText('NXS-DEMO-001')).toBeInTheDocument();
    expect(screen.getByText('NXS-78439201')).toBeInTheDocument();
    expect(screen.getByText('NXS-12345678')).toBeInTheDocument();
  });

  it('displays shipment when initialTrackingId is provided', async () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    await waitFor(() => {
      expect(document.body.textContent).toContain('NXS-DEMO-001');
    });
  });

  it('shows shipment status badge', async () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/in-transit|in transit/i);
    });
  });

  it('displays origin and destination', async () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Origin')).toBeInTheDocument();
      expect(screen.getByText('Destination')).toBeInTheDocument();
    });
  });

  it('shows tracking history', async () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Tracking History')).toBeInTheDocument();
    });
  });

  it('displays estimated arrival', async () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Estimated Arrival')).toBeInTheDocument();
    });
  });

  it('allows showing shipment details', async () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    await waitFor(() => {
      expect(screen.getByText('NXS-DEMO-001')).toBeInTheDocument();
    });
    
    const detailsButton = screen.getByRole('button', { name: /shipment details/i });
    expect(detailsButton).toBeInTheDocument();
    
    fireEvent.click(detailsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Weight')).toBeInTheDocument();
      expect(screen.getByText('Volume')).toBeInTheDocument();
    });
  });

  it('shows connection status', async () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    await waitFor(() => {
      expect(screen.getByText('Connection')).toBeInTheDocument();
    });
  });
});
