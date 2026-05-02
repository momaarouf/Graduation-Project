import PageLayout from '@/src/components/layout/PageLayout'

export default function MessagesInboxLoading() {
  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 surface-section rounded-lg" />
            <div className="h-7 w-40 surface-section rounded" />
          </div>
          <div className="surface-card border border-theme rounded-xl overflow-hidden">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="p-4 border-b border-theme last:border-0 flex items-center gap-3">
                <div className="w-10 h-10 surface-section rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-36 surface-section rounded" />
                  <div className="h-3 w-52 surface-section rounded" />
                </div>
                <div className="h-3 w-12 surface-section rounded flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
