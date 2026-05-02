import PageLayout from '@/src/components/layout/PageLayout'

export default function GuidesLoading() {
  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 surface-base">
        <div className="container-safe mx-auto max-w-7xl py-10 animate-pulse">
          <div className="h-8 w-48 surface-section rounded-lg mb-2" />
          <div className="h-4 w-72 surface-section rounded mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="surface-card border border-theme rounded-xl p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 surface-section rounded-full" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 surface-section rounded" />
                    <div className="h-4 w-20 surface-section rounded" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 w-full surface-section rounded" />
                  <div className="h-3 w-4/5 surface-section rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 surface-section rounded-full" />
                  <div className="h-6 w-20 surface-section rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
