'use client'

/**
 * usePaymentCountdown — tracks the remaining time until a PendingPayment deadline.
 *
 * Usage:
 * const { minutesLeft, secondsLeft, isExpired, displayString } =
 * usePaymentCountdown(booking.paymentDeadlineUtc)
 *
 * Returns:
 * minutesLeft — whole minutes remaining (0 when expired)
 * secondsLeft — remainder seconds 0–59 (0 when expired)
 * totalSeconds — total raw seconds remaining (< 0 when expired)
 * isExpired — true when deadline has passed
 * displayString — formatted"MM:SS" string, e.g."14:32"
 * urgency — 'normal' | 'warning' | 'critical'
 * 'warning' when ≤ 5 minutes remain
 * 'critical' when ≤ 2 minutes remain
 *
 * The hook re-renders every second while the deadline is in the future.
 * Once expired, it cancels the interval automatically.
 */

import { useState, useEffect } from 'react'

export type CountdownUrgency = 'normal' | 'warning' | 'critical'

export interface CountdownState {
 minutesLeft: number
 secondsLeft: number
 totalSeconds: number
 isExpired: boolean
 displayString: string
 urgency: CountdownUrgency
}

function computeState(deadline: Date): CountdownState {
 const totalSeconds = Math.floor((deadline.getTime() - Date.now()) / 1000)

 if (totalSeconds <= 0) {
 return {
 minutesLeft: 0,
 secondsLeft: 0,
 totalSeconds,
 isExpired: true,
 displayString: '00:00',
 urgency: 'critical',
 }
 }

 const minutesLeft = Math.floor(totalSeconds / 60)
 const secondsLeft = totalSeconds % 60
 const displayString = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`

 let urgency: CountdownUrgency = 'normal'
 if (totalSeconds <= 120) urgency = 'critical'
 else if (totalSeconds <= 300) urgency = 'warning'

 return { minutesLeft, secondsLeft, totalSeconds, isExpired: false, displayString, urgency }
}

export function usePaymentCountdown(deadlineUtc: string | null | undefined): CountdownState | null {
 const [state, setState] = useState<CountdownState | null>(() => {
 if (!deadlineUtc) return null
 return computeState(new Date(deadlineUtc))
 })

 useEffect(() => {
 if (!deadlineUtc) {
 setState(null)
 return
 }

 const deadline = new Date(deadlineUtc)

 // Compute immediately
 setState(computeState(deadline))

 // Tick every second
 const interval = setInterval(() => {
 const next = computeState(deadline)
 setState(next)
 // Stop the interval once expired — no need to keep ticking
 if (next.isExpired) clearInterval(interval)
 }, 1000)

 return () => clearInterval(interval)
 }, [deadlineUtc])

 return state
}
