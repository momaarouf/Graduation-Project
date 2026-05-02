export default function GuideTourDetailLoading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-4 w-24 surface-section rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-[16/9] surface-section rounded-xl" />
          <div className="surface-card border border-theme rounded-xl p-5 space-y-3">
            <div className="h-7 w-2/3 surface-section rounded" />
            <div className="h-4 w-full surface-section rounded" />
            <div className="h-4 w-45 surface-section rounded" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[1,2,3].map(i => <div key={i} className="h-10 surface-section rounded-lg" />)}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="surface-card border border-theme rounded-xl p-5 space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 surface-section rounded" />
                <div className="h-4 w-20 surface-section rounded" />
              </div>
            ))}
          </div>
          <div className="h-11 surface-section rounded-lg" />
          <div className="h-11 surface-section rounded-lg" />
        </div>
      </div>
    </div>
  )
}
