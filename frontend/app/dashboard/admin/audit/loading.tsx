export default function AdminAuditLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-7 w-28 surface-section rounded" />
        <div className="h-10 w-48 surface-section rounded-lg" />
      </div>
      <div className="surface-card border border-theme rounded-xl overflow-hidden">
        <div className="h-12 surface-section border-b border-theme" />
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="px-4 py-3 border-b border-theme last:border-0 flex items-center gap-4">
            <div className="h-4 w-28 surface-section rounded flex-shrink-0" />
            <div className="h-4 w-20 surface-section rounded flex-shrink-0" />
            <div className="flex-1 h-4 surface-section rounded" />
            <div className="h-4 w-24 surface-section rounded flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
