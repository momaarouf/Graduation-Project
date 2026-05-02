export default function TravelerProfileLoading() {
  return (
    <div className="animate-pulse max-w-2xl space-y-6">
      <div className="h-7 w-32 surface-section rounded" />
      <div className="surface-card border border-theme rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 surface-section rounded-full" />
          <div className="space-y-2">
            <div className="h-5 w-32 surface-section rounded" />
            <div className="h-4 w-24 surface-section rounded" />
          </div>
        </div>
        {[1,2,3,4].map(i => (
          <div key={i} className="space-y-1">
            <div className="h-4 w-24 surface-section rounded" />
            <div className="h-10 surface-section rounded-lg" />
          </div>
        ))}
        <div className="h-11 surface-section rounded-lg" />
      </div>
    </div>
  )
}
