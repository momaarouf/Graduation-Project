// ============================================================================
// TRAVELER BOOKING DETAIL PAGE — WIRED TO REAL BACKEND
// ============================================================================
// LOCATION: /frontend/app/bookings/[id]/page.tsx
//
// PURPOSE: Full booking details for a traveler, including:
// - Tour info, meeting point, price, QR ticket
// - Cancellation with real refund calculation from backend
// - Download invoice
// -"Rejected" UI alias: if status is Cancelled and cancellationReason
// contains"guide", display as"Rejected by Guide"
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
 Loader2,
 CreditCard,
 RefreshCw,
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import PaymentCountdownBanner from '@/src/components/booking/PaymentCountdownBanner'

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
// The backend has no"Rejected" status — it's a Cancelled booking where
// the cancellationReason contains"guide" (case-insensitive).
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
 return 'bg-blue-100 text-blue-700 dark:text-blue-300'
 case 'Rejected':
 return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
 default:
 return 'surface-section text-theme-secondary'
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
 const [isAddingNewCard, setIsAddingNewCard] = useState(false)

 // New Card Form State
 const [newCardName, setNewCardName] = useState('')
 const [newCardNumber, setNewCardNumber] = useState('')
 const [newCardExM, setNewCardExM] = useState('01')
 const [newCardExY, setNewCardExY] = useState(new Date().getFullYear().toString())
 const [newCardCvv, setNewCardCvv] = useState('')
 const [saveForFuture, setSaveForFuture] = useState(true)
 const [isRefreshing, setIsRefreshing] = useState(false)

 // ── Countdown expiry handler ───────────────────────────────────────────────
 const handlePaymentExpired = async () => {
 try {
 const updated = await getTravelerBooking(Number(bookingId))
 setBooking(updated)
 } catch {
 router.push('/dashboard/traveler/bookings')
 }
 }

 const fetchPaymentMethods = async (silent = false) => {
    if (!silent) setIsRefreshing(true)
    try {
      const methods = await getTravelerPaymentMethods()
      setSavedMethods(methods)
      if (methods.length > 0) {
        const exists = methods.find(m => m.id === selectedMethodId)
        if (!exists || !selectedMethodId) {
          const def = methods.find(m => m.isDefault) || methods[0]
          setSelectedMethodId(def.id)
        }
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

 if (res.status === BookingStatus.PendingPayment) {
 await fetchPaymentMethods(true)
 }

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

 useEffect(() => {
 const onFocus = () => {
 if (booking?.status === BookingStatus.PendingPayment) {
 fetchPaymentMethods(true)
 }
 }
 window.addEventListener('focus', onFocus)
 return () => window.removeEventListener('focus', onFocus)
 }, [booking?.status, selectedMethodId])

 const handleCancelBooking = async () => {
 if (!booking) return
 setIsCancelling(true)
 try {
 const res = await cancelBooking(booking.id, cancelReason ? { reason: cancelReason } : undefined)
 toast.success(
 `Booking cancelled! ${res.refundPercent ? `${res.refundPercent}% refund` : 'No refund (within 24h window)'}`
 )
 setShowCancelModal(false)
 const updated = await getTravelerBooking(booking.id)
 setBooking(updated)
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Failed to cancel booking')
 } finally {
 setIsCancelling(false)
 }
 }

 const handlePayNow = async () => {
 if (!booking) return
 setIsPaying(true)
 try {
 const response = await createPaymentSession(booking.id)
 if (response.checkoutUrl) {
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
 
 if (!newCardName.trim()) return toast.error('Cardholder name required')
 if (newCardNumber.replace(/\s/g, '').length < 13) return toast.error('Invalid card number')
 if (!/^\d{3}$/.test(newCardCvv)) return toast.error('Invalid CVV')

 setIsPaying(true)
 try {
 if (saveForFuture) {
 const saved = await saveTravelerPaymentMethod({
 brand: newCardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
 last4: newCardNumber.replace(/\s/g, '').slice(-4),
 cardholderName: newCardName,
 expiryMonth: parseInt(newCardExM),
 expiryYear: parseInt(newCardExY),
 isDefault: false
 })
 await payWithSavedCard(booking.id, saved.id)
 toast.success('Card saved and payment processed!')
 } else {
 const response = await createPaymentSession(booking.id)
 if (response.checkoutUrl) {
 window.location.href = response.checkoutUrl
 return 
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

 if (isLoading) {
 return (
 <PageLayout>
 <div className="pt-14 sm:pt-16 min-h-screen surface-section flex items-center justify-center">
 <Loader2 className="w-8 h-8 animate-spin text-primary-light dark:text-primary-dark" />
 </div>
 </PageLayout>
 )
 }

 if (!booking) {
 return (
 <PageLayout>
 <div className="pt-14 sm:pt-16 min-h-screen surface-section flex items-center justify-center">
 <div className="text-center">
 <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
 <h1 className="text-xl font-bold text-theme-primary mb-2">Booking Not Found</h1>
 <Link href="/dashboard/traveler/bookings" className="text-primary-light dark:text-primary-dark hover:underline">
 Back to Bookings
 </Link>
 </div>
 </div>
 </PageLayout>
 )
 }

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

 const canCancel = (
 booking.status === BookingStatus.Confirmed ||
 booking.status === BookingStatus.PendingGuide
 )
 const { refundPercent: previewRefund, hoursUntilStart } = canCancel
 ? computeRefundPreview(booking.startTimeUtc)
 : { refundPercent: 0, hoursUntilStart: 0 }

 return (
 <PageLayout>
 <div className="pt-14 sm:pt-16 min-h-screen surface-section">
 <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">

 <Link
 href="/dashboard/traveler/bookings"
 className="flex items-center gap-1.5 text-sm text-theme-secondary hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors mb-6 group"
 >
 <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
 <span>Back to Bookings</span>
 </Link>

 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1">
 Booking Details
 </h1>
 <p className="text-sm text-theme-secondary ">
 Booking #{booking.id}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusStyle}`}>
 {displayStatus}
 </span>
 <button
 onClick={handleDownloadInvoice}
 className="p-2 surface-card border border-theme rounded-lg text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200"
 >
 <Download className="w-4 h-4" />
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

 <div className="lg:col-span-2 space-y-6">

 {booking.status === BookingStatus.PendingPayment && booking.paymentDeadlineUtc && (
 <PaymentCountdownBanner
 deadlineUtc={booking.paymentDeadlineUtc}
 tourTitle={booking.tourTitle}
 onExpired={handlePaymentExpired}
 />
 )}

 {booking.status === BookingStatus.Expired && (
 <PaymentCountdownBanner
 deadlineUtc={new Date(0).toISOString()}
 tourTitle={booking.tourTitle}
 />
 )}

 <div className="surface-card border border-theme rounded-xl overflow-hidden">
 <div className="flex flex-col sm:flex-row">
 <div className="relative w-full sm:w-48 h-32 surface-section flex items-center justify-center">
 {booking.tourCoverImageUrl ? (
 <img src={booking.tourCoverImageUrl} alt={booking.tourTitle} className="w-full h-full object-cover" />
 ) : (
 <Calendar className="w-10 h-10 text-theme-muted" />
 )}
 </div>
 <div className="flex-1 p-5">
 <h2 className="font-bold text-theme-primary mb-2">
 {booking.tourTitle}
 </h2>
 <div className="space-y-1 text-sm text-theme-secondary mb-3">
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
 className="text-sm text-primary-light dark:text-primary-dark hover:underline"
 >
 View tour details
 </Link>
 </div>
 </div>
 </div>

 <div className="surface-card border border-theme rounded-xl p-5">
 <h3 className="font-bold text-theme-primary mb-3 flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 Price Summary
 </h3>
 <div className="flex justify-between font-bold pt-2">
 <span className="text-theme-primary">Total</span>
 <span className="text-xl text-theme-primary">
 {booking.currency} {booking.finalPrice.toFixed(2)}
 </span>
 </div>
 </div>

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

 <div className="space-y-6">

 {booking.qrCode && (
 <div className="surface-card border border-theme rounded-xl p-5">
 <div className="flex items-center gap-3 mb-3">
 <QrCode className="w-5 h-5 text-primary-light dark:text-primary-dark" />
 <h3 className="font-bold text-theme-primary">QR Ticket</h3>
 </div>
 <div className="p-4 surface-section rounded-lg text-center">
 <QrCode className="w-20 h-20 text-theme-primary mx-auto mb-2" />
 <p className="text-xs font-mono text-theme-muted break-all">{booking.qrCode}</p>
 </div>
 </div>
 )}

 <div className="surface-card border border-theme rounded-xl p-5">
 <h3 className="font-bold text-theme-primary mb-3">
 Actions
 </h3>
 <div className="space-y-2">
          {booking.status === BookingStatus.PendingPayment && (
            <div className="space-y-3">
              {isAddingNewCard ? (
                <div className="space-y-3 p-4 surface-section border border-theme rounded-xl">
                  {savedMethods.length > 0 && (
                    <button
                      onClick={() => setIsAddingNewCard(false)}
                      className="flex items-center gap-1 text-xs text-primary-light dark:text-primary-dark hover:underline"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      Back to saved card
                    </button>
                  )}
                  <h4 className="text-sm font-semibold text-theme-primary">New Payment Method</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCardName}
                      onChange={(e) => setNewCardName(e.target.value)}
                      placeholder="Cardholder name"
                      className="w-full px-3 py-2.5 surface-card border border-theme rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-light/30 transition-all"
                    />
                    <input
                      type="text"
                      value={newCardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19)
                        setNewCardNumber(val)
                      }}
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-3 py-2.5 surface-card border border-theme rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-light/30 transition-all"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={newCardExM}
                        onChange={(e) => setNewCardExM(e.target.value)}
                        className="px-2 py-2.5 surface-card border border-theme rounded-lg text-sm outline-none appearance-none cursor-pointer text-center"
                      >
                        {Array.from({length: 12}, (_, i) => String(i+1).padStart(2, '0')).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={newCardExY}
                        onChange={(e) => setNewCardExY(e.target.value)}
                        className="px-2 py-2.5 surface-card border border-theme rounded-lg text-sm outline-none appearance-none cursor-pointer text-center"
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
                        className="px-2 py-2.5 surface-card border border-theme rounded-lg text-sm outline-none text-center"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveForFuture}
                        onChange={(e) => setSaveForFuture(e.target.checked)}
                        className="w-4 h-4 rounded border-theme text-primary-light focus:ring-primary-light/30"
                      />
                      <span className="text-xs text-theme-muted">Save for future use</span>
                    </label>
                  </div>
                  <button
                    onClick={handlePayWithNewCard}
                    disabled={isPaying}
                    className="w-full py-3 bg-primary-light hover:bg-primary-light-hover text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay Now — ${booking.currency} ${booking.finalPrice.toFixed(2)}`}
                  </button>
                  <button
                    onClick={handlePayNow}
                    disabled={isPaying}
                    className="w-full py-2 text-xs text-theme-muted hover:text-theme-secondary transition-colors"
                  >
                    Use Stripe Checkout instead
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedMethodId && (
                    <div className="flex items-center justify-between p-3 surface-section border border-theme rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                        <div>
                          <p className="text-sm font-semibold text-theme-primary">
                            {savedMethods.find(m => m.id === selectedMethodId)?.brand} ···· {savedMethods.find(m => m.id === selectedMethodId)?.last4}
                          </p>
                          <p className="text-xs text-theme-muted">{savedMethods.find(m => m.id === selectedMethodId)?.cardholderName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => fetchPaymentMethods()}
                        disabled={isRefreshing}
                        className="text-theme-muted hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  )}
                  {savedMethods.length > 1 && (
                    <div className="space-y-1">
                      {savedMethods.filter(m => m.id !== selectedMethodId).map(m => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMethodId(m.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-theme-muted hover:text-theme-primary hover:surface-section rounded-lg transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          {m.brand} ···· {m.last4}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handlePayWithSavedCard}
                    disabled={isPaying || !selectedMethodId}
                    className="w-full py-3 bg-primary-light hover:bg-primary-light-hover text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPaying
                      ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
                      : <span>Pay Now — ${booking.currency} ${booking.finalPrice.toFixed(2)}</span>
                    }
                  </button>
                  <button
                    onClick={() => setIsAddingNewCard(true)}
                    className="w-full text-center text-xs text-theme-muted hover:text-theme-secondary transition-colors py-1"
                  >
                    Pay with a different card
                  </button>
                </div>
              )}
            </div>
          )}
 {canCancel && (
 <button
 onClick={() => setShowCancelModal(true)}
 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
 >
 <XCircle className="w-4 h-4" />
 Cancel Booking
 </button>
 )}
          {booking.status === BookingStatus.Completed && (
            <Link
              href={`/bookings/${bookingId}/review`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-theme text-theme-primary text-sm font-medium rounded-lg hover:surface-section transition-colors"
            >
              <Star className="w-4 h-4" />
              Write Review
            </Link>
          )}
 <button
 onClick={handleDownloadInvoice}
 className="w-full flex items-center justify-center gap-2 px-4 py-2 surface-section text-theme-secondary text-sm font-medium rounded-lg hover:surface-section dark:hover:surface-section transition-colors"
 >
 <FileText className="w-4 h-4" />
 Download Invoice
 </button>
 </div>

 {canCancel && (
 <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
 <p className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1">
 <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
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
 </div>
 </div>
 </div>
 </div>

 {showCancelModal && booking && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ">
 <div className="w-full max-w-md surface-card rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-red-600 dark:bg-red-700 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Cancel Booking
            </h3>
          </div>

 <div className="p-6 space-y-4">
 <p className="text-sm text-theme-secondary ">
 Are you sure you want to cancel <span className="font-semibold text-theme-primary">{booking.tourTitle}</span>?
 </p>

 {/* Optional cancellation reason */}
 <input
 type="text"
 value={cancelReason}
 onChange={(e) => setCancelReason(e.target.value)}
 placeholder="Reason for cancellation (optional)"
 className="
 w-full px-3 py-2
 surface-section
 border border-theme
 rounded-lg text-sm
 text-theme-primary
 placeholder-gray-400
 focus:outline-none focus:ring-2 focus:ring-red-500/30
"
 />

 {/* Refund preview — computed client-side, backend is authoritative */}
 <div className="p-4 surface-section rounded-xl space-y-2">
 <div className="flex justify-between text-sm">
 <span className="text-theme-secondary ">Booking amount</span>
 <span className="font-semibold text-theme-primary">
 {booking.currency} {booking.finalPrice.toFixed(2)}
 </span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-theme-secondary ">Refund policy</span>
 <span className="font-semibold text-amber-600 dark:text-amber-400">
 {previewRefund}%
 </span>
 </div>
 <div className="flex justify-between text-sm pt-2 border-t border-theme">
 <span className="font-medium text-theme-primary">You&apos;ll get</span>
 <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
 {booking.currency} {((booking.finalPrice * previewRefund) / 100).toFixed(2)}
 </span>
 </div>
 <p className="text-xs text-theme-muted mt-2">
 {previewRefund === 100 && 'Full refund (more than 48h before tour)'}
 {previewRefund === 50 && '50% refund (24-48h before tour)'}
 {previewRefund === 0 && 'No refund (within 24h of tour start)'}
 </p>
 </div>

 {/* Actions */}
 <div className="flex gap-3 pt-2">
 <button
 onClick={() => setShowCancelModal(false)}
 className="flex-1 px-4 py-2 surface-section text-theme-secondary font-medium rounded-lg hover:surface-section dark:hover:surface-section transition-colors"
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