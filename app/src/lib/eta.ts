/**
 * ETA Tracking & Delay Detection
 * Real-time ETA calculations and delay severity detection
 */

import type { Shipment } from '@/types';

// Delay severity thresholds (in hours)
const DELAY_THRESHOLDS = {
  minor: 2,      // 2+ hours delay
  moderate: 12,  // 12+ hours delay
  severe: 24,    // 24+ hours delay
};

export type DelaySeverity = 'none' | 'minor' | 'moderate' | 'severe';

export interface ETAResult {
  estimatedArrival: Date;
  remainingHours: number;
  remainingDistance: number; // in km
  progressPercentage: number;
  isDelayed: boolean;
  delaySeverity: DelaySeverity;
  delayHours: number;
  status: 'on-time' | 'at-risk' | 'delayed';
}

export interface DelayAlert {
  severity: DelaySeverity;
  message: string;
  hoursDelayed: number;
  recommendedAction: string;
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) *
      Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get origin/destination/current coordinates from shipment
 */
function getShipmentCoordinates(shipment: Shipment) {
  const originAddr = (shipment.origin_address || {}) as Record<string, string | number>;
  const destAddr = (shipment.destination_address || {}) as Record<string, string | number>;
  
  return {
    origin: {
      lat: shipment.origin_lat ?? (originAddr.lat as number) ?? 0,
      lng: shipment.origin_lng ?? (originAddr.lng as number) ?? 0,
    },
    destination: {
      lat: shipment.destination_lat ?? (destAddr.lat as number) ?? 0,
      lng: shipment.destination_lng ?? (destAddr.lng as number) ?? 0,
    },
    current: {
      lat: shipment.current_lat ?? shipment.origin_lat ?? 0,
      lng: shipment.current_lng ?? shipment.origin_lng ?? 0,
    },
  };
}

/**
 * Calculate ETA and delay information for a shipment
 */
export function calculateETA(
  shipment: Shipment,
  currentSpeedKmh?: number
): ETAResult {
  const { origin, destination, current } = getShipmentCoordinates(shipment);

  // Calculate distances
  const totalDistance = calculateDistance(origin, destination);
  const traveledDistance = calculateDistance(origin, current);
  const remainingDistance = calculateDistance(current, destination);

  // Calculate progress
  const progressPercentage = totalDistance > 0 
    ? Math.min(Math.round((traveledDistance / totalDistance) * 100), 100)
    : 0;

  // Estimate remaining time based on transport mode average speed
  const modeSpeeds: Record<string, number> = {
    air: 900,
    ocean: 40,
    road: 80,
    rail: 60,
    multimodal: 50,
  };

  const speed = currentSpeedKmh || modeSpeeds[shipment.transport_mode] || 60;
  const remainingHours = remainingDistance / speed;

  // Calculate estimated arrival
  const now = new Date();
  const estimatedArrival = new Date(now.getTime() + remainingHours * 60 * 60 * 1000);

  // Check against original ETA (using delivery_date from new schema)
  const originalETA = shipment.delivery_date ? new Date(shipment.delivery_date) : estimatedArrival;
  const delayMs = estimatedArrival.getTime() - originalETA.getTime();
  const delayHours = Math.max(0, delayMs / (1000 * 60 * 60));
  const isDelayed = delayHours > 0.5; // More than 30 minutes delay

  // Determine delay severity
  let delaySeverity: DelaySeverity = 'none';
  if (delayHours >= DELAY_THRESHOLDS.severe) {
    delaySeverity = 'severe';
  } else if (delayHours >= DELAY_THRESHOLDS.moderate) {
    delaySeverity = 'moderate';
  } else if (delayHours >= DELAY_THRESHOLDS.minor) {
    delaySeverity = 'minor';
  }

  // Determine status
  let status: 'on-time' | 'at-risk' | 'delayed' = 'on-time';
  if (isDelayed) {
    status = 'delayed';
  } else if (delayHours > 0) {
    status = 'at-risk';
  }

  return {
    estimatedArrival,
    remainingHours: Math.round(remainingHours * 10) / 10,
    remainingDistance: Math.round(remainingDistance * 10) / 10,
    progressPercentage,
    isDelayed,
    delaySeverity,
    delayHours: Math.round(delayHours * 10) / 10,
    status,
  };
}

