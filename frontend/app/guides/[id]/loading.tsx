import PageLayout from '@/src/components/layout/PageLayout'

export default function GuideProfileLoading() {
  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 surface-base animate-pulse">
        <div className="container-safe mx-auto max-w-6xl py-8">
          {/* Guide header */}
          <div className="surface-card border border-theme rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-24 h-24 surface-section rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-7 w-48 surface-section rounded" />
                <div className="h-4 w-32 surface-section rounded" />
                <div className="flex gap-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-4 w-20 surface-section rounded" />
                  ))}
                </div>
                <div className="h-4 w-full surface-section rounded" />
                <div className="h-4 w-3/4 surface-section rounded" />
              </div>
            </div>
          </div>
          {/* Tours grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="surface-card border border-theme rounded-xl overflow-hidden">
                <div className="aspect-[16/10] surface-section" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 surface-section rounded" />
                  <div className="h-4 w-1/2 surface-section rounded" />
                  <div className="h-8 w-full surface-section rounded-lg mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
