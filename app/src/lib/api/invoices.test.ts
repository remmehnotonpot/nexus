import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getInvoicesByCustomer,
  getInvoiceById,
  getInvoiceByNumber,
  getInvoicesByStatus,
  updateInvoiceStatus,
  getTotalAmountDue,
} from './invoices';
import { createMockInvoice } from '@/test/mocks/data';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

describe('Invoices API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getInvoicesByCustomer', () => {
    it('fetches invoices by customer', async () => {
      const mockInvoices = [createMockInvoice({ id: '1' }), createMockInvoice({ id: '2' })];
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockInvoices, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getInvoicesByCustomer('customer-123');

      expect(result).toHaveLength(2);
    });

    it('throws error on fetch error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(getInvoicesByCustomer('customer-123')).rejects.toThrow();
    });
  });

  describe('getInvoiceById', () => {
    it('fetches invoice by ID', async () => {
      const mockInvoice = createMockInvoice({ id: 'inv-123' });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockInvoice, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getInvoiceById('inv-123');

      expect(result).toEqual(mockInvoice);
    });

    it('throws error for non-existent invoice', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(getInvoiceById('invalid-id')).rejects.toThrow();
    });
  });

  describe('getInvoiceByNumber', () => {
    it('fetches invoice by invoice number', async () => {
      const mockInvoice = createMockInvoice({ invoice_number: 'INV-2024-001' });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockInvoice, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getInvoiceByNumber('INV-2024-001');

      expect(result).toEqual(mockInvoice);
    });
  });

  describe('getInvoicesByStatus', () => {
    it('fetches invoices by status', async () => {
      const mockInvoices = [createMockInvoice({ status: 'sent' }), createMockInvoice({ status: 'sent' })];
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockInvoices, error: null }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getInvoicesByStatus('customer-123', 'sent');

      expect(result).toHaveLength(2);
    });
  });

  describe('updateInvoiceStatus', () => {
    it('updates invoice status', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(updateInvoiceStatus('inv-123', 'paid')).resolves.not.toThrow();
    });

    it('handles update errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(updateInvoiceStatus('inv-123', 'paid')).rejects.toThrow();
    });
  });

  describe('getTotalAmountDue', () => {
    it('calculates total amount due', async () => {
      const mockInvoices = [{ amount: 1000 }, { amount: 2500 }, { amount: 500 }];
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: mockInvoices, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getTotalAmountDue('customer-123');

      expect(result).toBe(4000);
    });

    it('returns 0 when no invoices', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await getTotalAmountDue('customer-123');

      expect(result).toBe(0);
    });

    it('throws error on calculation error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(getTotalAmountDue('customer-123')).rejects.toThrow();
    });
  });
});
