"use client";

import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/FadeIn';

export default function CookiesPage() {
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
              Cookie Policy
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
                1. What Are Cookies
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Cookies are small text files that are placed on your device when you visit 
                a website. They are widely used to make websites work more efficiently and 
                provide information to website owners.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                2. How We Use Cookies
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We use cookies for the following purposes:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-6 space-y-2">
                <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
                <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                3. Managing Cookies
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Most web browsers allow you to control cookies through their settings. 
                You can choose to accept or decline cookies. However, disabling cookies 
                may affect the functionality of our website.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                4. Third-Party Cookies
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We may use third-party services that place cookies on your device. 
                These services include analytics providers and advertising partners. 
                We do not control these cookies.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                5. Contact Us
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                If you have questions about our Cookie Policy, please contact us at:
                <br />
                Email: privacy@swishportal.com
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
