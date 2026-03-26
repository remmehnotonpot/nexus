"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createQuote, calculateEstimatedPrice } from '@/lib/api/quotes';
import { LocationAutocomplete, ExtractedLocation } from '@/components/LocationAutocomplete';
import { calculateDistance } from '@/lib/geocoding';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

// Icons
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  Scale,
  Box,
  AlertCircle,
  CheckCircle,
  Calculator,
} from 'lucide-react';

const TRANSPORT_MODES = [
  { value: 'air', label: 'Air Freight', description: 'Fastest option for urgent shipments' },
  { value: 'ocean', label: 'Ocean Freight', description: 'Most economical for large volumes' },
  { value: 'road', label: 'Road Transport', description: 'Best for regional deliveries' },
  { value: 'rail', label: 'Rail Freight', description: 'Eco-friendly long-distance option' },
];

const SERVICE_TYPES = [
  { value: 'express', label: 'Express', description: '1-3 days' },
  { value: 'standard', label: 'Standard', description: '5-10 days' },
  { value: 'economy', label: 'Economy', description: '10+ days' },
];

const CARGO_TYPES = [
  { value: 'general', label: 'General Cargo' },
  { value: 'hazardous', label: 'Hazardous Materials' },
  { value: 'perishable', label: 'Perishable Goods' },
  { value: 'fragile', label: 'Fragile Items' },
  { value: 'high_value', label: 'High Value Items' },
];

