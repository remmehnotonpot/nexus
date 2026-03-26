# Swish Portal - Testing Implementation Plan

## Overview

This document outlines the comprehensive testing strategy for Swish Portal to achieve the 46-test target specified in the architecture documentation. The testing infrastructure will use **Vitest** with **React Testing Library** for unit and integration tests.

---

## Testing Infrastructure Setup

### 1. Dependencies to Install

```bash
# Core testing framework
npm install -D vitest @vitest/ui

# React Testing Library
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Test environment
npm install -D jsdom

# Mocking utilities
npm install -D @faker-js/faker msw
```

### 2. Configuration Files

#### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### `src/test/setup.ts`
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverMock,
});
```

### 3. Package.json Scripts Update

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

---

## Test File Structure

```
src/
├── test/
│   ├── setup.ts                 # Test setup and global mocks
│   ├── mocks/
│   │   ├── supabase.ts          # Supabase client mock
│   │   ├── maplibre.ts          # MapLibre GL mock
│   │   └── data.ts              # Mock data factories
│   └── utils.tsx                # Test utilities (render with providers)
│
├── lib/
│   ├── schemas/
│   │   ├── shipment.test.ts     # Schema validation tests (3 tests)
│   │   ├── invoice.test.ts      # Schema validation tests (3 tests)
│   │   └── user.test.ts         # Schema validation tests (4 tests)
│   ├── api/
│   │   ├── shipments.test.ts    # API functions tests (6 tests)
│   │   └── invoices.test.ts     # API functions tests (4 tests)
│   ├── errors.test.ts           # Error handling tests (4 tests)
│   ├── eta.test.ts              # ETA calculation tests (5 tests)
│   ├── geocoding.test.ts        # Geocoding utility tests (4 tests)
│   └── notifications.test.ts    # Notification system tests (3 tests)
│
├── hooks/
│   ├── useSimulation.test.ts    # Simulation hook tests (5 tests)
│   ├── useLiveShipment.test.ts  # Live shipment hook tests (4 tests)
│   └── useTheme.test.ts         # Theme hook tests (3 tests)
│
├── components/
│   ├── ui/                      # shadcn/ui components (assumed tested by library)
│   ├── forms/
│   │   └── CreateShipmentForm.test.tsx  # Form tests (4 tests)
│   ├── SimulationController.test.tsx     # Controller tests (3 tests)
│   └── TransportMarker.test.tsx          # Marker tests (3 tests)
│
└── views/
    ├── Analytics.test.tsx       # Analytics view tests (3 tests)
    └── Tracking.test.tsx        # Tracking view tests (2 tests)

Total: 46 tests
```

---

## Detailed Test Specifications

### Schema Tests (10 tests)

#### `src/lib/schemas/shipment.test.ts` (3 tests)

```typescript
import { describe, it, expect } from 'vitest';
import { createShipmentSchema, updateShipmentSchema, trackingLogSchema } from './shipment';

describe('Shipment Schemas', () => {
  describe('createShipmentSchema', () => {
    it('validates valid shipment data', () => {
      // Test implementation
    });

    it('rejects missing required fields', () => {
      // Test implementation
    });

    it('validates coordinate ranges', () => {
      // Test implementation
    });
  });
});
```

#### `src/lib/schemas/invoice.test.ts` (3 tests)
- Validates invoice creation
- Validates status transitions
- Validates amount constraints

#### `src/lib/schemas/user.test.ts` (4 tests)
- Validates user registration
- Validates password strength
- Validates email format
- Validates profile updates

### API Tests (10 tests)

#### `src/lib/api/shipments.test.ts` (6 tests)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getShipmentByTrackingNumber, updateShipmentLocation } from './shipments';
import { mockSupabase } from '@/test/mocks/supabase';

describe('Shipments API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches shipment by tracking number', async () => {});
  it('returns null for non-existent tracking number', async () => {});
  it('fetches shipments by customer', async () => {});
  it('updates shipment location', async () => {});
  it('handles update errors', async () => {});
  it('subscribes to real-time updates', () => {});
});
```

#### `src/lib/api/invoices.test.ts` (4 tests)
- Fetches invoices by customer
- Fetches invoice by ID
- Updates invoice status
- Calculates total amount due

### Utility Tests (17 tests)

#### `src/lib/errors.test.ts` (4 tests)

```typescript
import { describe, it, expect } from 'vitest';
import { ApiError, NotFoundError, ValidationError, handleError } from './errors';

describe('Error Handling', () => {
  it('creates ApiError with correct properties', () => {});
  it('creates NotFoundError with 404 status', () => {});
  it('creates ValidationError with 400 status', () => {});
  it('handles unknown errors gracefully', () => {});
});
```

#### `src/lib/eta.test.ts` (5 tests)
- Calculates ETA correctly
- Detects delays
- Formats remaining time
- Calculates progress percentage
- Provides delay severity

#### `src/lib/geocoding.test.ts` (4 tests)
- Searches addresses via Photon API
- Reverse geocodes coordinates
- Calculates distance accurately
- Formats addresses correctly

#### `src/lib/notifications.test.ts` (3 tests)
- Creates status notifications
- Manages notification state
- Simulates notifications

### Hook Tests (12 tests)

#### `src/hooks/useSimulation.test.ts` (5 tests)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSimulation } from './useSimulation';

