import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Analytics } from './Analytics';
import { createMockShipment } from '@/test/mocks/data';

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user', email: 'test@example.com', role: 'customer', fullName: 'Test User' },
    profile: { id: 'test-user', role: 'customer', full_name: 'Test User' },
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    hasRole: vi.fn(() => true),
    isStaff: vi.fn(() => false),
    refreshProfile: vi.fn(),
  })),
  useRequireAuth: vi.fn(),
}));

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('Analytics View', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const setupMockShipments = (shipments: ReturnType<typeof createMockShipment>[]) => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: shipments, error: null }),
      }),
    } as unknown as ReturnType<typeof supabase.from>);
  };

  it('renders key metrics', async () => {
    setupMockShipments([
      createMockShipment({ id: '1', status: 'in_transit' }),
      createMockShipment({ id: '2', status: 'delivered' }),
    ]);

    render(<Analytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });
  });

  it('displays shipment statistics', async () => {
    setupMockShipments([
      createMockShipment({ id: '1', status: 'in_transit', weight_kg: 1000, volume_cbm: 10 }),
      createMockShipment({ id: '2', status: 'delivered', weight_kg: 2000, volume_cbm: 20 }),
      createMockShipment({ id: '3', status: 'exception', weight_kg: 500, volume_cbm: 5 }),
    ]);

    render(<Analytics />);
    
    await waitFor(() => {
      const metrics = screen.getAllByText(/\d+/);
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  it('switches between tabs', async () => {
    setupMockShipments([
      createMockShipment({ id: '1', status: 'in_transit' }),
      createMockShipment({ id: '2', status: 'delivered' }),
    ]);

    render(<Analytics />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /top routes/i })).toBeInTheDocument();
    });

    const routesTab = screen.getByRole('tab', { name: /top routes/i });
    fireEvent.click(routesTab);
    
    expect(screen.getByText('Top Routes')).toBeInTheDocument();
    
    const shipmentsTab = screen.getByRole('tab', { name: /active shipments/i });
    fireEvent.click(shipmentsTab);
    
    expect(screen.getByText('Active Shipments')).toBeInTheDocument();
  });

  it('displays overview tab by default', async () => {
    setupMockShipments([
      createMockShipment({ id: '1', status: 'in_transit' }),
      createMockShipment({ id: '2', status: 'delivered' }),
    ]);

    render(<Analytics />);
    
    await waitFor(() => {
      expect(screen.getByText('Cargo Volume')).toBeInTheDocument();
      expect(screen.getByText('Status Breakdown')).toBeInTheDocument();
    });
  });

  it('shows last updated date', async () => {
    setupMockShipments([
      createMockShipment({ id: '1', status: 'in_transit' }),
    ]);

    render(<Analytics />);
    
    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it('displays transport mode tab', async () => {
    setupMockShipments([
      createMockShipment({ id: '1', status: 'in_transit', transport_mode: 'ocean' }),
      createMockShipment({ id: '2', status: 'delivered', transport_mode: 'air' }),
    ]);

    render(<Analytics />);
    
    await waitFor(() => {
      const transportTab = screen.getByRole('tab', { name: /transport modes/i });
      expect(transportTab).toBeInTheDocument();
    });

    const transportTab = screen.getByRole('tab', { name: /transport modes/i });
    fireEvent.click(transportTab);
    expect(transportTab).toBeInTheDocument();
  });
});
