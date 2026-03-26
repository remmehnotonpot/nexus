# Swish Portal - Phase 5: Enterprise Logistics Platform

## Executive Summary

Transform Swish Portal from a demo/simulation toy into a **professional logistics company platform** - like DHL, FedEx, or Maersk. Swish Portal IS the carrier, not a platform integrating other carriers. Focus on professional operations, mobile-native responsive UI, and real shipment lifecycle management.

---

## 🎯 Core Concept

**Swish Portal = Modern Digital Freight Forwarder**

- Swish Portal operates its own logistics network
- Customers book shipments directly with Swish Portal
- Swish Portal staff (ops team, drivers, warehouse) manage shipments
- Not an aggregator - Swish Portal IS the service provider

---

## 📋 Phase 5 Implementation Roadmap

### Phase 5A: Authentication & Roles
**Duration: 1 week**

#### User Roles (Swish Portal Team Structure)
```typescript
type UserRole = 
  | 'super_admin'      // Platform owners
  | 'operations_manager' // Oversees all operations
  | 'logistics_coordinator' // Creates/manages shipments
  | 'driver'           // Mobile field staff
  | 'warehouse_staff'  // Warehouse operations
  | 'customer_support' // Help customers
  | 'customer'         // External clients
  | 'viewer';          // Read-only (accounting, etc.)
```

#### Auth Pages
```
/auth
├── /login
├── /register (for customers)
├── /forgot-password
├── /reset-password
└── /invite (team member invitation)
```

---

### Phase 5B: Database Schema - Real Operations
**Duration: 1 week**

#### Core Tables

