// ============================================================================
// TOUR DETAIL - NOT FOUND (404)
// ============================================================================
// LOCATION: /frontend/src/app/tours/[id]/not-found.tsx
// 
// PURPOSE: Display when a tour ID doesn't exist or is unavailable
// 
// WHY THIS FILE EXISTS:
// ---------------------
// 1. Next.js 15+ automatically shows this when notFound() is called
// 2. Better UX than a generic error page
// 3. SEO-friendly (returns proper 404 status)
// 4. Provides alternative tours to keep users engaged
// ============================================================================

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageLayout from '@/src/components/layout/PageLayout'
import { 
  Compass, 
  Search, 
  Home, 
  ArrowLeft,
  MapPin,
  Sparkles
} from 'lucide-react'

export default function TourNotFound() {
  const router = useRouter()

  // ========================================
  // SUGGESTED ACTIONS
  // ========================================
  const suggestions = [
    {
      icon: Search,
      label: 'Browse all tours',
      href: '/tours',
      color: 'blue'
    },
    {
      icon: MapPin,
      label: 'Explore destinations',
      href: '/tours?sort=popular',
      color: 'emerald'
    },
    {
      icon: Sparkles,
      label: 'Halal experiences',
      href: '/tours?halal=true',
      color: 'amber'
    }
  ]

  return (
    <PageLayout>
      {/* ========================================
          PAGE OFFSET - Matches actual page
          ======================================== */}
      <div className="pt-14 sm:pt-16">
        <div className="container-safe mx-auto max-w-7xl">
          
          {/* ========================================
              CENTERED 404 CONTENT
              ======================================== */}
          <div className="min-h-[70vh] flex items-center justify-center py-12">
            <div className="max-w-2xl w-full text-center space-y-8">
              {/* ========================================
                  ILLUSTRATION / ICON
                  ======================================== */}
              <div className="relative inline-flex items-center justify-center mx-auto">
                {/* Background glow */}
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 scale-150" />
                
                {/* Main icon */}
                <div className="relative w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-xl">
                  <Compass className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                </div>

                {/* 404 badge */}
                <div className="absolute -bottom-2 -right-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white font-bold text-lg rounded-full shadow-lg">
                  404
                </div>
              </div>

              {/* ========================================
                  ERROR MESSAGE
                  ======================================== */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                  Tour Not Found
                </h1>
                
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  The tour you're looking for doesn't exist or has been removed by the guide.
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  Check the URL and try again
                </div>
              </div>

              {/* ========================================
                  SUGGESTED TOURS
                  ======================================== */}
              <div className="space-y-4 pt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Discover instead
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon
                    
                    return (
                      <Link
                        key={index}
                        href={suggestion.href}
                        className={`group flex flex-col items-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-${suggestion.color}-50 dark:bg-${suggestion.color}-900/20 text-${suggestion.color}-600 dark:text-${suggestion.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                          {suggestion.label}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* ========================================
                  ACTION BUTTONS
                  ======================================== */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-8">
                <Link
                  href="/tours"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Search className="w-4 h-4" />
                  Browse Tours
                </Link>

                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
              </div>

              {/* ========================================
                  SEARCH FORM
                  ======================================== */}
              <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                <form
                  action="/tours"
                  method="GET"
                  className="flex gap-2 max-w-md mx-auto"
                >
                  <input
                    type="text"
                    name="q"
                    placeholder="Search for tours..."
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

// ============================================================================
// SEO NOTES:
// ============================================================================
// 
// 1. Next.js automatically sets HTTP status code to 404
// 2. Noindex meta tag is automatically added
// 3. Provides alternative content to keep users engaged
// 4. Internal search helps users find what they need
// ============================================================================