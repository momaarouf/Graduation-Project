// ============================================================================
// GUIDE ONBOARDING INFO PAGE - CARD 10
// ============================================================================
// LOCATION: /frontend/src/app/guide/onboarding/page.tsx
// 
// PURPOSE: Educate potential guides about the verification process and benefits
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Manual ID verification (admin reviews ID + selfie)
// ✓ Impact score and badge system
// ✓ Tiered fees (high-ranked guides pay lower fees)
// ✓ Tour creation tools and benefits
// 
// COLOR PSYCHOLOGY:
// - Blue: Trust, verification, professionalism
// - Gold: Premium, earnings potential
// - Green: Success, completed steps
// - Orange: Call-to-action
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

import { Metadata } from 'next'
import Link from 'next/link'
import { 
 Shield, 
 Camera, 
 CheckCircle, 
 Award, 
 TrendingUp, 
 Users, 
 Globe, 
 Clock,
 DollarSign,
 Star,
 Heart,
 Sparkles,
 ChevronRight,
 HelpCircle
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// METADATA - SEO
// ============================================================================

export const metadata: Metadata = {
 title: 'Become a Guide | SafariHub - Share Your Expertise',
 description: 'Join SafariHub as a verified guide. Share your local knowledge, earn money, and connect with travelers from around the world.',
 keywords: ['become a guide', 'tour guide', 'travel guide', 'earn money', 'global', 'worldwide', 'halal tourism'],
 openGraph: {
 title: 'Become a Guide on SafariHub',
 description: 'Share your expertise, earn money, and connect with travelers.',
 images: [
 {
 url: '/images/og/guide-onboarding.jpg',
 width: 1200,
 height: 630,
 alt: 'SafariHub Guide Program'
 }
 ]
 }
}

// ============================================================================
// STATISTICS - Social Proof
// ============================================================================

const STATISTICS = [
 { 
 icon: Users, 
 value: '1,200+', 
 label: 'Active Guides',
 description: 'Trusted by travelers worldwide'
 },
 { 
 icon: Globe, 
 value: '24+', 
 label: 'Cities',
 description: 'Across the Globe'
 },
 { 
 icon: Star, 
 value: '4.8/5', 
 label: 'Average Rating',
 description: 'From 5,200+ reviews'
 },
 { 
 icon: DollarSign, 
 value: '$2.5M+', 
 label: 'Guide Earnings',
 description: 'Paid out to our community'
 }
]

// ============================================================================
// VERIFICATION STEPS
// ============================================================================

const VERIFICATION_STEPS = [
 {
 icon: Camera,
 title: 'Upload ID',
 description: 'Provide a clear photo of your government-issued ID (passport, national ID, or driver\'s license).',
 details: 'Accepted formats: JPG, PNG, PDF. Max size: 5MB.',
 duration: '2 minutes',
 color: 'blue'
 },
 {
 icon: Camera,
 title: 'Take a Selfie',
 description: 'Take a selfie holding your ID next to your face. This helps us verify it\'s really you.',
 details: 'Make sure both your face and ID are clearly visible.',
 duration: '1 minute',
 color: 'blue'
 },
 {
 icon: Shield,
 title: 'Manual Review',
 description: 'Our team manually reviews your documents within 24 hours. We take security seriously.',
 details: 'You\'ll receive an email notification once verified.',
 duration: 'Up to 24 hours',
 color: 'amber'
 },
 {
 icon: CheckCircle,
 title: 'Get Verified',
 description: 'Once approved, you\'ll receive your"Verified Guide" badge and can start creating tours.',
 details: 'Your profile will show the verified badge to build trust with travelers.',
 duration: 'Instant',
 color: 'green'
 }
]

// ============================================================================
// BENEFITS
// ============================================================================

const BENEFITS = [
 {
 icon: TrendingUp,
 title: 'Earn on Your Terms',
 description: 'Set your own prices, schedule, and tour types. Keep up to 85% of each booking.',
 highlight: 'Average guide earns $450/month',
 color: 'emerald'
 },
 {
 icon: Award,
 title: 'Build Your Reputation',
 description: 'Earn impact score and badges with every booking. Higher scores = lower fees.',
 highlight: 'Top guides pay only 8% commission',
 color: 'amber'
 },
 {
 icon: Users,
 title: 'Global Audience',
 description: 'Reach travelers from around the world who are seeking authentic experiences.',
 highlight: '15K+ active travelers',
 color: 'purple'
 },
 {
 icon: Globe,
 title: 'Free Marketing',
 description: 'We promote your tours through our platform, social media, and email campaigns.',
 highlight: 'No marketing costs',
 color: 'blue'
 },
 {
 icon: Heart,
 title: 'Halal-Friendly Focus',
 description: 'Specialize in serving Muslim travelers with prayer spaces and halal options.',
 highlight: 'Growing niche market',
 color: 'emerald'
 },
 {
 icon: Sparkles,
 title: 'Premium Tools',
 description: 'Access our guide dashboard, analytics, and tour management tools.',
 highlight: 'All features included',
 color: 'pink'
 }
]

// ============================================================================
// TIERED FEES
// ============================================================================

const TIERS = [
 {
 name: 'Bronze',
 commission: '15%',
 impactScore: '0-500',
 requirements: 'New guides',
 color: 'amber',
 bgColor: 'bg-amber-50 dark:bg-amber-950/30',
 borderColor: 'border-amber-200 dark:border-amber-800',
 textColor: 'text-amber-700 dark:text-amber-300'
 },
 {
 name: 'Silver',
 commission: '12%',
 impactScore: '500-1,000',
 requirements: '10+ tours, 4.5+ rating',
 color: 'gray',
 bgColor: 'surface-section',
 borderColor: 'border-theme',
 textColor: 'text-theme-secondary'
 },
 {
 name: 'Gold',
 commission: '10%',
 impactScore: '1,000-2,000',
 requirements: '25+ tours, 4.8+ rating',
 color: 'amber',
 bgColor: 'bg-amber-50 dark:bg-amber-950/30',
 borderColor: 'border-amber-200 dark:border-amber-800',
 textColor: 'text-amber-700 dark:text-amber-300'
 },
 {
 name: 'Platinum',
 commission: '8%',
 impactScore: '2,000+',
 requirements: '50+ tours, 4.9+ rating',
 color: 'blue',
 bgColor: 'bg-primary-light/10 ',
 borderColor: 'border-blue-200 dark:border-blue-800',
 textColor: 'text-blue-700 dark:text-blue-300'
 }
]

// ============================================================================
// STEP CARD COMPONENT
// ============================================================================

interface StepCardProps {
 step: typeof VERIFICATION_STEPS[0]
 index: number
}

function StepCard({ step, index }: StepCardProps) {
 const Icon = step.icon
 const colorClasses = {
 blue: 'bg-primary-light dark:bg-primary-dark',
 amber: 'bg-amber-600 dark:bg-amber-700',
 green: 'bg-emerald-600 dark:bg-emerald-700'
 }

 return (
 <div className="relative group">
 {/* Connector line (except for last item) */}
 {index < VERIFICATION_STEPS.length - 1 && (
 <div className="absolute left-8 top-16 bottom-0 w-0.5 surface-section group-last:hidden" />
 )}

 <div className="relative flex gap-6">
 {/* Step number and icon */}
 <div className="relative">
 <div className={`
 w-16 h-16
 rounded-2xl
 ${colorClasses[step.color as keyof typeof colorClasses]}
 flex items-center justify-center
 text-white
 shadow-lg
 group-hover:scale-110 group-hover:rotate-3
 transition-all duration-300
 `}>
 <Icon className="w-7 h-7" />
 </div>
 
 {/* Step number badge */}
 <div className="
 absolute -top-2 -right-2
 w-6 h-6
 surface-card
 border-2 border-blue-600 dark:border-blue-500
 rounded-full
 flex items-center justify-center
 text-xs font-bold text-primary-light dark:text-primary-dark dark:text-primary-dark ">
 {index + 1}
 </div>
 </div>

 {/* Content */}
 <div className="flex-1 pb-8">
 <div className="flex items-center gap-3 mb-2">
 <h3 className="text-xl font-bold text-theme-primary">
 {step.title}
 </h3>
 <span className="
 px-2 py-1
 surface-section
 text-theme-secondary text-xs font-medium
 rounded-full
 flex items-center gap-1
">
 <Clock className="w-3 h-3" />
 {step.duration}
 </span>
 </div>

 <p className="text-theme-secondary mb-2">
 {step.description}
 </p>
 
 <p className="text-sm text-theme-muted italic">
 {step.details}
 </p>
 </div>
 </div>
 </div>
 )
}

// ============================================================================
// BENEFIT CARD COMPONENT
// ============================================================================

interface BenefitCardProps {
 benefit: typeof BENEFITS[0]
}

function BenefitCard({ benefit }: BenefitCardProps) {
 const Icon = benefit.icon
 const colorClasses = {
 emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
 amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
 purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
 blue: 'text-primary-light dark:text-primary-dark dark:text-primary-dark bg-primary-light/10 border-blue-200 dark:border-blue-800',
 pink: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800'
 }

 return (
 <div className={`
 group relative
 p-6
 rounded-2xl
 border-2
 transition-all duration-300
 hover:shadow-xl hover:-translate-y-1
 ${colorClasses[benefit.color as keyof typeof colorClasses]}
 `}>
 {/* Icon */}
 <div className="
 w-12 h-12
 mb-4
 rounded-xl
 surface-card
 flex items-center justify-center
 shadow-md
 group-hover:scale-110 group-hover:rotate-3
 transition-all duration-300
">
 <Icon className="w-6 h-6" />
 </div>

 {/* Title */}
 <h3 className="text-lg font-bold text-theme-primary mb-2">
 {benefit.title}
 </h3>

 {/* Description */}
 <p className="text-sm text-theme-secondary mb-3">
 {benefit.description}
 </p>

 {/* Highlight */}
 <div className="
 inline-block
 px-3 py-1
 surface-card
 rounded-full
 text-xs font-semibold
 shadow-sm
">
 {benefit.highlight}
 </div>
 </div>
 )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function GuideOnboardingPage() {
 return (
 <PageLayout>
 {/* Page offset for navbar */}
 <div className="pt-14 sm:pt-16">
 
 {/* ========================================
 HERO SECTION
 ======================================== */}
 <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white overflow-hidden">
 {/* Background pattern */}
 <div className="absolute inset-0 bg-theme-grid opacity-10" />
 
 <div className="container-safe mx-auto max-w-7xl py-16 sm:py-20 md:py-24 relative z-10">
 <div className="max-w-3xl mx-auto text-center">
 {/* Pre-header */}
 <div className="
 inline-flex items-center gap-2
 px-4 py-2
 surface-card 
 rounded-full
 text-sm font-medium
 mb-6
">
 <Sparkles className="w-4 h-4" />
 <span>BECOME A VERIFIED GUIDE</span>
 </div>

 {/* Main headline */}
 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
 Share Your Passion,
 <br />
 <span className="text-amber-300">Earn on Your Terms</span>
 </h1>

 {/* Subheadline */}
 <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
 Join SafariHub as a verified guide. Connect with travelers seeking authentic, 
 halal-friendly experiences across the globe.
 </p>

 {/* CTA Buttons */}
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link
 href="/auth/signup?role=guide"
 className="
 inline-flex items-center gap-2
 px-8 py-4
 bg-amber-500 hover:bg-amber-600
 text-white font-bold
 rounded-xl
 transition-all
 shadow-lg hover:shadow-xl
 group
"
 >
 Apply as a Guide
 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
 </Link>
 
 <Link
 href="#how-it-works"
 className="
 inline-flex items-center gap-2
 px-8 py-4
 surface-card hover:surface-card
 
 text-white font-semibold
 rounded-xl
 transition-all
"
 >
 Learn More
 </Link>
 </div>

 {/* Trust badges */}
 <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-blue-200">
 <span className="flex items-center gap-1">
 <CheckCircle className="w-4 h-4" />
 Free to join
 </span>
 <span className="flex items-center gap-1">
 <Clock className="w-4 h-4" />
 15-min setup
 </span>
 <span className="flex items-center gap-1">
 <Shield className="w-4 h-4" />
 ID verification
 </span>
 </div>
 </div>
 </div>
 </section>

 {/* ========================================
 STATISTICS BAR
 ======================================== */}
 <section className="py-12 surface-card border-b border-theme">
 <div className="container-safe mx-auto max-w-7xl">
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
 {STATISTICS.map((stat, index) => {
 const Icon = stat.icon
 return (
 <div key={index} className="text-center">
 <div className="
 inline-flex items-center justify-center
 w-12 h-12
 mb-3
 rounded-xl
 bg-primary-light/10 
 text-primary-light dark:text-primary-dark dark:text-primary-dark ">
 <Icon className="w-6 h-6" />
 </div>
 <div className="text-2xl font-bold text-theme-primary">
 {stat.value}
 </div>
 <div className="text-sm font-medium text-theme-secondary ">
 {stat.label}
 </div>
 <div className="text-xs text-theme-muted mt-1">
 {stat.description}
 </div>
 </div>
 )
 })}
 </div>
 </div>
 </section>

 {/* ========================================
 VERIFICATION PROCESS
 ======================================== */}
 <section id="how-it-works" className="py-16 sm:py-20 surface-section">
 <div className="container-safe mx-auto max-w-7xl">
 {/* Section header */}
 <div className="text-center max-w-2xl mx-auto mb-12">
 <span className="
 inline-block px-3 py-1
 bg-primary-light dark:bg-primary-dark
 text-white text-xs font-bold
 rounded-full
 mb-4
">
 SIMPLE PROCESS
 </span>
 <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-primary mb-4">
 Get Verified in 4 Easy Steps
 </h2>
 <p className="text-theme-secondary ">
 Our manual verification process ensures trust and safety for both guides and travelers.
 Most guides are verified within 24 hours.
 </p>
 </div>

 {/* Steps */}
 <div className="max-w-3xl mx-auto">
 {VERIFICATION_STEPS.map((step, index) => (
 <StepCard key={index} step={step} index={index} />
 ))}
 </div>

 {/* Verification note */}
 <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl max-w-3xl mx-auto">
 <div className="flex items-start gap-3">
 <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
 <p className="text-sm text-amber-800 dark:text-amber-300">
 <span className="font-bold">Privacy protected:</span> Your ID documents are encrypted 
 and only used for verification. They are never shared with travelers or third parties.
 </p>
 </div>
 </div>
 </div>
 </section>

 {/* ========================================
 BENEFITS GRID
 ======================================== */}
 <section className="py-16 sm:py-20 surface-card">
 <div className="container-safe mx-auto max-w-7xl">
 {/* Section header */}
 <div className="text-center max-w-2xl mx-auto mb-12">
 <span className="
 inline-block px-3 py-1
 bg-amber-600 dark:bg-amber-700
 text-white text-xs font-bold
 rounded-full
 mb-4
">
 WHY JOIN?
 </span>
 <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-primary mb-4">
 Benefits of Becoming a Guide
 </h2>
 <p className="text-theme-secondary ">
 Join our community of expert guides and turn your passion into a rewarding income stream.
 </p>
 </div>

 {/* Benefits grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {BENEFITS.map((benefit, index) => (
 <BenefitCard key={index} benefit={benefit} />
 ))}
 </div>
 </div>
 </section>

 {/* ========================================
 TIERED FEE STRUCTURE
 ======================================== */}
 <section className="py-16 sm:py-20 surface-section">
 <div className="container-safe mx-auto max-w-7xl">
 {/* Section header */}
 <div className="text-center max-w-2xl mx-auto mb-12">
 <span className="
 inline-block px-3 py-1
 bg-purple-600 dark:bg-purple-700
 text-white text-xs font-bold
 rounded-full
 mb-4
">
 TIERED FEES
 </span>
 <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-primary mb-4">
 Earn More as You Grow
 </h2>
 <p className="text-theme-secondary ">
 The higher your impact score, the lower your platform fees. Top guides pay as little as 8%.
 </p>
 </div>

 {/* Tiers grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
 {TIERS.map((tier, index) => (
 <div
 key={index}
 className={`
 relative p-6
 rounded-2xl
 border-2
 ${tier.bgColor}
 ${tier.borderColor}
 text-center
 hover:shadow-xl transition-shadow
 `}
 >
 {/* Tier name */}
 <h3 className={`text-xl font-bold mb-2 ${tier.textColor}`}>
 {tier.name}
 </h3>

 {/* Commission */}
 <div className="text-3xl font-bold text-theme-primary mb-1">
 {tier.commission}
 </div>
 <div className="text-sm text-theme-muted mb-4">
 platform fee
 </div>

 {/* Impact score */}
 <div className="text-sm font-medium text-theme-secondary mb-2">
 Score: {tier.impactScore}
 </div>

 {/* Requirements */}
 <div className="text-xs text-theme-muted ">
 {tier.requirements}
 </div>

 {/* Current tier indicator (for demo) */}
 {index === 0 && (
 <div className="absolute -top-2 -right-2">
 <div className="
 w-5 h-5
 bg-green-500
 rounded-full
 border-2 border-white " />
 </div>
 )}
 </div>
 ))}
 </div>

 {/* Impact score explanation */}
 <div className="mt-8 max-w-2xl mx-auto text-center">
 <div className="inline-flex items-center gap-2 text-sm text-theme-secondary ">
 <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 <span>Impact score is based on: completed tours, reviews, response rate, and traveler satisfaction.</span>
 </div>
 </div>
 </div>
 </section>

 {/* ========================================
 FAQ SECTION
 ======================================== */}
 <section className="py-16 sm:py-20 surface-card">
 <div className="container-safe mx-auto max-w-4xl">
 {/* Section header */}
 <div className="text-center max-w-2xl mx-auto mb-12">
 <span className="
 inline-block px-3 py-1
 bg-primary-light dark:bg-primary-dark
 text-white text-xs font-bold
 rounded-full
 mb-4
">
 FAQ
 </span>
 <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-primary mb-4">
 Common Questions
 </h2>
 <p className="text-theme-secondary ">
 Everything you need to know about becoming a guide.
 </p>
 </div>

 {/* FAQ Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="p-6 border border-theme rounded-xl">
 <h3 className="font-bold text-theme-primary mb-2 flex items-center gap-2">
 <HelpCircle className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 How long does verification take?
 </h3>
 <p className="text-theme-secondary text-sm">
 Most guides are verified within 24 hours. You'll receive an email notification once approved.
 </p>
 </div>

 <div className="p-6 border border-theme rounded-xl">
 <h3 className="font-bold text-theme-primary mb-2 flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 When do I get paid?
 </h3>
 <p className="text-theme-secondary text-sm">
 Payouts are released 48 hours after tour completion and processed within 3-5 business days.
 </p>
 </div>

 <div className="p-6 border border-theme rounded-xl">
 <h3 className="font-bold text-theme-primary mb-2 flex items-center gap-2">
 <Globe className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 Can I offer tours in multiple languages?
 </h3>
 <p className="text-theme-secondary text-sm">
 Yes! You can list all languages you speak. Travelers filter by language preferences.
 </p>
 </div>

 <div className="p-6 border border-theme rounded-xl">
 <h3 className="font-bold text-theme-primary mb-2 flex items-center gap-2">
 <Shield className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 Is my ID information secure?
 </h3>
 <p className="text-theme-secondary text-sm">
 Absolutely. All documents are encrypted and only used for verification. Never shared.
 </p>
 </div>
 </div>

 {/* More FAQ link */}
 <div className="text-center mt-8">
 <Link
 href="/faq/guides"
 className="inline-flex items-center gap-1 text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline"
 >
 View all FAQs
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </section>

 {/* ========================================
 FINAL CTA
 ======================================== */}
 <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
 <div className="container-safe mx-auto max-w-4xl text-center">
 <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
 Ready to Start Your Journey?
 </h2>
 <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
 Join hundreds of guides already sharing their expertise with travelers from around the world.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link
 href="/auth/signup?role=guide"
 className="
 inline-flex items-center gap-2
 px-8 py-4
 bg-amber-500 hover:bg-amber-600
 text-white font-bold
 rounded-xl
 transition-all
 shadow-lg hover:shadow-xl
 group
"
 >
 Apply Now
 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
 </Link>
 <Link
 href="/contact"
 className="
 inline-flex items-center gap-2
 px-8 py-4
 surface-card hover:surface-card
 
 text-white font-semibold
 rounded-xl
 transition-all
"
 >
 Contact Us
 </Link>
 </div>
 <p className="text-sm text-blue-200 mt-6">
 No commitment required. Start your application and see if guiding is right for you.
 </p>
 </div>
 </section>
 </div>
 </PageLayout>
 )
}