'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  CheckCircle2,
  XCircle as XIcon,
  RefreshCw,
  Zap,
  CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getGuideBooking, confirmBooking, rejectBooking } from '@/src/lib/api/tours'
import { notificationsApi } from '@/src/lib/api/notifications'
import { GuideBookingResponse, BookingStatus } from '@/src/lib/types/tour.types'
import GuideBookingDetailSkeleton from './skeleton'

export default function GuideBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [booking, setBooking] = useState<GuideBookingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchBooking()
    // PERSISTENT SYNC: Mark all notifications for this specific booking as read
    const syncBookingNotifs = async () => {
      try {
        await notificationsApi.markByReference('BOOKING_', id);
        // LOCAL SYNC: Update the bell and sidebar immediately
        window.dispatchEvent(new CustomEvent('notification-mark-read', { 
          detail: { type: 'BOOKING_', referenceId: id } 
        }));
      } catch (err) {
        console.error('Failed to mark booking notifications as read:', err);
      }
    };

    syncBookingNotifs();
  }, [id])

  const fetchBooking = async () => {
    setIsLoading(true)
    try {
      const response = await getGuideBooking(Number(id))
      setBooking(response)
    } catch (error: any) {
      toast.error('Failed to load booking details')
      router.push('/dashboard/guide/bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!booking) return
    if (!confirm('Approve this booking request?')) return

    setIsProcessing(true)
    try {
      await confirmBooking(booking.id)
      toast.success('Booking confirmed')
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm booking')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!booking) return
    if (!confirm('Reject this booking request? This will refund the traveler.')) return

    setIsProcessing(true)
    try {
      await rejectBooking(booking.id)
      toast.success('Booking rejected')
      fetchBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject booking')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <GuideBookingDetailSkeleton />
  }

  if (!booking) return null

  const isPending = booking.status === BookingStatus.PendingGuide

  const statusColors = {
    [BookingStatus.Confirmed]: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    [BookingStatus.PendingGuide]: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    [BookingStatus.Cancelled]: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    [BookingStatus.Completed]: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    [BookingStatus.InProgress]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400',
    [BookingStatus.Rejected]: 'bg-danger-red/20 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    [BookingStatus.PendingPayment]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400',
    [BookingStatus.Waitlisted]: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
    [BookingStatus.Expired]: 'surface-section text-theme-muted ',
  }

  const startDate = new Date(booking.startTimeUtc)
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className="min-h-screen surface-base">
      <div className="max-w-5xl mx-auto px-4 py-6 pt-16 sm:pt-24">
        {/* Payment Warning Banner */}
        {booking.status === BookingStatus.PendingPayment && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-indigo-900 dark:text-indigo-100 capitalize tracking-normal leading-none mb-1">
                Awaiting Traveler Payment
              </p>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium leading-normal">
                The traveler has reserved this spot but has not completed payment yet. Do not provide service until the status changes to &quot;Confirmed&quot;.
              </p>
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/guide/bookings')}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-theme-muted hover:text-primary-light transition-colors font-bold group mb-6"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Bookings
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="w-full">
            <h1 className="text-2xl sm:text-4xl font-bold text-theme-primary mb-2 tracking-tight leading-tight">
              Booking Details
            </h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[9px] font-bold capitalize tracking-normal border shadow-sm ${statusColors[booking.status]}`}>
                {booking.status.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-xs font-mono font-bold text-theme-muted">
                #{booking.id.toString().padStart(6, '0')}
              </span>
            </div>
          </div>

          {isPending && (
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 md:flex-none px-4 py-2.5 surface-card border border-danger-red/30 text-danger-red font-bold rounded-xl text-sm active:scale-95 transition-all disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-10">
            {/* Tour Card */}
            <div className="surface-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl border border-theme relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
              
              <h3 className="text-[10px] font-bold text-theme-muted capitalize tracking-[0.2em] mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-light" />
                Tour Information
              </h3>
              <div className="space-y-4">
                <h2 className="text-xl sm:text-3xl font-bold text-theme-primary leading-tight">
                  {booking.tourTitle}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-theme-muted capitalize tracking-normal">Date & Time</p>
                    <div className="flex items-center gap-2 text-theme-primary font-bold text-sm sm:text-base">
                      <Clock className="w-4 h-4 text-primary-light" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-theme-muted capitalize tracking-normal">Party Size</p>
                    <div className="flex items-center gap-2 text-theme-primary font-bold text-sm sm:text-base">
                      <Users className="w-4 h-4 text-primary-light" />
                      <span>{booking.peopleCount} Participants</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-theme-muted capitalize tracking-normal">Duration</p>
                    <div className="flex items-center gap-2 text-theme-primary font-bold text-sm sm:text-base">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>
                        {booking.durationHours || 0}h {booking.durationMinutes || 0}m
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-theme-muted capitalize tracking-normal">Booking Mode</p>
                    <div className="flex items-center gap-2 text-theme-primary font-bold text-sm sm:text-base">
                      <Zap className="w-4 h-4 text-accent-light" />
                      <span className="capitalize">{booking.bookingMode.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Traveler Info */}
            <div className="surface-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl border border-theme">
              <h3 className="text-[10px] font-bold text-theme-muted capitalize tracking-[0.2em] mb-6 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                Traveler Information
              </h3>

              {booking.traveler ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 surface-section rounded-2xl border border-theme">
                    <div className="w-12 h-12 bg-primary-light/10 text-primary-light rounded-xl flex items-center justify-center font-bold text-xl">
                      {booking.traveler.fullName?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-theme-primary mb-0.5">{booking.traveler.fullName}</p>
                      <p className="text-[10px] font-bold text-theme-muted capitalize tracking-normal">
                        Joined {new Date(booking.createdAtUtc).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a href={`mailto:${booking.traveler.email}`} className="flex items-center gap-3 p-4 rounded-2xl surface-card border border-theme hover:border-primary-light transition-all">
                      <div className="w-8 h-8 rounded-lg surface-section flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-theme-muted" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-theme-muted capitalize tracking-normal leading-none mb-1">Email Address</p>
                        <p className="text-xs font-bold text-theme-primary truncate">{booking.traveler.email}</p>
                      </div>
                    </a>
                    <a href={`tel:${booking.traveler.phoneE164}`} className="flex items-center gap-3 p-4 rounded-2xl surface-card border border-theme hover:border-success-green transition-all">
                      <div className="w-8 h-8 rounded-lg surface-section flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-theme-muted" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-theme-muted capitalize tracking-normal leading-none mb-1">Phone Number</p>
                        <p className="text-xs font-bold text-theme-primary truncate">{booking.traveler.phoneE164}</p>
                      </div>
                    </a>
                  </div>

                  <Link
                    href={`/dashboard/guide/messages?tourId=${booking.tourId}&bookingId=${booking.id}`}
                    className="w-full py-3.5 bg-primary-light text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-primary-light/10 active:scale-95 transition-all text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Traveler
                  </Link>
                </div>
              ) : (
                <div className="py-10 text-center surface-section rounded-2xl border border-dashed border-theme">
                  <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-[10px] text-theme-muted font-bold capitalize tracking-normal mb-1">
                    Identity Protected
                  </p>
                  <p className="text-[11px] text-theme-muted font-medium px-4">
                    Traveler contact information is hidden for {booking.status.toLowerCase()} bookings.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Payment Card */}
            <div className="surface-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-theme overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light/5 rounded-full blur-2xl -mr-12 -mt-12" />
              
              <h3 className="text-sm font-bold text-theme-primary mb-6 text-center capitalize tracking-normal">Financial Hub</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center surface-section p-4 rounded-xl border border-theme">
                  <span className={`text-[10px] font-bold capitalize tracking-normal ${
                    booking.status === BookingStatus.PendingPayment ? 'text-indigo-600' : 'text-theme-muted'
                  }`}>
                    {booking.status === BookingStatus.PendingPayment ? 'Awaiting Payment' : 'Total Paid'}
                  </span>
                  <span className={`text-sm font-bold ${
                    booking.status === BookingStatus.PendingPayment ? 'text-indigo-600' : 'text-theme-primary'
                  }`}>
                    {booking.currency} {booking.finalPrice.toFixed(2)}
                  </span>
                </div>
                
                <div className="p-6 bg-primary-light rounded-2xl text-white shadow-lg shadow-primary-light/20 relative overflow-hidden">
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                  <p className="text-[10px] font-bold capitalize tracking-[0.1em] mb-1 opacity-80">Estimated Profit</p>
                  <p className="text-2xl font-bold mb-1">
                    {booking.currency} {(booking.finalPrice * 0.9).toFixed(2)}
                  </p>
                  <p className="text-[9px] font-medium opacity-60">* After 10% platform fee</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-accent-light/5 rounded-2xl border border-accent-light/20">
              <h4 className="flex items-center gap-2 text-[10px] font-bold text-accent-light mb-3 capitalize tracking-normal">
                <AlertCircle className="w-3.5 h-3.5" />
                Guidelines
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/60 leading-relaxed font-medium">
                Confirm your arrival 15 minutes before launch. Ensure travelers sign the waiver upon check-in if not already verified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