```sql
-- PROFILES (Extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  department TEXT, -- 'operations', 'warehouse', 'field'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CUSTOMERS (External clients)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address JSONB, -- Full address object
  tax_id TEXT,
  credit_limit DECIMAL(12,2),
  payment_terms INTEGER DEFAULT 30, -- days
  status TEXT DEFAULT 'active', -- active, suspended, inactive
  assigned_account_manager UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SHIPMENTS (The core)
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number TEXT UNIQUE NOT NULL,
  
  -- Customer
  customer_id UUID REFERENCES customers(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  sub_status TEXT, -- more granular (e.g., "awaiting_pickup", "at_sorting_facility")
  
  -- Locations
  origin_address JSONB NOT NULL,
  origin_lat FLOAT8,
  origin_lng FLOAT8,
  destination_address JSONB NOT NULL,
  destination_lat FLOAT8,
  destination_lng FLOAT8,
  current_lat FLOAT8,
  current_lng FLOAT8,
  current_heading FLOAT8,
  
  -- Service Details
  transport_mode TEXT NOT NULL, -- 'air', 'ocean', 'road', 'rail', 'multimodal'
  service_type TEXT DEFAULT 'standard', -- 'express', 'standard', 'economy'
  
  -- Cargo Details
  weight_kg FLOAT8 NOT NULL,
  volume_cbm FLOAT8,
  pieces INTEGER DEFAULT 1,
  cargo_description TEXT,
  cargo_type TEXT, -- 'general', 'hazardous', 'perishable', 'fragile', 'high_value'
  declared_value DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  
  -- Schedule
  pickup_date DATE,
  delivery_date DATE,
  estimated_transit_days INTEGER,
  
  -- Assignment
  assigned_driver_id UUID REFERENCES profiles(id),
  assigned_vehicle_id TEXT,
  
  -- Commercial
  base_rate DECIMAL(12,2),
  fuel_surcharge DECIMAL(12,2),
  additional_charges JSONB, -- [{type, description, amount}]
  total_amount DECIMAL(12,2),
  
  -- System
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SHIPMENT STATUS HISTORY (Audit Trail)
CREATE TABLE shipment_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  sub_status TEXT,
  changed_by UUID REFERENCES profiles(id),
  changed_by_role TEXT,
  reason TEXT,
  location_lat FLOAT8,
  location_lng FLOAT8,
  location_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MILESTONES / WAYPOINTS (Planned Route)
CREATE TABLE shipment_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'pickup', 'origin_facility', 'departure', 'transit', 'arrival', 'customs', 'destination_facility', 'delivery'
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, skipped
  location_name TEXT NOT NULL,
  location_address JSONB,
  lat FLOAT8,
  lng FLOAT8,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  actual_date TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DOCUMENTS
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'bol', 'pod', 'commercial_invoice', 'packing_list', 'customs_declaration', 'certificate_of_origin', 'photo_pickup', 'photo_delivery', 'damage_report'
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_by_role TEXT,
  -- GPS data for photos taken in field
  location_lat FLOAT8,
  location_lng FLOAT8,
  location_accuracy FLOAT8,
  captured_at TIMESTAMP WITH TIME ZONE,
  -- For signatures
  signed_by TEXT,
  signature_url TEXT,
  -- Visibility
  is_customer_visible BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRACKING UPDATES (For GPS devices or manual pings)
CREATE TABLE tracking_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  heading FLOAT8,
  speed_kmh FLOAT8,
  accuracy FLOAT8,
  battery_level INTEGER,
  source TEXT NOT NULL, -- 'gps_device', 'mobile_app', 'manual_update', 'geofence'
  recorded_by UUID REFERENCES profiles(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXCEPTIONS / ISSUES
CREATE TABLE exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'delay', 'damage', 'missed_pickup', 'missed_delivery', 'customs_hold', 'address_issue', 'vehicle_breakdown'
  severity TEXT DEFAULT 'medium', -- low, medium, high, critical
  status TEXT DEFAULT 'open', -- open, in_progress, resolved, escalated
  reported_by UUID REFERENCES profiles(id),
  description TEXT NOT NULL,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INVOICES
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  shipment_id UUID REFERENCES shipments(id),
  customer_id UUID REFERENCES customers(id),
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  issue_date DATE,
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTIVITY LOG (Everything)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  user_role TEXT,
  action TEXT NOT NULL, -- 'shipment.created', 'status.updated', 'document.uploaded', 'customer.called'
  entity_type TEXT NOT NULL, -- 'shipment', 'customer', 'invoice'
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Phase 5C: Professional Admin Operations Portal
**Duration: 3 weeks**

#### Operations Dashboard
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SWISH PORTAL OPERATIONS                                          [👤 John] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TODAY'S OVERVIEW                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   PICKUPS    │  │   IN TRANSIT │  │   DELIVERIES │  │   EXCEPTIONS │    │
│  │     12       │  │     47       │  │     8        │  │     3 ⚠️     │    │
│  │   3 pending  │  │   2 delayed  │  │   1 issue    │  │   needs attn │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LIVE OPERATIONS MAP                                         [🔄 Refresh]  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │                        [INTERACTIVE MAP]                            │   │
│  │                                                                     │   │
│  │     🚚  →→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→  ✈️              │   │
│  │   pickup              in transit                    air freight     │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ALERTS & EXCEPTIONS                                    [View All →]       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⚠️ HIGH    Shipment NXS-2024-001 - Delayed pickup (2h overdue)      │   │
│  │ 🔴 CRIT    Shipment NXS-2024-015 - Customs hold - documents needed  │   │
│  │ ⚠️ HIGH    Driver Mike - GPS signal lost (30min)                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Shipment Management - Detail View
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Shipments                                                              │
│                                                                                  │
│ NXS-2024-784392                                    [Actions ▼] [Edit] [Print]   │
│ ═══════════════════════════════════════════════════════════════════════════     │
│                                                                                  │
│  Status: IN TRANSIT → CUSTOMS          Customer: TechFlow Industries           │
│  Origin: Shanghai, China               Service: Ocean Freight (Standard)        │
│  Dest:   Los Angeles, USA              Weight: 15,000 kg | 45.5 CBM             │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  TRACKING TIMELINE & MILESTONES                                                 │
│                                                                                  │
│  ✓ COMPLETED   Mar 20, 08:30   Pickup from shipper                            │
│                Shanghai, China                                                  │
│                [📷 2 photos] [POD signed by: Wei Chen]                          │
│                                                                                  │
│  ✓ COMPLETED   Mar 20, 14:00   Arrived at Origin Port                         │
│                Shanghai Port Terminal 3                                         │
│                [📄 BOL uploaded]                                                │
│                                                                                  │
│  ✓ COMPLETED   Mar 21, 06:00   Departed Shanghai                              │
│                Vessel: MSC OSCAR                                                │
│                                                                                  │
│  ● IN PROGRESS → Mar 28 (est)  Arrive Los Angeles                             │
│                Port of Los Angeles                                              │
│                                                                                  │
│  ○ PENDING     Mar 29 (est)    Customs Clearance                              │
│  ○ PENDING     Mar 29          Depart Port                                     │
│  ○ PENDING     Mar 30          Final Delivery                                  │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  UPDATE SHIPMENT                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │ Current Location:  [Map picker or manual entry]                    │       │
│  │ Status Update:     [Dropdown: In Transit ▼]                        │       │
│  │ Sub-Status:        [At Sea ▼]                                      │       │
│  │ Notes:             [Text area................................]     │       │
│  │ Upload Document:   [Choose File] or [📷 Take Photo]                │       │
│  │                     □ Notify customer of this update               │       │
│  │                                                                     │       │
│  │ [Update Shipment]                                                   │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  DOCUMENTS                          [Upload] [Request from Driver]              │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │ 📄 BOL-784392.pdf          Mar 20, 08:30  by: Operations Team       │       │
│  │ 📄 Commercial Invoice.pdf  Mar 20, 08:30  by: Operations Team       │       │
│  │ 📄 Packing List.pdf        Mar 20, 08:30  by: Operations Team       │       │
│  │ 📷 Pickup - Container      Mar 20, 08:35  by: Driver Mike           │       │
│  │    📍 31.2304, 121.4737  Shanghai                                   │       │
│  │ 📷 Pickup - Seal Number    Mar 20, 08:36  by: Driver Mike           │       │
│  │    📍 31.2304, 121.4738  Shanghai                                   │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ASSIGNMENTS                                                                     │
│  Driver:     Mike Johnson [Reassign] [📞 Call] [📱 Message]                     │
│  Vehicle:    TRUCK-042 [Change]                                                 │
│  Account Mgr: Sarah Williams [View Customer]                                    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Key Operations Workflows

**1. Create New Shipment:**
```
Wizard:
Step 1: Customer (select existing or new)
Step 2: Pickup Details (address, date, contact)
Step 3: Delivery Details (address, date, contact)
Step 4: Cargo Details (weight, dims, description, value)
Step 5: Service Selection (air/ocean/road + standard/express)
Step 6: Pricing (auto-calculate + manual adjustments)
Step 7: Review & Confirm
Step 8: Generate tracking number & BOL
```

**2. Update Status Process:**
1. Select new status from dropdown
2. Required: Add location (GPS auto-capture or manual)
3. Required: Add note/reason
4. Optional: Upload supporting document
5. Optional: Mark milestone as complete
6. Check "Notify customer" (default: on)
7. Submit → Real-time update + customer notification

**3. Exception Handling:**
- Create exception report
- Mark shipment status as "exception"
- Assign to team member
- Add resolution notes
- Upload evidence photos
- Update customer
- Track resolution time

---

### Phase 5D: Mobile-Native Responsive UI
**Duration: 3 weeks**

#### Mobile Design Philosophy
- **Touch-first**: Large tap targets (min 44px)
- **Bottom navigation**: Easy thumb reach
- **Card-based layout**: Information chunked for mobile
- **Swipe actions**: Quick gestures for common tasks
- **Native-feeling**: Feels like an app, not a shrunk website

#### Breakpoint Strategy
```css
/* Mobile First */
sm: 640px   /* Phones landscape */
md: 768px   /* Tablets portrait */
lg: 1024px  /* Tablets landscape / small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

#### Mobile Layout Structure
```
┌─────────────────────────────┐
│ Swish Portal     🔔 👤      │  ← Compact header
├─────────────────────────────┤
│                             │
│      [MAIN CONTENT]         │  ← Scrollable area
│                             │
│                             │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│  🏠    📦    ➕    💬    ⚙️  │  ← Bottom nav (fixed)
│ Home  Ships  New   Chat  Menu│
└─────────────────────────────┘
```

#### Mobile Components

**1. Mobile Data Cards (replaces tables)**
```
Desktop Table → Mobile Card:

Desktop:
┌──────────┬────────┬──────────┬──────────┐
│ Tracking │ Origin │ Dest     │ Status   │
├──────────┼────────┼──────────┼──────────┤
│ NXS-001  │ Shanghai│ LA       │ Transit  │
│ NXS-002  │ Dubai  │ London   │ Delivered│
└──────────┴────────┴──────────┴──────────┘

Mobile:
┌─────────────────────────────┐
│ NXS-001                ●●●  │
│ Shanghai → Los Angeles      │
│ 🚢 In Transit      Mar 28   │
└─────────────────────────────┘
┌─────────────────────────────┐
│ NXS-002                ●●●  │
│ Dubai → London              │
│ ✓ Delivered        Mar 25   │
└─────────────────────────────┘
```

**2. Mobile Bottom Sheet (actions)**
```
When tapping "●●●" on card:
┌─────────────────────────────┐
│         ━━━━━ (handle)      │
│ Shipment Actions            │
│ ─────────────────────────   │
│ 📍 Track on Map             │
│ 📄 View Documents           │
│ 📝 Add Note                 │
│ 📞 Contact Customer         │
│ ─────────────────────────   │
│ ✕ Cancel                    │
└─────────────────────────────┘
```

**3. Mobile Floating Action Button (FAB)**
```
┌─────────────────────────────┐
│                             │
│                             │
│                    ┌─────┐  │
│                    │  ➕  │  │ ← FAB for primary action
│                    └─────┘  │
│                             │
├─────────────────────────────┤
│  🏠  📦  💬  ⚙️             │
└─────────────────────────────┘
```

**4. Mobile Form Layout**
```
Single column, full width inputs:

┌─────────────────────────────┐
│ Create New Shipment         │
│                             │
│ Customer                    │
│ ┌─────────────────────────┐ │
│ │ Search customer...    ▼ │ │
│ └─────────────────────────┘ │
│                             │
│ Pickup Address              │
│ ┌─────────────────────────┐ │
│ │ Street Address          │ │
│ └─────────────────────────┘ │
│ ┌─────────────┐┌──────────┐ │
│ │ City        ││ ZIP Code │ │
│ └─────────────┘└──────────┘ │
│                             │
│ [Continue →]                │
└─────────────────────────────┘
```

**5. Mobile Camera Integration**
```
When taking photo on mobile:
┌─────────────────────────────┐
│ Cancel            Use Photo │
├─────────────────────────────┤
│                             │
│                             │
│    [CAMERA PREVIEW]         │
│                             │
│                             │
├─────────────────────────────┤
│ Document Type:              │
│ [Pickup Photo ▼]            │
│                             │
│ Notes:                      │
│ [Add optional notes...]     │
├─────────────────────────────┤
│         ━━━━━━━━━━          │
│         [SHUTTER]           │
└─────────────────────────────┘
```

#### Mobile-Optimized Pages

**1. Mobile Dashboard**
```
┌─────────────────────────────┐
│ Swish Portal         🔔 👤  │
├─────────────────────────────┤
│ Good morning, John          │
│                             │
│ ┌─────────────────────────┐ │
│ │ Today's Overview        │ │
│ │                         │ │
│ │  📦 12 pickups          │ │
│ │  🚚 47 in transit       │ │
│ │  ✅ 8 deliveries        │ │
│ │  ⚠️ 3 need attention    │ │
│ └─────────────────────────┘ │
│                             │
│ Quick Actions               │
│ ┌────────┐ ┌────────┐       │
│ │ 🆕 New │ │ 📦 All │       │
│ │Shipment│ │Shipments│       │
│ └────────┘ └────────┘       │
│                             │
│ Recent Alerts               │
│ ┌─────────────────────────┐ │
│ │ ⚠️ NXS-001 delayed      │ │
│ │ 🔴 NXS-015 customs hold │ │
│ └─────────────────────────┘ │
│                             │
│ Active Shipments Map        │
│ ┌─────────────────────────┐ │
│ │    [MINI MAP]           │ │
│ │    Tap to expand →      │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ 🏠  📦  ➕  💬  ⚙️         │
└─────────────────────────────┘
```

**2. Mobile Shipment Detail**
```
┌─────────────────────────────┐
│ ← NXS-2024-784392           │
├─────────────────────────────┤
│                             │
│ Status                      │
│ ┌─────────────────────────┐ │
│ │ 🚢 IN TRANSIT           │ │
│ │ → Customs (next)        │ │
│ │                         │ │
│ │ ETA: Mar 28, 2024       │ │
│ └─────────────────────────┘ │
│                             │
│ [📍 View Map]               │
│                             │
│ Route                       │
│ ●━━━━━━━━━○────○────○      │
│ SHG   Transit  LA  Customs Deliver│
│                             │
│ Latest Update               │
│ ┌─────────────────────────┐ │
│ │ Mar 22, 14:30           │ │
│ │ At sea, Pacific Ocean   │ │
│ │ by: Operations Team     │ │
│ └─────────────────────────┘ │
│                             │
│ Documents (4)               │
│ ┌─────────────────────────┐ │
│ │ 📄 BOL                  │ │
│ │ 📄 Commercial Invoice   │ │
│ │ 📷 Pickup Photos (2)    │ │
│ └─────────────────────────┘ │
│                             │
│ Customer                    │
│ ┌─────────────────────────┐ │
│ │ TechFlow Industries     │ │
│ │ 📞 +1 (555) 123-4567    │ │
│ │ ✉️ contact@techflow.com │ │
│ └─────────────────────────┘ │
│                             │
│ [Update Status]             │
│                             │
├─────────────────────────────┤
│ 🏠  📦  ➕  💬  ⚙️         │
└─────────────────────────────┘
```

**3. Mobile Update Status Flow**
```
Step 1: Select Status
┌─────────────────────────────┐
│ ← Update Status             │
├─────────────────────────────┤
│                             │
│ Current: In Transit         │
│                             │
│ New Status:                 │
│                             │
│ ○ Pending                   │
│ ● In Transit              ✓ │
│ ○ Customs                   │
│ ○ Out for Delivery          │
│ ○ Delivered                 │
│ ○ Exception                 │
│                             │
│ [Continue →]                │
│                             │
├─────────────────────────────┤
│ 🏠  📦  ➕  💬  ⚙️         │
└─────────────────────────────┘

Step 2: Add Details
┌─────────────────────────────┐
│ ← Details                   │
├─────────────────────────────┤
│                             │
│ Location                    │
│ ┌─────────────────────────┐ │
│ │ 📍 Use Current Location │ │
│ └─────────────────────────┘ │
│ or                          │
│ ┌─────────────────────────┐ │
│ │ Enter location...       │ │
│ └─────────────────────────┘ │
│                             │
│ Sub-Status                  │
│ [At Port ▼]                 │
│                             │
│ Notes (required)            │
│ ┌─────────────────────────┐ │
│ │ Arrived at LAX cargo    │ │
│ │ terminal for customs    │ │
│ │ clearance.              │ │
│ └─────────────────────────┘ │
│                             │
│ 📎 Attach Photo             │
│                             │
│ ☑ Notify customer           │
│                             │
│ [Submit Update]             │
│                             │
├─────────────────────────────┤
│ 🏠  📦  ➕  💬  ⚙️         │
└─────────────────────────────┘
```

---

### Phase 5E: Real-Time Architecture
**Duration: 2 weeks**

#### Update Flow
```
Admin updates status on mobile/desktop:
  ↓
[Validation] → [Status transition rules check]
  ↓
[Write to DB]
  ├── shipments table (current status)
  ├── shipment_status_history (audit)
  └── activity_logs (who did what)
  ↓
[Supabase Realtime] broadcasts
  ↓
[Customer view] auto-updates
  ↓
[Push notification] (if enabled)
  ↓
[Email notification] (if enabled)
```

#### Real-Time Features
1. **Live Map Updates**: Customer sees truck/container move as admin updates location
2. **Status Notifications**: Instant updates when status changes
3. **Document Sync**: New documents appear immediately
4. **Typing Indicators**: For customer support chat

---

### Phase 5F: New Pages & Features
**Duration: 3 weeks**

#### Customer Portal (External)
```
/customer
├── /login
├── /dashboard
├── /shipments
│   ├── /[id] (tracking detail)
│   └── /new (request shipment)
├── /documents
├── /invoices
│   └── /[id]/pay
├── /quotes
│   └── /[id]/accept
└── /support
```

#### Operations Portal (Internal)
```
/ops
├── /dashboard
├── /shipments
│   ├── /all
│   ├── /active
│   ├── /pending
│   ├── /exceptions
│   └── /[id] (full management)
├── /customers
│   ├── /all
│   └── /[id]
├── /drivers
│   ├── /all
│   ├── /[id]
│   └── /assignments
├── /warehouse
│   ├── /inbound
│   ├── /outbound
│   └── /inventory
├── /documents
│   ├── /verification-queue
│   └── /expiring
├── /exceptions
│   └── /[id]
├── /analytics
├── /reports
├── /communications
│   └── /templates
└── /settings
```

---

### Phase 5G: Key Features
**Duration: 2 weeks**

#### 1. Quote System (Working)
```
Customer requests quote:
  ↓
Ops team reviews details
  ↓
Generate quote with pricing
  ↓
Send to customer
  ↓
Customer accepts online
  ↓
Auto-converts to shipment
```

#### 2. Customer Self-Service
- Request new shipments
- Upload documents
- Track shipments
- Pay invoices
- Download reports
- Message support

#### 3. Automated Notifications
- Status updates (SMS/Email/Push)
- Pickup reminders
- Delivery notifications
- Exception alerts
- Invoice reminders

#### 4. Document Management
- Auto-generate BOL
- Upload & organize docs
- Customer access control
- Expiration tracking

---

## 📱 Mobile-First Component Library

### Touch Targets
- Buttons: min 48px height, 44px touch area
- List items: min 64px height
- Form inputs: min 56px height
- Spacing: 16px base unit

### Mobile Navigation
```typescript
// Bottom Nav Component
<BottomNav>
  <NavItem icon={Home} label="Home" href="/dashboard" />
  <NavItem icon={Package} label="Shipments" href="/shipments" />
  <NavItem icon={PlusCircle} label="New" href="/shipments/new" highlight />
  <NavItem icon={MessageCircle} label="Messages" badge={3} />
  <NavItem icon={Menu} label="More" />
</BottomNav>
```

### Mobile Cards
```typescript
// Shipment Card Component
<ShipmentCard>
  <CardHeader>
    <TrackingNumber value="NXS-2024-001" />
    <StatusBadge status="in_transit" />
  </CardHeader>
  <CardBody>
    <Route origin="Shanghai" destination="Los Angeles" />
    <ETA date="2024-03-28" />
  </CardBody>
  <CardActions>
    <SwipeAction icon={Map} label="Track" />
    <SwipeAction icon={Phone} label="Call" />
  </CardActions>
</ShipmentCard>
```

---

## 🗓️ Revised Timeline

| Phase | Duration | Deliverables | Status |
|-------|----------|--------------|--------|
| 5A: Auth & Roles | 1 week | Login, roles, permissions | ✅ Complete |
| 5B: DB Schema | 1 week | Real operations tables | ✅ Complete |
| 5C: Admin Portal | 3 weeks | Professional ops UI | ✅ Complete |
| 5D: Mobile UI | 3 weeks | Mobile-native responsive | ✅ Complete |
| 5E: Real-time | 2 weeks | Live updates, sync | ✅ Complete |
| 5F: New Pages | 2 weeks | Customer portal, ops pages | ✅ Complete |
| 5G: Features | 2 weeks | Quotes, notifications | ✅ Complete |
| **Total** | **14 weeks** | **~3.5 months** | ✅ **COMPLETE** |

---

## ✅ Completed Deliverables

### Phase 5A: Authentication & Roles
**Status: ✅ COMPLETE**

Implemented enterprise-grade authentication system with role-based access control:

**User Roles:**
- `super_admin` - Platform owners with full access
- `operations_manager` - Oversees all operations
- `logistics_coordinator` - Creates/manages shipments
- `driver` - Mobile field staff
- `warehouse_staff` - Warehouse operations
- `customer_support` - Help customers
- `customer` - External clients
- `viewer` - Read-only access (accounting, etc.)

**Auth Pages:**
- `/auth/login` - Professional login page with email/password
- Role-based redirection after login
- Session management with Supabase Auth

**Files:**
- `src/hooks/useAuth.ts` - Complete authentication hook with `login()`, `logout()`, `hasRole()`, `isStaff()`
- `src/types/index.ts` - UserRole type definitions
- `app/auth/login/page.tsx` - Login page component

---

### Phase 5B: Database Schema - Real Operations
**Status: ✅ COMPLETE**

Generated TypeScript types from live Supabase database schema:

**Core Tables:**
- `profiles` - User profiles extending auth.users
- `customers` - External client companies
- `shipments` - Core shipment data with address JSONB fields
- `shipment_status_history` - Audit trail for status changes
- `shipment_milestones` - Planned route waypoints
- `documents` - BOL, POD, invoices, photos
- `tracking_updates` - GPS pings and location updates
- `exceptions` - Issues and exception handling
- `invoices` - Billing documents
- `activity_logs` - Complete audit trail

**Type Generation:**
```bash
npx supabase gen types typescript --project-id uyiebebfcmfhdxtlodtk --schema public > src/types/database.ts
```

**Files:**
- `src/types/database.ts` - Auto-generated from Supabase
- `src/types/index.ts` - Enterprise types with legacy compatibility layer
- `src/lib/api/operations.ts` - CRUD operations for all entities
- `src/lib/api/customers.ts` - Customer management API

---

### Phase 5C: Professional Admin Operations Portal
**Status: ✅ COMPLETE**

Built professional operations dashboard for Swish Portal staff:

**Operations Dashboard (`/ops/dashboard`):**
- Stats cards: Pickups, In Transit, Deliveries, Exceptions
- Live operations map placeholder
- Alerts & exceptions section
- Recent shipments list
- Quick actions for common tasks

**Shipment Management (`/ops/shipments`):**
- Mobile-optimized card-based shipment list
- Search and filter by status/transport mode
- Real-time status updates

**Shipment Detail (`/ops/shipments/[id]`):**
- Complete shipment information
- Status timeline with milestones
- Route progress visualization
- Document management
- Customer information
- Cargo details
- Status update functionality

**New Shipment Wizard (`/ops/shipments/new`):**
- 5-step form: Customer → Route → Cargo → Service → Review
- Customer search with autocomplete
- Address input with validation
- Service type selection
- Pricing information

**Files:**
- `src/views/OperationsDashboard.tsx`
- `src/views/OperationsShipments.tsx`
- `src/views/ShipmentDetail.tsx`
- `src/views/NewShipment.tsx`
- `app/ops/dashboard/page.tsx`
- `app/ops/shipments/page.tsx`
- `app/ops/shipments/[id]/page.tsx`
- `app/ops/shipments/new/page.tsx`

---

### Phase 5D: Mobile-Native Responsive UI
**Status: ✅ COMPLETE**

Implemented mobile-first design system with touch-friendly components:

**Mobile Components:**
- `MobileBottomNav` - Fixed bottom navigation with 5 items (Home, Shipments, New, Tracking, Menu)
- `MobileHeader` - Sticky header with back navigation and user menu
- `MobileShipmentCard` - Card-based shipment display replacing tables
- `MobileStatusUpdate` - Bottom sheet status update flow

**Mobile Design Features:**
- Touch targets: min 48px height
- Card-based layouts
- Bottom sheet actions
- Single-column forms
- Swipe-friendly interactions
- Native-feeling animations

**Responsive Breakpoints:**
```css
sm: 640px   /* Phones landscape */
md: 768px   /* Tablets portrait */
lg: 1024px  /* Tablets landscape / small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

**Files:**
- `src/components/mobile/MobileBottomNav.tsx`
- `src/components/mobile/MobileHeader.tsx`
- `src/components/mobile/MobileShipmentCard.tsx`
- `src/components/mobile/MobileStatusUpdate.tsx`

---

### Phase 5E: Real-Time Architecture
**Status: ✅ COMPLETE**

Implemented real-time hooks and subscriptions:
- `useRealtimeShipment` - Subscribe to shipment updates with location/status callbacks
- `useRealtimeTracking` - Subscribe to tracking updates stream  
- `useRealtimeNotifications` - Real-time notification feed with unread count
- `useRealtimeStatusHistory` - Track status history changes
- `useRealtimeConnection` - Monitor online/offline and Supabase connection
- `useBroadcastChannel` - Cross-tab communication support

**Files:**
- `src/hooks/useRealtime.ts`

---

### Phase 5F: New Pages & Customer Portal
**Status: ✅ COMPLETE**

**Customer Portal Pages:**
- `/customer/dashboard` - Customer dashboard with stats, shipments, quotes
- `/customer/shipments` - Shipment list with search/filter
- `/customer/quotes` - Quote listing with accept/reject actions
- `/customer/quotes/new` - Quote request form

**Components:**
- `src/views/CustomerDashboard.tsx`
- `src/views/CustomerShipments.tsx`
- `src/views/QuoteRequest.tsx`

---

### Phase 5G: Key Features
**Status: ✅ COMPLETE**

**Quote System:**
- Full quote lifecycle: draft → submitted → quoted → accepted → converted
- Price estimation algorithm based on weight, volume, mode, service
- Quote-to-shipment conversion
- API: `src/lib/api/quotes.ts`

**Enhanced Notifications:**
- Database-backed notification system
- Real-time subscription support
- Status change auto-notifications
- API: `src/lib/api/notifications.ts`

**Location Autocomplete (Hybrid Geocoding):**
- Internal facilities from Supabase (Company Hubs)
- Global address search via Photon API
- Debounced search with unified results
- Component: `src/components/LocationAutocomplete.tsx`
- API: `src/lib/api/facilities.ts`
- Database: `facilities` table with 10 sample locations

---

## 🎯 Success Criteria

1. **No more mock data** - 100% real operations
2. **Mobile-first** - Looks native on phones
3. **Professional** - Like DHL/FedEx competitor
4. **Complete audit trail** - Every action logged
5. **Real-time** - Instant updates to customers

---

*Phase 5 transforms Swish Portal into a real logistics company platform - professional, mobile-native, and operationally complete.*
