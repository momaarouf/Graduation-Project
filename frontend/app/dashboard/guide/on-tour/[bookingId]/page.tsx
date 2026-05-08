// ============================================================================
// GUIDE ON-TOUR BOOKING DETAIL — WIRED TO REAL BACKEND
// ============================================================================
// LOCATION: /frontend/app/dashboard/guide/on-tour/[bookingId]/page.tsx
//
// PURPOSE: View detailed booking info during active tour — check in a single
// traveler, see contact details, and view booking metadata.
//
// DATA SOURCE: getGuideBooking(id) → GuideBookingResponse
// MUTATIONS: checkInBooking(id) → CONFIRMED → IN_PROGRESS
//
// No-show: disabled (future dispute card)
// Emergency contact / special requests: not in GuideBookingResponse yet
// (these can be added when the traveler profile card exposes them)
// ============================================================================

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
 ArrowLeft,
 User,
 Mail,
 Phone,
 Calendar,
 Clock,
 Users,
 MessageSquare,
 CheckCircle,
 XCircle,
 AlertCircle,
 QrCode,
 Info,
 Flag,
 MoreVertical,
 Loader2
} from 'lucide-react'

import { getGuideBooking, checkInBooking } from '@/src/lib/api/tours'
import { BookingStatus, GuideBookingResponse } from '@/src/lib/types/tour.types'

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
 status: string
}

// Maps backend BookingStatus to a visual badge.
// Uses the exact status string from the API — no local enum remapping needed.
function StatusBadge({ status }: StatusBadgeProps) {
 const config: Record<string, { bg: string; text: string; border: string; icon: typeof CheckCircle; label: string }> = {
 [BookingStatus.Confirmed]: {
 bg: 'bg-primary-light/20 dark:bg-primary-dark/20 ',
 text: 'text-blue-700 dark:text-blue-300',
 border: 'border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark',
 icon: CheckCircle,
 label: 'Confirmed'
 },
 [BookingStatus.PendingGuide]: {
 bg: 'bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-950/30',
 text: 'text-accent-light dark:text-accent-dark dark:text-amber-300',
 border: 'border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark',
 icon: Clock,
 label: 'Pending'
 },
 [BookingStatus.InProgress]: {
 bg: 'bg-success-green/20 dark:bg-emerald-950/30',
 text: 'text-emerald-700 dark:text-emerald-300',
 border: 'border-success-green dark:border-success-green',
 icon: CheckCircle,
 label: 'Checked In'
 },
 [BookingStatus.Completed]: {
 bg: 'bg-purple-100 dark:bg-purple-950/30',
 text: 'text-purple-700 dark:text-purple-300',
 border: 'border-purple-200 dark:border-purple-800',
 icon: CheckCircle,
 label: 'Completed'
 },
 [BookingStatus.Cancelled]: {
 bg: 'surface-section',
 text: 'text-theme-secondary',
 border: 'border-theme',
 icon: XCircle,
 label: 'Cancelled'
 }
 }

 // Fallback for unknown statuses (e.g. PendingPayment, Expired)
 const fallback = {
 bg: 'surface-section',
 text: 'text-theme-secondary',
 border: 'border-theme',
 icon: Clock,
 label: status
 }

 const { bg, text, border, icon: Icon, label } = config[status] || fallback

 return (
 <span className={`
 inline-flex items-center gap-1
 px-3 py-1
 ${bg}
 ${border}
 border
 rounded-full
 ${text}
 text-sm font-medium
 `}>
 <Icon className="w-4 h-4" />
 {label}
 </span>
 )
}

// ============================================================================
// MAIN BOOKING DETAILS PAGE
// ============================================================================

interface BookingDetailsPageProps {
 params: Promise<{
 bookingId: string
 }>
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
 const unwrappedParams = use(params)
 const bookingId = unwrappedParams.bookingId

 const router = useRouter()
 const [booking, setBooking] = useState<GuideBookingResponse | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [isProcessing, setIsProcessing] = useState(false)

 // ── Load booking from backend on mount ──────────────────────────────────
 // If the booking doesn't belong to this guide, backend returns 404
 // and we redirect back to the on-tour list.

 const fetchBooking = async () => {
 setIsLoading(true)
 try {
 const res = await getGuideBooking(Number(bookingId))
 setBooking(res)
 } catch {
 toast.error('Booking not found or access denied')
 router.push('/dashboard/guide/on-tour')
 } finally {
 setIsLoading(false)
 }
 }

