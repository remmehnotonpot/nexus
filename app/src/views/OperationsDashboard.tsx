"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardStats, getShipments } from '@/lib/api/operations';
import type { DashboardStats, Shipment, ShipmentStatus } from '@/types';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileShipmentCard } from '@/components/mobile/MobileShipmentCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireRole } from '@/hooks/useAuth';
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Plus,
  MapPin,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  subtext?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  onClick?: () => void;
}

function StatCard({ title, value, subtext, icon, variant = 'default', onClick }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900',
    danger: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900',
    success: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900',
  };

  const iconStyles = {
    default: 'text-primary bg-primary/10',
    warning: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50',
    danger: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50',
    success: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50',
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors hover:shadow-md",
        variantStyles[variant],
        onClick && "hover:ring-2 hover:ring-primary/20"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtext && (
              <p className={cn(
                "text-xs mt-1",
                variant === 'danger' ? 'text-red-600 dark:text-red-400' :
                variant === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-muted-foreground'
              )}>
                {subtext}
              </p>
            )}
          </div>
          <div className={cn("p-2 rounded-lg", iconStyles[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ 
  severity, 
  message, 
  trackingNumber,
  onClick 
}: { 
  severity: 'high' | 'critical'; 
  message: string;
  trackingNumber: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
        severity === 'critical' 
          ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900"
          : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900"
      )}
    >
      <AlertTriangle className={cn(
        "h-5 w-5 flex-shrink-0 mt-0.5",
        severity === 'critical' ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant={severity === 'critical' ? 'destructive' : 'secondary'} className="text-[10px]">
            {severity.toUpperCase()}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">{trackingNumber}</span>
        </div>
        <p className="text-sm mt-1 truncate">{message}</p>
      </div>
    </div>
  );
}

export function OperationsDashboard() {
  const router = useRouter();
  const { hasRole, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);

  // Require staff role
  useRequireRole(['super_admin', 'operations_manager', 'logistics_coordinator', 'driver', 'warehouse_staff', 'customer_support', 'viewer']);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, shipmentsData] = await Promise.all([
        getDashboardStats(),
        getShipments(),
      ]);
      setStats(statsData);
      setRecentShipments(shipmentsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            Good morning, {user?.fullName?.split(' ')[0] || 'Operator'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Pickups"
            value={stats?.todayPickups || 0}
            subtext={stats?.pickupsPending ? `${stats.pickupsPending} pending` : undefined}
            icon={<Package className="h-5 w-5" />}
            variant={stats?.pickupsPending ? 'warning' : 'default'}
            onClick={() => router.push('/ops/shipments?status=pending')}
          />
          <StatCard
            title="In Transit"
            value={stats?.inTransit || 0}
            subtext={stats?.inTransitDelayed ? `${stats.inTransitDelayed} delayed` : undefined}
            icon={<Truck className="h-5 w-5" />}
            variant={stats?.inTransitDelayed ? 'warning' : 'default'}
            onClick={() => router.push('/ops/shipments?status=in_transit')}
          />
          <StatCard
            title="Deliveries"
            value={stats?.deliveriesToday || 0}
            subtext={stats?.deliveriesWithIssue ? `${stats.deliveriesWithIssue} issue` : undefined}
            icon={<CheckCircle className="h-5 w-5" />}
            variant={stats?.deliveriesWithIssue ? 'danger' : 'success'}
            onClick={() => router.push('/ops/shipments?status=delivered')}
          />
          <StatCard
            title="Exceptions"
            value={stats?.exceptionsNeedAttention || 0}
            subtext={stats?.exceptionsNeedAttention ? 'needs attention' : undefined}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant={stats?.exceptionsNeedAttention ? 'danger' : 'default'}
            onClick={() => router.push('/ops/shipments?status=exception')}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button className="flex-1 h-auto py-4" asChild>
            <Link href="/ops/shipments/new">
              <Plus className="mr-2 h-5 w-5" />
              New Shipment
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 h-auto py-4" asChild>
            <Link href="/ops/shipments">
              <Package className="mr-2 h-5 w-5" />
              All Shipments
            </Link>
          </Button>
        </div>

        {/* Alerts */}
        {(stats?.exceptionsNeedAttention || 0) > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Alerts & Exceptions</h2>
              <Link href="/ops/exceptions" className="text-sm text-primary">
                View All →
              </Link>
            </div>
            <div className="space-y-2">
              <AlertItem
                severity="critical"
                message="Customs hold - documents needed"
                trackingNumber="NXS-2024-015"
                onClick={() => router.push('/ops/shipments/NXS-2024-015')}
              />
              <AlertItem
                severity="high"
                message="Delayed pickup (2h overdue)"
                trackingNumber="NXS-2024-001"
                onClick={() => router.push('/ops/shipments/NXS-2024-001')}
              />
            </div>
          </div>
        )}

        {/* Recent Shipments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Shipments</h2>
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentShipments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent shipments</p>
                </CardContent>
              </Card>
            ) : (
              recentShipments.map((shipment) => (
                <MobileShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onUpdateStatus={() => router.push(`/ops/shipments/${shipment.id}/update`)}
                  onViewMap={() => router.push(`/ops/shipments/${shipment.id}/map`)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
