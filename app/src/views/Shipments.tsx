"use client";

import { useState } from 'react';
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
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/TransportMarker';
import type { Shipment, TransportMode } from '@/types';

// Extended mock data
const mockShipments: Shipment[] = [
  {
    id: '1',
    tracking_number: 'NXS-78439201',
    status: 'in-transit',
    origin: { city: 'Shanghai', country: 'China', lat: 31.23, lng: 121.47 },
    destination: { city: 'Los Angeles', country: 'USA', lat: 34.05, lng: -118.24 },
    current: { lat: 35, lng: 160, heading: 45 },
    transport_mode: 'ocean',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    weight_kg: 15000,
    volume_cbm: 45.5,
    goods_description: 'Electronics - Consumer Goods',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    tracking_number: 'NXS-92345678',
    status: 'customs',
    origin: { city: 'Rotterdam', country: 'Netherlands', lat: 51.92, lng: 4.48 },
    destination: { city: 'New York', country: 'USA', lat: 40.71, lng: -74.01 },
    current: { lat: 40.71, lng: -74.01, heading: 0 },
    transport_mode: 'ocean',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    weight_kg: 25000,
    volume_cbm: 62.0,
    goods_description: 'Automotive Parts',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    tracking_number: 'NXS-11223344',
    status: 'delivered',
    origin: { city: 'Dubai', country: 'UAE', lat: 25.20, lng: 55.27 },
    destination: { city: 'London', country: 'UK', lat: 51.51, lng: -0.13 },
    current: { lat: 51.51, lng: -0.13, heading: 0 },
    transport_mode: 'air',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    weight_kg: 2500,
    volume_cbm: 12.5,
    goods_description: 'Pharmaceuticals',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    tracking_number: 'NXS-55667788',
    status: 'pending',
    origin: { city: 'Hong Kong', country: 'China', lat: 22.32, lng: 114.17 },
    destination: { city: 'Hamburg', country: 'Germany', lat: 53.55, lng: 10.00 },
    current: { lat: 22.32, lng: 114.17, heading: 0 },
    transport_mode: 'rail',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    weight_kg: 35000,
    volume_cbm: 85.0,
    goods_description: 'Textiles & Garments',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    tracking_number: 'NXS-99887766',
    status: 'out-for-delivery',
    origin: { city: 'Singapore', country: 'Singapore', lat: 1.35, lng: 103.82 },
    destination: { city: 'Sydney', country: 'Australia', lat: -33.87, lng: 151.21 },
    current: { lat: -33.87, lng: 151.20, heading: 90 },
    transport_mode: 'ocean',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    weight_kg: 18000,
    volume_cbm: 52.0,
    goods_description: 'Machinery Equipment',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    tracking_number: 'NXS-33445566',
    status: 'delayed',
    origin: { city: 'Mumbai', country: 'India', lat: 19.08, lng: 72.88 },
    destination: { city: 'Dubai', country: 'UAE', lat: 25.20, lng: 55.27 },
    current: { lat: 22.0, lng: 64.0, heading: 270 },
    transport_mode: 'air',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    weight_kg: 5000,
    volume_cbm: 25.0,
    goods_description: 'Perishable Goods',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    tracking_number: 'NXS-77889900',
    status: 'delivered',
    origin: { city: 'Tokyo', country: 'Japan', lat: 35.68, lng: 139.69 },
    destination: { city: 'Seoul', country: 'South Korea', lat: 37.57, lng: 126.98 },
    current: { lat: 37.57, lng: 126.98, heading: 0 },
    transport_mode: 'road',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    weight_kg: 8000,
    volume_cbm: 32.0,
    goods_description: 'Consumer Electronics',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    tracking_number: 'NXS-44556677',
    status: 'in-transit',
    origin: { city: 'Sao Paulo', country: 'Brazil', lat: -23.55, lng: -46.63 },
    destination: { city: 'Miami', country: 'USA', lat: 25.76, lng: -80.19 },
    current: { lat: 5.0, lng: -35.0, heading: 330 },
    transport_mode: 'ocean',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    weight_kg: 42000,
    volume_cbm: 98.5,
    goods_description: 'Agricultural Products',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Transport icon component
const TransportIcon = ({ mode, className }: { mode: TransportMode; className?: string }) => {
  const icons: Record<TransportMode, React.ElementType> = {
    air: Plane,
    ocean: Ship,
    road: Truck,
    rail: Train,
  };
  const Icon = icons[mode];
  return <Icon className={className} />;
};

// Shipment row component
const ShipmentRow = ({ shipment }: { shipment: Shipment }) => {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <TransportIcon mode={shipment.transport_mode} className="w-5 h-5 text-slate-500" />
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
            <p className="text-sm font-medium">{shipment.origin.city}</p>
            <p className="text-xs text-slate-500">{shipment.origin.country}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-sm font-medium">{shipment.destination.city}</p>
            <p className="text-xs text-slate-500">{shipment.destination.country}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={shipment.status} />
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{new Date(shipment.estimated_arrival).toLocaleDateString()}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="text-sm">{shipment.weight_kg?.toLocaleString()} kg</p>
        <p className="text-xs text-slate-500">{shipment.volume_cbm} CBM</p>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter shipments
  const filteredShipments = mockShipments.filter(shipment => {
    const matchesSearch = 
      shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shipment.origin.city?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (shipment.destination.city?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (shipment.goods_description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'active' ? ['in-transit', 'customs', 'out-for-delivery', 'pending'].includes(shipment.status) :
      activeTab === 'delivered' ? shipment.status === 'delivered' :
      activeTab === 'delayed' ? shipment.status === 'delayed' : true;

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
    all: mockShipments.length,
    active: mockShipments.filter(s => ['in-transit', 'customs', 'out-for-delivery', 'pending'].includes(s.status)).length,
    delivered: mockShipments.filter(s => s.status === 'delivered').length,
    delayed: mockShipments.filter(s => s.status === 'delayed').length,
  };

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
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
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
