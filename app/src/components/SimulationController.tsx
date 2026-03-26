"use client";

import { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Plus,
  Copy,
  CopyCheck,
  MapPin,
  Navigation,
  Ship,
  Plane,
  Truck,
  Train,
  Database,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLiveShipment } from '@/hooks/useLiveShipment';
import { SIMULATION_PATHS } from '@/hooks/useSimulation';
import { cn } from '@/lib/utils';
import type { SimulationPath, TransportMode } from '@/types';

interface SimulationControllerProps {
  variant?: 'full' | 'compact';
  onShipmentCreated?: (shipmentId: string, trackingNumber: string) => void;
  className?: string;
}

const speedOptions = [
  { value: 0.5, label: '0.5x', description: 'Half speed' },
  { value: 1, label: '1x', description: 'Normal speed' },
  { value: 2, label: '2x', description: 'Double speed' },
  { value: 5, label: '5x', description: 'Fast' },
  { value: 10, label: '10x', description: 'Very fast' },
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

const SyncStatusBadge = ({ 
  status, 
  lastSyncTime 
}: { 
  status: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: Date | null;
}) => {
  const config = {
    idle: { 
      icon: Database, 
      color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      label: 'Idle'
    },
    syncing: { 
      icon: Loader2, 
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      label: 'Syncing...'
    },
    synced: { 
      icon: CheckCircle2, 
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      label: 'Synced'
    },
    error: { 
      icon: AlertCircle, 
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      label: 'Error'
    },
  };

  const { icon: Icon, color, label } = config[status];

  return (
    <div className="flex items-center gap-2">
      <Badge className={cn("border", color)}>
        <Icon className={cn("w-3 h-3 mr-1", status === 'syncing' && 'animate-spin')} />
        {label}
      </Badge>
      {lastSyncTime && status === 'synced' && (
        <span className="text-xs text-slate-500">
          {lastSyncTime.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export function SimulationController({ 
  variant = 'full',
  onShipmentCreated,
  className 
}: SimulationControllerProps) {
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  
  const {
    state,
    selectedPath,
    shipmentId,
    trackingNumber,
    selectPath,
    createShipment,
    start,
    pause,
    resume,
    stop,
    reset,
    setSpeedMultiplier,
    simulationLogs,
  } = useLiveShipment();

  const handlePathSelect = async (pathId: string) => {
    setSelectedPathId(pathId);
    const path = SIMULATION_PATHS.find(p => p.id === pathId);
    
    if (path) {
      selectPath(path);
    }
  };

  const handleCreateAndStart = async () => {
    if (!selectedPath) return;
    
    setIsCreating(true);
    try {
      const id = await createShipment(selectedPath);
      if (trackingNumber && onShipmentCreated) {
        onShipmentCreated(id, trackingNumber);
      }
      start();
    } catch (error) {
      console.error('Failed to create shipment:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyTrackingNumber = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const isCompact = variant === 'compact';

  return (
    <Card className={cn("bg-slate-900 border-slate-800", className)}>
      <CardHeader className={cn(isCompact && "pb-2")}>
        <CardTitle className={cn("text-white flex items-center gap-2", isCompact && "text-base")}>
          <Zap className="w-5 h-5 text-orange-500" />
          Simulation Control
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4", isCompact && "space-y-2")}>
        {/* Path Selection */}
        {!state.isRunning && !shipmentId && (
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Select Route</label>
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
                      <span className="truncate">{path.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPath && (
              <div className="p-3 bg-slate-800 rounded-lg space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="truncate">{selectedPath.origin_city}</span>
                  <Navigation className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{selectedPath.destination_city}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Est. {selectedPath.estimated_duration_hours} hours</span>
                  <span className="mx-1">•</span>
                  {selectedPath.path_data.length} waypoints
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateAndStart}
              disabled={!selectedPath || isCreating}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create & Start
                </>
              )}
            </Button>
          </div>
        )}

        {/* Active Simulation Info */}
        {shipmentId && (
          <div className="space-y-3">
            {/* Shipment ID */}
            <div className="p-3 bg-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Tracking Number</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-white truncate flex-1">
                  {trackingNumber}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyTrackingNumber}
                  className="h-6 px-2 text-slate-400 hover:text-white"
                >
                  {copiedId ? (
                    <CopyCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-white font-medium">{state.progress.toFixed(1)}%</span>
              </div>
              <Progress value={state.progress} className="h-2" />
            </div>

            {/* Position Info */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-800 rounded">
                <div className="text-xs text-slate-500">Latitude</div>
                <div className="font-mono text-sm text-white">
                  {state.currentPosition?.[0].toFixed(4) || '—'}
                </div>
              </div>
              <div className="p-2 bg-slate-800 rounded">
                <div className="text-xs text-slate-500">Longitude</div>
                <div className="font-mono text-sm text-white">
                  {state.currentPosition?.[1].toFixed(4) || '—'}
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="p-2 bg-slate-800 rounded">
              <div className="text-xs text-slate-500">Heading</div>
              <div className="font-mono text-sm text-white">
                {state.heading.toFixed(1)}°
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Speed Multiplier
              </label>
              <Select 
                value={state.speedMultiplier.toString()} 
                onValueChange={(v) => setSpeedMultiplier(parseFloat(v))}
                disabled={!state.isRunning}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {speedOptions.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value.toString()}
                      className="text-white hover:bg-slate-700"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{opt.label}</span>
                        <span className="text-xs text-slate-400 ml-4">{opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Playback Controls */}
            <div className="flex justify-center gap-2">
              {!state.isRunning ? (
                <Button
                  onClick={start}
                  disabled={!shipmentId}
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
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                state.isRunning && !state.isPaused ? 'bg-green-500 animate-pulse' :
                state.isPaused ? 'bg-yellow-500' : 'bg-slate-500'
              )} />
              <span className="text-sm text-slate-400">
                {state.isRunning && !state.isPaused ? 'Running' :
                 state.isPaused ? 'Paused' : 'Stopped'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-400">
                {state.totalUpdates} updates
              </span>
            </div>

            {/* Database Sync Status */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Database Sync
                </span>
                <SyncStatusBadge status={state.dbSyncStatus} lastSyncTime={state.lastSyncTime} />
              </div>
            </div>

            {/* Simulation Logs (only in full mode) */}
            {!isCompact && simulationLogs.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Recent Logs</span>
                </div>
                <div className="h-32 overflow-y-auto bg-slate-950 rounded-lg p-3 font-mono text-xs space-y-1">
                  {simulationLogs.slice(0, 20).map((log, index) => (
                    <div key={index} className="text-slate-400">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SimulationController;
