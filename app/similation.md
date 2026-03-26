# Swish Portal - Simulation Implementation Plan

## ✅ Phase 1: Map Migration (Mapbox → MapLibre + OpenFreeMap) - COMPLETED

### Changes Made
- **Uninstalled**: `mapbox-gl`, `@types/mapbox-gl`
- **Installed**: `maplibre-gl`, `@types/maplibre-gl`

### Files Modified
1. **`src/components/TrackingMap.tsx`** - Migrated to MapLibre with OpenFreeMap tiles
2. **`src/views/AdminControl.tsx`** - Migrated to MapLibre with OpenFreeMap tiles
3. **`app/layout.tsx`** - Removed `mapbox-gl.css` import

### OpenFreeMap Styles Available
- `positron` - Light, minimal style (default)
- `bright` - Colorful, vibrant style
- `matter` - Dark, high-contrast style

### Benefits
- ✅ No API key required
- ✅ Free, open-source tiles
- ✅ Same API as Mapbox (minimal code changes)
- ✅ Better privacy (no tracking)

---

## 🚧 Phase 2: Shipment Creation Form - PENDING

### Planned Features
- Create shipment form with origin/destination inputs
- Photon geocoding integration (free, OSM-based)
- Transport mode selector
- Weight/Volume fields
- Estimated arrival date

### Files to Create
- `src/components/forms/CreateShipmentForm.tsx`
- `src/lib/geocoding.ts` (Photon integration)
- `app/shipments/new/page.tsx`

---

## ✅ Phase 3: Realtime Simulation Integration - COMPLETED

### 3.1 Enhanced `useSimulation` Hook

**File**: `src/hooks/useSimulation.ts`

**Added Features**:
- Speed multiplier state (0.5x to 10x)
- `setSpeedMultiplier()` function
- Speed-adjusted step duration for smooth animation

```typescript
interface SimulationState {
  // ... existing fields
  speedMultiplier: number;
}

interface UseSimulationReturn {
  // ... existing methods
  setSpeedMultiplier: (speed: number) => void;
}
```

### 3.2 New `useLiveShipment` Hook

**File**: `src/hooks/useLiveShipment.ts`

**Features**:
- ✅ Connects simulation to Supabase
- ✅ Automatic shipment creation from simulation paths
- ✅ Real-time position updates (`updateShipmentLocation`)
- ✅ Batched tracking logs (`addTrackingLog`) for performance
- ✅ Real-time subscriptions (`subscribeToShipmentUpdates`)
- ✅ Automatic status transitions (pending → in-transit → delivered)
- ✅ Sync status tracking (idle/syncing/synced/error)
- ✅ Error handling with retry logic
- ✅ Cleanup on unmount

```typescript
export interface UseLiveShipmentReturn {
  state: LiveShipmentState;
  selectedPath: SimulationPath | null;
  shipmentId: string | null;
  selectPath: (path: SimulationPath | null) => void;
  createShipment: (path: SimulationPath) => Promise<string>;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setSpeedMultiplier: (speed: number) => void;
  updateShipmentStatus: (status: ShipmentStatus) => Promise<void>;
}
```

**State Interface**:
```typescript
export interface LiveShipmentState {
  isRunning: boolean;
  isPaused: boolean;
  currentIndex: number;
  progress: number;
  currentPosition: [number, number] | null;
  heading: number;
  speedMultiplier: number;
  dbSyncStatus: "idle" | "syncing" | "synced" | "error";
  lastSyncTime: Date | null;
  totalUpdates: number;
}
```

### 3.3 New `SimulationController` Component

**File**: `src/components/SimulationController.tsx`

**Features**:
- ✅ Path selection from predefined routes
- ✅ Create shipment & auto-start simulation
- ✅ Start/Pause/Resume/Stop/Reset controls
- ✅ Speed multiplier selector (0.5x, 1x, 2x, 5x, 10x)
- ✅ Progress indicator with percentage
- ✅ Database sync status with visual feedback
  - Idle (gray)
  - Syncing (blue with spinner)
  - Synced (green with checkmark)
  - Error (red with alert)
- ✅ Position display (lat/lng/heading)
- ✅ Two display variants: `full` and `compact`
- ✅ Shipment ID display with copy functionality
- ✅ Total updates counter
- ✅ Last sync time display

