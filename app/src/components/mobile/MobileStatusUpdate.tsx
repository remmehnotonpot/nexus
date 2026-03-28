"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SHIPMENT_STATUS, type ShipmentStatus } from '@/types';
import { MapPin, Camera, Check } from 'lucide-react';

interface MobileStatusUpdateProps {
  currentStatus: ShipmentStatus;
  onSubmit: (data: {
    status: ShipmentStatus;
    subStatus?: string;
    notes: string;
    notifyCustomer: boolean;
  }) => Promise<void>;
  trigger: React.ReactNode;
}

const subStatusOptions: Record<ShipmentStatus, string[]> = {
  pending_dropoff: ['awaiting_dropoff', 'dropped_off'],
  scheduled_for_pickup: ['pickup_scheduled', 'driver_assigned', 'en_route'],
  in_transit: ['at_origin_facility', 'departed', 'at_sea', 'in_air', 'on_road', 'delayed'],
  customs: ['awaiting_clearance', 'inspection_required', 'held'],
  out_for_delivery: ['with_driver', 'approaching_destination'],
  delivered: ['completed', 'signed'],
  exception: ['delayed', 'damaged', 'address_issue', 'refused'],
  cancelled: ['by_customer', 'by_carrier'],
  returned: ['return_to_sender', 'return_initiated'],
};

export function MobileStatusUpdate({
  currentStatus,
  onSubmit,
  trigger,
}: MobileStatusUpdateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<ShipmentStatus>(currentStatus);
  const [subStatus, setSubStatus] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = () => {
    if (status) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        status,
        subStatus: subStatus || undefined,
        notes,
        notifyCustomer,
      });
      setIsOpen(false);
      // Reset form
      setStep(1);
      setStatus(currentStatus);
      setSubStatus('');
      setNotes('');
      setNotifyCustomer(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSubStatuses = subStatusOptions[status] || [];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader className="pb-4">
          <SheetTitle>
            {step === 1 ? 'Update Status' : 'Add Details'}
          </SheetTitle>
        </SheetHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Current: <span className="font-medium text-foreground capitalize">{currentStatus.replace('_', ' ')}</span>
            </div>

            <div className="space-y-2">
              <Label>New Status</Label>
              <div className="grid gap-2">
                {SHIPMENT_STATUS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors text-left",
                      status === s
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <span className="capitalize">{s.replace('_', ' ')}</span>
                    {status === s && <Check className="h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={handleContinue}
              disabled={!status}
            >
              Continue →
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Button variant="ghost" className="-ml-2" onClick={handleBack}>
              ← Back
            </Button>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <MapPin className="mr-2 h-4 w-4" />
                <span className="flex-1 text-left">Use Current Location</span>
              </Button>
            </div>

            {/* Sub-status */}
            {availableSubStatuses.length > 0 && (
              <div className="space-y-2">
                <Label>Sub-Status</Label>
                <Select value={subStatus} onValueChange={setSubStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubStatuses.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        <span className="capitalize">{sub.replace('_', ' ')}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (required)</Label>
              <Textarea
                placeholder="Add details about this status update..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Photo attachment */}
            <Button variant="outline" className="w-full justify-start">
              <Camera className="mr-2 h-4 w-4" />
              Attach Photo
            </Button>

            {/* Notify customer */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify"
                checked={notifyCustomer}
                onCheckedChange={(checked) => setNotifyCustomer(checked as boolean)}
              />
              <Label htmlFor="notify" className="text-sm font-normal">
                Notify customer of this update
              </Label>
            </div>

            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={handleSubmit}
              disabled={!notes.trim() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Update'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
