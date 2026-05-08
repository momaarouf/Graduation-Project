// ============================================================================
// FAQ PAGE - FREQUENTLY ASKED QUESTIONS
// ============================================================================
// LOCATION: /frontend/src/app/faq/page.tsx
// 
// PURPOSE: Answer common questions about SafariHub
// 
// FEATURES:
// - Categorized FAQs
// - Search functionality
// - Expand/collapse answers
// - Contact link at bottom
// - Schema markup for SEO
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
 Search,
 ChevronDown,
 ChevronUp,
 HelpCircle,
 Mail,
 MessageSquare,
 Phone,
 Shield,
 Users,
 Calendar,
 DollarSign,
 CreditCard,
 MapPin,
 Star,
 Clock,
 X
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================================================
// FAQ CATEGORIES
// ============================================================================

const CATEGORIES = [
 { id: 'all', label: 'All Questions', icon: HelpCircle },
 { id: 'general', label: 'General', icon: Shield },
 { id: 'travelers', label: 'For Travelers', icon: Users },
 { id: 'guides', label: 'For Guides', icon: Star },
 { id: 'bookings', label: 'Bookings', icon: Calendar },
 { id: 'payments', label: 'Payments', icon: CreditCard },
 { id: 'cancellations', label: 'Cancellations', icon: Clock }
]

// ============================================================================
// FAQ DATA
// ============================================================================

const FAQS = [
 // General
 {
 id: 1,
 category: 'general',
 question: 'What is SafariHub?',
 answer: 'SafariHub is a travel marketplace connecting travelers with verified local guides across the globe. We focus on halal-friendly tourism, ensuring authentic experiences with trust and safety at the core.'
 },
 {
 id: 2,
 category: 'general',
 question: 'Is SafariHub free to use?',
 answer: 'Yes! Creating an account and browsing tours is completely free. Travelers only pay when booking a tour. Guides pay a commission on successful bookings, with rates as low as 8% for top performers.'
 },
 {
 id: 3,
 category: 'general',
 question: 'Which countries do you operate in?',
 answer: 'We operate worldwide, connecting travelers with verified local experts in major cities across the globe. We are constantly expanding to new regions to bring you more authentic experiences.'
 },
 
 // Travelers
 {
 id: 4,
 category: 'travelers',
 question: 'How are guides verified?',
 answer: 'Every guide goes through manual ID verification. They upload a government ID and a selfie, which our team reviews within 24-48 hours. Verified guides receive a badge on their profile.'
 },
 {
 id: 5,
 category: 'travelers',
 question: 'What does"halal-friendly" mean?',
 answer: 'Halal-friendly tours include prayer space identification, halal food options, gender-sensitive guides when requested, and respect for Islamic values. Look for the Halal badge on tours.'
 },
 {
 id: 6,
 category: 'travelers',
 question: 'Can I request a custom tour?',
 answer: 'Yes! You can message guides directly to discuss custom itineraries. For group bookings of 4+ people, special arrangements can often be made.'
 },
 {
 id: 7,
 category: 'travelers',
 question: 'How does the loyalty program work?',
 answer: 'Travelers earn tiers based on completed trips: Bronze (0-2 trips), Silver (3-9 trips), Gold (10-24 trips), and Platinum (25+ trips). Higher tiers unlock bigger discounts.'
 },
 
 // Guides
 {
 id: 8,
 category: 'guides',
 question: 'How do I become a guide?',
 answer: 'Sign up as a guide, complete your profile with bio and expertise areas, add languages you speak, and submit ID verification. Our team reviews within 24-48 hours.'
 },
 {
 id: 9,
 category: 'guides',
 question: 'What is the fee structure?',
 answer: 'Platform fees are tiered based on impact score: Bronze (15%), Silver (12%), Gold (10%), and Platinum (8%). Higher scores from completed tours and reviews mean lower fees.'
 },
 {
 id: 10,
 category: 'guides',
 question: 'When do I get paid?',
 answer: 'Payouts are released 48 hours after tour completion (safety freeze). Funds are then transferred to your Whish wallet, bank account, or PayPal within 3-5 business days.'
 },
 {
 id: 11,
 category: 'guides',
 question: 'Can I create recurring tours?',
 answer: 'Yes! You can set up tours as one-time or recurring (daily, weekly, monthly). Each occurrence manages its own capacity and bookings independently.'
 },
 
 // Bookings
 {
 id: 12,
 category: 'bookings',
 question: 'What is the difference between Instant Book and Request to Book?',
 answer: 'Instant Book: Payment confirms booking immediately. Request to Book: Payment is authorized, and guide responds within 24 hours to confirm or reject.'
 },
 {
 id: 13,
 category: 'bookings',
 question: 'How does the waitlist work?',
 answer: 'If a tour is full, you can join the waitlist. If someone cancels, the first waitlisted traveler gets notified and has 24 hours to complete payment and claim the spot.'
 },
 {
 id: 14,
 category: 'bookings',
 question: 'What is the QR handshake?',
 answer: 'At the meeting point, the guide scans your QR code from the app to check you in. This marks the booking as completed and starts the 48-hour payout countdown.'
 },
 
 // Payments
 {
 id: 15,
 category: 'payments',
 question: 'What payment methods are accepted?',
 answer: 'We accept credit/debit cards (Visa, Mastercard), Whish wallet, and PayPal. All payments are processed securely with 256-bit encryption.'
 },
 {
 id: 16,
 category: 'payments',
 question: 'What is the 48-hour payout freeze?',
 answer: 'For traveler protection, payments to guides are held for 48 hours after tour completion. This allows time to report any issues before funds are released.'
 },
 {
 id: 17,
 category: 'payments',
 question: 'Are there any hidden fees?',
 answer: 'No hidden fees. Travelers see the total price including platform fees before booking. Guides see their earnings after commission deduction.'
 },
 
 // Cancellations
 {
 id: 18,
 category: 'cancellations',
 question: 'What is your cancellation policy?',
 answer: 'More than 48 hours before tour: 100% refund (minus platform fee). 24-48 hours before: 50% refund. Less than 24 hours: no refund.'
 },
 {
 id: 19,
 category: 'cancellations',
 question: 'What if minimum capacity is not met?',
 answer: 'If minimum capacity is not met 48 hours before the tour, the tour is automatically cancelled and all travelers receive 100% refund.'
 },
 {
 id: 20,
 category: 'cancellations',
 question: 'Can guides cancel?',
 answer: 'Guides can cancel with Force Majeure (zero ranking penalty) for emergencies. Otherwise, cancellations affect their impact score and may result in platform review.'
 }
]

