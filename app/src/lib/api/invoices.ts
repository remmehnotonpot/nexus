/**
 * Invoices API Layer
 * Database operations for invoices with Supabase
 */

import { supabase } from '@/lib/supabase';
import { DatabaseError } from '@/lib/errors';
import type { Invoice } from '@/types';

/**
 * Get all invoices for a customer
 */
export async function getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    throw new DatabaseError('Failed to fetch invoices');
  }

  return data || [];
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching invoice:', error);
    throw new DatabaseError('Failed to fetch invoice');
  }

  return data;
}

/**
 * Get invoice by invoice number
 */
export async function getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('invoice_number', invoiceNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching invoice:', error);
    throw new DatabaseError('Failed to fetch invoice');
  }

  return data;
}

/**
 * Get invoices by status
 */
export async function getInvoicesByStatus(
  customerId: string,
  status: Invoice['status']
): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customerId)
    .eq('status', status)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching invoices by status:', error);
    throw new DatabaseError('Failed to fetch invoices');
  }

  return data || [];
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: Invoice['status'],
  paidDate?: string
): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({
      status,
      ...(paidDate ? { paid_date: paidDate } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId);

  if (error) {
    console.error('Error updating invoice status:', error);
    throw new DatabaseError('Failed to update invoice status');
  }
}

/**
 * Get total amount due for a customer
 */
export async function getTotalAmountDue(customerId: string): Promise<number> {
  const { data, error } = await supabase
    .from('invoices')
    .select('amount')
    .eq('customer_id', customerId)
    .in('status', ['sent', 'overdue']);

  if (error) {
    console.error('Error calculating total amount due:', error);
    throw new DatabaseError('Failed to calculate total amount due');
  }

  return (data || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);
}
