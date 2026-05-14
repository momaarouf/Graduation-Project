'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { getTravelerBooking } from '@/src/lib/api/tours'
import { BookingResponse, BookingStatus } from '@/src/lib/types/tour.types'
import {
 ChevronLeft,
 Ticket,
 Download,
 Printer,
 MapPin,
 Calendar,
 Clock,
 User,
 ShieldCheck,
 Info,
 CheckCircle,
 Smartphone
} from 'lucide-react'
import TravelerTicketSkeleton from './skeleton'

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = use(params)
 const router = useRouter()
 const [booking, setBooking] = useState<BookingResponse | null>(null)
 const [isLoading, setIsLoading] = useState(true)

 useEffect(() => {
 fetchBooking()
 }, [id])

 const fetchBooking = async () => {
 setIsLoading(true)
 try {
 const res = await getTravelerBooking(Number(id))
 if (res.status !== BookingStatus.Confirmed && res.status !== BookingStatus.Completed) {
 toast.error('Ticket only available for confirmed bookings')
 router.push(`/dashboard/traveler/bookings/${id}`)
 return
 }
 setBooking(res)
 } catch (err: any) {
 console.error('Failed to fetch booking:', err)
 toast.error('Booking not found')
 router.push('/dashboard/traveler/bookings')
 } finally {
 setIsLoading(false)
 }
 }

  if (isLoading) {
    return <TravelerTicketSkeleton />
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

  return (
  <div className="min-h-screen pt-24 pb-20 surface-base">
 <div className="container-safe mx-auto max-w-2xl px-4">
 
 {/* Back button */}
 <div className="flex items-center justify-between mb-8 print:hidden">
 <Link 
 href={`/dashboard/traveler/bookings/${id}`}
 className="inline-flex items-center gap-2 text-theme-muted hover:text-primary-light dark:text-primary-dark font-bold transition-colors group"
 >
 <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
 Back to Details
 </Link>
 <div className="flex gap-2">
 <button 
 onClick={() => window.print()}
 className="p-3 surface-card border border-theme rounded-xl hover:surface-section transition-all shadow-sm"
 >
 <Printer className="w-5 h-5 text-theme-secondary " />
 </button>
 <button className="p-3 surface-card border border-theme rounded-xl hover:surface-section transition-all shadow-sm">
 <Download className="w-5 h-5 text-theme-secondary " />
 </button>
 </div>
 </div>

 {/* TICKET CONTAINER */}
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="surface-card rounded-[2.5rem] shadow-2xl overflow-hidden border border-theme relative"
 >
  {/* Top Notch - Ticket Aesthetic */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 surface-base rounded-b-3xl border-x border-b border-theme" />

 {/* Ticket Header */}
 <div className="p-8 pb-12 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
 {/* Background Decoration */}
 <div className="absolute -top-12 -left-12 w-48 h-48 surface-card rounded-full blur-3xl" />
 <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-900/40 rounded-full blur-3xl" />
 
 <div className="relative z-10">
 <div className="inline-flex items-center gap-2 px-3 py-1 surface-card  rounded-full text-[10px] font-bold capitalize tracking-normal mb-6 border border-theme">
 Official Digital Ticket
 </div>
 <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
 {booking.tourTitle}
 </h1>
 <div className="flex items-center justify-center gap-4 text-sm font-bold opacity-90">
 <span>{formattedDate}</span>
 <span className="w-1 h-1 surface-card rounded-full" />
 <span>{formattedTime}</span>
 </div>
 </div>
 </div>

 {/* Ticket Divider Line (The"Cut" look) */}
 <div className="relative h-4 flex items-center px-4">
  <div className="absolute -left-6 w-12 h-12 surface-base rounded-full border border-theme shadow-inner" />
  <div className="absolute -right-6 w-12 h-12 surface-base rounded-full border border-theme shadow-inner" />
 <div className="w-full border-t-4 border-dashed border-theme" />
 </div>

 {/* Ticket Body */}
 <div className="p-8 pt-6">
 
 {/* QR Code Section */}
 <div className="flex flex-col items-center justify-center mb-10">
 <div className="p-6 surface-card rounded-[2rem] shadow-xl border border-theme group transition-all hover:scale-105 mb-4">
 <QRCodeSVG 
 value={booking.qrCode || `booking-${booking.id}`} 
 size={180}
 level="H"
 includeMargin={false}
 className="dark:p-2 dark:rounded-xl"
 />
 </div>
 <p className="text-[10px] capitalize font-bold text-theme-muted tracking-[0.3em] mb-1">Check-in QR Code</p>
 <button
 onClick={() => {
 navigator.clipboard.writeText(booking.qrCode ||"");
 toast.success('Ticket code copied for guide!', {
 icon: '🎫',
 style: { borderRadius: '12px', background: '#333', color: '#fff' }
 });
 }}
 className="group flex items-center gap-2 text-primary-light dark:text-primary-dark dark:text-primary-dark hover:text-blue-700 transition-all active:scale-95"
 title="Copy code for guide"
 >
 <p className="text-lg font-mono font-bold tracking-tight">
 SH-{booking.id.toString().padStart(6, '0')}
 </p>
 <Smartphone className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
 </button>
 </div>

 {/* Details Grid */}
 <div className="grid grid-cols-2 gap-8 mb-10">
 <div className="space-y-1">
 <p className="text-[10px] capitalize font-bold text-theme-muted tracking-normal">Ticket Holder</p>
 <p className="font-bold text-theme-primary flex items-center gap-2">
 <User className="w-4 h-4 text-primary-light dark:text-primary-dark" />
 Me (Traveler)
 </p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] capitalize font-bold text-theme-muted tracking-normal">Pax Count</p>
 <p className="font-bold text-theme-primary">
 {booking.peopleCount} {booking.peopleCount === 1 ? 'Person' : 'People'}
 </p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] capitalize font-bold text-theme-muted tracking-normal">Status</p>
 <p className="font-bold text-success-green flex items-center gap-2">
 <CheckCircle className="w-4 h-4" />
 Verified
 </p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] capitalize font-bold text-theme-muted tracking-normal">Meeting Point</p>
 <p className="font-bold text-theme-primary truncate">
 {booking.meetingPointName || 'Sultanahmet Square'}
 </p>
 </div>
 </div>

 {/* Instructions */}
 <div className="p-6 surface-section rounded-3xl border border-theme">
 <h4 className="flex items-center gap-2 text-xs font-bold text-theme-primary mb-3 capitalize tracking-normal">
 <Info className="w-4 h-4 text-primary-light dark:text-primary-dark" />
 Instructions
 </h4>
 <ul className="text-xs text-theme-secondary space-y-2 font-medium">
 <li className="flex gap-2">
 <span className="text-primary-light dark:text-primary-dark font-bold">•</span>
 Present this QR code to your guide at the meeting point.
 </li>
 <li className="flex gap-2">
 <span className="text-primary-light dark:text-primary-dark font-bold">•</span>
 Arrive 15 minutes before the tour starts.
 </li>
 <li className="flex gap-2">
 <span className="text-primary-light dark:text-primary-dark font-bold">•</span>
 Bringing a physical ID is recommended for museum entry.
 </li>
 </ul>
 </div>
 </div>

 {/* Ticket Footer */}
 <div className="p-6 surface-section border-t border-theme text-center">
 <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-theme-muted capitalize tracking-[0.2em]">
 <ShieldCheck className="w-4 h-4 text-success-green" />
 Halal-Friendly Verified
 </div>
 </div>
 </motion.div>

 {/* Print Footer */}
 <p className="mt-8 text-center text-xs text-theme-muted font-medium print:hidden">
 Need help? Contact support via the help section in your dashboard.
 <br />© 2026 SafariHub Travel & Tourism.
 </p>
 </div>
 
 <style jsx global>{`
 @media print {
 nav, .print-hidden, footer {
 display: none !important;
 }
 body {
 background: white !important;
 padding: 0 !important;
 }
 .container-safe {
 max-width: 100% !important;
 margin: 0 !important;
 }
 }
 `}</style>
 </div>
 )
}
