import { describe, it, expect } from 'vitest';
import { 
  createInvoiceSchema, 
  updateInvoiceSchema, 
  processPaymentSchema,
  invoiceStatusSchema 
} from './invoice';

describe('Invoice Schemas', () => {
  describe('createInvoiceSchema', () => {
    it('validates valid invoice creation', () => {
      const validInvoice = {
        invoice_number: 'INV-001',
        customer_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 1000.00,
        currency: 'USD',
        status: 'draft',
        issue_date: '2024-01-01',
        description: 'Test invoice',
      };

      const result = createInvoiceSchema.safeParse(validInvoice);
      expect(result.success).toBe(true);
    });

    it('validates status transitions', () => {
      const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
      
      validStatuses.forEach(status => {
        const invoice = {
          invoice_number: 'INV-001',
          customer_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 1000,
          status,
        };
        
        const result = createInvoiceSchema.safeParse(invoice);
        expect(result.success).toBe(true);
      });
    });

    it('validates amount constraints', () => {
      const invalidInvoice = {
        invoice_number: 'INV-001',
        customer_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: -100,
        currency: 'USD',
      };

      const result = createInvoiceSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });

    it('rejects zero amount', () => {
      const invalidInvoice = {
        invoice_number: 'INV-001',
        customer_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 0,
        currency: 'USD',
      };

      const result = createInvoiceSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });

    it('applies default values', () => {
      const minimalInvoice = {
        invoice_number: 'INV-001',
        customer_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 1000,
      };

      const result = createInvoiceSchema.safeParse(minimalInvoice);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('USD');
        expect(result.data.status).toBe('draft');
      }
    });
  });

  describe('updateInvoiceSchema', () => {
    it('validates partial updates', () => {
      const updateData = {
        status: 'paid',
        amount: 1500,
      };

      const result = updateInvoiceSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('allows status-only update', () => {
      const updateData = {
        status: 'sent',
      };

      const result = updateInvoiceSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });
  });

  describe('processPaymentSchema', () => {
    it('validates valid payment', () => {
      const validPayment = {
        invoice_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 1000,
        payment_method: 'card',
        transaction_id: 'txn-123',
      };

      const result = processPaymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it('accepts valid payment methods', () => {
      const methods = ['card', 'bank_transfer', 'wire'];
      
      methods.forEach(method => {
        const payment = {
          invoice_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 1000,
          payment_method: method,
        };
        
        const result = processPaymentSchema.safeParse(payment);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid payment method', () => {
      const invalidPayment = {
        invoice_id: '550e8400-e29b-41d4-a716-446655440000',
        amount: 1000,
        payment_method: 'cash',
      };

      const result = processPaymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });
  });
});
