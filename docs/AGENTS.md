# Swish Portal - AI Agent Guide

## Project Overview

Swish Portal is an enterprise-grade logistics platform providing real-time shipment tracking, customer portal access, and comprehensive supply chain visibility. The system enables customers to track multimodal freight (ocean, air, road, rail) across 180+ countries through an interactive web interface featuring live map visualization, shipment management, billing, and administrative controls.

**Key Features:**
- Real-time shipment tracking with live map visualization
- Multi-modal transport support (air, ocean, road, rail)
- Interactive simulation system for demo shipments
- Invoice and billing management
- Notification system for shipment updates
- Dashboard with analytics and statistics
- Dark/light theme support

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 |
| UI Library | React 19 |
| Styling | Tailwind CSS 3.4.19 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Database | Supabase (PostgreSQL) |
| Maps | MapLibre GL |
| Validation | Zod |
| Testing | Vitest + React Testing Library |
| Icons | Lucide React |
| Forms | React Hook Form |

---

## Project Structure

```
/workspaces/nexus/
├── app/                          # Next.js App Router (entry points)
│   ├── layout.tsx               # Root layout with Header/Footer
│   ├── page.tsx                 # Home page (landing)
│   ├── dashboard/page.tsx       # Customer dashboard
│   ├── tracking/page.tsx        # Shipment search
│   ├── tracking/[id]/page.tsx   # Real-time tracking detail
│   ├── shipments/page.tsx       # Shipment list
│   ├── shipments/new/page.tsx   # Create new shipment
│   ├── billing/page.tsx         # Invoice management
│   ├── admin/control/page.tsx   # Simulation control panel
│   ├── analytics/page.tsx       # Analytics view
│   ├── about/page.tsx           # About page
│   ├── contact/page.tsx         # Contact page
│   └── services/page.tsx        # Services page
├── src/
│   ├── components/
│   │   ├── ui/                  # 50+ shadcn/ui components
│   │   ├── forms/               # Form components
│   │   ├── Header.tsx           # Navigation header
│   │   ├── Footer.tsx           # Page footer
│   │   ├── TrackingMap.tsx      # Map visualization
│   │   ├── TransportMarker.tsx  # Transport mode markers
│   │   ├── DriverPingSimulator.tsx
│   │   └── SimulationController.tsx
│   ├── views/                   # Page-level view components
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Tracking.tsx
│   │   ├── Shipments.tsx
│   │   ├── ShipmentNew.tsx
│   │   ├── Billing.tsx
│   │   ├── AdminControl.tsx
│   │   └── Analytics.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useTheme.ts          # Theme management
│   │   ├── useSimulation.ts     # Simulation control
│   │   ├── useLiveShipment.ts   # Real-time shipment updates
│   │   ├── useLiveTracking.ts   # Live tracking subscription
│   │   └── use-mobile.ts        # Mobile detection
│   ├── lib/                     # Utilities and API layer
│   │   ├── api/
│   │   │   ├── shipments.ts     # Shipment API functions
│   │   │   └── invoices.ts      # Invoice API functions
│   │   ├── schemas/
│   │   │   ├── shipment.ts      # Zod validation schemas
│   │   │   ├── invoice.ts
│   │   │   └── user.ts
│   │   ├── supabase.ts          # Supabase client
│   │   ├── errors.ts            # Error handling
│   │   ├── eta.ts               # ETA calculations
│   │   ├── geocoding.ts         # Geocoding utilities
│   │   ├── notifications.ts     # Notification system
│   │   └── utils.ts             # Tailwind class merging (cn)
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── test/                    # Test utilities
│       ├── setup.ts             # Test setup and global mocks
│       ├── utils.tsx            # Test render helpers
│       └── mocks/
│           └── data.ts          # Mock data factories
├── supabase_schema.sql          # Database schema definition
├── package.json                 # Dependencies and scripts
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── vitest.config.ts             # Vitest test configuration
├── eslint.config.js             # ESLint configuration
├── components.json              # shadcn/ui configuration
├── TESTING_PLAN.md              # Testing implementation plan
└── TEST_RECOVERY_STATUS.md      # Current test status
```

---

## Build and Development Commands

All commands should be run from the `/workspaces/nexus/app/` directory:

