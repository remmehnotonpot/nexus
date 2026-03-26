"use client";

import { 
  Search, 
  Package, 
  FileText, 
  Phone,
  MessageCircle,
  BookOpen,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import Link from 'next/link';

const helpCategories = [
  {
    icon: Package,
    title: 'Tracking & Shipments',
    description: 'Track packages, understand delivery status, and manage shipments.',
    articles: 24,
  },
  {
    icon: FileText,
    title: 'Documentation',
    description: 'Learn about required documents, customs forms, and compliance.',
    articles: 18,
  },
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'New to Swish Portal? Start here for account setup and basics.',
    articles: 12,
  },
  {
    icon: Phone,
    title: 'Account & Billing',
    description: 'Manage your account, invoices, payments, and subscription.',
    articles: 15,
  },
];

const popularArticles = [
  'How do I track my shipment?',
  'What documents do I need for international shipping?',
  'How do I file a claim for damaged goods?',
  'What are your shipping rates?',
  'How do I schedule a pickup?',
  'Can I change the delivery address?',
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&q=80"
            alt="Help center"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Badge className="mb-4 bg-sky-500/20 text-sky-400 border-sky-500/30">
              Help Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How Can We Help?
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Search our knowledge base or browse categories below.
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search for answers..."
                className="h-14 pl-12 pr-4 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 text-lg"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Browse by Category
            </h2>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {helpCategories.map((category) => (
              <StaggerItem key={category.title}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4 group-hover:bg-sky-500 transition-colors">
                      <category.icon className="w-6 h-6 text-sky-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {category.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                      {category.description}
                    </p>
                    <p className="text-sm text-sky-500">{category.articles} articles</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Popular Articles
            </h2>
          </FadeIn>

          <StaggerContainer className="space-y-3" staggerDelay={0.05}>
            {popularArticles.map((article) => (
              <StaggerItem key={article}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 group-hover:text-sky-500 transition-colors">
                        {article}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-500" />
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <MessageCircle className="w-16 h-16 text-sky-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Can not find what you are looking for? Our support team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
                  Contact Support
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                +1 (800) SWISH-GL
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
