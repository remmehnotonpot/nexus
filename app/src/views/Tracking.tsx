"use client";

import { useState } from 'react';
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
  WifiOff,
  User,
  Mail,
  Phone,
  Home,
  Flag,
  CheckCircle,
  Circle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrackingMap } from '@/components/TrackingMap';
import { StatusBadge, LiveBadge } from '@/components/TransportMarker';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import type { TrackingUpdate, TransportMode, ShipmentStatusHistory } from '@/types';

// ============================================
// Status History Stepper Component
// ============================================

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending_dropoff: { 
    label: 'Pending Drop-off', 
    icon: <Package className="w-4 h-4" />, 
    color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' 
  },
  scheduled_for_pickup: { 
    label: 'Scheduled for Pickup', 
    icon: <Clock className="w-4 h-4" />, 
    color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' 
  },
  in_transit: { 
    label: 'In Transit', 
    icon: <Truck className="w-4 h-4" />, 
    color: 'text-sky-500 bg-sky-100 dark:bg-sky-900/30' 
  },
  customs: { 
    label: 'In Customs', 
    icon: <AlertCircle className="w-4 h-4" />, 
    color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' 
  },
  out_for_delivery: { 
    label: 'Out for Delivery', 
    icon: <MapPin className="w-4 h-4" />, 
    color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' 
  },
  delivered: { 
    label: 'Delivered', 
    icon: <CheckCircle className="w-4 h-4" />, 
    color: 'text-green-500 bg-green-100 dark:bg-green-900/30' 
  },
  exception: { 
    label: 'Exception', 
    icon: <AlertCircle className="w-4 h-4" />, 
    color: 'text-red-500 bg-red-100 dark:bg-red-900/30' 
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: <Circle className="w-4 h-4" />, 
    color: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30' 
  },
  returned: { 
    label: 'Returned', 
    icon: <Circle className="w-4 h-4" />, 
    color: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30' 
  },
};

/**
 * StatusHistoryStepper - Vertical stepper built from shipment_status_history
 */
