import { supabase } from '@/lib/supabase';
import type { Customer } from '@/types';
import { NotFoundError, ValidationError } from '@/lib/errors';

export interface CreateCustomerData {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  address?: Record<string, unknown>;
  tax_id?: string;
  credit_limit?: number;
  payment_terms?: number;
  assigned_account_manager?: string;
  notes?: string;
}

export interface UpdateCustomerData {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: Record<string, unknown>;
  tax_id?: string;
  credit_limit?: number;
  payment_terms?: number;
  assigned_account_manager?: string;
  status?: 'active' | 'suspended' | 'inactive';
  notes?: string;
}

export async function getCustomers(options?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Customer[]; count: number }> {
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.search) {
    query = query.or(`company_name.ilike.%${options.search}%,contact_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }

  return { data: data || [], count: count || 0 };
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Customer not found');
    }
    throw new Error(`Failed to fetch customer: ${error.message}`);
  }

  return data;
}

export async function createCustomer(customerData: CreateCustomerData): Promise<Customer> {
  // Validation
  if (!customerData.company_name?.trim()) {
    throw new ValidationError('Company name is required');
  }
  if (!customerData.contact_name?.trim()) {
    throw new ValidationError('Contact name is required');
  }
  if (!customerData.email?.trim()) {
    throw new ValidationError('Email is required');
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...customerData,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }

  return data;
}

export async function updateCustomer(id: string, updates: UpdateCustomerData): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Customer not found');
    }
    throw new Error(`Failed to update customer: ${error.message}`);
  }

  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete customer: ${error.message}`);
  }
}

export async function getCustomerShipments(customerId: string) {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch customer shipments: ${error.message}`);
  }

  return data || [];
}
