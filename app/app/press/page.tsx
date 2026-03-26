"use client";

import { 
  Newspaper, 
  Calendar, 
  ArrowRight,
  Play,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';

const pressReleases = [
  {
    date: 'March 15, 2026',
    title: 'Swish Portal Announces Expansion into Southeast Asian Markets',
    excerpt: 'Strategic expansion brings comprehensive logistics solutions to Singapore, Malaysia, and Thailand with new regional headquarters.',
    category: 'Company News',
  },
  {
    date: 'February 28, 2026',
    title: 'Swish Portal Achieves ISO 14001:2015 Environmental Certification',
    excerpt: 'Certification recognizes company commitment to sustainable logistics practices and carbon footprint reduction.',
    category: 'Awards',
  },
  {
    date: 'January 20, 2026',
    title: 'New Technology Platform Reduces Shipment Processing Time by 40%',
    excerpt: 'AI-powered automation and real-time tracking capabilities transform customer experience.',
    category: 'Technology',
  },
  {
    date: 'December 10, 2025',
    title: 'Swish Portal Partners with Leading E-Commerce Platform',
    excerpt: 'Multi-year agreement provides integrated logistics solutions for rapid global fulfillment.',
    category: 'Partnerships',
  },
];

const mediaCoverage = [
  {
    outlet: 'Logistics Today',
    title: 'The Future of Global Supply Chains',
    date: 'March 2026',
    type: 'Interview',
  },
  {
    outlet: 'Supply Chain Weekly',
    title: 'Top 50 Logistics Companies to Watch',
    date: 'February 2026',
    type: 'Ranking',
  },
  {
    outlet: 'Business Insider',
    title: 'How Technology is Reshaping Freight',
    date: 'January 2026',
    type: 'Feature',
  },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80"
            alt="Press room"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-3xl">
            <Badge className="mb-4 bg-sky-500/20 text-sky-400 border-sky-500/30">
              News & Media
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Press &{' '}
              <span className="text-gradient">Media Center</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Latest news, press releases, and media resources about Swish Portal.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              Latest News
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Press Releases
            </h2>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-2 gap-8" staggerDelay={0.15}>
            {pressReleases.map((release) => (
              <StaggerItem key={release.title}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      {release.date}
                      <span className="mx-2">|</span>
                      <Badge variant="secondary" className="text-xs">
                        {release.category}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-sky-500 transition-colors">
                      {release.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {release.excerpt}
                    </p>
                    <Button variant="link" className="p-0 h-auto text-sky-500">
                      Read More <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              In the News
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Media Coverage
            </h2>
          </FadeIn>

          <StaggerContainer className="space-y-4" staggerDelay={0.1}>
            {mediaCoverage.map((item) => (
              <StaggerItem key={item.title}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-sky-500 font-medium mb-1">
                          {item.outlet}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-slate-500 text-sm">{item.date}</p>
                      </div>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Media Resources */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              Resources
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Media Resources
            </h2>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.1}>
            <StaggerItem>
              <Card className="h-full text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                    <Newspaper className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Press Kit
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    Download logos, executive bios, and company fact sheets.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="h-full text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                    <Play className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Video Library
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    Access corporate videos, interviews, and event recordings.
                  </p>
                  <Button variant="outline" className="w-full">
                    View Videos
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="h-full text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Event Calendar
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    See where we will be speaking and exhibiting next.
                  </p>
                  <Button variant="outline" className="w-full">
                    View Calendar
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-4">
              Media Inquiries
            </h2>
            <p className="text-slate-400 mb-6">
              For press inquiries, interview requests, or additional information,
              please contact our communications team.
            </p>
            <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
              Contact Press Team
            </Button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
