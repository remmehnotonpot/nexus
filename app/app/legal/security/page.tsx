"use client";

import { Shield, Lock, Server, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';

const securityFeatures = [
  {
    icon: Lock,
    title: 'Encryption',
    description: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256.',
  },
  {
    icon: Server,
    title: 'Infrastructure Security',
    description: 'Our infrastructure is hosted in SOC 2 Type II certified data centers.',
  },
  {
    icon: Eye,
    title: 'Access Control',
    description: 'Role-based access control with multi-factor authentication required.',
  },
  {
    icon: Shield,
    title: 'Monitoring',
    description: '24/7 security monitoring and automated threat detection.',
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-20">
      {/* Hero */}
      <section className="relative pt-20 pb-16 bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Badge className="mb-4 bg-sky-500/20 text-sky-400 border-sky-500/30">
              Trust & Safety
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Security at Swish Portal
            </h1>
            <p className="text-xl text-slate-400">
              Protecting your data and shipments is our top priority
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Our Security Measures
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We implement industry-leading security practices to protect your data 
              and ensure business continuity.
            </p>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 gap-8" staggerDelay={0.15}>
            {securityFeatures.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-6">
                      <feature.icon className="w-7 h-7 text-sky-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Certifications & Compliance
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {['ISO 27001', 'SOC 2 Type II', 'GDPR Compliant'].map((cert) => (
              <Card key={cert} className="text-center">
                <CardContent className="p-6">
                  <Shield className="w-10 h-10 text-sky-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">{cert}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reporting */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Report a Security Issue
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              If you discover a security vulnerability, please report it to our 
              security team immediately. We take all reports seriously and will 
              investigate promptly.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Email: security@swishportal.com
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
