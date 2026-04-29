// ============================================================================
// PRIVACY POLICY PAGE
// ============================================================================
// LOCATION: /frontend/src/app/privacy/page.tsx
// 
// PURPOSE: Display privacy policy and data handling practices
// 
// COMPLIANCE: GDPR, CCPA, and general data protection principles
// 
// IMPORTANT:
// - Must be updated when data handling practices change
// - Should reflect actual data collection and processing
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
 AlertCircle,
 BookOpen,
 Trash2,
 Share2,
 Server,
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

// ============================================================================
// LAST UPDATED DATE
// ============================================================================
const LAST_UPDATED = 'February 17, 2026'

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================
const sections = [
 { id: 'introduction', title: 'Introduction' },
 { id: 'collection', title: 'Information We Collect' },
 { id: 'use', title: 'How We Use Your Information' },
 { id: 'sharing', title: 'Information Sharing' },
 { id: 'security', title: 'Data Security' },
 { id: 'retention', title: 'Data Retention' },
 { id: 'rights', title: 'Your Rights' },
 { id: 'cookies', title: 'Cookies and Tracking' },
 { id: 'children', title: 'Children\'s Privacy' },
 { id: 'changes', title: 'Changes to Policy' },
 { id: 'contact', title: 'Contact Us' }
]

