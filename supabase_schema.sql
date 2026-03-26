-- =====================================================
-- SWISH PORTAL - SUPABASE DATABASE SCHEMA
-- Enterprise-Grade Logistics Platform
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. SHIPMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pending', 'in-transit', 'customs', 'delivered', 'delayed', 'out-for-delivery')),
  origin_city TEXT,
  origin_country TEXT,
  origin_lat FLOAT8,
  origin_lng FLOAT8,
  destination_city TEXT,
  destination_country TEXT,
  destination_lat FLOAT8,
  destination_lng FLOAT8,
  current_lat FLOAT8,
  current_lng FLOAT8,
  current_heading FLOAT8 DEFAULT 0,
  transport_mode TEXT CHECK (transport_mode IN ('air', 'ocean', 'road', 'rail')),
  is_live_demo BOOLEAN DEFAULT FALSE,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  weight_kg FLOAT8,
  volume_cbm FLOAT8,
  goods_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster tracking number lookups
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_customer ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_demo ON shipments(is_live_demo);

-- =====================================================
-- 2. TRACKING HISTORY (For the "Trail" on the map)
-- =====================================================
CREATE TABLE IF NOT EXISTS tracking_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location_name TEXT,
  event_type TEXT CHECK (event_type IN ('location-update', 'checkpoint', 'customs-clearance', 'departure', 'arrival', 'delay'))
);

-- Create index for faster shipment lookups
CREATE INDEX IF NOT EXISTS idx_tracking_logs_shipment ON tracking_logs(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_logs_timestamp ON tracking_logs(timestamp);

-- =====================================================
-- 3. INVOICES TABLE (For billing)
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id),
  shipment_id UUID REFERENCES shipments(id),
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- =====================================================
-- 4. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id),
  shipment_id UUID REFERENCES shipments(id),
  type TEXT CHECK (type IN ('status-update', 'delay-alert', 'delivery-confirmation', 'customs-hold', 'payment-due')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- =====================================================
-- 5. PREDEFINED SIMULATION PATHS
-- =====================================================
CREATE TABLE IF NOT EXISTS simulation_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  transport_mode TEXT CHECK (transport_mode IN ('air', 'ocean', 'road', 'rail')),
  path_data JSONB NOT NULL, -- Array of [lat, lng] coordinates
  origin_city TEXT,
  destination_city TEXT,
  estimated_duration_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. ENABLE REALTIME FOR CRITICAL TABLES
-- =====================================================
-- Enable realtime extension
BEGIN;
  -- Drop existing publication if exists
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create new publication
  CREATE PUBLICATION supabase_realtime;
  
  -- Add tables to publication
  ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
  ALTER PUBLICATION supabase_realtime ADD TABLE tracking_logs;
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
COMMIT;

-- =====================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Shipments policies
CREATE POLICY "Users can view own shipments" ON shipments
  FOR SELECT USING (auth.uid() = customer_id OR is_live_demo = TRUE);

CREATE POLICY "Users can insert own shipments" ON shipments
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own shipments" ON shipments
  FOR UPDATE USING (auth.uid() = customer_id);

-- Tracking logs policies
CREATE POLICY "Users can view tracking for own shipments" ON tracking_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shipments 
      WHERE shipments.id = tracking_logs.shipment_id 
      AND (shipments.customer_id = auth.uid() OR shipments.is_live_demo = TRUE)
    )
  );

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = customer_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = customer_id);

-- =====================================================
-- 8. SAMPLE DATA FOR DEMO
-- =====================================================

-- Insert sample simulation paths
INSERT INTO simulation_paths (name, description, transport_mode, path_data, origin_city, destination_city, estimated_duration_hours) VALUES
('Shanghai to Los Angeles (Ocean)', 'Major transpacific shipping route', 'ocean', 
 '[[31.2304, 121.4737], [32.0, 125.0], [35.0, 140.0], [38.0, 160.0], [37.0, 180.0], [35.0, -160.0], [34.0, -140.0], [33.7, -118.2]]'::jsonb,
 'Shanghai, China', 'Los Angeles, USA', 336),

('Rotterdam to New York (Ocean)', 'Transatlantic shipping route', 'ocean',
 '[[51.9244, 4.4777], [50.0, 0.0], [48.0, -20.0], [45.0, -40.0], [42.0, -60.0], [40.7, -74.0]]'::jsonb,
 'Rotterdam, Netherlands', 'New York, USA', 168),

