"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { getShipments } from '@/lib/api/operations';
import type { Shipment, ShipmentStatus, TransportMode } from '@/types';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileShipmentCard } from '@/components/mobile/MobileShipmentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireRole } from '@/hooks/useAuth';
import {
  Search,
  Filter,
  Plus,
  Package,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusFilters: { value: ShipmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending_dropoff', label: 'Pending Drop-off' },
  { value: 'scheduled_for_pickup', label: 'Scheduled for Pickup' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'customs', label: 'In Customs' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'exception', label: 'Exception' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

const transportFilters: { value: TransportMode | 'all'; label: string }[] = [
  { value: 'all', label: 'All Modes' },
  { value: 'air', label: 'Air' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'road', label: 'Road' },
  { value: 'rail', label: 'Rail' },
  { value: 'multimodal', label: 'Multimodal' },
];

export function OperationsShipments() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>(
    (searchParams.get('status') as ShipmentStatus) || 'all'
  );
  const [transportFilter, setTransportFilter] = useState<TransportMode | 'all'>('all');

  // Require staff role
  useRequireRole(['super_admin', 'operations_manager', 'logistics_coordinator', 'driver', 'warehouse_staff', 'customer_support', 'viewer']);

  const fetchShipments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getShipments({
        status: statusFilter === 'all' ? undefined : statusFilter,
        transportMode: transportFilter === 'all' ? undefined : transportFilter,
        searchQuery: searchQuery || undefined,
      });
      setShipments(data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, transportFilter, searchQuery]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const clearFilters = () => {
    setStatusFilter('all');
    setTransportFilter('all');
    setSearchQuery('');
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    transportFilter !== 'all',
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Shipments" showBack backHref="/ops/dashboard" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-10" />
          <div className="space-y-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader 
        title="Shipments" 
        showBack 
        backHref="/ops/dashboard"
        rightElement={
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href="/ops/shipments/new">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        }
      />
      
      <main className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shipments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ShipmentStatus | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusFilters.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Transport Mode Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transport Mode</label>
                  <Select value={transportFilter} onValueChange={(v) => setTransportFilter(v as TransportMode | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {transportFilters.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters */}
                {activeFiltersCount > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Active Filters</label>
                    <div className="flex flex-wrap gap-2">
                      {statusFilter !== 'all' && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setStatusFilter('all')}>
                          Status: {statusFilter.replace('_', ' ')} ×
                        </Badge>
                      )}
                      {transportFilter !== 'all' && (
                        <Badge variant="secondary" className="cursor-pointer" onClick={() => setTransportFilter('all')}>
                          Mode: {transportFilter} ×
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Clear Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearFilters}
                  disabled={activeFiltersCount === 0}
                >
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {shipments.length} shipment{shipments.length !== 1 ? 's' : ''}
          </span>
          {(activeFiltersCount > 0 || searchQuery) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Shipments List */}
        <div className="space-y-3">
          {shipments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No shipments found</p>
                <p className="text-sm mt-1">
                  {activeFiltersCount > 0 || searchQuery
                    ? 'Try adjusting your filters'
                    : 'Create a new shipment to get started'}
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/ops/shipments/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Shipment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            shipments.map((shipment) => (
              <MobileShipmentCard
                key={shipment.id}
                shipment={shipment}
                onUpdateStatus={() => router.push(`/ops/shipments/${shipment.id}/update`)}
                onViewMap={() => router.push(`/ops/shipments/${shipment.id}/map`)}
              />
            ))
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
