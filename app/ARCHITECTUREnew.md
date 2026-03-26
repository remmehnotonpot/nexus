# Swish Portal - Architecture Documentation

## High-Level Overview

Swish Portal is an enterprise-grade logistics platform providing real-time shipment tracking, customer portal access, and comprehensive supply chain visibility. The system enables customers to track multimodal freight (ocean, air, road, rail) across 180+ countries through an interactive web interface featuring live map visualization, shipment management, billing, and administrative controls.

---

## System Architecture

### Architectural Style: **Modern React Application with Next.js App Router**

The system follows a **Layered Architecture** pattern with **Feature-Based Organization**:

- **Presentation Layer**: Next.js App Router pages + React view components
- **Application Layer**: Custom React hooks for business logic and state management
- **Data Access Layer**: Supabase client with real-time subscriptions
- **External Services Layer**: Mapbox GL JS for geospatial visualization

---

## Component Breakdown

### 1. App Router Layer (`app/`)

| Route | Purpose | File |
|-------|---------|------|
| `/` | Landing page with marketing content | `page.tsx` → `Home.tsx` |
| `/dashboard` | Customer overview dashboard | `dashboard/page.tsx` |
| `/tracking` | Shipment search interface | `tracking/page.tsx` |
| `/tracking/[id]` | Real-time tracking with map | `tracking/[id]/page.tsx` |
| `/shipments` | Shipment list management | `shipments/page.tsx` |
| `/billing` | Invoice and payment management | `billing/page.tsx` |
| `/admin/control` | Simulation control panel (Admin) | `admin/control/page.tsx` |

**Key Responsibilities:**
- Server-side rendering entry points
- Route parameter handling
- SEO metadata configuration
- View component orchestration

### 2. View Layer (`src/views/`)

| Component | Description | Key Dependencies |
|-----------|-------------|------------------|
| `Home.tsx` | Marketing landing page with hero, services, testimonials | `lucide-react`, `next/navigation` |
| `Dashboard.tsx` | Customer dashboard with stats, shipment list, notifications | React Query hooks |
| `Tracking.tsx` | Real-time shipment tracking with timeline and map | `TrackingMap`, `TransportMarker` |
| `Shipments.tsx` | Paginated shipment list with filtering | React Query hooks |
| `Billing.tsx` | Invoice management and payment methods | React Query hooks |
| `AdminControl.tsx` | Simulation control for shipment tracking demo | `mapbox-gl`, `useSimulation` hook |

### 3. Component Library (`src/components/`)

#### Layout Components
| Component | Purpose |
|-----------|---------|
| `Header.tsx` | Responsive navigation with transparent/scrolled states, quick tracking search, theme toggle, user menu |
| `Footer.tsx` | Multi-column footer with legal disclaimers, compliance info, newsletter signup |
| `ErrorBoundary.tsx` | Error boundary for graceful error recovery |

#### Feature Components
| Component | Purpose |
|-----------|---------|
| `TrackingMap.tsx` | Mapbox GL integration with route visualization, animated markers, progress calculation |
| `TransportMarker.tsx` | SVG-based transport mode icons (air/ocean/road/rail), status badges, live indicators |
| `VirtualList.tsx` | Virtualized list rendering for large datasets |
| `LazyImage.tsx` | Optimized image component with lazy loading |

#### Shared Components (`src/components/`)
| Directory | Contents |
|-----------|----------|
| `ui/` | 53+ shadcn/ui components (Button, Card, Dialog, Table, Tabs, Toast, etc.) |
| `icons/` | Centralized transport icons (`TransportIcons.tsx`) |
| `tables/` | Reusable table components (`DataTable`, `ShipmentTable`) |
| `skeletons/` | Loading skeletons for all major UI patterns |
| `a11y/` | Accessibility components (SkipLink, FocusTrap, LiveRegion, VisuallyHidden) |

### 4. Custom Hooks (`src/hooks/`)

| Hook | Purpose | Pattern |
|------|---------|---------|
| `useTheme.ts` | Dark/light/system theme management with localStorage persistence | State + Effect + MediaQuery |
| `useSimulation.ts` | Shipment movement simulation with interpolation, heading calculation | State Machine + setInterval |
| `use-mobile.ts` | Mobile viewport detection | MediaQuery hook |
| `useShipments.ts` | React Query hooks for shipment data fetching | React Query |
| `useInvoices.ts` | React Query hooks for invoice data fetching | React Query |

