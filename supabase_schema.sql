-- =====================================================
-- SWISH PORTAL - LIVE ENTERPRISE SUPABASE SCHEMA
-- Reference snapshot aligned to the current live schema
-- plus /supabase/migrations/20240326_add_facilities.sql
-- =====================================================

-- ==========================================
-- 1. THE DEMOLITION BLOCK (Clear old schema)
-- ==========================================
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS simulation_paths CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS exceptions CASCADE;
DROP TABLE IF EXISTS tracking_updates CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS shipment_milestones CASCADE;
DROP TABLE IF EXISTS shipment_status_history CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. THE ENTERPRISE SCHEMA BUILD
-- ==========================================

-- PROFILES (Extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  department TEXT,
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
  address JSONB,
  tax_id TEXT,
  credit_limit DECIMAL(12,2),
  payment_terms INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active',
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
  sub_status TEXT,

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
  transport_mode TEXT NOT NULL,
  service_type TEXT DEFAULT 'standard',

  -- Cargo Details
  weight_kg FLOAT8 NOT NULL,
  volume_cbm FLOAT8,
  pieces INTEGER DEFAULT 1,
  cargo_description TEXT,
  cargo_type TEXT,
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
  additional_charges JSONB,
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
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
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
  type TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_by_role TEXT,
  location_lat FLOAT8,
  location_lng FLOAT8,
  location_accuracy FLOAT8,
  captured_at TIMESTAMP WITH TIME ZONE,
  signed_by TEXT,
  signature_url TEXT,
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
  source TEXT NOT NULL,
  recorded_by UUID REFERENCES profiles(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXCEPTIONS / ISSUES
CREATE TABLE exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
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
  status TEXT DEFAULT 'draft',
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
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PREDEFINED SIMULATION PATHS
CREATE TABLE simulation_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  transport_mode TEXT,
  path_data JSONB NOT NULL,
  origin_city TEXT,
  destination_city TEXT,
  estimated_duration_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FACILITIES (Location Autocomplete)
CREATE TABLE facilities (
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

-- ==========================================
-- 3. INDEXES
-- ==========================================
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipment_status_history_shipment_id ON shipment_status_history(shipment_id);
CREATE INDEX idx_shipment_milestones_shipment_id ON shipment_milestones(shipment_id);
CREATE INDEX idx_documents_shipment_id ON documents(shipment_id);
CREATE INDEX idx_tracking_updates_shipment_id ON tracking_updates(shipment_id);
CREATE INDEX idx_tracking_updates_created_at ON tracking_updates(created_at);
CREATE INDEX idx_exceptions_shipment_id ON exceptions(shipment_id);
CREATE INDEX idx_invoices_shipment_id ON invoices(shipment_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_facilities_active ON facilities(is_active);
CREATE INDEX idx_facilities_type ON facilities(type);

-- ==========================================
-- 4. OPTIONAL DEMO / REFERENCE DATA
-- ==========================================
INSERT INTO simulation_paths (
  name,
  description,
  transport_mode,
  path_data,
  origin_city,
  destination_city,
  estimated_duration_hours
) VALUES
(
  'Shanghai to Los Angeles (Ocean)',
  'Major transpacific shipping route',
  'ocean',
  '[[31.2304, 121.4737], [32.0, 125.0], [35.0, 140.0], [38.0, 160.0], [37.0, 180.0], [35.0, -160.0], [34.0, -140.0], [33.7, -118.2]]'::jsonb,
  'Shanghai, China',
  'Los Angeles, USA',
  336
),
(
  'Rotterdam to New York (Ocean)',
  'Transatlantic shipping route',
  'ocean',
  '[[51.9244, 4.4777], [50.0, 0.0], [48.0, -20.0], [45.0, -40.0], [42.0, -60.0], [40.7, -74.0]]'::jsonb,
  'Rotterdam, Netherlands',
  'New York, USA',
  168
),
(
  'Dubai to London (Air)',
  'Major air freight corridor',
  'air',
  '[[25.2048, 55.2708], [28.0, 45.0], [35.0, 30.0], [42.0, 20.0], [48.0, 10.0], [51.5, -0.1]]'::jsonb,
  'Dubai, UAE',
  'London, UK',
  8
)
ON CONFLICT DO NOTHING;

INSERT INTO facilities (name, code, type, lat, lng, city, country, timezone, address) VALUES
('Accra Main Hub', 'ACC-HUB-001', 'hub', 5.6037, -0.1870, 'Accra', 'Ghana', 'Africa/Accra',
 '{"street": "Tema Motorway", "city": "Accra", "country": "Ghana", "postal_code": "GA-000"}'::jsonb),
('Tema Port Sorting', 'TMP-PRT-001', 'port', 5.6354, 0.0071, 'Tema', 'Ghana', 'Africa/Accra',
 '{"street": "Tema Harbour", "city": "Tema", "country": "Ghana"}'::jsonb),
('Kumasi Regional Facility', 'KMS-REG-001', 'warehouse', 6.6666, -1.6163, 'Kumasi', 'Ghana', 'Africa/Accra',
 '{"street": "Asafo Road", "city": "Kumasi", "country": "Ghana"}'::jsonb),
('Takoradi Depot', 'TKD-DEP-001', 'depot', 4.9014, -1.7547, 'Takoradi', 'Ghana', 'Africa/Accra',
 '{"street": "Market Circle", "city": "Takoradi", "country": "Ghana"}'::jsonb),
('Tamale Office', 'TML-OFC-001', 'office', 9.4008, -0.8423, 'Tamale', 'Ghana', 'Africa/Accra',
 '{"street": "Main Street", "city": "Tamale", "country": "Ghana"}'::jsonb),
('Kotoka International Airport', 'ACC-ARP-001', 'airport', 5.6052, -0.1668, 'Accra', 'Ghana', 'Africa/Accra',
 '{"street": "Airport City", "city": "Accra", "country": "Ghana"}'::jsonb),
('London Distribution Centre', 'LDN-HUB-001', 'hub', 51.5074, -0.1278, 'London', 'UK', 'Europe/London',
 '{"street": "123 Logistics Way", "city": "London", "postal_code": "SW1A 1AA", "country": "United Kingdom"}'::jsonb),
('Rotterdam Port Facility', 'RTM-PRT-001', 'port', 51.9244, 4.4777, 'Rotterdam', 'Netherlands', 'Europe/Amsterdam',
 '{"street": "Port Boulevard", "city": "Rotterdam", "country": "Netherlands"}'::jsonb),
('Shanghai Bonded Warehouse', 'SHG-WHS-001', 'warehouse', 31.2304, 121.4737, 'Shanghai', 'China', 'Asia/Shanghai',
 '{"street": "Pudong New Area", "city": "Shanghai", "country": "China"}'::jsonb),
('Los Angeles Hub', 'LAX-HUB-001', 'hub', 34.0522, -118.2437, 'Los Angeles', 'USA', 'America/Los_Angeles',
 '{"street": "1234 Commerce Blvd", "city": "Los Angeles", "state": "CA", "postal_code": "90001", "country": "USA"}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 5. HELPER FUNCTIONS AND TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_shipment_location(
  p_shipment_id UUID,
  p_lat FLOAT8,
  p_lng FLOAT8,
  p_heading FLOAT8 DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE shipments
  SET
    current_lat = p_lat,
    current_lng = p_lng,
    current_heading = COALESCE(p_heading, current_heading),
    updated_at = NOW()
  WHERE id = p_shipment_id;

  INSERT INTO tracking_updates (
    shipment_id,
    lat,
    lng,
    heading,
    source,
    metadata
  )
  VALUES (
    p_shipment_id,
    p_lat,
    p_lng,
    p_heading,
    'system',
    jsonb_build_object('event_type', 'location-update')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_shipment_with_tracking(p_tracking_number TEXT)
RETURNS TABLE (
  shipment JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', s.id,
    'tracking_number', s.tracking_number,
    'status', s.status,
    'sub_status', s.sub_status,
    'origin_address', s.origin_address,
    'destination_address', s.destination_address,
    'origin_lat', s.origin_lat,
    'origin_lng', s.origin_lng,
    'destination_lat', s.destination_lat,
    'destination_lng', s.destination_lng,
    'current_lat', s.current_lat,
    'current_lng', s.current_lng,
    'current_heading', s.current_heading,
    'transport_mode', s.transport_mode,
    'service_type', s.service_type,
    'pickup_date', s.pickup_date,
    'delivery_date', s.delivery_date,
    'tracking_history', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', tu.id,
            'lat', tu.lat,
            'lng', tu.lng,
            'heading', tu.heading,
            'speed_kmh', tu.speed_kmh,
            'accuracy', tu.accuracy,
            'battery_level', tu.battery_level,
            'source', tu.source,
            'metadata', tu.metadata,
            'created_at', tu.created_at
          )
          ORDER BY tu.created_at
        )
        FROM tracking_updates tu
        WHERE tu.shipment_id = s.id
      ),
      '[]'::jsonb
    )
  )
  FROM shipments s
  WHERE s.tracking_number = p_tracking_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Placeholder helper kept because the live environment references it in ALTER FUNCTION.
CREATE OR REPLACE FUNCTION set_shipment_customer_id()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 6. REALTIME
-- ==========================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE shipment_status_history;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE tracking_updates;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE facilities;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- ==========================================
-- 7. ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Temporary "God Mode" policies for authenticated users.
-- Replace these with granular RBAC in the next hardening phase.
CREATE POLICY "Allow authenticated full access temporarily" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON shipments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON shipment_status_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON shipment_milestones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON tracking_updates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON exceptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON simulation_paths FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access temporarily" ON facilities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Facilities policies from the facilities migration.
CREATE POLICY "Users can view facilities" ON facilities
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Staff can manage facilities" ON facilities
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'operations_manager', 'logistics_coordinator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'operations_manager', 'logistics_coordinator')
    )
  );

-- ==========================================
-- 8. THE FUNCTION PATCH: Secure the Search Paths
-- ==========================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_shipment_location') THEN
    EXECUTE 'ALTER FUNCTION public.update_shipment_location SET search_path = public';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_shipment_with_tracking') THEN
    EXECUTE 'ALTER FUNCTION public.get_shipment_with_tracking SET search_path = public';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    EXECUTE 'ALTER FUNCTION public.update_updated_at_column SET search_path = public';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_shipment_customer_id') THEN
    EXECUTE 'ALTER FUNCTION public.set_shipment_customer_id SET search_path = public';
  END IF;
END $$;

-- =====================================================
-- END OF LIVE REFERENCE SCHEMA
-- =====================================================
