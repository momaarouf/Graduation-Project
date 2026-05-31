import PageLayout from '@/src/components/layout/PageLayout'

export default function ToursLoading() {
  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen surface-base">
        <div className="flex">
          {/* Sidebar skeleton — desktop only */}
          <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0 border-r border-[#c8d8f8] dark:border-[#1a3566] animate-pulse">
            <div className="p-6 space-y-6">
              <div className="h-5 w-20 surface-section rounded" />
              {[1,2,3,4].map(i => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-24 surface-section rounded" />
                  {[1,2,3].map(j => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-4 h-4 surface-section rounded" />
                      <div className="h-3 w-28 surface-section rounded" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 container-safe py-6 animate-pulse">
            {/* Search bar */}
            <div className="h-12 surface-section rounded-xl mb-6" />
            {/* Results count */}
            <div className="h-4 w-32 surface-section rounded mb-5" />
            {/* Tour card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="surface-card border border-theme rounded-xl overflow-hidden">
                  <div className="aspect-[16/10] surface-section" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 surface-section rounded" />
                    <div className="h-4 w-1/2 surface-section rounded" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-6 w-16 surface-section rounded" />
                      <div className="h-8 w-24 surface-section rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
