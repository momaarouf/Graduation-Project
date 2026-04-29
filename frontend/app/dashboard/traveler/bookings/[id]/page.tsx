'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { QRCodeCanvas } from 'qrcode.react'
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
 Phone,
 Smartphone,
 RefreshCw,
 CreditCard,
 Scale
} from 'lucide-react'

import { getTravelerBooking, cancelBooking, getTravelerReviews } from '@/src/lib/api/tours'
import { notificationsApi } from '@/src/lib/api/notifications'
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
  return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
 case BookingStatus.PendingGuide:
 case BookingStatus.PendingPayment:
  return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
 case BookingStatus.Completed:
  return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
 case 'Rejected':
  return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
 default:
 return 'surface-section text-theme-secondary'
 }
}

// Cancellation policy: >48h = 100%, 24–48h = 50%, <24h = 0%
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
 const [isReviewed, setIsReviewed] = useState(false)

 useEffect(() => {
 const fetchData = async () => {
 setIsLoading(true)
 try {
 const [bookingRes, reviewsRes] = await Promise.all([
 getTravelerBooking(Number(bookingId)),
 getTravelerReviews().catch(() => ({ content: [] }))
 ])
 setBooking(bookingRes)
 
 // PERSISTENT SYNC: Mark all notifications for this specific booking as read
 try {
 await notificationsApi.markByReference('BOOKING_', bookingId);
 // LOCAL SYNC: Update the bell and sidebar immediately
 window.dispatchEvent(new CustomEvent('notification-mark-read', { 
 detail: { type: 'BOOKING_', referenceId: bookingId } 
 }));
 } catch (err) {
 console.error('Failed to mark booking notifications as read:', err);
 }

 // Check if this booking ID exists in the traveler's reviews
 const reviewed = (reviewsRes?.content || []).some(
 (r: any) => r.bookingId === Number(bookingId)
 )
 setIsReviewed(reviewed)
 } catch {
 toast.error('Booking not found')
 router.push('/dashboard/traveler/bookings')
 } finally {
 setIsLoading(false)
 }
 }
 fetchData()
 }, [bookingId]) // eslint-disable-line react-hooks/exhaustive-deps

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
 <div className="pt-24 min-h-[60vh] surface-section flex items-center justify-center">
 <Loader2 className="w-8 h-8 animate-spin text-primary-light dark:text-primary-dark" />
 </div>
 )
 }

 if (!booking) return null

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
 ) && startDate.getTime() > Date.now()

 const { refundPercent: previewRefund, hoursUntilStart } = canCancel
 ? computeRefundPreview(booking.startTimeUtc)
 : { refundPercent: 0, hoursUntilStart: 0 }

  return (
  <div className="min-h-screen surface-base p-4 sm:p-8 pt-20 sm:pt-24">
 <div className="max-w-5xl mx-auto">
 {/* Back Button */}
  <Link
  href="/dashboard/traveler/bookings"
  className="flex items-center gap-1.5 text-sm text-theme-muted hover:text-primary-light dark:text-primary-dark transition-colors mb-8 group font-bold"
  >
 <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
 <span>Back to My Bookings</span>
 </Link>

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
 <div>
  <h1 className="text-3xl sm:text-4xl font-black text-theme-primary mb-2 tracking-tight leading-none">
 Booking Details
 </h1>
 <p className="text-sm text-theme-secondary ">
 Booking Reference:{' '}
 <button
 onClick={() => {
 const tip = `SH-${booking.id.toString().padStart(4, '0')}`;
 navigator.clipboard.writeText(tip);
 toast.success(`Reference ${tip} copied!`);
 }}
 className="font-mono font-bold hover:text-primary-light dark:text-primary-dark dark:hover:text-primary-dark transition-colors"
 title="Click to copy reference"
 >
 SH-{booking.id.toString().padStart(4, '0')}
 </button>
 </p>
 </div>
 <div className="flex items-center gap-2">
  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${statusStyle}`}>
 {displayStatus}
 </span>
 <button
 onClick={handleDownloadInvoice}
 className="p-2 surface-card border border-theme rounded-lg text-theme-muted hover:text-theme-secondary dark:hover:text-white transition-colors"
 >
 <Download className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Main Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Left Column: Details */}
 <div className="lg:col-span-2 space-y-8">
 
 {/* Tour Info Section */}
 <div className="surface-card rounded-3xl p-8 border border-theme shadow-xl relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
 <div className="flex flex-col md:flex-row gap-6">
 <div className="w-full md:w-32 h-32 surface-section rounded-2xl overflow-hidden flex-shrink-0">
 {booking.tourCoverImageUrl ? (
 <img src={booking.tourCoverImageUrl} alt={booking.tourTitle} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <MapPin className="w-8 h-8 text-gray-300" />
 </div>
 )}
 </div>
 <div className="flex-1 space-y-4">
 <h2 className="text-2xl font-bold text-theme-primary">{booking.tourTitle}</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex items-center gap-3 text-sm text-theme-secondary ">
 <Calendar className="w-4 h-4 text-primary-light dark:text-primary-dark" />
 <span className="font-medium">{formattedDate}</span>
 </div>
 <div className="flex items-center gap-3 text-sm text-theme-secondary ">
 <Clock className="w-4 h-4 text-primary-light dark:text-primary-dark" />
 <span className="font-medium">{formattedTime}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Meeting Point */}
 <div className="surface-card rounded-3xl p-8 border border-theme shadow-xl space-y-6">
 <h3 className="text-xl font-bold text-theme-primary flex items-center gap-2">
 <MapPin className="w-5 h-5 text-danger-red" />
 Meeting Point
 </h3>
 <div className="p-6 surface-section rounded-2xl border border-theme">
 <p className="font-bold text-theme-primary mb-2">{booking.meetingPointName || 'TBD'}</p>
 <p className="text-sm text-theme-secondary leading-relaxed">
 Please arrive 15 minutes early and show your QR code to the guide.
 </p>
 </div>
 </div>

 {/* Cancellation info banner */}
 {booking.cancellationReason && (
 <div className="bg-danger-red/10 dark:bg-red-950/20 border border-danger-red dark:border-danger-red rounded-2xl p-6">
 <div className="flex items-start gap-4">
 <XCircle className="w-6 h-6 text-danger-red mt-1" />
 <div>
 <h4 className="font-bold text-red-900 dark:text-red-400">
 {displayStatus === 'Rejected' ? 'Rejected by Guide' : 'Cancelled'}
 </h4>
 <p className="text-sm text-red-700 dark:text-red-300 mt-1">{booking.cancellationReason}</p>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Right Column: Summary & QR */}
 <div className="space-y-8">
 
 {/* QR Code Section */}
 {booking.qrCode && booking.status === BookingStatus.Confirmed && (
 <div className="surface-card rounded-3xl p-6 border border-theme shadow-xl text-center space-y-4">
 <h3 className="font-bold text-theme-primary uppercase tracking-widest text-xs">Your Ticket</h3>
 <div className="p-6 surface-card rounded-3xl inline-block mx-auto border-4 border-theme shadow-2xl">
 <QRCodeCanvas 
 value={booking.qrCode} 
 size={160}
 level="H"
 includeMargin={false}
 />
 </div>
 <div className="flex items-center justify-center gap-2">
 <p className="text-[10px] font-mono text-theme-muted break-all">{booking.qrCode}</p>
 <button 
 onClick={() => {
 navigator.clipboard.writeText(booking.qrCode!);
 toast.success('Ticket token copied!');
 }}
 className="p-1 hover:surface-section dark:hover:surface-card rounded text-primary-light dark:text-primary-dark transition-colors"
 title="Copy token for scanner"
 >
 <Smartphone className="w-3 h-3" />
 </button>
 </div>
 <p className="text-xs text-primary-light dark:text-primary-dark dark:text-primary-dark font-bold uppercase tracking-wider">Scanning required for check-in</p>
 </div>
 )}

 {/* Price Summary */}
 <div className="surface-card rounded-3xl p-6 border border-theme shadow-xl space-y-6">
 <h3 className="text-lg font-bold text-theme-primary text-center uppercase tracking-wider">Summary</h3>
 <div className="space-y-3">
 <div className="flex justify-between text-sm">
 <span className="text-theme-muted">Travelers</span>
 <span className="font-bold text-theme-primary">{booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}</span>
 </div>
 <div className="flex justify-between items-center pt-3 border-t border-theme">
 <span className="text-sm font-medium">Total Paid</span>
 <span className="text-2xl font-black text-primary-light dark:text-primary-dark">{booking.currency} {booking.finalPrice.toFixed(2)}</span>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="space-y-3 pt-4">
 <button onClick={handleDownloadInvoice} className="w-full py-4 surface-section text-theme-secondary font-bold rounded-2xl flex items-center justify-center gap-3 hover:surface-section transition-all">
 <Download className="w-5 h-5" />
 Receipt
 </button>
 <div className="grid grid-cols-2 gap-3">
 <button className="py-3 surface-card border border-theme text-theme-secondary font-bold rounded-xl flex items-center justify-center gap-2 hover:surface-section transition-all text-xs">
 <Phone className="w-4 h-4" />
 Call
 </button>
 <Link 
 href={`/dashboard/traveler/messages?tourId=${booking.tourId}&bookingId=${booking.id}`}
 className="py-3 surface-card border border-theme text-theme-secondary font-bold rounded-xl flex items-center justify-center gap-2 hover:surface-section transition-all text-xs"
 >
 <MessageSquare className="w-4 h-4" />
 Chat
 </Link>
 </div>
 
 {canCancel && (
 <button 
 onClick={() => setShowCancelModal(true)}
 className="w-full mt-4 py-3 text-danger-red font-bold hover:bg-danger-red/10 dark:hover:bg-red-950/20 rounded-xl transition-all text-sm"
 >
 Cancel Booking
 </button>
 )}

 {/* Write Review button — shown only for Completed and non-reviewed bookings */}
 {booking.status === BookingStatus.Completed && !isReviewed && (
 <Link
 href={`/bookings/${booking.id}/review`}
 className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-lg shadow-accent-light/20"
 >
 <Star className="w-4 h-4" />
 Write Review
 </Link>
 )}

 {booking.status === BookingStatus.Completed && isReviewed && (
 <div className="w-full mt-4 py-3 surface-section text-theme-muted font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm border border-theme cursor-default">
 <CheckCircle className="w-4 h-4" />
 Reviewed
 </div>
 )}

 {booking.status === BookingStatus.PendingPayment && (
 <button
 onClick={() => router.push(`/bookings/confirmation?id=${booking.id}`)}
 className="w-full mt-4 py-4 bg-indigo-600 dark:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
 >
 <CreditCard className="w-5 h-5" />
 Pay Now
 </button>
 )}

 {(booking.status === BookingStatus.Completed || booking.status === BookingStatus.InProgress) && (
 <Link
 href={`/dashboard/traveler/bookings/${booking.id}/dispute`}
 className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-lg shadow-red-500/20"
 >
 <Scale className="w-4 h-4" />
 Open Dispute
 </Link>
 )}

 {booking.status !== BookingStatus.Completed && 
 booking.status !== BookingStatus.Cancelled && 
 booking.status !== BookingStatus.Expired && 
 booking.status !== BookingStatus.PendingPayment &&
 new Date(booking.startTimeUtc).getTime() > Date.now() && (
 <Link
 href={`/tours/${booking.tourId}`}
 className="w-full mt-2 py-3 bg-indigo-600 dark:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all text-sm shadow-lg shadow-indigo-500/20"
 >
 <RefreshCw className="w-4 h-4" />
 Edit Booking
 </Link>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Cancellation Modal */}
 {showCancelModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 ">
 <div className="w-full max-w-md surface-card rounded-3xl shadow-2xl overflow-hidden">
 <div className="bg-red-600 px-6 py-4">
 <h3 className="text-lg font-bold text-white flex items-center gap-2">
 <AlertCircle className="w-5 h-5" />
 Cancel Booking
 </h3>
 </div>
 <div className="p-6 space-y-4">
 <p className="text-sm text-theme-secondary ">
 Cancel your booking for <span className="font-bold text-theme-primary">{booking.tourTitle}</span>?
 </p>
 <input
 type="text"
 value={cancelReason}
 onChange={(e) => setCancelReason(e.target.value)}
 placeholder="Reason (optional)"
 className="w-full px-4 py-3 surface-section border border-theme rounded-xl text-sm focus:ring-2 focus:ring-danger-red outline-none"
 />
 <div className="p-4 surface-section rounded-2xl space-y-2 text-sm border border-theme">
 <div className="flex justify-between">
 <span className="text-theme-muted">Refund Policy</span>
 <span className="font-bold text-accent-light dark:text-accent-dark">{previewRefund}% Refund</span>
 </div>
 <div className="flex justify-between pt-2 border-t border-theme font-bold">
 <span>You'll get</span>
 <span className="text-lg text-success-green">{booking.currency} {((booking.finalPrice * previewRefund) / 100).toFixed(2)}</span>
 </div>
 <p className="text-[10px] text-theme-muted italic mt-2">
 {hoursUntilStart > 0 ? formatHoursRemaining(hoursUntilStart) : 'Deadline passed'}
 </p>
 </div>
 <div className="flex gap-3 pt-4">
 <button
 onClick={() => setShowCancelModal(false)}
 disabled={isCancelling}
 className="flex-1 px-4 py-3 surface-section text-theme-secondary font-bold rounded-2xl hover:surface-section transition-all transition-all"
 >
 Go Back
 </button>
 <button
 onClick={handleCancelBooking}
 disabled={isCancelling}
 className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel'}
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 )
}
