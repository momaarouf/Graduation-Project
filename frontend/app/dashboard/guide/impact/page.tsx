// ============================================================================
// GUIDE IMPACT SCORE DETAILS
// ============================================================================
// LOCATION: /frontend/app/dashboard/guide/impact/page.tsx
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
 Award,
 Users,
 Star,
 Clock,
 CheckCircle,
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
 HelpCircle,
 TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'

// ============================================================================
// CONFIGS
// ============================================================================

const MOCK_IMPACT_SCORE = {
 overall: 87,
 rank: 12,
 totalGuides: 1243,
 percentile: 95,
 trend: '+5',
 lastUpdated: '2026-03-15'
}

const MOCK_BREAKDOWN: any[] = [
 {
 category: 'Completed Tours',
 score: 156,
 maxScore: 200,
 weight: 40,
 description: 'Successful expedition fulfillment volume',
 tips: ['Maintain availability', 'Offer popular slots', 'Create recurring tours'],
 icon: Calendar,
 color: 'blue'
 },
 {
 category: 'Average Rating',
 score: 4.9,
 maxScore: 5,
 weight: 30,
 description: 'Traveler sentiment & review average',
 tips: ['Professional replies', 'Prompt resolution', 'Above-and-beyond service'],
 icon: Star,
 color: 'amber'
 },
 {
 category: 'Response Rate',
 score: 98,
 maxScore: 100,
 weight: 15,
 description: 'Engagement speed within 24h window',
 tips: ['Enable notifications', 'Daily check-ins', 'Set auto-responses'],
 icon: MessageSquare,
 color: 'emerald'
 },
 {
 category: 'Repeat Travelers',
 score: 42,
 maxScore: 100,
 weight: 15,
 description: 'Customer loyalty & retention metric',
 tips: ['Returning discounts', 'Personal connections', 'Request feedback'],
 icon: Users,
 color: 'purple'
 }
]

const MOCK_TIERS: any[] = [
 { name: 'Bronze', minScore: 0, maxScore: 500, fee: 15, icon: Medal, color: 'amber', benefits: ['Access to platform', 'Basic support', 'Standard visibility'] },
 { name: 'Silver', minScore: 500, maxScore: 1000, fee: 12, icon: Medal, color: 'slate', benefits: ['Priority support', 'Featured in search', 'Early access features'] },
 { name: 'Gold', minScore: 1000, maxScore: 2000, fee: 10, icon: Gem, color: 'amber', benefits: ['VIP support', 'Top search placement', 'Promo credits'] },
 { name: 'Platinum', minScore: 2000, maxScore: Infinity, fee: 8, icon: Crown, color: 'blue', benefits: ['24/7 Priority', 'Exclusive partners', 'Revenue bonuses'] }
]

// ============================================================================
// COMPONENTS
// ============================================================================

