export default function TravelerDisputesLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-32 surface-section rounded" />
      {[1,2,3].map(i => (
        <div key={i} className="surface-card border border-theme rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 surface-section rounded" />
            <div className="h-6 w-20 surface-section rounded-full" />
          </div>
          <div className="h-4 w-full surface-section rounded" />
          <div className="h-4 w-3/4 surface-section rounded" />
        </div>
      ))}
    </div>
  )
}
