"use client";

import { useState, useMemo, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  Clock, 
  MapPin,
  Ship,
  Plane,
  Truck,
  Train,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateETA, formatRemainingTime, getDelaySeverityBadge } from '@/lib/eta';
import { getShipments } from '@/lib/api/shipments';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import type { Shipment, TransportMode } from '@/types';

const TransportIcon = ({ mode, className }: { mode: TransportMode; className?: string }) => {
  const icons: Record<TransportMode, React.ReactNode> = {
    air: <Plane className={className} />,
    ocean: <Ship className={className} />,
    road: <Truck className={className} />,
    rail: <Train className={className} />,
    multimodal: <Ship className={className} />,
  };
  return icons[mode] || <Ship className={className} />;
};

interface AnalyticsStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  exceptionShipments: number;
  deliveryRate: number;
  averageTransitTime: number;
  totalWeight: number;
  totalVolume: number;
}

interface RoutePerformance {
  origin: string;
  destination: string;
  transportMode: TransportMode;
  shipmentCount: number;
  avgTransitTime: number;
  onTimeRate: number;
}

export function Analytics() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Require authentication
  useRequireAuth();

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const data = await getShipments();
        setShipments(data);
      } catch (err) {
        setError('Failed to load analytics data. Please try again later.');
        console.error('Error fetching shipments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Calculate analytics statistics from real data
  const stats: AnalyticsStats = useMemo(() => {
    const total = shipments.length;
    const active = shipments.filter(s => s.status === 'in_transit').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const exceptions = shipments.filter(s => s.status === 'exception').length;
    const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
    
    const deliveredWithDates = shipments.filter(s => 
      s.status === 'delivered' && s.delivery_date && s.created_at
    ) as Array<Shipment & { delivery_date: string; created_at: string }>;
    
    const avgTransitTime = deliveredWithDates.length > 0
      ? deliveredWithDates.reduce((acc, s) => {
          const created = new Date(s.created_at).getTime();
          const delivered = new Date(s.delivery_date).getTime();
          return acc + (delivered - created) / (1000 * 60 * 60 * 24);
        }, 0) / deliveredWithDates.length
      : 0;

    const totalWeight = shipments.reduce((acc, s) => acc + (s.weight_kg || 0), 0);
    const totalVolume = shipments.reduce((acc, s) => acc + (s.volume_cbm || 0), 0);

    return {
      totalShipments: total,
      activeShipments: active,
      deliveredShipments: delivered,
      exceptionShipments: exceptions,
      deliveryRate,
      averageTransitTime: avgTransitTime,
      totalWeight,
      totalVolume,
    };
  }, [shipments]);

  // Calculate top routes from real data
  const topRoutes: RoutePerformance[] = useMemo(() => {
    const routeMap = new Map<string, RoutePerformance & { totalTime: number; onTimeCount: number }>();

    shipments.forEach(shipment => {
      const originAddr = (shipment.origin_address || {}) as Record<string, string>;
      const destAddr = (shipment.destination_address || {}) as Record<string, string>;
      const key = `${originAddr.city}-${destAddr.city}`;
      const existing = routeMap.get(key);
      
      let transitTime = 0;
      let isOnTime = true;
      
      if (shipment.status === 'delivered' && shipment.delivery_date && shipment.created_at) {
        const delivery = new Date(shipment.delivery_date).getTime();
        transitTime = (delivery - new Date(shipment.created_at).getTime()) / (1000 * 60 * 60 * 24);
        isOnTime = true;
      }

      if (existing) {
        existing.shipmentCount++;
        existing.totalTime += transitTime;
        if (isOnTime) existing.onTimeCount++;
        existing.avgTransitTime = existing.totalTime / existing.shipmentCount;
        existing.onTimeRate = (existing.onTimeCount / existing.shipmentCount) * 100;
      } else {
        routeMap.set(key, {
          origin: (originAddr.city as string) ?? 'Unknown',
          destination: (destAddr.city as string) ?? 'Unknown',
          transportMode: shipment.transport_mode as TransportMode,
          shipmentCount: 1,
          avgTransitTime: transitTime,
          onTimeRate: isOnTime ? 100 : 0,
          totalTime: transitTime,
          onTimeCount: isOnTime ? 1 : 0,
        });
      }
    });

    return Array.from(routeMap.values())
      .sort((a, b) => b.shipmentCount - a.shipmentCount)
      .slice(0, 5);
  }, [shipments]);

  // Transport mode breakdown from real data
  const transportBreakdown = useMemo(() => {
    const breakdown: Record<TransportMode, { count: number; weight: number; volume: number }> = {
      air: { count: 0, weight: 0, volume: 0 },
      ocean: { count: 0, weight: 0, volume: 0 },
      road: { count: 0, weight: 0, volume: 0 },
      rail: { count: 0, weight: 0, volume: 0 },
      multimodal: { count: 0, weight: 0, volume: 0 },
    };

    shipments.forEach(s => {
      const mode = s.transport_mode as TransportMode;
      if (breakdown[mode]) {
        breakdown[mode].count++;
        breakdown[mode].weight += s.weight_kg || 0;
        breakdown[mode].volume += s.volume_cbm || 0;
      }
    });

    return breakdown;
  }, [shipments]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive" className="max-w-md mx-auto mt-20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-orange-500" />
              Analytics Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Insights into your logistics operations and shipment performance
            </p>
          </div>
          <Badge variant="outline" className="border-slate-700 text-slate-400">
            <Calendar className="w-3 h-3 mr-1" />
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Shipments</p>
                  <p className="text-3xl font-bold text-white">{stats.totalShipments}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm">
                <span className="text-green-400 flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  {stats.activeShipments} active
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Delivery Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.deliveryRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm">
                <span className="text-slate-400">
                  {stats.deliveredShipments} delivered
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Transit Time</p>
                  <p className="text-3xl font-bold text-white">{stats.averageTransitTime.toFixed(1)}d</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm">
                <span className="text-slate-400">
                  End-to-end delivery
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Exceptions</p>
                  <p className="text-3xl font-bold text-white">{stats.exceptionShipments}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm">
                {stats.exceptionShipments > 0 ? (
                  <span className="text-red-400 flex items-center">
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                    Requires attention
                  </span>
                ) : (
                  <span className="text-green-400">All on schedule</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-900 border-slate-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="routes">Top Routes</TabsTrigger>
            <TabsTrigger value="transport">Transport Modes</TabsTrigger>
            <TabsTrigger value="shipments">Active Shipments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Volume & Weight Stats */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Cargo Volume</CardTitle>
                  <CardDescription className="text-slate-400">
                    Total weight and volume across all shipments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Total Weight</span>
                      <span className="text-white font-medium">
                        {(stats.totalWeight / 1000).toFixed(1)} tonnes
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Total Volume</span>
                      <span className="text-white font-medium">
                        {stats.totalVolume.toFixed(1)} m³
                      </span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Status Breakdown */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Status Breakdown</CardTitle>
                  <CardDescription className="text-slate-400">
                    Current status distribution of all shipments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'In Transit', value: stats.activeShipments, color: 'bg-blue-500', total: stats.totalShipments },
                      { label: 'Delivered', value: stats.deliveredShipments, color: 'bg-green-500', total: stats.totalShipments },
                      { label: 'Exceptions', value: stats.exceptionShipments, color: 'bg-red-500', total: stats.totalShipments },
                      { label: 'Pending', value: Math.max(0, stats.totalShipments - stats.activeShipments - stats.deliveredShipments - stats.exceptionShipments), color: 'bg-yellow-500', total: stats.totalShipments },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-slate-400 w-24">{item.label}</span>
                        <div className="flex-1">
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.color} transition-all`}
                              style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-white w-8 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Top Routes
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Most frequently used shipping routes by volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topRoutes.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No route data available yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topRoutes.map((route, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-slate-700 rounded-full">
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-white">
                              <span>{route.origin}</span>
                              <TrendingUp className="w-4 h-4 text-slate-500" />
                              <span>{route.destination}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <TransportIcon mode={route.transportMode} className="w-4 h-4" />
                              <span className="capitalize">{route.transportMode}</span>
                              <span className="mx-1">•</span>
                              <span>{route.shipmentCount} shipments</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">Avg Transit</div>
                          <div className="text-white font-medium">{route.avgTransitTime.toFixed(1)} days</div>
                          <div className="text-xs text-green-400">{route.onTimeRate.toFixed(0)}% on time</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transport Modes Tab */}
          <TabsContent value="transport">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.entries(transportBreakdown) as [TransportMode, typeof transportBreakdown.air][]).map(([mode, data]) => (
                <Card key={mode} className="bg-slate-900 border-slate-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <TransportIcon mode={mode} className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{mode}</p>
                        <p className="text-sm text-slate-400">{data.count} shipments</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Weight</span>
                        <span className="text-white">{(data.weight / 1000).toFixed(1)}t</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Volume</span>
                        <span className="text-white">{data.volume.toFixed(1)}m³</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Active Shipments Tab */}
          <TabsContent value="shipments">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Active Shipments</CardTitle>
                <CardDescription className="text-slate-400">
                  Currently in-transit shipments with ETA information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shipments.filter(s => s.status === 'in_transit' || s.status === 'exception').length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active shipments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shipments
                      .filter(s => s.status === 'in_transit' || s.status === 'exception')
                      .map(shipment => {
                        const eta = calculateETA(shipment);
                        return (
                          <div 
                            key={shipment.id}
                            className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-slate-700 rounded-lg">
                                <TransportIcon mode={shipment.transport_mode as TransportMode} className="w-5 h-5 text-orange-500" />
                              </div>
                              <div>
                                <div className="font-mono text-white">{shipment.tracking_number}</div>
                                <div className="text-sm text-slate-400">
                                  {((shipment.origin_address || {}) as Record<string, string>).city ?? 'Unknown'} → {((shipment.destination_address || {}) as Record<string, string>).city ?? 'Unknown'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="text-sm text-slate-400">Progress</div>
                                <div className="text-white font-medium">{eta.progressPercentage}%</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-slate-400">ETA</div>
                                <div className="text-white">{formatRemainingTime(eta.remainingHours)}</div>
                              </div>
                              {(() => {
                                const badge = getDelaySeverityBadge(eta.delaySeverity);
                                return (
                                  <Badge variant="outline" className={badge.className}>
                                    {badge.label}
                                  </Badge>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
