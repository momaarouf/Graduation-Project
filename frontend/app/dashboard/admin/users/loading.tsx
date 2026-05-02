export default function AdminUsersLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 surface-section rounded" />
        <div className="h-10 w-64 surface-section rounded-lg" />
      </div>
      <div className="surface-card border border-theme rounded-xl overflow-hidden">
        <div className="h-12 surface-section border-b border-theme" />
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} className="px-4 py-3 border-b border-theme last:border-0 flex items-center gap-4">
            <div className="w-8 h-8 surface-section rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-40 surface-section rounded" />
              <div className="h-3 w-32 surface-section rounded" />
            </div>
            <div className="h-6 w-16 surface-section rounded-full" />
            <div className="h-6 w-16 surface-section rounded-full" />
            <div className="w-8 h-8 surface-section rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
