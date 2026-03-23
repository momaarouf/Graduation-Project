'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { getTravelerBooking, cancelBooking } from '@/src/lib/api/tours'
import { BookingResponse, BookingStatus } from '@/src/lib/types/tour.types'
import {
    Calendar,
    Clock,
    MapPin,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    Ticket,
    Download,
    Star,
    MessageSquare,
    Phone,
    Mail,
    Shield,
    Info,
    ArrowRight,
    Zap
} from 'lucide-react'

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

function StatusBadge({ status }: { status: BookingStatus }) {
    const statusConfig = {
        [BookingStatus.Confirmed]: {
            bg: 'bg-emerald-100 dark:bg-emerald-950/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            icon: CheckCircle,
            label: 'Confirmed'
        },
        [BookingStatus.PendingGuide]: {
            bg: 'bg-amber-100 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-300',
            icon: Clock,
            label: 'Pending Guide Approval'
        },
        [BookingStatus.PendingPayment]: {
            bg: 'bg-indigo-100 dark:bg-indigo-950/30',
            text: 'text-indigo-700 dark:text-indigo-300',
            icon: Clock,
            label: 'Pending Payment'
        },
        [BookingStatus.Completed]: {
            bg: 'bg-blue-100 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-300',
            icon: CheckCircle,
            label: 'Completed'
        },
        [BookingStatus.Cancelled]: {
            bg: 'bg-red-100 dark:bg-red-950/30',
            text: 'text-red-700 dark:text-red-300',
            icon: XCircle,
            label: 'Cancelled'
        },
        [BookingStatus.Rejected]: {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-700 dark:text-gray-300',
            icon: XCircle,
            label: 'Rejected'
        },
        [BookingStatus.Expired]: {
            bg: 'bg-gray-100 dark:bg-gray-800',
            text: 'text-gray-500 dark:text-gray-400',
            icon: AlertCircle,
            label: 'Expired'
        }
    }

    const config = statusConfig[status] || statusConfig[BookingStatus.PendingGuide]
    const Icon = config.icon

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border border-current shadow-sm ${config.bg} ${config.text}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    )
}

// ============================================================================
// CANCELLATION MODAL
// ============================================================================

function CancellationModal({ 
    booking, 
    isOpen, 
    onClose, 
    onConfirm, 
    isLoading 
}: { 
    booking: BookingResponse, 
    isOpen: boolean, 
    onClose: () => void, 
    onConfirm: () => void,
    isLoading: boolean
}) {
    if (!isOpen) return null

    const now = new Date()
    const tourDate = new Date(booking.startTimeUtc)
    const hoursDiff = (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundPercent = 0
    if (hoursDiff > 48) refundPercent = 100
    else if (hoursDiff > 24) refundPercent = 50

    const refundAmount = (booking.finalPrice * refundPercent) / 100

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        Cancel Booking?
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Are you sure you want to cancel your booking for <span className="font-bold text-gray-900 dark:text-white">{booking.tourTitle}</span>?
                    </p>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Refund Policy</span>
                            <span className="font-bold text-amber-600">{refundPercent}% Refund</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Estimated Refund</span>
                            <span className="text-xl font-black text-emerald-600">{booking.currency} {refundAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800 flex gap-3">
                    <button 
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                    >
                        Keep Booking
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? 'Cancelling...' : 'Confirm Cancel'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [booking, setBooking] = useState<BookingResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    useEffect(() => {
        fetchBooking()
    }, [id])

    const fetchBooking = async () => {
        setIsLoading(true)
        try {
            const res = await getTravelerBooking(Number(id))
            setBooking(res.data)
        } catch (err: any) {
            console.error('Failed to fetch booking:', err)
            toast.error('Booking not found or access denied')
            router.push('/dashboard/traveler/bookings')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = async () => {
        setIsCancelling(true)
        try {
            await cancelBooking(Number(id))
            toast.success('Booking cancelled successfully')
            fetchBooking()
            setShowCancelModal(false)
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Cancellation failed')
        } finally {
            setIsCancelling(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-500 font-bold animate-pulse">Loading booking details...</p>
            </div>
        )
    }

    if (!booking) return null

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

    const canCancel = (booking.status === BookingStatus.Confirmed || booking.status === BookingStatus.PendingGuide) && startDate.getTime() > Date.now()

    return (
        <div className="min-h-screen pt-24 pb-20 bg-gray-50 dark:bg-gray-950">
            <div className="container-safe mx-auto max-w-4xl px-4">
                
                {/* Back button */}
                <Link 
                    href="/dashboard/traveler/bookings"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to My Bookings
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Header Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                            
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-4">
                                    <StatusBadge status={booking.status} />
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                        {booking.tourTitle}
                                    </h1>
                                    <div className="flex flex-wrap gap-6 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            <span className="font-bold">{formattedDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span className="font-bold">{formattedTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center flex-shrink-0 group">
                                    <Ticket className="w-10 h-10 text-blue-600 group-hover:rotate-12 transition-transform" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Meeting Point & Info */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-xl space-y-6"
                        >
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-red-500" />
                                Meeting Point
                            </h3>
                            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <p className="font-black text-gray-900 dark:text-white mb-2">{booking.meetingPointName || 'No meeting point specified'}</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {/* Real meeting instructions would go here */}
                                    Please arrive at least 15 minutes before the tour start time to meet your guide. 
                                    A digital copy of your ticket is required for check-in.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/30 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                        <Info className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-blue-500 tracking-widest">Requirements</p>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">ID Required</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/30 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-emerald-500 tracking-widest">Safety</p>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Verified Guide</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Summary */}
                    <div className="space-y-6">
                        
                        {/* Summary Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-xl overflow-hidden relative sticky top-24"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-center">
                                Booking Summary
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Booking ID</span>
                                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-bold text-gray-800 dark:text-gray-200">
                                        SH-{booking.id.toString().padStart(4, '0')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Travelers</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Total Price</span>
                                    <span className="text-2xl font-black text-blue-600">
                                        {booking.currency} {booking.finalPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {booking.status === BookingStatus.Confirmed && (
                                    <Link 
                                        href={`/dashboard/traveler/bookings/${id}/ticket`}
                                        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all group"
                                    >
                                        <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        Access Ticket
                                        <ArrowRight className="w-4 h-4 opacity-50" />
                                    </Link>
                                )}

                                <button className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95">
                                    <Download className="w-5 h-5" />
                                    Download Receipt
                                </button>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-xs">
                                        <Phone className="w-4 h-4" />
                                        Call
                                    </button>
                                    <button className="py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-xs">
                                        <MessageSquare className="w-4 h-4" />
                                        Chat
                                    </button>
                                </div>

                                {canCancel && (
                                    <button 
                                        onClick={() => setShowCancelModal(true)}
                                        className="w-full mt-4 py-3 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all text-sm"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Refund Policy footer info */}
            <div className="container-safe mx-auto max-w-4xl px-4 mt-8">
                <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 flex gap-4">
                    <Zap className="w-8 h-8 text-blue-500 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1 uppercase tracking-wider">Halal-Friendly Guarantee</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                            This tour is verified as halal-friendly. Prayer breaks are accommodated, and all food stops are certified halal. 
                            Our guides are trained to respect and support your religious requirements throughout the journey.
                        </p>
                    </div>
                </div>
            </div>

            <CancellationModal 
                booking={booking} 
                isOpen={showCancelModal} 
                onClose={() => setShowCancelModal(false)} 
                onConfirm={handleCancel}
                isLoading={isCancelling}
            />
        </div>
    )
}
