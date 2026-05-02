export default function TravelerSettingsLoading() {
  return (
    <div className="animate-pulse max-w-2xl space-y-5">
      <div className="h-7 w-28 surface-section rounded" />
      {[1,2,3].map(i => (
        <div key={i} className="surface-card border border-theme rounded-xl p-5 space-y-4">
          <div className="h-5 w-40 surface-section rounded" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-48 surface-section rounded" />
              <div className="h-3 w-64 surface-section rounded" />
            </div>
            <div className="w-12 h-6 surface-section rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
