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
import ConditionalFooter from '@/src/components/layout/ConditionalFooter'
import MobileBottomNav from '@/src/components/layout/MobileBottomNav'
import { AuthProvider } from '@/src/lib/contexts/AuthContext'
import { WishlistProvider } from '@/src/lib/contexts/WishlistContext'
import { Suspense } from 'react'
import GlobalConfirmDialog from '@/src/components/ui/GlobalConfirmDialog'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({
 subsets: ['latin'],
 variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Tourongo | Travel Marketplace',
  description: 'Connect with verified local guides for authentic experiences worldwide',
  keywords: ['travel', 'guides', 'tours', 'global', 'worldwide', 'halal', 'adventure'],
  openGraph: {
    title: 'Tourongo | Travel Marketplace',
    description: 'Connect with verified local guides for authentic experiences worldwide',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tourongo Travel Marketplace',
      },
    ],
  },
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
 className={`min-h-screen surface-base text-theme-primary font-sans antialiased md:pb-0 ${inter.className}`}
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
 color: '#0a1628',
 fontSize: '14px',
 borderRadius: '8px',
 border: '1px solid #c8d8f8',
 boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.08)',
 },
 className: 'dark:!bg-[#0c1f3d] dark:!text-[#dbeafe] dark:!border-[#112240]',
 }}
 />
 <ConditionalFooter />
 <Suspense fallback={null}>
  <MobileBottomNav />
 </Suspense>
 <GlobalConfirmDialog />
 </FilterProvider>
 </WishlistProvider>
 </AuthProvider>
 </ThemeProvider>
 <Analytics />
 </body>
 </html>
 )
}
