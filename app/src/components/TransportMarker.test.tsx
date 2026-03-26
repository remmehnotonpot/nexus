import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransportMarker, LiveBadge, StatusBadge } from './TransportMarker';

describe('TransportMarker', () => {
  it('renders correct transport icon for air', () => {
    const { container } = render(<TransportMarker mode="air" heading={0} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders correct transport icon for ocean', () => {
    const { container } = render(<TransportMarker mode="ocean" heading={0} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders correct transport icon for road', () => {
    const { container } = render(<TransportMarker mode="road" heading={0} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders correct transport icon for rail', () => {
    const { container } = render(<TransportMarker mode="rail" heading={0} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies heading rotation', () => {
    const { container } = render(<TransportMarker mode="air" heading={45} />);
    const markerDiv = container.firstChild as HTMLElement;
    expect(markerDiv.style.transform).toContain('rotate(45deg)');
  });

  it('applies size prop', () => {
    const { container } = render(<TransportMarker mode="air" heading={0} size={60} />);
    const markerDiv = container.firstChild as HTMLElement;
    expect(markerDiv.style.width).toBe('60px');
    expect(markerDiv.style.height).toBe('60px');
  });

  it('displays status badge for air mode', () => {
    const { container } = render(<TransportMarker mode="air" heading={0} />);
    expect(container.firstChild).toHaveClass('text-blue-500');
  });

  it('shows live indicator', () => {
    const { container } = render(<TransportMarker mode="air" heading={0} />);
    const pulseRing = container.querySelector('.animate-ping');
    expect(pulseRing).toBeInTheDocument();
  });
});

describe('LiveBadge', () => {
  it('renders live badge', () => {
    render(<LiveBadge />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('has pulse animation', () => {
    const { container } = render(<LiveBadge />);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-red-500');
  });
});

describe('StatusBadge', () => {
  it('renders pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders in-transit status', () => {
    render(<StatusBadge status="in-transit" />);
    expect(screen.getByText('In Transit')).toBeInTheDocument();
  });

  it('renders delivered status', () => {
    render(<StatusBadge status="delivered" />);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('renders delayed status', () => {
    render(<StatusBadge status="delayed" />);
    expect(screen.getByText('Delayed')).toBeInTheDocument();
  });

  it('applies correct color for pending', () => {
    const { container } = render(<StatusBadge status="pending" />);
    expect(container.firstChild).toHaveClass('bg-yellow-500');
  });

  it('applies correct color for delivered', () => {
    const { container } = render(<StatusBadge status="delivered" />);
    expect(container.firstChild).toHaveClass('bg-green-500');
  });

  it('applies correct color for delayed', () => {
    const { container } = render(<StatusBadge status="delayed" />);
    expect(container.firstChild).toHaveClass('bg-red-500');
  });
});
