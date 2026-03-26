"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Package, 
  Clock,
  Ship,
  Plane,
  Truck,
  Train,
  RefreshCw,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { TrackingMap } from '@/components/TrackingMap';
import { StatusBadge, LiveBadge } from '@/components/TransportMarker';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import type { TrackingLog, TransportMode } from '@/types';

// Timeline component
const TrackingTimeline = ({ history }: { history: TrackingLog[] }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'departure':
        return <Ship className="w-4 h-4" />;
      case 'arrival':
        return <Package className="w-4 h-4" />;
      case 'customs-clearance':
        return <Clock className="w-4 h-4" />;
      case 'checkpoint':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getEventLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      'departure': 'Departed',
      'arrival': 'Arrived',
      'customs-clearance': 'Customs Cleared',
      'checkpoint': 'Checkpoint Passed',
      'location-update': 'Location Updated',
      'delay': 'Delay Reported',
    };
    return labels[eventType] || eventType;
  };

  return (
    <div className="space-y-0">
      {history.map((event, index) => (
        <div key={event.id} className="relative pl-8 pb-8 last:pb-0">
          {/* Timeline line */}
          {index < history.length - 1 && (
            <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
          )}
          
          {/* Timeline dot */}
          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
            index === 0 
              ? 'bg-orange-500 text-white' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}>
            {getEventIcon(event.event_type)}
          </div>

          {/* Event content */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-white">
                {getEventLabel(event.event_type)}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(event.timestamp).toLocaleDateString()} at {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {event.location_name || `${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Transport mode icon
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

// Connection status badge
const ConnectionStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    connected: 'bg-green-500/10 text-green-500 border-green-500/30',
    connecting: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    disconnected: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
    error: 'bg-red-500/10 text-red-500 border-red-500/30',
  };

  const icons: Record<string, React.ElementType> = {
    connected: Wifi,
    connecting: RefreshCw,
    disconnected: WifiOff,
    error: AlertCircle,
  };

  const Icon = icons[status] || WifiOff;

  return (
    <Badge variant="outline" className={`${styles[status] || styles.disconnected} text-xs`}>
      <Icon className={`w-3 h-3 mr-1 ${status === 'connecting' ? 'animate-spin' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Main Tracking Page
interface TrackingProps {
  initialTrackingId?: string;
}

const Tracking = ({ initialTrackingId }: TrackingProps) => {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingId || '');
  const [showDetails, setShowDetails] = useState(false);

  // Use the new live tracking hook
  const {
    shipment,
    currentPosition,
    heading,
    trackingHistory,
    isLoading,
    error,
    connectionStatus,
    lastUpdateTime,
    refresh,
  } = useLiveTracking(initialTrackingId || null);

  // Update tracking number when initialTrackingId changes
  useEffect(() => {
    setTrackingNumber(initialTrackingId || '');
  }, [initialTrackingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/tracking/${trackingNumber.trim()}`);
    }
  };

  const isLive = connectionStatus === 'connected';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20">
      {/* Header with search */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Track Your Shipment
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Real-time tracking and updates
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <Button type="submit" disabled={isLoading || !trackingNumber.trim()}>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Track'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      {shipment ? (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)]">
          {/* Map section */}
          <div className="flex-1 relative">
            <TrackingMap 
              shipment={shipment}
              trackingHistory={trackingHistory}
              isLive={isLive}
              targetPosition={currentPosition}
              heading={heading}
              className="h-full"
            />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Shipment header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Tracking Number</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refresh}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                  {shipment.tracking_number}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={shipment.status} />
                  {isLive && <LiveBadge />}
                </div>
              </div>

              {/* Connection status */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="text-sm text-slate-500">Connection</span>
                <ConnectionStatusBadge status={connectionStatus} />
              </div>

              {/* Last update time */}
              {lastUpdateTime && (
                <div className="text-xs text-slate-400 text-right">
                  Last update: {lastUpdateTime.toLocaleTimeString()}
                </div>
              )}

              <Separator />

              {/* Route info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Origin</div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {shipment.origin.city}, {shipment.origin.country}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-5">
                  <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700" />
                  <TransportIcon mode={shipment.transport_mode} className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500 capitalize">{shipment.transport_mode} Freight</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Destination</div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {shipment.destination.city}, {shipment.destination.country}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ETA and details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    Estimated Arrival
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {new Date(shipment.estimated_arrival).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <Clock className="w-4 h-4" />
                    Transit Time
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    14 Days
                  </div>
                </div>
              </div>

              {/* Current position */}
              {currentPosition && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="text-sm text-slate-500 mb-1">Current Position</div>
                  <div className="font-mono text-sm text-slate-900 dark:text-white">
                    {currentPosition[0].toFixed(6)}, {currentPosition[1].toFixed(6)}
                  </div>
                </div>
              )}

              {/* Shipment details toggle */}
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowDetails(!showDetails)}
              >
                Shipment Details
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showDetails && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weight</span>
                    <span className="text-slate-900 dark:text-white">{shipment.weight_kg?.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Volume</span>
                    <span className="text-slate-900 dark:text-white">{shipment.volume_cbm} CBM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Goods</span>
                    <span className="text-slate-900 dark:text-white">{shipment.goods_description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shipped</span>
                    <span className="text-slate-900 dark:text-white">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Tracking timeline */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Tracking History
                </h3>
                <TrackingTimeline history={trackingHistory} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state or error state */
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            {error ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Shipment Not Found
                </h2>
                <p className="text-slate-500 mb-6">
                  {error}
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Package className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Enter a Tracking Number
                </h2>
                <p className="text-slate-500 mb-6">
                  Enter your tracking number above to see real-time updates on your shipment&apos;s location and status.
                </p>
              </>
            )}
            <div className="text-sm text-slate-400">
              <p className="mb-2">Try these demo tracking numbers:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['NXS-DEMO-001', 'NXS-78439201', 'NXS-12345678'].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setTrackingNumber(num);
                      router.push(`/tracking/${num}`);
                    }}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 transition-colors"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;
