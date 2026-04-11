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
      setBooking(response.data)
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-bold animate-pulse">Loading booking details...</p>
      </div>
    )
  }

  if (!booking) return null

  const isPending = booking.status === BookingStatus.PendingGuide
  
  const statusColors = {
    [BookingStatus.Confirmed]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    [BookingStatus.PendingGuide]: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    [BookingStatus.Cancelled]: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    [BookingStatus.Completed]: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    [BookingStatus.InProgress]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400',
    [BookingStatus.Rejected]: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    [BookingStatus.PendingPayment]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400',
    [BookingStatus.Waitlisted]: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
    [BookingStatus.Expired]: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
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
    <div className="max-w-5xl mx-auto px-4 py-8 pt-20 sm:pt-24">
      {/* Payment Warning Banner */}
      {booking.status === BookingStatus.PendingPayment && (
        <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-widest leading-none mb-1">
              Awaiting Traveler Payment
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
              The traveler has reserved this spot but has not completed payment yet. Do not provide service until the status changes to &quot;Confirmed&quot;.
            </p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/guide/bookings')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-8 transition-colors font-bold group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Bookings
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight leading-tight">
            Booking Details
          </h1>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-current shadow-sm ${statusColors[booking.status]}`}>
              {booking.status.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-sm text-gray-400 font-mono font-bold tracking-tight">
                SH-{booking.id.toString().padStart(6, '0')}
            </span>
          </div>
        </div>

        {isPending && (
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-gray-950 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <XIcon className="w-4 h-4 mr-2 inline" />
              Reject
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 md:flex-none px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-2 inline" />
              Approve
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-10">
          {/* Tour Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 sm:p-10 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Tour Information
            </h3>
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                {booking.tourTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</p>
                   <div className="flex items-center gap-2 text-gray-900 dark:text-gray-300 font-bold">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{formattedDate}</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Party Size</p>
                   <div className="flex items-center gap-2 text-gray-900 dark:text-gray-300 font-bold">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>{booking.peopleCount} Participants</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
                   <div className="flex items-center gap-2 text-gray-900 dark:text-gray-300 font-bold">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>
                        {booking.durationHours || 0}h {booking.durationMinutes || 0}m
                      </span>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking Mode</p>
                   <div className="flex items-center gap-2 text-gray-900 dark:text-gray-300 font-bold">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="capitalize">{booking.bookingMode.replace('_', ' ')}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Traveler Info */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 sm:p-10 shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              Traveler Information
            </h3>

            {booking.traveler ? (
              <div className="space-y-8">
                <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 dark:text-white mb-1">{booking.traveler.fullName}</p>
                    <p className="text-xs font-bold text-gray-500 bg-white dark:bg-gray-900 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-800 inline-block uppercase tracking-wider">
                        Joined {new Date(booking.createdAtUtc).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a href={`mailto:${booking.traveler.email}`} className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 hover:border-blue-500 group transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
                        <Mail className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-200 truncate">{booking.traveler.email}</p>
                    </div>
                  </a>
                  <a href={`tel:${booking.traveler.phoneE164}`} className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 hover:border-emerald-500 group transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30">
                        <Phone className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-200 truncate">{booking.traveler.phoneE164}</p>
                    </div>
                  </a>
                </div>

                <Link
                  href={`/dashboard/guide/messages?tourId=${booking.tourId}&bookingId=${booking.id}`}
                  className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all group"
                >
                  <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Message Traveler
                </Link>
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                  Identity Protected
                </p>
                <p className="text-xs text-gray-400 font-medium">
                    Traveler contact information is hidden for {booking.status.toLowerCase()} bookings.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Payment Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8 text-center uppercase tracking-wider">Financial Hub</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className={`text-xs font-black uppercase tracking-wider tabular-nums ${
                  booking.status === BookingStatus.PendingPayment ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'
                }`}>
                  {booking.status === BookingStatus.PendingPayment ? 'Awaiting Payment' : 'Total Paid'}
                </span>
                <span className={`font-black ${
                  booking.status === BookingStatus.PendingPayment ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {booking.currency} {booking.finalPrice.toFixed(2)}
                </span>
              </div>
              
              <div className="p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                 <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Estimated Profit</p>
                 <p className="text-3xl font-black mb-1">
                    {booking.currency} {(booking.finalPrice * 0.9).toFixed(2)}
                 </p>
                 <p className="text-[9px] font-bold opacity-60">* After 10% platform fee</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100/50 dark:border-amber-900/20">
            <h4 className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-500 mb-4 uppercase tracking-[0.2em]">
              <AlertCircle className="w-4 h-4" />
              Guidelines
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-400/80 leading-relaxed font-bold">
              Confirm your arrival at the meeting point 15 minutes before launch. Ensure travelers sign the digital waiver upon check-in if not already verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}