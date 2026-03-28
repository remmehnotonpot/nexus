-- =====================================================
-- ADD STATUS HISTORY METADATA + INDUCTION RPC
-- Date: 2026-03-28
-- =====================================================

BEGIN;

ALTER TABLE shipment_status_history
ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE OR REPLACE FUNCTION public.induct_shipment(
  p_shipment_id UUID,
  p_actual_weight_kg FLOAT8,
  p_volume_cbm FLOAT8,
  p_new_status TEXT,
  p_admin_id UUID,
  p_admin_role TEXT,
  p_notes TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_previous_status TEXT;
BEGIN
  SELECT status
  INTO v_previous_status
  FROM shipments
  WHERE id = p_shipment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shipment % not found', p_shipment_id;
  END IF;

  UPDATE shipments
  SET
    weight_kg = p_actual_weight_kg,
    volume_cbm = p_volume_cbm,
    status = p_new_status,
    updated_by = p_admin_id,
    updated_at = NOW()
  WHERE id = p_shipment_id;

  INSERT INTO shipment_status_history (
    shipment_id,
    previous_status,
    new_status,
    changed_by,
    changed_by_role,
    notes,
    metadata
  ) VALUES (
    p_shipment_id,
    v_previous_status,
    p_new_status,
    p_admin_id,
    p_admin_role,
    p_notes,
    COALESCE(p_metadata, '{}'::jsonb)
  );
END;
$$;

COMMIT;
