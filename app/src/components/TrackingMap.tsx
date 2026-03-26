"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { StatusBadge, LiveBadge } from './TransportMarker';
import type { Shipment, TrackingLog, TransportMode } from '@/types';

// OpenFreeMap styles
const OPENFREEMAP_STYLES = {
  positron: 'https://tiles.openfreemap.org/styles/positron',
  bright: 'https://tiles.openfreemap.org/styles/bright',
  matter: 'https://tiles.openfreemap.org/styles/matter',
};

interface TrackingMapProps {
  shipment: Shipment | null;
  trackingHistory: TrackingLog[];
  isLive?: boolean;
  className?: string;
  mapStyle?: keyof typeof OPENFREEMAP_STYLES;
}

export const TrackingMap = ({
  shipment,
  trackingHistory,
  isLive = false,
  className = '',
  mapStyle = 'positron',
}: TrackingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: OPENFREEMAP_STYLES[mapStyle],
      center: [0, 20],
      zoom: 2,
      pitch: 45,
      attributionControl: false,
    });

    newMap.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    newMap.addControl(new maplibregl.FullscreenControl(), 'bottom-right');

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
  }, [mapStyle]);

  // Update marker position and rotation
  const updateMarker = useCallback((lat: number, lng: number, heading: number, mode: TransportMode) => {
    if (!map.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create custom marker element
    const markerEl = document.createElement('div');
    markerEl.className = 'relative';
    markerEl.style.width = '48px';
    markerEl.style.height = '48px';

    // Create marker content
    const root = document.createElement('div');
    root.className = 'w-full h-full';
    markerEl.appendChild(root);

    // Create marker
    const marker = new maplibregl.Marker({
      element: markerEl,
      anchor: 'center',
      rotation: heading,
      rotationAlignment: 'map',
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    markerRef.current = marker;

    // Set marker content
    const markerContent = document.createElement('div');
    markerContent.innerHTML = `
      <div class="relative flex items-center justify-center text-[#FF6B00]" style="width: 48px; height: 48px; transform: rotate(${heading}deg);">
        <div class="absolute inset-0 rounded-full bg-current opacity-20 animate-ping"></div>
        <div class="relative z-10 w-3/4 h-3/4">
          ${getTransportIconSvg(mode)}
        </div>
        <div class="absolute w-2 h-2 bg-current rounded-full"></div>
      </div>
    `;
    root.appendChild(markerContent);

    // Fly to marker
    map.current.flyTo({
      center: [lng, lat],
      zoom: 5,
      duration: 1000,
    });
  }, []);

  // Update route line
  const updateRouteLine = useCallback((coordinates: [number, number][]) => {
    if (!map.current || !mapLoaded) return;

    const source = map.current.getSource('route') as maplibregl.GeoJSONSource;
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
  }, [mapLoaded]);

  // Update map when shipment data changes
  useEffect(() => {
    if (!shipment || !map.current || !mapLoaded) return;

    const lat = shipment.current_lat ?? shipment.current.lat;
    const lng = shipment.current_lng ?? shipment.current.lng;
    const heading = shipment.current_heading ?? shipment.current.heading;

    if (lat && lng) {
      updateMarker(lat, lng, heading, shipment.transport_mode);
    }

    // Build route from tracking history
    if (trackingHistory.length > 0) {
      const routeCoords: [number, number][] = trackingHistory.map(log => [log.lng, log.lat]);
      
      // Add current position if not in history
      if (lat && lng) {
        const lastPoint = routeCoords[routeCoords.length - 1];
        if (lastPoint && (lastPoint[0] !== lng || lastPoint[1] !== lat)) {
          routeCoords.push([lng, lat]);
        }
      }

      updateRouteLine(routeCoords);

      // Fit bounds to show entire route
      const bounds = new maplibregl.LngLatBounds();
      routeCoords.forEach(coord => bounds.extend(coord));
      
      map.current.fitBounds(bounds, {
        padding: 100,
        duration: 1000,
      });
    }
  }, [shipment, trackingHistory, mapLoaded, updateMarker, updateRouteLine]);

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
    <div className={`relative w-full h-full ${className}`}>
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Live badge */}
      {isLive && (
        <div className="absolute top-4 left-4 z-10">
          <LiveBadge />
        </div>
      )}

      {/* Shipment info overlay */}
      {shipment && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-10">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-lg p-4 text-white shadow-xl border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">Tracking Number</span>
              <StatusBadge status={shipment.status} />
            </div>
            <div className="font-mono text-lg font-semibold mb-4">
              {shipment.tracking_number}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">From</span>
                <span className="text-sm font-medium">{shipment.origin.city}, {shipment.origin.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">To</span>
                <span className="text-sm font-medium">{shipment.destination.city}, {shipment.destination.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Mode</span>
                <span className="text-sm font-medium capitalize">{shipment.transport_mode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">ETA</span>
                <span className="text-sm font-medium">
                  {new Date(shipment.estimated_arrival).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                  style={{ width: `${calculateProgress(shipment)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-400">
                <span>Origin</span>
                <span>Destination</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Calculate shipment progress
function calculateProgress(shipment: Shipment): number {
  const lat = shipment.current_lat ?? shipment.current.lat;
  const lng = shipment.current_lng ?? shipment.current.lng;
  
  if (!lat || !lng) return 0;
  
  // Simple distance-based progress calculation
  const origin = { lat: shipment.origin.lat, lng: shipment.origin.lng };
  const dest = { lat: shipment.destination.lat, lng: shipment.destination.lng };
  const current = { lat, lng };
  
  const totalDistance = calculateDistance(origin, dest);
  const traveledDistance = calculateDistance(origin, current);
  
  if (totalDistance === 0) return 0;
  return Math.min(Math.round((traveledDistance / totalDistance) * 100), 100);
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default TrackingMap;
