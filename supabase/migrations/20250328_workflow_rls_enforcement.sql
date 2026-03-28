-- =====================================================
-- PHASE 5 WORKFLOW AUDIT - RLS ENFORCEMENT MIGRATION
-- Date: 2026-03-28
--
-- Goals:
-- 1. Customers can only INSERT shipment requests in intake states
-- 2. Customers cannot directly UPDATE shipments
-- 3. Only admin/ops staff can UPDATE shipments and INSERT status history
-- 4. Migration is safe to rerun
-- =====================================================

BEGIN;

-- ==========================================
-- 1. HELPER FUNCTIONS
-- ==========================================

CREATE OR REPLACE FUNCTION public.current_user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_user_is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'operations_manager', 'logistics_coordinator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_user_is_shipment_customer(shipment_customer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile profiles%ROWTYPE;
BEGIN
  SELECT *
  INTO user_profile
  FROM profiles
  WHERE id = auth.uid();

  IF user_profile.id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF user_profile.role <> 'customer' THEN
    RETURN FALSE;
  END IF;

  IF shipment_customer_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM customers
    WHERE id = shipment_customer_id
      AND email = user_profile.email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 2. SHIPMENTS POLICIES
-- ==========================================

-- Remove temporary and previously-attempted policies so the migration can be rerun safely.
DROP POLICY IF EXISTS "Allow authenticated full access temporarily" ON shipments;
DROP POLICY IF EXISTS "Customers can create shipment requests" ON shipments;
DROP POLICY IF EXISTS "Customers can create intake shipment requests" ON shipments;
DROP POLICY IF EXISTS "Customers can view own shipments" ON shipments;
DROP POLICY IF EXISTS "Customers can update intake shipments" ON shipments;
DROP POLICY IF EXISTS "Customers cannot update status" ON shipments;
DROP POLICY IF EXISTS "Staff can manage all shipments" ON shipments;
DROP POLICY IF EXISTS "Staff can update shipment status" ON shipments;
DROP POLICY IF EXISTS "Staff can view all shipments" ON shipments;
DROP POLICY IF EXISTS "Staff can create full shipments" ON shipments;
DROP POLICY IF EXISTS "Staff can update shipments" ON shipments;
DROP POLICY IF EXISTS "Only super admin can delete shipments" ON shipments;

-- Staff can view all shipments.
CREATE POLICY "Staff can view all shipments" ON shipments
  FOR SELECT TO authenticated
  USING (public.current_user_is_staff());

-- Customers can only view shipments mapped to their customer record.
CREATE POLICY "Customers can view own shipments" ON shipments
  FOR SELECT TO authenticated
  USING (public.current_user_is_shipment_customer(customer_id));

-- Customers can create shipment requests, but only in intake states.
-- Note: the live schema requires weight_kg NOT NULL, so we cannot enforce weight_kg IS NULL here.
-- Physical package audit must therefore be enforced in later workflow/transition logic.
CREATE POLICY "Customers can create intake shipment requests" ON shipments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_is_shipment_customer(customer_id)
    AND status IN ('pending_dropoff', 'scheduled_for_pickup')
  );

-- Staff can create shipments with any valid business state.
CREATE POLICY "Staff can create full shipments" ON shipments
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_is_staff());

-- Only staff can update shipments.
-- This intentionally leaves customers with no UPDATE policy so they cannot change status
-- or any other shipment fields directly.
CREATE POLICY "Staff can update shipments" ON shipments
  FOR UPDATE TO authenticated
  USING (public.current_user_is_staff())
  WITH CHECK (public.current_user_is_staff());

-- Only super admins can delete shipments.
CREATE POLICY "Only super admin can delete shipments" ON shipments
  FOR DELETE TO authenticated
  USING (public.current_user_has_role('super_admin'));

-- ==========================================
-- 3. SHIPMENT STATUS HISTORY POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Allow authenticated full access temporarily" ON shipment_status_history;
DROP POLICY IF EXISTS "Staff can view status history" ON shipment_status_history;
DROP POLICY IF EXISTS "Customers can view own status history" ON shipment_status_history;
DROP POLICY IF EXISTS "Only staff can create status history" ON shipment_status_history;

-- Staff can view all status history.
CREATE POLICY "Staff can view status history" ON shipment_status_history
  FOR SELECT TO authenticated
  USING (public.current_user_is_staff());

-- Customers can only view status history for shipments mapped to their customer record.
CREATE POLICY "Customers can view own status history" ON shipment_status_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM shipments
      WHERE shipments.id = shipment_status_history.shipment_id
        AND public.current_user_is_shipment_customer(shipments.customer_id)
    )
  );

-- Only staff can create status history.
CREATE POLICY "Only staff can create status history" ON shipment_status_history
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_is_staff()
    AND changed_by_role IN ('super_admin', 'operations_manager', 'logistics_coordinator')
  );

-- No UPDATE or DELETE policy is created on shipment_status_history.
-- That keeps the audit trail immutable for normal authenticated users.

-- ==========================================
-- 4. ENFORCE RLS
-- ==========================================

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_status_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE shipments FORCE ROW LEVEL SECURITY;
ALTER TABLE shipment_status_history FORCE ROW LEVEL SECURITY;

COMMIT;

-- ==========================================
-- 5. VERIFICATION QUERIES (Run manually)
-- ==========================================
/*
-- List all policies on shipments
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'shipments'
ORDER BY policyname;

-- List all policies on shipment_status_history
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'shipment_status_history'
ORDER BY policyname;
*/

-- =====================================================
-- END OF WORKFLOW RLS ENFORCEMENT MIGRATION
-- =====================================================
