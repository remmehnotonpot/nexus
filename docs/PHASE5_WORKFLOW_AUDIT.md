# Phase 5 Workflow Audit

Date: 2026-03-28

Scope: This audit is based on the current application code and generated Supabase types. It intentionally ignores `supabase_schema.sql`, which is now considered stale and not representative of the live runtime schema.

## Source Of Truth

The current audit treats these as authoritative:

- [`/workspaces/nexus/app/src/types/database.ts`](/workspaces/nexus/app/src/types/database.ts)
- [`/workspaces/nexus/app/src/types/index.ts`](/workspaces/nexus/app/src/types/index.ts)
- Shipment and operations API code under [`/workspaces/nexus/app/src/lib/api/`](/workspaces/nexus/app/src/lib/api)
- UI flows under [`/workspaces/nexus/app/src/views/`](/workspaces/nexus/app/src/views/) and [`/workspaces/nexus/app/src/components/`](/workspaces/nexus/app/src/components/)

## Executive Summary

The live Phase 5 foundation is partially in place. The codebase already expects:

- `shipment_status_history`
- `tracking_updates`
- expanded shipment fields with JSON addresses
- role-aware profiles and operations views

The main issue is no longer missing Phase 5 schema primitives. The main issue is missing workflow enforcement.

The current code still allows workflow ambiguity in four places:

1. Customer shipment creation defaults to generic `pending` instead of a strict intake state.
2. Status transitions are recorded, but not validated as a state machine.
3. Admin and operations controls are not tightly limited to true admin/ops roles.
4. Public tracking still uses movement history for its timeline instead of status history.

## Rule 1: Customer Limitation

### Required Business Rule

- Customers may request quotes or generate tracking numbers.
- Customers may create shipment requests, not active shipments.
- Customer-created shipments must default to `pending_dropoff` or `scheduled_for_pickup`.
- Customers cannot change shipment statuses.

### Current State

