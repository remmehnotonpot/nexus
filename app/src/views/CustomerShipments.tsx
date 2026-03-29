"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useRequireRole } from '@/hooks/useAuth';
import { getShipments } from '@/lib/api/shipments';
import { useRealtimeShipment } from '@/hooks/useRealtime';
import type { Shipment } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileShipmentCard } from '@/components/mobile/MobileShipmentCard';

// Icons
import {
  Package,
  Search,
} from 'lucide-react';

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'delivered', label: 'Delivered' },
];

export function CustomerShipments() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all');

  // Require customer role
  useRequireRole(['customer'], '/ops/shipments');

  // Filter shipments based on tab and search
  const filterShipments = useCallback((data: Shipment[], tab: string, search: string) => {
    let filtered = [...data];

    // Filter by status tab
    if (tab === 'active') {
      filtered = filtered.filter(
        (s) => !['delivered', 'cancelled'].includes(s.status)
      );
    } else if (tab === 'delivered') {
      filtered = filtered.filter((s) => s.status === 'delivered');
    } else if (tab !== 'all') {
      filtered = filtered.filter((s) => s.status === tab);
    }

    // Filter by search
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.tracking_number.toLowerCase().includes(query) ||
          (typeof s.origin_address === 'object' &&
            JSON.stringify(s.origin_address).toLowerCase().includes(query)) ||
          (typeof s.destination_address === 'object' &&
            JSON.stringify(s.destination_address).toLowerCase().includes(query))
      );
    }

    setFilteredShipments(filtered);
  }, []);

  // Fetch shipments
  useEffect(() => {
    const fetchShipments = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const data = await getShipments({ customerId: user.id });
        setShipments(data);
        filterShipments(data, activeTab, searchQuery);
      } catch (error) {
        console.error('Error fetching shipments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipments();
  }, [activeTab, filterShipments, searchQuery, user?.id]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    filterShipments(shipments, value, searchQuery);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    filterShipments(shipments, activeTab, value);
  };

  // Real-time updates for first shipment
  useRealtimeShipment(
    shipments[0]?.id || null,
    {
      onUpdate: (updatedShipment) => {
        setShipments((prev) =>
          prev.map((s) => (s.id === updatedShipment.id ? updatedShipment : s))
        );
        filterShipments(
          shipments.map((s) => (s.id === updatedShipment.id ? updatedShipment : s)),
          activeTab,
          searchQuery
        );
      },
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="My Shipments" showBack backHref="/customer/dashboard" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-8" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="My Shipments" showBack backHref="/customer/dashboard" />

      <main className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking number..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredShipments.length} shipment{filteredShipments.length !== 1 ? 's' : ''}
        </div>

        {/* Shipments List */}
        <div className="space-y-3">
          {filteredShipments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No shipments found</p>
                {searchQuery && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery('');
                      filterShipments(shipments, activeTab, '');
                    }}
                  >
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredShipments.map((shipment) => (
              <MobileShipmentCard
                key={shipment.id}
                shipment={shipment}
                onViewMap={() => router.push(`/tracking/${shipment.tracking_number}`)}
              />
            ))
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
