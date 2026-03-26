"use client";

import { useState, useMemo } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateETA, formatRemainingTime, getDelaySeverityBadge } from '@/lib/eta';
import type { Shipment, TrackingLog, TransportMode } from '@/types';

// Mock data for analytics
const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: '1',
    tracking_number: 'NXS-DEMO-001',
    status: 'in-transit',
    origin: { lat: 31.2304, lng: 121.4737, city: 'Shanghai', country: 'China' },
    destination: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' },
    current: { lat: 35, lng: 140, heading: 45 },
    current_lat: 35,
    current_lng: 140,
    current_heading: 45,
    transport_mode: 'ocean',
    is_live_demo: true,
    estimated_arrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    weight_kg: 15000,
    volume_cbm: 45.5,
  },
  {
    id: '2',
    tracking_number: 'NXS-ABC-123',
    status: 'delivered',
    origin: { lat: 51.9244, lng: 4.4777, city: 'Rotterdam', country: 'Netherlands' },
    destination: { lat: 40.7128, lng: -74.006, city: 'New York', country: 'USA' },
    current: { lat: 40.7128, lng: -74.006, heading: 0 },
    current_lat: 40.7128,
    current_lng: -74.006,
    current_heading: 0,
    transport_mode: 'ocean',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actual_arrival: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    weight_kg: 25000,
    volume_cbm: 80,
  },
  {
    id: '3',
    tracking_number: 'NXS-XYZ-789',
    status: 'delayed',
    origin: { lat: 25.2048, lng: 55.2708, city: 'Dubai', country: 'UAE' },
    destination: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
    current: { lat: 42, lng: 20, heading: 90 },
    current_lat: 42,
    current_lng: 20,
    current_heading: 90,
    transport_mode: 'air',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    weight_kg: 5000,
    volume_cbm: 25,
  },
  {
    id: '4',
    tracking_number: 'NXS-TEST-456',
    status: 'in-transit',
    origin: { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore' },
    destination: { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia' },
    current: { lat: -15, lng: 120, heading: 180 },
    current_lat: -15,
    current_lng: 120,
    current_heading: 180,
    transport_mode: 'ocean',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    weight_kg: 12000,
    volume_cbm: 35,
  },
  {
    id: '5',
    tracking_number: 'NXS-RAIL-001',
    status: 'pending',
    origin: { lat: 22.3193, lng: 114.1694, city: 'Hong Kong', country: 'China' },
    destination: { lat: 53.5511, lng: 9.9937, city: 'Hamburg', country: 'Germany' },
    current: { lat: 22.3193, lng: 114.1694, heading: 0 },
    current_lat: 22.3193,
    current_lng: 114.1694,
    current_heading: 0,
    transport_mode: 'rail',
    is_live_demo: false,
    estimated_arrival: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    weight_kg: 30000,
    volume_cbm: 120,
  },
];

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

interface AnalyticsStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  delayedShipments: number;
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
  const [shipments] = useState<Shipment[]>(MOCK_SHIPMENTS);

  // Calculate analytics statistics
  const stats: AnalyticsStats = useMemo(() => {
    const total = shipments.length;
    const active = shipments.filter(s => s.status === 'in-transit').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const delayed = shipments.filter(s => s.status === 'delayed').length;
    const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
    
    const deliveredWithDates = shipments.filter(s => 
      s.status === 'delivered' && s.actual_arrival && s.created_at
    );
    const avgTransitTime = deliveredWithDates.length > 0
      ? deliveredWithDates.reduce((acc, s) => {
          const created = new Date(s.created_at).getTime();
          const delivered = new Date(s.actual_arrival!).getTime();
          return acc + (delivered - created) / (1000 * 60 * 60 * 24);
        }, 0) / deliveredWithDates.length
      : 0;

    const totalWeight = shipments.reduce((acc, s) => acc + (s.weight_kg || 0), 0);
    const totalVolume = shipments.reduce((acc, s) => acc + (s.volume_cbm || 0), 0);

    return {
      totalShipments: total,
      activeShipments: active,
      deliveredShipments: delivered,
      delayedShipments: delayed,
      deliveryRate,
      averageTransitTime: avgTransitTime,
      totalWeight,
      totalVolume,
    };
  }, [shipments]);

  // Calculate top routes
  const topRoutes: RoutePerformance[] = useMemo(() => {
    const routeMap = new Map<string, RoutePerformance & { totalTime: number; onTimeCount: number }>();

    shipments.forEach(shipment => {
      const key = `${shipment.origin.city}-${shipment.destination.city}`;
      const existing = routeMap.get(key);
      
      let transitTime = 0;
      let isOnTime = true;
      
      if (shipment.actual_arrival && shipment.estimated_arrival) {
        const actual = new Date(shipment.actual_arrival).getTime();
        const estimated = new Date(shipment.estimated_arrival).getTime();
        transitTime = (actual - new Date(shipment.created_at).getTime()) / (1000 * 60 * 60 * 24);
        isOnTime = actual <= estimated;
      }

      if (existing) {
        existing.shipmentCount++;
        existing.totalTime += transitTime;
        if (isOnTime) existing.onTimeCount++;
        existing.avgTransitTime = existing.totalTime / existing.shipmentCount;
        existing.onTimeRate = (existing.onTimeCount / existing.shipmentCount) * 100;
      } else {
        routeMap.set(key, {
          origin: shipment.origin.city ?? 'Unknown',
          destination: shipment.destination.city ?? 'Unknown',
          transportMode: shipment.transport_mode,
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

  // Transport mode breakdown
  const transportBreakdown = useMemo(() => {
    const breakdown: Record<TransportMode, { count: number; weight: number; volume: number }> = {
      air: { count: 0, weight: 0, volume: 0 },
      ocean: { count: 0, weight: 0, volume: 0 },
      road: { count: 0, weight: 0, volume: 0 },
      rail: { count: 0, weight: 0, volume: 0 },
    };

    shipments.forEach(s => {
      breakdown[s.transport_mode].count++;
      breakdown[s.transport_mode].weight += s.weight_kg || 0;
      breakdown[s.transport_mode].volume += s.volume_cbm || 0;
    });

    return breakdown;
  }, [shipments]);

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
                  <p className="text-sm text-slate-400">Delayed</p>
                  <p className="text-3xl font-bold text-white">{stats.delayedShipments}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm">
                {stats.delayedShipments > 0 ? (
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
                      { label: 'Delayed', value: stats.delayedShipments, color: 'bg-red-500', total: stats.totalShipments },
                      { label: 'Pending', value: stats.totalShipments - stats.activeShipments - stats.deliveredShipments - stats.delayedShipments, color: 'bg-yellow-500', total: stats.totalShipments },
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
                <div className="space-y-4">
                  {shipments
                    .filter(s => s.status === 'in-transit' || s.status === 'delayed')
                    .map(shipment => {
                      const eta = calculateETA(shipment);
                      return (
                        <div 
                          key={shipment.id}
                          className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-slate-700 rounded-lg">
                              <TransportIcon mode={shipment.transport_mode} className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                              <div className="font-mono text-white">{shipment.tracking_number}</div>
                              <div className="text-sm text-slate-400">
                                {shipment.origin.city} → {shipment.destination.city}
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
                              <div className="text-white font-medium">
                                {formatRemainingTime(eta.remainingHours)}
                              </div>
                            </div>
                            <div>
                              <Badge className={getDelaySeverityBadge(eta.delaySeverity).className}>
                                {getDelaySeverityBadge(eta.delaySeverity).label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Analytics;
