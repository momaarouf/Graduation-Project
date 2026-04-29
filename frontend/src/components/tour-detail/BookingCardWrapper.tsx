'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState } from 'react'
import BookingCard from './BookingCard'
import { BookingMode } from '@/src/types/tour-detail.types'
import { createBooking, joinWaitlist, updateBooking, getPublicTourDetail, cancelBooking } from '@/src/lib/api/tours'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { useEffect, useMemo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Portal from '@/src/components/ui/Portal'
import { BookingStatus, PublicActiveBookingResponse, PublicActiveWaitlistResponse } from '@/src/lib/types/tour.types'
import { leaveWaitlist } from '@/src/lib/api/tours'
import { chatApi } from '@/src/lib/api/chat'

interface BookingCardWrapperProps {
 tourId: string
 tourTitle: string
 guideId: string
 guideName: string
 basePrice: number
 currency: string
 minCapacity: number
 maxCapacity: number
 bookingMode: BookingMode
 occurrences: any[]
 waitlistCount: number
 isWaitlistAvailable: boolean
 cancellationPolicy?: any
 hasGroupDiscount?: boolean
 groupDiscountThreshold?: number
 groupDiscountPercent?: number
 dynamicPricing?: any
 activeBookingId?: number
 activeBookingStatus?: string
 activeBookingOccurrenceId?: number
 activeBookingPeopleCount?: number
 activeBookingFinalPrice?: number
 activeBookingCurrency?: string
 activeBookingStartTime?: string
 activeWaitlistEntries?: PublicActiveWaitlistResponse[]
}

export default function BookingCardWrapper({
 tourId,
 basePrice,
 currency,
 minCapacity,
 maxCapacity,
 bookingMode,
 tourTitle,
 guideId,
 guideName,
 occurrences,
 waitlistCount,
 isWaitlistAvailable,
 cancellationPolicy,
 hasGroupDiscount,
 groupDiscountThreshold,
 groupDiscountPercent,
 dynamicPricing,
 activeWaitlistEntries: initialWaitlistEntries
}: BookingCardWrapperProps) {
 const router = useRouter()
 const { user } = useAuth()
 const [isLoading, setIsLoading] = useState(false)
 
 // Local state for all active bookings a traveler has for this tour
 const [activeBookings, setActiveBookings] = useState<PublicActiveBookingResponse[]>([])
 const [activeWaitlistEntries, setActiveWaitlistEntries] = useState<PublicActiveWaitlistResponse[]>(initialWaitlistEntries || [])
 
 const [showCancelModal, setShowCancelModal] = useState(false)
 const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<PublicActiveBookingResponse | null>(null)

 // Effectively detect active bookings on client
 useEffect(() => {
 if (!user) {
 setActiveBookings([])
 setActiveWaitlistEntries([])
 return
 }

 const fetchAuthDetails = async () => {
 try {
 const res = await getPublicTourDetail(Number(tourId))
 setActiveBookings(res.activeBookings || [])
 setActiveWaitlistEntries(res.activeWaitlistEntries || [])
 } catch (err) {
 console.error('Failed to fetch user-specific tour details:', err)
 }
 }
 
 fetchAuthDetails()
 }, [user?.userId, tourId]) // Re-run if identifying user info changes or tourId changes

 // Map real occurrences to the format BookingCard expects
 // Stabilize with useMemo to avoid redundant effect triggers in child
 const upcomingDates = useMemo(() => {
 return (occurrences || []).map((occ: any) => ({
 id: occ.id || occ.occurrenceId,
 date: occ.startTimeUtc || occ.startTime, // Support both real API and mock
 availableSpots: occ.availableSeats ?? occ.availableSpots,
 priceOverride: occ.priceOverride,
 waitlistCount: occ.waitlistCount || 0
 }))
 }, [occurrences])

 const handleBookNow = async (date: string, people: number, waiverSigned: boolean) => {
 if (!user) {
 toast.error('Please login to book a tour')
 router.push(`/auth/login?redirect=/tours/${tourId}`)
 return
 }

 if (user.role !== 'TRAVELER') {
 toast.error('Only traveler accounts can book tours')
 return
 }

 if (!user.emailVerified) {
 toast.error('Please verify your email address before booking')
 router.push('/auth/email-verification')
 return
 }

 if (!user.profileCompleted) {
 toast.error('Please complete your profile before booking')
 router.push('/dashboard/traveler/complete-profile')
 return
 }

 const occurrence = (occurrences || []).find((o: any) => (o.startTimeUtc || o.startTime) === date)
 if (!occurrence) {
 toast.error('Selected date is no longer available')
 return
 }

 setIsLoading(true)
 try {
 const res = await createBooking({
 occurrenceId: occurrence.id || occurrence.occurrenceId,
 peopleCount: people,
 waiverSigned: waiverSigned
 })
 toast.success('Tour booked successfully!')
 router.push(`/bookings/confirmation?id=${res.id}`)
 } catch (err: any) {
 if (err.response?.status !== 403) {
 console.error('Booking failed:', err)
 }
 
 if (err.response?.status === 409) {
 const msg = err.response?.data?.message || 'Conflict detected'
 if (msg.toLowerCase().includes('already have an active booking')) {
 toast.error(
 (t: any) => (
 <span>
 {msg}{' '}
 <button 
 onClick={() => {
 toast.dismiss(t.id)
 router.push('/dashboard/traveler/bookings')
 }}
 className="underline font-bold"
 >
 View My Bookings
 </button>
 </span>
 ),
 { duration: 6000 }
 )
 return
 }
 }
 toast.error(err.response?.data?.message || 'Failed to book tour. Please try again.')
 } finally {
 setIsLoading(false)
 }
 }

 const handleRequestBooking = async (date: string, people: number, waiverSigned: boolean, message?: string) => {
 if (!user) {
 toast.error('Please login to request a booking')
 router.push(`/auth/login?redirect=/tours/${tourId}`)
 return
 }

 if (user.role !== 'TRAVELER') {
 toast.error('Only traveler accounts can request bookings')
 return
 }

 if (!user.emailVerified) {
 toast.error('Please verify your email address before booking')
 router.push('/auth/email-verification')
 return
 }

 if (!user.profileCompleted) {
 toast.error('Please complete your profile before booking')
 router.push('/dashboard/traveler/complete-profile')
 return
 }

 const occurrence = (occurrences || []).find((o: any) => (o.startTimeUtc || o.startTime) === date)
 if (!occurrence) {
 toast.error('Selected date is no longer available')
 return
 }

 setIsLoading(true)
 try {
 const res = await createBooking({
 occurrenceId: occurrence.id || occurrence.occurrenceId,
 peopleCount: people,
 waiverSigned: waiverSigned,
 message: message 
 })
 toast.success('Booking request sent to guide!')
 router.push(`/bookings/confirmation?id=${res.id}`)
 } catch (err: any) {
 if (err.response?.status !== 403) {
 console.error('Request failed:', err)
 }

 if (err.response?.status === 409) {
 const msg = err.response?.data?.message || 'Conflict detected'
 if (msg.toLowerCase().includes('already have an active booking')) {
 toast.error(
 (t: any) => (
 <span>
 {msg}{' '}
 <button 
 onClick={() => {
 toast.dismiss(t.id)
 router.push('/dashboard/traveler/bookings')
 }}
 className="underline font-bold"
 >
 View My Bookings
 </button>
 </span>
 ),
 { duration: 6000 }
 )
 return
 }
 }
 toast.error(err.response?.data?.message || 'Failed to send request. Please try again.')
 } finally {
 setIsLoading(false)
 }
 }

 const handleJoinWaitlist = async (date: string, people: number) => {
 if (!user) {
 toast.error('Please login to join the waitlist')
 router.push(`/auth/login?redirect=/tours/${tourId}`)
 return
 }

 if (user.role !== 'TRAVELER') {
 toast.error('Only traveler accounts can join the waitlist')
 return
 }

 if (!user.emailVerified) {
 toast.error('Please verify your email address before joining the waitlist')
 router.push('/auth/email-verification')
 return
 }

 if (!user.profileCompleted) {
 toast.error('Please complete your profile before joining the waitlist')
 router.push('/dashboard/traveler/complete-profile')
 return
 }

 const occurrence = (occurrences || []).find((o: any) => (o.startTimeUtc || o.startTime) === date)
 if (!occurrence) {
 toast.error('Selected date is no longer available')
 return
 }

 setIsLoading(true)
 try {
 await joinWaitlist({ 
 occurrenceId: occurrence.id || occurrence.occurrenceId, 
 peopleCount: people 
 })
 toast.success('You\'ve been added to the waitlist!')
 router.push('/dashboard/traveler/bookings')
 } catch (err: any) {
 if (err.response?.status !== 403) {
 console.error('Waitlist join failed:', err)
 }
 toast.error(err.response?.data?.message || 'Failed to join waitlist')
 } finally {
 setIsLoading(false)
 }
 }
 
 const handleLeaveWaitlist = async (waitlistId: number) => {
 setIsLoading(true)
 try {
 await leaveWaitlist(waitlistId)
 toast.success('You have left the waitlist')
 
 // Optimistic update
 setActiveWaitlistEntries(prev => prev.filter(w => w.id !== waitlistId))
 
 router.refresh()
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Failed to leave waitlist')
 } finally {
 setIsLoading(false)
 }
 }

 const handleUpdateBooking = async (bookingId: number, occurrenceId: number, peopleCount: number, confirmWaitlist: boolean = false) => {
 setIsLoading(true)
 try {
 const res = await updateBooking(bookingId, {
 occurrenceId,
 peopleCount,
 confirmWaitlistTransition: confirmWaitlist
 })
 
 if (res.status === 'Cancelled') {
 toast.success("You have been moved to the waitlist!")
 } else {
 toast.success('Booking updated successfully!')
 }
 router.push('/dashboard/traveler/bookings')
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Update failed')
 } finally {
 setIsLoading(false)
 }
 }

 const handleCancelBooking = async (bookingId: number) => {
 const booking = activeBookings.find(b => b.id === bookingId)
 if (booking) {
 setSelectedBookingForCancel(booking)
 setShowCancelModal(true)
 }
 }

 const handleConfirmCancel = async (bookingId: number) => {
 setIsLoading(true)
 try {
 await cancelBooking(bookingId, { reason: 'Cancelled by traveler from tour page' })
 toast.success('Booking request cancelled')
 
 // Remove only this booking from our local synchronous list
 setActiveBookings(prev => prev.filter(b => b.id !== bookingId))
 
 router.refresh()
 } catch (err: any) {
 toast.error(err.response?.data?.message || 'Failed to cancel request')
 } finally {
 setIsLoading(false)
 setShowCancelModal(false)
 setSelectedBookingForCancel(null)
 }
 }
 
 const handleMessageGuide = async (date?: string) => {
 if (!user) {
 toast.error('Please login to message the guide')
 router.push(`/auth/login?redirect=/tours/${tourId}`)
 return
 }

 if (user.role === 'GUIDE' && user.userId === guideId) {
 toast.error("You can't message yourself!")
 return
 }

 setIsLoading(true)
 try {
 let dateContext = ''
 if (date) {
 const formattedDate = new Date(date).toLocaleDateString('en-US', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 })
 dateContext = ` for the date ${formattedDate}`
 }
 const res = await chatApi.sendMessage({
 tourId: parseInt(tourId),
 content: `Hi ${guideName}, I have a question about the tour"${tourTitle}"${dateContext}.`
 })
 toast.success('Conversation started!')
 router.push(`/dashboard/traveler/messages?id=${res.conversationId}`)
 } catch (err) {
 console.error('Failed to start conversation:', err)
 toast.error('Could not start conversation')
 } finally {
 setIsLoading(false)
 }
 }

 // Default cancellation policy if missing
 const policy = cancellationPolicy || {
 fullRefund: 48,
 partialRefund: 24,
 partialRefundPercent: 50,
 noRefund: 24
 }

 return (
 <>
 <BookingCard
 basePrice={basePrice}
 currency={currency || 'USD'}
 minCapacity={minCapacity || 1}
 maxCapacity={maxCapacity || 20}
 availableSpots={upcomingDates.length > 0 ? upcomingDates[0].availableSpots : undefined}
 bookingMode={bookingMode}
 nextAvailableDate={upcomingDates[0]?.date}
 upcomingDates={upcomingDates}
 isWaitlistAvailable={isWaitlistAvailable}
 waitlistCount={waitlistCount}
 cancellationPolicy={policy}
 hasGroupDiscount={hasGroupDiscount}
 groupDiscountThreshold={groupDiscountThreshold}
 groupDiscountPercent={groupDiscountPercent}
 dynamicPricing={dynamicPricing}
 onBookNow={handleBookNow}
 onRequestBooking={handleRequestBooking}
 onJoinWaitlist={handleJoinWaitlist}
 onLeaveWaitlist={handleLeaveWaitlist}
 onUpdateBooking={handleUpdateBooking}
 onCancelBooking={handleCancelBooking}
 activeBookings={activeBookings}
 activeWaitlistEntries={activeWaitlistEntries}
 isLoading={isLoading}
 onMessageGuide={handleMessageGuide}
 />

 {showCancelModal && selectedBookingForCancel && (
 <Portal>
 <CancellationModal
 booking={{
 id: selectedBookingForCancel.id,
 tourTitle: occurrences?.[0]?.templateTitle || 'this tour', 
 finalPrice: selectedBookingForCancel.finalPrice,
 currency: selectedBookingForCancel.currency,
 startTimeUtc: selectedBookingForCancel.startTime
 }}
 isOpen={showCancelModal}
 isLoading={isLoading}
 onClose={() => setShowCancelModal(false)}
 onConfirm={handleConfirmCancel}
 />
 </Portal>
 )}
 </>
 )
}

