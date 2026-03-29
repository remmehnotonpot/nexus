import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockShipment } from '@/test/mocks/data';
import { getShipmentWithRelations } from './operations';

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: fromMock,
  },
}));

describe('operations api', () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it('skips the profiles lookup when a shipment has no assigned driver', async () => {
    const shipment = createMockShipment({
      id: 'ship-1',
      customer_id: null,
      assigned_driver_id: null,
    });

    fromMock.mockImplementation((table: string) => {
      if (table === 'shipments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: shipment, error: null }),
            }),
          }),
        };
      }

      if (
        table === 'shipment_milestones' ||
        table === 'documents' ||
        table === 'exceptions' ||
        table === 'shipment_status_history'
      ) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const result = await getShipmentWithRelations('ship-1');

    expect(result.driver).toBeUndefined();
    expect(fromMock).not.toHaveBeenCalledWith('profiles');
  });
});
