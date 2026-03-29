import { supabase } from '@/lib/supabase';
import type { 
  Shipment, 
  ShipmentWithRelations,
  ShipmentMilestone,
  Exception,
  Document,
  ShipmentFilters,
  StatusUpdateData,
  DashboardStats,
  ShipmentStatus,
} from '@/types';
import { NotFoundError } from '@/lib/errors';

interface InductShipmentData {
  actualWeightKg: number;
  actualDimensions: {
    length: number;
    width: number;
    height: number;
  };
  auditedBy: string;
  auditedAt?: string;
  notes?: string;
  photos?: string[];
  newStatus: ShipmentStatus;
  userRole: string;
}

// ============================================
// Dashboard Operations
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];

  const [
    { data: pickups },
    { data: pickupsPending },
    { data: inTransit },
    { data: inTransitDelayed },
    { data: deliveries },
    { data: deliveriesWithIssue },
    { data: exceptions },
    { data: exceptionsNeedAttention },
  ] = await Promise.all([
    // Today's pickups
    supabase.from('shipments').select('id', { count: 'exact' }).eq('pickup_date', today),
    // Pending pickups
    supabase.from('shipments').select('id', { count: 'exact' }).eq('status', 'pending'),
    // In transit
    supabase.from('shipments').select('id', { count: 'exact' }).eq('status', 'in_transit'),
    // In transit delayed (sub_status = delayed)
    supabase.from('shipments').select('id', { count: 'exact' }).eq('status', 'in_transit').eq('sub_status', 'delayed'),
    // Today's deliveries
    supabase.from('shipments').select('id', { count: 'exact' }).eq('delivery_date', today),
    // Deliveries with issue
    supabase.from('shipments').select('id', { count: 'exact' }).eq('status', 'exception'),
    // All exceptions
    supabase.from('exceptions').select('id', { count: 'exact' }),
    // Exceptions needing attention
    supabase.from('exceptions').select('id', { count: 'exact' }).in('status', ['open', 'in_progress']),
  ]);

  return {
    todayPickups: pickups?.length || 0,
    pickupsPending: pickupsPending?.length || 0,
    inTransit: inTransit?.length || 0,
    inTransitDelayed: inTransitDelayed?.length || 0,
    deliveriesToday: deliveries?.length || 0,
    deliveriesWithIssue: deliveriesWithIssue?.length || 0,
    exceptionsTotal: exceptions?.length || 0,
    exceptionsNeedAttention: exceptionsNeedAttention?.length || 0,
  };
}

// ============================================
// Shipment Operations
// ============================================

export async function getShipments(filters?: ShipmentFilters): Promise<Shipment[]> {
  let query = supabase.from('shipments').select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.transportMode) {
    query = query.eq('transport_mode', filters.transportMode);
  }

  if (filters?.customerId) {
    query = query.eq('customer_id', filters.customerId);
  }

  if (filters?.driverId) {
    query = query.eq('assigned_driver_id', filters.driverId);
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  if (filters?.searchQuery) {
    query = query.or(`tracking_number.ilike.%${filters.searchQuery}%,cargo_description.ilike.%${filters.searchQuery}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch shipments: ${error.message}`);
  }

  return data || [];
}

