export default function TravelerBookingDetailLoading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-4 w-32 surface-section rounded" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-44 surface-section rounded" />
          <div className="h-4 w-24 surface-section rounded" />
        </div>
        <div className="h-6 w-24 surface-section rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="surface-card border border-theme rounded-xl overflow-hidden">
            <div className="h-32 surface-section" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-3/4 surface-section rounded" />
              <div className="h-4 w-1/2 surface-section rounded" />
            </div>
          </div>
          <div className="surface-card border border-theme rounded-xl p-4 space-y-3">
            <div className="h-4 w-28 surface-section rounded" />
            <div className="flex justify-between">
              <div className="h-4 w-20 surface-section rounded" />
              <div className="h-4 w-16 surface-section rounded" />
            </div>
          </div>
        </div>
        <div className="surface-card border border-theme rounded-xl p-4 space-y-3 h-fit">
          {[1,2,3].map(i => <div key={i} className="h-10 surface-section rounded-lg" />)}
        </div>
      </div>
    </div>
  )
}
