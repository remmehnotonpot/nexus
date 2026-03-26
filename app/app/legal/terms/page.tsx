"use client";

import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/FadeIn';

export default function TermsPage() {
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
              Terms of Use
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
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                By accessing and using the Swish Portal website and services, you accept 
                and agree to be bound by the terms and provisions of this agreement. 
                If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                2. Use of Services
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Swish Portal provides logistics and freight forwarding services. You agree 
                to use our services only for lawful purposes and in accordance with these 
                Terms of Use. You are responsible for ensuring that your use of our services 
                complies with all applicable laws and regulations.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                3. Account Registration
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                To access certain features of our services, you may be required to register 
                for an account. You agree to provide accurate, current, and complete 
                information during registration and to update such information to keep it 
                accurate and complete.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                4. Prohibited Activities
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                You agree not to engage in any of the following prohibited activities: 
                transmitting any unlawful content, attempting to gain unauthorized access 
                to our systems, interfering with other users access to our services, 
                or using our services for any fraudulent purpose.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                5. Intellectual Property
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                All content, trademarks, logos, and intellectual property displayed on 
                this website are the property of Swish Portal or its licensors. You may 
                not use, reproduce, or distribute any content without prior written 
                permission.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                6. Limitation of Liability
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Swish Portal shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use or inability 
                to use our services. Our liability is limited to the maximum extent 
                permitted by law.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                7. Governing Law
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                These Terms of Use shall be governed by and construed in accordance with 
                the laws of Switzerland, without regard to its conflict of law provisions. 
                Any disputes shall be resolved in the courts of Geneva, Switzerland.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                8. Changes to Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We reserve the right to modify these terms at any time. We will notify 
                users of any material changes by posting the new terms on this page and 
                updating the last updated date.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                9. Contact Information
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                If you have any questions about these Terms of Use, please contact us at:
                <br />
                Email: legal@swishportal.com
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