export async function getShipmentWithRelations(id: string): Promise<ShipmentWithRelations> {
  const { data: shipment, error: shipmentError } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', id)
    .single();

  if (shipmentError) {
    if (shipmentError.code === 'PGRST116') {
      throw new NotFoundError('Shipment not found');
    }
    throw new Error(`Failed to fetch shipment: ${shipmentError.message}`);
  }

  // Fetch related data in parallel
  const [
    { data: customer },
    { data: driver },
    { data: milestones },
    { data: documents },
    { data: exceptions },
    { data: statusHistory },
  ] = await Promise.all([
    shipment.customer_id
      ? supabase.from('customers').select('*').eq('id', shipment.customer_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    shipment.assigned_driver_id
      ? supabase.from('profiles').select('*').eq('id', shipment.assigned_driver_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from('shipment_milestones').select('*').eq('shipment_id', id).order('sequence', { ascending: true }),
    supabase.from('documents').select('*').eq('shipment_id', id).order('created_at', { ascending: false }),
    supabase.from('exceptions').select('*').eq('shipment_id', id).order('created_at', { ascending: false }),
    supabase.from('shipment_status_history').select('*').eq('shipment_id', id).order('created_at', { ascending: false }),
  ]);

  return {
    ...shipment,
    customer: customer || undefined,
    driver: driver || undefined,
    milestones: milestones || [],
    documents: documents || [],
    exceptions: exceptions || [],
    status_history: statusHistory || [],
  };
}

export async function createShipment(
  shipmentData: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>
): Promise<Shipment> {
  const { data, error } = await supabase
    .from('shipments')
    .insert(shipmentData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create shipment: ${error.message}`);
  }

  return data;
}

export async function updateShipment(
  id: string,
  updates: Partial<Shipment>
): Promise<Shipment> {
  const { data, error } = await supabase
    .from('shipments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Shipment not found');
    }
    throw new Error(`Failed to update shipment: ${error.message}`);
  }

  return data;
}

// ============================================
// Status Updates
// ============================================

export async function updateShipmentStatus(
  shipmentId: string,
  updateData: StatusUpdateData,
  userId: string,
  userRole: string
): Promise<void> {
  const { data: shipment, error: fetchError } = await supabase
    .from('shipments')
    .select('status')
    .eq('id', shipmentId)
    .single();

  if (fetchError) {
    throw new NotFoundError('Shipment not found');
  }

  const previousStatus = shipment.status;
  const { status, subStatus, location, notes, notifyCustomer } = updateData;

  // Update shipment
  const { error: updateError } = await supabase
    .from('shipments')
    .update({
      status,
      sub_status: subStatus,
      current_lat: location?.lat,
      current_lng: location?.lng,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', shipmentId);

  if (updateError) {
    throw new Error(`Failed to update shipment status: ${updateError.message}`);
  }

  // Record in status history
  const { error: historyError } = await supabase
    .from('shipment_status_history')
    .insert({
      shipment_id: shipmentId,
      previous_status: previousStatus,
      new_status: status,
      sub_status: subStatus,
      changed_by: userId,
      changed_by_role: userRole,
      location_lat: location?.lat,
      location_lng: location?.lng,
      location_name: location?.name,
      notes,
    });

  if (historyError) {
    throw new Error(`Failed to record status history: ${historyError.message}`);
  }

  // Create notification if requested
  if (notifyCustomer) {
    const { data: shipmentData } = await supabase
      .from('shipments')
      .select('customer_id')
      .eq('id', shipmentId)
      .single();

    if (shipmentData?.customer_id) {
      try {
        const { error: notificationError } = await supabase.from('notifications').insert({
          customer_id: shipmentData.customer_id,
          shipment_id: shipmentId,
          type: 'status_update',
          title: 'Shipment Status Updated',
          message: `Your shipment status has been updated to: ${status}`,
        });

        if (notificationError) {
          console.warn('Notification insert skipped:', notificationError.message);
        }
      } catch (notificationError) {
        console.warn('Notification insert skipped:', notificationError);
      }
    }
  }
}

export async function inductShipment(
  shipmentId: string,
  auditData: InductShipmentData
): Promise<void> {
  const volumeCbm = (
    auditData.actualDimensions.length *
    auditData.actualDimensions.width *
    auditData.actualDimensions.height
  ) / 1000000;

  const auditMetadata = {
    audit_type: 'package_induction',
    actual_weight_kg: auditData.actualWeightKg,
    actual_dimensions_cm: auditData.actualDimensions,
    audited_by: auditData.auditedBy,
    audited_at: auditData.auditedAt || new Date().toISOString(),
    photos: auditData.photos || [],
    user_notes: auditData.notes || '',
  };

  const auditNotes = [
    'Package inducted.',
    auditData.notes?.trim(),
  ]
    .filter(Boolean)
    .join('\n');

  const { error: rpcError } = await supabase.rpc('induct_shipment', {
    p_shipment_id: shipmentId,
    p_actual_weight_kg: auditData.actualWeightKg,
    p_volume_cbm: volumeCbm,
    p_new_status: auditData.newStatus,
    p_admin_id: auditData.auditedBy,
    p_admin_role: auditData.userRole,
    p_notes: auditNotes || null,
    p_metadata: auditMetadata,
  });

  if (rpcError) {
    throw new Error(`Failed to induct shipment: ${rpcError.message}`);
  }

  try {
    const { data: shipmentData, error: shipmentDataError } = await supabase
      .from('shipments')
      .select('customer_id')
      .eq('id', shipmentId)
      .single();

    if (!shipmentDataError && shipmentData?.customer_id) {
      const { error: notificationError } = await supabase.from('notifications').insert({
        customer_id: shipmentData.customer_id,
        shipment_id: shipmentId,
        type: 'status_update',
        title: 'Shipment Inducted',
        message: `Your shipment has been inducted and is now ${auditData.newStatus}.`,
      });

      if (notificationError) {
        console.warn('Notification insert skipped:', notificationError.message);
      }
    }
  } catch (notificationError) {
    console.warn('Notification insert skipped:', notificationError);
  }
}

// ============================================
// Milestones
// ============================================

export async function createMilestone(
  milestoneData: Omit<ShipmentMilestone, 'id' | 'created_at'>
): Promise<ShipmentMilestone> {
  const { data, error } = await supabase
    .from('shipment_milestones')
    .insert(milestoneData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create milestone: ${error.message}`);
  }

  return data;
}

export async function completeMilestone(
  milestoneId: string,
  completedBy: string,
  notes?: string
): Promise<void> {
  const { error } = await supabase
    .from('shipment_milestones')
    .update({
      status: 'completed',
      actual_date: new Date().toISOString(),
      completed_by: completedBy,
      notes,
    })
    .eq('id', milestoneId);

  if (error) {
    throw new Error(`Failed to complete milestone: ${error.message}`);
  }
}

// ============================================
// Exceptions
// ============================================

export async function createException(
  exceptionData: Omit<Exception, 'id' | 'created_at' | 'resolved_at'>
): Promise<Exception> {
  const { data, error } = await supabase
    .from('exceptions')
    .insert(exceptionData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create exception: ${error.message}`);
  }

  // Update shipment status to exception
  await supabase
    .from('shipments')
    .update({ status: 'exception' })
    .eq('id', exceptionData.shipment_id);

  return data;
}

export async function resolveException(
  exceptionId: string,
  resolutionNotes: string,
  resolvedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('exceptions')
    .update({
      status: 'resolved',
      resolution_notes: resolutionNotes,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', exceptionId);

  if (error) {
    throw new Error(`Failed to resolve exception: ${error.message}`);
  }
}

// ============================================
// Documents
// ============================================

export async function uploadDocument(
  documentData: Omit<Document, 'id' | 'created_at'>
): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert(documentData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upload document: ${error.message}`);
  }

  return data;
}

// ============================================
// Tracking
// ============================================

export async function recordTrackingUpdate(
  shipmentId: string,
  lat: number,
  lng: number,
  source: string,
  metadata?: {
    heading?: number;
    speed_kmh?: number;
    accuracy?: number;
    battery_level?: number;
  },
  recordedBy?: string
): Promise<void> {
  const { error } = await supabase
    .from('tracking_updates')
    .insert({
      shipment_id: shipmentId,
      lat,
      lng,
      source,
      recorded_by: recordedBy,
      ...metadata,
    });

  if (error) {
    throw new Error(`Failed to record tracking update: ${error.message}`);
  }

  // Update shipment current location
  await supabase
    .from('shipments')
    .update({
      current_lat: lat,
      current_lng: lng,
      current_heading: metadata?.heading,
    })
    .eq('id', shipmentId);
}

// ============================================
// Activity Logging
// ============================================

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>,
  userId?: string,
  userRole?: string
): Promise<void> {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      user_id: userId,
      user_role: userRole,
    });

  if (error) {
    console.error('Failed to log activity:', error);
  }
}
