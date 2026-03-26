"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Ship,
  Plane,
  Truck,
  Train,
  MapPin,
  Calendar,
  MoreHorizontal,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/TransportMarker';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { getShipments } from '@/lib/api/shipments';
import type { Shipment, TransportMode } from '@/types';

// Transport icon component
const TransportIcon = ({ mode, className }: { mode: TransportMode; className?: string }) => {
  const icons: Record<TransportMode, React.ElementType> = {
    air: Plane,
    ocean: Ship,
    road: Truck,
    rail: Train,
    multimodal: Ship,
  };
  const Icon = icons[mode] || Ship;
  return <Icon className={className} />;
};

// Helper to get city from address
const getCityFromAddress = (address: unknown): string => {
  const addr = (address || {}) as Record<string, string>;
  return addr.city || '';
};

// Helper to get country from address
const getCountryFromAddress = (address: unknown): string => {
  const addr = (address || {}) as Record<string, string>;
  return addr.country || '';
};

// Shipment row component
const ShipmentRow = ({ shipment }: { shipment: Shipment }) => {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <TransportIcon mode={shipment.transport_mode as TransportMode} className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <Link 
              href={`/tracking/${shipment.tracking_number}`}
              className="font-mono font-medium text-slate-900 dark:text-white hover:text-orange-500 transition-colors"
            >
              {shipment.tracking_number}
            </Link>
            <p className="text-xs text-slate-500 capitalize">{shipment.transport_mode} Freight</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-sm font-medium">{getCityFromAddress(shipment.origin_address)}</p>
            <p className="text-xs text-slate-500">{getCountryFromAddress(shipment.origin_address)}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-sm font-medium">{getCityFromAddress(shipment.destination_address)}</p>
            <p className="text-xs text-slate-500">{getCountryFromAddress(shipment.destination_address)}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={shipment.status} />
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{shipment.delivery_date ? new Date(shipment.delivery_date).toLocaleDateString() : '-'}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm">{(shipment.weight_kg || 0).toLocaleString()} kg</p>
        <p className="text-xs text-slate-500">{shipment.volume_cbm || 0} CBM</p>
      </td>
      <td className="py-4 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/tracking/${shipment.tracking_number}`}>
                Track Shipment
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              View Documents
            </DropdownMenuItem>
            <DropdownMenuItem>
              Download Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

// Main Shipments Page
const Shipments = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Require authentication
  useRequireAuth();

  // Fetch shipments
  useEffect(() => {
    const fetchShipments = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const data = await getShipments({ customerId: user.id });
        setShipments(data);
      } catch (error) {
        console.error('Error fetching shipments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchShipments();
    }
  }, [user?.id, isAuthenticated]);

  // Filter shipments
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCityFromAddress(shipment.origin_address).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCityFromAddress(shipment.destination_address).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shipment.cargo_description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'active' ? ['in_transit', 'customs', 'out_for_delivery', 'pending'].includes(shipment.status) :
      activeTab === 'delivered' ? shipment.status === 'delivered' :
      activeTab === 'delayed' ? shipment.status === 'exception' : true;

    return matchesSearch && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    all: shipments.length,
    active: shipments.filter(s => ['in_transit', 'customs', 'out_for_delivery', 'pending'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    delayed: shipments.filter(s => s.status === 'exception').length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shipments</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage and track all your shipments</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" asChild>
              <Link href="/shipments/new">
                <Plus className="w-4 h-4 mr-2" />
                New Shipment
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by tracking number, origin, destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setCurrentPage(1); }} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all">
              All ({stats.all})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({stats.active})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered ({stats.delivered})
            </TabsTrigger>
            <TabsTrigger value="delayed">
              Delayed ({stats.delayed})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Shipments Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                          <button className="flex items-center gap-1">
                            Shipment
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Origin</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Destination</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">ETA</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Details</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedShipments.map((shipment) => (
                        <ShipmentRow key={shipment.id} shipment={shipment} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty state */}
                {paginatedShipments.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No shipments found
                    </h3>
                    <p className="text-slate-500">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredShipments.length)} of {filteredShipments.length} shipments
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? 'bg-orange-500 hover:bg-orange-600' : ''}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Advertisement Banner */}
        <Card className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Need help with customs clearance?</h3>
                <p className="text-slate-400">
                  Our expert team can handle all your customs documentation and clearance needs.
                </p>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 whitespace-nowrap">
                Get a Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shipments;
