// ============================================================================
// TERMS OF SERVICE PAGE
// ============================================================================
// LOCATION: /frontend/app/terms/page.tsx
// 
// PURPOSE: Display legal terms and conditions for using SafariHub
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import PageLayout from '@/src/components/layout/PageLayout'
import {
  Shield,
  FileText,
  Calendar,
  CheckCircle,
  BookOpen,
  Scale,
  Globe,
  Mail,
  Download,
  AlertCircle,
  MessageSquare
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | SafariHub',
  description: 'Read our terms and conditions for using SafariHub travel marketplace.',
  robots: {
    index: true,
    follow: true,
  }
}

const LAST_UPDATED = 'May 15, 2026'

const sections = [
  { id: 'acceptance', title: '1. Acceptance' },
  { id: 'eligibility', title: '2. Eligibility' },
  { id: 'accounts', title: '3. Accounts' },
  { id: 'bookings', title: '4. Bookings' },
  { id: 'cancellations', title: '5. Refunds' },
  { id: 'conduct', title: '6. Conduct' },
  { id: 'halal', title: '7. Halal Standards' },
  { id: 'regional', title: '8. Regional Ops' },
  { id: 'guides', title: '9. Guides' },
  { id: 'travelers', title: '10. Travelers' },
  { id: 'disputes', title: '11. Disputes' },
  { id: 'liability', title: '12. Liability' },
  { id: 'termination', title: '13. Termination' },
  { id: 'contact', title: '14. Contact' }
]

interface SectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-theme-primary mb-4">{title}</h2>
      <div className="prose prose-blue dark:prose-invert max-w-none text-theme-secondary space-y-4 text-sm sm:text-base">
        {children}
      </div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
          <div className="container-safe mx-auto max-w-7xl py-10 sm:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 surface-card rounded-2xl">
                <Scale className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold mb-4">Terms of Service</h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 surface-card rounded-full text-sm">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: {LAST_UPDATED}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-16">
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
              <Section id="acceptance" title="1. Acceptance of Terms">
                <p>By using SafariHub, you agree to these Terms. If you do not agree, you may not use the Platform.</p>
              </Section>

              <Section id="eligibility" title="2. Eligibility">
                <p>You must be at least 18 years old and have the legal capacity to enter into agreements.</p>
              </Section>

              <Section id="accounts" title="3. User Accounts">
                <p>You are responsible for your account security. Notify us immediately of unauthorized access. We reserve the right to suspend accounts for suspicious activity.</p>
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-800 dark:text-amber-300">SafariHub is not liable for losses caused by unauthorized account access due to user negligence.</p>
                </div>
              </Section>

              <Section id="bookings" title="4. Bookings and Payments">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payments are processed securely via regional partners.</li>
                  <li>Instant Book confirms immediately; Request to Book requires Guide approval.</li>
                </ul>
              </Section>

              <Section id="cancellations" title="5. Cancellations and Refunds">
                <ul className="list-disc pl-6 space-y-2">
                  <li>&gt;48h: 100% refund (minus platform fee).</li>
                  <li>24-48h: 50% refund.</li>
                  <li>&lt;24h: No refund.</li>
                </ul>
              </Section>

              <Section id="halal" title="7. Halal-Friendly Standards">
                <p>SafariHub is trust-first. Guides must ensure all meals are Halal-certified and itineraries respect prayer times and family-friendly ethics.</p>
              </Section>

              <Section id="regional" title="8. Regional Operations (Lebanon & Turkey)">
                <p>We operate primarily in Lebanon and Turkey. Users must comply with local laws and travel requirements for these regions.</p>
              </Section>

              <Section id="disputes" title="11. Dispute Resolution">
                <p>Contact SafariHub support within 48h of tour completion for any issues. Payouts are frozen during resolution.</p>
              </Section>

              <Section id="contact" title="14. Contact Us">
                <div className="mt-4 space-y-3">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary-light" />
                    <a href="mailto:legal@safarihub.com" className="hover:underline">legal@safarihub.com</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary-light" />
                    <span>Support via our <Link href="/contact" className="text-primary-light hover:underline">Contact Page</Link></span>
                  </p>
                </div>
              </Section>

              <div className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Agreement Confirmation</h3>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">By using SafariHub, you acknowledge you have read these Terms. Last updated: {LAST_UPDATED}</p>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
