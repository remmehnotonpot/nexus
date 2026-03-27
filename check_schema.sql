-- =====================================================
-- DIAGNOSTIC: Check if your schema matches the code
-- =====================================================

-- 1. Check if tracking_updates table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tracking_updates', 'tracking_logs', 'shipments');

-- 2. Check columns in tracking_updates (if it exists)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tracking_updates';

-- 3. Check if there's a foreign key from tracking_updates to shipments
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'tracking_updates';

-- 4. Check the shipment you're looking for
SELECT id, tracking_number, status, customer_id 
FROM shipments 
WHERE tracking_number = 'YTSJ784HNF8N';

-- 5. List all shipments to see what's available
SELECT tracking_number, status, created_at 
FROM shipments 
ORDER BY created_at DESC 
LIMIT 10;
