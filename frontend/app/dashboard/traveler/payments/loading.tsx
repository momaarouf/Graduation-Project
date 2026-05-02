export default function TravelerPaymentsLoading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-7 w-36 surface-section rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="surface-card border border-theme rounded-xl p-4 space-y-2">
            <div className="h-4 w-24 surface-section rounded" />
            <div className="h-7 w-20 surface-section rounded" />
          </div>
        ))}
      </div>
      <div className="surface-card border border-theme rounded-xl overflow-hidden">
        <div className="h-12 surface-section border-b border-theme" />
        {[1,2,3,4,5].map(i => (
          <div key={i} className="p-4 border-b border-theme last:border-0 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-40 surface-section rounded" />
              <div className="h-3 w-24 surface-section rounded" />
            </div>
            <div className="h-5 w-20 surface-section rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
