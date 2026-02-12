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

import { useState, useEffect } from 'react'
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
    Star
} from 'lucide-react'
import type { BookingCardProps } from '@/src/types/tour-detail.types'

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
    onJoinWaitlist
}: BookingCardProps) {

    // ========================================
    // STATE
    // ========================================
    const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0]?.date || '')
    const [peopleCount, setPeopleCount] = useState<number>(minCapacity)
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const [isPricingOpen, setIsPricingOpen] = useState(false)
    const [requestMessage, setRequestMessage] = useState('')
    const [isRequestMode, setIsRequestMode] = useState(false)

    // ========================================
    // DERIVED VALUES
    // ========================================

    /**
     * Calculate total price with all discounts
     * Maps to ERD: PricingEngine
     */
    const calculateTotalPrice = () => {
        let total = basePrice * peopleCount

        // Group discount: 5% for 4+ people
        if (peopleCount >= 4) {
            total = total * 0.95 // 5% discount
        }

        // Traveler tier discount (Phase 2)
        // Will be applied via backend API

        // Promo code discount (Phase 2)

        return {
            subtotal: basePrice * peopleCount,
            discount: peopleCount >= 4 ? basePrice * peopleCount * 0.05 : 0,
            total: total
        }
    }

    const price = calculateTotalPrice()

    /**
     * Determine if booking is available
     */
    const isAvailable = availableSpots >= peopleCount

    /**
     * Get availability status color
     */
    const getAvailabilityColor = () => {
        const percentage = (availableSpots / maxCapacity) * 100
        if (percentage <= 20) return 'text-red-600 dark:text-red-400'
        if (percentage <= 50) return 'text-orange-600 dark:text-orange-400'
        return 'text-emerald-600 dark:text-emerald-400'
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

    const handleBooking = () => {
        if (!selectedDate) {
            alert('Please select a date')
            return
        }

        if (bookingMode === 'instant' || !isRequestMode) {
            onBookNow(selectedDate, peopleCount)
        } else {
            onRequestBooking(selectedDate, peopleCount, requestMessage)
        }
    }

    const handleWaitlist = () => {
        if (!selectedDate) {
            alert('Please select a date')
            return
        }
        onJoinWaitlist(selectedDate, peopleCount)
    }

    // ========================================
    // RENDER
    // ========================================

    return (
        <div className="
      bg-white dark:bg-gray-900
      rounded-xl
      border border-gray-200 dark:border-gray-800
      shadow-lg
      overflow-hidden
      sticky top-24
    ">
            {/* ========================================
          HEADER - PRICE & AVAILABILITY
          ======================================== */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-baseline justify-between mb-2">
                    <div>
                        <span className="
              text-2xl sm:text-3xl
              font-bold
              text-gray-900 dark:text-white
            ">
                            {currency === 'USD' && '$'}
                            {currency === 'TRY' && '₺'}
                            {currency === 'LBP' && 'ل.ل '}
                            {basePrice}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            / person
                        </span>
                    </div>

                    {/* Availability badge */}
                    <div className={`
            px-2 py-1
            rounded-full
            text-xs font-medium
            ${isAvailable
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }
          `}>
                        {isAvailable ? `${availableSpots} spots left` : 'Fully booked'}
                    </div>
                </div>

                {/* Waitlist indicator */}
                {!isAvailable && isWaitlistAvailable && (
                    <div className="
            flex items-center gap-2
            p-3
            bg-amber-50 dark:bg-amber-950/30
            rounded-lg
            text-sm
          ">
                        <Hourglass className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <span className="text-amber-700 dark:text-amber-300">
                            {waitlistCount} people on waitlist
                        </span>
                    </div>
                )}
            </div>

            {/* ========================================
          BOOKING FORM
          ======================================== */}
            <div className="p-6 space-y-4">

                {/* Date selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select date
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                            className="
                w-full
                flex items-center justify-between
                px-4 py-3
                bg-white dark:bg-gray-900
                border border-gray-300 dark:border-gray-700
                rounded-lg
                text-left
                hover:border-gray-400 dark:hover:border-gray-600
                transition-colors
              "
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-gray-900 dark:text-white">
                                    {getNextDateDisplay()}
                                </span>
                            </div>
                            {isDatePickerOpen ? (
                                <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                        </button>

                        {/* Date picker dropdown */}
                        {isDatePickerOpen && (
                            <div className="
                absolute top-full left-0 right-0 mt-1
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-lg
                shadow-xl
                z-50
                max-h-64 overflow-y-auto
              ">
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
                                            onClick={() => {
                                                setSelectedDate(date.date)
                                                setIsDatePickerOpen(false)
                                            }}
                                            className={`
                        w-full
                        flex items-center justify-between
                        px-4 py-3
                        hover:bg-gray-50 dark:hover:bg-gray-800
                        transition-colors
                        ${selectedDate === date.date ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      `}
                                        >
                                            <span className="text-gray-900 dark:text-white">
                                                {formatted}
                                            </span>
                                            <span className={`
                        text-xs
                        ${date.availableSpots > 0
                                                    ? 'text-emerald-600 dark:text-emerald-400'
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
                </div>

                {/* Number of travelers */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of travelers
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPeopleCount(Math.max(minCapacity, peopleCount - 1))}
                            disabled={peopleCount <= minCapacity}
                            className="
                w-10 h-10
                flex items-center justify-center
                bg-gray-100 dark:bg-gray-800
                border border-gray-300 dark:border-gray-700
                rounded-lg
                text-gray-700 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-gray-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
                            aria-label="Decrease travelers"
                        >
                            −
                        </button>

                        <div className="flex-1 flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {peopleCount}
                            </span>
                        </div>

                        <button
                            onClick={() => setPeopleCount(Math.min(maxCapacity, peopleCount + 1))}
                            disabled={peopleCount >= maxCapacity}
                            className="
                w-10 h-10
                flex items-center justify-center
                bg-gray-100 dark:bg-gray-800
                border border-gray-300 dark:border-gray-700
                rounded-lg
                text-gray-700 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-gray-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
                            aria-label="Increase travelers"
                        >
                            +
                        </button>
                    </div>

                    {/* Group discount indicator */}
                    {peopleCount >= 4 && (
                        <div className="
              mt-2
              flex items-center gap-1.5
              text-xs
              text-emerald-600 dark:text-emerald-400
            ">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>5% group discount applied</span>
                        </div>
                    )}
                </div>

                {/* Request message (for Request to Book mode) */}
                {bookingMode === 'request' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Message to guide (optional)
                        </label>
                        <textarea
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            placeholder="Ask any questions or specify special requirements..."
                            rows={3}
                            className="
                w-full
                px-4 py-3
                bg-white dark:bg-gray-900
                border border-gray-300 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500
                resize-none
              "
                        />
                    </div>
                )}

                {/* ========================================
            PRICE BREAKDOWN (Collapsible)
            ======================================== */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                    <button
                        onClick={() => setIsPricingOpen(!isPricingOpen)}
                        className="
              w-full
              flex items-center justify-between
              text-sm
            "
                    >
                        <span className="font-medium text-gray-900 dark:text-white">
                            Price details
                        </span>
                        {isPricingOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        )}
                    </button>

                    {isPricingOpen && (
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {currency === 'USD' && '$'}
                                    {currency === 'TRY' && '₺'}
                                    {currency === 'LBP' && 'ل.ل '}
                                    {basePrice} × {peopleCount} {peopleCount === 1 ? 'person' : 'people'}
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                    {currency === 'USD' && '$'}
                                    {currency === 'TRY' && '₺'}
                                    {currency === 'LBP' && 'ل.ل '}
                                    {price.subtotal.toFixed(2)}
                                </span>
                            </div>

                            {peopleCount >= 4 && (
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                    <span>Group discount (5%)</span>
                                    <span>
                                        -{currency === 'USD' && '$'}
                                        {currency === 'TRY' && '₺'}
                                        {currency === 'LBP' && 'ل.ل '}
                                        {price.discount.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-800">
                                <span className="text-gray-900 dark:text-white">Total</span>
                                <span className="text-xl text-gray-900 dark:text-white">
                                    {currency === 'USD' && '$'}
                                    {currency === 'TRY' && '₺'}
                                    {currency === 'LBP' && 'ل.ل '}
                                    {price.total.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================
            BOOKING ACTIONS
            ======================================== */}
                <div className="space-y-3 pt-2">
                    {isAvailable ? (
                        <>
                            {/* Instant Book / Request to Book toggle */}
                            {bookingMode === 'request' && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Book instantly?
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsRequestMode(!isRequestMode)}
                                        className={`
                      relative inline-flex h-5 w-9 items-center rounded-full
                      transition-colors duration-200
                      ${!isRequestMode
                                                ? 'bg-amber-600 dark:bg-amber-500'
                                                : 'bg-gray-300 dark:bg-gray-700'
                                            }
                    `}
                                    >
                                        <span
                                            className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                        ${!isRequestMode ? 'translate-x-5' : 'translate-x-0.5'}
                      `}
                                        />
                                    </button>
                                </div>
                            )}

                            {/* Main CTA button */}
                            <button
                                onClick={handleBooking}
                                disabled={!selectedDate}
                                className="
                  w-full
                  px-6 py-4
                  bg-gradient-to-r
                  from-blue-600 to-indigo-600
                  dark:from-blue-700 dark:to-indigo-700
                  text-white
                  font-semibold
                  rounded-lg
                  hover:from-blue-700 hover:to-indigo-700
                  dark:hover:from-blue-800 dark:hover:to-indigo-800
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg hover:shadow-xl
                "
                            >
                                {bookingMode === 'instant' || !isRequestMode
                                    ? 'Book Now'
                                    : 'Request to Book'
                                }
                            </button>

                            {/* 15-minute cart lock notice */}
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                <Clock className="inline w-3 h-3 mr-1" />
                                Your booking will be reserved for 15 minutes
                            </p>
                        </>
                    ) : (
                        // Waitlist button
                        <button
                            onClick={handleWaitlist}
                            disabled={!isWaitlistAvailable || !selectedDate}
                            className="
                w-full
                px-6 py-4
                bg-amber-600 dark:bg-amber-700
                text-white
                font-semibold
                rounded-lg
                hover:bg-amber-700 dark:hover:bg-amber-800
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                        >
                            Join Waitlist
                        </button>
                    )}
                </div>

                {/* ========================================
            CANCELLATION POLICY
            ======================================== */}
                <div className="
          p-4
          bg-gray-50 dark:bg-gray-800
          rounded-lg
          space-y-2
          text-sm
        ">
                    <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white mb-1">
                                Cancellation policy
                            </p>
                            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                                <li className="flex items-start gap-1.5">
                                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                                    <span>100% refund up to {cancellationPolicy.fullRefund}h before</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-amber-600 dark:text-amber-400">⚠</span>
                                    <span>{cancellationPolicy.partialRefundPercent}% refund {cancellationPolicy.partialRefund}-{cancellationPolicy.fullRefund}h before</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-red-600 dark:text-red-400">✕</span>
                                    <span>No refund within {cancellationPolicy.noRefund}h</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ========================================
            TRUST BADGES
            ======================================== */}
                <div className="
          flex flex-wrap items-center gap-3
          pt-2
          text-xs
          text-gray-500 dark:text-gray-400
        ">
                    <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Verified guide
                    </span>
                    <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Secure payment
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        48h payout freeze
                    </span>
                </div>
            </div>
        </div>
    )
}