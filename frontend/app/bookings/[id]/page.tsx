// ============================================================================
// TRAVELER BOOKING DETAIL PAGE — WIRED TO REAL BACKEND
// ============================================================================
// LOCATION: /frontend/app/bookings/[id]/page.tsx
//
// PURPOSE: Full booking details for a traveler, including:
//   - Tour info, meeting point, price, QR ticket
//   - Cancellation with real refund calculation from backend
//   - Download invoice
//   - "Rejected" UI alias: if status is Cancelled and cancellationReason
//     contains "guide", display as "Rejected by Guide"
//
// DATA SOURCE: getTravelerBooking(id) → BookingResponse
// MUTATION: cancelBooking(id, reason) → cancels + returns refundPercent
// ============================================================================

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  QrCode,
  Download,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  XCircle,
  CheckCircle,
  FileText,
  Star,
  Clock as ClockIcon,
  Loader2,
  User,
  CreditCard,
  RefreshCw,
  ChevronLeft as ChevronLeftIcon // rename if conflict
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

import { getTravelerBooking, cancelBooking } from '@/src/lib/api/tours'
import { createPaymentSession } from '@/src/lib/api/payment'
import { 
  getTravelerPaymentMethods, 
  payWithSavedCard, 
  saveTravelerPaymentMethod,
  TravelerPaymentMethod 
} from '@/src/lib/api/traveler-payments'
import { BookingResponse, BookingStatus } from '@/src/lib/types/tour.types'

// ============================================================================
// HELPERS
// ============================================================================

// Derive the UI-facing display status from the backend status.
// The backend has no "Rejected" status — it's a Cancelled booking where
// the cancellationReason contains "guide" (case-insensitive).
function getDisplayStatus(booking: BookingResponse): string {
  if (
    booking.status === BookingStatus.Cancelled &&
    booking.cancellationReason?.toLowerCase().includes('guide')
  ) {
    return 'Rejected'
  }
  return booking.status
}

// Status badge colors — keyed by either backend status or UI alias
function getStatusStyle(displayStatus: string) {
  switch (displayStatus) {
    case BookingStatus.Confirmed:
    case BookingStatus.InProgress:
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    case BookingStatus.PendingGuide:
    case BookingStatus.PendingPayment:
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    case BookingStatus.Completed:
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    case 'Rejected':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }
}

// Cancellation policy: >48h = 100%, 24–48h = 50%, <24h = 0%
// We compute this client-side for the preview — the backend re-validates on
// the actual cancel request and returns the authoritative refundPercent.
function computeRefundPreview(startTimeUtc: string) {
  const now = new Date()
  const start = new Date(startTimeUtc)
  const hoursUntilStart = (start.getTime() - now.getTime()) / (1000 * 60 * 60)

  let refundPercent = 0
  if (hoursUntilStart > 48) refundPercent = 100
  else if (hoursUntilStart > 24) refundPercent = 50

  return { refundPercent, hoursUntilStart }
}

function formatHoursRemaining(hours: number) {
  if (hours < 0) return 'Deadline passed'
  if (hours < 24) return `${Math.ceil(hours)} hours remaining`
  if (hours < 48) return `${Math.floor(hours)} hours remaining`
  return `${Math.floor(hours / 24)} days remaining`
}

// ============================================================================
// MAIN PAGE
// ============================================================================

