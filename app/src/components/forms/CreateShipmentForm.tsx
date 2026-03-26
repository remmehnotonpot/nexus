"use client";

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  MapPin, 
  Navigation, 
  Package, 
  Scale, 
  Box, 
  Calendar,
  Plane,
  Ship,
  Truck,
  Train,
  Search,
  Loader2,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { cn } from '@/lib/utils';
import { 
  searchAddress, 
  calculateETA, 
  formatEstimatedArrival,
  shipmentFormSchema,
  type ShipmentFormData,
  type GeocodingResult,
} from '@/lib/geocoding';
import type { TransportMode } from '@/types';

const transportModes: { value: TransportMode; label: string; icon: React.ElementType; speed: string }[] = [
  { value: 'air', label: 'Air Freight', icon: Plane, speed: '~900 km/h' },
  { value: 'ocean', label: 'Ocean Freight', icon: Ship, speed: '~40 km/h' },
  { value: 'road', label: 'Road Transport', icon: Truck, speed: '~80 km/h' },
  { value: 'rail', label: 'Rail Transport', icon: Train, speed: '~60 km/h' },
];

interface CreateShipmentFormProps {
  onSubmit?: (data: ShipmentFormData) => Promise<void>;
  className?: string;
}

export function CreateShipmentForm({ onSubmit, className }: CreateShipmentFormProps) {
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [originResults, setOriginResults] = useState<GeocodingResult[]>([]);
  const [destResults, setDestResults] = useState<GeocodingResult[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [originOpen, setOriginOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const [eta, setEta] = useState<{ distance: number; duration: number; arrivalDate: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      origin: { lat: 0, lng: 0, city: '', country: '', address: '' },
      destination: { lat: 0, lng: 0, city: '', country: '', address: '' },
      transportMode: 'ocean',
      weightKg: undefined,
      volumeCbm: undefined,
      goodsDescription: '',
      estimatedArrival: '',
    },
  });

  const origin = form.watch('origin');
  const destination = form.watch('destination');
  const transportMode = form.watch('transportMode');

  // Search for origin addresses
  useEffect(() => {
    const search = async () => {
      if (originSearch.length < 3) {
        setOriginResults([]);
        return;
      }
      setIsSearchingOrigin(true);
      const results = await searchAddress(originSearch);
      setOriginResults(results);
      setIsSearchingOrigin(false);
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [originSearch]);

  // Search for destination addresses
  useEffect(() => {
    const search = async () => {
      if (destSearch.length < 3) {
        setDestResults([]);
        return;
      }
      setIsSearchingDest(true);
      const results = await searchAddress(destSearch);
      setDestResults(results);
      setIsSearchingDest(false);
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [destSearch]);

  // Calculate ETA when origin, destination, or transport mode changes
  useEffect(() => {
    if (origin.lat && origin.lng && destination.lat && destination.lng) {
      const etaResult = calculateETA(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng },
        transportMode
      );
      const arrivalDate = formatEstimatedArrival(etaResult.duration);
      setEta({
        distance: etaResult.distance,
        duration: etaResult.duration,
        arrivalDate,
      });
      form.setValue('estimatedArrival', arrivalDate);
    }
  }, [origin.lat, origin.lng, destination.lat, destination.lng, transportMode, form]);

  const handleOriginSelect = useCallback((result: GeocodingResult) => {
    form.setValue('origin', {
      lat: result.lat,
      lng: result.lng,
      city: result.city,
      country: result.country,
      address: result.fullAddress,
    });
    setOriginSearch(result.fullAddress);
    setOriginOpen(false);
  }, [form]);

  const handleDestSelect = useCallback((result: GeocodingResult) => {
    form.setValue('destination', {
      lat: result.lat,
      lng: result.lng,
      city: result.city,
      country: result.country,
      address: result.fullAddress,
    });
    setDestSearch(result.fullAddress);
    setDestOpen(false);
  }, [form]);

  const handleSubmit = async (data: ShipmentFormData) => {
    if (!onSubmit) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      form.reset();
      setOriginSearch('');
      setDestSearch('');
      setEta(null);
    } catch (error) {
      console.error('Failed to create shipment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className={cn("border-green-500/30 bg-green-500/5", className)}>
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-green-400 mb-2">Shipment Created!</h3>
          <p className="text-slate-400">Your shipment has been successfully created and is ready for tracking.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Origin Address */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                Origin
              </Label>
              <Popover open={originOpen} onOpenChange={setOriginOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={originOpen}
                    className="w-full justify-between bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
                  >
                    {origin.address || "Search origin address..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-slate-800 border-slate-700">
                  <Command className="bg-transparent">
                    <CommandInput
                      placeholder="Search city or address..."
                      value={originSearch}
                      onValueChange={setOriginSearch}
                      className="border-none text-white placeholder:text-slate-500"
                    />
                    <CommandList>
                      <CommandEmpty className="text-slate-400 py-4 text-center">
                        {isSearchingOrigin ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching...
                          </div>
                        ) : (
                          originSearch.length < 3 ? "Type at least 3 characters" : "No results found"
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {originResults.map((result, index) => (
                          <CommandItem
                            key={index}
                            value={result.fullAddress}
                            onSelect={() => handleOriginSelect(result)}
                            className="text-white hover:bg-slate-700 cursor-pointer"
                          >
                            <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                            <div className="flex flex-col">
                              <span>{result.city || result.name}</span>
                              <span className="text-xs text-slate-400">{result.country}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {origin.city && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Badge variant="secondary" className="bg-slate-800">
                    {origin.city}, {origin.country}
                  </Badge>
                  <span className="text-xs">
                    {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            {/* Destination Address */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-orange-500" />
                Destination
              </Label>
              <Popover open={destOpen} onOpenChange={setDestOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={destOpen}
                    className="w-full justify-between bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
                  >
                    {destination.address || "Search destination address..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-slate-800 border-slate-700">
                  <Command className="bg-transparent">
                    <CommandInput
                      placeholder="Search city or address..."
                      value={destSearch}
                      onValueChange={setDestSearch}
                      className="border-none text-white placeholder:text-slate-500"
                    />
                    <CommandList>
                      <CommandEmpty className="text-slate-400 py-4 text-center">
                        {isSearchingDest ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching...
                          </div>
                        ) : (
                          destSearch.length < 3 ? "Type at least 3 characters" : "No results found"
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {destResults.map((result, index) => (
                          <CommandItem
                            key={index}
                            value={result.fullAddress}
                            onSelect={() => handleDestSelect(result)}
                            className="text-white hover:bg-slate-700 cursor-pointer"
                          >
                            <Navigation className="mr-2 h-4 w-4 text-orange-500" />
                            <div className="flex flex-col">
                              <span>{result.city || result.name}</span>
                              <span className="text-xs text-slate-400">{result.country}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {destination.city && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Badge variant="secondary" className="bg-slate-800">
                    {destination.city}, {destination.country}
                  </Badge>
                  <span className="text-xs">
                    {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            {/* Transport Mode */}
            <FormField
              control={form.control}
              name="transportMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Transport Mode
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Select transport mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {transportModes.map((mode) => (
                        <SelectItem
                          key={mode.value}
                          value={mode.value}
                          className="text-white hover:bg-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <mode.icon className="w-4 h-4" />
                            <span>{mode.label}</span>
                            <span className="text-xs text-slate-400 ml-auto">{mode.speed}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ETA Display */}
            {eta && (
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Distance</div>
                      <div className="text-lg font-semibold text-white">
                        {eta.distance.toLocaleString()} km
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Est. Duration</div>
                      <div className="text-lg font-semibold text-white">
                        {eta.duration < 1 
                          ? `${Math.round(eta.duration * 60)} mins`
                          : `${Math.round(eta.duration * 10) / 10} hours`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="text-slate-400">Estimated Arrival:</span>
                      <span className="text-white font-medium">
                        {new Date(eta.arrivalDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipment Details */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      Weight (kg)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="bg-slate-900 border-slate-700 text-white"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volumeCbm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Box className="w-4 h-4" />
                      Volume (m³)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-slate-900 border-slate-700 text-white"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="goodsDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goods Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Description of goods being shipped..."
                      className="bg-slate-900 border-slate-700 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !origin.city || !destination.city}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Shipment...
                </>
              ) : (
                <>
                  Create Shipment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default CreateShipmentForm;
