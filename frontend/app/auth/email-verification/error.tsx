'use client';

import { useEffect } from 'react';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function EmailVerificationError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
        <div className="flex items-start space-x-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error.message || 'Something went wrong with email verification.'}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={reset}
          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          Try Again
        </button>
        <Link
          href="/auth/login"
          className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </div>
    </div>
  );
}
