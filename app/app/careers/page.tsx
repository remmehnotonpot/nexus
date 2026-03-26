"use client";

import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight,
  Users,
  Heart,
  GraduationCap,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive medical, dental, and vision coverage for you and your family.',
  },
  {
    icon: Clock,
    title: 'Flexible Work',
    description: 'Hybrid work options and flexible scheduling to support work-life balance.',
  },
  {
    icon: GraduationCap,
    title: 'Learning & Development',
    description: 'Continuous learning with tuition reimbursement and professional certifications.',
  },
  {
    icon: Globe,
    title: 'Global Opportunities',
    description: 'Work across borders with international transfer and travel opportunities.',
  },
];

const openPositions = [
  {
    title: 'Senior Logistics Coordinator',
    department: 'Operations',
    location: 'Rotterdam, Netherlands',
    type: 'Full-time',
    description: 'Lead end-to-end shipment coordination for key enterprise accounts.',
  },
  {
    title: 'Customs Broker',
    department: 'Compliance',
    location: 'New York, USA',
    type: 'Full-time',
    description: 'Handle complex customs clearance for international shipments.',
  },
  {
    title: 'Supply Chain Analyst',
    department: 'Analytics',
    location: 'Singapore',
    type: 'Full-time',
    description: 'Analyze supply chain data to optimize efficiency and reduce costs.',
  },
  {
    title: 'Warehouse Manager',
    department: 'Operations',
    location: 'Dubai, UAE',
    type: 'Full-time',
    description: 'Oversee warehouse operations and team management.',
  },
  {
    title: 'Account Executive',
    department: 'Sales',
    location: 'London, UK',
    type: 'Full-time',
    description: 'Develop new business relationships and manage key accounts.',
  },
  {
    title: 'Software Engineer',
    department: 'Technology',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build cutting-edge logistics technology solutions.',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
            alt="Team collaboration"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-3xl">
            <Badge className="mb-4 bg-sky-500/20 text-sky-400 border-sky-500/30">
              Join Our Team
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Build Your Career With{' '}
              <span className="text-gradient">Swish Portal</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Join a global team that&apos;s transforming the logistics industry. 
              We&apos;re always looking for passionate individuals who want to make an impact.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
                View Open Positions
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8" staggerDelay={0.1}>
            {[
              { value: '3,500+', label: 'Team Members' },
              { value: '45', label: 'Countries' },
              { value: '25%', label: 'Internal Promotions' },
              { value: '4.5', label: 'Employee Rating' },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-sky-500 mb-2">{stat.value}</div>
                  <div className="text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              Why Join Us
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Benefits & Perks
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We take care of our team so they can take care of our customers.
            </p>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
            {benefits.map((benefit) => (
              <StaggerItem key={benefit.title}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <benefit.icon className="w-7 h-7 text-sky-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                  alt="Office culture"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div>
                <Badge className="mb-4 bg-sky-500/20 text-sky-400 border-sky-500/30">
                  Our Culture
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Work Where You Matter
                </h2>
                <div className="space-y-4">
                  {[
                    'Collaborative and inclusive environment',
                    'Opportunities for growth and advancement',
                    'Global exposure and diverse teams',
                    'Innovation-driven mindset',
                    'Work-life balance prioritized',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-sky-500 flex-shrink-0" />
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              Open Positions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Join Our Team
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Find your next career opportunity at Swish Portal.
            </p>
          </FadeIn>

          <StaggerContainer className="space-y-4" staggerDelay={0.08}>
            {openPositions.map((position) => (
              <StaggerItem key={position.title}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                          {position.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                          {position.description}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {position.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {position.type}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" className="shrink-0">
                        Apply Now
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