interface BookingDetailPageProps {
  params: Promise<{ id: string }>
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id: bookingId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentResult = searchParams.get('payment')

  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [savedMethods, setSavedMethods] = useState<TravelerPaymentMethod[]>([])
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null)
  const [showSavedCards, setShowSavedCards] = useState(false)
  const [isAddingNewCard, setIsAddingNewCard] = useState(false)
  
  // New Card Form State
  const [newCardName, setNewCardName] = useState('')
  const [newCardNumber, setNewCardNumber] = useState('')
  const [newCardExM, setNewCardExM] = useState('01')
  const [newCardExY, setNewCardExY] = useState(new Date().getFullYear().toString())
  const [newCardCvv, setNewCardCvv] = useState('')
  const [saveForFuture, setSaveForFuture] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ── Fetch booking from backend ──────────────────────────────────────────

  const fetchPaymentMethods = async (silent = false) => {
    if (!silent) setIsRefreshing(true)
    try {
      const methods = await getTravelerPaymentMethods()
      setSavedMethods(methods)
      if (methods.length > 0) {
        // If nothing selected yet, or old selection no longer exists
        const exists = methods.find(m => m.id === selectedMethodId)
        if (!exists || !selectedMethodId) {
          const def = methods.find(m => m.isDefault) || methods[0]
          setSelectedMethodId(def.id)
        }
        setShowSavedCards(false)
        setIsAddingNewCard(false)
      } else {
        setIsAddingNewCard(true)
      }
    } catch (err) {
      console.error('Failed to fetch payment methods:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const fetchBooking = async () => {
      setIsLoading(true)
      try {
        const res = await getTravelerBooking(Number(bookingId))
        setBooking(res)

        // If PendingPayment, also fetch saved cards
        if (res.status === BookingStatus.PendingPayment) {
          await fetchPaymentMethods(true)
        }

        // Handle payment success/cancel notifications once data is loaded
        if (paymentResult === 'success') {
          toast.success('Your payment was successful! Your booking is now confirmed.')
          window.history.replaceState({}, '', `/bookings/${bookingId}`)
        } else if (paymentResult === 'cancelled') {
          toast.error('Payment was cancelled. You can try again whenever you are ready.')
          window.history.replaceState({}, '', `/bookings/${bookingId}`)
        }
      } catch {
        toast.error('Booking not found')
        router.push('/dashboard/traveler/bookings')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId, paymentResult])

  // Auto-refresh when user returns to this tab
  useEffect(() => {
    const onFocus = () => {
      if (booking?.status === BookingStatus.PendingPayment) {
        fetchPaymentMethods(true)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [booking?.status, selectedMethodId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cancel booking — calls real API with { data } syntax ───────────────
  // Backend computes the authoritative refundPercent and returns it.

  const handleCancelBooking = async () => {
    if (!booking) return
    setIsCancelling(true)
    try {
      const res = await cancelBooking(booking.id, cancelReason ? { reason: cancelReason } : undefined)
      toast.success(
        `Booking cancelled! ${res.refundPercent ? `${res.refundPercent}% refund` : 'No refund (within 24h window)'}`
      )
      setShowCancelModal(false)
      // Re-fetch to show updated status
      const updated = await getTravelerBooking(booking.id)
      setBooking(updated)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setIsCancelling(false)
    }
  }

  // ── Initiate Stripe Payment ──────────────────────────────────────────

  const handlePayNow = async () => {
    if (!booking) return
    setIsPaying(true)
    try {
      const response = await createPaymentSession(booking.id)
      if (response.checkoutUrl) {
        // Redirect to Stripe or show mock instructions
        window.location.href = response.checkoutUrl
      } else {
        toast.error('Could not initiate payment session')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start payment')
    } finally {
      setIsPaying(false)
    }
  }

  const handlePayWithSavedCard = async () => {
    if (!booking || !selectedMethodId) return
    
    // Explicit confirmation
    const method = savedMethods.find(m => m.id === selectedMethodId)
    if (!method) return
    
    if (!confirm(`You are about to pay ${booking.currency} ${booking.finalPrice.toFixed(2)} using your ${method.brand} ending in ${method.last4}. Proceed?`)) {
      return
    }

    setIsPaying(true)
    try {
      await payWithSavedCard(booking.id, selectedMethodId)
      toast.success('Payment successful!')
      const updated = await getTravelerBooking(booking.id)
      setBooking(updated)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process payment')
    } finally {
      setIsPaying(false)
    }
  }

  const handlePayWithNewCard = async () => {
    if (!booking) return
    
    // Validate
    if (!newCardName.trim()) return toast.error('Cardholder name required')
    if (newCardNumber.replace(/\s/g, '').length < 13) return toast.error('Invalid card number')
    if (!/^\d{3}$/.test(newCardCvv)) return toast.error('Invalid CVV')

    setIsPaying(true)
    try {
      if (saveForFuture) {
        // Save first
        const saved = await saveTravelerPaymentMethod({
          brand: newCardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
          last4: newCardNumber.replace(/\s/g, '').slice(-4),
          cardholderName: newCardName,
          expiryMonth: parseInt(newCardExM),
          expiryYear: parseInt(newCardExY),
          isDefault: false
        })
        // Then pay
        await payWithSavedCard(booking.id, saved.id)
        toast.success('Card saved and payment processed!')
      } else {
        // Just use Stripe flow for non-saved cards to be safe/PCI compliant in this demo
        // or we can simulate it. Let's redirect to Stripe for "New/No Save" logic.
        const response = await createPaymentSession(booking.id)
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl
          return // Exit to redirect
        }
      }
      
      const updated = await getTravelerBooking(booking.id)
      setBooking(updated)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process payment')
    } finally {
      setIsPaying(false)
    }
  }

  // ── Invoice download (text placeholder) ────────────────────────────────

  const handleDownloadInvoice = () => {
    if (!booking) return
    const startDate = new Date(booking.startTimeUtc)
    const invoice = `
TRAVEL MARKET - INVOICE
===================
Booking #${booking.id}
Date: ${new Date().toLocaleDateString()}

Tour: ${booking.tourTitle}
Date: ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}
Travelers: ${booking.peopleCount}
Total: ${booking.currency} ${booking.finalPrice.toFixed(2)}
Status: ${booking.status}

Cancellation Policy:
- 100% refund up to 48h before tour start
- 50% refund 24-48h before tour start
- No refund within 24h of tour start

Thank you for choosing TravelMarket!
  `

    const blob = new Blob([invoice], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-booking-${booking.id}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Invoice downloaded!')
  }

  // ── Loading state ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <PageLayout>
        <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    )
  }

  if (!booking) {
    return (
      <PageLayout>
        <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Booking Not Found</h1>
            <Link href="/dashboard/traveler/bookings" className="text-blue-600 hover:underline">
              Back to Bookings
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  // ── Derived values ─────────────────────────────────────────────────────

  const displayStatus = getDisplayStatus(booking)
  const statusStyle = getStatusStyle(displayStatus)
  const startDate = new Date(booking.startTimeUtc)
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  })
  const bookedDate = new Date(booking.createdAtUtc).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

  // Can only cancel Confirmed or PendingGuide bookings
  const canCancel = (
    booking.status === BookingStatus.Confirmed ||
    booking.status === BookingStatus.PendingGuide
  )
  const { refundPercent: previewRefund, hoursUntilStart } = canCancel
    ? computeRefundPreview(booking.startTimeUtc)
    : { refundPercent: 0, hoursUntilStart: 0 }

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">

          {/* Back Button */}
          <Link
            href="/dashboard/traveler/bookings"
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Bookings</span>
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Booking Details
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Booking #{booking.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusStyle}`}>
                {displayStatus}
              </span>
              <button
                onClick={handleDownloadInvoice}
                className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">

              {/* Tour Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-32 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    {booking.tourCoverImageUrl ? (
                      <img src={booking.tourCoverImageUrl} alt={booking.tourTitle} className="w-full h-full object-cover" />
                    ) : (
                      <Calendar className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 p-5">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-2">
                      {booking.tourTitle}
                    </h2>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formattedDate} at {formattedTime}</span>
                      </div>
                      {booking.meetingPointName && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.meetingPointName}</span>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/tours/${booking.occurrenceId}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View tour details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Meeting Point */}
              {booking.meetingPointName && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Meeting Point
                  </h3>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    {booking.meetingPointName}
                  </p>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Price Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {booking.currency} {booking.finalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200 dark:border-gray-800">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-xl text-gray-900 dark:text-white">
                      {booking.currency} {booking.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Booked on {bookedDate} • {booking.bookingMode === 'Instant' ? 'Instant Book' : 'Request to Book'}
                </p>
              </div>

              {/* Rejection / Cancellation Reason banner */}
              {booking.cancellationReason && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-300 mb-1">
                        {displayStatus === 'Rejected' ? 'Rejected by Guide' : 'Cancellation Reason'}
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {booking.cancellationReason}
                      </p>
                      {booking.refundPercent != null && (
                        <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                          Refund: {booking.refundPercent}% of {booking.currency} {booking.finalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">

              {/* QR Ticket Card — only for Confirmed bookings with a QR code */}
              {booking.qrCode && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">QR Ticket</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Show this QR code to your guide at the meeting point
                  </p>
                  {/* Display the QR token — in production, render with a QR library */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <QrCode className="w-20 h-20 text-gray-900 dark:text-gray-100 mx-auto mb-2" />
                    <p className="text-xs font-mono text-gray-500 break-all">{booking.qrCode}</p>
                  </div>
                </div>
              )}

              {/* Actions Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  Actions
                </h3>
                <div className="space-y-2">
                  {/* Pay Now section — High Fidelity Button-First UX */}
                  {booking.status === BookingStatus.PendingPayment && (
                    <div className="space-y-4">
                      {isAddingNewCard ? (
                        /* Case 1: Adding a Fresh Card */
                        <div className="space-y-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                          {savedMethods.length > 0 && (
                            <button 
                              onClick={() => setIsAddingNewCard(false)}
                              className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase mb-2 hover:translate-x-1 transition-transform"
                            >
                              <ChevronLeft className="w-3 h-3" /> Back to Saved
                            </button>
                          )}
                          
                          <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">New Payment Method</h4>
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={newCardName}
                              onChange={(e) => setNewCardName(e.target.value)}
                              placeholder="CARDHOLDER NAME"
                              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold uppercase outline-none focus:border-blue-600 transition-all shadow-sm"
                            />
                            <div className="relative">
                              <input
                                type="text"
                                value={newCardNumber}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19)
                                  setNewCardNumber(val)
                                }}
                                placeholder="0000 0000 0000 0000"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:border-blue-600 transition-all shadow-sm"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <select 
                                value={newCardExM}
                                onChange={(e) => setNewCardExM(e.target.value)}
                                className="px-2 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer text-center"
                              >
                                {Array.from({length: 12}, (_, i) => String(i+1).padStart(2, '0')).map(m => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                              <select 
                                value={newCardExY}
                                onChange={(e) => setNewCardExY(e.target.value)}
                                className="px-2 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none appearance-none cursor-pointer text-center"
                              >
                                {Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString()).map(y => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </select>
                              <input
                                type="password"
                                value={newCardCvv}
                                onChange={(e) => setNewCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                placeholder="CVV"
                                className="px-2 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold outline-none text-center"
                              />
                            </div>
                            
                            <label className="flex items-center gap-2 cursor-pointer group px-1">
                              <div 
                                onClick={() => setSaveForFuture(!saveForFuture)}
                                className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                                  saveForFuture ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-600/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                                }`}
                              >
                                {saveForFuture && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">Save for future use</span>
                            </label>
                          </div>

                          <button
                            onClick={handlePayWithNewCard}
                            disabled={isPaying}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 dark:shadow-white/10"
                          >
                            {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Pay'}
                          </button>
                        </div>
                      ) : showSavedCards ? (
                        /* Case 2: Choosing from Multiple Cards */
                        <div className="space-y-4">
                          <button 
                            onClick={() => setShowSavedCards(false)}
                            className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase mb-2 hover:translate-x-1 transition-transform"
                          >
                            <ChevronLeft className="w-3 h-3" /> Back
                          </button>
                          <div className="space-y-2">
                            {savedMethods.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => setSelectedMethodId(m.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                                  selectedMethodId === m.id 
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' 
                                    : 'border-gray-50 dark:border-gray-800 hover:border-blue-100 hover:scale-[1.01]'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <CreditCard className={`w-5 h-5 ${selectedMethodId === m.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                  <div className="text-left leading-tight">
                                    <p className={`text-[11px] font-black uppercase tracking-tight ${selectedMethodId === m.id ? 'text-blue-900 dark:text-blue-100' : 'text-gray-600'}`}>
                                      {m.brand} •••• {m.last4}
                                    </p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">{m.cardholderName || 'Cardholder'}</p>
                                  </div>
                                </div>
                                {selectedMethodId === m.id && <CheckCircle className="w-4 h-4 text-blue-600" />}
                              </button>
                            ))}
                          </div>
                          
                          <button 
                            onClick={() => setIsAddingNewCard(true)}
                            className="w-full text-center text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-colors py-2"
                          >
                            + Use a different card
                          </button>

                          <button
                            onClick={handlePayWithSavedCard}
                            disabled={isPaying || !selectedMethodId}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
                          >
                            {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Pay Now'}
                          </button>
                        </div>
                      ) : (
                        /* Case 3: One-Click Focus View (Default) */
                        <div className="space-y-4">
                          {selectedMethodId && (
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-[2rem] border border-blue-200/50 dark:border-blue-800/30">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">Paying With</label>
                                  <button 
                                    onClick={() => fetchPaymentMethods()}
                                    disabled={isRefreshing}
                                    className={`p-1 hover:bg-white rounded-full transition-all ${isRefreshing ? 'animate-spin text-blue-600' : 'text-blue-400'}`}
                                  >
                                    <RefreshCw className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                {savedMethods.length > 1 && (
                                  <button 
                                    onClick={() => setShowSavedCards(true)}
                                    className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest underline decoration-2 underline-offset-2 transition-all"
                                  >
                                    Change
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm">
                                  <CreditCard className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                    {savedMethods.find(m => m.id === selectedMethodId)?.brand} •••• {savedMethods.find(m => m.id === selectedMethodId)?.last4}
                                  </h4>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{savedMethods.find(m => m.id === selectedMethodId)?.cardholderName}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={handlePayWithSavedCard}
                            disabled={isPaying || !selectedMethodId}
                            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-50 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            {isPaying ? (
                              <div className="flex items-center justify-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Processing...</span>
                              </div>
                            ) : (
                              <span>Pay Now — {booking.currency} {booking.finalPrice.toFixed(2)}</span>
                            )}
                          </button>
                          
                          <p className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 px-4 opacity-60">
                            Secure 256-bit SSL encrypted checkout
                          </p>
                        </div>
                      )}

                      {/* Fallback to Stripe (only show in "Selection" or "No-Card" mode to keep focus) */}
                      {(isAddingNewCard || showSavedCards) && (
                        <div className="pt-2">
                          <button
                            onClick={handlePayNow}
                            disabled={isPaying}
                            className="w-full py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all border border-gray-200 dark:border-gray-700 active:scale-95"
                          >
                            Use External Stripe Checkout
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Cancel button — only for cancellable bookings */}
                  {canCancel && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Booking
                    </button>
                  )}
                  {/* Write Review button — shown only for Completed bookings.
                      Previously disabled with "Reviews coming soon".
                      Now active: navigates to the review form at /bookings/{id}/review.
                      The review form page handles eligibility (backend enforces it too). */}
                  {booking.status === BookingStatus.Completed && (
                    <Link
                      href={`/bookings/${bookingId}/review`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      Write Review
                    </Link>
                  )}
                  <button
                    onClick={handleDownloadInvoice}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Download Invoice
                  </button>
                </div>

                {/* Cancellation policy reminder */}
                {canCancel && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <p className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1">
                      <ClockIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>
                        {hoursUntilStart > 48
                          ? `Full refund if cancelled within ${formatHoursRemaining(hoursUntilStart)}`
                          : hoursUntilStart > 24
                            ? `50% refund - ${formatHoursRemaining(hoursUntilStart)}`
                            : hoursUntilStart > 0
                              ? `No refund - tour starts in ${Math.ceil(hoursUntilStart)} hours`
                              : 'Cancellation deadline has passed'}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Support Card */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  Our support team is available 24/7
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cancellation Confirmation Modal ──────────────────────────────── */}
      {showCancelModal && booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Cancel Booking
              </h3>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to cancel <span className="font-semibold text-gray-900 dark:text-white">{booking.tourTitle}</span>?
              </p>

              {/* Optional cancellation reason */}
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                className="
                  w-full px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg text-sm
                  text-gray-900 dark:text-white
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-red-500/30
                "
              />

              {/* Refund preview — computed client-side, backend is authoritative */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Booking amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {booking.currency} {booking.finalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Refund policy</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {previewRefund}%
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-900 dark:text-white">You&apos;ll get</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {booking.currency} {((booking.finalPrice * previewRefund) / 100).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {previewRefund === 100 && 'Full refund (more than 48h before tour)'}
                  {previewRefund === 50 && '50% refund (24-48h before tour)'}
                  {previewRefund === 0 && 'No refund (within 24h of tour start)'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}