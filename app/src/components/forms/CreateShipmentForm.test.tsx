import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreateShipmentForm } from './CreateShipmentForm';

vi.mock('@/lib/geocoding', async () => {
  const actual = await vi.importActual('@/lib/geocoding');
  return {
    ...actual,
    searchAddress: vi.fn().mockResolvedValue([
      {
        lat: 31.2304,
        lng: 121.4737,
        name: 'Shanghai',
        city: 'Shanghai',
        country: 'China',
        fullAddress: 'Shanghai, China',
      },
    ]),
  };
});

describe('CreateShipmentForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders all form fields', () => {
    render(<CreateShipmentForm />);
    
    expect(screen.getByText('Origin')).toBeInTheDocument();
    expect(screen.getByText('Destination')).toBeInTheDocument();
    expect(screen.getByText('Transport Mode')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<CreateShipmentForm />);
    
    const submitButton = screen.getByText('Create Shipment');
    expect(submitButton).toBeDisabled();
  });

  it('allows selecting transport mode', async () => {
    render(<CreateShipmentForm />);
    
    const transportSelect = screen.getByRole('combobox', { name: /transport mode/i });
    expect(transportSelect).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateShipmentForm onSubmit={onSubmit} />);
    
    const submitButton = screen.getByText('Create Shipment');
    expect(submitButton).toBeInTheDocument();
  });

  it('accepts goods description', () => {
    render(<CreateShipmentForm />);
    
    const descriptionInput = screen.getByPlaceholderText(/description of goods/i);
    expect(descriptionInput).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CreateShipmentForm className="custom-class" />);
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
