"use client";

import { 
  Target, 
  Eye, 
  Users, 
  Award,
  TrendingUp,
  Shield,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const stats = [
  { value: '25+', label: 'Years in Business', suffix: '' },
  { value: '180', label: 'Countries Served', suffix: '+' },
  { value: '2.5M', label: 'Sq Ft Warehouse Space', suffix: '' },
  { value: '50K', label: 'Shipments Daily', suffix: '+' },
];

const values = [
  {
    icon: Target,
    title: 'Customer First',
    description: 'Every decision we make starts with understanding our customers\' needs. Your success is our success, and we measure ourselves by the value we create for your business.'
  },
  {
    icon: Shield,
    title: 'Integrity',
    description: 'We do what we say we\'ll do. Transparent pricing, honest communication, and ethical business practices form the foundation of every relationship we build.'
  },
  {
    icon: TrendingUp,
    title: 'Continuous Improvement',
    description: 'The logistics landscape evolves constantly. We invest in technology, training, and process optimization to stay ahead of industry trends and deliver better results.'
  },
  {
    icon: Heart,
    title: 'People Matter',
    description: 'From our warehouse teams to our executives, we foster a culture where people feel valued and empowered. Happy employees create exceptional customer experiences.'
  }
];

const leadership = [
  {
    name: 'Marcus Chen',
    role: 'Chief Executive Officer',
    bio: 'Marcus joined Swish Portal in 2005 and has led our expansion into 40+ markets. Previously, he spent 15 years at Maersk Line in various operational and commercial roles.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80'
  },
  {
    name: 'Sarah Williams',
    role: 'Chief Operating Officer',
    bio: 'Sarah oversees our global operations network. She previously managed supply chain operations for Amazon\'s European fulfillment centers and holds an MBA from INSEAD.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'
  },
  {
    name: 'David Okafor',
    role: 'Chief Technology Officer',
    bio: 'David leads our digital transformation initiatives. Before joining Swish Portal, he was a senior architect at SAP\'s supply chain division and holds 12 patents in logistics technology.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Chief Commercial Officer',
    bio: 'Elena drives our global sales and marketing strategy. She previously led the freight forwarding division at Kuehne+Nagel in Latin America and speaks four languages fluently.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80'
  }
];

const certifications = [
  'ISO 9001:2015 Quality Management',
  'ISO 14001:2015 Environmental Management',
  'AEO Authorized Economic Operator',
  'C-TPAT Certified',
  'IATA Cargo Agent',
  'FIATA Member'
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-sm font-medium mb-6">
                About Swish Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Building the Future of{' '}
                <span className="text-gradient">Global Trade</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                Founded in 2001 in Geneva, Switzerland, Swish Portal began as a regional 
                freight forwarder serving European manufacturers. Today, we operate one of 
                the most connected logistics networks in the world, moving over 50,000 
                shipments daily across 180 countries.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Our growth hasn\'t changed who we are. We remain privately owned, 
                fiercely independent, and committed to the principles that guided our 
                founders: integrity, innovation, and an unwavering focus on customer success.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button className="bg-sky-500 hover:bg-sky-600">
                    Work With Us
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline">
                    Explore Services
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                  alt="Swish Portal team"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-sky-500 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-4xl font-bold">25+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-sky-500 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="bg-sky-50 dark:bg-sky-900/10 border-sky-100 dark:border-sky-900/30">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center mb-6">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Our Vision
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  To be the most trusted logistics partner for businesses expanding 
                  globally—known for reliability, innovation, and a relentless commitment 
                  to simplifying international trade.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-white dark:text-slate-900" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Our Mission
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  We connect businesses to opportunities by making global logistics 
                  predictable, transparent, and efficient—enabling our customers to focus 
                  on what they do best.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              What We Stand For
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our values aren\'t just words on a wall—they guide every decision we make 
              and every interaction we have.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-sky-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section id="leadership" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Leadership Team
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Experienced professionals with deep expertise in logistics, technology, 
              and global trade.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((person) => (
              <div key={person.name} className="group">
                <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-slate-100">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {person.name}
                </h3>
                <p className="text-sky-500 text-sm mb-2">{person.role}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {person.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Certified for Excellence
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                We maintain the highest standards of quality, security, and environmental 
                responsibility. Our certifications reflect our commitment to doing business 
                the right way.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {certifications.map((cert) => (
                  <div key={cert} className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-sky-500 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Careers CTA */}
      <section id="careers" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-500 to-sky-600">
            <div className="px-8 py-16 md:px-16 md:py-20 text-center">
              <Users className="w-12 h-12 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join Our Team
              </h2>
              <p className="text-sky-100 text-lg max-w-2xl mx-auto mb-8">
                We\'re always looking for talented individuals who share our passion for 
                logistics and customer service. Explore career opportunities at Swish Portal.
              </p>
              <Button size="lg" variant="secondary">
                View Open Positions
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
