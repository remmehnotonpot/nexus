"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Square,
  MapPin,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Ship,
  Plane,
  Truck,
  Train,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSimulation, SIMULATION_PATHS } from '@/hooks/useSimulation';
import type { TransportMode } from '@/types';

// Mapbox import
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is required to render AdminControl map features');
}

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

const AdminControl = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  // Initialize simulation
  const handlePositionUpdate = useCallback((position: [number, number], heading: number) => {
    if (map.current && markerRef.current) {
      markerRef.current.setLngLat([position[1], position[0]]);
      markerRef.current.setRotation(heading);
      
      // Pan map to follow marker
      map.current.panTo([position[1], position[0]], { duration: 500 });
    }
    
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Position updated: ${position[0].toFixed(4)}, ${position[1].toFixed(4)} (heading: ${heading.toFixed(0)}°)`,
      ...prev.slice(0, 49),
    ]);
  }, []);

  const { 
    state, 
    selectedPath, 
    selectPath, 
    start, 
    pause, 
    resume, 
    stop, 
    reset 
  } = useSimulation(handlePositionUpdate);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [0, 20],
      zoom: 2,
      pitch: 45,
    });

    newMap.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

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

  // Update map when path is selected
  useEffect(() => {
    if (!selectedPath || !map.current || !mapLoaded) return;

    const coordinates = selectedPath.path_data.map(([lat, lng]) => [lng, lat] as [number, number]);
    
    // Update route line
    const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      });
    }

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach(coord => bounds.extend(coord));
    map.current.fitBounds(bounds, { padding: 100 });

    // Create/update marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    const markerEl = document.createElement('div');
    markerEl.className = 'relative w-12 h-12';
    markerEl.innerHTML = `
      <div class="absolute inset-0 flex items-center justify-center text-orange-500">
        <div class="absolute inset-0 rounded-full bg-current opacity-20 animate-ping"></div>
        <div class="relative w-8 h-8">
          ${getTransportIconSvg(selectedPath.transport_mode)}
        </div>
      </div>
    `;

    markerRef.current = new mapboxgl.Marker({
      element: markerEl,
      anchor: 'center',
    })
      .setLngLat(coordinates[0])
      .addTo(map.current);

    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Path loaded: ${selectedPath.name}`,
      ...prev,
    ]);
  }, [selectedPath, mapLoaded]);

  // Handle path selection
  const handlePathSelect = (pathId: string) => {
    setSelectedPathId(pathId);
    const path = SIMULATION_PATHS.find(p => p.id === pathId);
    if (path) {
      selectPath(path);
    }
  };

  // Helper function to get transport icon SVG
  const getTransportIconSvg = (mode: TransportMode): string => {
    const icons: Record<TransportMode, string> = {
      air: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
      ocean: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 16.5c.65 0 1.25-.25 1.7-.7 1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7V14c-.65 0-1.25-.25-1.7-.7-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7v2.5zM2 11c.65 0 1.25-.25 1.7-.7 1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7V8.5c-.65 0-1.25-.25-1.7-.7-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7V11z"/></svg>',
      road: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM6 18.5c.83 0 1.5-.67 1.5-1.5S6.83 15.5 6 15.5 4.5 16.17 4.5 17s.67 1.5 1.5 1.5zM17 11h-1V8h-2v3H8V8H6v3H5c-1.66 0-3 1.34-3 3v7h2.5v-2h11v2H20v-7c0-1.66-1.34-3-3-3z"/></svg>',
      rail: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    };
    return icons[mode];
  };

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
            <p className="text-slate-400">Control and monitor shipment simulation</p>
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
          {/* Left column - Map */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
              <div className="relative h-[500px]">
                <div ref={mapContainer} className="absolute inset-0" />
                
                {/* Overlay controls */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-slate-900/80 backdrop-blur text-white border-slate-700">
                    <MapPin className="w-3 h-3 mr-1" />
                    {state.currentPosition 
                      ? `${state.currentPosition[0].toFixed(4)}, ${state.currentPosition[1].toFixed(4)}`
                      : 'No position'
                    }
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
            <Card className="mt-6 bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Simulation Logs</CardTitle>
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
          </div>

          {/* Right column - Controls */}
          <div className="space-y-6">
            {/* Path Selection */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Select Route</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedPathId} onValueChange={handlePathSelect}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Choose a simulation path" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {SIMULATION_PATHS.map((path) => (
                      <SelectItem 
                        key={path.id} 
                        value={path.id}
                        className="text-white hover:bg-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <TransportIcon mode={path.transport_mode} className="w-4 h-4" />
                          {path.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPath && (
                  <div className="p-4 bg-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">{selectedPath.origin_city}</span>
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-sm">{selectedPath.destination_city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Navigation className="w-4 h-4" />
                      {selectedPath.path_data.length} waypoints
                    </div>
                    <div className="text-xs text-slate-500">
                      Est. duration: {selectedPath.estimated_duration_hours} hours
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Playback Controls */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Playback Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{state.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={state.progress} className="h-2" />
                </div>

                {/* Control buttons */}
                <div className="flex justify-center gap-2">
                  {!state.isRunning ? (
                    <Button 
                      onClick={start}
                      disabled={!selectedPath}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  ) : state.isPaused ? (
                    <Button 
                      onClick={resume}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  ) : (
                    <Button 
                      onClick={pause}
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-800"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}

                  <Button 
                    onClick={stop}
                    disabled={!state.isRunning}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-800"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>

                  <Button 
                    onClick={reset}
                    disabled={!selectedPath}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-800"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    state.isRunning && !state.isPaused ? 'bg-green-500 animate-pulse' :
                    state.isPaused ? 'bg-yellow-500' : 'bg-slate-500'
                  }`} />
                  <span className="text-sm text-slate-400">
                    {state.isRunning && !state.isPaused ? 'Running' :
                     state.isPaused ? 'Paused' : 'Stopped'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Current Position */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Current Position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Latitude</div>
                    <div className="font-mono text-white">
                      {state.currentPosition?.[0].toFixed(6) || '—'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Longitude</div>
                    <div className="font-mono text-white">
                      {state.currentPosition?.[1].toFixed(6) || '—'}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Heading</div>
                  <div className="font-mono text-white">
                    {state.heading.toFixed(1)}°
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Sync Status */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Database Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-green-400 font-medium">Connected</div>
                    <div className="text-xs text-slate-500">Real-time updates enabled</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  <p>Position updates are automatically synced to:</p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>shipments table (current_lat, current_lng, current_heading)</li>
                    <li>tracking_logs table (breadcrumb trail)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminControl;