export function QuoteRequest() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [estimate, setEstimate] = useState<{ baseRate: number; fuelSurcharge: number; total: number } | null>(null);

  // Form state
  const [origin, setOrigin] = useState<ExtractedLocation | null>(null);
  const [destination, setDestination] = useState<ExtractedLocation | null>(null);
  const [formData, setFormData] = useState({
    cargoDescription: '',
    cargoType: 'general',
    weightKg: '',
    volumeCbm: '',
    pieces: '1',
    declaredValue: '',
    transportMode: 'road',
    serviceType: 'standard',
    pickupDate: '',
    deliveryDate: '',
    specialInstructions: '',
    requiresHazmat: false,
    requiresTemperatureControl: false,
    temperatureRange: '',
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setEstimate(null); // Clear estimate when inputs change
  };

  const calculateEstimate = () => {
    const weight = parseFloat(formData.weightKg);
    const volume = formData.volumeCbm ? parseFloat(formData.volumeCbm) : undefined;

    if (!weight || weight <= 0 || !origin || !destination) return;

    const distance = calculateDistance(
      { lat: origin.lat, lng: origin.lng },
      { lat: destination.lat, lng: destination.lng }
    );

    const price = calculateEstimatedPrice({
      weightKg: weight,
      volumeCbm: volume,
      transportMode: formData.transportMode,
      serviceType: formData.serviceType,
      distanceKm: distance,
    });

    setEstimate(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setStatus('error');
      setStatusMessage('Please log in to request a quote');
      return;
    }

    if (!origin || !destination) {
      setStatus('error');
      setStatusMessage('Please select both origin and destination');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const quote = await createQuote({
        customer_id: user.id,
        origin_address: {
          name: origin.name,
          formatted_address: origin.formatted_address,
          lat: origin.lat,
          lng: origin.lng,
        },
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        destination_address: {
          name: destination.name,
          formatted_address: destination.formatted_address,
          lat: destination.lat,
          lng: destination.lng,
        },
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        cargo_description: formData.cargoDescription,
        cargo_type: formData.cargoType,
        weight_kg: parseFloat(formData.weightKg),
        volume_cbm: formData.volumeCbm ? parseFloat(formData.volumeCbm) : undefined,
        pieces: parseInt(formData.pieces) || 1,
        declared_value: formData.declaredValue ? parseFloat(formData.declaredValue) : undefined,
        currency: 'USD',
        transport_mode: formData.transportMode,
        service_type: formData.serviceType,
        pickup_date: formData.pickupDate || undefined,
        delivery_date: formData.deliveryDate || undefined,
        special_instructions: formData.specialInstructions || undefined,
        requires_hazmat: formData.requiresHazmat,
        requires_temperature_control: formData.requiresTemperatureControl,
        temperature_range: formData.requiresTemperatureControl ? formData.temperatureRange : undefined,
      });

      setStatus('success');
      setStatusMessage(`Quote request submitted! Reference: ${quote.quote_number}`);

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/customer/quotes');
      }, 2000);
    } catch (error) {
      console.error('Error creating quote:', error);
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to submit quote request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCalculateEstimate =
    origin &&
    destination &&
    formData.weightKg &&
    parseFloat(formData.weightKg) > 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader />

      <main className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Request Quote</h1>
            <p className="text-sm text-muted-foreground">Get pricing for your shipment</p>
          </div>
        </div>

        {/* Status Alert */}
        {status !== 'idle' && (
          <Alert className={status === 'success' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}>
            {status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription className={status === 'success' ? 'text-green-600' : 'text-red-600'}>
              {statusMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Locations Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Locations
              </CardTitle>
              <CardDescription>Select pickup and delivery locations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LocationAutocomplete
                value={origin}
                onChange={setOrigin}
                label="Origin"
                placeholder="Search pickup location..."
              />
              <LocationAutocomplete
                value={destination}
                onChange={setDestination}
                label="Destination"
                placeholder="Search delivery location..."
              />
            </CardContent>
          </Card>

          {/* Service Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Transport Mode</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TRANSPORT_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => handleInputChange('transportMode', mode.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.transportMode === mode.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-sm">{mode.label}</div>
                      <div className="text-xs text-muted-foreground">{mode.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service Type</Label>
                <div className="flex gap-2">
                  {SERVICE_TYPES.map((service) => (
                    <button
                      key={service.value}
                      type="button"
                      onClick={() => handleInputChange('serviceType', service.value)}
                      className={`flex-1 p-2 rounded-lg border text-center transition-colors ${
                        formData.serviceType === service.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-sm">{service.label}</div>
                      <div className="text-xs text-muted-foreground">{service.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cargo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Cargo Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cargoDescription">Description</Label>
                <Textarea
                  id="cargoDescription"
                  placeholder="Describe your cargo..."
                  value={formData.cargoDescription}
                  onChange={(e) => handleInputChange('cargoDescription', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Cargo Type</Label>
                <Select
                  value={formData.cargoType}
                  onValueChange={(value) => handleInputChange('cargoType', value)}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Weight (kg) *
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="0.0"
                    value={formData.weightKg}
                    onChange={(e) => handleInputChange('weightKg', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume" className="flex items-center gap-2">
                    <Box className="h-4 w-4" />
                    Volume (CBM)
                  </Label>
                  <Input
                    id="volume"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Optional"
                    value={formData.volumeCbm}
                    onChange={(e) => handleInputChange('volumeCbm', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pieces">Number of Pieces</Label>
                  <Input
                    id="pieces"
                    type="number"
                    min="1"
                    value={formData.pieces}
                    onChange={(e) => handleInputChange('pieces', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declaredValue">Declared Value (USD)</Label>
                  <Input
                    id="declaredValue"
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={formData.declaredValue}
                    onChange={(e) => handleInputChange('declaredValue', e.target.value)}
                  />
                </div>
              </div>

              {/* Special Requirements */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hazmat"
                    checked={formData.requiresHazmat}
                    onCheckedChange={(checked) =>
                      handleInputChange('requiresHazmat', checked as boolean)
                    }
                  />
                  <Label htmlFor="hazmat" className="text-sm font-normal">
                    Contains hazardous materials
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="temperature"
                    checked={formData.requiresTemperatureControl}
                    onCheckedChange={(checked) =>
                      handleInputChange('requiresTemperatureControl', checked as boolean)
                    }
                  />
                  <Label htmlFor="temperature" className="text-sm font-normal">
                    Requires temperature control
                  </Label>
                </div>
                {formData.requiresTemperatureControl && (
                  <div className="pl-6">
                    <Input
                      placeholder="e.g., 2-8°C"
                      value={formData.temperatureRange}
                      onChange={(e) => handleInputChange('temperatureRange', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickupDate">Preferred Pickup</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Target Delivery</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                    min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any additional requirements..."
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Price Estimate */}
          {canCalculateEstimate && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Estimated Price</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={calculateEstimate}
                  >
                    Calculate
                  </Button>
                </div>
                {estimate && (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Rate</span>
                      <span>${estimate.baseRate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuel Surcharge</span>
                      <span>${estimate.fuelSurcharge.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Estimated Total</span>
                      <span>${estimate.total.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      * This is an estimate. Final pricing may vary based on actual dimensions and requirements.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12"
            disabled={isSubmitting || !origin || !destination || !formData.weightKg}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⟳</span>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Request Quote
              </span>
            )}
          </Button>
        </form>
      </main>

      <MobileBottomNav />
    </div>
  );
}
