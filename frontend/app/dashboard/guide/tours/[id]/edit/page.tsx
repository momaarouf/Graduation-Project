'use client'

import { useState, useEffect, use } from 'react'
import TourForm from '../../components/TourForm'
import { getGuideTour } from '@/src/lib/api/tours'
import { TourTemplateResponse } from '@/src/lib/types/tour.types'
import { RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import TourFormSkeleton from './skeleton'

export default function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
 const unwrappedParams = use(params)
 const id = unwrappedParams.id
 
 const [tour, setTour] = useState<TourTemplateResponse | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 const formatDateForInput = (dateStr?: string | null) => {
 if (!dateStr) return ''
 try {
 const date = new Date(dateStr)
 if (isNaN(date.getTime())) return ''
 return date.toISOString().slice(0, 16)
 } catch (e) {
 return ''
 }
 }

 useEffect(() => {
 const fetchTour = async () => {
 try {
 setLoading(true)
 const res = await getGuideTour(parseInt(id))
 setTour(res)
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
    return <TourFormSkeleton />
 }

 if (error || !tour) {
 return (
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)] flex items-center justify-center">
 <div className="text-center px-6">
 <div className="w-16 h-16 bg-danger-red/10 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
 <AlertCircle className="w-8 h-8 text-danger-red dark:text-red-400" />
 </div>
 <h1 className="text-2xl font-bold text-theme-primary mb-2">Tour Not Found</h1>
 <p className="text-theme-secondary mb-6">{error ||"The tour you're trying to edit doesn't exist or you don't have permission."}</p>
 <button 
 onClick={() => window.location.reload()}
 className="px-8 py-3 bg-primary-light text-white text-xs font-bold capitalize tracking-normal rounded-xl hover:bg-primary-light-hover transition-all shadow-xl shadow-primary-light/20 hover:scale-105 active:scale-95"
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
 shortDescription: tour.shortDescription || '',
 city: tour.city || tour.locationName || '', // Alignment
 country: tour.countryCode === 'LB' ? 'lebanon' : 'turkey', // Alignment
 isHalalCertified: tour.halalFriendly, // Alignment
 instantBookEnabled: tour.instantBook, // Alignment
 autoCancelIfMinNotMet: tour.autoCancelIfMinNotMet ?? true,
 showInPortfolio: tour.showInPortfolio ?? true,
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
 caption: m.caption || ''
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
 startDate: formatDateForInput(tour.startDate),
 recurringUntil: formatDateForInput(tour.recurringUntil),
 recurringDates: tour.recurringDates ? JSON.parse(tour.recurringDates) : [],
 excludedDates: tour.excludedDates ? JSON.parse(tour.excludedDates) : [],
 dynamicPricing: tour.dynamicPricing ? JSON.parse(tour.dynamicPricing) : {
 enabled: false,
 weekendMultiplier: 1.2
 },
 halalDetails: tour.halalDetails ? JSON.parse(tour.halalDetails) : {
 prayerSpace: false,
 halalFood: false,
 genderSensitiveGuides: false,
 mosqueVisits: false
 },
 isPremium: tour.isPremium || false,
 isFamilyFriendly: tour.isFamilyFriendly !== undefined ? tour.isFamilyFriendly : false,
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
