"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useRequireRole } from '@/hooks/useAuth';
import { getShipments } from '@/lib/api/shipments';
import { getCustomerQuotes } from '@/lib/api/quotes';
import { useRealtimeNotifications } from '@/hooks/useRealtime';
import type { Shipment, DashboardStats } from '@/types';
import type { Quote } from '@/lib/api/quotes';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileShipmentCard } from '@/components/mobile/MobileShipmentCard';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

// Icons
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  FileText,
  Bell,
  Plus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    exception: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    customs: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    out_for_delivery: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  };

  const labels: Record<string, string> = {
    pending: 'Pending',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    exception: 'Exception',
    customs: 'In Customs',
    out_for_delivery: 'Out for Delivery',
  };

  return (
    <Badge variant="outline" className={cn("text-xs", variants[status] || variants.pending)}>
      {labels[status] || status}
    </Badge>
  );
}

// Stat card component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

function StatCard({ title, value, icon, href, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'hover:border-primary/50',
    warning: 'hover:border-yellow-500/50',
    danger: 'hover:border-red-500/50',
    success: 'hover:border-green-500/50',
  };

  return (
    <Link href={href}>
      <Card className={cn("cursor-pointer transition-all hover:shadow-md", variantStyles[variant])}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Quote status badge
function QuoteStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    converted: 'bg-green-100 text-green-800',
  };

  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    under_review: 'Under Review',
    quoted: 'Quoted',
    accepted: 'Accepted',
    rejected: 'Rejected',
    converted: 'Converted',
  };

  return (
    <Badge variant="outline" className={cn("text-xs", variants[status] || variants.draft)}>
      {labels[status] || status}
    </Badge>
  );
}

export function CustomerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState({
    activeShipments: 0,
    deliveredShipments: 0,
    pendingQuotes: 0,
    unreadNotifications: 0,
  });

  // Require customer role
  useRequireRole(['customer'], '/ops/dashboard');

  // Real-time notifications
  const { unreadCount } = useRealtimeNotifications(user?.id || null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const [shipmentsData, quotesData] = await Promise.all([
          getShipments({ customerId: user.id }),
          getCustomerQuotes(user.id, { limit: 3 }),
        ]);

        setShipments(shipmentsData);
        setQuotes(quotesData.data);

        // Calculate stats
        setStats({
          activeShipments: shipmentsData.filter(
            (s: Shipment) => !['delivered', 'cancelled'].includes(s.status)
          ).length,
          deliveredShipments: shipmentsData.filter((s: Shipment) => s.status === 'delivered').length,
          pendingQuotes: quotesData.data.filter((q: Quote) =>
            ['submitted', 'under_review', 'quoted'].includes(q.status)
          ).length,
          unreadNotifications: unreadCount,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id, unreadCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader />
        <div className="p-4 space-y-4">
          <Skeleton className="h-20" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-48" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader />

      <main className="p-4 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-xl font-semibold">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Customer'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button className="flex-1 h-auto py-4" asChild>
            <Link href="/customer/quotes/new">
              <Plus className="mr-2 h-5 w-5" />
              Get Quote
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 h-auto py-4" asChild>
            <Link href="/customer/shipments">
              <Package className="mr-2 h-5 w-5" />
              Shipments
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Active Shipments"
            value={stats.activeShipments}
            icon={<Truck className="h-5 w-5 text-blue-600" />}
            href="/customer/shipments?status=active"
            variant="warning"
          />
          <StatCard
            title="Delivered"
            value={stats.deliveredShipments}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            href="/customer/shipments?status=delivered"
            variant="success"
          />
          <StatCard
            title="Pending Quotes"
            value={stats.pendingQuotes}
            icon={<FileText className="h-5 w-5 text-purple-600" />}
            href="/customer/quotes"
            variant="warning"
          />
          <StatCard
            title="Notifications"
            value={unreadCount}
            icon={<Bell className="h-5 w-5 text-orange-600" />}
            href="/customer/notifications"
            variant={unreadCount > 0 ? 'danger' : 'default'}
          />
        </div>

        {/* Recent Shipments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Shipments</h2>
            <Link href="/customer/shipments" className="text-sm text-primary flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {shipments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No shipments yet</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/customer/quotes/new">Request a quote</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              shipments.slice(0, 3).map((shipment) => (
                <MobileShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onViewMap={() => router.push(`/tracking/${shipment.tracking_number}`)}
                />
              ))
            )}
          </div>
        </div>

        {/* Recent Quotes */}
        {quotes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recent Quotes</h2>
              <Link href="/customer/quotes" className="text-sm text-primary flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {quotes.map((quote) => (
                <Card key={quote.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-mono text-sm text-muted-foreground">
                          {quote.quote_number}
                        </div>
                        <div className="font-medium mt-1 truncate max-w-[200px]">
                          {quote.cargo_description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {quote.weight_kg} kg • {quote.transport_mode}
                        </div>
                      </div>
                      <QuoteStatusBadge status={quote.status} />
                    </div>
                    {quote.status === 'quoted' && quote.total_amount && (
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {quote.currency} {quote.total_amount.toLocaleString()}
                        </span>
                        <Button size="sm" onClick={() => router.push(`/customer/quotes/${quote.id}`)}>
                          Review
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium">Need help?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Our support team is available 24/7 to assist you with your shipments.
                </p>
                <Button variant="link" className="p-0 h-auto mt-2" asChild>
                  <Link href="/customer/support">Contact Support</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <MobileBottomNav />
    </div>
  );
}
