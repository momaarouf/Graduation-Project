// ============================================================================
// BOOKING DETAIL PAGE
// ============================================================================
// LOCATION: /frontend/src/app/bookings/[id]/page.tsx
// 
// PURPOSE: View detailed information about a specific booking
// 
// FEATURES:
// - All booking details
// - QR ticket
// - Cancellation with refund calculation
// - Contact guide
// - Download invoice
// - View tour details
// ============================================================================

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  Shield,
  Clock as ClockIcon
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import { tr } from 'framer-motion/client'

// Mock booking data - replace with API call
const MOCK_BOOKING = {
  id: 'B123456',
  bookingReference: 'SH-1234-5678',
  tourId: '1',
  tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
  tourImage: '/images/tours/istanbul-ottoman.jpg',
  guideId: 'guide-123',
  guideName: 'Mehmet Yilmaz',
  guideAvatar: '/images/guides/mehmet.jpg',
  guideVerified: true,
  date: '2026-04-15T09:00:00Z',
  duration: '4 hours',
  meetingPoint: {
    name: 'Sultanahmet Square Fountain',
    address: 'Sultanahmet Meydanı, Fatih/İstanbul',
    instructions: 'Look for the guide holding an orange sign'
  },
  travelers: 2,
  totalPrice: 178,
  currency: 'USD',
  basePrice: 89,
  discounts: [
    { type: 'group', amount: 9, description: 'Group discount (5%)' }
  ],
  platformFee: 17.8,
  status: 'confirmed',
  bookedAt: '2026-03-20T14:30:00Z',
  cancellationDeadline: '2026-02-15T09:00:00Z',
  qrCode: 'QR-BOOKING-123',
  hasReview: false,
  canReview: true,
  paymentMethod: 'Visa •••• 4242'
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationDetails, setCancellationDetails] = useState({
    refundAmount: 0,
    refundPercent: 0,
    hoursUntilDeadline: 0
  })
  const [booking, setBooking] = useState(MOCK_BOOKING)

  // In Phase 2: fetch booking by ID
  const bookingId = params.id

  const date = new Date(booking.date)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  const bookedDate = new Date(booking.bookedAt)
  const formattedBookedDate = bookedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // Check if cancellation is allowed
  const now = new Date()
  const deadline = new Date(booking.cancellationDeadline)
  const canCancel = booking.status === 'confirmed' && now < deadline

  // Calculate hours until deadline
  const hoursUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
  // Calculate cancellation details when modal opens
