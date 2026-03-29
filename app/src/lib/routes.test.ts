import { describe, expect, it } from 'vitest';
import { getOpsShipmentHref, getShipmentTrackingHref } from './routes';

describe('routes helpers', () => {
  it('builds the ops shipment detail href', () => {
    expect(getOpsShipmentHref('fe5cc5ea-3e90-4284-8e7c-bb95d10d6aa9')).toBe(
      '/ops/shipments/fe5cc5ea-3e90-4284-8e7c-bb95d10d6aa9'
    );
  });

  it('builds the tracking href from a tracking number', () => {
    expect(getShipmentTrackingHref('NXS-TEST-001')).toBe('/tracking/NXS-TEST-001');
  });
});
