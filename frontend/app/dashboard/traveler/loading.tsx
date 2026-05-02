export default function TravelerDashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Greeting */}
      <div className="space-y-2">
        <div className="h-7 w-56 surface-section rounded" />
        <div className="h-4 w-40 surface-section rounded" />
      </div>
      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="surface-card border border-theme rounded-xl p-5 space-y-3">
            <div className="w-9 h-9 surface-section rounded-lg" />
            <div className="h-7 w-16 surface-section rounded" />
            <div className="h-3 w-20 surface-section rounded" />
          </div>
        ))}
      </div>
      {/* Upcoming trip card */}
      <div className="surface-card border border-theme rounded-xl p-5">
        <div className="h-5 w-36 surface-section rounded mb-4" />
        <div className="flex gap-4">
          <div className="w-24 h-20 surface-section rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/2 surface-section rounded" />
            <div className="h-4 w-1/3 surface-section rounded" />
            <div className="h-4 w-40 surface-section rounded" />
          </div>
        </div>
      </div>
      {/* Recent bookings */}
      <div className="surface-card border border-theme rounded-xl overflow-hidden">
        <div className="p-4 border-b border-theme">
          <div className="h-5 w-32 surface-section rounded" />
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="p-4 border-b border-theme last:border-0 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-40 surface-section rounded" />
              <div className="h-3 w-28 surface-section rounded" />
            </div>
            <div className="h-6 w-20 surface-section rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
