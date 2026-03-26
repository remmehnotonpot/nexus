"use client";

import { 
  Code, 
  Key, 
  Webhook, 
  FileJson,
  Copy,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';

const features = [
  {
    icon: Key,
    title: 'API Keys',
    description: 'Secure authentication with API key management.',
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'Real-time event notifications for shipment updates.',
  },
  {
    icon: FileJson,
    title: 'RESTful API',
    description: 'JSON-based REST API with comprehensive endpoints.',
  },
  {
    icon: Code,
    title: 'SDKs',
    description: 'Official SDKs for Python, Node.js, and PHP.',
  },
];

const endpoints = [
  {
    method: 'GET',
    path: '/v1/shipments/{id}',
    description: 'Retrieve shipment details by tracking number',
  },
  {
    method: 'POST',
    path: '/v1/shipments',
    description: 'Create a new shipment',
  },
  {
    method: 'GET',
    path: '/v1/shipments/{id}/tracking',
    description: 'Get real-time tracking updates',
  },
  {
    method: 'GET',
    path: '/v1/rates',
    description: 'Calculate shipping rates',
  },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=80"
            alt="Code"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-3xl">
            <Badge className="mb-4 bg-sky-500/20 text-sky-400 border-sky-500/30">
              Developer Resources
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Swish Portal{' '}
              <span className="text-gradient">API</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Integrate logistics capabilities into your applications with our 
              powerful REST API. Build custom solutions and automate workflows.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
                Get API Key
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                View Documentation
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need
            </h2>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <feature.icon className="w-7 h-7 text-sky-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              Endpoints
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Core API Endpoints
            </h2>
          </FadeIn>

          <StaggerContainer className="space-y-4" staggerDelay={0.1}>
            {endpoints.map((endpoint) => (
              <StaggerItem key={endpoint.path}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <Badge 
                        variant={endpoint.method === 'GET' ? 'default' : 'secondary'}
                        className="w-fit"
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded font-mono">
                        {endpoint.path}
                      </code>
                      <span className="text-slate-600 dark:text-slate-400 sm:ml-auto">
                        {endpoint.description}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Quick Start Example</h3>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-slate-300 font-mono">
{`curl -X GET "https://api.swishportal.com/v1/shipments/SW-123456" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"`}
                  </code>
                </pre>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <CheckCircle2 className="w-16 h-16 text-sky-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Building?
            </h2>
            <p className="text-slate-400 mb-8">
              Get your API key and start integrating today. Free tier includes 
              1,000 requests per month.
            </p>
            <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
