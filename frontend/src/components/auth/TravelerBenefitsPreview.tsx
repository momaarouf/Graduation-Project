'use client'

// ============================================================================
// TRAVELER BENEFITS PREVIEW - ENHANCED TO MATCH GUIDE WIDTH
// ============================================================================

import {
 Shield,
 MapPin,
 Star,
 Heart,
 Users,
 Camera,
 Award,
 TrendingUp,
 Gift,
 CheckCircle,
 Clock,
 Sparkles,
 Zap,
 Medal,
 Gem,
 ChevronRight,
 Coffee,
 Wallet,
 BadgeCheck,
 Ticket
} from 'lucide-react'

// Define local mock data since it doesn't exist in auth.types.ts
const MOCK_TRAVELER_BENEFITS = {
 features: [
 { title: 'Verified Experiences', description: 'Every guide goes through identity and background checks.' },
 { title: 'Local Immersion', description: 'Go beyond the main tourist spots with genuine local insights.' },
 { title: 'Secure Booking', description: 'Your funds are held safely until after your tour is complete.' },
 { title: '24/7 Support', description: 'Round-the-clock customer service for any issues on your trip.' }
 ]
}

interface TravelerBenefitsPreviewProps {
 /** Show compact version */
 compact?: boolean
 /** Additional CSS classes */
 className?: string
}

// ============================================================================
// FEATURE CARD COMPONENT (Enhanced)
// ============================================================================

interface FeatureCardProps {
 icon: React.ElementType
 title: string
 description: string
 color: 'blue' | 'green' | 'amber' | 'purple' | 'pink' | 'indigo'
 index: number
}

function FeatureCard({ icon: Icon, title, description, color, index }: FeatureCardProps) {
 const colorClasses = {
 blue: {
 light: 'text-primary-light dark:text-primary-dark bg-primary-light/10 border-primary-light dark:border-primary-dark',
 dark: 'dark:text-primary-dark dark:border-primary-light dark:border-primary-dark',
 hover: 'group-hover:bg-blue-100 dark:group-hover:surface-base'
 },
 green: {
 light: 'text-success-green bg-emerald-50 border-success-green',
 dark: 'dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-success-green',
 hover: 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'
 },
 amber: {
 light: 'text-amber-600 bg-amber-50 border-accent-light dark:border-accent-dark',
 dark: 'dark:text-amber-400 dark:bg-amber-950/30 dark:border-accent-light dark:border-accent-dark',
 hover: 'group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40'
 },
 purple: {
 light: 'text-purple-600 bg-purple-50 border-purple-200',
 dark: 'dark:text-purple-400 dark:bg-purple-950/30 dark:border-purple-800',
 hover: 'group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40'
 },
 pink: {
 light: 'text-pink-600 bg-pink-50 border-pink-200',
 dark: 'dark:text-pink-400 dark:bg-pink-950/30 dark:border-pink-800',
 hover: 'group-hover:bg-pink-100 dark:group-hover:bg-pink-900/40'
 },
 indigo: {
 light: 'text-indigo-600 bg-indigo-50 border-indigo-200',
 dark: 'dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-800',
 hover: 'group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40'
 }
 }

 const classes = colorClasses[color]

 return (
 <div className="group relative p-5 surface-card border border-theme rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
 style={{
 animationDelay: `${index * 100}ms`
 }}
 >
 {/* Decorative background gradient */}
 <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color === 'blue' ? 'from-blue-500/5 to-indigo-500/5' : ''} ${color === 'green' ? 'from-emerald-500/5 to-teal-500/5' : ''} ${color === 'amber' ? 'from-amber-500/5 to-orange-500/5' : ''} ${color === 'purple' ? 'from-purple-500/5 to-pink-500/5' : ''} ${color === 'pink' ? 'from-pink-500/5 to-rose-500/5' : ''} ${color === 'indigo' ? 'from-indigo-500/5 to-purple-500/5' : ''}`} />

 {/* Icon container */}
 <div className={`relative w-12 h-12 mb-4 rounded-xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex items-center justify-center ${classes.light} ${classes.dark} ${classes.hover}`}>
 <Icon className="w-5 h-5" />
 </div>

 {/* Title */}
 <h4 className="relative font-bold text-theme-primary mb-1.5 group-hover:text-primary-light dark:text-primary-dark dark:group-hover:text-primary-light dark:text-primary-dark transition-colors">
 {title}
 </h4>

 {/* Description */}
 <p className="relative text-xs sm:text-sm text-theme-muted leading-relaxed">
 {description}
 </p>
 </div>
 )
}

// ============================================================================
// TIER CARD COMPONENT
// ============================================================================

interface TierCardProps {
 name: string
 discount: number
 requirements: string
 icon: React.ElementType
 color: string
 bgColor: string
 borderColor: string
 textColor: string
 isCurrent?: boolean
}

function TierCard({
 name,
 discount,
 requirements,
 icon: Icon,
 color,
 bgColor,
 borderColor,
 textColor,
 isCurrent = false
}: TierCardProps) {
 return (
 <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${bgColor} ${borderColor} ${isCurrent ? 'ring-2 ring-offset-2 ring-primary-light dark:ring-primary-dark dark:ring-primary-light dark:ring-primary-dark' : ''}`}>
 {/* Tier icon */}
 <div className={`w-10 h-10 mb-3 rounded-lg ${color} flex items-center justify-center`}>
 <Icon className="w-5 h-5" />
 </div>

 {/* Tier name */}
 <h5 className={`font-bold text-lg ${textColor} mb-1`}>
 {name}
 </h5>

 {/* Discount */}
 <div className="flex items-baseline gap-1 mb-2">
 <span className="text-2xl font-bold text-theme-primary">
 {discount}%
 </span>
 <span className="text-xs text-theme-muted ">
 discount
 </span>
 </div>

 {/* Requirements */}
 <p className="text-xs text-theme-secondary ">
 {requirements}
 </p>

 {/* Current tier indicator */}
 {isCurrent && (
 <div className="absolute -top-2 -right-2">
 <div className="w-5 h-5 bg-primary-light dark:bg-primary-dark rounded-full flex items-center justify-center border-2 border-theme ">
 <CheckCircle className="w-3 h-3 text-white" />
 </div>
 </div>
 )}
 </div>
 )
}

