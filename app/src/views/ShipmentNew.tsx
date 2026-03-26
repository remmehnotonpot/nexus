"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateShipmentForm } from '@/components/forms/CreateShipmentForm';
import { createShipment } from '@/lib/api/shipments';
import { generateTrackingNumber } from '@/hooks/useSimulation';
import type { ShipmentFormData } from '@/lib/geocoding';
import type { Shipment } from '@/types';

export default function ShipmentNew() {
  const router = useRouter();

  const handleCreateShipment = async (data: ShipmentFormData) => {
    const trackingNumber = generateTrackingNumber();

    const shipmentData: Omit<Shipment, 'id' | 'created_at' | 'updated_at'> = {
      tracking_number: trackingNumber,
      status: 'pending',
      origin_address: {
        city: data.origin.city,
        country: data.origin.country,
      },
      destination_address: {
        city: data.destination.city,
        country: data.destination.country,
      },
      origin_lat: data.origin.lat,
      origin_lng: data.origin.lng,
      destination_lat: data.destination.lat,
      destination_lng: data.destination.lng,
      current_lat: data.origin.lat,
      current_lng: data.origin.lng,
      current_heading: 0,
      transport_mode: data.transportMode,
      weight_kg: data.weightKg ?? 0,
      volume_cbm: data.volumeCbm ?? null,
      // Required nullable fields
      customer_id: null,
      additional_charges: null,
      assigned_driver_id: null,
      assigned_vehicle_id: null,
      base_rate: null,
      cargo_description: data.goodsDescription || null,
      cargo_type: null,
      created_by: null,
      currency: null,
      declared_value: null,
      delivery_date: null,
      estimated_transit_days: null,
      fuel_surcharge: null,
      pickup_date: null,
      pieces: null,
      service_type: null,
      sub_status: null,
      total_amount: null,
      updated_by: null,
    };

    await createShipment(shipmentData);

    // Redirect to shipments list after successful creation
    router.push('/shipments');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link href="/shipments">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-orange-500" />
              Create New Shipment
            </h1>
            <p className="text-slate-400 mt-1">
              Enter shipment details to create a new tracking record
            </p>
          </div>
        </div>

        {/* Form */}
        <CreateShipmentForm 
          onSubmit={handleCreateShipment}
          className="bg-slate-900 border-slate-800"
        />
      </div>
    </div>
  );
}
