import PageLayout from '@/src/components/layout/PageLayout'

export default function BookingConfirmationLoading() {
  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen surface-base flex items-center justify-center">
        <div className="container-safe mx-auto max-w-2xl py-12 animate-pulse">
          <div className="surface-card border border-theme rounded-xl p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 surface-section rounded-full mx-auto" />
              <div className="h-8 w-64 surface-section rounded mx-auto" />
              <div className="h-4 w-48 surface-section rounded mx-auto" />
            </div>
            <div className="border-t border-theme pt-5 grid grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-20 surface-section rounded" />
                  <div className="h-5 w-32 surface-section rounded" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <div className="flex-1 h-11 surface-section rounded-lg" />
              <div className="flex-1 h-11 surface-section rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
