/**
 * Geocoding Service - Photon API Integration
 * OpenStreetMap-based geocoding for address autocomplete and reverse geocoding
 */

import type { TransportMode } from '@/types';

const PHOTON_API_URL = 'https://photon.komoot.io';
const PHOTON_API_TIMEOUT = 10000; // 10 second timeout

export interface PhotonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    name?: string;
    country?: string;
    countrycode?: string;
    county?: string;
    city?: string;
    district?: string;
    locality?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    osm_id?: number;
    osm_type?: string;
    osm_key?: string;
    osm_value?: string;
    extent?: [number, number, number, number];
  };
}

export interface PhotonResponse {
  type: string;
  features: PhotonFeature[];
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  name: string;
  city: string;
  country: string;
  fullAddress: string;
}

export interface DistanceResult {
  distance: number; // in kilometers
  duration: number; // in hours (estimated based on transport mode)
}

// Transport mode average speeds (km/h)
const TRANSPORT_SPEEDS: Record<TransportMode, number> = {
  air: 900,    // Commercial aircraft average
  ocean: 40,   // Container ship average
  road: 80,    // Truck average
  rail: 60,    // Freight train average
};

/**
 * Search for addresses using Photon API autocomplete
 * @param query - Search query string
 * @param limit - Maximum number of results (default: 5)
 * @returns Array of geocoding results
 */
export async function searchAddress(
  query: string,
  limit: number = 5
): Promise<GeocodingResult[]> {
  if (!query || query.length < 2) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PHOTON_API_TIMEOUT);

  try {
    const response = await fetch(
      `${PHOTON_API_URL}/api/?q=${encodeURIComponent(query)}&limit=${limit}&layer=city&layer=locality&layer=district&layer=county`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Photon API error: ${response.status}`);
    }

    const data: PhotonResponse = await response.json();

    return data.features.map((feature) => ({
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      name: feature.properties.name || '',
      city: feature.properties.city || feature.properties.locality || feature.properties.district || '',
      country: feature.properties.country || '',
      fullAddress: formatAddress(feature.properties),
    }));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Geocoding search timed out');
    } else {
      console.error('Geocoding search error:', error);
    }
    return [];
  }
}

/**
 * Reverse geocode - get address from coordinates
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Geocoding result or null if not found
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodingResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PHOTON_API_TIMEOUT);

  try {
    const response = await fetch(
      `${PHOTON_API_URL}/reverse?lat=${lat}&lon=${lng}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Photon API error: ${response.status}`);
    }

    const data: PhotonResponse = await response.json();

    if (data.features.length === 0) return null;

    const feature = data.features[0];

    return {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      name: feature.properties.name || '',
      city: feature.properties.city || feature.properties.locality || '',
      country: feature.properties.country || '',
      fullAddress: formatAddress(feature.properties),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Reverse geocoding timed out');
    } else {
      console.error('Reverse geocoding error:', error);
    }
    return null;
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * @param from - Origin coordinates
 * @param to - Destination coordinates
 * @returns Distance in kilometers
 */
export function calculateDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.lat * Math.PI / 180) *
      Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate estimated time of arrival
 * @param from - Origin coordinates
 * @param to - Destination coordinates
 * @param transportMode - Mode of transport
 * @returns Distance and duration
 */
export function calculateETA(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  transportMode: TransportMode
): DistanceResult {
  const distance = calculateDistance(from, to);
  const speed = TRANSPORT_SPEEDS[transportMode] ?? 60; // Default to 60 km/h
  const duration = distance / speed;

  return {
    distance: Math.round(distance * 10) / 10,
    duration: Math.round(duration * 10) / 10,
  };
}

/**
 * Format a date for estimated arrival display
 * @param durationHours - Duration in hours
 * @param startDate - Start date (defaults to now)
 * @returns ISO string of estimated arrival
 */
export function formatEstimatedArrival(
  durationHours: number,
  startDate: Date = new Date()
): string {
  const arrivalDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
  return arrivalDate.toISOString();
}

/**
 * Helper to format address from Photon properties
 */
function formatAddress(properties: PhotonFeature['properties']): string {
  const parts: string[] = [];

  if (properties.name) parts.push(properties.name);
  if (properties.street) {
    const streetPart = properties.housenumber
      ? `${properties.street} ${properties.housenumber}`
      : properties.street;
    parts.push(streetPart);
  }
  if (properties.city || properties.locality) {
    parts.push(properties.city ?? properties.locality ?? '');
  }
  if (properties.county) parts.push(properties.county);
  if (properties.country) parts.push(properties.country);

  return parts.join(', ');
}

/**
 * Debounce helper for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// =====================================================
// ZOD SCHEMAS FOR VALIDATION
// =====================================================

import { z } from 'zod';

export const shipmentFormSchema = z.object({
  origin: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    city: z.string().min(1, 'Origin city is required'),
    country: z.string().min(1, 'Origin country is required'),
    address: z.string().min(1, 'Origin address is required'),
  }),
  destination: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    city: z.string().min(1, 'Destination city is required'),
    country: z.string().min(1, 'Destination country is required'),
    address: z.string().min(1, 'Destination address is required'),
  }),
  transportMode: z.enum(['air', 'ocean', 'road', 'rail'] as const),
  weightKg: z.number().positive('Weight must be greater than 0').optional(),
  volumeCbm: z.number().positive('Volume must be greater than 0').optional(),
  goodsDescription: z.string().optional(),
  estimatedArrival: z.string().datetime(),
});

export type ShipmentFormData = z.infer<typeof shipmentFormSchema>;