function ScoreMetricCard({ item }: { item: any }) {
 const Icon = item.icon
 const pct = (item.score / item.maxScore) * 100
 const colorClasses: any = {
 blue: 'bg-primary-light/10 text-primary-light border-primary-light/20',
 emerald: 'bg-success-green/10 text-success-green border-success-green/20',
 amber: 'bg-accent-light/10 text-accent-light dark:text-accent-dark border-accent-light/20',
 purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
 }
 return (
 <div className="surface-card border border-theme rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-all group">
 <div className="flex items-start justify-between mb-6">
 <div className="flex items-center gap-4">
 <div className={`p-3 rounded-xl border ${colorClasses[item.color]} group-hover:scale-110 transition-transform`}>
 <Icon className="w-6 h-6" />
 </div>
 <div>
 <h3 className="font-bold text-theme-primary capitalize tracking-tight">{item.category}</h3>
 <p className="text-[9px] font-bold capitalize tracking-normal text-theme-muted opacity-70">Weight: {item.weight}%</p>
 </div>
 </div>
 <div className="text-right">
 <span className="text-2xl font-bold text-theme-primary tracking-tighter">{item.score}</span>
 <span className="text-[10px] font-bold text-theme-muted opacity-60">/{item.maxScore}</span>
 </div>
 </div>

 <div className="w-full h-3 surface-section rounded-full overflow-hidden mb-6 p-0.5 border border-theme shadow-inner">
 <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full rounded-full ${colorClasses[item.color].split(' ')[0]} shadow-lg`} />
 </div>

 <p className="text-[11px] font-bold text-theme-secondary opacity-80 leading-relaxed mb-6">{item.description}</p>

 <div className="space-y-3 bg-surface-section/50 p-4 rounded-xl border border-theme">
 <p className="text-[9px] font-bold capitalize tracking-normal text-primary-light flex items-center gap-2">
 <Target className="w-3.5 h-3.5" /> Growth Targets
 </p>
 {item.tips.map((tip: string, idx: number) => (
 <div key={idx} className="flex items-start gap-2.5 text-[10px] font-bold text-theme-secondary leading-tight group/tip">
 <CheckCircle className="w-3.5 h-3.5 text-success-green shrink-0 group-hover/tip:scale-125 transition-transform" />
 <span>{tip}</span>
 </div>
 ))}
 </div>
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideImpactPage() {
 const score = MOCK_IMPACT_SCORE.overall
 const currentTier = MOCK_TIERS.find(t => score >= t.minScore && score <= (t.maxScore || Infinity)) || MOCK_TIERS[0]
 const nextTier = MOCK_TIERS[MOCK_TIERS.indexOf(currentTier) + 1]

 return (
 <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
 <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
 
 {/* Navigation */}
 <div className="flex items-center gap-3">
 <Link href="/dashboard/guide" className="p-2 text-theme-muted hover:text-primary-light transition-all rounded-xl hover:surface-section border border-transparent hover:border-theme"><ChevronLeft className="w-5 h-5" /></Link>
 <div className="h-px w-8 bg-theme hidden sm:block" />
 <span className="text-[10px] font-bold capitalize tracking-[0.3em] text-theme-muted opacity-60">Operations / Quality Control</span>
 </div>

 {/* Hero Hub */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-indigo-600 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/30">
 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
 <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-light/20 rounded-full blur-[60px] -ml-24 -mb-24" />
 
 <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
 <div>
 <p className="text-[11px] font-bold capitalize tracking-[0.4em] text-indigo-200 mb-4">Marketplace Impact Hub</p>
 <div className="flex items-end gap-3 mb-8">
 <span className="text-6xl sm:text-8xl font-bold tracking-tighter leading-none">{score}</span>
 <span className="text-sm font-bold capitalize tracking-normal text-indigo-300 mb-2">/ Index</span>
 </div>
 <div className="flex flex-wrap gap-6 sm:gap-12">
 <div>
 <p className="text-indigo-200 text-[10px] font-bold capitalize tracking-normal mb-1 opacity-80">Global Rank</p>
 <p className="text-2xl font-bold tracking-tight">#{MOCK_IMPACT_SCORE.rank} <span className="text-xs opacity-50">/ {MOCK_IMPACT_SCORE.totalGuides}</span></p>
 </div>
 <div>
 <p className="text-indigo-200 text-[10px] font-bold capitalize tracking-normal mb-1 opacity-80">Percentile</p>
 <p className="text-2xl font-bold tracking-tight">Top {MOCK_IMPACT_SCORE.percentile}%</p>
 </div>
 <div>
 <p className="text-indigo-200 text-[10px] font-bold capitalize tracking-normal mb-1 opacity-80">Trend</p>
 <p className="text-2xl font-bold tracking-tight text-emerald-400">{MOCK_IMPACT_SCORE.trend}% <TrendingUp className="inline w-5 h-5 mb-1" /></p>
 </div>
 </div>
 </div>
 <div className="flex flex-col items-center sm:items-end gap-4">
 <div className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-[10px] font-bold capitalize tracking-normal shadow-xl">{currentTier.name} Status</div>
 <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-inner group cursor-pointer hover:scale-110 transition-transform"><Trophy className="w-10 h-10 text-amber-400 group-hover:animate-bounce" /></div>
 </div>
 </div>
 </motion.div>

 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="surface-card border border-theme rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-10 shadow-xl flex flex-col justify-between">
 <div>
 <h3 className="text-sm font-bold text-theme-primary mb-6 capitalize tracking-normal flex items-center gap-3"><Sparkles className="w-5 h-5 text-accent-light" /> Tier Progression</h3>
 {nextTier ? (
 <div className="space-y-8">
 <div className="space-y-4">
 <div className="flex justify-between items-end">
 <p className="text-[11px] font-bold capitalize tracking-normal text-theme-muted">Target: {nextTier.name}</p>
 <p className="text-xs font-bold text-primary-light">45%</p>
 </div>
 <div className="w-full h-3 surface-section rounded-full overflow-hidden p-0.5 border border-theme shadow-inner">
 <div className="h-full w-[45%] bg-primary-light rounded-full shadow-lg" />
 </div>
 </div>
 <div className="space-y-4">
 <p className="text-[10px] font-bold capitalize tracking-normal text-theme-muted opacity-70">Upcoming Unlockables</p>
 <ul className="space-y-3">
 {nextTier.benefits.slice(0, 3).map((b: string, idx: number) => (
 <li key={idx} className="flex items-center gap-3 text-[10px] font-bold text-theme-secondary group cursor-default hover:text-theme-primary transition-colors"><Gem className="w-4 h-4 text-accent-light group-hover:scale-125 transition-transform" /> {b}</li>
 ))}
 </ul>
 </div>
 </div>
 ) : (
 <div className="text-center py-10"><Crown className="w-16 h-16 text-primary-light mx-auto mb-4" /><p className="font-bold text-theme-primary capitalize tracking-tight">Apex Platinum Status</p></div>
 )}
 </div>
 <button className="w-full py-4 mt-8 surface-section hover:surface-base border border-theme rounded-2xl text-[10px] font-bold capitalize tracking-normal transition-all active:scale-95">Rewards Dashboard</button>
 </motion.div>
 </div>

 {/* Breakdown Grid */}
 <div className="space-y-6">
 <div className="flex items-end justify-between">
 <div>
 <h2 className="text-xl sm:text-2xl font-bold text-theme-primary capitalize tracking-tight">Metric Breakdown</h2>
 <p className="text-[10px] font-bold capitalize tracking-normal text-theme-muted opacity-70 mt-1">Detailed performance audit</p>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
 {MOCK_BREAKDOWN.map((item, idx) => <ScoreMetricCard key={idx} item={item} />)}
 </div>
 </div>

 {/* Tier Hub */}
 <div className="space-y-6">
 <h2 className="text-xl sm:text-2xl font-bold text-theme-primary capitalize tracking-tight">Service Tiers</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 {MOCK_TIERS.map((tier, idx) => {
 const Icon = tier.icon
 const isCurrent = tier.name === currentTier.name
 return (
 <div key={idx} className={`p-6 rounded-3xl border-2 transition-all relative ${isCurrent ? 'border-primary-light bg-primary-light/5 shadow-2xl' : 'border-theme surface-card opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:border-primary-light/30'}`}>
 {isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary-light text-white text-[9px] font-bold capitalize tracking-normal rounded-full shadow-lg">Current Level</div>}
 <div className="flex items-center gap-3 mb-6">
 <div className={`p-3 rounded-xl ${tier.color === 'amber' ? 'bg-accent-light/10 text-accent-light' : tier.color === 'slate' ? 'surface-section text-theme-muted' : 'bg-primary-light/10 text-primary-light'} border border-current/20 shadow-sm`}><Icon className="w-6 h-6" /></div>
 <div className="min-w-0"><h4 className="font-bold text-theme-primary capitalize tracking-tight truncate">{tier.name}</h4><p className="text-[9px] font-bold capitalize tracking-normal text-theme-muted opacity-70">Fee: {tier.fee}%</p></div>
 </div>
 <div className="space-y-3 mb-6 border-t border-theme pt-4">
 {tier.benefits.map((b: string, i: number) => <div key={i} className="flex items-center gap-2.5 text-[9px] font-bold text-theme-secondary"><CheckCircle className="w-3.5 h-3.5 text-success-green shrink-0" /> {b}</div>)}
 </div>
 <div className="text-[9px] font-bold capitalize tracking-[0.2em] text-center text-theme-muted py-2 bg-surface-section rounded-xl border border-theme">Score: {tier.minScore}{tier.maxScore !== Infinity ? `-${tier.maxScore}` : '+'}</div>
 </div>
 )
 })}
 </div>
 </div>

 {/* Help Hub */}
 <div className="p-6 sm:p-8 bg-surface-card border border-theme rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-primary-light/30 transition-all">
 <div className="flex items-center gap-5 text-center sm:text-left">
 <div className="p-4 bg-primary-light/10 text-primary-light rounded-2xl group-hover:scale-110 transition-transform"><HelpCircle className="w-8 h-8" /></div>
 <div>
 <h3 className="font-bold text-theme-primary capitalize tracking-tight mb-1">Knowledge Base</h3>
 <p className="text-[10px] font-bold capitalize tracking-normal text-theme-muted opacity-70">Deep dive into Impact Score logic & calculations</p>
 </div>
 </div>
 <Link href="/faq/impact-score" className="w-full sm:w-auto px-8 py-4 surface-section border border-theme hover:bg-primary-light hover:text-white hover:border-primary-light rounded-2xl text-[10px] font-bold capitalize tracking-normal transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2">View FAQ <ChevronRight className="w-4 h-4" /></Link>
 </div>
 </div>
 </div>
 )
}
