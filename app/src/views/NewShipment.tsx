"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { createShipment } from '@/lib/api/operations';
import { getCustomers } from '@/lib/api/customers';
import type { Customer, TransportMode, ServiceType, CargoType } from '@/types';
import type { Json } from '@/types/database';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useRequireRole } from '@/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Check,
  ChevronsUpDown,
  Plane,
  Ship,
  Truck,
  Train,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const STEPS = [
  { id: 'customer', title: 'Customer' },
  { id: 'route', title: 'Route' },
  { id: 'cargo', title: 'Cargo' },
  { id: 'service', title: 'Service' },
  { id: 'review', title: 'Review' },
];

const TRANSPORT_MODES: { value: Exclude<TransportMode, 'multimodal'>; label: string; icon: React.ReactNode }[] = [
  { value: 'air', label: 'Air Freight', icon: <Plane className="h-5 w-5" /> },
  { value: 'ocean', label: 'Ocean Freight', icon: <Ship className="h-5 w-5" /> },
  { value: 'road', label: 'Road Transport', icon: <Truck className="h-5 w-5" /> },
  { value: 'rail', label: 'Rail Freight', icon: <Train className="h-5 w-5" /> },
];

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'express', label: 'Express' },
  { value: 'standard', label: 'Standard' },
  { value: 'economy', label: 'Economy' },
];

const CARGO_TYPES: { value: CargoType; label: string }[] = [
  { value: 'general', label: 'General Cargo' },
  { value: 'hazardous', label: 'Hazardous Materials' },
  { value: 'perishable', label: 'Perishable Goods' },
  { value: 'fragile', label: 'Fragile Items' },
  { value: 'high_value', label: 'High Value' },
];

