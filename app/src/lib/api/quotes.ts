/**
 * Quote System API Layer
 * Database operations for customer quotes and quote-to-shipment conversion
 */

import { supabase } from '@/lib/supabase';
import { NotFoundError, ValidationError, DatabaseError } from '@/lib/errors';


// Quote status type
export type QuoteStatus = 'draft' | 'submitted' | 'under_review' | 'quoted' | 'accepted' | 'rejected' | 'expired' | 'converted';

// Quote type from database
export interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  status: QuoteStatus;
  
  // Origin
  origin_address: Record<string, unknown>;
  origin_lat?: number;
  origin_lng?: number;
  
  // Destination
  destination_address: Record<string, unknown>;
  destination_lat?: number;
  destination_lng?: number;
  
  // Cargo Details
  cargo_description: string;
  cargo_type: string;
  weight_kg: number;
  volume_cbm?: number;
  pieces?: number;
  declared_value?: number;
  currency?: string;
  
  // Service Requirements
  transport_mode: string;
  service_type: string;
  pickup_date?: string;
  delivery_date?: string;
  
  // Special Requirements
  special_instructions?: string;
  requires_hazmat: boolean;
  requires_temperature_control: boolean;
  temperature_range?: string;
  
  // Pricing (filled by ops)
  base_rate?: number;
  fuel_surcharge?: number;
  additional_charges?: Record<string, unknown>[];
  total_amount?: number;
  quote_valid_until?: string;
  
  // Conversion
  converted_shipment_id?: string;
  converted_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

// Create quote input
export interface CreateQuoteInput {
  customer_id: string;
  origin_address: Record<string, unknown>;
  origin_lat?: number;
  origin_lng?: number;
  destination_address: Record<string, unknown>;
  destination_lat?: number;
  destination_lng?: number;
  cargo_description: string;
  cargo_type: string;
  weight_kg: number;
  volume_cbm?: number;
  pieces?: number;
  declared_value?: number;
  currency?: string;
  transport_mode: string;
  service_type: string;
  pickup_date?: string;
  delivery_date?: string;
  special_instructions?: string;
  requires_hazmat?: boolean;
  requires_temperature_control?: boolean;
  temperature_range?: string;
}

// Update quote with pricing
export interface UpdateQuotePricingInput {
  base_rate: number;
  fuel_surcharge?: number;
  additional_charges?: Record<string, unknown>[];
  total_amount: number;
  quote_valid_until: string;
}

