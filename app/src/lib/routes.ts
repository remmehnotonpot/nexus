export function getOpsShipmentHref(shipmentId: string): string {
  return `/ops/shipments/${shipmentId}`;
}

export function getShipmentTrackingHref(trackingNumber: string): string {
  return `/tracking/${trackingNumber}`;
}