// Ported from dashboard
function CancellationModal({ booking, isOpen, onClose, onConfirm, isLoading = false }: any) {
 if (!isOpen || !booking) return null

 const now = new Date()
 const tourDate = new Date(booking.startTimeUtc)
 const hoursDiff = (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60)

 let refundPercent = 0
 let refundMessage = ''

 if (hoursDiff > 48) {
 refundPercent = 100
 refundMessage = 'Full refund'
 } else if (hoursDiff > 24) {
 refundPercent = 50
 refundMessage = '50% refund'
 } else {
 refundPercent = 0
 refundMessage = 'No refund'
 }

 const refundAmount = (booking.finalPrice * refundPercent) / 100

 return (
 <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 ">
 <div className="w-full max-w-md surface-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-primary-light/10 dark:border-primary-dark/10">
 {/* Header */}
 <div className="p-6 border-b border-primary-light/10 dark:border-primary-dark/10">
 <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
 <AlertCircle className="w-5 h-5" />
 <h3 className="text-lg font-bold text-primary-light dark:text-primary-dark">
 Cancel Booking
 </h3>
 </div>
 </div>

 {/* Content */}
 <div className="p-6 space-y-4">
 <p className="text-sm text-theme-secondary ">
 Are you sure you want to cancel your booking?
 </p>

 {/* Refund info */}
 <div className="p-4 surface-section rounded-xl space-y-2">
 <div className="flex justify-between text-sm">
 <span className="text-theme-secondary ">Booking amount</span>
 <span className="font-semibold text-theme-primary">
 {booking.currency} {booking.finalPrice}
 </span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-theme-secondary ">Refund policy</span>
 <span className="font-semibold text-amber-600 dark:text-amber-400">
 {refundPercent}%
 </span>
 </div>
 <div className="flex justify-between text-sm pt-2 border-t border-primary-light/10 dark:border-primary-dark/10">
 <span className="font-medium text-theme-primary">Estimated refund</span>
 <span className="text-lg font-bold text-success-green dark:text-emerald-400">
 {booking.currency} {refundAmount.toFixed(2)}
 </span>
 </div>
 <p className="text-xs text-theme-muted mt-2 italic">
 {refundMessage}
 </p>
 </div>

 <p className="text-xs text-theme-muted ">
 Refunds will be processed back to your original payment method within 5-7 business days.
 </p>
 </div>

 {/* Footer */}
 <div className="p-6 surface-section flex gap-3 border-t border-primary-light/10 dark:border-primary-dark/10">
 <button
 onClick={onClose}
 disabled={isLoading}
 className="flex-1 px-4 py-2 surface-card border border-primary-light/10 dark:border-primary-dark/10 text-theme-secondary font-medium rounded-lg hover:surface-section dark:hover:surface-card transition-colors disabled:opacity-50"
 >
 Go Back
 </button>
 <button
 onClick={() => onConfirm(booking.id)}
 disabled={isLoading}
 className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
 Cancel Booking
 </button>
 </div>
 </div>
 </div>
 )
}