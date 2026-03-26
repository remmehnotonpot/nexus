"use client";

import { 
  Leaf, 
  Globe, 
  Zap, 
  TrendingDown,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';

const initiatives = [
  {
    icon: Leaf,
    title: 'Carbon Neutral Operations',
    description: 'Committed to achieving carbon neutrality across all operations by 2030 through renewable energy and offset programs.',
  },
  {
    icon: Zap,
    title: 'Electric Fleet Transition',
    description: 'Converting 50% of our ground transport fleet to electric vehicles by 2028.',
  },
  {
    icon: TrendingDown,
    title: 'Emissions Reduction',
    description: 'Reduced CO2 emissions per shipment by 35% since 2020 through route optimization.',
  },
  {
    icon: Globe,
    title: 'Sustainable Packaging',
    description: 'Partnering with customers to implement recyclable and biodegradable packaging solutions.',
  },
];

const goals = [
  '50% reduction in carbon emissions by 2030',
  '100% renewable energy in all facilities by 2028',
  'Zero waste to landfill certification',
  'ISO 14001 Environmental Management certification',
  'Sustainable aviation fuel partnerships',
  'Ocean freight decarbonization initiatives',
];

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1920&q=80"
            alt="Sustainable energy"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-3xl">
            <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
              Our Commitment
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Sustainable{' '}
              <span className="text-gradient">Logistics</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              We believe that responsible logistics means caring for the planet while 
              delivering for our customers. Our sustainability initiatives are built 
              into every aspect of our operations.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8" staggerDelay={0.1}>
            {[
              { value: '35%', label: 'Emissions Reduced' },
              { value: '40%', label: 'Renewable Energy' },
              { value: '2030', label: 'Carbon Neutral Target' },
              { value: '100%', label: 'ISO 14001 Certified' },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2">{stat.value}</div>
                  <div className="text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Initiatives */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Our Initiatives
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Building a Greener Future
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From our warehouses to your doorstep, we are implementing 
              sustainable practices at every step.
            </p>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 gap-8" staggerDelay={0.15}>
            {initiatives.map((initiative) => (
              <StaggerItem key={initiative.title}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                      <initiative.icon className="w-7 h-7 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {initiative.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {initiative.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Goals Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div>
                <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
                  2030 Goals
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Our Sustainability Roadmap
                </h2>
                <p className="text-slate-400 mb-8">
                  Ambitious targets drive meaningful change. Here is what we are working 
                  toward over the next decade.
                </p>
                <StaggerContainer className="space-y-4" staggerDelay={0.1}>
                  {goals.map((goal) => (
                    <StaggerItem key={goal}>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-300">{goal}</span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80"
                  alt="Sustainable logistics"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Partner With Us for Sustainable Logistics
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Learn how our green logistics solutions can help reduce your 
              supply chain carbon footprint.
            </p>
            <Button size="lg" className="bg-green-500 hover:bg-green-600">
              Contact Our Team
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