const calculateCancellation = () => {
  const now = new Date()
  const deadline = new Date(booking.cancellationDeadline)
  const hoursUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
  
  let refundPercent = 0
  if (hoursUntil > 48) refundPercent = 100
  else if (hoursUntil > 24) refundPercent = 50
  else refundPercent = 0
  
  setCancellationDetails({
    refundAmount: (booking.totalPrice * refundPercent) / 100,
    refundPercent,
    hoursUntilDeadline: hoursUntil
  })
  setShowCancelModal(true)
}
const handleDownloadInvoice = () => {
  const invoice = `
SAFARIHUB - INVOICE
===================
Booking Reference: ${booking.bookingReference}
Date: ${new Date().toLocaleDateString()}

Tour: ${booking.tourTitle}
Date: ${formattedDate} at ${formattedTime}
Guide: ${booking.guideName}
Travelers: ${booking.travelers}
Total: $${booking.totalPrice}
Status: ${booking.status}

Cancellation Policy:
- 100% refund up to 48h before
- 50% refund 24-48h before
- No refund within 24h

Thank you for choosing SafariHub!
  `
  
  const blob = new Blob([invoice], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${booking.bookingReference}.txt`
  a.click()
  URL.revokeObjectURL(url)
  
  toast.success('Invoice downloaded!')
}
const formatHoursRemaining = (hours: number) => {
  if (hours < 0) return 'Deadline passed'
  if (hours < 24) return `${Math.ceil(hours)} hours remaining`
  if (hours < 48) return `${Math.floor(hours)} hours remaining`
  return `${Math.floor(hours / 24)} days remaining`
}

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
                Reference: {booking.bookingReference}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                booking.status === 'confirmed'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : booking.status === 'pending'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : booking.status === 'completed'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              <button className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
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
                  <div className="relative w-full sm:w-48 h-32 bg-gray-200 dark:bg-gray-800">
                    <Image src={booking.tourImage} alt={booking.tourTitle} fill className="object-cover" />
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
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.meetingPoint.name}</span>
                      </div>
                    </div>
                    <Link
                      href={`/tours/${booking.tourId}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View tour details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Meeting Point Details */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Meeting Point
                </h3>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  {booking.meetingPoint.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {booking.meetingPoint.address}
                </p>
                {booking.meetingPoint.instructions && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                    {booking.meetingPoint.instructions}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Price Breakdown
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {booking.currency === 'USD' && '$'}
                      {booking.basePrice} × {booking.travelers} {booking.travelers === 1 ? 'person' : 'people'}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${booking.basePrice * booking.travelers}
                    </span>
                  </div>
                  {booking.discounts.map((discount, i) => (
                    <div key={i} className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>{discount.description}</span>
                      <span>-${discount.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Platform fee</span>
                    <span>${booking.platformFee}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200 dark:border-gray-800">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-xl text-gray-900 dark:text-white">
                      ${booking.totalPrice}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Paid via {booking.paymentMethod} on {formattedBookedDate}
                </p>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* Guide Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  Your Guide
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <Image src={booking.guideAvatar} alt={booking.guideName} width={48} height={48} className="object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {booking.guideName}
                    </p>
                    {booking.guideVerified && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified Guide
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    href={`/dashboard/traveler/messages?guide=${booking.guideId}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Guide
                  </Link>
                </div>
              </div>

              {/* QR Ticket Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white">QR Ticket</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Show this QR code to your guide at the meeting point
                </p>
                <Link
                  href={`/bookings/${bookingId}/ticket`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  View Ticket
                </Link>
              </div>

              {/* Actions Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  Actions
                </h3>
                <div className="space-y-2">
                  {canCancel && (
                    <button
                      onClick={calculateCancellation}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Booking
                    </button>
                  )}
                  {booking.canReview && !booking.hasReview && (
                    <Link
                      href={`/bookings/${bookingId}/review`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      Write Review
                    </Link>
                  )}
                  {/* Show "Review Submitted" if already reviewed */}
    {booking.hasReview && (
      <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
        <CheckCircle className="w-4 h-4" />
        Review Submitted
      </div>
    )}
                  <button onClick={handleDownloadInvoice} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <FileText className="w-4 h-4" />
                    Download Invoice
                  </button>
                </div>

                {/* Cancellation Warning */}
                {booking.status === 'confirmed' && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <p className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1">
                      <ClockIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>
                        {canCancel 
                          ? `Cancel within ${formatHoursRemaining(hoursUntilDeadline)} hours for ${cancellationDetails.refundPercent}% refund`
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

      {/* Cancellation Modal - To be implemented */}
      {/* Cancellation Modal - To be implemented */}
{showCancelModal && (
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

        {/* Refund info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Booking amount</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${booking.totalPrice}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Refund policy</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {cancellationDetails.refundPercent}%
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-900 dark:text-white">You'll get</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ${cancellationDetails.refundAmount.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {cancellationDetails.refundPercent === 100 && 'Full refund (minus platform fee)'}
            {cancellationDetails.refundPercent === 50 && '50% refund'}
            {cancellationDetails.refundPercent === 0 && 'No refund (cancellation within 24h)'}
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
            onClick={() => {
              // Phase 2: API call to cancel
              toast.success('Booking cancelled! Refund will be processed.')
              setShowCancelModal(false)
              // Redirect to bookings page after 2 seconds
              setTimeout(() => router.push('/dashboard/traveler/bookings'), 2000)
            }}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
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