('Dubai to London (Air)', 'Major air freight corridor', 'air',
 '[[25.2048, 55.2708], [28.0, 45.0], [35.0, 30.0], [42.0, 20.0], [48.0, 10.0], [51.5, -0.1]]'::jsonb,
 'Dubai, UAE', 'London, UK', 8),

('Singapore to Sydney (Ocean)', 'Asia-Pacific shipping route', 'ocean',
 '[[1.3521, 103.8198], [-5.0, 110.0], [-15.0, 120.0], [-25.0, 130.0], [-33.9, 151.2]]'::jsonb,
 'Singapore', 'Sydney, Australia', 120),

('Hong Kong to Hamburg (Rail)', 'China-Europe rail corridor', 'rail',
 '[[22.3193, 114.1694], [30.0, 110.0], [40.0, 80.0], [50.0, 40.0], [53.5, 10.0]]'::jsonb,
 'Hong Kong, China', 'Hamburg, Germany', 288)

ON CONFLICT DO NOTHING;

-- Insert a demo shipment
INSERT INTO shipments (
  tracking_number, 
  status, 
  origin_city, 
  origin_country, 
  origin_lat, 
  origin_lng,
  destination_city, 
  destination_country, 
  destination_lat, 
  destination_lng,
  current_lat, 
  current_lng, 
  current_heading,
  transport_mode,
  is_live_demo, 
  estimated_arrival,
  goods_description,
  weight_kg,
  volume_cbm
) VALUES (
  'NXS-DEMO-001',
  'in-transit',
  'Shanghai',
  'China',
  31.2304,
  121.4737,
  'Los Angeles',
  'USA',
  34.0522,
  -118.2437,
  31.2304,
  121.4737,
  45,
  'ocean',
  TRUE,
  NOW() + INTERVAL '14 days',
  'Electronics - Consumer Goods',
  15000,
  45.5
)
ON CONFLICT (tracking_number) DO NOTHING;

-- Insert initial tracking log for demo shipment
INSERT INTO tracking_logs (shipment_id, lat, lng, location_name, event_type)
SELECT 
  id,
  origin_lat,
  origin_lng,
  origin_city || ' Port',
  'departure'
FROM shipments 
WHERE tracking_number = 'NXS-DEMO-001'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. FUNCTIONS FOR SIMULATION
-- =====================================================

-- Function to update shipment location
CREATE OR REPLACE FUNCTION update_shipment_location(
  p_shipment_id UUID,
  p_lat FLOAT8,
  p_lng FLOAT8,
  p_heading FLOAT8 DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update shipment current location
  UPDATE shipments 
  SET 
    current_lat = p_lat,
    current_lng = p_lng,
    current_heading = COALESCE(p_heading, current_heading),
    updated_at = NOW()
  WHERE id = p_shipment_id;
  
  -- Insert tracking log
  INSERT INTO tracking_logs (shipment_id, lat, lng, event_type)
  VALUES (p_shipment_id, p_lat, p_lng, 'location-update');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get shipment with latest tracking
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
    'origin', jsonb_build_object('city', s.origin_city, 'country', s.origin_country, 'lat', s.origin_lat, 'lng', s.origin_lng),
    'destination', jsonb_build_object('city', s.destination_city, 'country', s.destination_country, 'lat', s.destination_lat, 'lng', s.destination_lng),
    'current', jsonb_build_object('lat', s.current_lat, 'lng', s.current_lng, 'heading', s.current_heading),
    'transport_mode', s.transport_mode,
    'estimated_arrival', s.estimated_arrival,
    'tracking_history', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object('lat', tl.lat, 'lng', tl.lng, 'timestamp', tl.timestamp, 'event_type', tl.event_type)
        ORDER BY tl.timestamp
      )
      FROM tracking_logs tl
      WHERE tl.shipment_id = s.id
      ), '[]'::jsonb
    )
  )
  FROM shipments s
  WHERE s.tracking_number = p_tracking_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. FACILITIES TABLE (For Location Autocomplete)
-- =====================================================

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

CREATE INDEX IF NOT EXISTS idx_facilities_active ON facilities(is_active);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities(type);

-- Enable RLS
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

-- Facilities policies (readable by all authenticated users)
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

-- Insert sample facilities
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

-- Add trigger for updated_at
CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for facilities
ALTER PUBLICATION supabase_realtime ADD TABLE facilities;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
