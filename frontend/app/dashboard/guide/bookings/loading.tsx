export default function GuideBookingsLoading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-7 w-36 surface-section rounded" />
      <div className="flex gap-2 border-b border-theme pb-1">
        {[1,2,3].map(i => <div key={i} className="h-9 w-28 surface-section rounded-t-lg" />)}
      </div>
      <div className="space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="surface-card border border-theme rounded-xl p-4 flex gap-4">
            <div className="w-20 h-16 surface-section rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-44 surface-section rounded" />
              <div className="h-4 w-32 surface-section rounded" />
              <div className="h-3 w-20 surface-section rounded" />
            </div>
            <div className="flex-shrink-0 space-y-2">
              <div className="h-6 w-24 surface-section rounded-full" />
              <div className="h-8 w-24 surface-section rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
