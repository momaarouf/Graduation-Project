// ============================================================================
// WISHLIST - SAVED TOURS
// ============================================================================
// LOCATION: /frontend/src/app/wishlist/page.tsx
// 
// PURPOSE: Public entry point for the Wishlist
// ============================================================================

import PageLayout from '@/src/components/layout/PageLayout'
import WishlistContent from '@/src/components/wishlist/WishlistContent'

export default function WishlistPage() {
 return (
 <PageLayout>
 <div className="pt-20 sm:pt-24 min-h-screen bg-[#fafafa]">
 <WishlistContent />
 </div>
 </PageLayout>
 )
}