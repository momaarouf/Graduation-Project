// ============================================================================
// BOOKING CONFIRMATION PAGE — WIRED TO REAL BACKEND
// ============================================================================
// LOCATION: /frontend/app/bookings/confirmation/page.tsx
//
// PURPOSE: Post-booking success page showing booking summary, QR code, and
// action buttons (add to calendar, download invoice, share).
//
// DATA SOURCE: getTravelerBooking(id) → BookingResponse
// The booking ID comes from ?id= search param, set by the booking flow.
//
// IMPORTANT: qrCode (UUID) is only available on the traveler's own booking
// response. Never expose it to guides or public pages.
// ============================================================================

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { QRCodeCanvas } from 'qrcode.react'
import {
 CheckCircle,
 Calendar,
 Clock,
 MapPin,
 Users,
 DollarSign,
 Download,
 Share2,
 Calendar as CalendarIcon,
 QrCode,
 ChevronRight,
 Loader2,
 ChevronLeft,
 CreditCard,
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

import { 
 getTravelerPaymentMethods, 
 saveTravelerPaymentMethod, 
 payWithSavedCard,
 TravelerPaymentMethod 
} from '@/src/lib/api/traveler-payments'
import { createPaymentSession } from '@/src/lib/api/payment'
import MockPaymentSimulator from '@/src/components/payment/MockPaymentSimulator'
import { BookingResponse, BookingStatus } from '@/src/lib/types/tour.types'
import { usePaymentCountdown } from '@/src/hooks/usePaymentCountdown'
import { useRouter } from 'next/navigation'
import { getTravelerBooking } from '@/src/lib/api/tours'

// ── Inner component (owns useSearchParams) ────────────────────────────────────
function BookingConfirmationContent() {

 const router = useRouter()
 const searchParams = useSearchParams()
 const bookingId = searchParams.get('id')

 const [booking, setBooking] = useState<BookingResponse | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [showQR, setShowQR] = useState(false)
 const [isPaying, setIsPaying] = useState(false)

 // ── Payment countdown — reads paymentDeadlineUtc from booking response ─
 // This is the authoritative deadline set by the backend at booking creation.
 // Do NOT compute from createdAtUtc + 30min — that was the old wrong approach.
 const countdown = usePaymentCountdown(
 booking?.status === BookingStatus.PendingPayment ? booking?.paymentDeadlineUtc : null
 )

 // Payment Methods State
 const [savedMethods, setSavedMethods] = useState<TravelerPaymentMethod[]>([])
 const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null)
 const [isAddingNewCard, setIsAddingNewCard] = useState(false)
 const [isRefreshing, setIsRefreshing] = useState(false)

 // New Card Form State (if needed)
 const [newCardName, setNewCardName] = useState('')
 const [newCardNumber, setNewCardNumber] = useState('')
 const [newCardExM, setNewCardExM] = useState('01')
 const [newCardExY, setNewCardExY] = useState(new Date().getFullYear().toString())
 const [newCardCvv, setNewCardCvv] = useState('')
 const [saveForFuture, setSaveForFuture] = useState(true)

 // Mock Payment Simulator state (retained for Stripe fallback)
 const [showMockDialog, setShowMockDialog] = useState(false)
 const [mockSessionId, setMockSessionId] = useState<string | null>(null)

 // ── Fetch the booking created by the booking flow ──────────────────────
 // ?id= is set by the"Book Now" handler after createBooking() succeeds.
 // If the ID is missing or fetch fails, we show a placeholder message.

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
 console.error('Failed to fetch methods:', err)
 } finally {
 setIsRefreshing(false)
 }
 }

 useEffect(() => {
 const fetchBooking = async () => {
 if (!bookingId) {
 setIsLoading(false)
 return
 }
 try {
 const res = await getTravelerBooking(Number(bookingId))
 setBooking(res)

 if (res.status === BookingStatus.PendingPayment) {
 await fetchPaymentMethods(true)
 }
 } catch {
 toast.error('Could not load booking details')
 } finally {
 setIsLoading(false)
 }
 }
 fetchBooking()
 }, [bookingId])

 // Sync when user returns to tab
 useEffect(() => {
 const onFocus = () => {
 if (booking?.status === BookingStatus.PendingPayment) {
 fetchPaymentMethods(true)
 }
 }
 window.addEventListener('focus', onFocus)
 return () => window.removeEventListener('focus', onFocus)
 }, [booking?.status, selectedMethodId])

 // (countdown handled by usePaymentCountdown hook above — no manual interval needed)

 const handlePayNow = async () => {
 if (!booking) return
 setIsPaying(true)
 try {
 const response = await createPaymentSession(booking.id)
 if (response.checkoutUrl) {
 if (response.checkoutUrl.startsWith('MOCK')) {
 const match = response.checkoutUrl.match(/mock_sess_[a-f0-9]+/i)
 const sessionId = match ? match[0] : null
 if (sessionId) {
 setMockSessionId(sessionId)
 setShowMockDialog(true)
 } else {
 toast.error('Could not parse mock session ID from backend')
 }
 } else {
 window.location.href = response.checkoutUrl
 }
 } else {
 toast.error('Could not initiate payment session')
 }
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Payment failed to start')
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
 // Refresh booking data
 const res = await getTravelerBooking(Number(bookingId))
 setBooking(res)
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Payment failed')
 } finally {
 setIsPaying(false)
 }
 }

 const handlePayWithNewCard = async () => {
 if (!booking) return
 
 if (!newCardName.trim() || newCardNumber.replace(/\s/g, '').length < 13 || newCardCvv.length < 3) {
 toast.error('Please fill in all card details correctly')
 return
 }

 setIsPaying(true)
 try {
 if (saveForFuture) {
 const saved = await saveTravelerPaymentMethod({
 brand: newCardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
 last4: newCardNumber.replace(/\s/g, '').slice(-4),
 cardholderName: newCardName,
 expiryMonth: parseInt(newCardExM),
 expiryYear: parseInt(newCardExY),
 isDefault: true
 })
 await payWithSavedCard(booking.id, saved.id)
 toast.success('Card saved and payment processed!')
 } else {
 const response = await createPaymentSession(booking.id)
 if (response.checkoutUrl) {
 if (response.checkoutUrl.startsWith('MOCK')) {
 const match = response.checkoutUrl.match(/mock_sess_[a-f0-9]+/i)
 setMockSessionId(match ? match[0] : null)
 setShowMockDialog(true)
 } else {
 window.location.href = response.checkoutUrl
 }
 return
 }
 }
 // Refresh booking data on success
 const res = await getTravelerBooking(Number(bookingId))
 setBooking(res)
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Failed to process payment')
 } finally {
 setIsPaying(false)
 }
 }

 // handleSimulateMockAction removed - logic moved to MockPaymentSimulator component

 // ── Calendar download (.ics file) ──────────────────────────────────────
 // Generates a standard iCalendar file from the booking date/time.

 const handleAddToCalendar = () => {
 if (!booking) return
 const start = new Date(booking.startTimeUtc)
 const end = new Date(booking.endTimeUtc)

 const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${booking.tourTitle}
LOCATION:${booking.meetingPointName || 'See booking details'}
DTSTART:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
END:VEVENT
END:VCALENDAR`

 const blob = new Blob([icsContent], { type: 'text/calendar' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `${booking.tourTitle.replace(/\s+/g, '_')}.ics`
 a.click()
 URL.revokeObjectURL(url)

 toast.success('Calendar event downloaded!')
 }

 // ── Invoice download (text placeholder — PDF generation is future) ─────

 const handleDownloadInvoice = () => {
 if (!booking) return
 const invoice = `
TRAVEL MARKET - INVOICE
===================
Booking Reference: #${booking.id}
Date: ${new Date().toLocaleDateString()}

Tour: ${booking.tourTitle}
Date: ${new Date(booking.startTimeUtc).toLocaleDateString()}
Travelers: ${booking.peopleCount}

Total: ${booking.currency} ${booking.finalPrice.toFixed(2)}
Status: ${booking.status}

Thank you for choosing TravelMarket!
 `

 const blob = new Blob([invoice], { type: 'text/plain' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `invoice-${booking.id}.txt`
 a.click()
 URL.revokeObjectURL(url)

 toast.success('Invoice downloaded!')
 }

 // ── Web Share API with clipboard fallback ──────────────────────────────

 const handleShare = () => {
 if (!booking) return
 if (navigator.share) {
 navigator.share({
 title: booking.tourTitle,
 text: `I just booked"${booking.tourTitle}" on TravelMarket!`,
 url: window.location.href,
 }).catch(() => {
 // User cancelled share — no-op
 })
 } else {
 navigator.clipboard.writeText(window.location.href)
 toast.success('Link copied to clipboard!')
 }
 }

 // ── Loading state ──────────────────────────────────────────────────────

 if (isLoading) {
 return (
 <PageLayout>
 <div className="min-h-[60vh] surface-section flex items-center justify-center">
 <Loader2 className="w-8 h-8 animate-spin text-primary-light dark:text-primary-dark" />
 </div>
 </PageLayout>
 )
 }

 // ── No booking found ──────────────────────────────────────────────────

 if (!booking) {
 return (
 <PageLayout>
 <div className="pt-14 sm:pt-16 min-h-screen surface-section">
 <div className="container-safe mx-auto max-w-3xl py-8 sm:py-12 text-center">
 <h1 className="text-2xl font-bold text-theme-primary mb-4">
 Booking Not Found
 </h1>
 <p className="text-theme-secondary mb-6">
 We couldn&apos;t find your booking. It may have already been processed.
 </p>
 <Link
 href="/dashboard/traveler/bookings"
 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-light hover:bg-primary-light-hover text-white font-medium rounded-xl transition-colors min-h-[48px]"
 >
 View My Bookings
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </PageLayout>
 )
 }

 // Format dates for display — all backend dates are UTC ISO strings
 const startDate = new Date(booking.startTimeUtc)
 const formattedDate = startDate.toLocaleDateString('en-US', {
 weekday: 'long',
 month: 'long',
 day: 'numeric',
 year: 'numeric'
 })
 const formattedTime = startDate.toLocaleTimeString('en-US', {
 hour: 'numeric',
 minute: '2-digit'
 })

 // Determine if booking is pending review (Request to Book mode)
 const isPending = booking.status === BookingStatus.PendingGuide

 return (
 <PageLayout>
 <div className="pt-14 sm:pt-16 min-h-screen surface-section">
 <div className="container-safe mx-auto max-w-3xl py-8 sm:py-12">

 {/* Success/Payment Header */}
 <div className="text-center mb-8">
 <div className={`inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full ${
 booking.status === BookingStatus.PendingPayment 
 ? 'bg-primary-light/10 dark:bg-primary-dark/10 ring-8 ring-primary-light/5 dark:ring-primary-dark/5' 
 : 'bg-emerald-100 dark:bg-emerald-900/30'
 }`}>
 {booking.status === BookingStatus.PendingPayment ? (
 <Clock className="w-10 h-10 text-primary-light dark:text-primary-dark animate-pulse" />
 ) : (
 <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
 )}
 </div>
 
 <h1 className="text-xl sm:text-3xl font-bold text-theme-primary mb-2 tracking-tight">
 {booking.status === BookingStatus.PendingPayment 
 ? 'Action Required: Complete Payment' 
 : isPending 
 ? 'Booking Request Sent!' 
 : 'Booking Confirmed!'}
 </h1>
 
 <p className="text-theme-secondary font-medium">
 Reference: <span className="font-mono font-bold text-theme-primary">SH-{booking.id.toString().padStart(4, '0')}</span>
 </p>

 {booking.status === BookingStatus.PendingPayment && (
 <div className="mt-8 max-w-xl mx-auto text-left">
 <div className="surface-card border border-primary-light/20 dark:border-primary-dark/20 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-blue-500/10">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h3 className="text-lg font-bold text-theme-primary uppercase tracking-tight">Checkout</h3>
 <div className="flex items-center gap-2 mt-1">
 {/* Countdown pill — reads from backend paymentDeadlineUtc (15-min window) */}
 {countdown && !countdown.isExpired && (
 <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
 countdown.urgency === 'critical'
 ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 animate-pulse'
 : countdown.urgency === 'warning'
 ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 animate-pulse'
 : 'bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light/20 dark:border-primary-dark/20 text-primary-light dark:text-primary-dark'
 }`}>
 Reserved for {countdown.displayString}
 </div>
 )}
 {countdown?.isExpired && (
 <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
 Expired
 </div>
 )}
 </div>
 </div>
 </div>

 {/* 2-State Payment UI */}
 <div className="space-y-3 mt-4">
 {isAddingNewCard ? (
 <div className="space-y-3 p-4 surface-section border border-theme rounded-xl">
 {savedMethods.length > 0 && (
 <button onClick={() => setIsAddingNewCard(false)} className="flex items-center gap-1 text-xs text-primary-light dark:text-primary-dark hover:underline">
 <ChevronLeft className="w-3 h-3" /> Back to saved card
 </button>
 )}
 <h4 className="text-sm font-semibold text-theme-primary">New Payment Method</h4>
 <div className="space-y-2">
 <input type="text" value={newCardName} onChange={(e) => setNewCardName(e.target.value)} placeholder="Cardholder name" className="w-full px-3 py-2.5 surface-card border border-theme rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-light/30 transition-all" />
 <input type="text" value={newCardNumber} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19); setNewCardNumber(val) }} placeholder="0000 0000 0000 0000" className="w-full px-3 py-2.5 surface-card border border-theme rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-light/30 transition-all" />
 <div className="grid grid-cols-3 gap-2">
 <select value={newCardExM} onChange={(e) => setNewCardExM(e.target.value)} className="px-2 py-2.5 surface-card border border-theme rounded-lg text-sm outline-none appearance-none cursor-pointer text-center">
 {Array.from({length: 12}, (_, i) => String(i+1).padStart(2, '0')).map(m => (<option key={m} value={m}>{m}</option>))}
 </select>
 <select value={newCardExY} onChange={(e) => setNewCardExY(e.target.value)} className="px-2 py-2.5 surface-card border border-theme rounded-lg text-sm outline-none appearance-none cursor-pointer text-center">
 {Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString()).map(y => (<option key={y} value={y}>{y}</option>))}
 </select>
 <input type="password" value={newCardCvv} onChange={(e) => setNewCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="CVV" className="px-2 py-2.5 surface-card border border-theme rounded-lg text-sm outline-none text-center" />
 </div>
 <label className="flex items-center gap-2 cursor-pointer">
 <input type="checkbox" checked={saveForFuture} onChange={(e) => setSaveForFuture(e.target.checked)} className="w-4 h-4 rounded border-theme text-primary-light" />
 <span className="text-xs text-theme-muted">Save for future use</span>
 </label>
 </div>
 <button onClick={handlePayWithNewCard} disabled={isPaying} className="w-full py-3 bg-primary-light hover:bg-primary-light-hover text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
 {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay Now — ${booking.currency} ${booking.finalPrice.toFixed(2)}`}
 </button>
 <button onClick={handlePayNow} disabled={isPaying} className="w-full py-2 text-xs text-theme-muted hover:text-theme-secondary transition-colors">Use Stripe Checkout instead</button>
 </div>
 ) : (
 <div className="space-y-3">
 {selectedMethodId && (
 <div className="flex items-center justify-between p-3 surface-section border border-theme rounded-lg">
 <div className="flex items-center gap-3">
 <CreditCard className="w-4 h-4 text-primary-light dark:text-primary-dark" />
 <div>
 <p className="text-sm font-semibold text-theme-primary">{savedMethods.find(m => m.id === selectedMethodId)?.brand} ···· {savedMethods.find(m => m.id === selectedMethodId)?.last4}</p>
 <p className="text-xs text-theme-muted">{savedMethods.find(m => m.id === selectedMethodId)?.cardholderName}</p>
 </div>
 </div>
 <button onClick={() => fetchPaymentMethods()} disabled={isRefreshing} className="text-theme-muted hover:text-primary-light dark:hover:text-primary-dark transition-colors">
 <Clock className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
 </button>
 </div>
 )}
 {savedMethods.length > 1 && (
 <div className="space-y-1">
 {savedMethods.filter(m => m.id !== selectedMethodId).map(m => (
 <button key={m.id} onClick={() => setSelectedMethodId(m.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-theme-muted hover:text-theme-primary hover:surface-section rounded-lg transition-colors">
 <CreditCard className="w-3.5 h-3.5" />{m.brand} ···· {m.last4}
 </button>
 ))}
 </div>
 )}
 <button onClick={handlePayWithSavedCard} disabled={isPaying || !selectedMethodId} className="w-full py-3 bg-primary-light hover:bg-primary-light-hover text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
 {isPaying ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></> : <span>Pay Now — {booking.currency} {booking.finalPrice.toFixed(2)}</span>}
 </button>
 <button onClick={() => setIsAddingNewCard(true)} className="w-full text-center text-xs text-theme-muted hover:text-theme-secondary transition-colors py-1">Pay with a different card</button>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {isPending && booking.status !== BookingStatus.PendingPayment && (
 <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 font-medium">
 Your guide will review and confirm this booking within 24 hours.
 </p>
 )}
 
 {!isPending && booking.status !== BookingStatus.PendingPayment && (
 <p className="text-sm text-theme-muted mt-2">
 A confirmation has been sent to your email
 </p>
 )}
 </div>

 {/* Main Card */}
 <div className="surface-card border border-theme rounded-2xl shadow-xl overflow-hidden mb-6">

 {/* Tour Header */}
 <div className="p-6 border-b border-theme">
 <div className="flex items-start gap-4">
 {/* Cover image placeholder — real tour image URL if backend returns it */}
 <div className="w-20 h-20 rounded-lg surface-section overflow-hidden flex items-center justify-center">
 {booking.tourCoverImageUrl ? (
 <img src={booking.tourCoverImageUrl} alt={booking.tourTitle} className="w-full h-full object-cover" />
 ) : (
 <Calendar className="w-8 h-8 text-theme-muted" />
 )}
 </div>
 <div className="flex-1">
 <h2 className="text-xl font-bold text-theme-primary mb-1">
 {booking.tourTitle}
 </h2>
 <p className="text-sm text-theme-secondary ">
 {booking.bookingMode === 'Instant' ? 'Instant Book' : 'Request to Book'}
 </p>
 </div>
 <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border ${
 booking.status === BookingStatus.PendingPayment
 ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark border-primary-light/20 dark:border-primary-dark/20'
 : isPending
 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
 : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
 }`}>
 {booking.status === BookingStatus.PendingPayment ? 'Unpaid' : isPending ? 'Pending' : 'Confirmed'}
 </span>
 </div>
 </div>

 {/* Booking Details */}
 <div className="p-6 space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex items-start gap-3">
 <Calendar className="w-5 h-5 text-theme-muted mt-0.5" />
 <div>
 <p className="text-xs text-theme-muted ">Date & Time</p>
 <p className="font-medium text-theme-primary">{formattedDate}</p>
 <p className="text-sm text-theme-secondary ">{formattedTime}</p>
 </div>
 </div>

 {booking.meetingPointName && (
 <div className="flex items-start gap-3">
 <MapPin className="w-5 h-5 text-theme-muted mt-0.5" />
 <div>
 <p className="text-xs text-theme-muted ">Meeting Point</p>
 <p className="font-medium text-theme-primary">{booking.meetingPointName}</p>
 </div>
 </div>
 )}

 <div className="flex items-start gap-3">
 <Users className="w-5 h-5 text-theme-muted mt-0.5" />
 <div>
 <p className="text-xs text-theme-muted ">Travelers</p>
 <p className="font-medium text-theme-primary">
 {booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}
 </p>
 </div>
 </div>

 <div className="flex items-start gap-3">
 <DollarSign className="w-5 h-5 text-primary-light dark:text-primary-dark mt-0.5" />
 <div>
 <p className="text-xs text-theme-muted ">{booking.status === BookingStatus.PendingPayment ? 'Amount Due' : 'Total Paid'}</p>
 <p className="font-bold text-theme-primary">
 {booking.currency} {booking.finalPrice.toFixed(2)}
 </p>
 </div>
 </div>
 </div>

 {/* QR Code Section — only show if booking has a qrCode token */}
 {booking.qrCode && (
 <div className="mt-6 p-4 surface-section rounded-xl">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <QrCode className="w-8 h-8 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <div>
 <p className="font-medium text-theme-primary">Your QR Ticket</p>
 <p className="text-xs text-theme-muted ">
 Show this QR code to your guide at the meeting point
 </p>
 </div>
 </div>
 <button
 onClick={() => setShowQR(!showQR)}
 className="px-4 py-2 bg-primary-light hover:bg-primary-light-hover text-white text-sm font-medium rounded-lg transition-colors"
 >
 {showQR ? 'Hide QR' : 'Show QR'}
 </button>
 </div>

 {showQR && (
 <div className="mt-4 p-6 surface-card rounded-xl text-center">
 {/* QR icon placeholder — in production use a QR generator library */}
 <div className="inline-block p-6 surface-card rounded-3xl shadow-2xl border-4 border-theme">
 <QRCodeCanvas 
 value={booking.qrCode} 
 size={160}
 level="H"
 includeMargin={false}
 className="mx-auto"
 />
 </div>
 <p className="text-sm font-mono text-theme-secondary mb-4 break-all">
 {booking.qrCode}
 </p>
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 {/* Action Buttons */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
 <button
 onClick={handleAddToCalendar}
 className="flex items-center justify-center gap-2 px-4 py-3 surface-card border border-theme rounded-xl text-theme-secondary hover:surface-section dark:hover:surface-card transition-colors"
 >
 <CalendarIcon className="w-4 h-4" />
 Add to Calendar
 </button>
 <button
 onClick={handleDownloadInvoice}
 className="flex items-center justify-center gap-2 px-4 py-3 surface-card border border-theme rounded-xl text-theme-secondary hover:surface-section dark:hover:surface-card transition-colors"
 >
 <Download className="w-4 h-4" />
 Download Invoice
 </button>
 <button
 onClick={handleShare}
 className="flex items-center justify-center gap-2 px-4 py-3 surface-card border border-theme rounded-xl text-theme-secondary hover:surface-section dark:hover:surface-card transition-colors"
 >
 <Share2 className="w-4 h-4" />
 Share
 </button>
 </div>

 {/* Next Steps */}
 <div className="bg-primary-light/10 border border-primary-light/20 dark:border-primary-dark/20 rounded-xl p-6">
 <h3 className="font-bold text-primary-light dark:text-primary-dark mb-3">
 What&apos;s Next?
 </h3>
 <ul className="space-y-2 text-sm text-theme-secondary dark:text-theme-muted">
 <li className="flex items-start gap-2">
 <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
 <span>
 {isPending
 ? 'Your guide will review and confirm your booking within 24 hours.'
 : 'Your booking is confirmed. Show the QR code at the meeting point.'}
 </span>
 </li>
 <li className="flex items-start gap-2">
 <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
 <span>The guide will receive your booking details and may contact you via chat.</span>
 </li>
 <li className="flex items-start gap-2">
 <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
 <span>You can view and manage your bookings from the dashboard.</span>
 </li>
 </ul>
 </div>

 {/* Navigation Links */}
 <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
 <Link
 href="/dashboard/traveler/bookings"
 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-light hover:bg-primary-light-hover text-white font-medium rounded-xl transition-colors min-h-[48px]"
 >
 View My Bookings
 <ChevronRight className="w-4 h-4" />
 </Link>
 <Link
 href="/tours"
 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 surface-section text-theme-secondary font-medium rounded-xl hover:surface-section dark:hover:surface-section transition-colors min-h-[48px]"
 >
 Browse More Tours
 </Link>
 </div>
 </div>
 </div>

 {/* --- MOCK PAYMENT SIMULATOR MODAL --- */}
 {showMockDialog && mockSessionId && booking && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 ">
 <MockPaymentSimulator 
 sessionId={mockSessionId}
 amount={booking.finalPrice}
 currency={booking.currency}
 isOpen={true}
 onSuccess={async () => {
 // Refresh booking data on success
 const res = await getTravelerBooking(Number(bookingId))
 setBooking(res)
 setShowMockDialog(false)
 }}
 onClose={() => setShowMockDialog(false)}
 />
 </div>
 )}
 </PageLayout>
  )
}

// ── Default export: wraps in Suspense (required for useSearchParams in Next 15+) ──
export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] surface-section flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  )
}
