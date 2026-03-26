"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  CheckCircle, 
  DollarSign, 
  FileText,
  TrendingUp,
  TrendingDown,
  Bell,
  Search,
  Ship,
  Plane,
  Truck,
  Train,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/TransportMarker';
import type { Shipment, TransportMode } from '@/types';

// Mock data
const mockStats = {
  active_shipments: 24,
  delivered_this_month: 156,
  total_spend: 48750,
  pending_invoices: 3,
};

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
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockNotifications = [
  { id: '1', title: 'Shipment Delivered', message: 'NXS-11223344 has been delivered to London', time: '2 hours ago', read: false },
  { id: '2', title: 'Customs Update', message: 'NXS-92345678 is awaiting customs clearance', time: '5 hours ago', read: false },
  { id: '3', title: 'Shipment In Transit', message: 'NXS-78439201 has departed Shanghai', time: '1 day ago', read: true },
];

const mockChartData = [
  { month: 'Jan', shipments: 120 },
  { month: 'Feb', shipments: 145 },
  { month: 'Mar', shipments: 132 },
  { month: 'Apr', shipments: 168 },
  { month: 'May', shipments: 189 },
  { month: 'Jun', shipments: 156 },
];

// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  href?: string;
}) => {
  const content = (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                changeType === 'positive' ? 'text-green-600' : 
                changeType === 'negative' ? 'text-red-600' : 'text-slate-500'
              }`}>
                {changeType === 'positive' ? <TrendingUp className="w-4 h-4" /> : 
                 changeType === 'negative' ? <TrendingDown className="w-4 h-4" /> : null}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Icon className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};

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
            <p className="text-xs text-slate-500">{shipment.transport_mode}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{shipment.origin.city}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="text-sm">{shipment.destination.city}</span>
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
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/tracking/${shipment.tracking_number}`}>
            Track
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </td>
    </tr>
  );
};

// Main Dashboard
const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShipments = mockShipments.filter(s => 
    s.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.origin.city?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (s.destination.city?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome back! Here&apos;s your logistics overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="relative">
              <Bell className="w-4 h-4" />
              {mockNotifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Package className="w-4 h-4 mr-2" />
              New Shipment
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Shipments"
            value={mockStats.active_shipments}
            change="+12% from last month"
            changeType="positive"
            icon={Package}
            href="/shipments"
          />
          <StatCard
            title="Delivered This Month"
            value={mockStats.delivered_this_month}
            change="+8% from last month"
            changeType="positive"
            icon={CheckCircle}
          />
          <StatCard
            title="Total Spend"
            value={`$${mockStats.total_spend.toLocaleString()}`}
            change="-5% from last month"
            changeType="positive"
            icon={DollarSign}
            href="/billing"
          />
          <StatCard
            title="Pending Invoices"
            value={mockStats.pending_invoices}
            icon={FileText}
            href="/billing"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Shipments */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>Recent Shipments</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search shipments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-48"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Shipment</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Origin</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Destination</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">ETA</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShipments.map((shipment) => (
                        <ShipmentRow key={shipment.id} shipment={shipment} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/shipments">View All Shipments</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Shipment Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Shipment Volume (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {mockChartData.map((data) => (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-orange-500 rounded-t-sm transition-all hover:bg-orange-600"
                        style={{ height: `${(data.shipments / 200) * 100}%` }}
                      />
                      <span className="text-xs text-slate-500">{data.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Notifications & Quick Actions */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-3 rounded-lg ${
                        notification.read 
                          ? 'bg-slate-50 dark:bg-slate-800/50' 
                          : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`text-sm font-medium ${
                            notification.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-orange-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: 'Track a Shipment', href: '/tracking', icon: Package },
                    { label: 'View Invoices', href: '/billing', icon: FileText },
                    { label: 'Get a Quote', href: '/#contact', icon: DollarSign },
                    { label: 'Contact Support', href: '/#contact', icon: Bell },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      className="w-full justify-between"
                      asChild
                    >
                      <Link href={action.href}>
                        <span className="flex items-center gap-2">
                          <action.icon className="w-4 h-4" />
                          {action.label}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advertisement */}
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Upgrade to Premium</h3>
                <p className="text-orange-100 text-sm mb-4">
                  Get priority support, advanced analytics, and exclusive shipping rates.
                </p>
                <Button variant="secondary" className="w-full bg-white text-orange-600 hover:bg-orange-50">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
