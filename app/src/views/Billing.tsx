"use client";

import { useState } from 'react';
import { 
  CreditCard, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Invoice } from '@/types';

// Invoice status type derived from Invoice table
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// Mock data - using Partial<Invoice> to allow optional fields for demo
const mockInvoices: Partial<Invoice>[] = [
  {
    id: '1',
    invoice_number: 'INV-2026-001',
    customer_id: 'user-1',
    amount: 4850.00,
    total_amount: 4850.00,
    currency: 'USD',
    status: 'paid',
    issue_date: '2026-03-01',
    due_date: '2026-03-15',
    paid_date: '2026-03-10',
    notes: 'Ocean freight - Shanghai to Los Angeles',
    created_at: '2026-03-01',
  },
  {
    id: '2',
    invoice_number: 'INV-2026-002',
    customer_id: 'user-1',
    amount: 3200.00,
    total_amount: 3200.00,
    currency: 'USD',
    status: 'sent',
    issue_date: '2026-03-10',
    due_date: '2026-03-24',
    notes: 'Air freight - Dubai to London',
    created_at: '2026-03-10',
  },
  {
    id: '3',
    invoice_number: 'INV-2026-003',
    customer_id: 'user-1',
    amount: 7800.00,
    total_amount: 7800.00,
    currency: 'USD',
    status: 'overdue',
    issue_date: '2026-02-15',
    due_date: '2026-03-01',
    notes: 'Rail freight - Hong Kong to Hamburg',
    created_at: '2026-02-15',
  },
  {
    id: '4',
    invoice_number: 'INV-2026-004',
    customer_id: 'user-1',
    amount: 1250.00,
    total_amount: 1250.00,
    currency: 'USD',
    status: 'draft',
    issue_date: '2026-03-18',
    notes: 'Warehousing - March 2026',
    created_at: '2026-03-18',
  },
  {
    id: '5',
    invoice_number: 'INV-2026-005',
    customer_id: 'user-1',
    amount: 5600.00,
    total_amount: 5600.00,
    currency: 'USD',
    status: 'paid',
    issue_date: '2026-02-01',
    due_date: '2026-02-15',
    paid_date: '2026-02-12',
    notes: 'Ocean freight - Rotterdam to New York',
    created_at: '2026-02-01',
  },
];

const paymentMethods = [
  { id: '1', type: 'visa', last4: '4242', expiry: '12/27', default: true },
  { id: '2', type: 'mastercard', last4: '8888', expiry: '08/26', default: false },
];

// Status badge component
const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const configs: Record<InvoiceStatus, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Draft', icon: FileText },
    sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sent', icon: Mail },
    paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid', icon: CheckCircle },
    overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue', icon: AlertCircle },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled', icon: FileText },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Invoice row component
const InvoiceRow = ({ invoice }: { invoice: Partial<Invoice> }) => {
  const status = invoice.status as InvoiceStatus | null | undefined;
  const notes = invoice.notes;
  const issueDate = invoice.issue_date;
  
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="font-mono font-medium text-slate-900 dark:text-white">
              {invoice.invoice_number}
            </p>
            <p className="text-xs text-slate-500">{notes || '—'}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        {status ? <InvoiceStatusBadge status={status} /> : <span className="text-slate-400">—</span>}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{issueDate ? new Date(issueDate).toLocaleDateString() : '—'}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="font-medium text-slate-900 dark:text-white">
          ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-slate-500">{invoice.currency}</p>
      </td>
      <td className="py-4 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              Download PDF
            </DropdownMenuItem>
            {invoice.status === 'sent' && (
              <DropdownMenuItem>
                Pay Now
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

// Main Billing Page
const Billing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter invoices
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.notes?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const status = invoice.status;
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'unpaid' ? (status === 'sent' || status === 'overdue') :
      activeTab === 'paid' ? status === 'paid' :
      activeTab === 'overdue' ? status === 'overdue' : true;

    return matchesSearch && matchesTab;
  });

  // Stats
  const stats = {
    totalOutstanding: mockInvoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + (i.amount || 0), 0),
    totalPaid: mockInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.amount || 0), 0),
    overdueAmount: mockInvoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + (i.amount || 0), 0),
    invoiceCount: mockInvoices.length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Billing & Invoices</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your payments and invoices</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Outstanding</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    ${stats.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Paid (YTD)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    ${stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Overdue</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    ${stats.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Invoices</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats.invoiceCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Invoices */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Search invoices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full max-w-md">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Invoices Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Invoice</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Issued</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Due</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((invoice) => (
                        <InvoiceRow key={invoice.id} invoice={invoice} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredInvoices.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No invoices found
                    </h3>
                    <p className="text-slate-500">Try adjusting your search or filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Payment Methods & Info */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      className={`p-4 rounded-lg border ${
                        method.default 
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white capitalize">
                              {method.type} •••• {method.last4}
                            </p>
                            <p className="text-xs text-slate-500">Expires {method.expiry}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Billing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Company Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">TechFlow Industries Ltd.</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Billing Address</p>
                    <p className="text-slate-700 dark:text-slate-300">
                      1234 Innovation Drive<br />
                      Suite 500<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Tax ID</p>
                    <p className="font-medium text-slate-900 dark:text-white">US-12-3456789</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Edit Information
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Need help with billing?</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Our billing support team is available 24/7 to assist you.
                </p>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full gap-2">
                    <Mail className="w-4 h-4" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="w-full gap-2 border-slate-600">
                    <Phone className="w-4 h-4" />
                    Call Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
