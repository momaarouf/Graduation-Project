'use client'

/**
 * PaymentCountdownBanner
 *
 * Displays a live countdown timer for PendingPayment bookings.
 * Shown at the top of the booking detail page when status === PendingPayment.
 *
 * Visual states:
 * normal → amber banner with timer (>5 min remain)
 * warning → orange banner with pulse animation (≤5 min)
 * critical → red banner with fast pulse (≤2 min)
 * expired → red banner with"Booking Expired" message + optional action
 *
 * Props:
 * deadlineUtc — ISO 8601 UTC string from BookingResponse.paymentDeadlineUtc
 * onExpired — optional callback fired once when the countdown hits zero
 * tourTitle — shown in expired state messaging
 */

import { useEffect, useRef } from 'react'
import { Clock, AlertTriangle, XCircle } from 'lucide-react'
import { usePaymentCountdown } from '@/src/hooks/usePaymentCountdown'

interface PaymentCountdownBannerProps {
 deadlineUtc: string
 tourTitle?: string
 onExpired?: () => void
}

export default function PaymentCountdownBanner({
 deadlineUtc,
 tourTitle,
 onExpired,
}: PaymentCountdownBannerProps) {
 const countdown = usePaymentCountdown(deadlineUtc)
 const hasCalledExpired = useRef(false)

 // Fire onExpired callback exactly once
 useEffect(() => {
 if (countdown?.isExpired && !hasCalledExpired.current && onExpired) {
 hasCalledExpired.current = true
 onExpired()
 }
 }, [countdown?.isExpired, onExpired])

 if (!countdown) return null

 // ── Expired state ─────────────────────────────────────────────────────────
 if (countdown.isExpired) {
 return (
 <div className="rounded-xl border border-danger-red dark:border-danger-red bg-red-50 dark:bg-red-950/30 p-4 flex items-start gap-3">
 <XCircle className="w-5 h-5 text-danger-red dark:text-red-400 mt-0.5 shrink-0" />
 <div>
 <p className="font-bold text-red-800 dark:text-red-200 text-sm">
 Booking Expired
 </p>
 <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
 {tourTitle
 ? `Your booking for"${tourTitle}" was automatically cancelled because payment was not completed within 15 minutes.`
 : 'This booking was automatically cancelled because payment was not completed in time.'}
 </p>
 <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
 You can browse available tours and rebook if seats are still available.
 </p>
 </div>
 </div>
 )
 }

 // ── Active countdown ───────────────────────────────────────────────────────

 const isCritical = countdown.urgency === 'critical'
 const isWarning = countdown.urgency === 'warning'

 const containerClass = isCritical
 ? 'rounded-xl border border-danger-red dark:border-danger-red bg-red-50 dark:bg-red-950/30 p-4'
 : isWarning
 ? 'rounded-xl border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30 p-4'
 : 'rounded-xl border border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark bg-amber-50 dark:bg-amber-950/20 p-4'

 const iconClass = isCritical
 ? 'w-5 h-5 text-danger-red dark:text-red-400 shrink-0'
 : isWarning
 ? 'w-5 h-5 text-orange-500 dark:text-orange-400 shrink-0'
 : 'w-5 h-5 text-accent-light dark:text-accent-dark dark:text-amber-400 shrink-0'

 const boldClass = isCritical
 ? 'font-bold text-red-800 dark:text-red-200 text-sm'
 : isWarning
 ? 'font-bold text-orange-800 dark:text-orange-200 text-sm'
 : 'font-bold text-amber-800 dark:text-amber-200 text-sm'

 const timerClass = isCritical
 ? 'text-2xl font-bold tracking-widest text-red-600 dark:text-red-400 tabular-nums animate-pulse'
 : isWarning
 ? 'text-2xl font-bold tracking-widest text-orange-600 dark:text-orange-400 tabular-nums animate-pulse'
 : 'text-2xl font-bold tracking-widest text-amber-700 dark:text-amber-300 tabular-nums'

 const subClass = isCritical
 ? 'text-xs text-red-600 dark:text-red-400'
 : isWarning
 ? 'text-xs text-orange-600 dark:text-orange-400'
 : 'text-xs text-amber-700 dark:text-amber-400'

 return (
 <div className={containerClass} role="timer" aria-live="polite" aria-label={`Payment deadline: ${countdown.displayString} remaining`}>
 <div className="flex items-center gap-3">
 {/* Icon — pulses when critical */}
 {isCritical || isWarning ? (
 <AlertTriangle className={`${iconClass} ${isCritical ? 'animate-bounce' : ''}`} />
 ) : (
 <Clock className={iconClass} />
 )}

 <div className="flex-1">
 {/* Headline */}
 <p className={boldClass}>
 {isCritical
 ? '⚡ Complete payment immediately!'
 : isWarning
 ? '⚠️ Payment window closing soon'
 : 'Complete payment to confirm your booking'}
 </p>

 {/* Timer + sub-message row */}
 <div className="flex items-center justify-between mt-2">
 <div>
 <p className={subClass}>
 {isCritical
 ? 'Booking will be cancelled in:'
 : isWarning
 ? 'Time remaining to pay:'
 : 'Your seat is reserved for:'}
 </p>
 </div>

 {/* The big countdown */}
 <div className={timerClass} aria-hidden="true">
 {countdown.displayString}
 </div>
 </div>

 {/* Progress bar */}
 <div className="mt-3 h-1.5 surface-section rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full transition-all duration-1000 ${
 isCritical
 ? 'bg-red-500'
 : isWarning
 ? 'bg-orange-500'
 : 'bg-amber-500'
 }`}
 style={{
 // 15 minutes = 900 seconds total
 width: `${Math.max(0, Math.min(100, (countdown.totalSeconds / 900) * 100))}%`,
 }}
 />
 </div>
 </div>
 </div>
 </div>
 )
}
