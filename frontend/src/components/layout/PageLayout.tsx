// ============================================================================
// PAGE LAYOUT COMPONENT - AUTOMATIC NAVBAR OFFSET
// ============================================================================
// LOCATION: /frontend/src/components/layout/PageLayout.tsx
// 
// PURPOSE: Automatically add padding-top to offset fixed navbar
// Use this on all pages that have the fixed Navigation component
// ============================================================================

'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export default function PageLayout({ 
  children, 
  title, 
  subtitle 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white dark:bg-gray-950">
      <Navigation />
      
      {/* ========================================
          AUTOMATIC NAVBAR OFFSET
          - pt-14 on mobile (navbar height)
          - sm:pt-16 on desktop
          ======================================== */}
      <main className="
        flex-1
        pt-14 sm:pt-16
        w-full
      ">
        {/* Optional header section */}
        {(title || subtitle) && (
          <div className="search-container py-6 sm:py-8 md:py-10">
            {title && (
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="search-container pb-6 sm:pb-8 md:pb-10">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="search-container text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} SafariHub Travel Marketplace
          </p>
        </div>
      </footer>
    </div>
  )
}