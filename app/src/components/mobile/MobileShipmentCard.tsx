"use client";

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Shipment, ShipmentStatus, TransportMode } from '@/types';
import {
  MoreVertical,
  MapPin,
  Phone,
  FileText,
  MessageSquare,
  Plane,
  Ship,
  Truck,
  Train,
  Package,
  AlertCircle,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MobileShipmentCardProps {
  shipment: Shipment;
  customerName?: string;
  onUpdateStatus?: () => void;
  onViewMap?: () => void;
  onContactCustomer?: () => void;
}

const statusConfig: Record<ShipmentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending_dropoff: { label: 'Pending Drop-off', color: 'bg-amber-500', icon: <Package className="h-4 w-4" /> },
  scheduled_for_pickup: { label: 'Scheduled for Pickup', color: 'bg-blue-500', icon: <Package className="h-4 w-4" /> },
  in_transit: { label: 'In Transit', color: 'bg-sky-500', icon: <Truck className="h-4 w-4" /> },
  customs: { label: 'In Customs', color: 'bg-purple-500', icon: <AlertCircle className="h-4 w-4" /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-500', icon: <Truck className="h-4 w-4" /> },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: <Package className="h-4 w-4" /> },
  exception: { label: 'Exception', color: 'bg-red-500', icon: <AlertCircle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500', icon: <AlertCircle className="h-4 w-4" /> },
  returned: { label: 'Returned', color: 'bg-gray-500', icon: <AlertCircle className="h-4 w-4" /> },
};

const transportIcons: Record<TransportMode, React.ReactNode> = {
  air: <Plane className="h-4 w-4" />,
  ocean: <Ship className="h-4 w-4" />,
  road: <Truck className="h-4 w-4" />,
  rail: <Train className="h-4 w-4" />,
  multimodal: <Package className="h-4 w-4" />,
};

function getOriginDestination(shipment: Shipment): { origin: string; destination: string } {
  const origin = typeof shipment.origin_address === 'object' && shipment.origin_address !== null
    ? (shipment.origin_address as Record<string, string>).city || 'Unknown'
    : 'Unknown';
  const destination = typeof shipment.destination_address === 'object' && shipment.destination_address !== null
    ? (shipment.destination_address as Record<string, string>).city || 'Unknown'
    : 'Unknown';
  return { origin, destination };
}

export function MobileShipmentCard({
  shipment,
  customerName,
  onUpdateStatus,
  onViewMap,
  onContactCustomer,
}: MobileShipmentCardProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const status = statusConfig[shipment.status as ShipmentStatus] || statusConfig.pending_dropoff;
  const { origin, destination } = getOriginDestination(shipment);
  const eta = shipment.delivery_date 
    ? format(new Date(shipment.delivery_date), 'MMM d')
    : 'TBD';

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Link 
          href={`/ops/shipments/${shipment.id}`}
          className="font-semibold text-lg hover:text-primary transition-colors"
        >
          {shipment.tracking_number}
        </Link>
        <Sheet open={isActionsOpen} onOpenChange={setIsActionsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Shipment Actions</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 py-4">
              {onViewMap && (
                <Button variant="ghost" className="justify-start" onClick={() => {
                  onViewMap();
                  setIsActionsOpen(false);
                }}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Track on Map
                </Button>
              )}
              <Button variant="ghost" className="justify-start" asChild>
                <Link href={`/ops/shipments/${shipment.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
              {onContactCustomer && (
                <Button variant="ghost" className="justify-start" onClick={() => {
                  onContactCustomer();
                  setIsActionsOpen(false);
                }}>
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Customer
                </Button>
              )}
              {onUpdateStatus && (
                <Button variant="ghost" className="justify-start" onClick={() => {
                  onUpdateStatus();
                  setIsActionsOpen(false);
                }}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <span className="font-medium text-foreground">{origin}</span>
        <span>→</span>
        <span className="font-medium text-foreground">{destination}</span>
      </div>

      {/* Status Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium", status.color)}>
            {transportIcons[shipment.transport_mode as TransportMode] || transportIcons.road}
            <span>{status.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>ETA: {eta}</span>
        </div>
      </div>

      {/* Customer (if provided) */}
      {customerName && (
        <div className="mt-2 pt-2 border-t border-border text-sm text-muted-foreground">
          Customer: {customerName}
        </div>
      )}
    </div>
  );
}