### 5. Data Layer (`src/lib/`)

| File | Purpose |
|------|---------|
| `supabase.ts` | Supabase client initialization, CRUD operations, real-time subscriptions |
| `api/shipments.ts` | Shipment API functions with JSDoc documentation |
| `api/invoices.ts` | Invoice API functions |
| `schemas/shipment.ts` | Zod schemas for shipment validation |
| `schemas/invoice.ts` | Zod schemas for invoice validation |
| `schemas/user.ts` | Zod schemas for user/auth validation |
| `errors.ts` | Error handling utilities |
| `utils.ts` | Tailwind class merging, debounce, throttle, memoize utilities |

**Supabase Operations:**
- `getShipmentByTrackingNumber()` - Fetch shipment with tracking logs
- `getShipmentsByCustomer()` - Customer-specific shipment queries
- `updateShipmentLocation()` - Real-time position updates
- `subscribeToShipmentUpdates()` - Real-time PostgreSQL change subscriptions

### 6. Type System (`src/types/`)

| Type | Description |
|------|-------------|
| `Shipment` | Core shipment entity with origin/destination/current location |
| `TrackingLog` | Historical location breadcrumbs |
| `Invoice` | Billing document with status tracking |
| `Notification` | User alert system |
| `SimulationPath` | Predefined route coordinates for demo |
| `TransportMode` | Union type: 'air' \| 'ocean' \| 'road' \| 'rail' |
| `ShipmentStatus` | Union type: 'pending' \| 'in-transit' \| 'customs' \| 'delivered' \| 'delayed' \| 'out-for-delivery' |
| `Database` | Complete Supabase Database types |

---

## Key Interdependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP ROUTER                              │
│  (Server Components - Next.js App Router)                       │
├─────────────────────────────────────────────────────────────────┤
│                         VIEWS                                   │
│  (Client Components - "use client")                             │
│  Home / Dashboard / Tracking / Shipments / Billing / AdminControl│
├─────────────────────────────────────────────────────────────────┤
│                      COMPOSITE COMPONENTS                       │
│  Header / Footer / TrackingMap / TransportMarker                │
├─────────────────────────────────────────────────────────────────┤
│                      UI COMPONENTS (shadcn)                     │
│  Button / Card / Dialog / Table / Tabs / etc.                   │
├─────────────────────────────────────────────────────────────────┤
│                      SHARED COMPONENTS                          │
│  Icons / Tables / Skeletons / Accessibility                     │
├─────────────────────────────────────────────────────────────────┤
│                      CUSTOM HOOKS                               │
│  useTheme / useSimulation / useShipments / useInvoices          │
├─────────────────────────────────────────────────────────────────┤
│                      DATA LAYER                                 │
│  API Layer → Supabase Client → Realtime Subscriptions           │
│  Validation Layer → Zod Schemas                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
│  Supabase (DB + Auth + Realtime) / Mapbox GL JS                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models & Persistence

### Database Schema (PostgreSQL via Supabase)

#### Core Tables

**1. `shipments`**
```sql
- id: UUID PRIMARY KEY
- tracking_number: TEXT UNIQUE
- customer_id: UUID → auth.users
- status: ENUM ('pending', 'in-transit', 'customs', 'delivered', 'delayed', 'out-for-delivery')
- origin_city, origin_country, origin_lat, origin_lng
- destination_city, destination_country, destination_lat, destination_lng
- current_lat, current_lng, current_heading
- transport_mode: ENUM ('air', 'ocean', 'road', 'rail')
- estimated_arrival, actual_arrival: TIMESTAMP
- weight_kg, volume_cbm, goods_description
- is_live_demo: BOOLEAN
- created_at, updated_at: TIMESTAMP
```

**2. `tracking_logs`**
```sql
- id: UUID PRIMARY KEY
- shipment_id: UUID → shipments
- lat, lng: FLOAT8
- timestamp: TIMESTAMP
- location_name: TEXT
- event_type: ENUM ('location-update', 'checkpoint', 'customs-clearance', 'departure', 'arrival', 'delay')
```