```bash
# Development
npm run dev           # Start Next.js dev server with HMR

# Production
npm run build         # Production build with static optimization
npm run start         # Production server

# Code Quality
npm run lint          # ESLint with TypeScript rules
npm run typecheck     # TypeScript compiler (no emit)

# Testing
npm run test          # Run Vitest in watch mode
npm run test:run      # Run tests once (for CI/CD)
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

---

## Testing Strategy

The project uses **Vitest** with **React Testing Library** for comprehensive testing.

### Current Test Status (218 tests across 17 files)

| Category | Test Files | Tests |
|----------|------------|-------|
| Schema Validation | `src/lib/schemas/*.test.ts` | 41 tests |
| Utility Functions | `src/lib/*.test.ts` | 88 tests |
| Custom Hooks | `src/hooks/*.test.ts` | 26 tests |
| Components & Views | `src/components/*.test.tsx`, `src/views/*.test.tsx` | 37 tests |
| API Integration | `src/lib/api/*.test.ts` | 26 tests |

### Running Tests

```bash
# Watch mode (development)
npm run test

# Single run (CI/CD)
npm run test:run

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

### Test Configuration

- **Framework**: Vitest 4.1.1
- **Environment**: jsdom
- **Setup File**: `src/test/setup.ts`
- **Global Mocks**: `matchMedia`, `IntersectionObserver`, `ResizeObserver`, Supabase, MapLibre GL

---

## Environment Variables

Create a `.env.local` file in the `app/` directory with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Database Schema

The database is PostgreSQL via Supabase. Key tables:

| Table | Purpose |
|-------|---------|
| `shipments` | Core shipment data with location tracking |
| `tracking_logs` | Historical location breadcrumbs |
| `invoices` | Billing documents |
| `notifications` | User alerts |
| `simulation_paths` | Predefined routes for demo mode |

### Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Demo shipments (`is_live_demo = TRUE`) are publicly visible

### Realtime Subscriptions

Enabled on: `shipments`, `tracking_logs`, `notifications`

---

## Code Style Guidelines

### TypeScript

- Strict mode enabled
- Path alias `@/*` maps to `./src/*`
- Prefer explicit return types on public functions
- Use Zod schemas for runtime validation

### Component Structure

```typescript
// Use "use client" for client components
"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  title: string;
}

export function Component({ title }: ComponentProps) {
  return <div>{title}</div>;
}
```

### Styling Conventions

- Use Tailwind CSS utility classes
- Use `cn()` utility for conditional class merging
- Dark mode via CSS variables (`darkMode: "class"`)
- Color tokens defined in `tailwind.config.js`

### File Naming

- Components: PascalCase (e.g., `TrackingMap.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useSimulation.ts`)
- Utilities: camelCase (e.g., `geocoding.ts`)
- Tests: Same name as source with `.test.ts` suffix

---

## Key Design Patterns

1. **Composition Pattern**: Build UI from smaller, reusable components
2. **Custom Hook Pattern**: Extract business logic into reusable hooks
3. **Repository Pattern**: `src/lib/api/` modules abstract database operations
4. **Validation Schema Pattern**: Zod schemas for type-safe validation
5. **Observer Pattern**: Supabase realtime subscriptions for live updates

---

## External Integrations

| Service | Purpose | Location |
|---------|---------|----------|
| Supabase | Database, Auth, Realtime | `src/lib/supabase.ts` |
| MapLibre GL | Maps and geospatial | `TrackingMap.tsx` |

---

## Security Considerations

1. **Authentication**: Supabase Auth with RLS policies
2. **Data Validation**: Zod schemas validate all inputs
3. **Environment Variables**: Never commit sensitive keys
4. **Error Handling**: Custom error classes in `src/lib/errors.ts`

---

## Common Tasks

### Adding a New Page

1. Create page component in `app/[route]/page.tsx`
2. Create view component in `src/views/` if complex
3. Add route to navigation in `Header.tsx`

### Adding a New Component

1. Create component file in appropriate `src/components/` subdirectory
2. Export from file
3. Add tests in `*.test.tsx` file

### Adding a New Hook

1. Create hook file in `src/hooks/`
2. Follow `use[Name].ts` naming convention
3. Add tests in `*.test.ts` file

### Adding API Functions

1. Add to appropriate file in `src/lib/api/`
2. Use Zod schemas for validation
3. Handle errors using custom error classes
4. Add tests in `*.test.ts` file

---

## Documentation References

- `ARCHITECTUREnew.md` - Detailed architecture documentation
- `TESTING_PLAN.md` - Original testing plan
- `TEST_RECOVERY_STATUS.md` - Current test status
- `supabase_schema.sql` - Database schema definition

---

## Notes for AI Agents

1. **Always run tests** after making changes: `npm run test:run`
2. **Type checking**: Run `npm run typecheck` to catch TypeScript errors
3. **Linting**: Run `npm run lint` to ensure code quality
4. **Test files**: Keep test files alongside source files (e.g., `Component.tsx` + `Component.test.tsx`)
5. **Mock external services**: Tests should mock Supabase and MapLibre GL
6. **Follow existing patterns**: Check similar files for coding style consistency