describe('useSimulation', () => {
  it('initializes with correct default state', () => {});
  it('selects a path', () => {});
  it('starts simulation', () => {});
  it('pauses and resumes simulation', () => {});
  it('resets simulation', () => {});
});
```

#### `src/hooks/useLiveShipment.test.ts` (4 tests)
- Creates shipment in Supabase
- Updates shipment location
- Batches tracking logs
- Handles sync status

#### `src/hooks/useTheme.test.ts` (3 tests)
- Detects system theme
- Toggles theme
- Persists theme preference

### Component Tests (10 tests)

#### `src/components/forms/CreateShipmentForm.test.tsx` (4 tests)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateShipmentForm } from './CreateShipmentForm';

describe('CreateShipmentForm', () => {
  it('renders all form fields', () => {});
  it('validates required fields', async () => {});
  it('submits form with valid data', async () => {});
  it('displays calculated ETA', () => {});
});
```

#### `src/components/SimulationController.test.tsx` (3 tests)
- Renders controller UI
- Handles speed multiplier change
- Displays sync status

#### `src/components/TransportMarker.test.tsx` (3 tests)
- Renders correct transport icon
- Displays status badge
- Shows live indicator

### View Tests (5 tests)

#### `src/views/Analytics.test.tsx` (3 tests)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Analytics from './Analytics';

describe('Analytics View', () => {
  it('renders key metrics', () => {});
  it('displays shipment statistics', () => {});
  it('switches between tabs', () => {});
});
```

#### `src/views/Tracking.test.tsx` (2 tests)
- Renders tracking interface
- Handles tracking number search

---

## Mock Data Factories

### `src/test/mocks/data.ts`

```typescript
import type { Shipment, TrackingLog, Invoice, TransportMode } from '@/types';

export const createMockShipment = (overrides?: Partial<Shipment>): Shipment => ({
  id: 'test-id',
  tracking_number: 'NXS-TEST-001',
  status: 'in-transit',
  origin: { lat: 0, lng: 0, city: 'Test Origin', country: 'Test' },
  destination: { lat: 10, lng: 10, city: 'Test Destination', country: 'Test' },
  current: { lat: 5, lng: 5, heading: 45 },
  transport_mode: 'ocean' as TransportMode,
  is_live_demo: false,
  estimated_arrival: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockTrackingLog = (overrides?: Partial<TrackingLog>): TrackingLog => ({
  id: 'log-id',
  shipment_id: 'test-id',
  lat: 5,
  lng: 5,
  timestamp: new Date().toISOString(),
  event_type: 'location-update',
  ...overrides,
});

export const createMockInvoice = (overrides?: Partial<Invoice>): Invoice => ({
  id: 'inv-id',
  invoice_number: 'INV-001',
  customer_id: 'cust-id',
  amount: 1000,
  currency: 'USD',
  status: 'sent',
  issue_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  ...overrides,
});
```

### `src/test/mocks/supabase.ts`

```typescript
import { vi } from 'vitest';

export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
    })),
  })),
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));
```

### `src/test/mocks/maplibre.ts`

```typescript
import { vi } from 'vitest';

export const mockMapLibre = {
  Map: vi.fn(() => ({
    on: vi.fn(),
    addControl: vi.fn(),
    remove: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    getSource: vi.fn(() => ({
      setData: vi.fn(),
    })),
    fitBounds: vi.fn(),
    flyTo: vi.fn(),
    setStyle: vi.fn(),
    panTo: vi.fn(),
  })),
  Marker: vi.fn(() => ({
    setLngLat: vi.fn(() => ({
      setRotation: vi.fn(() => ({
        addTo: vi.fn(),
      })),
    })),
    remove: vi.fn(),
  })),
  NavigationControl: vi.fn(),
  FullscreenControl: vi.fn(),
  LngLatBounds: vi.fn(() => ({
    extend: vi.fn(),
  })),
  GeoJSONSource: vi.fn(),
};

vi.mock('maplibre-gl', () => mockMapLibre);
```

---

## Test Utilities

### `src/test/utils.tsx`

```typescript
import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

interface ProvidersProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      {children}
    </ThemeProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: AllTheProviders });
}
```

---

## Implementation Roadmap

### Phase 1: Infrastructure (Day 1)
1. Install testing dependencies
2. Create `vitest.config.ts`
3. Create `src/test/setup.ts`
4. Create mock utilities
5. Update `package.json` scripts

### Phase 2: Schema & API Tests (Day 2)
1. Write schema validation tests (10 tests)
2. Write API function tests with mocked Supabase (10 tests)
3. Verify error handling tests (4 tests)

### Phase 3: Utility Tests (Day 3)
1. Write ETA calculation tests (5 tests)
2. Write geocoding tests (4 tests)
3. Write notification tests (3 tests)
4. Write error handling tests (4 tests)

### Phase 4: Hook Tests (Day 4)
1. Write useSimulation tests (5 tests)
2. Write useLiveShipment tests (4 tests)
3. Write useTheme tests (3 tests)

### Phase 5: Component & View Tests (Day 5)
1. Write CreateShipmentForm tests (4 tests)
2. Write SimulationController tests (3 tests)
3. Write TransportMarker tests (3 tests)
4. Write Analytics view tests (3 tests)
5. Write Tracking view tests (2 tests)

### Phase 6: Integration & Coverage (Day 6)
1. Run full test suite
2. Address any failing tests
3. Achieve target coverage (80%+)
4. Generate coverage report

---

## Success Criteria

- ✅ **46 tests** passing
- ✅ **80%+ code coverage**
- ✅ All critical paths tested
- ✅ CI/CD pipeline integration ready
- ✅ Test suite runs in < 30 seconds

---

## Running Tests

```bash
# Run tests in watch mode (development)
npm run test

# Run tests once (CI/CD)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

---

## Notes

- Tests should be isolated and not depend on each other
- Use `beforeEach` to reset mocks and state
- Prefer user-centric queries (getByRole, getByLabelText)
- Mock external APIs (Supabase, Photon) to avoid network calls
- Use `act()` for state updates and `waitFor()` for async assertions

---

*Document created: 2026-03-25*
