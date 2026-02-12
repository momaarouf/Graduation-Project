'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import BookingCard from './BookingCard'
import type { TourDetail, BookingMode } from '@/src/types/tour-detail.types'

interface BookingCardWrapperProps {
  tour: TourDetail
}

export default function BookingCardWrapper({ tour }: BookingCardWrapperProps) {
  const router = useRouter()

  const handleBookNow = async (date: string, people: number) => {
    try {
      // Phase 2: API call
      console.log('Booking:', { date, people })
      toast.success('Booking confirmed!')
      router.push('/bookings/confirmation')
    } catch (error) {
      toast.error('Booking failed')
    }
  }

  const handleRequestBooking = async (date: string, people: number, message?: string) => {
    try {
      console.log('Request:', { date, people, message })
      toast.success('Request sent!')
      router.push('/bookings')
    } catch (error) {
      toast.error('Failed to send request')
    }
  }

  const handleJoinWaitlist = async (date: string, people: number) => {
    try {
      console.log('Waitlist:', { date, people })
      toast.success(`Added to waitlist!`)
    } catch (error) {
      toast.error('Failed to join waitlist')
    }
  }

  return (
    <BookingCard
      basePrice={tour.basePrice}
      currency={tour.currency}
      priceBreakdown={tour.priceBreakdown}
      minCapacity={tour.minCapacity}
      maxCapacity={tour.maxCapacity}
      availableSpots={tour.availableSpots}
      bookingMode={tour.bookingMode}
      nextAvailableDate={tour.nextAvailableDate}
      upcomingDates={tour.upcomingDates}
      isWaitlistAvailable={tour.isWaitlistAvailable}
      waitlistCount={tour.waitlistCount}
      cancellationPolicy={tour.cancellationPolicy}
      onBookNow={handleBookNow}
      onRequestBooking={handleRequestBooking}
      onJoinWaitlist={handleJoinWaitlist}
    />
  )
}