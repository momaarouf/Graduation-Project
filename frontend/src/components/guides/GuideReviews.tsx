'use client'

import { Star, User } from 'lucide-react'
import Image from 'next/image'

// Mock data - replace with API call
const MOCK_REVIEWS = [
  {
    id: '1',
    traveler: {
      name: 'Ahmed Khan',
      avatar: '/images/travelers/ahmed.jpg',
      location: 'UAE'
    },
    rating: 5,
    date: '2 weeks ago',
    comment: 'Mehmet was an exceptional guide! His knowledge of Ottoman history is deep, and he made sure we had time for prayers. Truly a 5-star experience.',
    tour: 'Ottoman Heritage Tour'
  },
  {
    id: '2',
    traveler: {
      name: 'Fatima Al-Zahra',
      avatar: '/images/travelers/fatima.jpg',
      location: 'UK'
    },
    rating: 5,
    date: '1 month ago',
    comment: 'As a solo female traveler, I appreciated Mehmet\'s professionalism. The halal food recommendations were excellent.',
    tour: 'Ottoman Heritage Tour'
  },
  {
    id: '3',
    traveler: {
      name: 'Omar Farooq',
      avatar: '/images/travelers/omar.jpg',
      location: 'Canada'
    },
    rating: 4,
    date: '2 months ago',
    comment: 'Great tour overall. Mehmet knows his history well. The only reason for 4 stars is that the lunch spot was crowded.',
    tour: 'Bosphorus Cruise'
  }
]

export default function GuideReviews({ guideId }: { guideId: string }) {
  return (
    <div className="space-y-4">
      {MOCK_REVIEWS.map((review) => (
        <div key={review.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              {review.traveler.avatar ? (
                <Image src={review.traveler.avatar} alt={review.traveler.name} width={40} height={40} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {review.traveler.name}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {review.date}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {review.traveler.location} · {review.tour}
              </p>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {review.comment}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}