**3. `invoices`**
```sql
- id: UUID PRIMARY KEY
- invoice_number: TEXT UNIQUE
- customer_id: UUID → auth.users
- shipment_id: UUID → shipments
- amount: DECIMAL(12,2)
- currency: TEXT
- status: ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled')
- issue_date, due_date, paid_date: DATE
```

**4. `notifications`**
```sql
- id: UUID PRIMARY KEY
- customer_id: UUID → auth.users
- shipment_id: UUID → shipments
- type: ENUM ('status-update', 'delay-alert', 'delivery-confirmation', 'customs-hold', 'payment-due')
- title, message: TEXT
- is_read: BOOLEAN
```

**5. `simulation_paths`**
```sql
- id: UUID PRIMARY KEY
- name, description: TEXT
- transport_mode: ENUM
- path_data: JSONB (Array of [lat, lng] coordinates)
- origin_city, destination_city: TEXT
- estimated_duration_hours: INTEGER
```

### Security: Row Level Security (RLS)
- Users can only view/modify their own shipments
- Demo shipments (`is_live_demo = TRUE`) are publicly visible
- Invoices and notifications are user-scoped

### Realtime Subscriptions
- `shipments` table: UPDATE events for position changes
- `tracking_logs` table: INSERT events for new breadcrumbs
- `notifications` table: INSERT events for new alerts

---

## External Integrations

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| **Supabase** | Database, Authentication, Realtime subscriptions | `@supabase/supabase-js` in `src/lib/supabase.ts` |
| **Mapbox GL JS** | Interactive maps, route visualization, geocoding | `mapbox-gl` in `TrackingMap.tsx`, `AdminControl.tsx` |
| **Google Fonts** | Typography (Inter, JetBrains Mono) | CSS `@import` in `index.css` |

**Required Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## Security & Error Handling

### Authentication
- Supabase Auth integration configured
- Row Level Security policies active
- Auth context for protected routes

### Error Handling
| Layer | Strategy |
|-------|----------|
| API Layer | Custom error classes (`ApiError`, `NotFoundError`) with proper error codes |
| UI Layer | Error boundaries, loading states, toast notifications |
| Map Initialization | Error boundary for graceful fallback |

### Data Validation
- **Zod** schemas for all form inputs and API payloads
- Runtime type validation before database operations
- TypeScript provides compile-time type safety

---

## Development Workflow

### Build Process
```bash
npm run dev        # Next.js dev server with HMR
npm run build      # Production build with static optimization
npm run start      # Production server
npm run lint       # ESLint with TypeScript rules
npm run typecheck  # TypeScript compiler (no emit)
npm run test       # Run Vitest tests
npm run test:watch # Watch mode testing
npm run storybook  # Storybook dev server
```

### Key Configuration Files
| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `tailwind.config.js` | Tailwind CSS theme extension, dark mode, custom colors |
| `tsconfig.json` | TypeScript with path aliases (`@/*` → `./src/*`) |
| `components.json` | shadcn/ui configuration |
| `eslint.config.js` | ESLint flat config with TypeScript and React Hooks |
| `postcss.config.js` | PostCSS with Tailwind and autoprefixer |
| `vitest.config.ts` | Vitest test configuration |

### Styling Architecture
- **Tailwind CSS v3.4.19** with custom CSS variables
- **CSS Custom Properties** for theming (light/dark modes)
- **shadcn/ui** component library with Radix primitives
- **Custom animations** in `index.css` (slide-up, fade-in, float)

---

## Design Patterns

| Pattern | Implementation |
|---------|----------------|
| **Composition Pattern** | React components compose UI from smaller units |
| **Custom Hook Pattern** | Business logic extracted into reusable hooks |
| **Container/Presentational** | App Router pages (containers) → View components (presentational) |
| **Factory Pattern** | `TransportIcons.tsx` creates mode-specific SVG icons |
| **Observer Pattern** | Supabase realtime subscriptions for live updates |
| **State Machine** | `useSimulation.ts` implements simulation state transitions |
| **Repository Pattern** | `src/lib/api/` modules abstract database operations |
| **Validation Schema Pattern** | Zod schemas for type-safe validation |

