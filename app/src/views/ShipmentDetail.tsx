"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { getShipmentWithRelations, updateShipmentStatus } from '@/lib/api/operations';
import type { ShipmentWithRelations, ShipmentStatus } from '@/types';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileStatusUpdate } from '@/components/mobile/MobileStatusUpdate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRequireRole } from '@/hooks/useAuth';
import {
  Package,
  MapPin,
  Phone,
  Mail,
  FileText,
  User,
  Truck,
  Calendar,
  Weight,
  Box,
  AlertCircle,
  CheckCircle,
  Circle,
  Clock,
  ArrowRight,
  Plane,
  Ship,
  Train,
} from 'lucide-react';

interface ShipmentDetailProps {
  shipmentId: string;
}

const statusConfig: Record<ShipmentStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  in_transit: { label: 'In Transit', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  customs: { label: 'In Customs', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  delivered: { label: 'Delivered', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  exception: { label: 'Exception', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  cancelled: { label: 'Cancelled', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
};

const transportIcons = {
  air: Plane,
  ocean: Ship,
  road: Truck,
  rail: Train,
  multimodal: Package,
};

function TimelineItem({
  status,
  title,
  subtitle,
  date,
  isCompleted,
  isCurrent,
  isLast,
}: {
  status: 'completed' | 'current' | 'pending';
  title: string;
  subtitle?: string;
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center border-2",
          isCompleted && "bg-green-500 border-green-500 text-white",
          isCurrent && "bg-primary border-primary text-primary-foreground",
          !isCompleted && !isCurrent && "border-gray-300 text-gray-300"
        )}>
          {isCompleted ? (
            <CheckCircle className="h-5 w-5" />
          ) : isCurrent ? (
            <Clock className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </div>
        {!isLast && (
          <div className={cn(
            "w-0.5 flex-1 my-1",
            isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
          )} />
        )}
      </div>
      <div className={cn(
        "pb-6 flex-1",
        isCurrent && "opacity-100",
        !isCompleted && !isCurrent && "opacity-60"
      )}>
        <p className={cn(
          "font-medium",
          isCurrent && "text-primary"
        )}>
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        {date && (
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(date), 'MMM d, h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
}

export function ShipmentDetail({ shipmentId }: ShipmentDetailProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [shipment, setShipment] = useState<ShipmentWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Require staff role
  useRequireRole(['super_admin', 'operations_manager', 'logistics_coordinator', 'driver', 'warehouse_staff', 'customer_support', 'viewer']);

  useEffect(() => {
    fetchShipment();
  }, [shipmentId]);

  const fetchShipment = async () => {
    setIsLoading(true);
    try {
      const data = await getShipmentWithRelations(shipmentId);
      setShipment(data);
      setError(null);
    } catch (err) {
      setError('Failed to load shipment details');
      console.error('Error fetching shipment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (updateData: {
    status: ShipmentStatus;
    subStatus?: string;
    notes: string;
    notifyCustomer: boolean;
  }) => {
    if (!profile || !shipment) return;

    await updateShipmentStatus(
      shipmentId,
      {
        status: updateData.status,
        subStatus: updateData.subStatus,
        notes: updateData.notes,
        notifyCustomer: updateData.notifyCustomer,
      },
      profile.id,
      profile.role
    );

    // Refresh shipment data
    await fetchShipment();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Shipment" showBack backHref="/ops/shipments" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Shipment" showBack backHref="/ops/shipments" />
        <div className="p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-destructive" />
              <p className="text-destructive">{error || 'Shipment not found'}</p>
              <Button className="mt-4" onClick={() => router.push('/ops/shipments')}>
                Back to Shipments
              </Button>
            </CardContent>
          </Card>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const status = statusConfig[shipment.status as ShipmentStatus] || statusConfig.pending;
  const TransportIcon = transportIcons[shipment.transport_mode as keyof typeof transportIcons] || Truck;
  const origin = typeof shipment.origin_address === 'object' && shipment.origin_address !== null
    ? (shipment.origin_address as Record<string, string>)
    : { city: 'Unknown', country: '' };
  const destination = typeof shipment.destination_address === 'object' && shipment.destination_address !== null
    ? (shipment.destination_address as Record<string, string>)
    : { city: 'Unknown', country: '' };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader 
        title={shipment.tracking_number} 
        showBack 
        backHref="/ops/shipments"
      />
      
      <main className="p-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", status.bgColor, status.color)}>
                  <TransportIcon className="h-4 w-4" />
                  <span className="uppercase">{status.label}</span>
                </div>
                {shipment.sub_status && (
                  <p className="text-sm text-muted-foreground mt-2 capitalize">
                    → {shipment.sub_status.replace('_', ' ')}
                  </p>
                )}
                {shipment.delivery_date && (
                  <p className="text-sm mt-2">
                    ETA: <span className="font-medium">{format(new Date(shipment.delivery_date), 'MMM d, yyyy')}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{shipment.weight_kg?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">kg</p>
              </div>
            </div>

            {/* Update Status Button */}
            <MobileStatusUpdate
              currentStatus={shipment.status as ShipmentStatus}
              onSubmit={handleStatusUpdate}
              trigger={
                <Button className="w-full mt-4">
                  Update Status
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* Route Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Route Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="font-semibold">{origin.city}</p>
                <p className="text-xs text-muted-foreground">{origin.country}</p>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: shipment.status === 'delivered' ? '100%' : '60%' }}
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold">{destination.city}</p>
                <p className="text-xs text-muted-foreground">{destination.country}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push(`/ops/shipments/${shipmentId}/map`)}>
              <MapPin className="mr-2 h-4 w-4" />
              View on Map
            </Button>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {shipment.milestones?.map((milestone, index) => (
                <TimelineItem
                  key={milestone.id}
                  status={milestone.status as 'completed' | 'current' | 'pending'}
                  title={milestone.location_name}
                  subtitle={milestone.type.replace('_', ' ')}
                  date={milestone.actual_date || milestone.scheduled_date || undefined}
                  isCompleted={milestone.status === 'completed'}
                  isCurrent={milestone.status === 'in_progress'}
                  isLast={index === (shipment.milestones?.length || 0) - 1}
                />
              )) || (
                <TimelineItem
                  status="completed"
                  title="Shipment Created"
                  date={shipment.created_at || undefined}
                  isCompleted={true}
                  isCurrent={false}
                  isLast={true}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        {shipment.documents && shipment.documents.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Documents ({shipment.documents.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {shipment.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {doc.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer */}
        {shipment.customer && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{shipment.customer.company_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{shipment.customer.company_name}</p>
                    <p className="text-sm text-muted-foreground">{shipment.customer.contact_name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {shipment.customer.phone && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`tel:${shipment.customer.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`mailto:${shipment.customer.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Driver */}
        {shipment.driver && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assigned Driver</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{shipment.driver.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{shipment.driver.full_name}</p>
                  <p className="text-sm text-muted-foreground">{shipment.driver.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cargo Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cargo Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-medium">{shipment.weight_kg?.toLocaleString()} kg</p>
              </div>
              {shipment.volume_cbm && (
                <div>
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="font-medium">{shipment.volume_cbm} CBM</p>
                </div>
              )}
              {shipment.pieces && (
                <div>
                  <p className="text-sm text-muted-foreground">Pieces</p>
                  <p className="font-medium">{shipment.pieces}</p>
                </div>
              )}
              {shipment.cargo_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Cargo Type</p>
                  <p className="font-medium capitalize">{shipment.cargo_type.replace('_', ' ')}</p>
                </div>
              )}
            </div>
            {shipment.cargo_description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1">{shipment.cargo_description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <MobileBottomNav />
    </div>
  );
}
