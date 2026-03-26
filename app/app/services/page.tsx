"use client";

import { 
  Ship, 
  Plane, 
  Truck, 
  Train, 
  Warehouse, 
  ClipboardCheck,
  Globe,
  Package,
  BarChart3,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const services = [
  {
    id: 'freight',
    icon: Ship,
    title: 'Ocean Freight',
    subtitle: 'FCL & LCL Solutions',
    description: 'Full container load and less-than-container load shipping services connecting major ports across 180+ countries. Our long-term partnerships with leading carriers ensure competitive rates and reliable schedules.',
    features: [
      'Direct contracts with top 20 global carriers',
      'Real-time container tracking',
      'Door-to-door delivery options',
      'Specialized handling for hazardous and oversized cargo'
    ],
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&q=80'
  },
  {
    id: 'air',
    icon: Plane,
    title: 'Air Freight',
    subtitle: 'Express & Standard Cargo',
    description: 'Time-critical shipments delivered with precision. From next-flight-out emergencies to consolidated air freight, we optimize speed and cost for your urgent cargo needs.',
    features: [
      'Same-day and next-day delivery options',
      'Charter services for oversized cargo',
      'Temperature-controlled solutions',
      'IATA-certified dangerous goods handling'
    ],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80'
  },
  {
    id: 'road',
    icon: Truck,
    title: 'Road Transport',
    subtitle: 'FTL & LTL Services',
    description: 'Comprehensive ground transportation across North America, Europe, and key Asian corridors. Our dedicated fleet and partner network ensure seamless first and last-mile delivery.',
    features: [
      'Full and partial truckload options',
      'Cross-border expertise (US/Canada/Mexico, EU)',
      'GPS-tracked fleet',
      'Express courier for time-sensitive deliveries'
    ],
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80'
  },
  {
    id: 'rail',
    icon: Train,
    title: 'Rail Freight',
    subtitle: 'Intermodal Solutions',
    description: 'Cost-effective long-haul transportation with reduced carbon footprint. Ideal for bulk commodities, containers, and project cargo across continental networks.',
    features: [
      'Access to major rail networks in North America and Europe',
      'Intermodal container solutions',
      'Bulk commodity transport',
      'Environmentally friendly alternative to road freight'
    ],
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80'
  },
  {
    id: 'warehousing',
    icon: Warehouse,
    title: 'Warehousing',
    subtitle: 'Storage & Distribution',
    description: 'Strategically located fulfillment centers enabling faster delivery to your customers. From raw materials storage to finished goods distribution, we scale with your business.',
    features: [
      '2.5 million sq ft of warehouse space globally',
      ' bonded and temperature-controlled facilities',
      'Pick, pack, and ship fulfillment',
      'Inventory management with WMS integration'
    ],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80'
  },
  {
    id: 'customs',
    icon: ClipboardCheck,
    title: 'Customs Brokerage',
    subtitle: 'Compliance & Clearance',
    description: 'Navigate complex international trade regulations with our licensed customs brokers. We handle documentation, duty optimization, and compliance to prevent costly delays.',
    features: [
      'Licensed brokers in 40+ countries',
      'HS code classification and valuation',
      'Duty drawback and tariff engineering',
      'AEO and C-TPAT certified processes'
    ],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80'
  }
];

const additionalServices = [
  {
    icon: Globe,
    title: 'Supply Chain Consulting',
    description: 'Data-driven optimization of your logistics network. We analyze your supply chain to identify cost savings, reduce lead times, and improve resilience.'
  },
  {
    icon: Package,
    title: 'E-Commerce Logistics',
    description: 'End-to-end fulfillment solutions for online retailers. From receiving inventory to managing returns, we handle the logistics so you can focus on growth.'
  },
  {
    icon: BarChart3,
    title: 'Project Cargo',
    description: 'Heavy lift and oversized cargo expertise for industrial projects. Engineering, planning, and execution of complex multimodal movements.'
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80"
            alt="Global logistics"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Logistics Solutions for the{' '}
              <span className="text-gradient">Modern Supply Chain</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              From factory floor to customer door, we design and execute supply chain 
              solutions that drive efficiency, reduce costs, and improve customer satisfaction.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
                Get a Quote
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Speak to an Expert
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Core Services
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Multimodal transportation solutions tailored to your cargo requirements, 
              budget constraints, and delivery timelines.
            </p>
          </div>

          <div className="space-y-24">
            {services.map((service, index) => (
              <div 
                key={service.id} 
                id={service.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-sm font-medium mb-4">
                    <service.icon className="w-4 h-4" />
                    {service.subtitle}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <Button className="bg-sky-500 hover:bg-sky-600">
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className={`relative ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-sky-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <service.icon className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Specialized Solutions
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Beyond transportation, we offer value-added services that optimize 
              your entire supply chain operation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalServices.map((service) => (
              <Card key={service.title} className="group hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-6 group-hover:bg-sky-500 transition-colors">
                    <service.icon className="w-7 h-7 text-sky-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80"
                alt="Logistics team"
                className="w-full h-full object-cover opacity-20"
              />
            </div>
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Optimize Your Supply Chain?
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
                Our logistics experts are ready to analyze your current operations 
                and design a solution that delivers measurable ROI.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
                    Request a Consultation
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/tracking">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Track a Shipment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
