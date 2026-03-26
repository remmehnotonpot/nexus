import { ShipmentDetail } from '@/views/ShipmentDetail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Shipment ${id} - Swish Portal Operations`,
    description: 'Shipment details and management',
  };
}

export default async function ShipmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ShipmentDetail shipmentId={id} />;
}
