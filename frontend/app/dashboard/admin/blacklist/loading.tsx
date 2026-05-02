export default function AdminBlacklistLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-36 surface-section rounded" />
      <div className="surface-card border border-theme rounded-xl overflow-hidden">
        <div className="h-12 surface-section border-b border-theme" />
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-16 border-b border-theme last:border-0" />
        ))}
      </div>
    </div>
  )
}