 useEffect(() => {
 fetchBooking()
 }, [bookingId]) // eslint-disable-line react-hooks/exhaustive-deps

 // ── Check in this traveler ──────────────────────────────────────────────
 // Only works when booking status is 'Confirmed'.
 // Backend transitions: CONFIRMED → IN_PROGRESS and sets checkedInAtUtc.

 const handleCheckIn = async () => {
 if (!booking) return
 setIsProcessing(true)
 try {
 await checkInBooking(booking.id)
 toast.success('Traveler checked in!')
 fetchBooking() // Refresh to show InProgress status and checkedInAtUtc
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Check-in failed')
 } finally {
 setIsProcessing(false)
 }
 }

 // ── Loading state ──────────────────────────────────────────────────────

 if (isLoading) {
 return (
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)] flex items-center justify-center">
 <Loader2 className="w-8 h-8 animate-spin text-primary-light dark:text-primary-dark" />
 </div>
 )
 }

 // ── Not found state ────────────────────────────────────────────────────

 if (!booking) {
 return (
 <>
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)] flex items-center justify-center">
 <div className="text-center">
 <AlertCircle className="w-12 h-12 mx-auto mb-4 text-danger-red" />
 <h1 className="text-2xl font-bold text-theme-primary mb-2">
 Booking Not Found
 </h1>
 <p className="text-theme-secondary mb-6">
 The booking you&apos;re looking for doesn&apos;t exist.
 </p>
 <button
 onClick={() => router.back()}
 className="
 px-6 py-3
 bg-primary-light hover:bg-primary-light-hover
 text-white font-medium
 rounded-lg
 transition-colors
 inline-flex items-center gap-2
"
 >
 <ArrowLeft className="w-4 h-4" />
 Go Back
 </button>
 </div>
 </div>
 </>
 )
 }

 // Format dates for display
 const startDate = new Date(booking.startTimeUtc)
 const bookingDate = new Date(booking.createdAtUtc)

 return (
 <>
 {/* Page offset */}
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">

 <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">

 {/* Back button */}
 <button
 onClick={() => router.back()}
 className="
 flex items-center gap-2
 text-theme-secondary hover:text-theme-primary dark:hover:text-white
 mb-6
 transition-colors
"
 >
 <ArrowLeft className="w-4 h-4" />
 Back to On-Tour Toolkit
 </button>

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">
 Booking Details
 </h1>
 <StatusBadge status={booking.status} />
 </div>
 <p className="text-sm text-theme-muted ">
 Booking #{booking.id} • {booking.tourTitle}
 </p>
 </div>

 <div className="flex gap-2">
 <button className="
 p-2
 surface-section
 text-theme-secondary
 rounded-lg
 hover:surface-section dark:hover:surface-section
 transition-colors
">
 <MoreVertical className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Main Content Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Left Column - Traveler Info */}
 <div className="lg:col-span-2 space-y-6">
 {/* Traveler Profile Card */}
 <div className="
 surface-card
 border border-theme
 rounded-xl
 p-6
">
 <div className="flex items-start gap-4">
 {/* Avatar placeholder */}
 <div className="relative">
 <div className="
 w-16 h-16
 rounded-full
 surface-section
 overflow-hidden
 flex items-center justify-center
