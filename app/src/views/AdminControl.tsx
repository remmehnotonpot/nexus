"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Ship,
  Plane,
  Truck,
  Train,
  Eye,
  Sun,
  Moon,
  Layers,
  X,
  ExternalLink,
  Plus,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimulationController } from '@/components/SimulationController';
import type { TransportMode } from '@/types';

// MapLibre import
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// OpenFreeMap styles - no API key required!
const OPENFREEMAP_STYLES = {
  positron: 'https://tiles.openfreemap.org/styles/positron',
  bright: 'https://tiles.openfreemap.org/styles/bright',
  matter: 'https://tiles.openfreemap.org/styles/matter',
};

type MapStyle = keyof typeof OPENFREEMAP_STYLES;

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

// Active simulation type
interface ActiveSimulation {
  id: string;
  trackingNumber: string;
  pathName: string;
  transportMode: TransportMode;
  progress: number;
}

const AdminControl = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('positron');
  
  // Active simulations list
  const [activeSimulations, setActiveSimulations] = useState<ActiveSimulation[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: OPENFREEMAP_STYLES[mapStyle],
      center: [0, 20],
      zoom: 2,
      pitch: 45,
    });

    newMap.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    newMap.on('load', () => {
      setMapLoaded(true);
      
      // Add route line source
      newMap.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      });

      // Add route line layer
      newMap.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#FF6B00',
          'line-width': 3,
          'line-opacity': 0.8,
        },
      });

      // Add glow effect
      newMap.addLayer({
        id: 'route-line-glow',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#FF6B00',
          'line-width': 8,
          'line-opacity': 0.2,
          'line-blur': 4,
        },
      }, 'route-line');
    });

    map.current = newMap;

    return () => {
      newMap.remove();
    };
  }, []);

  // Update map style when changed
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(OPENFREEMAP_STYLES[mapStyle]);
  }, [mapStyle]);

  // Handle shipment created from SimulationController
  const handleShipmentCreated = useCallback((shipmentId: string, trackingNumber: string) => {
    addLog(`New shipment created: ${trackingNumber}`);
  }, []);

  // Add log entry
  const addLog = useCallback((message: string) => {
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 49),
    ]);
  }, []);

  // Remove simulation from active list
  const removeSimulation = useCallback((id: string) => {
    setActiveSimulations(prev => prev.filter(sim => sim.id !== id));
    addLog(`Removed simulation: ${id}`);
  }, [addLog]);

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Admin Only
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-white">Simulation Control</h1>
            <p className="text-slate-400">Control and monitor shipment simulation with real-time database sync</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/tracking/NXS-DEMO-001" target="_blank">
                <Eye className="w-4 h-4 mr-2" />
                View Live Tracking
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Map and Logs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
              <div className="relative h-[500px]">
                <div ref={mapContainer} className="absolute inset-0" />
                
                {/* Map style toggle */}
                <div className="absolute top-4 right-4 z-10">
                  <Select value={mapStyle} onValueChange={(value) => setMapStyle(value as MapStyle)}>
                    <SelectTrigger className="w-32 bg-slate-900/80 backdrop-blur border-slate-700 text-white">
                      <Layers className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="positron" className="text-white hover:bg-slate-700">
                        <span className="flex items-center gap-2">
                          <Sun className="w-4 h-4" /> Positron
                        </span>
                      </SelectItem>
                      <SelectItem value="bright" className="text-white hover:bg-slate-700">
                        <span className="flex items-center gap-2">
                          <Layers className="w-4 h-4" /> Bright
                        </span>
                      </SelectItem>
                      <SelectItem value="matter" className="text-white hover:bg-slate-700">
                        <span className="flex items-center gap-2">
                          <Moon className="w-4 h-4" /> Matter
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Position overlay */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-slate-900/80 backdrop-blur text-white border-slate-700">
                    <MapPin className="w-3 h-3 mr-1" />
                    MapLibre + OpenFreeMap
                  </Badge>
                </div>

                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-slate-400">Loading map...</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Simulation Logs */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 overflow-y-auto bg-slate-950 rounded-lg p-4 font-mono text-xs">
                  {logs.length === 0 ? (
                    <p className="text-slate-500">No logs yet. Start a simulation to see updates.</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-slate-400 mb-1">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Simulations */}
            {activeSimulations.length > 0 && (
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Active Simulations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeSimulations.map((sim) => (
                      <div 
                        key={sim.id}
                        className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <TransportIcon mode={sim.transportMode} className="w-5 h-5 text-orange-500" />
                          <div>
                            <div className="text-sm text-white font-medium">{sim.trackingNumber}</div>
                            <div className="text-xs text-slate-400">{sim.pathName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24">
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-orange-500 transition-all"
                                style={{ width: `${sim.progress}%` }}
                              />
                            </div>
                            <div className="text-xs text-slate-400 text-right mt-1">
                              {sim.progress.toFixed(0)}%
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <Link href={`/tracking/${sim.trackingNumber}`} target="_blank">
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSimulation(sim.id)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - Simulation Controller */}
          <div className="space-y-6">
            <SimulationController 
              variant="full"
              onShipmentCreated={handleShipmentCreated}
            />

            {/* Database Info */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Database Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-green-400 font-medium">Supabase Connected</div>
                    <div className="text-xs text-slate-500">Real-time updates enabled</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-500 space-y-2">
                  <p>Position updates are automatically synced to:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>shipments table (current_lat, current_lng, current_heading)</li>
                    <li>tracking_logs table (breadcrumb trail)</li>
                    <li>Realtime subscriptions active</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/shipments/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Shipment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/shipments">
                    <Ship className="w-4 h-4 mr-2" />
                    View All Shipments
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/analytics">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};



export default AdminControl;
