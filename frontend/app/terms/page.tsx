// ============================================================================
// TERMS OF SERVICE PAGE
// ============================================================================
// LOCATION: /frontend/src/app/terms/page.tsx
// 
// PURPOSE: Display legal terms and conditions for using SafariHub
// 
// IMPORTANT:
// - This is a static page for V1
// - In Phase 2/3, replace with CMS-driven content if needed
// - Last updated date should be updated when terms change
// 
// SEO: index,follow (legal pages should be indexed)
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import PageLayout from '@/src/components/layout/PageLayout'
import {
 Shield,
 FileText,
 Calendar,
 ChevronRight,
 AlertCircle,
 CheckCircle,
 BookOpen,
 Scale,
 CreditCard,
 Users,
 Globe,
 Lock,
 MessageSquare,
 Mail,
 Download
} from 'lucide-react'

export const metadata: Metadata = {
 title: 'Terms of Service | SafariHub',
 description: 'Read our terms and conditions for using SafariHub travel marketplace.',
 robots: {
 index: true,
 follow: true,
 },
 openGraph: {
 title: 'Terms of Service | SafariHub',
 description: 'Legal terms for using SafariHub travel marketplace.',
 type: 'website',
 }
}

// ============================================================================
// LAST UPDATED DATE
// ============================================================================
// Update this when terms change
const LAST_UPDATED = 'February 17, 2026'

// ============================================================================
// TABLE OF CONTENTS ITEMS
// ============================================================================
const sections = [
 { id: 'acceptance', title: '1. Acceptance of Terms' },
 { id: 'eligibility', title: '2. Eligibility' },
 { id: 'accounts', title: '3. User Accounts' },
 { id: 'bookings', title: '4. Bookings and Payments' },
 { id: 'cancellations', title: '5. Cancellations and Refunds' },
 { id: 'conduct', title: '6. User Conduct' },
 { id: 'guides', title: '7. Guide Responsibilities' },
 { id: 'travelers', title: '8. Traveler Responsibilities' },
 { id: 'disputes', title: '9. Dispute Resolution' },
 { id: 'liability', title: '10. Limitation of Liability' },
 { id: 'termination', title: '11. Termination' },
 { id: 'changes', title: '12. Changes to Terms' },
 { id: 'contact', title: '13. Contact Us' }
]

// ============================================================================
// SECTION COMPONENT
// ============================================================================

interface SectionProps {
 id: string
 title: string
 children: React.ReactNode
}