// ============================================================================
// FAQ ITEM COMPONENT
// ============================================================================

interface FAQItemProps {
 faq: typeof FAQS[0]
 isOpen: boolean
 onToggle: () => void
}

const FAQItem = ({ faq, isOpen, onToggle }: FAQItemProps) => {
 return (
 <div className="border border-theme rounded-xl overflow-hidden surface-card hover:shadow-md transition-shadow">
 <button
 onClick={onToggle}
 className="w-full px-6 py-4 flex items-center justify-between text-left hover:surface-section dark:hover:surface-card transition-colors"
 >
 <h3 className="font-semibold text-theme-primary pr-8">
 {faq.question}
 </h3>
 <div className="flex-shrink-0 ml-4">
 {isOpen ? (
 <ChevronUp className="w-5 h-5 text-theme-muted " />
 ) : (
 <ChevronDown className="w-5 h-5 text-theme-muted " />
 )}
 </div>
 </button>
 
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.3 }}
 className="overflow-hidden"
 >
 <div className="px-6 pb-4 text-theme-secondary leading-relaxed">
 {faq.answer}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function FAQPage() {
 const [searchTerm, setSearchTerm] = useState('')
 const [selectedCategory, setSelectedCategory] = useState('all')
 const [openItems, setOpenItems] = useState<number[]>([])

 // Filter FAQs based on search and category
 const filteredFAQs = FAQS.filter(faq => {
 const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
 const matchesSearch = searchTerm === '' || 
 faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
 faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
 return matchesCategory && matchesSearch
 })

 const toggleItem = (id: number) => {
 setOpenItems(prev =>
 prev.includes(id)
 ? prev.filter(item => item !== id)
 : [...prev, id]
 )
 }

 const toggleAll = () => {
 if (openItems.length === filteredFAQs.length) {
 setOpenItems([])
 } else {
 setOpenItems(filteredFAQs.map(f => f.id))
 }
 }

 return (
 <PageLayout>
 <div className="pt-14 sm:pt-16 surface-card">
 
 {/* Hero Section */}
 <section className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-16 sm:py-20">
 <div className="container-safe mx-auto max-w-7xl text-center">
 <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
 Frequently Asked Questions
 </h1>
 <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
 Find answers to common questions about SafariHub
 </p>
 </div>
 </section>

 {/* Search and Categories */}
 <section className="py-12 surface-card border-b border-theme">
 <div className="mx-auto max-w-4xl">
 
 {/* Search Bar */}
 <div className="relative mb-8">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search FAQs..."
 className="w-full pl-12 pr-10 py-4 surface-section border border-theme rounded-xl text-theme-primary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
 />
 {searchTerm && (
 <button
 onClick={() => setSearchTerm('')}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>

 {/* Category Filters */}
 <div className="flex flex-wrap gap-2">
 {CATEGORIES.map((category) => {
 const Icon = category.icon
 return (
 <button
 key={category.id}
 onClick={() => setSelectedCategory(category.id)}
 className={`
 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
 ${selectedCategory === category.id
 ? 'bg-primary-light text-white shadow-md'
 : 'surface-section text-theme-secondary hover:surface-section dark:hover:surface-section'
 }
 `}
 >
 <Icon className="w-4 h-4" />
 {category.label}
 </button>
 )
 })}
 </div>
 </div>
 </section>

 {/* FAQs List */}
 <section className="py-16 sm:py-20 surface-section">
 <div className="mx-auto max-w-3xl">
 
 {/* Results Count and Toggle All */}
 <div className="flex items-center justify-between mb-6">
 <p className="text-sm text-theme-secondary ">
 Showing <span className="font-semibold">{filteredFAQs.length}</span> questions
 </p>
 <button
 onClick={toggleAll}
 className="text-sm text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline"
 >
 {openItems.length === filteredFAQs.length ? 'Collapse All' : 'Expand All'}
 </button>
 </div>

 {/* FAQ Items */}
 {filteredFAQs.length > 0 ? (
 <div className="space-y-3">
 {filteredFAQs.map((faq) => (
 <FAQItem
 key={faq.id}
 faq={faq}
 isOpen={openItems.includes(faq.id)}
 onToggle={() => toggleItem(faq.id)}
 />
 ))}
 </div>
 ) : (
 <div className="text-center py-16 surface-card border border-theme rounded-xl">
 <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300 " />
 <h3 className="text-lg font-semibold text-theme-primary mb-2">
 No questions found
 </h3>
 <p className="text-sm text-theme-secondary mb-4">
 Try adjusting your search or category filter
 </p>
 </div>
 )}

 {/* Still Have Questions */}
 <div className="mt-12 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl text-center">
 <h3 className="text-xl font-bold text-theme-primary mb-3">
 Still have questions?
 </h3>
 <p className="text-theme-secondary mb-6">
 Can't find what you're looking for? Reach out to our support team.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link
 href="/contact"
 className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-light hover:bg-primary-light-hover text-white font-medium rounded-lg transition-colors"
 >
 <Mail className="w-4 h-4" />
 Contact Us
 </Link>
 <a
 href="mailto:support@safaribub.com"
 className="inline-flex items-center justify-center gap-2 px-6 py-3 surface-card border border-theme text-theme-secondary font-medium rounded-lg hover:surface-section dark:hover:surface-card transition-colors"
 >
 <MessageSquare className="w-4 h-4" />
 Live Chat
 </a>
 </div>
 </div>
 </div>
 </section>

 {/* Schema Markup for SEO */}
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify({
 '@context': 'https://schema.org',
 '@type': 'FAQPage',
 'mainEntity': FAQS.map(faq => ({
 '@type': 'Question',
 'name': faq.question,
 'acceptedAnswer': {
 '@type': 'Answer',
 'text': faq.answer
 }
 }))
 })
 }}
 />
 </div>
 </PageLayout>
 )
}
