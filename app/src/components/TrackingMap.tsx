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
  /** Target position for smooth interpolation (from useLiveTracking) */
  targetPosition?: [number, number] | null;
  /** Current heading for marker rotation */
  heading?: number;
}

// Animation configuration
const ANIMATION_DURATION_MS = 1500; // 1.5 seconds for smooth movement
const BOUNDS_PADDING = 100; // Padding in pixels when fitting bounds
const EDGE_THRESHOLD_PERCENT = 0.2; // 20% of viewport triggers re-centering

export const TrackingMap = ({
  shipment,
  trackingHistory,
  isLive = false,
  className = '',
  mapStyle = 'positron',
  targetPosition,
  heading = 0,
}: TrackingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Animation refs
  const animationFrameRef = useRef<number | null>(null);
  const currentPositionRef = useRef<[number, number] | null>(null);
  const targetPositionRef = useRef<[number, number] | null>(null);
  const animationStartTimeRef = useRef<number | null>(null);
  const animationStartPositionRef = useRef<[number, number] | null>(null);

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
          'line-color': '#0EA5E9',
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
          'line-color': '#0EA5E9',
          'line-width': 8,
          'line-opacity': 0.2,
          'line-blur': 4,
        },
      }, 'route-line');
    });

    map.current = newMap;

    return () => {
      // Cancel any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      newMap.remove();
    };
  }, [mapStyle]);

  /**
   * Easing function for smooth movement (ease-in-out-cubic)
   */
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  /**
   * Linear interpolation between two coordinates
   */
  const interpolatePosition = (
    start: [number, number],
    end: [number, number],
    progress: number
  ): [number, number] => {
    return [
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress,
    ];
  };

  /**
   * Check if marker is near the edge of the viewport
   */
  const isNearEdge = useCallback((lngLat: maplibregl.LngLat): boolean => {
    if (!map.current) return false;

    const bounds = map.current.getBounds();
    const viewportWidth = bounds.getEast() - bounds.getWest();
    const viewportHeight = bounds.getNorth() - bounds.getSouth();

    const edgeThresholdX = viewportWidth * EDGE_THRESHOLD_PERCENT;
    const edgeThresholdY = viewportHeight * EDGE_THRESHOLD_PERCENT;

    const isNearWestEdge = lngLat.lng < bounds.getWest() + edgeThresholdX;
    const isNearEastEdge = lngLat.lng > bounds.getEast() - edgeThresholdX;
    const isNearSouthEdge = lngLat.lat < bounds.getSouth() + edgeThresholdY;
    const isNearNorthEdge = lngLat.lat > bounds.getNorth() - edgeThresholdY;

    return isNearWestEdge || isNearEastEdge || isNearSouthEdge || isNearNorthEdge;
  }, []);

  /**
   * Animation loop for smooth marker movement
   */
  const animateMarker = useCallback((timestamp: number) => {
    if (!animationStartTimeRef.current) {
      animationStartTimeRef.current = timestamp;
    }

    const elapsed = timestamp - animationStartTimeRef.current;
    const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
    const easedProgress = easeInOutCubic(progress);

    if (animationStartPositionRef.current && targetPositionRef.current && map.current) {
      // Interpolate position
      const newPosition = interpolatePosition(
        animationStartPositionRef.current,
        targetPositionRef.current,
        easedProgress
      );

      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLngLat([newPosition[1], newPosition[0]]);
      }

      // Update current position ref
      currentPositionRef.current = newPosition;

      // Check if marker is near edge and pan map if needed
      if (isNearEdge(new maplibregl.LngLat(newPosition[1], newPosition[0]))) {
        map.current.panTo([newPosition[1], newPosition[0]], {
          duration: 500,
          easing: easeInOutCubic,
        });
      }
    }

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animateMarker);
    } else {
      // Animation complete
      animationStartTimeRef.current = null;
      animationFrameRef.current = null;
    }
  }, [isNearEdge]);

  /**
   * Create or update marker with smooth interpolation
   */
  const updateMarker = useCallback((
    lat: number, 
    lng: number, 
    markerHeading: number, 
    mode: TransportMode,
    animate: boolean = true
  ) => {
    if (!map.current) return;

    // Cancel any ongoing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // If no marker exists, create one immediately (no animation on initial load)
    if (!markerRef.current) {
      const markerEl = createMarkerElement(markerHeading, mode);
      
      const marker = new maplibregl.Marker({
        element: markerEl,
        anchor: 'center',
        rotation: markerHeading,
        rotationAlignment: 'map',
      })
        .setLngLat([lng, lat])
        .addTo(map.current);

      markerRef.current = marker;
      currentPositionRef.current = [lat, lng];
      targetPositionRef.current = [lat, lng];

      // Initial flyTo
      map.current.flyTo({
        center: [lng, lat],
        zoom: 5,
        duration: 1000,
      });

      return;
    }

    // Update marker rotation
    markerRef.current.setRotation(markerHeading);

    // Update marker icon if needed (for transport mode changes)
    const markerEl = markerRef.current.getElement();
    const iconContainer = markerEl.querySelector('.transport-icon');
    if (iconContainer) {
      iconContainer.innerHTML = getTransportIconSvg(mode);
    }

    if (animate && currentPositionRef.current) {
      // Start smooth animation to new position
      animationStartPositionRef.current = [...currentPositionRef.current];
      targetPositionRef.current = [lat, lng];
      animationStartTimeRef.current = null;
      animationFrameRef.current = requestAnimationFrame(animateMarker);
    } else {
      // Immediate update (no animation)
      markerRef.current.setLngLat([lng, lat]);
      currentPositionRef.current = [lat, lng];
      targetPositionRef.current = [lat, lng];
    }
  }, [animateMarker]);

  // Store the plane SVG content
  const planeSvgRef = useRef<string>('');

  // Fetch plane SVG on mount
  useEffect(() => {
    fetch('/plane-marker.svg')
      .then(res => res.text())
      .then(svg => {
        planeSvgRef.current = svg;
      })
      .catch(() => {
        // Fallback to inline icon if fetch fails
        planeSvgRef.current = '';
      });
  }, []);

  /**
   * Create marker DOM element
   */
  const createMarkerElement = (rotation: number, mode: TransportMode): HTMLElement => {
    const markerEl = document.createElement('div');
    markerEl.className = 'relative';
    markerEl.style.width = '48px';
    markerEl.style.height = '48px';

    const iconSvg = getTransportIconSvg(mode, planeSvgRef.current);
    
    markerEl.innerHTML = `
      <div class="relative flex items-center justify-center" style="width: 48px; height: 48px;">
        <div class="absolute inset-0 rounded-full bg-sky-500 opacity-20 animate-ping"></div>
        <div class="relative z-10 w-3/4 h-3/4 transport-icon" style="color: #0EA5E9;">
          ${iconSvg}
        </div>
        <div class="absolute w-2 h-2 bg-sky-500 rounded-full"></div>
      </div>
    `;

    return markerEl;
  };

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

  // Get origin/destination from shipment
  const getOriginDestination = (shipment: Shipment) => {
    const originAddr = (shipment.origin_address || {}) as Record<string, string | number>;
    const destAddr = (shipment.destination_address || {}) as Record<string, string | number>;
    
    return {
      origin: {
        lat: shipment.origin_lat ?? (originAddr.lat as number) ?? 0,
        lng: shipment.origin_lng ?? (originAddr.lng as number) ?? 0,
        city: (originAddr.city as string) || 'Unknown',
        country: (originAddr.country as string) || '',
      },
      destination: {
        lat: shipment.destination_lat ?? (destAddr.lat as number) ?? 0,
        lng: shipment.destination_lng ?? (destAddr.lng as number) ?? 0,
        city: (destAddr.city as string) || 'Unknown',
        country: (destAddr.country as string) || '',
      },
      current: {
        lat: shipment.current_lat ?? shipment.origin_lat ?? 0,
        lng: shipment.current_lng ?? shipment.origin_lng ?? 0,
        heading: shipment.current_heading ?? 0,
      },
    };
  };

  // Initial setup when shipment data changes
  useEffect(() => {
    if (!shipment || !map.current || !mapLoaded) return;

    const { origin, destination, current } = getOriginDestination(shipment);

    if (current.lat && current.lng) {
      // Initial marker creation (no animation)
      updateMarker(current.lat, current.lng, current.heading, shipment.transport_mode as TransportMode, false);
    }

    // Build route from tracking history
    if (trackingHistory.length > 0) {
      const routeCoords: [number, number][] = trackingHistory.map(log => [log.lng, log.lat]);
      
      // Add current position if not in history
      if (current.lat && current.lng) {
        const lastPoint = routeCoords[routeCoords.length - 1];
        if (lastPoint && (lastPoint[0] !== current.lng || lastPoint[1] !== current.lat)) {
          routeCoords.push([current.lng, current.lat]);
        }
      }

      updateRouteLine(routeCoords);

      // Fit bounds to show entire route (only on initial load)
      const bounds = new maplibregl.LngLatBounds();
      routeCoords.forEach(coord => bounds.extend(coord));
      
      // Include origin and destination
      bounds.extend([origin.lng, origin.lat]);
      bounds.extend([destination.lng, destination.lat]);

      map.current.fitBounds(bounds, {
        padding: BOUNDS_PADDING,
        duration: 1000,
      });
    }
  }, [shipment, trackingHistory, mapLoaded, updateMarker, updateRouteLine]);

  // Handle live position updates with smooth interpolation
  useEffect(() => {
    if (!shipment || !map.current || !mapLoaded || !targetPosition) return;

    const [targetLat, targetLng] = targetPosition;
    const currentLat = currentPositionRef.current?.[0] ?? shipment.current_lat ?? 0;
    const currentLng = currentPositionRef.current?.[1] ?? shipment.current_lng ?? 0;

    // Only update if position has actually changed
    if (targetLat !== currentLat || targetLng !== currentLng) {
      updateMarker(targetLat, targetLng, heading, shipment.transport_mode as TransportMode, true);
    }
  }, [targetPosition, heading, shipment, mapLoaded, updateMarker]);

  // Helper function to get transport icon SVG
  const getTransportIconSvg = (mode: TransportMode, planeSvg: string = ''): string => {
    // Use plane SVG for air mode if available
    if (mode === 'air' && planeSvg) {
      return planeSvg;
    }
    
    const icons: Record<TransportMode, string> = {
      air: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
      ocean: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 16.5c.65 0 1.25-.25 1.7-.7 1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7V14c-.65 0-1.25-.25-1.7-.7-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7v2.5zM2 11c.65 0 1.25-.25 1.7-.7 1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7s1.25-.25 1.7-.7c1.35-1.35 3.55-1.35 4.9 0 .45.45 1.05.7 1.7.7V8.5c-.65 0-1.25-.25-1.7-.7-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7s-1.25-.25-1.7-.7c-1.35-1.35-3.55-1.35-4.9 0-.45.45-1.05.7-1.7.7V11z"/></svg>',
      road: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM6 18.5c.83 0 1.5-.67 1.5-1.5S6.83 15.5 6 15.5 4.5 16.17 4.5 17s.67 1.5 1.5 1.5zM17 11h-1V8h-2v3H8V8H6v3H5c-1.66 0-3 1.34-3 3v7h2.5v-2h11v2H20v-7c0-1.66-1.34-3-3-3z"/></svg>',
      rail: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
      multimodal: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 2 4 2.5 4 6v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    };
    return icons[mode];
  };

  // Helper to get origin/destination for display
  const getShipmentInfo = (shipment: Shipment) => {
    const originAddr = (shipment.origin_address || {}) as Record<string, string>;
    const destAddr = (shipment.destination_address || {}) as Record<string, string>;
    
    return {
      origin: {
        city: originAddr.city || 'Unknown',
        country: originAddr.country || '',
        lat: shipment.origin_lat ?? 0,
        lng: shipment.origin_lng ?? 0,
      },
      destination: {
        city: destAddr.city || 'Unknown',
        country: destAddr.country || '',
        lat: shipment.destination_lat ?? 0,
        lng: shipment.destination_lng ?? 0,
      },
      current: {
        lat: shipment.current_lat ?? 0,
        lng: shipment.current_lng ?? 0,
        heading: shipment.current_heading ?? 0,
      },
      eta: shipment.delivery_date,
    };
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
            
            {(() => {
              const info = getShipmentInfo(shipment);
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">From</span>
                    <span className="text-sm font-medium">{info.origin.city}, {info.origin.country}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">To</span>
                    <span className="text-sm font-medium">{info.destination.city}, {info.destination.country}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Mode</span>
                    <span className="text-sm font-medium capitalize">{shipment.transport_mode}</span>
                  </div>
                  {info.eta && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">ETA</span>
                      <span className="text-sm font-medium">
                        {new Date(info.eta).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500"
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
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Calculate shipment progress
function calculateProgress(shipment: Shipment): number {
  const lat = shipment.current_lat ?? 0;
  const lng = shipment.current_lng ?? 0;
  
  if (!lat || !lng) return 0;
  
  // Simple distance-based progress calculation
  const origin = { lat: shipment.origin_lat ?? 0, lng: shipment.origin_lng ?? 0 };
  const dest = { lat: shipment.destination_lat ?? 0, lng: shipment.destination_lng ?? 0 };
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
