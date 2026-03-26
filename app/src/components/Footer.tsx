import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Shield,
  FileText,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="Swish Portal" className="h-16 w-auto" />
            </Link>
            <p className="text-sm mb-6 max-w-xs">
              End-to-end logistics solutions powering global trade. 
              Real-time tracking, seamless customs clearance, and 
              guaranteed delivery across 180+ countries.
            </p>
            
            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-sky-500" />
                <span>+1 (800) SWISH-GL</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-sky-500" />
                <span>contact@swishportal.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-sky-500" />
                <span>1211 Geneva, Switzerland</span>
              </div>
            </div>
          </div>

          {/* Services column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {[
                { label: 'Freight Forwarding', href: '/services#freight' },
                { label: 'Customs Brokerage', href: '/services#customs' },
                { label: 'Warehousing', href: '/services#warehousing' },
                { label: 'Supply Chain Consulting', href: '/services#consulting' },
                { label: 'E-Commerce Logistics', href: '/services#ecommerce' },
                { label: 'Project Cargo', href: '/services#project' },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href}
                    className="text-sm hover:text-sky-500 transition-colors inline-flex items-center gap-1 group"
                  >
                    {item.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Careers', href: '/careers' },
                { label: 'Press & Media', href: '/press' },
                { label: 'Sustainability', href: '/sustainability' },
                { label: 'Partners', href: '/partners' },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href}
                    className="text-sm hover:text-sky-500 transition-colors inline-flex items-center gap-1 group"
                  >
                    {item.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', href: '/help' },
                { label: 'Track Shipment', href: '/tracking' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'API Documentation', href: '/api-docs' },
                { label: 'FAQs', href: '/contact#faq' },
              ].map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href}
                    className="text-sm hover:text-sky-500 transition-colors inline-flex items-center gap-1 group"
                  >
                    {item.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm mb-4">
              Subscribe to our newsletter for industry insights and updates.
            </p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600"
              />
              <Button className="w-full bg-sky-500 hover:bg-sky-600">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </div>
        </div>

        {/* Legal Stack Section */}
        <div className="mt-16 pt-8 border-t border-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Compliance & Regulatory */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-sky-500" />
                <h5 className="text-white font-medium text-sm">Compliance & Regulatory</h5>
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="text-slate-500">Global Trade Compliance:</span>
                  <p className="mt-1">Operating in compliance with OFAC, EU, and UN sanctions and export control regulations.</p>
                </li>
                <li>
                  <span className="text-slate-500">Anti-Bribery & Corruption:</span>
                  <p className="mt-1">Committed to the highest ethical standards under the UK Bribery Act and US FCPA.</p>
                </li>
                <li>
                  <span className="text-slate-500">Modern Slavery Statement:</span>
                  <p className="mt-1">Transparency in our global supply chain (FY2026).</p>
                </li>
              </ul>
            </div>

            {/* Operational Terms */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-sky-500" />
                <h5 className="text-white font-medium text-sm">Operational Terms</h5>
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="text-slate-500">Standard Conditions of Carriage:</span>
                  <p className="mt-1">All shipments subject to Swish Portal Terms and Conditions, including limitations of liability under Hague-Visby Rules or Montreal Convention.</p>
                </li>
                <li>
                  <span className="text-slate-500">Bill of Lading Terms:</span>
                  <p className="mt-1">View our standardized ocean and air waybill clauses.</p>
                </li>
                <li>
                  <span className="text-slate-500">Cargo Insurance:</span>
                  <p className="mt-1">Comprehensive coverage options available for all shipments.</p>
                </li>
              </ul>
            </div>

            {/* Corporate Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-sky-500" />
                <h5 className="text-white font-medium text-sm">Corporate Information</h5>
              </div>
              <div className="text-xs space-y-2">
                <p>
                  <span className="text-slate-500">Registered Office:</span>
                  <br />
                  1211 Geneva, Switzerland
                </p>
                <p>
                  <span className="text-slate-500">Trade Register:</span>
                  <br />
                  CH-020.3.020.123-4
                </p>
                <p>
                  <span className="text-slate-500">VAT ID:</span> CHE-123.456.789
                </p>
                <p>
                  <span className="text-slate-500">DUNS Number:</span> 12-345-6789
                </p>
                <p>
                  <span className="text-slate-500">Member of:</span>
                  <br />
                  International Federation of Freight Forwarders Associations (FIATA)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-center md:text-left">
              Copyright © 2026 Swish Portal Holdings B.V. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <Link href="/legal/terms" className="hover:text-sky-500 transition-colors">
                Terms of Use
              </Link>
              <Link href="/legal/privacy" className="hover:text-sky-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/cookies" className="hover:text-sky-500 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/legal/security" className="hover:text-sky-500 transition-colors">
                Security
              </Link>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-4">
            Use of this website signifies your agreement to the Terms of Use and Online Privacy Policy. 
            Swish Portal and the Swish logo are registered trademarks of Swish Portal Solutions. 
            All other trademarks are the property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