export function NewShipment() {
  const router = useRouter();
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    origin: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
    destination: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
    weight: '',
    volume: '',
    pieces: '1',
    cargoType: 'general' as CargoType,
    cargoDescription: '',
    declaredValue: '',
    transportMode: 'road' as Exclude<TransportMode, 'multimodal'>,
    serviceType: 'standard' as ServiceType,
    pickupDate: '',
    deliveryDate: '',
    // Coordinates (would typically come from geocoding)
    originLat: 0,
    originLng: 0,
    destinationLat: 0,
    destinationLng: 0,
  });

  // Require staff role
  useRequireRole(['super_admin', 'operations_manager', 'logistics_coordinator']);

  const loadCustomers = async () => {
    if (customers.length === 0) {
      const { data } = await getCustomers({ limit: 100 });
      setCustomers(data);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!profile) return;

    setIsSubmitting(true);
    try {
      const trackingNumber = `NXS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

      const shipment = await createShipment({
        tracking_number: trackingNumber,
        customer_id: formData.customerId,
        status: 'pending',
        origin_address: {
          street: formData.origin.street,
          city: formData.origin.city,
          state: formData.origin.state,
          postal_code: formData.origin.postal_code,
          country: formData.origin.country,
        } as Json,
        destination_address: {
          street: formData.destination.street,
          city: formData.destination.city,
          state: formData.destination.state,
          postal_code: formData.destination.postal_code,
          country: formData.destination.country,
        } as Json,
        origin_lat: formData.originLat,
        origin_lng: formData.originLng,
        destination_lat: formData.destinationLat,
        destination_lng: formData.destinationLng,
        current_lat: formData.originLat,
        current_lng: formData.originLng,
        current_heading: 0,
        transport_mode: formData.transportMode,
        service_type: formData.serviceType,
        weight_kg: parseFloat(formData.weight) || 0,
        volume_cbm: formData.volume ? parseFloat(formData.volume) : null,
        pieces: parseInt(formData.pieces),
        cargo_type: formData.cargoType,
        cargo_description: formData.cargoDescription || null,
        declared_value: formData.declaredValue ? parseFloat(formData.declaredValue) : null,
        pickup_date: formData.pickupDate || null,
        delivery_date: formData.deliveryDate || null,
        created_by: profile.id,
        // Required nullable fields
        additional_charges: null,
        assigned_driver_id: null,
        assigned_vehicle_id: null,
        base_rate: null,
        currency: null,
        estimated_transit_days: null,
        fuel_surcharge: null,
        sub_status: null,
        total_amount: null,
        updated_by: null,
      });

      router.push(`/ops/shipments/${shipment.id}`);
    } catch (error) {
      console.error('Error creating shipment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Customer
        return !!formData.customerId;
      case 1: // Route
        return formData.origin.city && formData.destination.city;
      case 2: // Cargo
        return formData.weight && parseFloat(formData.weight) > 0;
      case 3: // Service
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader 
        title="New Shipment" 
        showBack 
        backHref="/ops/dashboard"
      />
      
      <main className="p-4 space-y-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                index === currentStep && "bg-primary text-primary-foreground",
                index < currentStep && "bg-green-500 text-white",
                index > currentStep && "bg-muted text-muted-foreground"
              )}>
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "w-4 h-0.5 mx-1",
                  index < currentStep ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <h2 className="text-lg font-semibold">{STEPS[currentStep].title}</h2>

        {/* Step Content */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {currentStep === 0 && (
              /* Customer Selection */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Customer</Label>
                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerSearchOpen}
                        className="w-full justify-between"
                        onClick={loadCustomers}
                      >
                        {formData.customerName || "Search customers..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search customers..." />
                        <CommandList>
                          <CommandEmpty>No customers found.</CommandEmpty>
                          <CommandGroup>
                            {customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.company_name}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    customerId: customer.id,
                                    customerName: customer.company_name,
                                  });
                                  setCustomerSearchOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.customerId === customer.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {customer.company_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground">or</span>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/ops/customers/new">
                    Create New Customer
                  </Link>
                </Button>
              </div>
            )}

            {currentStep === 1 && (
              /* Route */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Origin City</Label>
                  <Input
                    placeholder="e.g., Shanghai"
                    value={formData.origin.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      origin: { ...formData.origin, city: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Origin Country</Label>
                  <Input
                    placeholder="e.g., China"
                    value={formData.origin.country}
                    onChange={(e) => setFormData({
                      ...formData,
                      origin: { ...formData.origin, country: e.target.value }
                    })}
                  />
                </div>
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <Label>Destination City</Label>
                    <Input
                      placeholder="e.g., Los Angeles"
                      value={formData.destination.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        destination: { ...formData.destination, city: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Destination Country</Label>
                  <Input
                    placeholder="e.g., USA"
                    value={formData.destination.country}
                    onChange={(e) => setFormData({
                      ...formData,
                      destination: { ...formData.destination, country: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              /* Cargo */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Volume (CBM) - Optional</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Pieces</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={formData.pieces}
                    onChange={(e) => setFormData({ ...formData, pieces: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo Type</Label>
                  <Select
                    value={formData.cargoType}
                    onValueChange={(v) => setFormData({ ...formData, cargoType: v as CargoType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CARGO_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cargo Description</Label>
                  <Input
                    placeholder="Brief description of goods"
                    value={formData.cargoDescription}
                    onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              /* Service */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Transport Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRANSPORT_MODES.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setFormData({ ...formData, transportMode: mode.value })}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                          formData.transportMode === mode.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                        )}
                      >
                        {mode.icon}
                        <span className="text-sm">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(v) => setFormData({ ...formData, serviceType: v as ServiceType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pickup Date</Label>
                  <Input
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Delivery Date</Label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              /* Review */
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{formData.customerName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p className="font-medium">
                    {formData.origin.city}, {formData.origin.country} → {formData.destination.city}, {formData.destination.country}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Cargo</p>
                  <p className="font-medium">
                    {formData.weight} kg • {formData.pieces} pieces • {CARGO_TYPES.find(c => c.value === formData.cargoType)?.label}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">
                    {TRANSPORT_MODES.find(m => m.value === formData.transportMode)?.label} • {SERVICE_TYPES.find(s => s.value === formData.serviceType)?.label}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button variant="outline" className="flex-1" onClick={handleBack}>
              Back
            </Button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button 
              className="flex-1" 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Shipment'
              )}
            </Button>
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