**Props**:
```typescript
interface SimulationControllerProps {
  variant?: "full" | "compact";
  onShipmentCreated?: (shipmentId: string) => void;
}
```

### 3.4 Updated `AdminControl` View

**File**: `src/views/AdminControl.tsx`

**New Features**:
- ✅ MapLibre integration with OpenFreeMap tiles
- ✅ Map style toggle (Positron/Bright/Matter)
- ✅ Active simulations list with:
  - Shipment ID
  - Route name
  - Transport mode icon
  - Progress percentage
  - Remove button
- ✅ Real-time simulation logs with timestamps
- ✅ Live tracking link generation
- ✅ Integration with `SimulationController` component

---

## 📋 Phase 4: Admin Dashboard for Simulation - COMPLETED

### Features Implemented
- Create new shipment → Start simulation immediately
- List all active simulations
- Control multiple shipments simultaneously
- View real-time positions on map
- Map style switching
- Simulation logs with filtering

---

## 🏗️ Architecture

### Data Flow
```
┌─────────────────────────────────────────────┐
│           Shipment Creation Flow            │
├─────────────────────────────────────────────┤
│ 1. User selects path in SimulationController│
│ 2. Clicks "Create Shipment"                 │
│ 3. useLiveShipment.createShipment()         │
│    - Generates tracking number              │
│    - Inserts into Supabase shipments table  │
│    - Returns shipment ID                    │
│ 4. Simulation auto-starts                   │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           Live Simulation Flow              │
├─────────────────────────────────────────────┤
│ 1. useSimulation generates positions        │
│ 2. useLiveShipment.handlePositionUpdate()   │
│    - Updates shipment location in DB        │
│    - Queues tracking log entry              │
│ 3. Batch processor writes logs periodically │
│ 4. Supabase Realtime broadcasts updates     │
│ 5. Other clients receive updates            │
│ 6. Map updates with new position            │
└─────────────────────────────────────────────┘
```

### Performance Optimizations
- **Batched tracking logs**: Logs are queued and written in batches (default: 5 logs or 2 seconds)
- **Debounced map movements**: Map pans smoothly following the marker
- **Speed-adjusted animation**: Higher speeds = fewer interpolation steps
- **Cleanup on unmount**: All subscriptions and intervals are properly cleaned up

### Error Handling
- Database connection errors are caught and retried
- Failed logs are re-queued for retry
- Sync status is displayed in UI
- Console warnings for debugging

---

## 🧪 Testing

### Test Coverage
- ✅ Schema validation tests
- ✅ React Hook tests (useShipments)
- ✅ Component tests (TransportIcons)
- ✅ User schema tests

### Known Issues
- 2 pre-existing tests fixed (React 19 compatibility with Lucide icons)
- Browser-based tests require Playwright system dependencies

---

## 📁 File Structure

```
src/
├── hooks/
│   ├── useSimulation.ts          # Enhanced with speed multiplier
│   ├── useLiveShipment.ts        # NEW - Supabase integration
│   └── ...
├── components/
│   ├── SimulationController.tsx  # NEW - UI controls
│   ├── TrackingMap.tsx           # MIGRATED - MapLibre
│   └── ...
├── views/
│   ├── AdminControl.tsx          # UPDATED - Full integration
│   └── ...
├── lib/
│   ├── supabase.ts               # Helper functions
│   └── ...
└── ...
```

---

## 🔧 Build & Deploy

### Requirements
- Node.js 18+
- Supabase project (for database)
- No Mapbox token needed!

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# No NEXT_PUBLIC_MAPBOX_TOKEN needed!
```

### Build Commands
```bash
npm run dev        # Development server
npm run build      # Production build
npm run test       # Run tests
npm run typecheck  # TypeScript check
```

---

## 🎯 Next Steps (Phase 2 of phase 3)

1. **Shipment Creation Form**
   - Create `CreateShipmentForm` component
   - Add Photon geocoding integration
   - Build `app/shipments/new/page.tsx`

2. **Enhanced Tracking**
   - Add real-time ETA calculations
   - Implement delay detection
   - Add notifications for status changes

3. **Analytics Dashboard**
   - Shipment statistics
   - Route performance metrics
   - Delivery success rates

---

*Document updated: 2026-03-23*
*Phase 3 completed: Realtime Simulation Integration*