// Generate unique quote number
function generateQuoteNumber(): string {
  const prefix = 'QTE';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

/**
 * Get quotes for a customer
 */
export async function getCustomerQuotes(
  customerId: string,
  options?: {
    status?: QuoteStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Quote[]; count: number }> {
  let query = supabase
    .from('quotes')
    .select('*', { count: 'exact' })
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError(`Failed to fetch quotes: ${error.message}`);
  }

  return { data: (data as Quote[]) || [], count: count || 0 };
}

/**
 * Get all quotes (for ops)
 */
export async function getAllQuotes(
  options?: {
    status?: QuoteStatus;
    customerId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Quote[]; count: number }> {
  let query = supabase
    .from('quotes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.customerId) {
    query = query.eq('customer_id', options.customerId);
  }

  if (options?.search) {
    query = query.or(`quote_number.ilike.%${options.search}%,cargo_description.ilike.%${options.search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError(`Failed to fetch quotes: ${error.message}`);
  }

  return { data: (data as Quote[]) || [], count: count || 0 };
}

/**
 * Get quote by ID
 */
export async function getQuoteById(id: string): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Quote not found');
    }
    throw new DatabaseError(`Failed to fetch quote: ${error.message}`);
  }

  return data as Quote;
}

/**
 * Get quote by number
 */
export async function getQuoteByNumber(quoteNumber: string): Promise<Quote | null> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('quote_number', quoteNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new DatabaseError(`Failed to fetch quote: ${error.message}`);
  }

  return data as Quote;
}

/**
 * Create new quote request
 */
export async function createQuote(input: CreateQuoteInput): Promise<Quote> {
  // Validation
  if (!input.cargo_description?.trim()) {
    throw new ValidationError('Cargo description is required');
  }
  if (!input.weight_kg || input.weight_kg <= 0) {
    throw new ValidationError('Valid weight is required');
  }

  const quoteNumber = generateQuoteNumber();

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      ...input,
      quote_number: quoteNumber,
      status: 'submitted',
      currency: input.currency || 'USD',
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Failed to create quote: ${error.message}`);
  }

  return data as Quote;
}

/**
 * Update quote with pricing (ops only)
 */
export async function updateQuotePricing(
  quoteId: string,
  pricing: UpdateQuotePricingInput,
  reviewedBy: string
): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
    .update({
      ...pricing,
      status: 'quoted',
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq('id', quoteId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Failed to update quote pricing: ${error.message}`);
  }

  return data as Quote;
}

/**
 * Accept quote (customer)
 */
export async function acceptQuote(quoteId: string): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
    .update({ status: 'accepted' })
    .eq('id', quoteId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Failed to accept quote: ${error.message}`);
  }

  return data as Quote;
}

/**
 * Reject quote (customer)
 */
export async function rejectQuote(quoteId: string, reason?: string): Promise<Quote> {
  const { data, error } = await supabase
    .from('quotes')
    .update({
      status: 'rejected',
      special_instructions: reason,
    })
    .eq('id', quoteId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Failed to reject quote: ${error.message}`);
  }

  return data as Quote;
}

/**
 * Convert quote to shipment
 */
export async function convertQuoteToShipment(
  quoteId: string,
  userId: string
): Promise<{ quote: Quote; shipmentId: string }> {
  // Get the quote
  const quote = await getQuoteById(quoteId);

  if (quote.status !== 'accepted') {
    throw new ValidationError('Quote must be accepted before conversion');
  }

  // Generate tracking number
  const prefix = 'NXS';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const trackingNumber = `${prefix}-${year}-${random}`;

  // Create shipment from quote
  const { data: shipment, error: shipmentError } = await supabase
    .from('shipments')
    .insert({
      tracking_number: trackingNumber,
      customer_id: quote.customer_id,
      status: 'pending',
      origin_address: quote.origin_address,
      origin_lat: quote.origin_lat,
      origin_lng: quote.origin_lng,
      destination_address: quote.destination_address,
      destination_lat: quote.destination_lat,
      destination_lng: quote.destination_lng,
      current_lat: quote.origin_lat,
      current_lng: quote.origin_lng,
      transport_mode: quote.transport_mode,
      service_type: quote.service_type,
      cargo_description: quote.cargo_description,
      cargo_type: quote.cargo_type,
      weight_kg: quote.weight_kg,
      volume_cbm: quote.volume_cbm,
      pieces: quote.pieces,
      declared_value: quote.declared_value,
      currency: quote.currency,
      pickup_date: quote.pickup_date,
      delivery_date: quote.delivery_date,
      base_rate: quote.base_rate,
      fuel_surcharge: quote.fuel_surcharge,
      additional_charges: quote.additional_charges,
      total_amount: quote.total_amount,
      created_by: userId,
    })
    .select()
    .single();

  if (shipmentError) {
    throw new DatabaseError(`Failed to create shipment: ${shipmentError.message}`);
  }

  // Update quote status
  const { data: updatedQuote, error: quoteError } = await supabase
    .from('quotes')
    .update({
      status: 'converted',
      converted_shipment_id: shipment.id,
      converted_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
    .select()
    .single();

  if (quoteError) {
    // Rollback - delete the shipment
    await supabase.from('shipments').delete().eq('id', shipment.id);
    throw new DatabaseError(`Failed to update quote: ${quoteError.message}`);
  }

  return {
    quote: updatedQuote as Quote,
    shipmentId: shipment.id,
  };
}

/**
 * Delete quote (only if in draft status)
 */
export async function deleteQuote(quoteId: string): Promise<void> {
  const quote = await getQuoteById(quoteId);

  if (quote.status !== 'draft' && quote.status !== 'submitted') {
    throw new ValidationError('Cannot delete quote that has been processed');
  }

  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', quoteId);

  if (error) {
    throw new DatabaseError(`Failed to delete quote: ${error.message}`);
  }
}

/**
 * Calculate estimated quote price
 */
export function calculateEstimatedPrice(params: {
  weightKg: number;
  volumeCbm?: number;
  transportMode: string;
  serviceType: string;
  distanceKm?: number;
}): {
  baseRate: number;
  fuelSurcharge: number;
  total: number;
} {
  const { weightKg, volumeCbm, transportMode, serviceType, distanceKm = 1000 } = params;

  // Base rates per kg based on transport mode
  const baseRates: Record<string, number> = {
    air: 3.5,
    ocean: 0.05,
    road: 0.5,
    rail: 0.3,
    multimodal: 0.8,
  };

  // Service type multipliers
  const serviceMultipliers: Record<string, number> = {
    express: 2.0,
    standard: 1.0,
    economy: 0.7,
  };

  const baseRatePerKg = baseRates[transportMode] || 0.5;
  const serviceMultiplier = serviceMultipliers[serviceType] || 1.0;

  // Calculate chargeable weight (actual vs volumetric)
  const volumetricWeight = (volumeCbm || 0) * 167; // Standard volumetric ratio
  const chargeableWeight = Math.max(weightKg, volumetricWeight);

  // Calculate base rate
  const baseRate = chargeableWeight * baseRatePerKg * serviceMultiplier;

  // Fuel surcharge (typically 15-25% of base)
  const fuelSurcharge = baseRate * 0.18;

  // Distance adjustment (simplified)
  const distanceFactor = Math.min(distanceKm / 1000, 3);
  const adjustedBaseRate = baseRate * (0.8 + distanceFactor * 0.1);

  return {
    baseRate: Math.round(adjustedBaseRate * 100) / 100,
    fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
    total: Math.round((adjustedBaseRate + fuelSurcharge) * 100) / 100,
  };
}
