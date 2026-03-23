// ============================================================================
// ROOT LAYOUT - WITH FILTER PROVIDER (OPTIONAL)
// ============================================================================
// LOCATION: /frontend/src/app/layout.tsx
// 
// PURPOSE: Provide filter context to all pages that need it
// 
// DECISION: Add FilterProvider at root level so filter state persists
// across navigation between tours page and other filter-enabled pages
// ============================================================================

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/src/lib/providers/ThemeProvider'
import { FilterProvider } from '@/src/lib/contexts/FilterContext'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import Footer from '@/src/components/layout/Footer'
import { AuthProvider } from '@/src/lib/contexts/AuthContext'
import { WishlistProvider } from '@/src/lib/contexts/WishlistContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'SafariHub | Travel Marketplace',
  description: 'Connect with verified local guides for authentic experiences in Lebanon and Turkey',
  keywords: ['travel', 'guides', 'tours', 'Lebanon', 'Turkey', 'halal', 'adventure'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans antialiased ${inter.className}`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {/* ========================================
              FILTER PROVIDER - Now at root level
              ========================================
              This makes filter state available to ALL pages
              If you only need filters on /tours, you can keep it there
              I recommend root level for future expansion (guides page, etc.)
          */}
          <AuthProvider>
          <WishlistProvider>
          <FilterProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#111827',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                },
                className: 'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
              }}
            />
            <Footer />
          </FilterProvider>
          </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}