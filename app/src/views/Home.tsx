"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  CheckCircle, 
  Globe, 
  Ship, 
  Plane, 
  Truck, 
  Train,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Package,
  BarChart3,
  Award,
  Star,
  Quote,
  ChevronRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Hero Section
const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/tracking/${trackingNumber.trim()}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80"
          alt="Container ship at sea"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-slide-up">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Global Logistics Leader Since 2001
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              CONNECT YOUR BUSINESS TO A{' '}
              <span className="text-gradient">WORLD OF POSSIBILITIES</span>
            </h1>
            
            <p className="text-lg text-slate-300 max-w-xl">
              End-to-end logistics solutions that power global trade. Real-time tracking, 
              seamless customs clearance, and guaranteed delivery across 180+ countries.
            </p>

            {/* Tracking search */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter tracking number (e.g., NXS-78439201)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="h-14 pl-5 pr-4 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 text-base"
                />
              </div>
              <Button 
                type="submit"
                size="lg"
                className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Track Shipment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {[
                { value: '50K+', label: 'Shipments Daily' },
                { value: '180+', label: 'Countries' },
                { value: '99.7%', label: 'On-Time Delivery' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Feature cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { icon: Ship, label: 'Ocean Freight', desc: 'FCL & LCL solutions' },
              { icon: Plane, label: 'Air Freight', desc: 'Express & cargo' },
              { icon: Truck, label: 'Road Transport', desc: 'FTL & LTL services' },
              { icon: Train, label: 'Rail Freight', desc: 'Intermodal solutions' },
            ].map((item) => (
              <Card 
                key={item.label}
                className="bg-white/10 backdrop-blur-md border-white/10 hover:bg-white/20 transition-all cursor-pointer group animate-fade-in"
              >
                <CardContent className="p-6">
                  <item.icon className="w-10 h-10 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-1">{item.label}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

// Why Choose Us Section
const WhyChooseUsSection = () => {
  const features = [
    {
      icon: Globe,
      title: 'Supply Chain Solutions',
      description: 'Integrated end-to-end supply chain management with AI-powered optimization and predictive analytics.',
    },
    {
      icon: Package,
      title: 'End-to-End Transportation',
      description: 'Multimodal freight solutions spanning ocean, air, road, and rail with seamless interchanges.',
    },
    {
      icon: TrendingUp,
      title: 'Connect Logistics',
      description: 'Global network of 500+ logistics partners ensuring last-mile delivery in every corner of the world.',
    },
  ];

  return (
    <section id="services" className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            Our Expertise
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Traders Choose Us
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We combine cutting-edge technology with decades of logistics expertise 
            to deliver unparalleled service quality.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.title}
              className="group hover:-translate-y-2 transition-all duration-300 border-slate-200 dark:border-slate-800"
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <feature.icon className="w-8 h-8 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// About Section
const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80"
                alt="Modern logistics warehouse"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            </div>
            
            {/* Experience badge */}
            <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white p-6 rounded-2xl shadow-xl">
              <div className="text-4xl font-bold">25+</div>
              <div className="text-sm">Years of Excellence</div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              About Nexus Global
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              25 Years of Excellence in Global Logistics
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400">
              Since 2001, Nexus Global Logistics has been at the forefront of international 
              trade facilitation. We believe that real change is possible when logistics works 
              in harmony with technology.
            </p>
            
            <p className="text-slate-600 dark:text-slate-400">
              Our commitment to innovation has made us the preferred partner for Fortune 500 
              companies and emerging enterprises alike. With a presence in over 180 countries, 
              we handle more than 50,000 shipments daily.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { value: '500+', label: 'Global Partners' },
                { value: '2M+', label: 'Shipments Annually' },
                { value: '99.7%', label: 'Customer Satisfaction' },
                { value: 'ISO', label: '9001:2015 Certified' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{item.value}</div>
                    <div className="text-sm text-slate-500">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <Button className="mt-6 bg-orange-500 hover:bg-orange-600">
              Learn More About Us
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Services Grid Section
const ServicesGridSection = () => {
  const services = [
    {
      title: 'Quality Management System',
      description: 'ISO 9001:2015 certified processes ensuring consistent service quality across all operations.',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80',
    },
    {
      title: 'E-Commerce Logistics Solution',
      description: 'Dedicated fulfillment centers and last-mile delivery optimized for online retail.',
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80',
    },
    {
      title: 'Aftermarket Logistics',
      description: 'Reverse logistics, spare parts distribution, and warranty management services.',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80',
    },
    {
      title: 'Control Tower Operations',
      description: 'Real-time visibility and control tower operations for supply chain oversight.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    },
  ];

  return (
    <section id="solutions" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
            Our Solutions
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comprehensive Logistics Services
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From warehousing to final delivery, we provide end-to-end solutions 
            tailored to your business needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
            >
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {service.description}
                </p>
              </div>

              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Safety Section
const SafetySection = () => {
  const features = [
    { icon: Shield, title: 'Integrity Properties', desc: 'Tamper-evident sealing and chain of custody documentation.' },
    { icon: Users, title: 'Long-Term Partnerships', desc: 'Dedicated account managers for enterprise clients.' },
    { icon: Award, title: 'Challenging Staff', desc: 'Certified logistics professionals with industry expertise.' },
    { icon: Lock, title: 'Privacy & Safety', desc: 'GDPR-compliant data handling and cargo insurance.' },
    { icon: CheckCircle, title: 'Quality Services', desc: 'Six Sigma methodology applied to all processes.' },
    { icon: Clock, title: 'Continuous Support', desc: '24/7 monitoring and proactive issue resolution.' },
    { icon: BarChart3, title: 'Innovation Solutions', desc: 'Blockchain-enabled documentation and IoT tracking.' },
    { icon: TrendingUp, title: 'Operational Excellence', desc: 'SLA-backed performance guarantees.' },
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            Our Commitment
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Your Cargo Is Safe With Us
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We implement industry-leading security measures to ensure your shipments 
            arrive safely and on time, every time.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all cursor-pointer"
            >
              <feature.icon className="w-8 h-8 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Lock icon component
const Lock = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Nexus Global has transformed our supply chain operations. Their real-time visibility platform and proactive communication have reduced our logistics costs by 23% while improving delivery times. They're not just a vendor—they're a strategic partner.",
      author: "Cameron Williamson",
      title: "VP of Supply Chain, TechFlow Industries",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    },
    {
      quote: "The level of transparency and control Nexus provides is unmatched. We can track every shipment in real-time, and their predictive analytics have helped us optimize our inventory management significantly.",
      author: "Sarah Chen",
      title: "Operations Director, GlobalRetail Inc.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    },
    {
      quote: "Working with Nexus has been a game-changer for our international expansion. Their global network and local expertise have made entering new markets seamless and cost-effective.",
      author: "Michael Roberts",
      title: "CEO, ExpandGlobal Ltd.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What They Say About Us
          </h2>
        </div>

        <div className="relative">
          <Quote className="absolute -top-4 -left-4 w-16 h-16 text-orange-500/20" />
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12">
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
              &ldquo;{testimonials[activeIndex].quote}&rdquo;
            </p>
            
            <div className="flex items-center gap-4">
              <img
                src={testimonials[activeIndex].image}
                alt={testimonials[activeIndex].author}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-white">
                  {testimonials[activeIndex].author}
                </div>
                <div className="text-sm text-slate-400">
                  {testimonials[activeIndex].title}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeIndex 
                    ? 'bg-orange-500 w-8' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Partners Section
const PartnersSection = () => {
  const partners = [
    'Maersk', 'DHL', 'FedEx', 'UPS', 'CMA CGM', 'MSC', 
    'Hapag-Lloyd', 'COSCO', 'Evergreen', 'Yang Ming'
  ];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Trusted by Industry Leaders
          </h3>
        </div>

        <div className="relative">
          <div className="flex gap-12 animate-marquee">
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-8 py-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm grayscale hover:grayscale-0 transition-all"
              >
                <span className="text-xl font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Contact Section
const ContactSection = () => {
  return (
    <section id="contact" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <Badge className="mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
              Get In Touch
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Request a Call Back
            </h2>
            <p className="text-slate-400 mb-8">
              Our logistics experts are ready to discuss your shipping needs. 
              Fill out the form and we&apos;ll get back to you within 24 hours.
            </p>

            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Input
                  type="email"
                  placeholder="Business Email"
                  className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Input
                  placeholder="Company Name"
                  className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <Button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                Request Callback
              </Button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: 'Phone', value: '+1 (800) NEXUS-GL' },
                  { icon: Mail, label: 'Email', value: 'contact@nexuslogistics.com' },
                  { icon: MapPin, label: 'Address', value: '1211 Geneva, Switzerland' },
                  { icon: Clock, label: 'Office Hours', value: 'Mon-Fri: 8:00 AM - 6:00 PM CET' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">{item.label}</div>
                      <div className="text-white">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-xl overflow-hidden h-48 bg-slate-800 relative">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80"
                alt="Location map"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Advertisement Banner Component
const AdBanner = () => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-white" />
            <span className="text-white font-medium">
              New Customer Offer: Get 20% off your first international shipment!
            </span>
          </div>
          <Button variant="secondary" size="sm" className="bg-white text-orange-600 hover:bg-slate-100">
            Learn More
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Home Page
const Home = () => {
  return (
    <div className="min-h-screen">
      <AdBanner />
      <HeroSection />
      <WhyChooseUsSection />
      <AboutSection />
      <ServicesGridSection />
      <SafetySection />
      <TestimonialsSection />
      <PartnersSection />
      <ContactSection />
    </div>
  );
};

export default Home;
