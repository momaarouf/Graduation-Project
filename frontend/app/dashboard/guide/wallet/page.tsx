'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
 Wallet, 
 ArrowUpRight, 
 Clock, 
 CheckCircle2, 
 AlertCircle, 
 ExternalLink, 
 Info,
 RefreshCw,
 ShieldCheck,
 History,
 CreditCard,
 Sparkles,
 Plus,
 X,
 Lock
} from 'lucide-react'
import { 
 getGuideWalletSummary, 
 getGuidePayoutHistory, 
 mockOnboardStripe,
 GuideWalletResponse 
} from '@/src/lib/api/guide-payouts'
import { PaymentResponse } from '@/src/lib/types/tour.types'
import toast from 'react-hot-toast'


// ==================== MOBILE CARD ====================
function PayoutCard({ p }: { p: PaymentResponse }) {
  const isPaid = p.payoutStatus === 'Transferred';
  const isPending = p.payoutStatus === 'Pending';
  
  return (
    <div className="surface-card rounded-xl border border-theme p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-light/10 flex items-center justify-center">
            <History className="w-4 h-4 text-primary-light" />
          </div>
          <div>
            <div className="text-sm font-bold text-theme-primary">Booking #{p.bookingId}</div>
            <div className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Tour Settlement</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-theme-primary">
            {p.currency} {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-theme">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">Date</span>
          <span className="text-xs font-bold text-theme-secondary">
            {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
          </span>
        </div>
        <div>
          {isPaid ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success-green/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md border border-success-green/20">
              PAID
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light/10 text-blue-600 dark:text-primary-dark text-[10px] font-bold rounded-md border border-primary-light/20">
              ESCROW
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-danger-red/10 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-md border border-danger-red/20">
              FAILED
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GuideWalletPage() {
 const [summary, setSummary] = useState<GuideWalletResponse | null>(null)
 const [payouts, setPayouts] = useState<PaymentResponse[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [isLinking, setIsLinking] = useState(false)
 const [onboardingData, setOnboardingData] = useState({
 brand: 'Visa',
 last4: '4242',
 type: 'card'
 })

 const fetchData = async () => {
 setIsLoading(true)
 try {
 const [summ, history] = await Promise.all([
 getGuideWalletSummary(),
 getGuidePayoutHistory()
 ])
 setSummary(summ)
 setPayouts(history)
 } catch (err) {
 console.error('Failed to load wallet data:', err)
 toast.error('Could not load financial data')
 } finally {
 setIsLoading(false)
 }
 }

 useEffect(() => {
 fetchData()
 }, [])

 const handleOnboard = async () => {
 setIsLinking(true)
 try {
 await mockOnboardStripe({
 brand: onboardingData.brand,
 last4: onboardingData.last4,
 type: onboardingData.type
 })
 toast.success('Payout method linked successfully!')
 fetchData()
 } catch (err) {
 toast.error('Onboarding failed')
 } finally {
 setIsLinking(false)
 }
 }

  if (isLoading && !summary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center surface-base">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-primary-light animate-spin" />
          <p className="text-sm font-bold text-theme-muted animate-pulse uppercase tracking-widest">Loading your wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar">
      <div className="max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 space-y-8">
 {/* Header section */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
 <div>
 <h1 className="text-3xl font-bold text-theme-primary tracking-tight">Wallet & Earnings</h1>
 <p className="text-theme-muted mt-1 font-medium">Manage your payouts and track your performance.</p>
 </div>
 <button 
 onClick={fetchData}
 className="flex items-center gap-2 px-4 py-2 surface-card border border-theme rounded-xl text-sm font-bold text-theme-secondary hover:surface-section dark:hover:surface-card transition-all shadow-sm"
 >
 <RefreshCw className="w-4 h-4" />
 Refresh
 </button>
 </div>

 {/* Top Row: Balance Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {[
 { 
 label: 'Available Balance', 
 value: summary?.availableBalance || 0, 
 icon: CheckCircle2, 
 color: 'text-success-green dark:text-emerald-400',
 bg: 'bg-success-green/10 dark:bg-emerald-950/20',
 border: 'border-success-green dark:border-success-green/50',
 subtext: 'Already transferred to your account'
 },
 { 
 label: 'Pending (Escrow)', 
 value: summary?.pendingBalance || 0, 
 icon: Clock, 
 color: 'text-primary-light dark:text-primary-dark dark:text-primary-dark ',
 bg: 'bg-primary-light/10 ',
 border: 'border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/50',
 subtext: 'Held for 48h after tour completion',
 info: 'We hold funds briefly to ensure traveler satisfaction before releasing them to your account.'
 },
 { 
 label: 'Lifetime Earnings', 
 value: summary?.totalEarned || 0, 
 icon: ShieldCheck, 
 color: 'text-accent-light dark:text-accent-dark dark:text-amber-400',
 bg: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/20',
 border: 'border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/50',
 subtext: 'Total net income on SafariBub'
 }
 ].map((card, i) => (
 <motion.div 
 key={i}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 className={`${card.bg} ${card.border} border-2 rounded-[2.5rem] p-8 shadow-sm group hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden`}
 >
 <div className="absolute top-0 right-0 w-24 h-24 surface-card dark:bg-black/5 rounded-full blur-3xl -mr-12 -mt-12" />
 
 <div className="flex items-center justify-between mb-6">
 <div className={`p-3 surface-card rounded-2xl shadow-sm ${card.color}`}>
 <card.icon className="w-6 h-6" />
 </div>
 {card.info && (
 <div className="group/info relative">
 <Info className="w-5 h-5 text-theme-muted cursor-help" />
 <div className="absolute right-0 bottom-full mb-2 w-64 p-3 surface-base text-white text-xs rounded-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-10 font-normal leading-relaxed">
 {card.info}
 </div>
 </div>
 )}
 </div>

 <div className="space-y-1">
 <div className="text-3xl font-bold text-theme-primary">
 {summary?.currency || 'USD'} {card.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
 </div>
 <div className="text-[10px] font-bold text-theme-muted uppercase tracking-widest">
 {card.label}
 </div>
 </div>

 <p className="mt-4 text-xs font-medium text-theme-muted opacity-0 group-hover:opacity-100 transition-opacity">
 {card.subtext}
 </p>
 </motion.div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Withdrawal / Stripe Status Section */}
 <div className="space-y-6">
 <motion.div 
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 className="surface-card border border-theme rounded-3xl p-8 shadow-sm"
 >
 <div className="flex items-center gap-4 mb-6">
 <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-light/20">
 <CreditCard className="w-6 h-6" />
 </div>
 <div>
 <h2 className="text-xl font-bold text-theme-primary">Payout Method</h2>
 <div className="flex items-center gap-2 mt-0.5">
 <div className={`w-2 h-2 rounded-full ${summary?.onboardingComplete ? 'bg-success-green' : 'bg-accent-light/10 dark:bg-accent-dark animate-pulse'}`} />
 <span className="text-xs font-bold uppercase text-theme-muted tracking-wider">
 {summary?.onboardingComplete ? 'Connected' : 'Action Required'}
 </span>
 </div>
 </div>
 </div>

 {summary?.onboardingComplete ? (
 <div className="space-y-4">
 <div className="p-5 bg-success-green/10/50 dark:bg-emerald-950/10 rounded-2xl border border-success-green/50 dark:border-success-green/30">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-8 h-8 surface-card rounded-lg flex items-center justify-center shadow-sm">
 <CreditCard className="w-4 h-4 text-success-green" />
 </div>
 <div>
 <div className="text-[10px] font-bold text-success-green uppercase tracking-widest">Connected Card</div>
 <div className="text-sm font-bold text-theme-primary">
 {summary.payoutMethodBrand || 'Visa'} •••• {summary.payoutMethodLast4 || '4242'}
 </div>
 </div>
 </div>
 <div className="text-[10px] font-mono text-theme-muted break-all leading-tight">
 ID: {summary.stripeAccountId}
 </div>
 </div>
 <div className="space-y-4 pt-4 border-t border-theme">
 <div className="flex items-center gap-2 text-[10px] font-bold text-theme-muted uppercase tracking-widest">
 <Info className="w-3 h-3" />
 Payout Security
 </div>
 <p className="text-xs text-theme-muted font-medium leading-relaxed">
 Your payout method is managed securely. Transfers are initiated automatically 48 hours after each tour completion.
 </p>
 </div>
 </div>
 ) : isLinking ? (
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="space-y-4"
 >
 <div className="p-6 surface-section rounded-3xl border-2 border-dashed border-theme space-y-4">
 <div className="space-y-1">
 <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest ml-1">Mock Card/Account Last 4</label>
 <input 
 type="text" 
 maxLength={4}
 value={onboardingData.last4}
 onChange={(e) => setOnboardingData({...onboardingData, last4: e.target.value.replace(/\D/g, '')})}
 placeholder="4242"
 className="w-full px-4 py-3 surface-card border border-theme rounded-xl text-sm font-bold outline-none focus:border-primary-light dark:border-primary-dark"
 />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-[10px] font-bold text-theme-muted uppercase tracking-widest ml-1">Brand</label>
 <select 
 value={onboardingData.brand}
 onChange={(e) => setOnboardingData({...onboardingData, brand: e.target.value})}
 className="w-full px-4 py-3 surface-card border border-theme rounded-xl text-sm font-bold outline-none"
 >
 <option>Visa</option>
 <option>Mastercard</option>
 <option>Maestro</option>
 <option>Bank Account</option>
 </select>
 </div>
 <div className="flex items-end">
 <button 
 onClick={handleOnboard}
 className="w-full py-3 bg-primary-light text-white rounded-xl font-bold text-xs hover:bg-primary-light-hover transition-colors"
 >
 Link
 </button>
 </div>
 </div>
 <button 
 onClick={() => setIsLinking(false)}
 className="w-full text-[10px] font-bold text-theme-muted uppercase tracking-widest hover:text-theme-secondary"
 >
 Cancel
 </button>
 </div>
 </motion.div>
 ) : (
 <div className="space-y-4">
 <div className="p-6 bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-900/10 rounded-3xl border border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/30">
 <div className="flex gap-4">
 <AlertCircle className="w-6 h-6 text-accent-light dark:text-accent-dark flex-shrink-0" />
 <div>
 <h3 className="font-bold text-amber-900 dark:text-amber-100 leading-none mb-2">Payouts Disabled</h3>
 <p className="text-xs text-accent-light dark:text-accent-dark dark:text-amber-300 font-medium leading-relaxed">
 We need to link a Stripe account or card to send your money.
 </p>
 </div>
 </div>
 </div>
 <button 
 onClick={() => setIsLinking(true)}
 className="w-full py-5 bg-primary-light hover:bg-primary-light-hover text-white rounded-3xl font-bold text-lg shadow-xl shadow-primary-light/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
 >
 Connect My Card <Plus className="w-6 h-6" />
 </button>
 <p className="text-[10px] text-center text-theme-muted font-bold uppercase tracking-widest">
 Linked accounts are protected by bank-level encryption
 </p>
 </div>
 )}
 </motion.div>

 {/* Pro Tips / Stats */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/10"
 >
 <Sparkles className="w-8 h-8 opacity-40 mb-6" />
 <h3 className="text-xl font-bold mb-2">Growth Tip</h3>
 <p className="text-white/80 text-sm font-medium leading-relaxed">
 Guides who maintain a 4.8+ rating and zero cancellations earn up to 40% more per month. Keep up the great work!
 </p>
 <hr className="my-6 border-theme-strong" />
 <div className="flex justify-between items-center text-white/60">
 <span className="text-[10px] font-bold uppercase tracking-widest">Success Factor</span>
 <span className="text-sm font-bold text-emerald-400">EXCELLENT</span>
 </div>
 </motion.div>
 </div>

 {/* Payout History Table */}
  <div className="lg:col-span-2 space-y-6">
  <div className="surface-card border-x-0 sm:border border-theme rounded-none sm:rounded-[2.5rem] shadow-none sm:shadow-sm overflow-hidden min-h-[500px] flex flex-col">
  <div className="p-6 sm:p-8 border-b border-theme flex items-center justify-between">
  <div className="flex items-center gap-3">
  <div className="w-10 h-10 surface-section rounded-xl flex items-center justify-center">
  <History className="w-5 h-5 text-theme-muted" />
  </div>
  <h2 className="text-xl font-bold text-theme-primary tracking-tight">Earnings History</h2>
  </div>
  </div>

  <div className="flex-1">
  {payouts.length > 0 ? (
  <>
  {/* Mobile View: Cards */}
  <div className="md:hidden divide-y divide-theme">
  {payouts.map((p, idx) => (
  <div key={idx} className="p-4">
  <PayoutCard p={p} />
  </div>
  ))}
  </div>

  {/* Desktop View: Table */}
  <div className="hidden md:block overflow-x-auto">
  <table className="w-full text-left">
  <thead>
  <tr className="surface-section">
  <th className="px-8 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest">Date</th>
  <th className="px-8 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest">Origin Booking</th>
  <th className="px-8 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest">Amount (Net)</th>
  <th className="px-8 py-4 text-[10px] font-bold text-theme-muted uppercase tracking-widest text-right">Status</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
  {payouts.map((p, idx) => (
  <tr key={idx} className="group hover:surface-section dark:hover:surface-card transition-colors">
  <td className="px-8 py-6">
  <div className="text-sm font-bold text-theme-primary">
  {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
  </div>
  <div className="text-[10px] text-theme-muted font-medium">
  {new Date(p.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })} UTC
  </div>
  </td>
  <td className="px-8 py-6">
  <div className="text-sm font-bold text-theme-primary">#{p.bookingId}</div>
  <div className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Tour Settlement</div>
  </td>
  <td className="px-8 py-6">
  <div className="text-sm font-bold text-theme-primary">
  {p.currency} {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
  </div>
  </td>
  <td className="px-8 py-6 text-right">
  {p.payoutStatus === "Transferred" ? (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-green/20 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
  <CheckCircle2 className="w-3.5 h-3.5" /> Already Paid
  </span>
  ) : p.payoutStatus === "Pending" ? (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light/20 dark:bg-primary-dark/20 text-blue-700 dark:text-primary-dark text-xs font-bold rounded-lg">
  <Clock className="w-3.5 h-3.5" /> In Escrow
  </span>
  ) : (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger-red/20 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg">
  <AlertCircle className="w-3.5 h-3.5" /> Failed
  </span>
  )}
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  </>
 ) : (
 <div className="flex flex-col items-center justify-center p-20 text-center">
 <div className="w-20 h-20 surface-section rounded-full flex items-center justify-center mb-6">
 <History className="w-10 h-10 text-gray-300 " />
 </div>
 <h3 className="text-lg font-bold text-theme-primary mb-2">No Transactions Yet</h3>
 <p className="text-sm text-theme-muted max-w-xs mx-auto">
 Once your tours are completed and settlements are processed, they will appear here.
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
  </div>
 )
}
