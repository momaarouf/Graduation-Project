'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState } from 'react'
import BookingCard from './BookingCard'
import { BookingMode } from '@/src/types/tour-detail.types'
import { createBooking } from '@/src/lib/api/tours'

interface BookingCardWrapperProps {
  tourId: string
  basePrice: number
  currency: string
  minCapacity: number
  maxCapacity: number
  bookingMode: BookingMode
  occurrences: any[]
  waitlistCount: number
  isWaitlistAvailable: boolean
  cancellationPolicy?: any
}

export default function BookingCardWrapper({
  tourId,
  basePrice,
  currency,
  minCapacity,
  maxCapacity,
  bookingMode,
  occurrences,
  waitlistCount,
  isWaitlistAvailable,
  cancellationPolicy
}: BookingCardWrapperProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Map real occurrences to the format BookingCard expects
  const upcomingDates = (occurrences || []).map((occ: any) => ({
    date: occ.startTimeUtc || occ.startTime, // Support both real API and mock
    availableSpots: occ.availableSeats ?? occ.availableSpots,
    priceOverride: occ.priceOverride
  }))

  const handleBookNow = async (date: string, people: number, waiverSigned: boolean) => {
    const occurrence = (occurrences || []).find((o: any) => (o.startTimeUtc || o.startTime) === date)
    if (!occurrence) {
      toast.error('Selected date is no longer available')
      return
    }

    setIsLoading(true)
    try {
      await createBooking({
        occurrenceId: occurrence.id || occurrence.occurrenceId,
        peopleCount: people,
        waiverSigned: waiverSigned
      })
      toast.success('Tour booked successfully!')
      router.push('/dashboard/traveler/bookings')
    } catch (err: any) {
      console.error('Booking failed:', err)
      toast.error(err.response?.data?.message || 'Failed to book tour. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestBooking = async (date: string, people: number, waiverSigned: boolean, message?: string) => {
    const occurrence = (occurrences || []).find((o: any) => (o.startTimeUtc || o.startTime) === date)
    if (!occurrence) {
      toast.error('Selected date is no longer available')
      return
    }

    setIsLoading(true)
    try {
      await createBooking({
        occurrenceId: occurrence.id || occurrence.occurrenceId,
        peopleCount: people,
        waiverSigned: waiverSigned
      })
      toast.success('Booking request sent to guide!')
      router.push('/dashboard/traveler/bookings')
    } catch (err: any) {
      console.error('Request failed:', err)
      toast.error(err.response?.data?.message || 'Failed to send request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinWaitlist = async (date: string, people: number) => {
    toast.success(`Waiting list feature coming soon!`)
  }

  // Default cancellation policy if missing
  const policy = cancellationPolicy || {
    fullRefund: 48,
    partialRefund: 24,
    partialRefundPercent: 50,
    noRefund: 24
  }

  return (
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
      onBookNow={handleBookNow}
      onRequestBooking={handleRequestBooking}
      onJoinWaitlist={handleJoinWaitlist}
      isLoading={isLoading}
    />
  )
}