- The app-level shipment status constants do not include `pending_dropoff` or `scheduled_for_pickup`: [`/workspaces/nexus/app/src/types/index.ts`](/workspaces/nexus/app/src/types/index.ts#L118)
- The Zod shipment schema still uses a legacy status enum and defaults new shipments to `pending`: [`/workspaces/nexus/app/src/lib/schemas/shipment.ts`](/workspaces/nexus/app/src/lib/schemas/shipment.ts#L26), [`/workspaces/nexus/app/src/lib/schemas/shipment.ts`](/workspaces/nexus/app/src/lib/schemas/shipment.ts#L38)
- Staff creation flows also default to `pending`: [`/workspaces/nexus/app/src/views/ShipmentNew.tsx`](/workspaces/nexus/app/src/views/ShipmentNew.tsx#L27), [`/workspaces/nexus/app/src/views/NewShipment.tsx`](/workspaces/nexus/app/src/views/NewShipment.tsx#L152)
- The generic shipment API accepts raw shipment inserts without imposing a customer-specific workflow state: [`/workspaces/nexus/app/src/lib/api/shipments.ts`](/workspaces/nexus/app/src/lib/api/shipments.ts#L163)
- The generic shipment API also exposes direct status updates with no actor-specific restriction in the client layer: [`/workspaces/nexus/app/src/lib/api/shipments.ts`](/workspaces/nexus/app/src/lib/api/shipments.ts#L97)

### Audit Finding

The customer limitation is not yet enforced as a workflow contract. The app is still modeled around a generic shipment object rather than a strict distinction between:

- customer shipment request
- admin-inducted active shipment

### What Must Change

- Add intake statuses to the canonical status set.
- Split customer request creation from staff shipment creation.
- Remove customer ability to submit or mutate `status`.
- Enforce the initial state server-side, not from client defaults.

## Rule 2: Admin Authority And Audit

### Required Business Rule

- Only authenticated admins/operations staff can move a shipment out of `pending_dropoff`.
- Admins own all downstream transitions.
- Admin UI must support physical package audit before induction.

### Current State

- The code already records status changes into `shipment_status_history`: [`/workspaces/nexus/app/src/lib/api/operations.ts`](/workspaces/nexus/app/src/lib/api/operations.ts#L190)
- That function does not validate allowed transitions and does not require intake audit data before induction: [`/workspaces/nexus/app/src/lib/api/operations.ts`](/workspaces/nexus/app/src/lib/api/operations.ts#L206)
- The generated types confirm `shipment_status_history` exists and is intended as a first-class audit table: [`/workspaces/nexus/app/src/types/database.ts`](/workspaces/nexus/app/src/types/database.ts#L664)
- Several operations/admin routes allow non-admin operational roles, including `driver`, `warehouse_staff`, `customer_support`, and `viewer`:
  - [`/workspaces/nexus/app/src/views/ShipmentDetail.tsx`](/workspaces/nexus/app/src/views/ShipmentDetail.tsx#L135)
  - [`/workspaces/nexus/app/src/views/OperationsShipments.tsx`](/workspaces/nexus/app/src/views/OperationsShipments.tsx#L77)
  - [`/workspaces/nexus/app/src/views/OperationsDashboard.tsx`](/workspaces/nexus/app/src/views/OperationsDashboard.tsx#L132)
  - [`/workspaces/nexus/app/src/views/AdminControl.tsx`](/workspaces/nexus/app/src/views/AdminControl.tsx#L71)
- The mobile status update UI exposes a generic status picker across all statuses and assumes the containing page enforces authority: [`/workspaces/nexus/app/src/components/mobile/MobileStatusUpdate.tsx`](/workspaces/nexus/app/src/components/mobile/MobileStatusUpdate.tsx#L37), [`/workspaces/nexus/app/src/components/mobile/MobileStatusUpdate.tsx`](/workspaces/nexus/app/src/components/mobile/MobileStatusUpdate.tsx#L111)
- I found no current app-level fields for actual audited package dimensions or actual intake weight.

### Audit Finding

The audit/history plumbing exists, but the induction workflow does not. Status updates are treated as generic operations instead of a guarded state machine with a mandatory intake checkpoint.

### What Must Change

- Restrict shipment status transitions to `super_admin`, `operations_manager`, and `logistics_coordinator`.
- Add transition validation at the database boundary.
- Add intake audit data before induction:
  - actual weight
  - actual dimensions
  - audited by
  - audited at
  - notes
- Make induction a distinct admin action, not just another status change.

## Rule 3: Public Tracking UI Redesign

### Required Business Rule

- Timeline must be a vertical stepper built from `shipment_status_history`.
- Details card must show Sender and Recipient information.
- Support contact `ceo@nimdeshop.com` must be prominently displayed.

### Current State

- The tracking page already renders a vertical timeline component: [`/workspaces/nexus/app/src/views/Tracking.tsx`](/workspaces/nexus/app/src/views/Tracking.tsx#L33)
- That timeline is built from `tracking_updates`, not `shipment_status_history`: [`/workspaces/nexus/app/src/views/Tracking.tsx`](/workspaces/nexus/app/src/views/Tracking.tsx#L394), [`/workspaces/nexus/app/src/hooks/useLiveTracking.ts`](/workspaces/nexus/app/src/hooks/useLiveTracking.ts#L100)
- The shipment fetch used by tracking only selects `tracking_updates`, not status history: [`/workspaces/nexus/app/src/lib/api/shipments.ts`](/workspaces/nexus/app/src/lib/api/shipments.ts#L13)
- The details sidebar only shows origin, destination, ETA, coordinates, and package metrics: [`/workspaces/nexus/app/src/views/Tracking.tsx`](/workspaces/nexus/app/src/views/Tracking.tsx#L281), [`/workspaces/nexus/app/src/views/Tracking.tsx`](/workspaces/nexus/app/src/views/Tracking.tsx#L364)
- I found no sender/recipient data fields in the current tracking UI flow, and no existing support contact block for `ceo@nimdeshop.com`.

### Audit Finding

The current tracking page is a movement viewer, not a shipment lifecycle viewer. It needs both a data fetch change and a UI information architecture change.

### What Must Change

- Extend tracking fetches to include `shipment_status_history`.
- Build the vertical stepper from status history ordered by `created_at`.
- Add explicit sender and recipient sections with:
  - name
  - address
  - city
  - country
- Add a prominent support panel with `ceo@nimdeshop.com`.

## Rule 4: Map Trails

### Required Business Rule

- The moving marker must leave a visible trail.
- Trail must be a GeoJSON `LineString`.
- Trail must connect origin, historical tracking pings, and current location.

### Current State

- `TrackingMap.tsx` already creates a GeoJSON source and line layers for the trail: [`/workspaces/nexus/app/src/components/TrackingMap.tsx`](/workspaces/nexus/app/src/components/TrackingMap.tsx#L70)
- The line is currently built from `trackingHistory`: [`/workspaces/nexus/app/src/components/TrackingMap.tsx`](/workspaces/nexus/app/src/components/TrackingMap.tsx#L328), [`/workspaces/nexus/app/src/components/TrackingMap.tsx`](/workspaces/nexus/app/src/components/TrackingMap.tsx#L382)
- The code appends current location if it differs from the last history point: [`/workspaces/nexus/app/src/components/TrackingMap.tsx`](/workspaces/nexus/app/src/components/TrackingMap.tsx#L386)
- The origin is used for bounds fitting, but not guaranteed to be included as the first rendered coordinate of the line itself: [`/workspaces/nexus/app/src/components/TrackingMap.tsx`](/workspaces/nexus/app/src/components/TrackingMap.tsx#L400)

### Audit Finding

This requirement is partially implemented already. The remaining gap is correctness and completeness, not a net-new feature.

### What Must Change

- Always compose the trail in this order:
  - origin
  - historical tracking pings
  - current location if distinct
- Update the route source whenever tracking history or current position changes.
- Keep trail generation separate from the moving marker animation logic.

## Schema And Validation Audit

### Generated Types

The generated types show the runtime model already expects:

- `shipment_status_history`: [`/workspaces/nexus/app/src/types/database.ts`](/workspaces/nexus/app/src/types/database.ts#L664)
- enriched `shipments` rows with JSON addresses and operational metadata: [`/workspaces/nexus/app/src/types/database.ts`](/workspaces/nexus/app/src/types/database.ts#L727)
- `tracking_updates`: [`/workspaces/nexus/app/src/types/database.ts`](/workspaces/nexus/app/src/types/database.ts#L939)

### Gaps

- Canonical app status constants are still missing intake states: [`/workspaces/nexus/app/src/types/index.ts`](/workspaces/nexus/app/src/types/index.ts#L118)
- Zod schemas still reflect a legacy status model: [`/workspaces/nexus/app/src/lib/schemas/shipment.ts`](/workspaces/nexus/app/src/lib/schemas/shipment.ts#L26)
- There is no dedicated validation schema yet for:
  - customer shipment requests
  - staff induction audit
  - allowed status transitions

## Recommended Execution Plan

### Phase 1: Canonical Workflow Model

1. Update the canonical shipment status set in [`/workspaces/nexus/app/src/types/index.ts`](/workspaces/nexus/app/src/types/index.ts).
2. Introduce intake states:
   - `pending_dropoff`
   - `scheduled_for_pickup`
3. Define the allowed transition graph for all statuses.

### Phase 2: Supabase Enforcement

1. Add a migration against the live schema for any missing intake or audit fields.
2. Tighten RLS so customers cannot update shipment statuses.
3. Restrict shipment mutation and status history writes to admin/ops roles.
4. Add a database-side transition guard using a function, trigger, or RPC boundary.

### Phase 3: Validation Layer

1. Replace the legacy shipment Zod status enum.
2. Split schemas into:
   - customer request schema
   - staff shipment schema
   - staff induction audit schema
   - status transition schema
3. Remove `status` from customer-controlled payloads.

### Phase 4: Customer And Staff Creation Flows

1. Refactor customer shipment creation into a shipment request flow.
2. Force initial status to `pending_dropoff` or `scheduled_for_pickup`.
3. Keep staff shipment creation separate for internal ops use.
4. Generate tracking numbers without implying active induction.

### Phase 5: Admin Induction Workflow

1. Add an intake audit UI to the shipment detail/admin flow.
2. Capture actual weight and dimensions.
3. Require audit completion before first operational transition.
4. Record induction in `shipment_status_history`.

### Phase 6: Operations UI Permissions

1. Narrow route access to:
   - `super_admin`
   - `operations_manager`
   - `logistics_coordinator`
2. Hide status controls for all other roles.
3. Prevent `viewer` and support roles from receiving shipment transition controls.

### Phase 7: Tracking Page Redesign

1. Extend the tracking data loader to fetch both:
   - `shipment_status_history`
   - `tracking_updates`
2. Rebuild the timeline from `shipment_status_history`.
3. Add Sender and Recipient cards.
4. Add a visible support block with `ceo@nimdeshop.com`.

### Phase 8: Map Trail Completion

1. Normalize trail coordinates from origin through live position.
2. Ensure the displayed line always includes origin.
3. Refresh the trail source alongside live marker updates.

### Phase 9: Testing

1. Add tests for allowed and blocked transitions.
2. Add tests for customer create defaults.
3. Add tracking page tests for status-history rendering.
4. Add map tests for trail coordinate composition.
5. Add role-access tests for operations views.

## Priority Order

Recommended build order:

1. Canonical statuses and transition rules
2. Supabase/RLS enforcement
3. Validation schema split
4. Admin induction audit
5. Tracking page redesign
6. Map trail completion
7. Test coverage

## Final Assessment

The current codebase is close enough to support the real-world workflow, but it is not enforcing it yet.

The good news is the app already has the right architectural anchors:

- status history table
- tracking updates table
- richer shipment model
- operations update flow

The next milestone is to turn those primitives into a strict workflow contract, with the database as the ultimate enforcement layer and the UI reflecting that contract cleanly.
