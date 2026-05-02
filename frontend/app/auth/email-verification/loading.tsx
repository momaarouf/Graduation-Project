export default function EmailVerificationLoading() {
  return (
    <div className="container-safe mx-auto max-w-6xl pt-20 sm:pt-24 pb-8 sm:pb-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div className="h-4 w-32 surface-section rounded mb-6" />
          <div className="surface-card border border-theme rounded-xl p-6 sm:p-8">
            <div className="text-center mb-6 space-y-2">
              <div className="h-14 w-14 surface-section rounded-2xl mx-auto" />
              <div className="h-8 w-48 surface-section rounded-lg mx-auto" />
              <div className="h-4 w-64 surface-section rounded-lg mx-auto" />
            </div>
            <div className="space-y-4">
              <div className="h-4 w-28 surface-section rounded" />
              <div className="h-12 surface-section rounded-xl" />
              <div className="h-12 surface-section rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Column - Info (Desktop) */}
        <div className="hidden lg:block space-y-12">
          <div className="h-24 surface-section rounded-2xl" />
          <div className="space-y-4">
            <div className="h-5 w-40 surface-section rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 surface-section rounded-full" />
                  <div className="h-4 w-48 surface-section rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="text-center space-y-2">
                <div className="h-8 w-16 surface-section rounded mx-auto" />
                <div className="h-3 w-20 surface-section rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
