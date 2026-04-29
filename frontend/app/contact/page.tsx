// ============================================================================
// CONTACT PAGE
// ============================================================================
// LOCATION: /frontend/src/app/contact/page.tsx
// 
// PURPOSE: Allow users to contact SafariHub support
// 
// FEATURES:
// - Contact form with validation
// - Support email, phone, chat options
// - FAQ preview
// - Office locations
// - Social media links
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import {
 Mail,
 Phone,
 MessageSquare,
 MapPin,
 Clock,
 Shield,
 Send,
 CheckCircle,
 HelpCircle,
 Facebook,
 Twitter,
 Instagram,
 Linkedin,
 ChevronRight
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import ContactForm from '@/src/components/contact/ContactForm'

export const metadata: Metadata = {
 title: 'Contact Us | SafariHub',
 description: 'Get in touch with SafariHub support. We\'re here to help 24/7.',
 openGraph: {
 title: 'Contact SafariHub',
 description: 'We\'re here to help with any questions',
 images: ['/images/og/contact.jpg'],
 }
}

// ============================================================================
// CONTACT METHODS
// ============================================================================

const CONTACT_METHODS = [
 {
 icon: Mail,
 title: 'Email Us',
 description: 'Get a response within 24 hours',
 action: 'support@safaribub.com',
 href: 'mailto:support@safaribub.com',
 color: 'blue'
 },
 {
 icon: Phone,
 title: 'Call Us',
 description: '24/7 phone support',
 action: '+90 555 123 4567',
 href: 'tel:+905551234567',
 color: 'emerald'
 },
 {
 icon: MessageSquare,
 title: 'Live Chat',
 description: 'Chat with our team now',
 action: 'Start live chat',
 href: '#chat',
 color: 'amber'
 }
]

// ============================================================================
// OFFICE LOCATIONS
// ============================================================================

const OFFICES = [
 {
 city: 'Istanbul',
 country: 'Turkey',
 address: 'Sultanahmet Mahallesi, Akbiyik Caddesi No:15',
 district: 'Fatih, Istanbul',
 phone: '+90 555 123 4567',
 email: 'turkey@safaribub.com',
 hours: '9:00 - 18:00 (Mon-Fri)'
 },
 {
 city: 'Beirut',
 country: 'Lebanon',
 address: 'Saifi Village, Rue du Liban',
 district: 'Beirut Central District',
 phone: '+961 70 123 456',
 email: 'lebanon@safaribub.com',
 hours: '9:00 - 17:00 (Mon-Fri)'
 }
]

// ============================================================================
// FAQ PREVIEW
// ============================================================================

const FAQ_PREVIEW = [
 {
 question: 'How do I become a guide?',
 answer: 'Sign up as a guide, complete your profile, and submit ID verification. Our team reviews within 24-48 hours.'
 },
 {
 question: 'What is your cancellation policy?',
 answer: 'Free cancellation up to 48 hours before the tour. 50% refund between 24-48 hours. No refund within 24 hours.'
 },
 {
 question: 'Is SafariHub available in other countries?',
 answer: 'We currently operate in Lebanon and Turkey, with plans to expand to more countries soon.'
 }
]

// ============================================================================
// CONTACT METHOD CARD
// ============================================================================

const ContactMethodCard = ({ method }: { method: typeof CONTACT_METHODS[0] }) => {
 const Icon = method.icon
 
 const colorClasses = {
 blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark border-blue-200 dark:border-blue-800',
 emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
 amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
 }

 return (
 <a
 href={method.href}
 className="group block p-6 surface-card border border-theme rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
 >
 <div className={`inline-flex p-3 rounded-xl mb-4 ${colorClasses[method.color as keyof typeof colorClasses]}`}>
 <Icon className="w-6 h-6" />
 </div>
 <h3 className="font-bold text-theme-primary mb-1 group-hover:text-primary-light dark:text-primary-dark dark:group-hover:text-primary-light dark:text-primary-dark transition-colors">
 {method.title}
 </h3>
 <p className="text-sm text-theme-muted mb-3">
 {method.description}
 </p>
 <p className="text-primary-light dark:text-primary-dark dark:text-primary-dark font-medium text-sm group-hover:underline">
 {method.action}
 </p>
 </a>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ContactPage() {
 return (
 <PageLayout>
 <div className="pt-14 sm:pt-16 surface-card">
 
 {/* Hero Section */}
 <section className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-16 sm:py-20">
 <div className="container-safe mx-auto max-w-7xl text-center">
 <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
 Get in Touch
 </h1>
 <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
 Have questions? We're here to help 24/7. Reach out to our support team.
 </p>
 </div>
 </section>

 {/* Contact Methods py-24 for padding */}
 <section className=" surface-card py-24 sm:py-20.5">
 <div className="container-safe mx-auto max-w-7xl">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
 {CONTACT_METHODS.map((method, index) => (
 <ContactMethodCard key={index} method={method} />
 ))}
 </div>
 </div>
 </section>

 {/* Contact Form + Info */}
 <section className="py-16 sm:py-20 surface-section">
 <div className="container-safe mx-auto max-w-7xl">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
 
 {/* Left Column - Form */}
 <div>
 <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-4">
 Send us a Message
 </h2>
 <p className="text-theme-secondary mb-8">
 Fill out the form below and we'll get back to you within 24 hours.
 </p>
 <ContactForm />
 </div>

 {/* Right Column - Info */}
 <div className="space-y-8">
 {/* Response Time */}
 <div className="surface-card border border-theme rounded-xl p-6">
 <div className="flex items-start gap-4">
 <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
 <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
 </div>
 <div>
 <h3 className="font-bold text-theme-primary mb-1">
 Fast Response
 </h3>
 <p className="text-sm text-theme-secondary ">
 We typically respond within 24 hours. For urgent matters, use live chat or phone.
 </p>
 </div>
 </div>
 </div>

 {/* Security Note */}
 <div className="surface-card border border-theme rounded-xl p-6">
 <div className="flex items-start gap-4">
 <div className="p-3 bg-primary-light/10 rounded-lg">
 <Shield className="w-6 h-6 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 </div>
 <div>
 <h3 className="font-bold text-theme-primary mb-1">
 Secure & Private
 </h3>
 <p className="text-sm text-theme-secondary ">
 Your information is encrypted and never shared with third parties.
 </p>
 </div>
 </div>
 </div>

 {/* Office Locations */}
 <div className="surface-card border border-theme rounded-xl p-6">
 <h3 className="font-bold text-theme-primary mb-4 flex items-center gap-2">
 <MapPin className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 Our Offices
 </h3>
 <div className="space-y-4">
 {OFFICES.map((office, index) => (
 <div key={index} className="border-b border-theme last:border-0 pb-4 last:pb-0">
 <p className="font-semibold text-theme-primary">
 {office.city}, {office.country}
 </p>
 <p className="text-sm text-theme-secondary mt-1">
 {office.address}
 </p>
 <p className="text-sm text-theme-muted ">
 {office.district}
 </p>
 <div className="mt-2 space-y-1 text-sm">
 <a href={`tel:${office.phone}`} className="text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline block">
 {office.phone}
 </a>
 <a href={`mailto:${office.email}`} className="text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline block">
 {office.email}
 </a>
 <p className="text-theme-muted text-xs">
 {office.hours}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* FAQ Preview */}
 <section className="py-16 sm:py-20 surface-card">
 <div className="container-safe mx-auto max-w-4xl">
 <div className="text-center mb-12">
 <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-4">
 Frequently Asked Questions
 </h2>
 <p className="text-theme-secondary ">
 Quick answers to common questions.
 </p>
 </div>

 <div className="space-y-4">
 {FAQ_PREVIEW.map((faq, index) => (
 <div key={index} className="p-6 surface-section border border-theme rounded-xl">
 <h3 className="font-bold text-theme-primary mb-2">
 {faq.question}
 </h3>
 <p className="text-theme-secondary ">
 {faq.answer}
 </p>
 </div>
 ))}
 </div>

 <div className="text-center mt-8">
 <Link
 href="/faq"
 className="inline-flex items-center gap-1 text-primary-light dark:text-primary-dark dark:text-primary-dark hover:gap-2 transition-all group"
 >
 <span>View all FAQs</span>
 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>
 </div>
 </section>

 {/* Social Links */}
 <section className="py-12 sm:py-16 surface-section">
 <div className="container-safe mx-auto max-w-7xl text-center">
 <h2 className="text-xl sm:text-2xl font-bold text-theme-primary mb-6">
 Follow Us
 </h2>
 <div className="flex justify-center gap-4">
 <a
 href="https://facebook.com/safaribub"
 target="_blank"
 rel="noopener noreferrer"
 className="p-3 surface-card border border-theme rounded-lg hover:bg-primary-light/10 dark:hover:surface-base hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-all group"
 >
 <Facebook className="w-5 h-5" />
 </a>
 <a
 href="https://twitter.com/safaribub"
 target="_blank"
 rel="noopener noreferrer"
 className="p-3 surface-card border border-theme rounded-lg hover:bg-primary-light/10 dark:hover:surface-base hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-all group"
 >
 <Twitter className="w-5 h-5" />
 </a>
 <a
 href="https://instagram.com/safaribub"
 target="_blank"
 rel="noopener noreferrer"
 className="p-3 surface-card border border-theme rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/30 hover:text-pink-600 dark:hover:text-pink-400 transition-all group"
 >
 <Instagram className="w-5 h-5" />
 </a>
 <a
 href="https://linkedin.com/company/safaribub"
 target="_blank"
 rel="noopener noreferrer"
 className="p-3 surface-card border border-theme rounded-lg hover:bg-primary-light/10 dark:hover:surface-base hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-all group"
 >
 <Linkedin className="w-5 h-5" />
 </a>
 </div>
 </div>
 </section>
 </div>
 </PageLayout>
 )
}