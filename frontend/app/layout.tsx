// ============================================================================
// ROOT LAYOUT - DUAL THEME FOUNDATION
// ============================================================================
// LOCATION: /frontend/src/app/layout.tsx
// 
// PURPOSE: 
// 1. Wraps entire app with ThemeProvider
// 2. Sets up base HTML structure
// 3. Provides toast notifications
// 4. Prevents hydration mismatch
// 
// IMPORTANT: suppressHydrationWarning is REQUIRED for next-themes
// ============================================================================

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/src/lib/providers/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import './globals.css'

// Load Inter font with Next.js optimization
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

// SEO metadata
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
      // ============================================
      // CRITICAL: Prevents hydration mismatch
      // ============================================
      suppressHydrationWarning
    >
      <body
        // ============================================
        // BASE STYLES FOR DUAL THEME
        // These provide fallback colors that will be
        // overridden by ThemeProvider
        // ============================================
        className={`min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans antialiased ${inter.className}`}
        // Prevent hydration mismatch from extensions (Grammarly, etc.)
        suppressHydrationWarning
      >
        {/* 
          ============================================
          THEME PROVIDER - ENABLES DARK MODE SWITCHING
          ============================================
          This component:
          1. Adds .dark class to <html> for dark mode
          2. Manages theme persistence
          3. Handles system preference
        */}
        <ThemeProvider>
          {children}

          {/* 
            ============================================
            TOAST NOTIFICATIONS - DUAL THEME SUPPORT
            ============================================
            Toast notifications automatically adapt
            to light/dark mode
          */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                // Light mode toast style
                background: '#ffffff',
                color: '#111827',
                fontSize: '14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
              // Dark mode style (applied automatically by next-themes)
              className: 'dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}