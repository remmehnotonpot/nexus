"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, Building2, Globe, Loader2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { searchAddress } from '@/lib/geocoding';
import { supabase } from '@/lib/supabase';

// Types
export interface ExtractedLocation {
  name: string;
  formatted_address?: string;
  lat: number;
  lng: number;
  source: 'internal_hub' | 'photon_api';
  code?: string;
  type?: string;
}

interface Facility {
  id: string;
  name: string;
  code: string | null;
  type: string;
  lat: number;
  lng: number;
  city: string | null;
  country: string | null;
}

interface LocationAutocompleteProps {
  value?: ExtractedLocation | null;
  onChange: (location: ExtractedLocation | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  showQuickSelect?: boolean;
}

// Debounce hook
function useDebounce(
  func: (query: string) => Promise<void>,
  wait: number
): (query: string) => void {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (query: string) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => func(query), wait);
    },
    [func, wait]
  );
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Search location...",
  disabled = false,
  className,
  label,
  showQuickSelect = true,
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [internalFacilities, setInternalFacilities] = useState<Facility[]>([]);
  const [photonResults, setPhotonResults] = useState<ExtractedLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch internal facilities on mount
  useEffect(() => {
    const fetchFacilities = async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('id, name, code, type, lat, lng, city, country')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (!error && data) {
        setInternalFacilities(data);
      }
    };

    fetchFacilities();
  }, []);

  // Debounced search function
  const debouncedSearch = useDebounce(async (query: string) => {
    if (query.length < 2) {
      setPhotonResults([]);
      setIsLoading(false);
      return;
    }

    const results = await searchAddress(query, 5);
    setPhotonResults(
      results.map((result) => ({
        name: result.name || result.city,
        formatted_address: result.fullAddress,
        lat: result.lat,
        lng: result.lng,
        source: 'photon_api' as const,
      }))
    );
    setIsLoading(false);
  }, 300);

  // Handle search input change
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setIsLoading(value.length >= 2);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Filter internal facilities based on search
  const filteredFacilities = searchQuery.length >= 2
    ? internalFacilities.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.code?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : showQuickSelect ? internalFacilities.slice(0, 5) : [];

  // Handle selection
  const handleSelect = useCallback(
    (location: ExtractedLocation) => {
      onChange(location);
      setOpen(false);
      setSearchQuery("");
      setPhotonResults([]);
    },
    [onChange]
  );

  // Handle facility selection
  const handleSelectFacility = useCallback(
    (facility: Facility) => {
      handleSelect({
        name: facility.name,
        formatted_address: `${facility.city || ''}, ${facility.country || ''}`.replace(/^,\s*|,\s*$/g, ''),
        lat: facility.lat,
        lng: facility.lng,
        source: 'internal_hub',
        code: facility.code || undefined,
        type: facility.type,
      });
    },
    [handleSelect]
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">
                {value
                  ? value.name || value.formatted_address
                  : placeholder}
              </span>
            </div>
            {value?.source === 'internal_hub' && (
              <Building2 className="ml-2 h-3 w-3 shrink-0 text-blue-500" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Type to search locations..."
              value={searchQuery}
              onValueChange={handleSearchChange}
            />
            <CommandList className="max-h-[300px]">
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                </div>
              )}

              {/* Internal Facilities Group */}
              {!isLoading && filteredFacilities.length > 0 && (
                <CommandGroup heading="Company Hubs">
                  {filteredFacilities.map((facility) => (
                    <CommandItem
                      key={facility.id}
                      value={`facility-${facility.id}`}
                      onSelect={() => handleSelectFacility(facility)}
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <Building2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{facility.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {[facility.city, facility.country].filter(Boolean).join(', ')}
                            {facility.code && ` • ${facility.code}`}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Photon Results Group */}
              {!isLoading && photonResults.length > 0 && (
                <CommandGroup heading="Global Addresses">
                  {photonResults.map((result, index) => (
                    <CommandItem
                      key={`photon-${index}`}
                      value={`photon-${index}-${result.name}`}
                      onSelect={() => handleSelect(result)}
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <Globe className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.name}</div>
                          {result.formatted_address && (
                            <div className="text-xs text-muted-foreground truncate">
                              {result.formatted_address}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Empty State */}
              {!isLoading && searchQuery.length >= 2 && 
               filteredFacilities.length === 0 && 
               photonResults.length === 0 && (
                <CommandEmpty>
                  <div className="text-center py-4">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No locations found for &quot;{searchQuery}&quot;
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try searching for a city, port, or facility name
                    </p>
                  </div>
                </CommandEmpty>
              )}

              {/* Initial State - Quick Select */}
              {!isLoading && searchQuery.length < 2 && showQuickSelect && (
                <div className="py-4 px-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Start typing to search locations
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Or select from company hubs above
                  </p>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Location Display */}
      {value && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>
            {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </span>
          {value.source === 'internal_hub' && (
            <span className="text-blue-500">• Company Hub</span>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;
