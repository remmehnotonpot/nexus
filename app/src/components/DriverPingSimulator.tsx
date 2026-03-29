"use client";

import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  MapPin, 
  Send, 
  Crosshair,
  AlertCircle,
  CheckCircle,
  Navigation,
  Truck,
  Building2,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateShipmentLocation, recordTrackingUpdate } from '@/lib/api/shipments';
import { locationSchema } from '@/lib/schemas/shipment';
import { LocationAutocomplete, ExtractedLocation } from '@/components/LocationAutocomplete';
import type { Shipment } from '@/types';

interface DriverPingSimulatorProps {
  /** The shipment to update */
  shipment: Shipment | null;
  /** Callback when location is updated */
  onLocationUpdate?: (lat: number, lng: number) => void;
  /** Optional className */
  className?: string;
  /** User ID for tracking who made the update */
  userId?: string;
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
 * - Using location autocomplete (hybrid internal + global search)
 * - Inputting exact coordinates
 * - Using current geolocation
 * 
 * This simulates a driver mobile app sending GPS pings and triggers
 * the Supabase Realtime update that clients will receive.
 */
export const DriverPingSimulator = forwardRef<DriverPingSimulatorRef, DriverPingSimulatorProps>(
  function DriverPingSimulator({ shipment, onLocationUpdate, className = '', userId }, ref) {
    // Tab state
    const [activeTab, setActiveTab] = useState<'autocomplete' | 'manual'>('autocomplete');
    
    // Location state
    const [selectedLocation, setSelectedLocation] = useState<ExtractedLocation | null>(null);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [heading, setHeading] = useState('0');
    const [notes, setNotes] = useState('');
    
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
        setActiveTab('manual');
        setSelectedLocation(null);
      },
    }));

    // Handle location selection from autocomplete
    const handleLocationSelect = useCallback((location: ExtractedLocation | null) => {
      setSelectedLocation(location);
      if (location) {
        setLatitude(location.lat.toFixed(6));
        setLongitude(location.lng.toFixed(6));
      }
    }, []);

    /**
     * Get origin/destination coordinates from shipment
     */
    const getShipmentCoordinates = (shipment: Shipment) => {
      return {
        origin: {
          lat: shipment.origin_lat ?? 0,
          lng: shipment.origin_lng ?? 0,
        },
        destination: {
          lat: shipment.destination_lat ?? 0,
          lng: shipment.destination_lng ?? 0,
        },
      };
    };

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

        // Record tracking update for audit trail
        await recordTrackingUpdate(
          shipment.id,
          lat,
          lng,
          'manual_update',
          { heading: headingValue },
          userId
        );

        setUpdateStatus('success');
        setStatusMessage(`Location updated to ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setLastPingTime(new Date());

        // Clear form
        setSelectedLocation(null);
        setNotes('');

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
    }, [shipment, latitude, longitude, heading, userId, onLocationUpdate, clearStatusAfterDelay]);

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
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));
          setHeading(position.coords.heading?.toString() || '0');
          setIsGettingLocation(false);
          setActiveTab('manual');
          
          // Also update selected location
          setSelectedLocation({
            name: 'Current Location',
            lat,
            lng,
            source: 'photon_api',
          });
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

      const coords = getShipmentCoordinates(shipment);

      switch (preset) {
        case 'origin': {
          setLatitude(coords.origin.lat.toFixed(6));
          setLongitude(coords.origin.lng.toFixed(6));
          break;
        }
        case 'destination': {
          setLatitude(coords.destination.lat.toFixed(6));
          setLongitude(coords.destination.lng.toFixed(6));
          break;
        }
        case 'midpoint': {
          // Calculate midpoint between origin and destination
          const midLat = (coords.origin.lat + coords.destination.lat) / 2;
          const midLng = (coords.origin.lng + coords.destination.lng) / 2;
          setLatitude(midLat.toFixed(6));
          setLongitude(midLng.toFixed(6));
          break;
        }
      }
      setActiveTab('manual');
      setSelectedLocation(null);
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

          {/* Main Form with Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'autocomplete' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="autocomplete" className="data-[state=active]:bg-slate-700">
                <Building2 className="w-4 h-4 mr-2" />
                Search
              </TabsTrigger>
              <TabsTrigger value="manual" className="data-[state=active]:bg-slate-700">
                <Globe className="w-4 h-4 mr-2" />
                Manual
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <TabsContent value="autocomplete" className="mt-0">
                <LocationAutocomplete
                  value={selectedLocation}
                  onChange={handleLocationSelect}
                  placeholder={shipment ? "Search for a location..." : "Select a shipment first"}
                  disabled={!shipment}
                  label="Location"
                  className="[&_button]:bg-slate-800 [&_button]:border-slate-700 [&_button]:text-white"
                />
              </TabsContent>

              <TabsContent value="manual" className="mt-0 space-y-4">
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
              </TabsContent>

              {/* Heading and Notes - visible in both tabs */}
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

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-300">Notes (optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Add a note about this update..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
          </Tabs>

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
