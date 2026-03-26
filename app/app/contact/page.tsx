"use client";

import { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  MessageSquare,
  FileText,
  Shield,
  Cookie,
  ArrowRight,
  CheckCircle2,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const offices = [
  {
    city: 'Geneva',
    country: 'Switzerland',
    address: 'Rue du Commerce 15, 1201 Geneva',
    phone: '+41 22 555 0100',
    email: 'geneva@swishportal.com',
    image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=600&q=80'
  },
  {
    city: 'Rotterdam',
    country: 'Netherlands',
    address: 'Wilhelminakade 123, 3072 AP Rotterdam',
    phone: '+31 10 555 0200',
    email: 'rotterdam@swishportal.com',
    image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a2?w=600&q=80'
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    address: '1 HarbourFront Place, #12-01 HarbourFront Tower',
    phone: '+65 6555 0300',
    email: 'singapore@swishportal.com',
    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600&q=80'
  },
  {
    city: 'New York',
    country: 'USA',
    address: '1 World Trade Center, Suite 8500, New York, NY 10007',
    phone: '+1 212 555 0400',
    email: 'newyork@swishportal.com',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80'
  }
];

const faqs = [
  {
    question: 'How do I get a quote for shipping?',
    answer: 'You can request a quote by filling out the form on this page, calling our 24/7 support line at +1 (800) SWISH-GL, or emailing sales@swishportal.com with your shipment details including origin, destination, dimensions, weight, and commodity type.'
  },
  {
    question: 'What documents do I need for international shipping?',
    answer: 'Required documents vary by destination and commodity, but typically include a commercial invoice, packing list, bill of lading or airway bill, and any required certificates (origin, health, etc.). Our customs brokerage team can guide you through specific requirements.'
  },
  {
    question: 'How do I track my shipment?',
    answer: 'Enter your tracking number on our Tracking page or in the search bar at the top of any page. You\'ll see real-time updates including current location, estimated arrival, and any customs clearance events.'
  },
  {
    question: 'Do you offer insurance for shipments?',
    answer: 'Yes, we offer comprehensive cargo insurance covering loss or damage during transit. Coverage options include all-risk, warehouse-to-warehouse, and specific perils. Ask your account manager for a quote based on your cargo value and route.'
  },
  {
    question: 'What are your credit terms for new customers?',
    answer: 'New customers typically start with prepayment or credit card terms. After establishing a payment history, we offer net-15 or net-30 terms subject to credit approval. Contact our accounts team for a credit application.'
  }
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    inquiryType: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80"
            alt="Contact"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Let's Start a{' '}
              <span className="text-gradient">Conversation</span>
            </h1>
            <p className="text-xl text-slate-300">
              Whether you need a quote, have a question about your shipment, or want to 
              explore partnership opportunities, our team is ready to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-slate-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-sky-500" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">24/7 Support</h3>
                <p className="text-sky-500">+1 (800) SWISH-GL</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-sky-500" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email Us</h3>
                <p className="text-sky-500">contact@swishportal.com</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-sky-500" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Headquarters</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Geneva, Switzerland</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-sky-500" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Office Hours</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Mon-Fri: 8AM-6PM CET</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Send Us a Message
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Fill out the form below and we\'ll get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl p-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Thank you for reaching out. A member of our team will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Full Name *
                      </label>
                      <Input
                        required
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company
                      </label>
                      <Input
                        placeholder="Your Company"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Phone
                      </label>
                      <Input
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Inquiry Type *
                    </label>
                    <Select
                      value={formData.inquiryType}
                      onValueChange={(value) => setFormData({...formData, inquiryType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quote">Request a Quote</SelectItem>
                        <SelectItem value="tracking">Tracking Inquiry</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="support">Customer Support</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="careers">Careers</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Message *
                    </label>
                    <Textarea
                      required
                      rows={5}
                      placeholder="Tell us about your shipping needs..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" size="lg">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    By submitting this form, you agree to our Privacy Policy and Terms of Service.
                  </p>
                </form>
              )}
            </div>

            {/* Map Placeholder */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden h-full min-h-[400px] relative">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80"
                alt="World map"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-8">
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">Global Presence</h3>
                  <p className="text-slate-300">
                    With offices in 40+ countries and partners in 180+ markets, 
                    we\'re wherever your business needs us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Regional Offices
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Visit us at one of our strategic locations around the world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offices.map((office) => (
              <Card key={office.city} className="overflow-hidden">
                <div className="aspect-video">
                  <img
                    src={office.image}
                    alt={office.city}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {office.city}, {office.country}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {office.address}
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-sky-500">{office.phone}</p>
                    <p className="text-sm text-slate-500">{office.email}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Quick answers to common questions. Can\'t find what you\'re looking for? 
              Reach out to our support team.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 ml-8">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Links Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card id="terms">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-sky-500 mb-4" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Terms of Use</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Review our terms and conditions for using Swish Portal services and website.
                </p>
                <Button variant="link" className="p-0 h-auto text-sky-500">
                  Read Terms <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            <Card id="privacy">
              <CardContent className="p-6">
                <Shield className="w-8 h-8 text-sky-500 mb-4" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Learn how we collect, use, and protect your personal information.
                </p>
                <Button variant="link" className="p-0 h-auto text-sky-500">
                  Read Policy <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            <Card id="cookies">
              <CardContent className="p-6">
                <Cookie className="w-8 h-8 text-sky-500 mb-4" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Cookie Policy</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Information about how we use cookies and similar technologies.
                </p>
                <Button variant="link" className="p-0 h-auto text-sky-500">
                  Read Policy <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
