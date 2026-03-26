import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimulationController } from './SimulationController';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-shipment-id' }, error: null }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      })),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('SimulationController', () => {
  it('renders controller UI', () => {
    render(<SimulationController />);
    
    expect(screen.getByText('Simulation Control')).toBeInTheDocument();
    expect(screen.getByText('Select Route')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<SimulationController variant="compact" />);
    
    expect(screen.getByText('Simulation Control')).toBeInTheDocument();
  });

  it('shows create button disabled when no path selected', () => {
    render(<SimulationController />);
    
    const createButton = screen.getByText('Create & Start');
    expect(createButton).toBeDisabled();
  });
});
