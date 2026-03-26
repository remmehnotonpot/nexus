"use client";

import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/FadeIn';

export default function PrivacyPage() {
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
              Legal
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-slate-400">
              Last updated: March 26, 2026
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Swish Portal is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you use our website and services.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-6 space-y-2">
                <li>Contact information (name, email address, phone number)</li>
                <li>Business information (company name, address)</li>
                <li>Account credentials</li>
                <li>Shipment and logistics data</li>
                <li>Payment information</li>
                <li>Communications with our support team</li>
              </ul>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-6 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Process and manage shipments</li>
                <li>Communicate with you about your account and services</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
                <li>Protect against fraud and unauthorized access</li>
              </ul>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                4. Information Sharing
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-6 space-y-2">
                <li>Service providers and logistics partners</li>
                <li>Customs and regulatory authorities</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your consent</li>
              </ul>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We implement appropriate technical and organizational measures to protect 
                your personal information against unauthorized access, alteration, 
                disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                6. Your Rights
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Depending on your location, you may have the right to access, correct, 
                delete, or port your personal information. Contact us to exercise these rights.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                7. Contact Us
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                Email: privacy@swishportal.com
                <br />
                Address: 1211 Geneva, Switzerland
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
