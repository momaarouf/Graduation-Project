export default function LoginLoading() {
  return (
    <div className="container-safe mx-auto max-w-xl min-h-[90vh] flex flex-col justify-center py-12 px-4 animate-pulse">
      <div className="mb-8">
        <div className="h-5 w-32 surface-section rounded" />
      </div>
      
      <div className="text-center mb-10 space-y-4">
        <div className="h-6 w-32 surface-section rounded-full mx-auto" />
        <div className="h-10 w-64 surface-section rounded-lg mx-auto" />
        <div className="h-4 w-72 surface-section rounded mx-auto" />
      </div>

      <div className="surface-card border border-theme rounded-2xl p-6 sm:p-8 space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-24 surface-section rounded" />
            <div className="h-11 surface-section rounded-lg" />
          </div>
        ))}
        <div className="flex justify-between">
          <div className="h-4 w-32 surface-section rounded" />
          <div className="h-4 w-28 surface-section rounded" />
        </div>
        <div className="h-11 surface-section rounded-lg" />
      </div>

      <div className="mt-8 text-center">
        <div className="h-4 w-56 surface-section rounded mx-auto" />
      </div>
    </div>
  )
}