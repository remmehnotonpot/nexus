# Swish Portal: Hybrid Location Autocomplete Architecture

## Status: ✅ IMPLEMENTED

---

## Executive Summary
For the Phase 5 Enterprise Admin UI, manual latitude/longitude entry is a severe operational bottleneck. Dispatchers and admins operate using location names, not coordinates. 

To solve this, we implemented a **Hybrid Geocoding Strategy** within the `DriverPingSimulator` and standard Shipment Creation forms. This system combines an internal, high-speed database of company-owned facilities with a fallback to a global, open-source geocoding API for custom addresses.

---

## 🏗️ The Hybrid Architecture

The location input component seamlessly merges two distinct data sources into a single, unified search dropdown.

### 1. Primary Source: Internal Facilities (Supabase)
Real logistics companies have fixed nodes in their network (e.g., "Accra Main Hub", "Tema Port Sorting", "Kumasi Regional Facility"). 

* **Engineering:** A new `facilities` table in Supabase stores the exact names, latitudes, and longitudes of these fixed locations.
* **Performance:** Queries to this table are virtually instantaneous. 
* **UX:** When the user clicks the search bar, these populate immediately as "Quick Select" options before they even start typing.

### 2. Secondary Source: Global Address Search (Photon API)
For customer pickups or final-mile deliveries outside the fixed network, the system falls back to a global search.

* **Engineering:** We utilize the Photon API (`https://photon.komoot.io`), an open-source geocoder built on OpenStreetMap data. 
* **Advantages:** Zero API keys required, no billing limits, and highly accurate global data.
* **Mechanism:** As the user types (e.g., "Kotoka International"), the input debounces the keystrokes and fires a `GET` request to Photon, parsing the returned GeoJSON into selectable dropdown items.

---

## 🔄 Data Flow & State Management

The frontend implementation relies on a unified React component (`LocationAutocomplete.tsx`) using `shadcn/ui`'s Command/Combobox primitive.

### 1. The Search Sequence
1.  **Focus:** User clicks the input. Internal `facilities` are fetched from Supabase and displayed immediately under a "Company Hubs" heading.
2.  **Type:** User begins typing. A custom hook (`useDebounce`) waits for 300ms of typing inactivity to prevent spamming the external API.
3.  **Fetch:** The `geocoding.ts` utility fires the query to the Photon API.
4.  **Merge:** The UI displays any matching internal hubs *first*, followed by the external Photon results under a "Global Addresses" heading.

### 2. The Selection Event
When the admin clicks a result, the UI doesn't just save the text string. It extracts the underlying geometry.

```typescript
// Unified Location Object
interface ExtractedLocation {
  name: string;          // e.g., "Tema Port"
  formatted_address?: string; 
  lat: number;           // e.g., 5.6354
  lng: number;           // e.g., 0.0071
  source: 'internal_hub' | 'photon_api';
  code?: string;         // e.g., "TMP-PRT-001"
  type?: string;         // e.g., "port", "hub", "warehouse"
}
```

---

## 📁 Implementation Files

### Frontend
- **`src/components/LocationAutocomplete.tsx`** - Main autocomplete component with hybrid search
- **`src/lib/geocoding.ts`** - Photon API integration (existing, enhanced for debouncing)

### Backend / API
- **`src/lib/api/facilities.ts`** - CRUD operations for facilities
- **`supabase/migrations/20240326_add_facilities.sql`** - Database migration

### Usage
- **`src/components/DriverPingSimulator.tsx`** - Updated to use LocationAutocomplete
- **`src/views/QuoteRequest.tsx`** - Quote form with location autocomplete

---

## 🗄️ Database Schema

### Facilities Table
```sql
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  type TEXT CHECK (type IN ('hub', 'warehouse', 'port', 'airport', 'depot', 'office', 'partner')),
  address JSONB,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  city TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  operating_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RLS Policies
```sql
-- Users can view active facilities
CREATE POLICY "Users can view facilities" ON facilities
  FOR SELECT USING (is_active = TRUE);

-- Staff can manage facilities
CREATE POLICY "Staff can manage facilities" ON facilities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'operations_manager', 'logistics_coordinator')
    )
  );
```

---

## 📍 Sample Facilities (Included)

10 sample facilities are pre-loaded:
- Accra Main Hub (Ghana)
- Tema Port Sorting (Ghana)
- Kumasi Regional Facility (Ghana)
- Takoradi Depot (Ghana)
- Tamale Office (Ghana)
- Kotoka International Airport (Ghana)
- London Distribution Centre (UK)
- Rotterdam Port Facility (Netherlands)
- Shanghai Bonded Warehouse (China)
- Los Angeles Hub (USA)

---

## 🔧 Configuration

No API keys required for Photon - it works out of the box!

### Environment Variables (Optional)
If you want to use a different geocoding service:
```bash
# Optional: Custom geocoding API
NEXT_PUBLIC_GEOCODING_API_URL=https://photon.komoot.io
```

---

## 🎯 Success Metrics

- ✅ Zero API key requirements for geocoding
- ✅ Sub-100ms internal facility queries
- ✅ Debounced external API calls (300ms)
- ✅ Unified UX for internal and external locations
- ✅ Type-safe location objects with full coordinates

---

*This architecture enables dispatchers to work with location names while the system automatically handles coordinate extraction for GPS tracking and mapping.*
