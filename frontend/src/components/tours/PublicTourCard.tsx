'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PublicTourCardResponse } from '@/src/lib/types/tour.types'
import { useWishlist } from '@/src/lib/contexts/WishlistContext'
import { TourCard } from '@/src/components/ui/tour-card'

export interface PublicTourCardProps {
    tour: PublicTourCardResponse;
    showHint?: boolean;
}

export default function PublicTourCard({ tour, showHint = false }: PublicTourCardProps) {
    const router = useRouter()
    const { isFavorited, toggleFavorite } = useWishlist()
    const isLiked = isFavorited(tour.id)

    // Format Logic
    const formatPrice = (amount: number, currency: string) => {
        if (currency === 'USD') return `$${amount}`
        if (currency === 'TRY') return `₺${amount}`
        return `${amount} ${currency}`
    }

    const nextDateFormatted = tour.nextOccurrenceStartUtc 
        ? new Date(tour.nextOccurrenceStartUtc).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : "TBA"

    const handleBookNow = () => {
        router.push(`/tours/${tour.id}`)
    }

    const handleLike = () => {
        toggleFavorite(tour.id)
    }

    return (
      <Link href={`/tours/${tour.id}`} className="block h-full cursor-default">
        <TourCard
          id={tour.id.toString()}
          imageUrl={tour.coverImageUrl || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"}
          category={tour.category || tour.region || "Adventure"}
          title={tour.title}
          location={tour.locationName || tour.city || tour.region || "Lebanon"}
          rating={tour.averageRating || 5.0}
          reviewCount={tour.reviewCount || 0}
          nextDate={nextDateFormatted}
          price={formatPrice(tour.basePrice, tour.currency)}
          pricePeriod={" / person"}
          isLiked={isLiked}
          onLike={handleLike}
          onBookNow={handleBookNow}
          showHint={showHint}
        />
      </Link>
    )
}
