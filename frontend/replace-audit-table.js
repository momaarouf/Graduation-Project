const fs = require('fs');
const file = 'c:/Users/10User/Documents/GitHub/Graduation-Project/frontend/app/dashboard/admin/audit/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add AuditCard component
const cardComponent = `
// ==================== MOBILE CARD ====================
function AuditCard({ event }: { event: AuditEventResponse }) {
  return (
    <div className="surface-card rounded-xl border border-theme p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-theme-muted" />
          <span className="text-xs font-medium text-theme-secondary">
            {new Date(event.createdAtUtc).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
        <div className="inline-block px-2 py-1 rounded surface-section text-[10px] font-bold text-theme-muted uppercase">
          {event.targetType} #{event.targetId}
        </div>
      </div>
      
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center text-[11px] font-bold text-primary-light dark:text-primary-dark border border-primary-light/30">
          {event.adminEmail?.[0]?.toUpperCase() || 'S'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-theme-primary truncate">
            {event.adminEmail?.split('@')[0] || 'System'}
          </p>
          <div className="mt-1">
            <ActionBadge action={event.action} />
          </div>
        </div>
      </div>
      
      <div className="p-3 surface-section rounded-lg border border-theme/50">
        <p className="text-xs text-theme-secondary italic leading-relaxed">
          "{event.summary}"
        </p>
        {event.detailsJson && (
          <div className="mt-2 pt-2 border-t border-theme-strong text-[10px] text-theme-muted font-mono whitespace-pre-wrap break-all">
            {event.detailsJson}
          </div>
        )}
      </div>
    </div>
  )
}
`;

content = content.replace('// ==================== AUDIT PAGE ====================', cardComponent + '\n// ==================== AUDIT PAGE ====================');

// Replace table start
const tableStart = /{\/\* Main Table Container \*\/}\n\s*<div className=\"surface-card rounded-2xl border border-theme shadow-sm overflow-hidden\">\n\s*<div className=\"overflow-x-auto\">/;

const newLayout = `{/* Mobile Cards (< lg) */}
  <div className="lg:hidden space-y-4">
    {isLoading ? (
      Array(pageSize).fill(0).map((_, i) => (
        <div key={i} className="h-32 surface-section animate-pulse rounded-xl" />
      ))
    ) : filteredEvents.length > 0 ? (
      filteredEvents.map(event => <AuditCard key={event.id} event={event} />)
    ) : (
      <div className="py-12 text-center surface-card rounded-xl border border-theme">
        <History className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-theme-muted text-sm font-medium">No audit events found.</p>
      </div>
    )}
  </div>

  {/* Desktop Table (lg+) */}
  <div className="hidden lg:block surface-card rounded-2xl border border-theme shadow-sm overflow-hidden">
  <div className="overflow-x-auto">`;

content = content.replace(tableStart, newLayout);

fs.writeFileSync(file, content);
console.log('Done');
