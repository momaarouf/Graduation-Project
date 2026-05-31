import PageLayout from '@/src/components/layout/PageLayout'

export default function BookingDetailLoading() {
  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen surface-base">
        <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10 animate-pulse">
          <div className="h-4 w-32 surface-section rounded mb-6" />
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-8 w-48 surface-section rounded" />
              <div className="h-4 w-24 surface-section rounded" />
            </div>
            <div className="h-7 w-24 surface-section rounded-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — 2/3 */}
            <div className="lg:col-span-2 space-y-5">
              <div className="surface-card border border-theme rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-48 h-32 surface-section" />
                  <div className="flex-1 p-5 space-y-3">
                    <div className="h-5 w-3/4 surface-section rounded" />
                    <div className="h-4 w-1/2 surface-section rounded" />
                    <div className="h-4 w-40 surface-section rounded" />
                  </div>
                </div>
              </div>
              <div className="surface-card border border-theme rounded-xl p-5 space-y-3">
                <div className="h-5 w-32 surface-section rounded" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 surface-section rounded" />
                    <div className="h-4 w-16 surface-section rounded" />
                  </div>
                  <div className="border-t border-[#c8d8f8] dark:border-[#1a3566] pt-2 flex justify-between">
                    <div className="h-5 w-12 surface-section rounded" />
                    <div className="h-6 w-20 surface-section rounded" />
                  </div>
                </div>
              </div>
            </div>
            {/* Right sidebar — 1/3 */}
            <div className="space-y-5">
              <div className="surface-card border border-theme rounded-xl p-5 space-y-3">
                <div className="h-5 w-24 surface-section rounded" />
                <div className="h-10 surface-section rounded-lg" />
                <div className="h-10 surface-section rounded-lg" />
                <div className="h-10 surface-section rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
