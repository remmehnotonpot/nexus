"use client";

import { 
  Handshake, 
  Globe, 
  Shield, 
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';

const partnerTypes = [
  {
    icon: Globe,
    title: 'Carrier Partners',
    description: 'Ocean, air, and ground carriers that extend our global reach.',
    count: '500+',
  },
  {
    icon: Building2,
    title: 'Technology Partners',
    description: 'Software and platform providers that power our digital solutions.',
    count: '50+',
  },
  {
    icon: Shield,
    title: 'Compliance Partners',
    description: 'Customs brokers and regulatory experts worldwide.',
    count: '100+',
  },
  {
    icon: TrendingUp,
    title: 'Enterprise Clients',
    description: 'Fortune 500 and growth companies that trust us daily.',
    count: '2,000+',
  },
];

const benefits = [
  'Access to global markets and customers',
  'Technology integration and API connectivity',
  'Joint marketing and co-selling opportunities',
  'Training and certification programs',
  'Dedicated partner support team',
  'Performance incentives and rewards',
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80"
            alt="Partnership"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-3xl">
            <Badge className="mb-4 bg-sky-500/20 text-sky-400 border-sky-500/30">
              Partnership
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Partner With{' '}
              <span className="text-gradient">Swish Portal</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Join our global network of carriers, technology providers, and logistics 
              professionals. Together, we deliver excellence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
                Become a Partner
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              Our Network
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Partnership Ecosystem
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We collaborate with industry leaders to deliver comprehensive 
              logistics solutions worldwide.
            </p>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
            {partnerTypes.map((type) => (
              <StaggerItem key={type.title}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <type.icon className="w-7 h-7 text-sky-500" />
                    </div>
                    <div className="text-3xl font-bold text-sky-500 mb-2">{type.count}</div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {type.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div>
                <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                  Why Partner
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Benefits of Partnership
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                  Joining the Swish Portal partner network opens doors to new 
                  opportunities and growth.
                </p>
                <StaggerContainer className="space-y-4" staggerDelay={0.1}>
                  {benefits.map((benefit) => (
                    <StaggerItem key={benefit}>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80"
                  alt="Business handshake"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Handshake className="w-16 h-16 text-sky-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Partner With Us?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Whether you are a carrier, technology provider, or logistics professional, 
              we would love to explore how we can work together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
                Apply to Partner
              </Button>
              <Button size="lg" variant="outline">
                Contact Partnership Team
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
