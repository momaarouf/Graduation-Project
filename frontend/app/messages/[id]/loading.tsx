import PageLayout from '@/src/components/layout/PageLayout'

export default function MessageThreadLoading() {
  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 h-screen flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-4 flex-1 flex flex-col animate-pulse">
          {/* Chat header */}
          <div className="flex items-center gap-3 py-4 border-b border-theme">
            <div className="w-10 h-10 surface-section rounded-full" />
            <div className="space-y-1">
              <div className="h-4 w-32 surface-section rounded" />
              <div className="h-3 w-20 surface-section rounded" />
            </div>
          </div>
          {/* Messages area */}
          <div className="flex-1 py-4 space-y-4 overflow-hidden">
            {/* Alternating sent/received bubbles */}
            <div className="flex justify-start">
              <div className="h-10 w-48 surface-section rounded-xl rounded-tl-none" />
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-36 surface-section rounded-xl rounded-tr-none" />
            </div>
            <div className="flex justify-start">
              <div className="h-16 w-64 surface-section rounded-xl rounded-tl-none" />
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-52 surface-section rounded-xl rounded-tr-none" />
            </div>
            <div className="flex justify-start">
              <div className="h-10 w-40 surface-section rounded-xl rounded-tl-none" />
            </div>
          </div>
          {/* Input bar */}
          <div className="border-t border-theme py-3 flex gap-3">
            <div className="flex-1 h-11 surface-section rounded-lg" />
            <div className="w-11 h-11 surface-section rounded-lg" />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
