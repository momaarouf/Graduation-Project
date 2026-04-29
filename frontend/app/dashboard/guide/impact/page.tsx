// ============================================================================
// GUIDE IMPACT SCORE DETAILS
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/impact/page.tsx
// 
// PURPOSE: Show detailed breakdown of impact score and improvement tips
// 
// FEATURES:
// - Score breakdown by category
// - Progress to next tier
// - Historical score trend
// - Improvement suggestions
// - Badge progress
// - Comparison to averages
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
 Award,
 TrendingUp,
 Users,
 Star,
 Clock,
 CheckCircle,
 AlertCircle,
 ArrowUp,
 ArrowDown,
 ChevronRight,
 ChevronLeft,
 Calendar,
 MessageSquare,
 Target,
 Sparkles,
 Medal,
 Trophy,
 Gem,
 Crown,
 HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ScoreBreakdown {
 category: string
 score: number
 maxScore: number
 weight: number
 description: string
 tips: string[]
 icon: React.ElementType
 color: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink'
}

interface TierInfo {
 name: string
 minScore: number
 maxScore: number
 fee: number
 icon: React.ElementType
 color: string
 benefits: string[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_IMPACT_SCORE = {
 overall: 87,
 rank: 12,
 totalGuides: 1243,
 percentile: 95,
 trend: '+5',
 lastUpdated: '2026-03-15'
}

const MOCK_BREAKDOWN: ScoreBreakdown[] = [
 {
 category: 'Completed Tours',
 score: 156,
 maxScore: 200,
 weight: 40,
 description: 'Number of successfully completed tours',
 tips: [
 'Maintain consistent availability',
 'Offer popular tour times',
 'Create recurring tours for steady bookings'
 ],
 icon: Calendar,
 color: 'blue'
 },
 {
 category: 'Average Rating',
 score: 4.9,
 maxScore: 5,
 weight: 30,
 description: 'Average traveler rating from reviews',
 tips: [
 'Respond to all reviews professionally',
 'Address concerns promptly',
 'Go above and beyond on every tour'
 ],
 icon: Star,
 color: 'amber'
 },
 {
 category: 'Response Rate',
 score: 98,
 maxScore: 100,
 weight: 15,
 description: 'Percentage of messages responded to within 24h',
 tips: [
 'Enable push notifications',
 'Check messages multiple times daily',
 'Set up auto-responses for common questions'
 ],
 icon: MessageSquare,
 color: 'emerald'
 },
 {
 category: 'Repeat Travelers',
 score: 42,
 maxScore: 100,
 weight: 15,
 description: 'Percentage of travelers who book again',
 tips: [
 'Offer returning traveler discounts',
 'Build personal connections',
 'Ask for feedback and improve'
 ],
 icon: Users,
 color: 'purple'
 }
]

const MOCK_TIERS: TierInfo[] = [
 {
 name: 'Bronze',
 minScore: 0,
 maxScore: 500,
 fee: 15,
 icon: Medal,
 color: 'amber',
 benefits: [
 'Access to platform',
 'Basic support',
 'Standard visibility'
 ]
 },
 {
 name: 'Silver',
 minScore: 500,
 maxScore: 1000,
 fee: 12,
 icon: Medal,
 color: 'gray',
 benefits: [
 'Priority support',
 'Featured in search',
 'Early access to new features'
 ]
 },
 {
 name: 'Gold',
 minScore: 1000,
 maxScore: 2000,
 fee: 10,
 icon: Gem,
 color: 'amber',
 benefits: [
 'VIP support',
 'Top search placement',
 'Free promo credits',
 'Dedicated account manager'
 ]
 },
 {
 name: 'Platinum',
 minScore: 2000,
 maxScore: Infinity,
 fee: 8,
 icon: Crown,
 color: 'blue',
 benefits: [
 '24/7 priority support',
 'Exclusive partnerships',
 'Featured guide badge',
 'Revenue share bonus',
 'Early beta access'
 ]
 }
]

const MOCK_HISTORY = [
 { month: 'Oct', score: 72 },
 { month: 'Nov', score: 75 },
 { month: 'Dec', score: 78 },
 { month: 'Jan', score: 82 },
 { month: 'Feb', score: 85 },
 { month: 'Mar', score: 87 }
]

// ============================================================================
// SCORE CARD COMPONENT
// ============================================================================

const ScoreCard = ({ breakdown }: { breakdown: ScoreBreakdown }) => {
 const Icon = breakdown.icon
 const percentage = (breakdown.score / breakdown.maxScore) * 100

 const colorClasses = {
 blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark ',
 emerald: 'bg-success-green/10 dark:bg-emerald-950/30 text-success-green dark:text-emerald-400',
 amber: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/30 text-accent-light dark:text-accent-dark dark:text-amber-400',
 purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
 pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
 }

 return (
 <div className="surface-card border border-theme rounded-xl p-6 hover:shadow-lg transition-all">
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className={`p-2.5 rounded-lg ${colorClasses[breakdown.color]}`}>
 <Icon className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-semibold text-theme-primary">
 {breakdown.category}
 </h3>
 <p className="text-xs text-theme-muted ">
 Weight: {breakdown.weight}%
 </p>
 </div>
 </div>
 <div className="text-right">
 <span className="text-xl font-bold text-theme-primary">
 {breakdown.score}
 </span>
 <span className="text-sm text-theme-muted ">
 /{breakdown.maxScore}
 </span>
 </div>
 </div>

 {/* Progress Bar */}
 <div className="w-full h-2 surface-section rounded-full overflow-hidden mb-3">
 <div
 className={`h-full rounded-full ${colorClasses[breakdown.color].split(' ')[0]}`}
 style={{ width: `${percentage}%` }}
 />
 </div>

 <p className="text-sm text-theme-secondary mb-4">
 {breakdown.description}
 </p>

 {/* Tips */}
 <div className="space-y-2">
 <p className="text-xs font-semibold text-theme-secondary flex items-center gap-1">
 <Target className="w-3 h-3" />
 Tips to improve:
 </p>
 {breakdown.tips.map((tip, index) => (
 <div key={index} className="flex items-start gap-2 text-xs text-theme-secondary ">
 <CheckCircle className="w-3 h-3 text-success-green dark:text-emerald-400 mt-0.5 flex-shrink-0" />
 <span>{tip}</span>
 </div>
 ))}
 </div>
 </div>
 )
}

// ============================================================================
// TIER CARD COMPONENT
// ============================================================================

const TierCard = ({ tier, currentScore, isCurrent }: { tier: TierInfo; currentScore: number; isCurrent: boolean }) => {
 const Icon = tier.icon
 const progress = tier.maxScore !== Infinity 
 ? ((currentScore - tier.minScore) / (tier.maxScore - tier.minScore)) * 100
 : 100

 return (
 <div className={`
 relative p-5 rounded-xl border-2 transition-all
 ${isCurrent 
 ? `border-${tier.color}-500 bg-${tier.color}-50 dark:bg-${tier.color}-950/20 shadow-lg` 
 : 'border-theme surface-card opacity-60'
 }
 `}>
 {isCurrent && (
 <div className="absolute -top-2 -right-2">
 <span className="px-2 py-1 bg-primary-light text-white text-xs font-bold rounded-full">
 Current
 </span>
 </div>
 )}

 <div className="flex items-center gap-3 mb-3">
 <div className={`p-2 rounded-lg ${
 tier.color === 'amber' ? 'bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/30 text-accent-light dark:text-accent-dark dark:text-amber-400' :
 tier.color === 'gray' ? 'surface-section text-theme-secondary ' :
 'bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark dark:text-primary-dark '
 }`}>
 <Icon className="w-5 h-5" />
 </div>
 <div>
 <h4 className="font-bold text-theme-primary">{tier.name}</h4>
 <p className="text-xs text-theme-muted ">
 Fee: {tier.fee}% • Score: {tier.minScore}{tier.maxScore !== Infinity ? `-${tier.maxScore}` : '+'}
 </p>
 </div>
 </div>

 <div className="space-y-2 mb-3">
 {tier.benefits.slice(0, 3).map((benefit, index) => (
 <div key={index} className="flex items-start gap-2 text-xs">
 <CheckCircle className="w-3 h-3 text-success-green dark:text-emerald-400 mt-0.5 flex-shrink-0" />
 <span className="text-theme-secondary ">{benefit}</span>
 </div>
 ))}
 </div>

 {!isCurrent && currentScore < tier.minScore && (
 <div className="mt-2">
 <div className="w-full h-1.5 surface-section rounded-full overflow-hidden">
 <div
 className="h-full bg-primary-light rounded-full"
 style={{ width: `${(currentScore / tier.minScore) * 100}%` }}
 />
 </div>
 <p className="text-xs text-theme-muted mt-1">
 {tier.minScore - currentScore} points to go
 </p>
 </div>
 )}
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideImpactPage() {
 const [showTips, setShowTips] = useState(true)
 const currentScore = MOCK_IMPACT_SCORE.overall

 // Determine current tier
 const currentTier = MOCK_TIERS.find(tier => 
 currentScore >= tier.minScore && currentScore <= (tier.maxScore || Infinity)
 ) || MOCK_TIERS[0]

 return (
 <>
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">
 <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <Link
 href="/dashboard/guide"
 className="text-sm text-theme-muted hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors"
 >
 ← Back to Dashboard
 </Link>
 </div>
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1">
 Impact Score
 </h1>
 <p className="text-sm text-theme-secondary ">
 Understand your score and how to improve
 </p>
 </div>
 </div>

 {/* Score Overview */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
 <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-8 text-white">
 <div className="flex items-start justify-between mb-4">
 <div>
 <p className="text-blue-100 mb-1">Your Impact Score</p>
 <div className="flex items-end gap-2">
 <span className="text-5xl font-bold">{currentScore}</span>
 <span className="text-xl text-blue-200"></span>
 </div>
 </div>
 <div className="px-3 py-1 surface-card  rounded-full text-sm">
 {currentTier.name} Tier
 </div>
 </div>

 <div className="grid grid-cols-3 gap-4">
 <div>
 <p className="text-blue-200 text-xs">Rank</p>
 <p className="text-xl font-bold">#{MOCK_IMPACT_SCORE.rank}</p>
 <p className="text-xs text-blue-200">of {MOCK_IMPACT_SCORE.totalGuides}</p>
 </div>
 <div>
 <p className="text-blue-200 text-xs">Percentile</p>
 <p className="text-xl font-bold">Top {MOCK_IMPACT_SCORE.percentile}%</p>
 </div>
 <div>
 <p className="text-blue-200 text-xs">Trend</p>
 <p className="text-xl font-bold text-emerald-300">+5%</p>
 <p className="text-xs text-blue-200">this month</p>
 </div>
 </div>
 </div>

 <div className="surface-card border border-theme rounded-xl p-6">
 <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
 <Award className="w-4 h-4 text-accent-light dark:text-accent-dark dark:text-amber-400" />
 Next Tier Benefits
 </h3>
 {currentTier.name !== 'Platinum' && (
 <>
 <div className="mb-4">
 <p className="text-sm text-theme-secondary mb-1">
 Next: {MOCK_TIERS[MOCK_TIERS.indexOf(currentTier) + 1]?.name}
 </p>
 <div className="w-full h-2 surface-section rounded-full overflow-hidden">
 <div
 className="h-full bg-primary-light rounded-full"
 style={{ width: '45%' }}
 />
 </div>
 </div>
 <ul className="space-y-2">
 {MOCK_TIERS[MOCK_TIERS.indexOf(currentTier) + 1]?.benefits.slice(0, 3).map((benefit, index) => (
 <li key={index} className="flex items-start gap-2 text-sm">
 <Sparkles className="w-4 h-4 text-accent-light dark:text-accent-dark dark:text-amber-400 mt-0.5 flex-shrink-0" />
 <span className="text-theme-secondary ">{benefit}</span>
 </li>
 ))}
 </ul>
 </>
 )}
 </div>
 </div>

 {/* Score Breakdown */}
 <h2 className="text-lg font-semibold text-theme-primary mb-4">
 Score Breakdown
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
 {MOCK_BREAKDOWN.map((item, index) => (
 <ScoreCard key={index} breakdown={item} />
 ))}
 </div>

 {/* Tier Comparison */}
 <h2 className="text-lg font-semibold text-theme-primary mb-4">
 Tier Comparison
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
 {MOCK_TIERS.map((tier, index) => (
 <TierCard
 key={index}
 tier={tier}
 currentScore={currentScore}
 isCurrent={tier.name === currentTier.name}
 />
 ))}
 </div>

 {/* FAQ Link */}
 <div className="mt-8 p-4 bg-primary-light/10 rounded-xl flex items-center justify-between">
 <div className="flex items-center gap-3">
 <HelpCircle className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <p className="text-sm text-blue-800 dark:text-blue-300">
 Learn more about how impact scores are calculated
 </p>
 </div>
 <Link
 href="/faq/impact-score"
 className="text-sm text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline flex items-center gap-1"
 >
 View FAQ
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </div>
 </>
 )
}