export default function ForgotPasswordLoading() {
  return (
    <div className="container-safe mx-auto max-w-6xl pt-20 sm:pt-24 pb-8 sm:pb-12 animate-pulse">
      <div className="mb-6">
        <div className="h-4 w-32 surface-section rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column - Info (Desktop) */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="h-7 w-40 surface-section rounded-full" />
            <div className="h-10 w-64 surface-section rounded-lg" />
            <div className="h-5 w-80 surface-section rounded" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 surface-section rounded-xl" />
            ))}
          </div>
          <div className="h-16 surface-section rounded-lg" />
        </div>

        {/* Right Column - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="surface-card border border-theme rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2 mb-4">
              <div className="h-4 w-24 surface-section rounded" />
              <div className="h-11 surface-section rounded-lg" />
            </div>
            <div className="h-11 surface-section rounded-lg" />
            <div className="h-4 w-40 surface-section rounded mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
