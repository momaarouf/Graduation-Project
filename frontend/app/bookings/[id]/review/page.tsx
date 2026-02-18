// ============================================================================
// REVIEW FORM PAGE
// ============================================================================
// LOCATION: /frontend/src/app/bookings/[id]/review/page.tsx
// 
// PURPOSE: Allow travelers to leave reviews after completed tours
// 
// FEATURES:
// - Star rating (1-5)
// - Written review with character count
// - Photo upload (optional)
// - Anonymous option
// - Rating categories (separate ratings for guide, tour, value)
// ============================================================================

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star,
  Camera,
  X,
  ChevronLeft,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  MapPin,
  Calendar,
  Heart,
  MessageSquare
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// Mock booking data
const MOCK_BOOKING = {
  id: 'B123456',
  tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
  tourImage: '/images/tours/istanbul-ottoman.jpg',
  date: '2026-04-15T09:00:00Z',
  guideName: 'Mehmet Yilmaz',
  guideAvatar: '/images/guides/mehmet.jpg'
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const booking = MOCK_BOOKING

  // ========================================
  // STATE
  // ========================================
  const [ratings, setRatings] = useState({
    overall: 0,
    guide: 0,
    tour: 0,
    value: 0
  })
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const date = new Date(booking.date)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // ========================================
  // HANDLERS
  // ========================================
  // In your main component, add state for each category
const [hoverRatings, setHoverRatings] = useState({
  overall: 0,
  guide: 0,
  tour: 0,
  value: 0
})

const handleHover = (category: string, value: number) => {
  setHoverRatings(prev => ({ ...prev, [category]: value }))
}
  const handleRatingClick = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }))
  }

  const handleRatingHover = (value: number) => {
    setHoverRating(value)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPhotos(prev => [...prev, ...files].slice(0, 5)) // Max 5 photos
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    // Validate at least overall rating
    if (ratings.overall === 0) {
      alert('Please select an overall rating')
      return
    }

    setIsSubmitting(true)

    try {
      // Phase 2: API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsSubmitted(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/bookings/${params.id}`)
      }, 2000)

    } catch (error) {
      console.error('Failed to submit review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // In /frontend/src/app/bookings/[id]/review/page.tsx

// ========================================
// RENDER STAR RATING - FIXED
// ========================================

const renderStars = (
  category: keyof typeof ratings,
  currentRating: number,
  hoverValue: number,
  onHover: (value: number) => void,
  label: string
) => {
  // Local hover state for this specific row
  
  
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          // Determine if this star should be filled
          const isActive = star <= (hoverValue || currentRating)
          
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(category, star)}
              onMouseEnter={() => onHover(star)}
              onMouseLeave={() => onHover(0)}
              className="p-1 focus:outline-none group/star"
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                className={`
                  w-8 h-8 transition-all duration-200
                  ${isActive
                    ? 'fill-amber-400 text-amber-400 scale-110' 
                    : 'text-gray-300 dark:text-gray-700 group-hover/star:text-amber-300'
                  }
                  ${hoverValue === star ? 'scale-125 rotate-3' : ''}
                `}
              />
            </button>
          )
        })}
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 min-w-[4rem]">
          {currentRating > 0 ? `${currentRating}/5` : 'Select'}
        </span>
      </div>
      
      {/* Optional: Show rating description */}
      {hoverValue > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 animate-fade-in">
          {hoverValue === 1 && 'Poor'}
          {hoverValue === 2 && 'Fair'}
          {hoverValue === 3 && 'Good'}
          {hoverValue === 4 && 'Very Good'}
          {hoverValue === 5 && 'Excellent'}
        </p>
      )}
    </div>
  )
}

  // ========================================
  // RENDER SUCCESS STATE
  // ========================================

  if (isSubmitted) {
    return (
      <PageLayout>
        <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="container-safe mx-auto max-w-2xl py-16 sm:py-24">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Review Submitted!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Thank you for sharing your experience. Your review helps other travelers make informed decisions.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Redirecting back to booking...
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // ========================================
  // RENDER FORM
  // ========================================

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-3xl py-8 sm:py-10">
          
          {/* Back Button */}
          <Link
            href={`/bookings/${params.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Booking</span>
          </Link>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 px-6 py-6 text-white">
              <h1 className="text-2xl font-bold mb-2">Share Your Experience</h1>
              <p className="text-amber-100 text-sm">
                Your feedback helps other travelers and supports great guides
              </p>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8">
              
              {/* Tour Info */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <Image src={booking.tourImage} alt={booking.tourTitle} width={64} height={64} className="object-cover" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900 dark:text-white mb-1">
                    {booking.tourTitle}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Guided by {booking.guideName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Sections */}
              <div className="space-y-6 mb-8">
                {renderStars('overall', ratings.overall,hoverRatings.overall, (value) => handleHover('overall', value), 'Overall Rating')}
                {renderStars('guide', ratings.guide,hoverRatings.guide, (value) => handleHover('guide', value), 'Guide Performance')}
                {renderStars('tour', ratings.tour,hoverRatings.tour, (value) => handleHover('tour', value), 'Tour Experience')}
                {renderStars('value', ratings.value,hoverRatings.value, (value) => handleHover('value', value), 'Value for Money')}
              </div>

              {/* Written Review */}
              <div className="space-y-2 mb-6">
                <label htmlFor="review" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Write Your Review
                </label>
                <textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={5}
                  placeholder="Share your experience... What did you like? What could be improved?"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
                <div className="flex justify-end text-xs text-gray-500 dark:text-gray-400">
                  {review.length}/500 characters
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Add Photos (Optional)
                </label>
                
                <div className="flex flex-wrap gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden group">
                      <Image
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {photos.length < 5 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-colors">
                      <Camera className="w-6 h-6 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Up to 5 photos, max 10MB each
                </p>
              </div>

              {/* Anonymous Option */}
              <label className="flex items-center gap-3 mb-8 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="peer absolute opacity-0 w-4 h-4 cursor-pointer"
                  />
                  <div className={`w-4 h-4 border rounded transition-all duration-200 flex items-center justify-center ${
                    isAnonymous
                      ? 'bg-amber-600 border-amber-600'
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 group-hover:border-amber-400'
                  }`}>
                    {isAnonymous && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Post as anonymous
                </span>
              </label>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || ratings.overall === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>

              {/* Note */}
              <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
                <MessageSquare className="inline w-3 h-3 mr-1" />
                Your review will be visible on the tour page. Guides can respond to reviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}