// ============================================================================
// LOGIN PAGE - LOADING SKELETON
// ============================================================================
// LOCATION: /frontend/src/app/auth/login/loading.tsx
// 
// PURPOSE: Display loading skeleton while page loads
// ============================================================================

export default function LoginLoading() {
    return (
        <div className="w-full max-w-md mx-auto animate-pulse">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6 sm:p-8">
                
                {/* Header Skeleton */}
                <div className="text-center mb-6">
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-2" />
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto" />
                </div>

                {/* Email Field Skeleton */}
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    </div>

                    {/* Password Field Skeleton */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    </div>

                    {/* Remember Me Skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>

                    {/* Button Skeleton */}
                    <div className="h-11 bg-gray-200 dark:bg-gray-800 rounded-lg" />

                    {/* Divider Skeleton */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <div className="relative flex justify-center">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                    </div>

                    {/* Social Buttons Skeleton */}
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}