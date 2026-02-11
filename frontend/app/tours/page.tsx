// ============================================================================
// TOURS PAGE - CLEAN VERSION WITH LAYOUT
// ============================================================================
// LOCATION: /frontend/src/app/tours/page.tsx
// ============================================================================

import SearchResultsGrid from '@/src/components/search/SearchResultsGrid'
import PageLayout from '@/src/components/layout/PageLayout'

export default function ToursPage() {
  return (
    <PageLayout
      title="Tours in Lebanon & Turkey"
      subtitle="Discover authentic experiences with verified local guides"
    >
      <SearchResultsGrid />
    </PageLayout>
  )
}