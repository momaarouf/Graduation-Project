// =============================================================================
// MOCK STRIPE CHECKOUT PAGE
// =============================================================================
// LOCATION: /frontend/app/checkout/mock/page.tsx
//
// PURPOSE: Handles mock payment checkout in full-page redirect style
// Uses the new MockPaymentSimulator component with proper test card support
//
// URL PARAMS expected (set by handlePayNow in booking pages):
//   sessionId   — mock_sess_xxx
//   bookingId   — numeric booking ID (for redirect back)
//   amount      — numeric, e.g. "150.00"
//   currency    — e.g. "USD"
//   title       — tour name
//   coverImage  — (optional) tour cover image URL
//
// WHEN REAL STRIPE IS ENABLED: this page is never visited.
//   The booking page does window.location.href = real_stripe_url instead.
// =============================================================================

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import MockPaymentSimulator from '@/src/components/payment/MockPaymentSimulator'

function MockCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get('sessionId') ?? ''
  const bookingId = searchParams.get('bookingId') ?? ''
  const amount = parseFloat(searchParams.get('amount') ?? '0')
  const currency = (searchParams.get('currency') ?? 'USD').toUpperCase()
  const title = searchParams.get('title') ?? 'Tour'

  const handleSuccess = () => {
    router.push(`/dashboard/traveler/bookings/${bookingId}?payment=success`)
  }

  const handleFailure = () => {
    // Stay on page, user can try again
  }

  const handleClose = () => {
    router.push(`/dashboard/traveler/bookings/${bookingId}?payment=cancelled`)
  }

  return (
    <div className="min-h-screen surface-card flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <MockPaymentSimulator
          sessionId={sessionId}
          amount={amount}
          currency={currency}
          onSuccess={handleSuccess}
          onFailure={handleFailure}
          isOpen={true}
          onClose={handleClose}
        />
      </div>
    </div>
  )
}

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen surface-card flex items-center justify-center">
        <div className="text-theme-muted">Loading checkout…</div>
      </div>
    }>
      <MockCheckoutContent />
    </Suspense>
  )
}