---

## Testing Strategy

### Unit Tests
- **Framework**: Vitest with jsdom environment
- **Components**: React Testing Library with Jest DOM matchers
- **Location**: `src/**/*.test.{ts,tsx}`

### Test Coverage Areas
| Area | Status |
|------|--------|
| Schema Validation | ✅ Zod schema tests |
| React Hooks | ✅ Hook tests with React Query |
| Components | ✅ Component tests |
| API Functions | 📝 To be added |

### Running Tests
```bash
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

---

## Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Virtualization** | `@tanstack/react-virtual` for large lists |
| **Memoization** | `useMemo`, `useCallback` for expensive calculations |
| **Debouncing** | Input handlers and map movements debounced |
| **Image Optimization** | Next.js Image with lazy loading |
| **Code Splitting** | Dynamic imports for heavy components |
| **Route Memoization** | React Query caching strategies |

---

## Accessibility (a11y)

| Feature | Implementation |
|---------|----------------|
| **Keyboard Navigation** | Full keyboard support, focus management |
| **Screen Readers** | Live regions for dynamic content |
| **Focus Management** | FocusTrap for modals, skip links |
| **ARIA** | Proper labels, roles, and attributes |
| **Contrast** | WCAG 2.1 AA compliant color contrast |

---

## Architecture Compliance Summary

| Principle | Status | Notes |
|-----------|--------|-------|
| Separation of Concerns | ✅ Good | Clear layer separation |
| DRY (Don't Repeat Yourself) | ✅ Good | Centralized icons, shared components |
| Type Safety | ✅ Good | Full TypeScript coverage with Database types |
| Testability | ✅ Good | Vitest setup, test coverage increasing |
| Scalability | ✅ Good | Modular architecture, virtualized lists |
| Security | ✅ Good | RLS policies, input validation with Zod |
| Accessibility | ✅ Good | a11y components, WCAG compliance |
| Performance | ✅ Good | Optimizations implemented |

---

## Appendix: File Structure Summary

```
/workspaces/swish-portal/
├── app/                          # Next.js App Router (entry points)
│   ├── layout.tsx               # Root layout with Header/Footer
│   ├── page.tsx                 # Home page
│   ├── dashboard/page.tsx
│   ├── tracking/page.tsx
│   ├── tracking/[id]/page.tsx
│   ├── shipments/page.tsx
│   ├── billing/page.tsx
│   └── admin/control/page.tsx
├── src/
│   ├── components/
│   │   ├── ui/                  # 53+ shadcn/ui components
│   │   ├── a11y/                # Accessibility components
│   │   ├── icons/               # Transport icons
│   │   ├── skeletons/           # Loading skeletons
│   │   ├── tables/              # Data tables
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── TrackingMap.tsx
│   │   ├── TransportMarker.tsx
│   │   ├── VirtualList.tsx
│   │   ├── LazyImage.tsx
│   │   └── ErrorBoundary.tsx
│   ├── views/                   # Page-level components
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Tracking.tsx
│   │   ├── Shipments.tsx
│   │   ├── Billing.tsx
│   │   └── AdminControl.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useTheme.ts
│   │   ├── useSimulation.ts
│   │   ├── useShipments.ts
│   │   ├── useInvoices.ts
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── api/                 # API layer
│   │   │   ├── shipments.ts
│   │   │   └── invoices.ts
│   │   ├── schemas/             # Zod validation schemas
│   │   │   ├── shipment.ts
│   │   │   ├── invoice.ts
│   │   │   └── user.ts
│   │   ├── supabase.ts
│   │   ├── errors.ts
│   │   └── utils.ts
│   ├── types/                   # TypeScript types
│   │   ├── index.ts
│   │   └── supabase.ts
│   └── test/                    # Test utilities
│       ├── setup.ts
│       └── mocks/
├── supabase_schema.sql          # Database schema definition
├── vitest.config.ts             # Vitest configuration
├── tailwind.config.js
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

*Document updated: 2026-03-23*
*Refactor completed: P0 (Critical), P1 (Quality), P2 (Enhancement)*

dfgyfutftyfuy
gdfhcg