// ============================================================================
// TRAVELER DASHBOARD - WISHLIST
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/traveler/wishlist/page.tsx
// 
// PURPOSE: Dashboard-integrated wishlist for travelers
// ============================================================================

import WishlistContent from '@/src/components/wishlist/WishlistContent'

export default function TravelerWishlistPage() {
  return (
    <div className="flex-1 overflow-y-auto chat-scrollbar">
      <div className="p-4 sm:p-6 lg:p-8">
        <WishlistContent />
      </div>
    </div>
  )
}
