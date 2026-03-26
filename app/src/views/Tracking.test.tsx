import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Tracking from './Tracking';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/components/TrackingMap', () => ({
  TrackingMap: () => <div data-testid="mock-tracking-map">Map</div>,
}));

describe('Tracking View', () => {
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

  it('displays shipment when initialTrackingId is provided', () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    expect(document.body.textContent).toContain('NXS-DEMO-001');
  });

  it('shows shipment status badge', () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    expect(document.body.textContent).toMatch(/in transit|In Transit/i);
  });

  it('displays origin and destination', () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    expect(screen.getByText('Origin')).toBeInTheDocument();
    expect(screen.getByText('Destination')).toBeInTheDocument();
  });

  it('shows tracking history', () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    expect(screen.getByText('Tracking History')).toBeInTheDocument();
  });

  it('displays estimated arrival', () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    expect(screen.getByText('Estimated Arrival')).toBeInTheDocument();
  });

  it('allows showing shipment details', () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    const detailsButton = screen.getByRole('button', { name: /shipment details/i });
    expect(detailsButton).toBeInTheDocument();
    
    fireEvent.click(detailsButton);
    
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('shows live badge for live shipments', () => {
    render(<Tracking initialTrackingId="NXS-DEMO-001" />);
    
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });
});
