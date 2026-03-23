'use client'

import { useState, useEffect, use } from 'react'
import TourForm from '../../components/TourForm'
import { getGuideTour } from '@/src/lib/api/tours'
import { TourTemplateResponse } from '@/src/lib/types/tour.types'
import { RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  
  const [tour, setTour] = useState<TourTemplateResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true)
        const res = await getGuideTour(parseInt(id))
        setTour(res.data)
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to fetch tour'
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchTour()
  }, [id])

  if (loading) {
    return (
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading tour data...</p>
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tour Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "The tour you're trying to edit doesn't exist or you don't have permission."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Map backend TourTemplateResponse to TourFormData for the form
  const initialData: any = {
    ...tour,
    city: tour.city || tour.locationName || '', // Alignment
    country: tour.countryCode === 'LB' ? 'lebanon' : 'turkey', // Alignment
    isHalalCertified: tour.halalFriendly, // Alignment
    instantBookEnabled: tour.instantBook, // Alignment
    meetingPoint: {
      name: tour.meetingPointName || '',
      address: tour.meetingPointAddress || '',
      instructions: tour.meetingPointInstructions || '',
      lat: tour.meetingLatitude,
      lng: tour.meetingLongitude
    },
    gallery: tour.media?.map(m => ({
      id: m.id.toString(),
      type: m.mediaType.toLowerCase(),
      url: m.url,
      caption: ''
    })) || [],
    itinerary: tour.itinerary ? JSON.parse(tour.itinerary) : [],
    inclusions: tour.inclusions ? JSON.parse(tour.inclusions) : [],
    exclusions: tour.exclusions ? JSON.parse(tour.exclusions) : [],
    requirements: tour.requirements ? JSON.parse(tour.requirements) : [],
    whatToBring: tour.whatToBring ? JSON.parse(tour.whatToBring) : [],
    tags: tour.tags ? JSON.parse(tour.tags) : [],
    availableLanguages: tour.languages ? JSON.parse(tour.languages) : [],
    minCapacity: tour.minCapacity ?? 1,
    maxCapacity: tour.maxCapacity ?? 10,
    durationHours: tour.durationHours ?? 2,
    durationMinutes: tour.durationMinutes ?? 0,
    tourType: tour.isRecurring ? 'recurring' : 'one-time',
    recurrencePattern: tour.recurrencePattern?.toLowerCase() || 'weekly',
    recurringDays: tour.recurringDays ? tour.recurringDays.split(',').map(d => d.trim().toLowerCase()) : [],
    recurringUntil: tour.recurringUntil || undefined,
    recurringDates: tour.recurringDates ? JSON.parse(tour.recurringDates) : [],
    excludedDates: tour.excludedDates ? JSON.parse(tour.excludedDates) : [],
    
    // New fields
    dynamicPricing: tour.dynamicPricing ? JSON.parse(tour.dynamicPricing) : { enabled: false },
    halalDetails: tour.halalDetails ? JSON.parse(tour.halalDetails) : {
      prayerSpace: false,
      halalFood: false,
      genderSensitiveGuides: false,
      mosqueVisits: false
    },
    isPremium: tour.isPremium || false,
    isFamilyFriendly: tour.isFamilyFriendly !== undefined ? tour.isFamilyFriendly : true,
    groupDiscountEnabled: tour.hasGroupDiscount || false,
    groupDiscountThreshold: tour.groupDiscountThreshold || 4,
    groupDiscountPercent: tour.groupDiscountPercent || 5,
    status: tour.status?.toLowerCase() || 'draft'
  }

  return (
    <TourForm 
      initialData={initialData}
      isEditing={true}
      tourId={id}
    />
  )
}