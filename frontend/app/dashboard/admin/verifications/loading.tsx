export default function AdminVerificationsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-48 surface-section rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {[1,2,3].map(i => (
          <div key={i} className="surface-card border border-theme rounded-xl p-4 space-y-1">
            <div className="h-6 w-10 surface-section rounded" />
            <div className="h-3 w-20 surface-section rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="surface-card border border-theme rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 surface-section rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-36 surface-section rounded" />
              <div className="h-4 w-24 surface-section rounded" />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div className="h-9 w-24 surface-section rounded-lg" />
              <div className="h-9 w-24 surface-section rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
