// ============================================================================
// BOOKING CARD - PRICING & AVAILABILITY WIDGET
// ============================================================================
// LOCATION: /frontend/src/components/tour-detail/BookingCard.tsx
// 
// PURPOSE: Complete booking interface with dynamic pricing
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Instant Book: payment → booking CONFIRMED
// ✓ Request to Book: payment authorized → booking PENDING_GUIDE
// ✓ Group discount: 4+ people get 5% discount
// ✓ Traveler tier discount (Phase 2)
// ✓ Waitlist: Join if full
// ✓ 15-minute cart lock for payments
// ✓ 48-hour cancellation policy display
// ============================================================================

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
 Calendar,
 Users,
 Clock,
 Shield,
 CheckCircle,
 AlertCircle,
 ChevronDown,
 ChevronUp,
 Info,
 Zap,
 Hourglass,
 Star,
 Loader2,
 CreditCard,
 TrendingUp,
 Tag
} from 'lucide-react'
import { BookingCardProps, BookingMode } from '@/src/types/tour-detail.types'
import { PublicActiveBookingResponse, BookingStatus, PricePreviewResponse } from '@/src/lib/types/tour.types'
import { getPricePreview } from '@/src/lib/api/tours'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function BookingCard({
 basePrice,
 currency,
 priceBreakdown,
 minCapacity,
 maxCapacity,
 availableSpots,
 bookingMode,
 nextAvailableDate,
 upcomingDates = [],
 isWaitlistAvailable,
 waitlistCount = 0,
 cancellationPolicy,
 onBookNow,
 onRequestBooking,
 onJoinWaitlist,
 onLeaveWaitlist,
 onUpdateBooking,
 onCancelBooking,
 hasGroupDiscount = false,
 groupDiscountThreshold = 4,
 groupDiscountPercent = 5,
 dynamicPricing,
 activeBookings = [],
 activeWaitlistEntries = [],
 isLoading = false,
 onMessageGuide
}: BookingCardProps) {
 // ========================================
 // HOOKS
 // ========================================
 const router = useRouter()
 const searchParams = useSearchParams()
 const pathname = usePathname()

 // ========================================
 // STATE
 // ========================================
 const [selectedDate, setSelectedDate] = useState<string>('')
 const [peopleCount, setPeopleCount] = useState<number>(1)
 const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
 const [isPricingOpen, setIsPricingOpen] = useState(false)
 const [isRequestMode, setIsRequestMode] = useState(bookingMode === 'request')
 const [waiverSigned, setWaiverSigned] = useState(false)
 const [isMobileExpanded, setIsMobileExpanded] = useState(false)
 /**
  * Server-computed price breakdown — fetched when date or peopleCount changes.
  * Null while loading or before any date is selected.
  * Falls back to local calculateTotalPrice() when null.
  */
 const [serverPreview, setServerPreview] = useState<PricePreviewResponse | null>(null)
 const [isPreviewLoading, setIsPreviewLoading] = useState(false)

 // ========================================
 // IDENTITY & CONTEXT
 // ========================================
 
 // Find the active booking for the currently selected date
 // Use Number() for robust comparison between backend and frontend types
 const currentActiveBooking = useMemo(() => {
 if (!selectedDate || !activeBookings.length) return null
 const occurrence = upcomingDates.find(o => o.date === selectedDate)
 if (!occurrence) return null
 return activeBookings.find(b => Number(b.occurrenceId) === Number(occurrence.id)) || null
 }, [activeBookings, upcomingDates, selectedDate])

 const activeBookingId = currentActiveBooking?.id
 const activeBookingStatus = currentActiveBooking?.status
 const activeBookingOccurrenceId = currentActiveBooking?.occurrenceId
 const activeBookingPeopleCount = currentActiveBooking?.peopleCount

 const isAwaitingPayment = !!activeBookingId && activeBookingStatus === BookingStatus.PendingPayment
 const isPending = !!activeBookingId && activeBookingStatus === BookingStatus.PendingGuide
 const isEditing = !!activeBookingId && !isPending && !isAwaitingPayment

 // Detect if user is waitlisted for the current date
 const currentWaitlistEntry = useMemo(() => {
 if (!selectedDate || !activeWaitlistEntries.length) return null
 const occurrence = upcomingDates.find(o => o.date === selectedDate)
 if (!occurrence) return null
 return activeWaitlistEntries.find(w => Number(w.occurrenceId) === Number(occurrence.id)) || null
 }, [activeWaitlistEntries, upcomingDates, selectedDate])

 const isWaitlisted = !!currentWaitlistEntry

 // 1. Unified Sync from URL/Active Booking/Waitlist to Local State
 useEffect(() => {
 const urlDate = searchParams.get('date')
 
 // A. Priority 1: URL manually specifies a date
 if (urlDate && upcomingDates.some(o => o.date === urlDate)) {
 if (urlDate !== selectedDate) {
 setSelectedDate(urlDate)
 }
 return
 }

 // B. Priority 2: Jump to ACTIVE BOOKING
 if (!selectedDate && activeBookings.length > 0) {
 const firstBooking = activeBookings[0]
 const occurrence = upcomingDates.find(o => Number(o.id) === Number(firstBooking.occurrenceId))
 if (occurrence) {
 setSelectedDate(occurrence.date)
 setPeopleCount(firstBooking.peopleCount || 1)
 return
 }
 }

 // C. Priority 3: Jump to WAITLIST position
 if (!selectedDate && activeWaitlistEntries.length > 0) {
 const firstWaitlist = activeWaitlistEntries[0]
 const occurrence = upcomingDates.find(o => Number(o.id) === Number(firstWaitlist.occurrenceId))
 if (occurrence) {
 setSelectedDate(occurrence.date)
 setPeopleCount(firstWaitlist.peopleCount || 1)
 return
 }
 }

 // D. Priority 4: Initial Mount - Default to first available
 if (!selectedDate && upcomingDates.length > 0) {
 const firstDate = upcomingDates[0].date
 setSelectedDate(firstDate)

 // Push to URL on initial select if not there
 const params = new URLSearchParams(searchParams.toString())
 params.set('date', firstDate)
 router.replace(`${pathname}?${params.toString()}`, { scroll: false })
 }
 }, [upcomingDates, searchParams, activeBookings, activeWaitlistEntries, selectedDate, router, pathname])

 // 2. Helper to handle manual date changes
 const handleDateChange = (newDate: string) => {
 if (newDate === selectedDate) return
 
 // Update local state immediately for snappy UI
 setSelectedDate(newDate)
 setIsDatePickerOpen(false)

 // Push to URL: other components will react to this
 const params = new URLSearchParams(searchParams.toString())
 params.set('date', newDate)
 router.replace(`${pathname}?${params.toString()}`, { scroll: false })
 }

 // ========================================
 // SERVER PRICE PREVIEW
 // ========================================

 // Fetch a server-computed breakdown whenever the user changes date or people count.
 // This ensures 100% parity with the backend calculation (including loyalty tier).
 useEffect(() => {
  if (!selectedDate || !upcomingDates) return
  const occurrence = upcomingDates.find(o => o.date === selectedDate)
  if (!occurrence?.id) return

  let cancelled = false
  const fetchPreview = async () => {
   setIsPreviewLoading(true)
   try {
    // Extract tourId from the first occurrence (all belong to the same template)
    const tourId = (occurrence as any).templateId
    if (!tourId) return
    const preview = await getPricePreview(tourId, occurrence.id, peopleCount)
    if (!cancelled) setServerPreview(preview)
   } catch {
    // Silently fall back to local calculation — don't show error for preview failures
    if (!cancelled) setServerPreview(null)
   } finally {
    if (!cancelled) setIsPreviewLoading(false)
   }
  }

  fetchPreview()
  return () => { cancelled = true }
 }, [selectedDate, peopleCount, upcomingDates])

 // ========================================
 // DERIVED VALUES
 // ========================================

 /**
 * Calculate total price with all discounts
 * Maps to ERD: PricingEngine
 */
 const calculateTotalPrice = () => {
 let pricePerPerson = basePrice
 let appliedMultiplier = 1.0
 let adjustmentType: 'weekend' | 'holiday' | null = null

 // Apply dynamic pricing if enabled
 if (dynamicPricing?.enabled && selectedDate) {
 const date = new Date(selectedDate)
 const day = date.getDay() // 0 = Sunday, 6 = Saturday
 const month = date.getMonth() + 1
 const dayOfMonth = date.getDate()

 // 1. Check for Holidays (Matching Backend Fixed Lebanese Holidays)
 const isHoliday = (m: number, d: number) => {
 const holidays = [
 {m: 1, d: 1}, {m: 1, d: 6}, {m: 2, d: 9}, {m: 3, d: 25},
 {m: 5, d: 1}, {m: 5, d: 25}, {m: 8, d: 15}, {m: 11, d: 1},
 {m: 11, d: 22}, {m: 12, d: 25}
 ]
 return holidays.some(h => h.m === m && h.d === d)
 }

 if (isHoliday(month, dayOfMonth)) {
 appliedMultiplier = dynamicPricing.holidayMultiplier || 1.0
 if (appliedMultiplier > 5.0) appliedMultiplier /= 100.0
 adjustmentType = 'holiday'
 } else if (day === 0 || day === 6) {
 appliedMultiplier = dynamicPricing.weekendMultiplier || 1.0
 if (appliedMultiplier > 5.0) appliedMultiplier /= 100.0
 adjustmentType = 'weekend'
 }

 if (appliedMultiplier !== 1.0) {
 // Safety cap matching backend (5.0x)
 const safeMultiplier = Math.min(appliedMultiplier, 5.0)
 pricePerPerson = basePrice * safeMultiplier
 }
 }

 const surchargePercent = appliedMultiplier !== 1.0
  ? Math.round((Math.min(appliedMultiplier, 5.0) - 1) * 100)
  : 0

 let subtotal = pricePerPerson * peopleCount
 let discountAmount = 0

 // Group discount: dynamic logic from props
 if (hasGroupDiscount && peopleCount >= (groupDiscountThreshold || 4)) {
 const percent = (groupDiscountPercent || 5) / 100
 discountAmount = subtotal * percent
 subtotal = subtotal - discountAmount 
 }

 return {
 subtotal: pricePerPerson * peopleCount,
 discount: discountAmount,
 total: subtotal,
 pricePerPerson,
 multiplier: appliedMultiplier,
 surchargePercent,
 adjustmentType
 }
 }

 const localPrice = calculateTotalPrice()

 // Use server preview when available (more accurate — includes loyalty tier);
 // fall back to local calculation for instant responsiveness.
 const price = serverPreview
  ? {
   pricePerPerson: serverPreview.finalPrice / peopleCount,
   subtotal: serverPreview.subtotal,
   discount: serverPreview.groupDiscountAmount + serverPreview.tierDiscountAmount,
   total: serverPreview.finalPrice,
   multiplier: 1.0,
   surchargePercent: serverPreview.weekendApplied
    ? serverPreview.weekendPercent
    : serverPreview.holidayApplied
    ? serverPreview.holidayPercent
    : 0,
   adjustmentType: serverPreview.holidayApplied
    ? ('holiday' as const)
    : serverPreview.weekendApplied
    ? ('weekend' as const)
    : (null as null)
  }
  : localPrice

 /**
 * Determine if booking is available for the selected date
 */
 const selectedDateData = upcomingDates.find(d => d.date === selectedDate)
 const rawAvailable = selectedDateData?.availableSpots ?? (availableSpots || 0)
 
 // Effective available spots for THIS user during an update
 // If it's the same occurrence, they can expand into their own spots + raw spots
 const isSameOccurrence = activeBookingId && activeBookingOccurrenceId && selectedDateData?.id === activeBookingOccurrenceId
 const effectiveAvailable = isSameOccurrence 
 ? (rawAvailable + (activeBookingPeopleCount || 0)) 
 : rawAvailable

 const isAvailable = effectiveAvailable >= peopleCount

 // Dynamic available counter for the UI badge
 const peopleDiff = isSameOccurrence ? (peopleCount - (activeBookingPeopleCount || 0)) : peopleCount
 const dynamicAvailable = Math.max(0, rawAvailable - peopleDiff)

 /**
 * Get availability status color
 */
 const getAvailabilityColor = () => {
 // Use effectiveAvailable for the owner's status color
 const percentage = (effectiveAvailable / maxCapacity) * 100
 if (percentage <= 20) return 'text-red-600 dark:text-red-400'
 if (percentage <= 50) return 'text-orange-600 dark:text-orange-400'
 return 'text-success-green dark:text-emerald-400'
 }

 /**
 * Get next available date display
 */
 const getNextDateDisplay = () => {
 if (selectedDate) {
 const date = new Date(selectedDate)
 return date.toLocaleDateString('en-US', {
 weekday: 'short',
 month: 'short',
 day: 'numeric'
 })
 }
 return nextAvailableDate || 'Select date'
 }

 // ========================================
 // HANDLERS
 // ========================================

 const handleBooking = async () => {
 if (!isPending && !waiverSigned) {
 toast.error('You must agree to the liability waiver to book this tour')
 return
 }

 if (isEditing) {
 if (activeBookingId && onUpdateBooking) {
 const occurrenceId = upcomingDates.find(d => d.date === selectedDate)?.id
 if (!occurrenceId) return

 try {
 await onUpdateBooking(activeBookingId, occurrenceId, peopleCount, false)
 } catch (error: any) {
 if (error.response?.status === 409) {
 if (window.confirm("Increase group size will move you to the waitlist and you will lose your current spot. Are you sure?")) {
 await onUpdateBooking(activeBookingId, occurrenceId, peopleCount, true)
 }
 } else {
 toast.error(error.response?.data?.message || 'Update failed')
 }
 }
 }
 return
 }

 if (isPending) {
 if (activeBookingId && onCancelBooking) {
 onCancelBooking(activeBookingId)
 }
 return
 }

 if (bookingMode === 'instant' || !isRequestMode) {
 onBookNow(selectedDate, peopleCount, waiverSigned)
 } else {
 onRequestBooking(selectedDate, peopleCount, waiverSigned, '')
 }
 }

 const handleWaitlist = () => {
 if (!selectedDate) {
 alert('Please select a date')
 return
 }
 
 if (isWaitlisted && currentWaitlistEntry) {
 onLeaveWaitlist?.(currentWaitlistEntry.id)
 } else {
 onJoinWaitlist(selectedDate, peopleCount)
 }
 }

 // ========================================
 // RENDER
 // ========================================

 return (
 <div id="booking-card" className="surface-section border border-primary-light/10 dark:border-primary-dark/10 rounded-xl overflow-hidden sticky top-24">
 {/* ========================================
 HEADER - PRICE & AVAILABILITY
 ======================================== */}
 <div className="p-6 border-b border-primary-light/10 dark:border-primary-dark/10">
 <div className="flex items-baseline justify-between mb-2">
 <div>
 <span className="text-2xl sm:text-3xl font-bold text-theme-primary">
 {currency === 'USD' && '$'}
 {currency === 'TRY' && '₺'}
 {currency === 'LBP' && 'ل.ل '}
 {Number(price.pricePerPerson).toFixed(2)}
 </span>
 <span className="text-sm text-theme-muted ml-1">
 / person
 </span>
 </div>

 {/* Availability badge */}
 <div className={`px-2 py-1 rounded-lg text-xs font-medium ${dynamicAvailable === 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : isAvailable ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
 {upcomingDates.length === 0 
 ? 'No dates scheduled' 
 : isAvailable ? `${dynamicAvailable} spots left` : (dynamicAvailable > 0 ? `Only ${dynamicAvailable} left` : 'Fully booked')
 }
 </div>
 </div>

 {/* Waitlist indicator */}
 {isWaitlistAvailable && (() => {
 const count = upcomingDates.find(d => d.date === selectedDate)?.waitlistCount || 0;
 return count > 0 || !isAvailable;
 })() && (
 <div className="pb-4">
 <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-sm">
 <Hourglass className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
 <span className="text-amber-700 dark:text-amber-300 text-xs">
 {(() => {
 const count = upcomingDates.find(d => d.date === selectedDate)?.waitlistCount || 0;
 return count > 0 
 ? `${count} ${count === 1 ? 'person' : 'people'} on waitlist`
 : 'Tour is full — join waitlist';
 })()}
 </span>
 </div>
 </div>
 )}
 </div>

 {/* ========================================
 BOOKING FORM
 ======================================== */}
 <div className="p-6 space-y-4">

 {/* Date selection */}
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-2">
 Select date
 </label>
 <div className="relative">
 <button
 onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
 className="w-full flex items-center justify-between px-5 py-3.5 surface-section border border-primary-light/10 dark:border-primary-dark/10 rounded-lg text-left transition-all hover:border-primary-light dark:hover:border-primary-dark shadow-sm"
 >
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4 text-primary-light" />
 <span className="text-theme-primary font-bold">
 {getNextDateDisplay()}
 </span>
 </div>
 {isDatePickerOpen ? (
 <ChevronUp className="w-4 h-4 text-theme-muted" />
 ) : (
 <ChevronDown className="w-4 h-4 text-theme-muted" />
 )}
 </button>

 {/* Date picker dropdown */}
 {isDatePickerOpen && (
 <div className="absolute top-full left-0 right-0 mt-1 surface-card border border-primary-light/10 dark:border-primary-dark/10 rounded-lg shadow-md z-50 max-h-64 overflow-y-auto">
 {upcomingDates.map((date) => {
 const dateObj = new Date(date.date)
 const formatted = dateObj.toLocaleDateString('en-US', {
 weekday: 'short',
 month: 'short',
 day: 'numeric'
 })
 const isAvailable = date.availableSpots >= peopleCount

 return (
 <button
 key={date.date}
 onClick={() => handleDateChange(date.date)}
 className={`
 w-full
 flex items-center justify-between
 px-4 py-3
 hover:surface-section dark:hover:surface-card
 transition-colors
 ${selectedDate === date.date ? 'bg-primary-light/10 ' : ''}
 `}
 >
 <span className="text-theme-primary">
 {formatted}
 </span>
 <span className={`
 text-xs
 ${date.availableSpots > 0
 ? 'text-success-green dark:text-emerald-400'
 : 'text-red-600 dark:text-red-400'
 }
 `}>
 {date.availableSpots > 0
 ? `${date.availableSpots} spots`
 : 'Full'
 }
 </span>
 </button>
 )
 })}
 </div>
 )}
 </div>
 
 {/* Compact Contact Link - moved under date selector */}
 <div className="pt-2 pb-4 border-b border-primary-light/10 dark:border-primary-dark/10">
 <button
 type="button"
 onClick={() => onMessageGuide?.(selectedDate)}
 className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline transition-colors"
 >
 <AlertCircle className="w-3.5 h-3.5" />
 Have questions? Message guide
 </button>
 </div>
 </div>

 {/* Number of travelers */}
 {!isWaitlisted && !isPending && (
 <div className="pt-2">
 <label className="block text-sm font-medium text-theme-secondary mb-2">
 Number of travelers
 </label>
 <div className="flex items-center gap-2">
 {!isPending && !isWaitlisted && (
 <button
 onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
 disabled={peopleCount <= 1 || isLoading}
 className="
 w-11 h-11
 flex items-center justify-center
 surface-section
 border border-primary-light/10 dark:border-primary-dark/10 rounded-lg
 text-theme-primary hover:surface-section dark:hover:surface-section
 disabled:opacity-50 disabled:cursor-not-allowed
 transition-all shadow-sm
"
 aria-label="Decrease travelers"
 >
 −
 </button>
 )}

 <div className="flex-1 flex items-center justify-center gap-2 py-2.5 surface-section rounded-lg border border-primary-light/10 dark:border-primary-dark/10 shadow-inner">
 <Users className="w-4 h-4 text-primary-light" />
 <span className="text-base font-bold text-theme-primary ">
 {peopleCount} {peopleCount === 1 ? 'Traveler' : 'Travelers'}
 </span>
 </div>

 {!isPending && !isWaitlisted && (
 <button
 onClick={() => setPeopleCount(Math.min(maxCapacity, peopleCount + 1))}
 disabled={peopleCount >= maxCapacity || isLoading}
 className="
 w-11 h-11
 flex items-center justify-center
 surface-section
 border border-primary-light/10 dark:border-primary-dark/10 rounded-lg
 text-theme-primary hover:surface-section dark:hover:surface-section
 disabled:opacity-50 disabled:cursor-not-allowed
 transition-all shadow-sm
"
 aria-label="Increase travelers"
 >
 +
 </button>
 )}
 </div>

 {/* Group discount indicator */}
 {hasGroupDiscount && peopleCount >= (groupDiscountThreshold || 4) && (
 <div className="mt-2 flex items-center gap-1.5 text-xs text-success-green dark:text-emerald-400">
 <CheckCircle className="w-3.5 h-3.5" />
 <span>{Number(groupDiscountPercent || 5).toLocaleString('en-US', { maximumFractionDigits: 2 })}% group discount applied</span>
 </div>
 )}
 </div>
 )}

 {/* ========================================
 PRICE BREAKDOWN (Collapsible)
 ======================================== */}
 {!isWaitlisted && !isPending && (
 <div className="border-t border-primary-light/10 dark:border-primary-dark/10 pt-4">
 <button
 onClick={() => setIsPricingOpen(!isPricingOpen)}
 className="
 w-full
 flex items-center justify-between
 text-sm
"
 >
 <span className="font-medium text-theme-primary">
 Price details
 </span>
 {isPricingOpen ? (
 <ChevronUp className="w-4 h-4 text-theme-muted " />
 ) : (
 <ChevronDown className="w-4 h-4 text-theme-muted " />
 )}
 </button>

 {isPricingOpen && (
 <div className="mt-3 space-y-2 text-sm">
 {/* Base price line */}
 <div className="flex justify-between">
 <span className="text-theme-secondary ">
 {currency === 'USD' && '$'}{currency === 'TRY' && '₺'}{currency === 'LBP' && 'ل.ل '}
 {basePrice} × {peopleCount} {peopleCount === 1 ? 'person' : 'people'}
 </span>
 <span className="text-theme-primary">
 {currency === 'USD' && '$'}{currency === 'TRY' && '₺'}{currency === 'LBP' && 'ل.ل '}
 {(basePrice * peopleCount).toFixed(2)}
 </span>
 </div>

 {/* Weekend surcharge */}
 {price.adjustmentType === 'weekend' && price.surchargePercent > 0 && (
 <div className="flex justify-between text-amber-600 dark:text-amber-400">
 <span className="flex items-center gap-1">
 <TrendingUp className="w-3.5 h-3.5" />
 +{price.surchargePercent}% Weekend Rate
 </span>
 <span>+{currency === 'USD' && '$'}{currency === 'TRY' && '₺'}{currency === 'LBP' && 'ل.ل '}{(basePrice * peopleCount * price.surchargePercent / 100).toFixed(2)}</span>
 </div>
 )}

 {/* Holiday surcharge */}
 {price.adjustmentType === 'holiday' && price.surchargePercent > 0 && (
 <div className="flex justify-between text-orange-600 dark:text-orange-400">
 <span className="flex items-center gap-1">
 <Star className="w-3.5 h-3.5" />
 +{price.surchargePercent}% Holiday Rate
 </span>
 <span>+{currency === 'USD' && '$'}{currency === 'TRY' && '₺'}{currency === 'LBP' && 'ل.ل '}{(basePrice * peopleCount * price.surchargePercent / 100).toFixed(2)}</span>
 </div>
 )}

 {/* Group discount */}
 {(serverPreview?.groupDiscountApplied || (!serverPreview && hasGroupDiscount && peopleCount >= (groupDiscountThreshold || 4))) && (
 <div className="flex justify-between text-success-green dark:text-emerald-400">
 <span className="flex items-center gap-1">
 <Tag className="w-3.5 h-3.5" />
 -{serverPreview ? serverPreview.groupDiscountPercent : (groupDiscountPercent || 5)}% Group Discount
 </span>
 <span>-{currency === 'USD' && '$'}{currency === 'TRY' && '₺'}{currency === 'LBP' && 'ل.ل '}{(serverPreview ? serverPreview.groupDiscountAmount : price.discount).toFixed(2)}</span>
 </div>
 )}

 {/* Loyalty tier discount */}
 {serverPreview && serverPreview.tierDiscountPercent > 0 && (
 <div className="flex justify-between text-sky-600 dark:text-sky-400">
 <span className="flex items-center gap-1">
 <Star className="w-3.5 h-3.5" />
 -{serverPreview.tierDiscountPercent}% Member Discount
 </span>
 <span>-{currency === 'USD' && '$'}{currency === 'TRY' && '₺'}{currency === 'LBP' && 'ل.ل '}{serverPreview.tierDiscountAmount.toFixed(2)}</span>
 </div>
 )}

 {/* Total */}
 <div className="flex justify-between font-medium pt-2 border-t border-primary-light/10 dark:border-primary-dark/10">
 <span className="text-theme-primary">Total</span>
 <span className="text-xl text-theme-primary flex items-center gap-1.5">
 {isPreviewLoading && <Loader2 className="w-3.5 h-3.5 animate-spin opacity-60" />}
 {currency === 'USD' && '$'}{currency === 'TRY' && '₺'}{currency === 'LBP' && 'ل.ل '}
 {price.total.toFixed(2)}
 </span>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Waiver / Terms Checkbox */}
 {!isWaitlisted && !isPending && (
 <div className="flex items-start gap-3 p-3 surface-section rounded-lg">
 <input
 id="waiver-check"
 type="checkbox"
 checked={waiverSigned}
 onChange={(e) => setWaiverSigned(e.target.checked)}
 className="mt-1 w-4 h-4 text-primary-light dark:text-primary-dark rounded border-primary-light/10 dark:border-primary-dark/10-strong focus:ring-primary-light dark:ring-primary-dark"
 />
 <label htmlFor="waiver-check" className="text-xs text-theme-secondary leading-relaxed cursor-pointer">
 I agree to the <span className="text-primary-light dark:text-primary-dark hover:underline">liability waiver</span> and understand the tour requirements.
 </label>
 </div>
 )}

 {/* ========================================
 BOOKING ACTIONS
 ======================================== */}
 <div className="space-y-3 pt-2">
 {activeBookingId || (isAvailable && !isWaitlisted) ? (
 <>
 {/* 
 NOTE: Only show 'Instant Book' toggle if the tour supports BOTH 
 or if we want to allow skipping instant book for some reason.
 The USER rule states:"if guide unchecked book instantly you shouldn't 
 put the choice for user to check it it should automaticly be request to book".
 So we hide the toggle if bookingMode is 'request'.
 */}
 {bookingMode === 'instant' && false && (
 <div className="flex items-center justify-between p-3 surface-section rounded-lg">
 <div className="flex items-center gap-2">
 <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 <span className="text-sm text-theme-secondary">
 Request instead?
 </span>
 </div>
 <button
 onClick={() => setIsRequestMode(!isRequestMode)}
 className={`
 relative inline-flex h-5 w-9 items-center rounded-lg
 transition-colors duration-200
 ${isRequestMode
 ? 'bg-amber-600 dark:bg-amber-500'
 : 'surface-section'
 }
 `}
 >
 <span
 className={`
 inline-block h-4 w-4 transform rounded-lg surface-card transition-transform duration-200
 ${isRequestMode ? 'translate-x-5' : 'translate-x-0.5'}
 `}
 />
 </button>
 </div>
 )}

 {/* Main CTA button */}
 {isAwaitingPayment ? (
 <div className="space-y-3">
 <button
 onClick={() => router.push(`/bookings/confirmation?id=${activeBookingId}`)}
 className="w-full px-6 py-4 bg-primary-light hover:bg-primary-light-hover text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
 >
 <CreditCard className="w-5 h-5" />
 Pay Now
 </button>
 <button
 onClick={() => onCancelBooking?.(activeBookingId)}
 disabled={isLoading}
 className="w-full px-6 py-3 surface-section border border-primary-light/10 dark:border-primary-dark/10 text-theme-secondary font-bold rounded-lg hover:surface-section dark:hover:surface-base transition-all disabled:opacity-50"
 >
 Cancel Booking
 </button>
 </div>
 ) : isPending ? (
 <button
 onClick={handleBooking}
 disabled={!selectedDate || isLoading}
 className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isLoading ? 'Cancelling...' : 'Cancel Request'}
 </button>
 ) : activeBookingId ? (
 <div className="space-y-3">
 <button
 onClick={handleBooking}
 disabled={!selectedDate || isLoading}
 className="w-full px-6 py-4 bg-primary-light hover:bg-primary-light-hover text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isLoading ? 'Updating...' : 'Update Booking'}
 </button>
 
 <button
 onClick={() => onCancelBooking?.(activeBookingId)}
 disabled={isLoading}
 className="w-full px-6 py-3.5 surface-section border border-danger-red dark:border-danger-red/50 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 shadow-md"
 >
 Cancel Booking
 </button>
 </div>
 ) : (
 <button
 onClick={handleBooking}
 disabled={!selectedDate || isLoading}
 className="w-full px-6 py-4 bg-primary-light hover:bg-primary-light-hover text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {bookingMode === BookingMode.INSTANT || !isRequestMode
 ? (isLoading ? 'Processing...' : 'Book Now')
 : (isLoading ? 'Sending Request...' : 'Request to Book')}
 </button>
 )}

 </>
 ) : (
 <div className="space-y-4">
 {isWaitlisted && currentWaitlistEntry && (
 <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-success-green dark:border-success-green rounded-xl flex items-center gap-3">
 <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 dark:bg-emerald-800 text-success-green dark:text-emerald-400 font-bold rounded-lg text-lg">
 #{currentWaitlistEntry.position}
 </div>
 <div>
 <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
 You are on the waitlist
 </p>
 <p className="text-xs text-success-green dark:text-emerald-400">
 Entry #{currentWaitlistEntry.id}
 </p>
 </div>
 </div>
 )}

 <button
 onClick={handleWaitlist}
 disabled={(!isWaitlisted && !isWaitlistAvailable) || !selectedDate || isLoading}
 className={`
 w-full
 px-6 py-4
 ${isWaitlisted 
 ? 'surface-card border border-danger-red dark:border-danger-red/50 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm'
 : 'bg-amber-600 dark:bg-amber-700 text-white font-semibold hover:bg-amber-700 dark:hover:bg-amber-800 shadow-lg hover:shadow-md'
 }
 rounded-lg
 transition-all
 active:scale-[0.98]
 disabled:opacity-50 disabled:cursor-not-allowed
 flex items-center justify-center gap-2
 `}
 >
 {isLoading ? (
 <>
 <Loader2 className="w-5 h-5 animate-spin" />
 <span>{isWaitlisted ? 'Removing...' : 'Joining...'}</span>
 </>
 ) : (
 <>{isWaitlisted ? 'Leave Waitlist' : 'Join Waitlist'}</>
 )}
 </button>
 </div>
 )}
 </div>

 {/* Simplified Cancellation Policy */}
 {!isWaitlisted && !isPending && (
 <div className="flex items-center gap-2 p-3 surface-section rounded-lg text-xs text-theme-secondary ">
 <Shield className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark dark:text-primary-dark flex-shrink-0" />
 <span>Free cancellation up to {cancellationPolicy.fullRefund}h before start</span>
 </div>
 )}
 </div>
 </div>
 )
}