">
 <User className="w-8 h-8 text-theme-muted" />
 </div>
 {/* Green dot if checked in */}
 {(booking.status === BookingStatus.InProgress || booking.status === BookingStatus.Completed) && (
 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-green rounded-full border-2 border-theme " />
 )}
 </div>

 {/* Info */}
 <div className="flex-1">
 <h2 className="text-xl font-bold text-theme-primary mb-1">
 {booking.traveler?.fullName || 'Unknown Traveler'}
 </h2>
 <div className="flex flex-wrap items-center gap-3 text-sm text-theme-muted mb-3">
 {booking.traveler?.email && (
 <span className="flex items-center gap-1">
 <Mail className="w-4 h-4" />
 {booking.traveler.email}
 </span>
 )}
 {booking.traveler?.phoneE164 && (
 <span className="flex items-center gap-1">
 <Phone className="w-4 h-4" />
 {booking.traveler.phoneE164}
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Action buttons — only show check-in when booking is Confirmed */}
 {booking.status === BookingStatus.Confirmed && (
 <div className="flex gap-3 mt-6 pt-4 border-t border-theme">
 <button
 onClick={handleCheckIn}
 disabled={isProcessing}
 className="
 flex-1
 px-4 py-2
 bg-emerald-600 hover:bg-emerald-700
 text-white font-medium
 rounded-lg
 transition-colors
 flex items-center justify-center gap-2
 disabled:opacity-50
"
 >
 {isProcessing ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <CheckCircle className="w-4 h-4" />
 )}
 Check In
 </button>
 {/* No-show — disabled (future dispute/no-show card) */}
 <button
 disabled
 title="No-show reporting coming soon"
 className="
 flex-1
 px-4 py-2
 bg-red-600/50
 text-white/50 font-medium
 rounded-lg
 cursor-not-allowed
 flex items-center justify-center gap-2
"
 >
 <XCircle className="w-4 h-4" />
 No Show
 </button>
 <button
 onClick={() => {
 if (booking.traveler?.email) {
 window.location.href = `mailto:${booking.traveler.email}`
 }
 }}
 className="
 px-4 py-2
 bg-primary-light hover:bg-primary-light-hover
 text-white font-medium
 rounded-lg
 transition-colors
 flex items-center justify-center gap-2
"
 >
 <MessageSquare className="w-4 h-4" />
 Message
 </button>
 </div>
 )}

 {/* Check-in and completion timestamps — proves the new fields are rendered */}
 {(booking.checkedInAtUtc || booking.completedAtUtc) && (
 <div className="mt-4 pt-4 border-t border-theme space-y-2">
 {booking.checkedInAtUtc && (
 <div className="flex items-center gap-2 text-sm text-success-green dark:text-emerald-400">
 <CheckCircle className="w-4 h-4" />
 <span>Checked in at {new Date(booking.checkedInAtUtc).toLocaleTimeString()}</span>
 </div>
 )}
 {booking.completedAtUtc && (
 <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
 <CheckCircle className="w-4 h-4" />
 <span>Completed at {new Date(booking.completedAtUtc).toLocaleTimeString()}</span>
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 {/* Right Column - Booking Details */}
 <div className="space-y-6">
 {/* Tour Info */}
 <div className="
 surface-card
 border border-theme
 rounded-xl
 p-6
">
 <h3 className="font-semibold text-theme-primary mb-4 flex items-center gap-2">
 <Info className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 Tour Information
 </h3>

 <div className="space-y-3">
 <div className="flex items-start gap-2">
 <Calendar className="w-4 h-4 text-theme-muted mt-0.5" />
 <div>
 <p className="text-sm text-theme-primary">
 {startDate.toLocaleDateString('en-US', {
 weekday: 'long',
 month: 'long',
 day: 'numeric'
 })}
 </p>
 <p className="text-xs text-theme-muted ">
 {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 {booking.endTimeUtc && ` - ${new Date(booking.endTimeUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-theme-muted" />
 <span className="text-sm text-theme-primary">
 {booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}
 </span>
 </div>

 <div className="flex items-center gap-2">
 <Clock className="w-4 h-4 text-theme-muted" />
 <span className="text-sm text-theme-primary">
 Booked: {bookingDate.toLocaleDateString()}
 </span>
 </div>

 {/* Pricing info for the guide */}
 <div className="pt-3 border-t border-theme">
 <div className="flex items-center justify-between">
 <span className="text-sm text-theme-muted ">Total</span>
 <span className="text-sm font-semibold text-theme-primary">
 {booking.currency} {booking.finalPrice.toFixed(2)}
 </span>
 </div>
 <div className="flex items-center justify-between mt-1">
 <span className="text-xs text-theme-muted">Mode</span>
 <span className="text-xs text-theme-muted ">
 {booking.bookingMode === 'Instant' ? 'Instant Book' : 'Request to Book'}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Quick Actions */}
 <div className="
 surface-card
 border border-theme
 rounded-xl
 p-6
">
 <h3 className="font-semibold text-theme-primary mb-3">
 Quick Actions
 </h3>
 <div className="space-y-2">
 <button
 onClick={() => {
 if (booking.traveler?.email) {
 window.location.href = `mailto:${booking.traveler.email}`
 }
 }}
 className="
 w-full
 px-4 py-2
 bg-primary-light hover:bg-primary-light-hover
 text-white
 rounded-lg
 transition-colors
 flex items-center justify-center gap-2
"
 >
 <MessageSquare className="w-4 h-4" />
 Send Message
 </button>
 <button
 disabled
 title="Issue reporting coming soon"
 className="
 w-full
 px-4 py-2
 surface-section
 text-theme-muted rounded-lg
 cursor-not-allowed
 flex items-center justify-center gap-2
"
 >
 <Flag className="w-4 h-4" />
 Report Issue
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </>
 )
}