// ============================================================================
// SECTION COMPONENT
// ============================================================================

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
 {Icon && <Icon className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark " />}
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

export default function PrivacyPage() {
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
 <Shield className="w-8 h-8" />
 </div>

 {/* Title */}
 <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
 Privacy Policy
 </h1>

 {/* Description */}
 <p className="text-lg text-blue-100 mb-6">
 Your privacy matters. Learn how we protect your data.
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

 {/* Download PDF Button */}
 <button className="w-full mt-6 px-4 py-3 surface-section text-theme-secondary rounded-xl hover:surface-section dark:hover:surface-section transition-colors flex items-center justify-center gap-2 text-sm">
 <Download className="w-4 h-4" />
 Download PDF
 </button>
 </div>
 </aside>

 {/* Main Content Area */}
 <div className="lg:col-span-3 space-y-12">
 
 {/* Section: Introduction */}
 <Section id="introduction" title="Introduction" icon={FileText}>
 <p>
 SafariHub ("we,""our," or"us") is committed to protecting your privacy. 
 This Privacy Policy explains how we collect, use, disclose, and safeguard your 
 information when you use our platform, website, and services.
 </p>
 <p>
 By using SafariHub, you consent to the data practices described in this policy. 
 If you do not agree with any part of this policy, please do not use our services.
 </p>
 </Section>

 {/* Section: Information Collection */}
 <Section id="collection" title="Information We Collect" icon={Database}>
 <p className="font-semibold text-theme-primary">Personal Information:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Name, email address, phone number</li>
 <li>Profile information (bio, languages, expertise)</li>
 <li>Payment information (processed securely through Whish)</li>
 <li>Government ID (for guide verification)</li>
 <li>Date of birth and nationality (optional)</li>
 </ul>

 <p className="font-semibold text-theme-primary mt-4">Usage Information:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Booking history and preferences</li>
 <li>Messages and communications</li>
 <li>Reviews and ratings</li>
 <li>Device and browser information</li>
 <li>IP address and location data</li>
 <li>Cookies and similar technologies</li>
 </ul>
 </Section>

 {/* Section: How We Use Information */}
 <Section id="use" title="How We Use Your Information" icon={Eye}>
 <p>We use your information to:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Provide and improve our services</li>
 <li>Process bookings and payments</li>
 <li>Verify guide identities</li>
 <li>Communicate about tours and updates</li>
 <li>Personalize your experience</li>
 <li>Resolve disputes and provide support</li>
 <li>Detect and prevent fraud</li>
 <li>Comply with legal obligations</li>
 </ul>
 </Section>

 {/* Section: Information Sharing */}
 <Section id="sharing" title="Information Sharing" icon={Share2}>
 <p>We may share your information with:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li><span className="font-medium">Guides/Travelers:</span> To facilitate bookings and communication</li>
 <li><span className="font-medium">Payment Processors:</span> Whish for secure payment handling</li>
 <li><span className="font-medium">Service Providers:</span> Hosting, analytics, customer support</li>
 <li><span className="font-medium">Legal Authorities:</span> When required by law</li>
 </ul>
 <p className="mt-4">
 We do not sell your personal information to third parties.
 </p>
 </Section>

 {/* Section: Data Security */}
 <Section id="security" title="Data Security" icon={Lock}>
 <p>We implement security measures including:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>256-bit SSL encryption</li>
 <li>Secure data storage</li>
 <li>Regular security audits</li>
 <li>Access controls and authentication</li>
 <li>GDPR-compliant data handling</li>
 </ul>
 <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-3">
 <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
 <p className="text-sm text-emerald-800 dark:text-emerald-300">
 Your payment information is never stored on our servers. All payments are processed securely through Whish.
 </p>
 </div>
 </Section>

 {/* Section: Data Retention */}
 <Section id="retention" title="Data Retention" icon={Server}>
 <p>
 We retain your information for as long as necessary to:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Provide our services</li>
 <li>Comply with legal obligations</li>
 <li>Resolve disputes</li>
 <li>Enforce our agreements</li>
 </ul>
 <p className="mt-4">
 Account information is retained for 5 years after account closure for legal and audit purposes, 
 after which it is anonymized or deleted.
 </p>
 </Section>

 {/* Section: Your Rights */}
 <Section id="rights" title="Your Rights" icon={UserCheck}>
 <p>Depending on your location, you may have the right to:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Access your personal data</li>
 <li>Correct inaccurate data</li>
 <li>Delete your data (right to be forgotten)</li>
 <li>Restrict or object to processing</li>
 <li>Data portability</li>
 <li>Withdraw consent</li>
 </ul>
 <p className="mt-4">
 To exercise these rights, contact us at privacy@safaribub.com.
 </p>
 <div className="mt-4 p-4 bg-primary-light/10 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
 <Globe className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark flex-shrink-0 mt-0.5" />
 <p className="text-sm text-blue-800 dark:text-blue-300">
 We respond to all verified requests within 30 days.
 </p>
 </div>
 </Section>

 {/* Section: Cookies */}
 <Section id="cookies" title="Cookies and Tracking" icon={Cookie}>
 <p>
 We use cookies and similar technologies to:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Keep you logged in</li>
 <li>Remember your preferences</li>
 <li>Analyze site traffic</li>
 <li>Improve user experience</li>
 </ul>
 <p className="mt-4">
 You can control cookies through your browser settings. Disabling cookies may affect functionality.
 </p>
 </Section>

 {/* Section: Children's Privacy */}
 <Section id="children" title="Children's Privacy" icon={Shield}>
 <p>
 SafariHub is not intended for users under 18. We do not knowingly collect information from children. 
 If you believe a child has provided us with personal information, please contact us immediately.
 </p>
 </Section>

 {/* Section: Changes to Policy */}
 <Section id="changes" title="Changes to Policy" icon={FileText}>
 <p>
 We may update this Privacy Policy from time to time. We will notify you of material changes by:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Email notification (for registered users)</li>
 <li>Notice on our website</li>
 <li>In-app notification</li>
 </ul>
 <p className="mt-4">
 Continued use of SafariHub after changes constitutes acceptance of the updated policy.
 </p>
 </Section>

 {/* Section: Contact */}
 <Section id="contact" title="Contact Us" icon={Mail}>
 <p>For privacy-related inquiries:</p>
 <div className="mt-4 space-y-3">
 <p className="flex items-center gap-2">
 <Mail className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <a href="mailto:privacy@safaribub.com" className="text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline">
 privacy@safaribub.com
 </a>
 </p>
 <p className="flex items-center gap-2">
 <Shield className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <span>Data Protection Officer: dpo@safaribub.com</span>
 </p>
 </div>

 <p className="mt-6 font-semibold text-theme-primary">Mailing Address:</p>
 <p className="text-theme-secondary ">
 SafariHub Privacy<br />
 123 Travel Street<br />
 Beirut, Lebanon
 </p>
 </Section>

 {/* GDPR Compliance Note */}
 <div className="mt-12 p-6 bg-primary-light/10 border border-blue-200 dark:border-blue-800 rounded-xl">
 <div className="flex items-start gap-3">
 <Shield className="w-6 h-6 text-primary-light dark:text-primary-dark dark:text-primary-dark flex-shrink-0" />
 <div>
 <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
 GDPR Compliance
 </h3>
 <p className="text-sm text-blue-700 dark:text-primary-dark ">
 SafariHub complies with the General Data Protection Regulation (GDPR) for users in the European Union. 
 You have the right to access, rectify, and erase your personal data.
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