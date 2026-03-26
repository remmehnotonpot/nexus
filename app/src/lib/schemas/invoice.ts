/**
 * Invoice Validation Schemas
 * Zod schemas for invoice data validation
 */

import { z } from 'zod';

/**
 * Invoice status enum
 */
export const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled',
]);

/**
 * Invoice creation schema
 */
export const createInvoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  customer_id: z.string().uuid(),
  shipment_id: z.string().uuid().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().default('USD'),
  status: invoiceStatusSchema.default('draft'),
  issue_date: z.string().date().optional(),
  due_date: z.string().date().optional(),
  description: z.string().optional(),
});

/**
 * Invoice update schema
 */
export const updateInvoiceSchema = z.object({
  status: invoiceStatusSchema.optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  due_date: z.string().date().optional(),
  paid_date: z.string().date().optional(),
  description: z.string().optional(),
});

/**
 * Payment processing schema
 */
export const processPaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.enum(['card', 'bank_transfer', 'wire']),
  transaction_id: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