/**
 * Generate delay alert based on severity
 */
export function generateDelayAlert(etaResult: ETAResult): DelayAlert | null {
  if (etaResult.delaySeverity === 'none') return null;

  const alerts: Record<Exclude<DelaySeverity, 'none'>, DelayAlert> = {
    minor: {
      severity: 'minor',
      message: `Shipment is slightly behind schedule by ${etaResult.delayHours.toFixed(1)} hours.`,
      hoursDelayed: etaResult.delayHours,
      recommendedAction: 'Monitor closely, no immediate action required.',
    },
    moderate: {
      severity: 'moderate',
      message: `Shipment is delayed by ${etaResult.delayHours.toFixed(1)} hours.`,
      hoursDelayed: etaResult.delayHours,
      recommendedAction: 'Contact carrier for updated delivery schedule.',
    },
    severe: {
      severity: 'severe',
      message: `Significant delay detected: ${etaResult.delayHours.toFixed(1)} hours behind schedule.`,
      hoursDelayed: etaResult.delayHours,
      recommendedAction: 'Immediate escalation required. Contact operations team.',
    },
  };

  return alerts[etaResult.delaySeverity];
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} mins`;
  }
  if (hours < 24) {
    return `${Math.round(hours * 10) / 10} hours`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return `${days}d ${remainingHours}h`;
}

/**
 * Format delay for display
 */
export function formatDelay(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} mins`;
  }
  return `${Math.round(hours * 10) / 10} hours`;
}

/**
 * Get color class for delay severity
 */
export function getDelaySeverityColor(severity: DelaySeverity): string {
  const colors: Record<DelaySeverity, string> = {
    none: 'text-green-500',
    minor: 'text-yellow-500',
    moderate: 'text-orange-500',
    severe: 'text-red-500',
  };
  return colors[severity];
}

/**
 * Get background color class for delay severity
 */
export function getDelaySeverityBgColor(severity: DelaySeverity): string {
  const colors: Record<DelaySeverity, string> = {
    none: 'bg-green-500/10 border-green-500/30',
    minor: 'bg-yellow-500/10 border-yellow-500/30',
    moderate: 'bg-orange-500/10 border-orange-500/30',
    severe: 'bg-red-500/10 border-red-500/30',
  };
  return colors[severity];
}

/**
 * Get badge variant for delay severity
 */
export function getDelaySeverityBadge(severity: DelaySeverity): {
  label: string;
  className: string;
} {
  const badges: Record<DelaySeverity, { label: string; className: string }> = {
    none: {
      label: 'On Time',
      className: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    minor: {
      label: 'Minor Delay',
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    moderate: {
      label: 'Moderate Delay',
      className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    },
    severe: {
      label: 'Severe Delay',
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
  };
  return badges[severity];
}

/**
 * Track ETA history for trend analysis
 */
export interface ETATrackingEntry {
  timestamp: Date;
  estimatedArrival: Date;
  remainingHours: number;
  progressPercentage: number;
}

export class ETATracker {
  private history: ETATrackingEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries: number = 50) {
    this.maxEntries = maxEntries;
  }

  addEntry(entry: Omit<ETATrackingEntry, 'timestamp'>): void {
    this.history.unshift({
      ...entry,
      timestamp: new Date(),
    });

    // Keep only the most recent entries
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }
  }

  getHistory(): ETATrackingEntry[] {
    return [...this.history];
  }

  getTrend(): 'improving' | 'stable' | 'worsening' {
    if (this.history.length < 3) return 'stable';

    const recent = this.history.slice(0, 3);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const diff = last.remainingHours - first.remainingHours;

    if (diff > 1) return 'worsening';
    if (diff < -1) return 'improving';
    return 'stable';
  }

  clear(): void {
    this.history = [];
  }
}