function Section({ id, title, children }: SectionProps) {
 return (
 <section id={id} className="scroll-mt-20">
 <h2 className="text-xl font-bold text-theme-primary mb-4">
 {title}
 </h2>
 <div className="prose prose-blue dark:prose-invert max-w-none text-theme-secondary space-y-4">
 {children}
 </div>
 </section>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TermsPage() {
 return (
 <PageLayout>
 {/* Page offset */}
 <div className="pt-14 sm:pt-16 surface-section">
 
 {/* Header Section */}
 <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
 <div className="container-safe mx-auto max-w-7xl py-12 sm:py-16">
 <div className="max-w-3xl mx-auto text-center">
 {/* Icon */}
 <div className="inline-flex items-center justify-center w-16 h-16 mb-6 surface-card  rounded-2xl">
 <Scale className="w-8 h-8" />
 </div>

 {/* Title */}
 <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
 Terms of Service
 </h1>

 {/* Description */}
 <p className="text-lg text-blue-100 mb-6">
 Please read these terms carefully before using SafariHub.
 </p>

 {/* Last updated */}
 <div className="inline-flex items-center gap-2 px-4 py-2 surface-card  rounded-full text-sm">
 <Calendar className="w-4 h-4" />
 <span>Last Updated: {LAST_UPDATED}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Main Content */}
 <div className="container-safe mx-auto max-w-7xl py-12 sm:py-16">
 
 {/* Two Column Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
 
 {/* Sidebar - Table of Contents */}
 <aside className="lg:col-span-1">
 <div className="lg:sticky lg:top-24 space-y-4">
 <h2 className="font-bold text-theme-primary flex items-center gap-2">
 <BookOpen className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 Contents
 </h2>
 <nav className="space-y-1">
 {sections.map((section) => (
 <Link
 key={section.id}
 href={`#${section.id}`}
 className="block py-2 text-sm text-theme-secondary hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors border-l-2 border-transparent hover:border-blue-600 pl-3"
 >
 {section.title}
 </Link>
 ))}
 </nav>

 {/* Download PDF Button (Phase 2) */}
 <button className="w-full mt-6 px-4 py-3 surface-section text-theme-secondary rounded-xl hover:surface-section dark:hover:surface-section transition-colors flex items-center justify-center gap-2 text-sm">
 <Download className="w-4 h-4" />
 Download PDF
 </button>
 </div>
 </aside>

 {/* Main Content Area */}
 <div className="lg:col-span-3 space-y-12">
 
 {/* Section 1: Acceptance */}
 <Section id="acceptance" title="1. Acceptance of Terms">
 <p>
 By accessing or using SafariHub ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). 
 If you do not agree to these Terms, you may not use the Platform.
 </p>
 <p>
 These Terms constitute a legally binding agreement between you and SafariHub regarding your use of the Platform 
 and any services offered through it.
 </p>
 </Section>

 {/* Section 2: Eligibility */}
 <Section id="eligibility" title="2. Eligibility">
 <p>By using SafariHub, you represent and warrant that:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>You are at least 18 years of age</li>
 <li>You have the legal capacity to enter into these Terms</li>
 <li>You are not located in a country that is subject to sanctions</li>
 <li>You will provide accurate and complete information</li>
 <li>You will comply with all applicable laws and regulations</li>
 </ul>
 </Section>

 {/* Section 3: Accounts */}
 <Section id="accounts" title="3. User Accounts">
 <p>When you create an account on SafariHub:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>You are responsible for maintaining account security</li>
 <li>You must notify us immediately of any unauthorized use</li>
 <li>You may not share your account credentials</li>
 <li>We reserve the right to suspend accounts for suspicious activity</li>
 <li>One person may not maintain multiple accounts</li>
 </ul>
 <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
 <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
 <p className="text-sm text-amber-800 dark:text-amber-300">
 SafariHub is not liable for any loss or damage caused by unauthorized access to your account due to your failure to maintain confidentiality.
 </p>
 </div>
 </Section>

 {/* Section 4: Bookings */}
 <Section id="bookings" title="4. Bookings and Payments">
 <p>When making a booking through SafariHub:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>All payments are processed securely through our platform</li>
 <li>Prices are displayed in the selected currency</li>
 <li>Booking confirmation is sent via email</li>
 <li>You authorize us to charge the provided payment method</li>
 <li>Platform fees are non-refundable except as stated in our cancellation policy</li>
 </ul>
 <p className="mt-4 font-semibold text-theme-primary">Booking Types:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li><span className="font-medium">Instant Book:</span> Payment confirms booking immediately</li>
 <li><span className="font-medium">Request to Book:</span> Payment authorized, booking confirmed after guide approval (24h timeout)</li>
 </ul>
 </Section>

 {/* Section 5: Cancellations */}
 <Section id="cancellations" title="5. Cancellations and Refunds">
 <p className="font-semibold text-theme-primary">Cancellation Policy:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li><span className="font-medium">More than 48 hours before tour:</span> 100% refund (minus platform fee)</li>
 <li><span className="font-medium">24-48 hours before tour:</span> 50% refund</li>
 <li><span className="font-medium">Less than 24 hours before tour:</span> No refund</li>
 </ul>
 <p className="mt-4 font-semibold text-theme-primary">Additional Rules:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>If minimum capacity is not met 48h before tour, tour is cancelled with 100% refund</li>
 <li>Waitlist: First waitlisted traveler who completes payment gets the spot</li>
 <li>No-show reporting available within 48h after tour</li>
 </ul>
 </Section>

 {/* Section 6: User Conduct */}
 <Section id="conduct" title="6. User Conduct">
 <p>You agree not to:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Violate any laws or regulations</li>
 <li>Infringe on intellectual property rights</li>
 <li>Harass, abuse, or harm others</li>
 <li>Impersonate any person or entity</li>
 <li>Post false or misleading information</li>
 <li>Attempt to gain unauthorized access</li>
 <li>Use the platform for commercial purposes without authorization</li>
 </ul>
 </Section>

 {/* Section 7: Guide Responsibilities */}
 <Section id="guides" title="7. Guide Responsibilities">
 <p>As a guide on SafariHub, you agree to:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Provide accurate tour descriptions and pricing</li>
 <li>Maintain professional conduct at all times</li>
 <li>Honor confirmed bookings</li>
 <li>Respond to booking requests within 24 hours</li>
 <li>Complete ID verification process</li>
 <li>Follow safety guidelines and regulations</li>
 <li>Provide halal-friendly accommodations when advertised</li>
 </ul>
 </Section>

 {/* Section 8: Traveler Responsibilities */}
 <Section id="travelers" title="8. Traveler Responsibilities">
 <p>As a traveler on SafariHub, you agree to:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Provide accurate information when booking</li>
 <li>Arrive on time at meeting points</li>
 <li>Respect local customs and laws</li>
 <li>Treat guides and other travelers with respect</li>
 <li>Provide honest and constructive reviews</li>
 <li>Follow safety instructions from guides</li>
 </ul>
 </Section>

 {/* Section 9: Dispute Resolution */}
 <Section id="disputes" title="9. Dispute Resolution">
 <p>In case of disputes:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>First, attempt to resolve directly with the other party</li>
 <li>If unresolved, contact SafariHub support</li>
 <li>Our team will review evidence and make a decision</li>
 <li>Disputes must be filed within 48 hours of tour completion</li>
 <li>Payouts are frozen during dispute resolution</li>
 </ul>
 <p className="mt-4">
 By using SafariHub, you agree to resolve disputes through binding arbitration 
 rather than in court, except where prohibited by law.
 </p>
 </Section>

 {/* Section 10: Limitation of Liability */}
 <Section id="liability" title="10. Limitation of Liability">
 <p>
 To the maximum extent permitted by law, SafariHub shall not be liable for:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Indirect, incidental, or consequential damages</li>
 <li>Loss of profits, data, or goodwill</li>
 <li>Personal injury or property damage</li>
 <li>Third-party conduct or services</li>
 <li>Tour cancellations or modifications</li>
 </ul>
 <p className="mt-4">
 Our total liability shall not exceed the amount paid by you through the Platform 
 in the 12 months preceding the claim.
 </p>
 </Section>

 {/* Section 11: Termination */}
 <Section id="termination" title="11. Termination">
 <p>
 SafariHub may terminate or suspend your account immediately, without prior notice, for:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Violation of these Terms</li>
 <li>Fraudulent or illegal activity</li>
 <li>Harassment of other users</li>
 <li>Multiple complaints from travelers/guides</li>
 <li>Extended inactivity</li>
 </ul>
 <p className="mt-4">
 You may terminate your account at any time by contacting support. 
 Termination does not relieve you of payment obligations for completed bookings.
 </p>
 </Section>

 {/* Section 12: Changes to Terms */}
 <Section id="changes" title="12. Changes to Terms">
 <p>
 We reserve the right to modify these Terms at any time. Changes will be effective:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Immediately for new users</li>
 <li>30 days after notice for existing users</li>
 </ul>
 <p className="mt-4">
 Your continued use of SafariHub after changes constitutes acceptance of the modified Terms.
 </p>
 </Section>

 {/* Section 13: Contact */}
 <Section id="contact" title="13. Contact Us">
 <p>If you have questions about these Terms, please contact us:</p>
 <div className="mt-4 space-y-2">
 <p className="flex items-center gap-2">
 <Mail className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <a href="mailto:legal@safaribub.com" className="text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline">
 legal@safaribub.com
 </a>
 </p>
 <p className="flex items-center gap-2">
 <MessageSquare className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <span>Live chat available 24/7</span>
 </p>
 </div>
 </Section>

 {/* Agreement Confirmation */}
 <div className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
 <div className="flex items-start gap-3">
 <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
 <div>
 <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
 By using SafariHub, you acknowledge that you have read and understood these Terms.
 </h3>
 <p className="text-sm text-emerald-700 dark:text-emerald-400">
 Last updated: {LAST_UPDATED}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </PageLayout>
 )
}