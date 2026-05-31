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

import { useEffect, useState } from 'react'
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

import { createPaymentSession } from '@/src/lib/api/payment'
// MockPaymentSimulator replaced by /checkout/mock full-page redirect
import PaymentCountdownBanner from '@/src/components/booking/PaymentCountdownBanner'
import { BookingResponse, BookingStatus } from '@/src/lib/types/tour.types'
import { useRouter } from 'next/navigation'
import { getTravelerBooking } from '@/src/lib/api/tours'

// ── Inner component (owns useSearchParams) ────────────────────────────────────
export default function BookingConfirmationPage() {

 const router = useRouter()
 const searchParams = useSearchParams()
 const bookingId = searchParams.get('id')

 const [booking, setBooking] = useState<BookingResponse | null>(null)
 const [showQR, setShowQR] = useState(false)
 const [isPaying, setIsPaying] = useState(false)

 // ── Fetch the booking created by the booking flow ──────────────────────
 // ?id= is set by the"Book Now" handler after createBooking() succeeds.
 // If the ID is missing or fetch fails, we show a placeholder message.

 useEffect(() => {
 const fetchBooking = async () => {
 if (!bookingId) {
 return
 }
 try {
 const res = await getTravelerBooking(Number(bookingId))
 setBooking(res)
 } catch {
 toast.error('Could not load booking details')
 }
 }
 fetchBooking()
 }, [bookingId])
 // Real Stripe: backend returns a checkout.stripe.com URL → redirect directly.
 // Mock mode:   backend returns a MOCK instruction string → redirect to /checkout/mock.
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
            const p = new URLSearchParams({
              sessionId,
              bookingId: String(booking.id),
              amount:    String(booking.finalPrice),
              currency:  booking.currency ?? 'USD',
              title:     booking.tourTitle ?? 'Tour',
            })
            if (booking.tourCoverImageUrl && !booking.tourCoverImageUrl.startsWith('data:image')) {
              p.set('coverImage', booking.tourCoverImageUrl)
            }
            router.push(`/checkout/mock?${p.toString()}`)
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

 {booking.status === BookingStatus.PendingPayment && booking.paymentDeadlineUtc && (
  <div className="mt-8 max-w-xl mx-auto text-left">
    <PaymentCountdownBanner
      deadlineUtc={booking.paymentDeadlineUtc}
      tourTitle={booking.tourTitle}
    />
  </div>
 )}

 {booking.status === BookingStatus.PendingPayment && (
  <div className="mt-4 max-w-xl mx-auto text-left">
  <div className="surface-card border border-primary-light/20 dark:border-primary-dark/20 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-blue-500/10">
  <button
  onClick={handlePayNow}
  disabled={isPaying}
  className="w-full py-4 bg-primary-light hover:bg-primary-light-hover text-white font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
  >
  {isPaying ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Starting checkout...</span></> : `Pay ${booking.currency} ${booking.finalPrice.toFixed(2)}`}
  </button>
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
 <div className="p-6 border-b border-[#c8d8f8] dark:border-[#1a3566]">
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
 <span className={`px-3 py-1 text-xs font-bold capitalize tracking-normal rounded-full border ${
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

  {/* Mock payment is now a full-page redirect to /checkout/mock — no modal needed */}
 </PageLayout>
  )
}
