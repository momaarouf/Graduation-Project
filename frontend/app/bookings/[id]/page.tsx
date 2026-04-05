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
import { useRouter } from 'next/navigation'
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
  User
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

import { getTravelerBooking, cancelBooking } from '@/src/lib/api/tours'
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

  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // ── Fetch booking from backend ──────────────────────────────────────────

  useEffect(() => {
    const fetchBooking = async () => {
      setIsLoading(true)
      try {
        const res = await getTravelerBooking(Number(bookingId))
        setBooking(res.data)
      } catch {
        toast.error('Booking not found')
        router.push('/dashboard/traveler/bookings')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cancel booking — calls real API with { data } syntax ───────────────
  // Backend computes the authoritative refundPercent and returns it.

  const handleCancelBooking = async () => {
    if (!booking) return
    setIsCancelling(true)
    try {
      const res = await cancelBooking(booking.id, cancelReason || undefined)
      toast.success(
        `Booking cancelled! ${res.data.refundPercent ? `${res.data.refundPercent}% refund` : 'No refund (within 24h window)'}`
      )
      setShowCancelModal(false)
      // Re-fetch to show updated status
      const updated = await getTravelerBooking(booking.id)
      setBooking(updated.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setIsCancelling(false)
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