export default function GuideWalletLoading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-7 w-32 surface-section rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="surface-card border border-theme rounded-xl p-5 space-y-2">
            <div className="h-4 w-24 surface-section rounded" />
            <div className="h-8 w-28 surface-section rounded" />
          </div>
        ))}
      </div>
      <div className="surface-card border border-theme rounded-xl p-5 space-y-3">
        <div className="h-11 surface-section rounded-lg" />
      </div>
      <div className="surface-card border border-theme rounded-xl overflow-hidden">
        <div className="h-12 surface-section border-b border-theme" />
        {[1,2,3,4].map(i => (
          <div key={i} className="p-4 border-b border-theme last:border-0 flex justify-between items-center">
            <div className="space-y-1">
              <div className="h-4 w-36 surface-section rounded" />
              <div className="h-3 w-24 surface-section rounded" />
            </div>
            <div className="h-5 w-24 surface-section rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
