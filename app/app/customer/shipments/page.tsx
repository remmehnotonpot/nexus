import { Suspense } from 'react';
import { CustomerShipments } from '@/views/CustomerShipments';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'My Shipments - Swish Portal',
  description: 'View your shipments',
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <Skeleton className="h-10" />
      <Skeleton className="h-8" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}

export default function CustomerShipmentsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CustomerShipments />
    </Suspense>
  );
}
