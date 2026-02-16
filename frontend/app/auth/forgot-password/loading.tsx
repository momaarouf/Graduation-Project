// ============================================================================
// FORGOT PASSWORD - LOADING SKELETON
// ============================================================================

export default function ForgotPasswordLoading() {
    return (
        <div className="w-full max-w-md mx-auto animate-pulse">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6 sm:p-8">
                
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-2" />
                    <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto" />
                </div>

                {/* Email Field */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-11 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    </div>

                    {/* Button */}
                    <div className="h-11 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                </div>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
                </div>
            </div>
        </div>
    )
}