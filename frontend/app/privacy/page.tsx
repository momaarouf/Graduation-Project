// ============================================================================
// PRIVACY POLICY PAGE
// ============================================================================
// LOCATION: /frontend/app/privacy/page.tsx
// 
// PURPOSE: Display privacy policy and data handling practices
// 
// COMPLIANCE: GDPR, CCPA, and general data protection principles
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import PageLayout from '@/src/components/layout/PageLayout'
import {
  Shield,
  Lock,
  Eye,
  Database,
  Cookie,
  Mail,
  FileText,
  Calendar,
  Globe,
  Download,
  CheckCircle,
  BookOpen,
  Share2,
  UserCheck
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | SafariHub',
  description: 'Learn how SafariHub collects, uses, and protects your personal information.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Privacy Policy | SafariHub',
    description: 'Your privacy matters. Read our data protection practices.',
    type: 'website',
  }
}

const LAST_UPDATED = 'May 15, 2026'

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'collection', title: 'Information We Collect' },
  { id: 'use', title: 'How We Use Your Information' },
  { id: 'sharing', title: 'Information Sharing' },
  { id: 'security', title: 'Data Security' },
  { id: 'rights', title: 'Your Rights' },
  { id: 'cookies', title: 'Cookies and Tracking' },
  { id: 'changes', title: 'Changes to Policy' },
  { id: 'contact', title: 'Contact Us' }
]

interface SectionProps {
  id: string
  title: string
  icon?: React.ElementType
  children: React.ReactNode
}

function Section({ id, title, icon: Icon, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary-light dark:text-primary-dark" />}
        {title}
      </h2>
      <div className="prose prose-blue dark:prose-invert max-w-none text-theme-secondary space-y-4">
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
          <div className="container-safe mx-auto max-w-7xl py-12 sm:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 surface-card rounded-2xl">
                <Shield className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-lg text-blue-100 mb-6">
                Your privacy is our priority. Learn how SafariHub protects your data across Lebanon, Turkey, and beyond.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 surface-card rounded-full text-sm">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: {LAST_UPDATED}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-safe mx-auto max-w-7xl py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <h2 className="font-bold text-theme-primary flex items-center gap-2 px-1">
                  <BookOpen className="w-5 h-5 text-primary-light" />
                  Contents
                </h2>
                <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-2 lg:gap-1 no-scrollbar">
                  {sections.map((section) => (
                    <Link
                      key={section.id}
                      href={`#${section.id}`}
                      className="whitespace-nowrap lg:whitespace-normal px-3 py-2 lg:px-0 lg:py-2 text-sm text-theme-secondary hover:text-primary-light transition-colors border lg:border-0 border-theme lg:border-l-2 border-transparent lg:hover:border-blue-600 rounded-lg lg:rounded-none lg:pl-3 bg-theme-base/50 lg:bg-transparent"
                    >
                      {section.title}
                    </Link>
                  ))}
                </nav>
                <button className="hidden lg:flex w-full mt-6 px-4 py-3 surface-section text-theme-secondary rounded-xl hover:surface-card transition-colors items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </aside>

            {/* Main */}
            <div className="lg:col-span-3 space-y-12">
              <Section id="introduction" title="Introduction" icon={FileText}>
                <p>
                  SafariHub ("we," "our," or "us") is a trust-first travel marketplace dedicated to providing Halal-friendly experiences in Lebanon, Turkey, and expanding regions. We are committed to protecting your personal data and your right to privacy.
                </p>
              </Section>

              <Section id="collection" title="Information We Collect" icon={Database}>
                <p className="font-semibold text-theme-primary">Personal Information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, and verified phone number</li>
                  <li>Profile details (bio, languages, and tourism expertise)</li>
                  <li>Dietary requirements and Halal-friendly preferences</li>
                  <li>Government-issued ID (required for Guide verification)</li>
                  <li>Location data for regional tour matching in Lebanon and Turkey</li>
                </ul>
              </Section>

              <Section id="use" title="How We Use Your Information" icon={Eye}>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To process bookings and facilitate payments via secure regional partners</li>
                  <li>To verify Guide identities to maintain our trust-first promise</li>
                  <li>To tailor itineraries to your Halal dietary and prayer-time needs</li>
                  <li>To provide real-time notifications about your trips and support tickets</li>
                  <li>To comply with regional travel regulations in Lebanon and Turkey</li>
                </ul>
              </Section>

              <Section id="sharing" title="Information Sharing" icon={Share2}>
                <p>We only share information necessary to fulfill your travel experiences:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><span className="font-medium">Between Users:</span> Necessary details shared between Guide and Traveler once a booking is confirmed.</li>
                  <li><span className="font-medium">Payment Partners:</span> Secure processing of transactions without storing card details on our servers.</li>
                  <li><span className="font-medium">Regulatory Bodies:</span> When required by the local laws of Lebanon or Turkey.</li>
                </ul>
              </Section>

              <Section id="security" title="Data Security" icon={Lock}>
                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">
                    Your financial safety is our priority. Payment details are handled by PCI-compliant partners and are never stored on SafariHub servers.
                  </p>
                </div>
              </Section>

              <Section id="rights" title="Your Rights" icon={UserCheck}>
                <p>You have full control over your SafariHub data, including the right to access, rectify, or request deletion of your information. Contact us at <a href="mailto:privacy@safarihub.com" className="text-primary-light hover:underline">privacy@safarihub.com</a>.</p>
              </Section>

              <Section id="cookies" title="Cookies and Tracking" icon={Cookie}>
                <p>We use essential cookies to keep you logged in and remember your regional preferences (such as language or currency settings).</p>
              </Section>

              <Section id="changes" title="Changes to Policy" icon={FileText}>
                <p>We may update this policy as we expand. Material changes will be notified via our in-app notification system and email.</p>
              </Section>

              <Section id="contact" title="Contact Us" icon={Mail}>
                <div className="mt-4 space-y-3">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                    <a href="mailto:privacy@safarihub.com" className="text-primary-light dark:text-primary-dark hover:underline">
                      privacy@safarihub.com
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                    <span>Data Protection Officer: dpo@safarihub.com</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                    <span>Support available via our <Link href="/contact" className="text-primary-light hover:underline">Contact Page</Link></span>
                  </p>
                </div>
              </Section>

              <div className="mt-12 p-6 bg-primary-light/10 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <Globe className="w-6 h-6 text-primary-light dark:text-primary-dark flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Regional Compliance</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      SafariHub adheres to data protection standards applicable in Lebanon and Turkey, adopting global best practices for security and user rights.
                    </p>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
