-- =====================================================
-- MIGRATION: Add Facilities Table for Location Autocomplete
-- Date: 2024-03-26
-- =====================================================

-- Create facilities table
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

-- Create indexes
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

-- Add trigger for updated_at (requires update_updated_at_column function to exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER update_facilities_updated_at
      BEFORE UPDATE ON facilities
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable realtime for facilities (check if publication exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE facilities;
  END IF;
END $$;
