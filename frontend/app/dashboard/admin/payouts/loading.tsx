export default function AdminPayoutsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-32 surface-section rounded" />
      <div className="surface-card border border-theme rounded-xl overflow-hidden">
        <div className="h-12 surface-section border-b border-theme" />
        {[1,2,3,4,5].map(i => (
          <div key={i} className="p-4 border-b border-theme last:border-0 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-36 surface-section rounded" />
              <div className="h-3 w-24 surface-section rounded" />
            </div>
            <div className="h-5 w-20 surface-section rounded" />
            <div className="h-6 w-20 surface-section rounded-full" />
            <div className="h-9 w-24 surface-section rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
