-- =====================================================
-- INSERT GOLD SHIPMENT - USA TO BELGIUM (Updated Schema)
-- Freight Registration Letter: GOLD BARS Shipment
-- =====================================================

-- First, ensure we have a customer record for the consignee (Marc Van Daele)
-- If customer already exists, this will be skipped due to ON CONFLICT
INSERT INTO customers (
  company_name,
  contact_name,
  email,
  phone,
  address,
  status,
  notes
) VALUES (
  'Van Daele Holdings NV',
  'Marc Van Daele',
  'marc.vandaele@example.com',
  '+32 3 123 4567',
  '{"street": "Industrielaan 25", "city": "Sint-Niklaas", "postal_code": "9100", "country": "Belgium"}'::jsonb,
  'active',
  'Consignee for gold shipment NXS-GOLD-TX-BE-001. VIP client - diplomatic delivery required.'
)
ON CONFLICT DO NOTHING;

-- Get the customer ID (whether just created or existing)
DO $$
DECLARE
  v_customer_id UUID;
  v_shipment_id UUID;
BEGIN
  -- Get customer ID
  SELECT id INTO v_customer_id FROM customers WHERE contact_name = 'Marc Van Daele' LIMIT 1;
  
  -- If no customer found, create a generic one
  IF v_customer_id IS NULL THEN
    INSERT INTO customers (company_name, contact_name, email, status)
    VALUES ('Van Daele Holdings NV', 'Marc Van Daele', 'marc.vandaele@example.com', 'active')
    RETURNING id INTO v_customer_id;
  END IF;

  -- Insert the shipment
  INSERT INTO shipments (
    tracking_number,
    customer_id,
    status,
    sub_status,
    origin_address,
    origin_lat,
    origin_lng,
    destination_address,
    destination_lat,
    destination_lng,
    current_lat,
    current_lng,
    current_heading,
    transport_mode,
    service_type,
    weight_kg,
    volume_cbm,
    pieces,
    cargo_description,
    cargo_type,
    declared_value,
    currency,
    pickup_date,
    delivery_date,
    estimated_transit_days,
    base_rate,
    fuel_surcharge,
    additional_charges,
    total_amount
  ) VALUES (
    'NXS-GOLD-TX-BE-001',
    v_customer_id,
    'pending',
    'awaiting_payment',
    '{"city": "Texas", "state": "Texas", "country": "USA", "address_line": "Shipper: Eric Steele"}'::jsonb,
    31.9686,                -- Texas approximate center lat
    -99.9018,               -- Texas approximate center lng
    '{"city": "Sint-Niklaas", "postal_code": "9100", "country": "Belgium", "address_line": "Consignee: Marc Van Daele, Diplomatic Home Delivery"}'::jsonb,
    51.1656,                -- Sint-Niklaas lat
    4.1392,                 -- Sint-Niklaas lng
    31.9686,                -- Current location (at origin)
    -99.9018,
    45,                     -- Heading
    'air',                  -- Air freight
    'diplomatic',           -- Diplomatic home delivery service
    96,                     -- Weight in kg
    0.5,                    -- Volume in cbm (1 pallet)
    1,                      -- 1 pallet
    'GOLD BARS - 94% Purity, 22+ Carat Fineness. High-value precious metals shipment requiring specialized handling and diplomatic clearance.',
    'high_value',
    500000.00,              -- Declared value (estimated for gold)
    'USD',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '5 days',
    5,                      -- 5 days estimated transit
    1287.57,                -- Freight rate
    1446.40,                -- Mandatory surcharges
    '{
      "registration_admin_fees": 1505.91,
      "specialized_handling": 1455.00,
      "customs_transmission": 3942.95,
      "spa_ctn_certificate": 2039.93,
      "cca_fee": 2269.01,
      "awb_preparation": 9600.00,
      "regulatory_handling": 1585.45,
      "terminal_handling_thc": 867.78
    }'::jsonb,
    26000.00                -- Total amount
  )
  ON CONFLICT (tracking_number) DO NOTHING
  RETURNING id INTO v_shipment_id;

  -- If shipment was inserted (not conflict), add related records
  IF v_shipment_id IS NOT NULL THEN
    
    -- Insert initial status history
    INSERT INTO shipment_status_history (
      shipment_id,
      previous_status,
      new_status,
      sub_status,
      reason,
      location_name,
      notes
    ) VALUES (
      v_shipment_id,
      'draft',
      'pending',
      'awaiting_payment',
      'Freight registration letter received. Shipment registered in system.',
      'Texas, USA',
      'Gold shipment registered by Eric Steele for Marc Van Daele. Total cost: $26,000. Payment required prior to departure.'
    );

    -- Insert first milestone (origin pickup)
    INSERT INTO shipment_milestones (
      shipment_id,
      sequence,
      type,
      status,
      location_name,
      location_address,
      lat,
      lng,
      scheduled_date,
      notes
    ) VALUES (
      v_shipment_id,
      1,
      'pickup',
      'pending',
      'Texas, USA - Shipper Location',
      '{"city": "Texas", "country": "USA", "contact": "Eric Steele"}'::jsonb,
      31.9686,
      -99.9018,
      CURRENT_DATE,
      'Pickup of gold bars pallet (96kg) from Eric Steele'
    );

    -- Insert second milestone (destination delivery)
    INSERT INTO shipment_milestones (
      shipment_id,
      sequence,
      type,
      status,
      location_name,
      location_address,
      lat,
      lng,
      scheduled_date,
      notes
    ) VALUES (
      v_shipment_id,
      2,
      'delivery',
      'pending',
      'Sint-Niklaas, Belgium - Consignee Location',
      '{"city": "Sint-Niklaas", "postal_code": "9100", "country": "Belgium", "contact": "Marc Van Daele"}'::jsonb,
      51.1656,
      4.1392,
      CURRENT_DATE + INTERVAL '5 days',
      'Diplomatic home delivery to Marc Van Daele'
    );

    -- Insert tracking update (initial registration) - USING tracking_updates TABLE
    INSERT INTO tracking_updates (
      shipment_id,
      lat,
      lng,
      heading,
      source,
      metadata
    ) VALUES (
      v_shipment_id,
      31.9686,
      -99.9018,
      45,
      'manual',
      '{"event": "shipment_registered", "notes": "Shipment registered in system. Awaiting payment confirmation."}'::jsonb
    );

    -- Insert invoice with full cost breakdown
    INSERT INTO invoices (
      invoice_number,
      shipment_id,
      customer_id,
      amount,
      tax_amount,
      total_amount,
      currency,
      status,
      issue_date,
      due_date,
      notes
    ) VALUES (
      'INV-GOLD-TX-BE-001',
      v_shipment_id,
      v_customer_id,
      26000.00,
      0.00,
      26000.00,
      'USD',
      'sent',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '7 days',
      'FREIGHT REGISTRATION - GOLD BARS SHIPMENT
Registration & Administrative Fees: $1,505.91
Freight Rate: $1,287.57
Mandatory Surcharges: $1,446.40
Specialized Handling: $1,455.00
Customs Transmission: $3,942.95
SPA/CTN Certificate: $2,039.93
CCA Fee: $2,269.01
AWB Preparation: $9,600.00
Regulatory Handling: $1,585.45
Terminal Handling (THC): $867.78
------------------------------------------------
Total Estimated Shipping Costs: $26,000.00

Note: Payment must be made in full prior to release of final shipping documents / departure from origin port. Final invoice will be provided once shipment is loaded and confirmed.'
    );

    -- Insert activity log
    INSERT INTO activity_logs (
      user_role,
      action,
      entity_type,
      entity_id,
      details
    ) VALUES (
      'system',
      'shipment_created',
      'shipment',
      v_shipment_id,
      '{
        "tracking_number": "NXS-GOLD-TX-BE-001",
        "shipper": "Eric Steele",
        "consignee": "Marc Van Daele",
        "origin": "Texas, USA",
        "destination": "Sint-Niklaas, Belgium",
        "commodity": "Gold Bars",
        "weight_kg": 96,
        "purity": "94%",
        "fineness": "22+ Carat",
        "packages": "1 Pallet",
        "mode": "Air Freight",
        "delivery_terms": "Diplomatic Home Delivery",
        "total_cost": 26000.00
      }'::jsonb
    );

  END IF;
END $$;

-- =====================================================
-- END OF INSERT STATEMENTS
-- =====================================================
