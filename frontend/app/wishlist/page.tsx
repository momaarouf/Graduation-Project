// ============================================================================
// WISHLIST - SAVED TOURS
// ============================================================================
// LOCATION: /frontend/src/app/wishlist/page.tsx
// 
// PURPOSE: Display all tours saved by the traveler
// 
// FEATURES:
// - Grid of saved tours
// - Remove from wishlist
// - Move to booking
// - Share wishlist
// - Empty state
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  Trash2,
  Share2,
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  Leaf,
  ChevronRight,
  ShoppingBag
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import toast from 'react-hot-toast'

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_WISHLIST = [
  {
    id: '1',
    title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    image: '/images/tours/istanbul-ottoman.jpg',
    location: 'Istanbul',
    country: 'Turkey',
    price: 89,
    currency: 'USD',
    duration: '4 hours',
    rating: 4.9,
    reviews: 128,
    halal: true,
    guideName: 'Mehmet Yilmaz',
    savedAt: '2026-03-15'
  },
  {
    id: '2',
    title: 'Cappadocia Sunrise Balloon & Valley Hike',
    image: '/images/tours/cappadocia-balloon.jpg',
    location: 'Cappadocia',
    country: 'Turkey',
    price: 199,
    currency: 'USD',
    duration: '6 hours',
    rating: 5.0,
    reviews: 256,
    halal: false,
    guideName: 'Ahmet Demir',
    savedAt: '2026-03-14'
  },
  {
    id: '3',
    title: 'Beirut Street Food & Cultural Walk',
    image: '/images/tours/beirut-food.jpg',
    location: 'Beirut',
    country: 'Lebanon',
    price: 45,
    currency: 'USD',
    duration: '3 hours',
    rating: 4.8,
    reviews: 89,
    halal: true,
    guideName: 'Layla Hassan',
    savedAt: '2026-03-12'
  },
  {
    id: '4',
    title: 'Bosphorus Sunset Cruise with Dinner',
    image: '/images/tours/bosphorus-cruise.jpg',
    location: 'Istanbul',
    country: 'Turkey',
    price: 129,
    currency: 'USD',
    duration: '4 hours',
    rating: 4.9,
    reviews: 178,
    halal: true,
    guideName: 'Zeynep Kaya',
    savedAt: '2026-03-10'
  }
]

// ============================================================================
// WISHLIST CARD COMPONENT
// ============================================================================

const WishlistCard = ({ tour, onRemove }: { tour: typeof MOCK_WISHLIST[0]; onRemove: (id: string) => void }) => {
  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-56 h-40 bg-gray-100 dark:bg-gray-800">
          <Image src={tour.image} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          {tour.halal && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              Halal
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tour.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Guided by {tour.guideName}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {tour.location}, {tour.country}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {tour.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {tour.rating} ({tour.reviews})
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                ${tour.price}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                per person
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Link
              href={`/tours/${tour.id}`}
              className="flex-1 text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              View Tour
            </Link>
            <button
              onClick={() => onRemove(tour.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/tours/${tour.id}`)
                toast.success('Link copied!')
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Saved on {new Date(tour.savedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(MOCK_WISHLIST)

  const handleRemove = (id: string) => {
    setWishlist(prev => prev.filter(tour => tour.id !== id))
    toast.success('Removed from wishlist')
  }

  const handleClearAll = () => {
    if (confirm('Clear all items from wishlist?')) {
      setWishlist([])
      toast.success('Wishlist cleared')
    }
  }

  const handleShareWishlist = () => {
    const tourNames = wishlist.map(t => t.title).join('\n- ')
    const text = `My SafariHub Wishlist:\n- ${tourNames}`
    
    if (navigator.share) {
      navigator.share({
        title: 'My SafariHub Wishlist',
        text: text,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Wishlist copied to clipboard!')
    }
  }

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                My Wishlist
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {wishlist.length} {wishlist.length === 1 ? 'tour' : 'tours'} saved
              </p>
            </div>

            {wishlist.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleShareWishlist}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Wishlist Grid */}
          {wishlist.length > 0 ? (
            <div className="space-y-4">
              {wishlist.map(tour => (
                <WishlistCard key={tour.id} tour={tour} onRemove={handleRemove} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Heart className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Save tours you're interested in and they'll appear here.
              </p>
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Tours
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}