const StatusHistoryStepper = ({ 
  statusHistory,
}: { 
  statusHistory: ShipmentStatusHistory[];
}) => {
  // Sort by created_at descending (newest first)
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  );

  if (sortedHistory.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No status updates available</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {sortedHistory.map((item, index) => {
        const config = STATUS_CONFIG[item.new_status] || STATUS_CONFIG.in_transit;
        const isLatest = index === 0;
        const isLast = index === sortedHistory.length - 1;
        const changedAt = item.created_at 
          ? new Date(item.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Unknown';

        return (
          <div key={item.id} className="relative pl-8 pb-8 last:pb-0">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
            )}
            
            {/* Timeline dot */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
              isLatest 
                ? `${config.color} ring-2 ring-offset-2 ring-slate-200 dark:ring-slate-800` 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>
              {isLatest ? config.icon : <CheckCircle className="w-3 h-3" />}
            </div>

            {/* Event content */}
            <div className={isLatest ? 'opacity-100' : 'opacity-70'}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {config.label}
                </span>
                {isLatest && (
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
              
              {item.notes && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {item.notes}
                </p>
              )}
              
              {item.location_name && (
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.location_name}
                </p>
              )}
              
              <p className="text-xs text-slate-400 mt-2">
                {changedAt}
                {item.changed_by_role && (
                  <span className="ml-2">• by {item.changed_by_role.replace('_', ' ')}</span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// Sender & Recipient Cards
// ============================================

/**
 * AddressCard - Displays sender or recipient information
 */
const AddressCard = ({ 
  type, 
  address, 
  contactName,
  contactPhone,
  contactEmail,
}: { 
  type: 'sender' | 'recipient';
  address: Record<string, string> | null;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}) => {
  const isSender = type === 'sender';
  const Icon = isSender ? Home : Flag;
  const title = isSender ? 'Sender' : 'Recipient';
  const accentColor = isSender ? 'border-l-green-500' : 'border-l-orange-500';

  const city = address?.city || 'Unknown';
  const country = address?.country || '';
  const street = address?.street || '';
  const state = address?.state || '';
  const postalCode = address?.postal_code || '';

  return (
    <Card className={`border-l-4 ${accentColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isSender ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Name */}
        {contactName && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-white">{contactName}</span>
          </div>
        )}
        
        {/* Address */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {street && <p>{street}</p>}
              <p>
                {city}{state && `, ${state}`}{postalCode && ` ${postalCode}`}
              </p>
              <p className="font-medium">{country}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {(contactPhone || contactEmail) && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {contactPhone && (
              <a 
                href={`tel:${contactPhone}`} 
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                {contactPhone}
              </a>
            )}
            {contactEmail && (
              <a 
                href={`mailto:${contactEmail}`} 
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                {contactEmail}
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// Support Banner
// ============================================

/**
 * SupportBanner - Prominent support contact block
 */
const SupportBanner = () => (
  <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-6 h-6 text-sky-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Need help with your shipment?</h3>
          <p className="text-slate-300 text-sm mb-3">
            Our support team is available to assist you with any questions or concerns.
          </p>
          <a 
            href="mailto:ceo@nimdeshop.com"
            className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact us at ceo@nimdeshop.com
          </a>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ============================================
// Legacy Tracking Timeline (for movement history)
// ============================================

const TrackingTimeline = ({ history }: { history: TrackingUpdate[] }) => {
  const getEventIcon = (source: string) => {
    switch (source) {
      case 'departure':
        return <Ship className="w-4 h-4" />;
      case 'arrival':
        return <Package className="w-4 h-4" />;
      case 'customs':
        return <Clock className="w-4 h-4" />;
      case 'checkpoint':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getEventLabel = (source: string) => {
    const labels: Record<string, string> = {
      'departure': 'Departed',
      'arrival': 'Arrived',
      'customs': 'Customs Cleared',
      'checkpoint': 'Checkpoint Passed',
      'manual': 'Location Updated',
      'gps': 'GPS Update',
      'device': 'Device Update',
    };
    return labels[source] || source;
  };

  const getLocationName = (event: TrackingUpdate): string => {
    if (event.metadata && typeof event.metadata === 'object' && 'location_name' in event.metadata) {
      return (event.metadata as { location_name?: string }).location_name || '';
    }
    return '';
  };

  return (
    <div className="space-y-0">
      {history.map((event, index) => (
        <div key={event.id} className="relative pl-8 pb-8 last:pb-0">
          {index < history.length - 1 && (
            <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
          )}
          
          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
            index === 0 
              ? 'bg-orange-500 text-white' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}>
            {getEventIcon(event.source || '')}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-white">
                {getEventLabel(event.source || '')}
              </span>
              <span className="text-xs text-slate-500">
                {event.created_at ? new Date(event.created_at).toLocaleDateString() : 'N/A'} at {event.created_at ? new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {getLocationName(event) || `${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}`}
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
    multimodal: Truck,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const trackingNumber = String(formData.get('tracking-number') || '').trim();
    if (trackingNumber) {
      router.push(`/tracking/${trackingNumber}`);
    }
  };

  const isLive = connectionStatus === 'connected';

  const toAddressRecord = (value: unknown): Record<string, string> | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, string>;
  };

  const readAddressField = (
    address: Record<string, string> | null,
    field: string
  ): string | undefined => {
    const value = address?.[field];
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  };

  // Extract origin and destination addresses
  const originAddress = toAddressRecord(shipment?.origin_address);
  const destAddress = toAddressRecord(shipment?.destination_address);
  const senderName = readAddressField(originAddress, 'contact_name');
  const senderPhone = readAddressField(originAddress, 'contact_phone');
  const senderEmail = readAddressField(originAddress, 'contact_email');
  const recipientName = readAddressField(destAddress, 'contact_name');
  const recipientPhone = readAddressField(destAddress, 'contact_phone');
  const recipientEmail = readAddressField(destAddress, 'contact_email');

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
                  key={initialTrackingId || 'tracking-input'}
                  name="tracking-number"
                  type="text"
                  placeholder="Enter tracking number"
                  defaultValue={initialTrackingId || ''}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <Button type="submit" disabled={isLoading}>
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
          <div className="w-full lg:w-[480px] bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
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

              {/* Sender & Recipient Cards */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Shipment Details
                </h3>
                <AddressCard
                  type="sender"
                  address={originAddress}
                  contactName={senderName}
                  contactPhone={senderPhone}
                  contactEmail={senderEmail}
                />
                <AddressCard
                  type="recipient"
                  address={destAddress}
                  contactName={recipientName}
                  contactPhone={recipientPhone}
                  contactEmail={recipientEmail}
                />
              </div>

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
                      {originAddress?.city || 'Unknown'}, {originAddress?.country || 'Unknown'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-5">
                  <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700" />
                  <TransportIcon mode={shipment.transport_mode as TransportMode} className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500 capitalize">{shipment.transport_mode} Freight</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Destination</div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {destAddress?.city || 'Unknown'}, {destAddress?.country || 'Unknown'}
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
                    {shipment.delivery_date ? new Date(shipment.delivery_date).toLocaleDateString() : 'N/A'}
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

              <Separator />

              {/* Status History Stepper */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  Status History
                </h3>
                <StatusHistoryStepper 
                  statusHistory={(shipment as unknown as { status_history?: ShipmentStatusHistory[] }).status_history || []}
                />
              </div>

              {/* Movement History Toggle */}
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowDetails(!showDetails)}
              >
                Movement History
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showDetails && (
                <div className="space-y-4">
                  <TrackingTimeline history={trackingHistory} />
                </div>
              )}

              <Separator />

              {/* Support Banner */}
              <SupportBanner />
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
                    onClick={() => router.push(`/tracking/${num}`)}
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
