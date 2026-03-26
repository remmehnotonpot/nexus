import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Analytics } from './Analytics';

describe('Analytics View', () => {
  it('renders key metrics', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('displays shipment statistics', () => {
    render(<Analytics />);
    
    const metrics = screen.getAllByText(/\d+/);
    expect(metrics.length).toBeGreaterThan(0);
  });

  it('switches between tabs', () => {
    render(<Analytics />);
    
    const routesTab = screen.getByRole('tab', { name: /top routes/i });
    fireEvent.click(routesTab);
    
    expect(screen.getByText('Top Routes')).toBeInTheDocument();
    
    const shipmentsTab = screen.getByRole('tab', { name: /active shipments/i });
    fireEvent.click(shipmentsTab);
    
    expect(screen.getByText('Active Shipments')).toBeInTheDocument();
  });

  it('displays overview tab by default', () => {
    render(<Analytics />);
    
    expect(screen.getByText('Cargo Volume')).toBeInTheDocument();
    expect(screen.getByText('Status Breakdown')).toBeInTheDocument();
  });

  it('shows last updated date', () => {
    render(<Analytics />);
    
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('displays transport mode tab', () => {
    render(<Analytics />);
    
    const transportTab = screen.getByRole('tab', { name: /transport modes/i });
    expect(transportTab).toBeInTheDocument();
    
    fireEvent.click(transportTab);
    expect(transportTab).toBeInTheDocument();
  });
});
