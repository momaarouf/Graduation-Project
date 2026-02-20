'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, MapPin, Users, Leaf } from 'lucide-react'

// Mock data - replace with API call
const MOCK_TOURS = [
  {
    id: '1',
    title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    image: '/images/tours/istanbul-ottoman.jpg',
    price: 89,
    currency: 'USD',
    duration: '4 hours',
    location: 'Istanbul',
    rating: 4.9,
    reviews: 128,
    halal: true,
    available: true
  },
  {
    id: '2',
    title: 'Bosphorus Sunset Cruise with Dinner',
    image: '/images/tours/bosphorus-cruise.jpg',
    price: 129,
    currency: 'USD',
    duration: '4 hours',
    location: 'Istanbul',
    rating: 4.8,
    reviews: 94,
    halal: true,
    available: true
  },
  {
    id: '3',
    title: 'Grand Bazaar Shopping & History Tour',
    image: '/images/tours/grand-bazaar.jpg',
    price: 65,
    currency: 'USD',
    duration: '2 hours',
    location: 'Istanbul',
    rating: 4.7,
    reviews: 56,
    halal: true,
    available: true
  }
]

export default function GuideToursGrid({ guideId }: { guideId: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_TOURS.map((tour) => (
        <Link
          key={tour.id}
          href={`/tours/${tour.id}`}
          className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
        >
          <div className="relative h-48">
            <Image src={tour.image} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            {tour.halal && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                <Leaf className="w-3 h-3" />
                Halal
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tour.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <MapPin className="w-3 h-3" />
              <span>{tour.location}</span>
              <Clock className="w-3 h-3 ml-2" />
              <span>{tour.duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-gray-900 dark:text-white">{tour.rating}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">({tour.reviews})</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${tour.price}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}