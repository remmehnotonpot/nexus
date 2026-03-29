"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useRequireRole } from '@/hooks/useAuth';
import { getCustomerQuotes, acceptQuote, rejectQuote, Quote } from '@/lib/api/quotes';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

function QuoteStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    draft: { class: 'bg-gray-100 text-gray-800', label: 'Draft' },
    submitted: { class: 'bg-blue-100 text-blue-800', label: 'Submitted' },
    under_review: { class: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
    quoted: { class: 'bg-purple-100 text-purple-800', label: 'Quoted' },
    accepted: { class: 'bg-green-100 text-green-800', label: 'Accepted' },
    rejected: { class: 'bg-red-100 text-red-800', label: 'Rejected' },
    converted: { class: 'bg-green-100 text-green-800', label: 'Converted' },
  };

  const config = variants[status] || variants.draft;

  return (
    <Badge variant="outline" className={config.class}>
      {config.label}
    </Badge>
  );
}

export default function CustomerQuotesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [activeTab, setActiveTab] = useState('active');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useRequireRole(['customer'], '/ops/dashboard');

  const fetchQuotes = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data } = await getCustomerQuotes(user.id);
      setQuotes(data);
      filterQuotes(data, activeTab);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, user?.id]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const filterQuotes = (data: Quote[], tab: string) => {
    if (tab === 'active') {
      setFilteredQuotes(data.filter((q) => ['submitted', 'under_review', 'quoted'].includes(q.status)));
    } else if (tab === 'pending_action') {
      setFilteredQuotes(data.filter((q) => q.status === 'quoted'));
    } else {
      setFilteredQuotes(data);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    filterQuotes(quotes, value);
  };

  const handleAccept = async (quoteId: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await acceptQuote(quoteId);
      setActionSuccess('Quote accepted successfully');
      fetchQuotes();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to accept quote');
    }
  };

  const handleReject = async (quoteId: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await rejectQuote(quoteId);
      setActionSuccess('Quote rejected');
      fetchQuotes();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to reject quote');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="My Quotes" showBack backHref="/customer/dashboard" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="My Quotes" showBack backHref="/customer/dashboard" />

      <main className="p-4 space-y-4">
        {/* New Quote Button */}
        <Button className="w-full" asChild>
          <Link href="/customer/quotes/new">
            <Plus className="mr-2 h-5 w-5" />
            Request New Quote
          </Link>
        </Button>

        {/* Alerts */}
        {actionSuccess && (
          <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600">{actionSuccess}</AlertDescription>
          </Alert>
        )}
        {actionError && (
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-600">{actionError}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending_action">Action Needed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Quotes List */}
        <div className="space-y-3">
          {filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No quotes found</p>
                <Button variant="link" asChild>
                  <Link href="/customer/quotes/new">Request your first quote</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredQuotes.map((quote) => (
              <Card key={quote.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-mono">
                        {quote.quote_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Route */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">
                      {typeof quote.origin_address === 'object'
                        ? (quote.origin_address as Record<string, string>).name ||
                          (quote.origin_address as Record<string, string>).city
                        : 'Unknown'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {typeof quote.destination_address === 'object'
                        ? (quote.destination_address as Record<string, string>).name ||
                          (quote.destination_address as Record<string, string>).city
                        : 'Unknown'}
                    </span>
                  </div>

                  {/* Cargo Details */}
                  <div className="text-sm text-muted-foreground">
                    {quote.cargo_description.substring(0, 50)}
                    {quote.cargo_description.length > 50 ? '...' : ''} • {quote.weight_kg} kg
                  </div>

                  {/* Pricing */}
                  {quote.total_amount && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">
                          {quote.currency} {quote.total_amount.toLocaleString()}
                        </span>
                        {quote.quote_valid_until && (
                          <span className="text-xs text-muted-foreground">
                            Valid until {new Date(quote.quote_valid_until).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {quote.status === 'quoted' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => handleAccept(quote.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReject(quote.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  )}

                  {quote.status === 'accepted' && quote.converted_shipment_id && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/customer/shipments/${quote.converted_shipment_id}`)}
                    >
                      View Shipment
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
