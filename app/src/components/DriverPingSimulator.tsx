"use client";

import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  MapPin, 
  Send, 
  Crosshair,
  AlertCircle,
  CheckCircle,
  Navigation,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updateShipmentLocation } from '@/lib/api/shipments';
import { locationSchema } from '@/lib/schemas/shipment';
import type { Shipment } from '@/types';

interface DriverPingSimulatorProps {
  /** The shipment to update */
  shipment: Shipment | null;
  /** Callback when location is updated */
  onLocationUpdate?: (lat: number, lng: number) => void;
  /** Optional className */
  className?: string;
}

export interface DriverPingSimulatorRef {
  /** Set coordinates from map click */
  setCoordinatesFromMap: (lat: number, lng: number) => void;
}

/**
 * DriverPingSimulator - Manual GPS Override for Admin Control
 * 
 * Allows administrators to manually update shipment coordinates by:
 * - Clicking on a map to set position
 * - Inputting exact coordinates
 * - Using current geolocation
 * 
 * This simulates a driver mobile app sending GPS pings and triggers
 * the Supabase Realtime update that clients will receive.
 */
export const DriverPingSimulator = forwardRef<DriverPingSimulatorRef, DriverPingSimulatorProps>(
  function DriverPingSimulator({ shipment, onLocationUpdate, className = '' }, ref) {
    // Form state
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [heading, setHeading] = useState('0');
    
    // Status state
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
    
    // Geolocation state
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Clear status after timeout
    const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearStatusAfterDelay = useCallback(() => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      statusTimeoutRef.current = setTimeout(() => {
        setUpdateStatus('idle');
        setStatusMessage('');
      }, 5000);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (statusTimeoutRef.current) {
          clearTimeout(statusTimeoutRef.current);
        }
      };
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      setCoordinatesFromMap: (lat: number, lng: number) => {
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
      },
    }));

    /**
     * Validate and submit location update
     */
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
      e.preventDefault();

      if (!shipment) {
        setUpdateStatus('error');
        setStatusMessage('No shipment selected');
        clearStatusAfterDelay();
        return;
      }

      // Parse coordinates
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const headingValue = parseFloat(heading) || 0;

      // Validate with Zod schema
      const validation = locationSchema.safeParse({ lat, lng });
      
      if (!validation.success) {
        setUpdateStatus('error');
        setStatusMessage('Invalid coordinates: ' + validation.error.issues[0].message);
        clearStatusAfterDelay();
        return;
      }

      setIsUpdating(true);
      setUpdateStatus('idle');

      try {
        // Update shipment location in Supabase
        await updateShipmentLocation(shipment.id, lat, lng, headingValue);

        setUpdateStatus('success');
        setStatusMessage(`Location updated to ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setLastPingTime(new Date());

        // Notify parent component
        onLocationUpdate?.(lat, lng);
      } catch (error) {
        console.error('Failed to update location:', error);
        setUpdateStatus('error');
        setStatusMessage(error instanceof Error ? error.message : 'Failed to update location');
      } finally {
        setIsUpdating(false);
        clearStatusAfterDelay();
      }
    }, [shipment, latitude, longitude, heading, onLocationUpdate, clearStatusAfterDelay]);

    /**
     * Use browser geolocation to fill coordinates
     */
    const handleUseCurrentLocation = useCallback(() => {
      if (!navigator.geolocation) {
        setUpdateStatus('error');
        setStatusMessage('Geolocation is not supported by your browser');
        clearStatusAfterDelay();
        return;
      }

      setIsGettingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setHeading(position.coords.heading?.toString() || '0');
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUpdateStatus('error');
          setStatusMessage(`Failed to get location: ${error.message}`);
          setIsGettingLocation(false);
          clearStatusAfterDelay();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }, [clearStatusAfterDelay]);

    /**
     * Quick preset positions for demo
     */
    const applyPreset = useCallback((preset: 'origin' | 'destination' | 'midpoint') => {
      if (!shipment) return;

      switch (preset) {
        case 'origin':
          setLatitude(shipment.origin.lat.toFixed(6));
          setLongitude(shipment.origin.lng.toFixed(6));
          break;
        case 'destination':
          setLatitude(shipment.destination.lat.toFixed(6));
          setLongitude(shipment.destination.lng.toFixed(6));
          break;
        case 'midpoint':
          // Calculate midpoint between origin and destination
          const midLat = (shipment.origin.lat + shipment.destination.lat) / 2;
          const midLng = (shipment.origin.lng + shipment.destination.lng) / 2;
          setLatitude(midLat.toFixed(6));
          setLongitude(midLng.toFixed(6));
          break;
      }
    }, [shipment]);

    const isFormValid = latitude && longitude && 
      !isNaN(parseFloat(latitude)) && 
      !isNaN(parseFloat(longitude));

    return (
      <Card className={`bg-slate-900 border-slate-800 ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                Driver Ping Simulator
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manually override shipment GPS position
              </CardDescription>
            </div>
            {shipment && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                {shipment.tracking_number}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status Alert */}
          {updateStatus !== 'idle' && (
            <Alert className={updateStatus === 'success' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}>
              {updateStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className={updateStatus === 'success' ? 'text-green-400' : 'text-red-400'}>
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Preset buttons */}
          {shipment && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('origin')}
                className="flex-1 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Origin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('midpoint')}
                className="flex-1 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                <Navigation className="w-3 h-3 mr-1" />
                Midpoint
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset('destination')}
                className="flex-1 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Destination
              </Button>
            </div>
          )}

          {/* Coordinate form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-slate-300">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  placeholder="e.g., 31.2304"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  disabled={!shipment}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-slate-300">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  placeholder="e.g., 121.4737"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  disabled={!shipment}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heading" className="text-slate-300">Heading (degrees)</Label>
              <Input
                id="heading"
                type="number"
                step="1"
                min="0"
                max="360"
                placeholder="0-360"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                disabled={!shipment}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseCurrentLocation}
                disabled={isGettingLocation || !shipment}
                className="flex-1 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                {isGettingLocation ? (
                  <Navigation className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Crosshair className="w-4 h-4 mr-2" />
                )}
                My Location
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isUpdating || !shipment}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isUpdating ? (
                  <Navigation className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Ping
              </Button>
            </div>
          </form>

          {/* Last ping info */}
          {lastPingTime && (
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Last ping sent</span>
                <span>{lastPingTime.toLocaleTimeString()}</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!shipment && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
              <p className="text-sm text-slate-400 text-center">
                Select a shipment in the simulation controller to enable driver ping
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

export default DriverPingSimulator;
