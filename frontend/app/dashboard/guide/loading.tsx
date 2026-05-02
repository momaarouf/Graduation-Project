export default function GuideDashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-52 surface-section rounded" />
        <div className="h-4 w-36 surface-section rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="surface-card border border-theme rounded-xl p-5 space-y-3">
            <div className="w-9 h-9 surface-section rounded-lg" />
            <div className="h-7 w-16 surface-section rounded" />
            <div className="h-3 w-20 surface-section rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="surface-card border border-theme rounded-xl p-5 space-y-3">
          <div className="h-5 w-36 surface-section rounded mb-2" />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center justify-between border-b border-theme last:border-0 pb-2">
              <div className="space-y-1">
                <div className="h-4 w-36 surface-section rounded" />
                <div className="h-3 w-24 surface-section rounded" />
              </div>
              <div className="h-6 w-16 surface-section rounded-full" />
            </div>
          ))}
        </div>
        <div className="surface-card border border-theme rounded-xl p-5 space-y-3">
          <div className="h-5 w-28 surface-section rounded mb-2" />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 border-b border-theme last:border-0 pb-2">
              <div className="w-12 h-10 surface-section rounded-lg" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-40 surface-section rounded" />
                <div className="h-3 w-24 surface-section rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
