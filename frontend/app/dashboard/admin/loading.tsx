export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-48 surface-section rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="surface-card border border-theme rounded-xl p-5 space-y-2">
            <div className="w-8 h-8 surface-section rounded-lg" />
            <div className="h-7 w-16 surface-section rounded" />
            <div className="h-3 w-24 surface-section rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1,2].map(i => (
          <div key={i} className="surface-card border border-theme rounded-xl overflow-hidden">
            <div className="h-12 surface-section border-b border-theme" />
            {[1,2,3].map(j => (
              <div key={j} className="p-4 border-b border-theme last:border-0 flex justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-36 surface-section rounded" />
                  <div className="h-3 w-24 surface-section rounded" />
                </div>
                <div className="h-6 w-20 surface-section rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
