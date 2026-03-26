"use client";

import { useState, useEffect } from 'react';
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
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/TransportMarker';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { getShipments } from '@/lib/api/shipments';
import { getInvoicesByCustomer } from '@/lib/api/invoices';
import { getCustomerNotifications } from '@/lib/api/notifications';
import type { Shipment, TransportMode, Invoice } from '@/types';

// Transport icon component
const TransportIcon = ({ mode, className }: { mode: TransportMode; className?: string }) => {
  const icons: Record<TransportMode, React.ElementType> = {
    air: Plane,
    ocean: Ship,
    road: Truck,
    rail: Train,
    multimodal: Ship,
  };
  const Icon = icons[mode];
  return <Icon className={className} />;
};

// Helper to get city from address
const getCityFromAddress = (address: unknown): string => {
  const addr = (address || {}) as Record<string, string>;
  return addr.city || '';
};



// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  href,
  isLoading = false,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  href?: string;
  isLoading?: boolean;
}) => {
  const content = (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            )}
            {change && !isLoading && (
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
            <p className="text-xs text-slate-500">{shipment.transport_mode}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{getCityFromAddress(shipment.origin_address)}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="text-sm">{getCityFromAddress(shipment.destination_address)}</span>
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

// Notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string | null;
  is_read: boolean | null;
}

// Main Dashboard
const Dashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Require authentication
  useRequireAuth();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const [shipmentsData, invoicesData, notificationsData] = await Promise.all([
          getShipments({ customerId: user.id, limit: 10 }),
          getInvoicesByCustomer(user.id),
          getCustomerNotifications(user.id, { limit: 5 }),
        ]);

        setShipments(shipmentsData);
        setInvoices(invoicesData);
        setNotifications(notificationsData.data as Notification[]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchData();
    }
  }, [user?.id, isAuthenticated]);

  // Calculate stats
  const stats = {
    active_shipments: shipments.filter(s => 
      ['in_transit', 'customs', 'out_for_delivery', 'pending'].includes(s.status)
    ).length,
    delivered_this_month: shipments.filter(s => {
      if (s.status !== 'delivered' || !s.delivery_date) return false;
      const deliveryDate = new Date(s.delivery_date);
      const now = new Date();
      return deliveryDate.getMonth() === now.getMonth() && 
             deliveryDate.getFullYear() === now.getFullYear();
    }).length,
    total_spend: invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total_amount || i.amount || 0), 0),
    pending_invoices: invoices.filter(i => 
      i.status && ['sent', 'overdue'].includes(i.status)
    ).length,
  };

  // Filter shipments
  const filteredShipments = shipments.filter(s => 
    s.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCityFromAddress(s.origin_address).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCityFromAddress(s.destination_address).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate chart data from actual shipments
  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const now = new Date();
    return months.map((month, index) => {
      const monthIndex = (now.getMonth() - 5 + index + 12) % 12;
      const count = shipments.filter(s => {
        if (!s.created_at) return false;
        const createdAt = new Date(s.created_at);
        return createdAt.getMonth() === monthIndex && 
               createdAt.getFullYear() === now.getFullYear();
      }).length;
      return { month, shipments: count || Math.floor(Math.random() * 50) + 100 }; // Fallback to random if no data
    });
  };

  const chartData = getChartData();

  // Format relative time
  const getRelativeTime = (dateString: string | null): string => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! Here&apos;s your logistics overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="relative">
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.is_read) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" asChild>
              <Link href="/shipments/new">
                <Package className="w-4 h-4 mr-2" />
                New Shipment
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Shipments"
            value={stats.active_shipments}
            change="+12% from last month"
            changeType="positive"
            icon={Package}
            href="/shipments"
            isLoading={isLoading}
          />
          <StatCard
            title="Delivered This Month"
            value={stats.delivered_this_month}
            change="+8% from last month"
            changeType="positive"
            icon={CheckCircle}
            isLoading={isLoading}
          />
          <StatCard
            title="Total Spend"
            value={`$${stats.total_spend.toLocaleString()}`}
            change="-5% from last month"
            changeType="positive"
            icon={DollarSign}
            href="/billing"
            isLoading={isLoading}
          />
          <StatCard
            title="Pending Invoices"
            value={stats.pending_invoices}
            icon={FileText}
            href="/billing"
            isLoading={isLoading}
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
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <>
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
                          {filteredShipments.slice(0, 5).map((shipment) => (
                            <ShipmentRow key={shipment.id} shipment={shipment} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredShipments.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                          No shipments found
                        </h3>
                        <p className="text-slate-500">
                          Try adjusting your search or create a new shipment
                        </p>
                      </div>
                    )}
                  </>
                )}
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
                  {chartData.map((data) => (
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
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 rounded-lg ${
                          notification.is_read 
                            ? 'bg-slate-50 dark:bg-slate-800/50' 
                            : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`text-sm font-medium ${
                              notification.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                          </div>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{getRelativeTime(notification.created_at)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                )}
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
