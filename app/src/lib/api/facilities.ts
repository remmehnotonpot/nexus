/**
 * Facilities API Layer
 * Database operations for facilities/locations
 */

import { supabase } from '@/lib/supabase';
import { NotFoundError, DatabaseError } from '@/lib/errors';
import type { Tables, TablesInsert, TablesUpdate } from '@/types';

export type Facility = Tables<'facilities'>;
export type CreateFacilityInput = TablesInsert<'facilities'>;
export type UpdateFacilityInput = TablesUpdate<'facilities'>;

/**
 * Get all active facilities
 */
export async function getFacilities(options?: {
  type?: string;
  search?: string;
  limit?: number;
}): Promise<Facility[]> {
  let query = supabase
    .from('facilities')
    .select('*')
    .eq('is_active', true);

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,city.ilike.%${options.search}%,country.ilike.%${options.search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.order('name', { ascending: true });

  if (error) {
    console.error('Error fetching facilities:', error);
    throw new DatabaseError('Failed to fetch facilities');
  }

  return data || [];
}

/**
 * Get facility by ID
 */
export async function getFacilityById(id: string): Promise<Facility> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Facility not found');
    }
    throw new DatabaseError('Failed to fetch facility');
  }

  return data;
}

/**
 * Get facility by code
 */
export async function getFacilityByCode(code: string): Promise<Facility | null> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new DatabaseError('Failed to fetch facility');
  }

  return data;
}

/**
 * Create new facility
 */
export async function createFacility(input: CreateFacilityInput): Promise<Facility> {
  const { data, error } = await supabase
    .from('facilities')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('Error creating facility:', error);
    throw new DatabaseError('Failed to create facility');
  }

  if (!data) {
    throw new DatabaseError('No data returned from create facility');
  }

  return data;
}

/**
 * Update facility
 */
export async function updateFacility(
  id: string,
  updates: UpdateFacilityInput
): Promise<Facility> {
  const { data, error } = await supabase
    .from('facilities')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Facility not found');
    }
    throw new DatabaseError('Failed to update facility');
  }

  return data;
}

/**
 * Soft delete facility (set is_active to false)
 */
export async function deleteFacility(id: string): Promise<void> {
  const { error } = await supabase
    .from('facilities')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new DatabaseError('Failed to delete facility');
  }
}

/**
 * Search facilities by location (within radius)
 */
export async function searchNearbyFacilities(
  lat: number,
  lng: number,
  radiusKm: number = 50
): Promise<Facility[]> {
  // Using a simple bounding box approach for now
  // For production, consider using PostGIS for more accurate geo queries
  const latDelta = radiusKm / 111; // 1 degree lat ≈ 111km
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('is_active', true)
    .gte('lat', lat - latDelta)
    .lte('lat', lat + latDelta)
    .gte('lng', lng - lngDelta)
    .lte('lng', lng + lngDelta);

  if (error) {
    throw new DatabaseError('Failed to search nearby facilities');
  }

  return data || [];
}