// ============================================================================
// MAIN COMPONENT - ENHANCED WITH EXTRA SECTIONS
// ============================================================================

export default function TravelerBenefitsPreview({
 compact = false,
 className = ''
}: TravelerBenefitsPreviewProps) {
 const data = MOCK_TRAVELER_BENEFITS

 // Additional content to balance width with Guide component
 const travelerPerks = [
 {
 icon: Coffee,
 title: 'Halal Food Guarantee',
 description: 'All food stops are certified halal with prayer space nearby'
 },
 {
 icon: Wallet,
 title: 'Secure Payments',
 description: 'Funds held safely until 48h after tour completion'
 },
 {
 icon: BadgeCheck,
 title: 'Verified Guides Only',
 description: 'Every guide manually ID-checked by our team'
 },
 {
 icon: Ticket,
 title: 'Exclusive Discounts',
 description: 'Early bird and last-minute deals up to 30% off'
 },
 {
 icon: Clock,
 title: '24/7 Support',
 description: 'Round-the-clock customer service in 5 languages'
 },
 {
 icon: MapPin,
 title: 'Local Immersion',
 description: 'Go beyond tourist spots with genuine local experiences'
 },
 {
 icon: Heart,
 title: 'Traveler Protection',
 description: 'Free cancellation within 48h and dispute resolution'
 },
 {
 icon: Users,
 title: 'Community Reviews',
 description: 'Real feedback from verified travelers only'
 },
 {
 icon: Star,
 title: 'Loyalty Rewards',
 description: 'Earn points toward discounts on future bookings'
 }
 ]

 return (
 <div className={`surface-card border border-theme rounded-2xl overflow-hidden w-full ${className}`}>
 {/* ========================================
 HEADER - Enhanced with more content
 ======================================== */}
 <div className="p-6 sm:p-8 border-b border-[#c8d8f8] dark:border-[#1a3566] bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
 <div className="flex items-start justify-between mb-4">
 <div>
 {/* Pre-header */}
 <span className="inline-block px-2.5 py-1 bg-amber-600 dark:bg-amber-700 text-white text-xs font-bold rounded-full mb-3">
 TRAVELER BENEFITS
 </span>

 <h3 className="text-xl sm:text-2xl font-bold text-theme-primary mb-2">
 Save More With{' '}
 <span className="text-amber-600 dark:text-amber-400">
 Every Trip
 </span>
 </h3>

 <p className="text-sm text-theme-secondary max-w-2xl">
 The more you travel with us, the more you save. Unlock exclusive
 discounts and perks as you explore Lebanon and Turkey.
 </p>
 </div>

 {/* Join count badge */}
 <div className="hidden sm:flex items-center gap-2 px-3 py-2 surface-card rounded-lg border border-theme">
 <Users className="w-4 h-4 text-theme-muted " />
 <span className="text-sm font-medium text-theme-secondary">
 15K+ travelers
 </span>
 </div>
 </div>

 {/* Trust badges - Enhanced with more items */}
 <div className="flex flex-wrap gap-3">
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 surface-card border border-theme rounded-full text-xs">
 <Shield className="w-3 h-3 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 Verified guides
 </span>
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 surface-card border border-theme rounded-full text-xs">
 <MapPin className="w-3 h-3 text-success-green dark:text-emerald-400" />
 Halal-friendly
 </span>
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 surface-card border border-theme rounded-full text-xs">
 <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
 48h refund
 </span>
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 surface-card border border-theme rounded-full text-xs">
 <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
 Group discounts
 </span>
 </div>
 </div>

 {/* ========================================
 FEATURES GRID - Now 3 columns for more width
 ======================================== */}
 {/* ========================================
 FEATURES GRID - With safe color mapping
 ======================================== */}
 <div className="p-6 sm:p-8 border-b border-[#c8d8f8] dark:border-[#1a3566]">
 <h4 className="font-bold text-theme-primary mb-6 flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 What You Get
 </h4>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {/* Original features from data */}
 {data.features.slice(0, 4).map((feature, index) => {
 // Valid color keys only
 const validColors = ['blue', 'green', 'amber', 'purple']
 const icons = [BadgeCheck, MapPin, Wallet, Clock]

 return (
 <FeatureCard
 key={`original-${index}`}
 icon={icons[index % icons.length]}
 title={feature.title}
 description={feature.description}
 color={validColors[index % validColors.length] as any}
 index={index}
 />
 )
 })}

 {/* Additional traveler perks */}
 {travelerPerks.slice(5, 7).map((perk, index) => {
 // Use only valid colors, cycling through them
 const validColors = ['pink', 'indigo']
 const icons = [Users, Shield]

 return (
 <FeatureCard
 key={`perk-${index}`}
 icon={icons[index % icons.length]}
 title={perk.title}
 description={perk.description}
 color={validColors[index % validColors.length] as any}
 index={index + data.features.length}
 />
 )
 })}
 </div>
 </div>

 {/* ========================================
 LOYALTY TIERS - Enhanced layout
 ======================================== */}
 <div className="p-6 sm:p-8 border-b border-[#c8d8f8] dark:border-[#1a3566]">
 <div className="flex items-center justify-between mb-6">
 <h4 className="font-bold text-theme-primary flex items-center gap-2">
 <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 Loyalty Tiers
 </h4>

 <span className="text-xs text-theme-muted ">
 Higher tier = bigger savings
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Bronze */}
 <TierCard
 name="Bronze"
 discount={0}
 requirements="First booking"
 icon={Medal}
 color="text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30"
 bgColor="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
 borderColor="border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark"
 textColor="text-amber-800 dark:text-amber-300"
 />

 {/* Silver */}
 <TierCard
 name="Silver"
 discount={3}
 requirements="3 completed trips"
 icon={Medal}
 color="text-theme-secondary surface-section"
 bgColor="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-900"
 borderColor="border-theme-strong"
 textColor="text-theme-secondary"
 />

 {/* Gold */}
 <TierCard
 name="Gold"
 discount={5}
 requirements="10 completed trips"
 icon={Gem}
 color="text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30"
 bgColor="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30"
 borderColor="border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark"
 textColor="text-amber-700 dark:text-amber-300"
 isCurrent={true}
 />

 {/* Platinum */}
 <TierCard
 name="Platinum"
 discount={8}
 requirements="25+ completed trips"
 icon={Gem}
 color="text-primary-light dark:text-primary-dark bg-blue-100 dark:text-primary-dark "
 bgColor="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
 borderColor="border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark"
 textColor="text-blue-700 dark:text-blue-300"
 />
 </div>
 </div>

 {/* ========================================
 ADDITIONAL SECTION - How It Works
 ======================================== */}
 <div className="p-6 sm:p-8 border-b border-[#c8d8f8] dark:border-[#1a3566] surface-section">
 <h4 className="font-bold text-theme-primary mb-4 flex items-center gap-2">
 <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 How Traveler Benefits Work
 </h4>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
 <div className="p-3">
 <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center text-primary-light dark:text-primary-dark dark:text-primary-dark font-bold">1</div>
 <p className="text-sm font-medium text-theme-primary">Book a tour</p>
 <p className="text-xs text-theme-muted ">Complete your first booking</p>
 </div>
 <div className="p-3">
 <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center text-primary-light dark:text-primary-dark dark:text-primary-dark font-bold">2</div>
 <p className="text-sm font-medium text-theme-primary">Earn points</p>
 <p className="text-xs text-theme-muted ">Each trip counts toward your tier</p>
 </div>
 <div className="p-3">
 <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center text-primary-light dark:text-primary-dark dark:text-primary-dark font-bold">3</div>
 <p className="text-sm font-medium text-theme-primary">Unlock discounts</p>
 <p className="text-xs text-theme-muted ">Save more on future bookings</p>
 </div>
 </div>
 </div>

 {/* ========================================
 GROUP DISCOUNT HIGHLIGHT - Enhanced
 ======================================== */}
 <div className="p-6 sm:p-8 border-b border-[#c8d8f8] dark:border-[#1a3566]">
 <div className="flex items-start gap-4">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
 <Users className="w-6 h-6 text-white" />
 </div>
 <div>
 <h4 className="font-bold text-theme-primary mb-1">
 Extra 5% Group Discount
 </h4>
 <p className="text-sm text-theme-secondary mb-2">
 Traveling with 4+ people? Get an additional 5% off on top of your tier discount.
 Group discount applies even if someone cancels later.
 </p>
 <div className="flex items-center gap-2 text-xs">
 <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
 Stackable
 </span>
 <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:text-blue-300 rounded-full">
 Auto-applied
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* ========================================
 TESTIMONIAL SNIPPET - Adds visual weight
 ======================================== */}
 <div className="p-6 sm:p-8 border-b border-[#c8d8f8] dark:border-[#1a3566]">
 <div className="relative">
 <div className="absolute -top-2 -left-2 text-6xl text-gray-200 font-serif">"</div>
 <div className="relative pl-6">
 <p className="text-sm text-theme-secondary mb-3">
 I've saved over $50 on my trips just by reaching Gold tier. The group discount
 stacked on top made our family tour incredibly affordable!
 </p>
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-700 dark:to-amber-800 flex items-center justify-center text-xs font-bold text-amber-900 dark:text-amber-100">
 AK
 </div>
 <div>
 <p className="text-xs font-semibold text-theme-primary">Ahmed K.</p>
 <p className="text-[10px] text-theme-muted ">Gold Tier Traveler • 12 trips</p>
 </div>
 <div className="ml-auto flex">
 {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* ========================================
 CALL TO ACTION - Wider to match Guide
 ======================================== */}
 <div className="px-6 sm:px-8 py-5 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 flex items-center justify-between">
 <div className="flex items-center gap-2 text-white">
 <Zap className="w-5 h-5" />
 <span className="text-sm font-medium">
 Start your journey today and unlock Bronze tier instantly!
 </span>
 </div>
 <button className="
 px-5 py-3 md:py-2.5
 surface-card hover:surface-card
 text-white text-sm font-semibold
 rounded-lg
 transition-colors
 flex items-center gap-1
 whitespace-nowrap
">
 View all benefits
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 )
}
