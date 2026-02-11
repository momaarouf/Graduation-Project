// ============================================================================
// PAGE LAYOUT COMPONENT - CLEAN, SINGLE RESPONSIBILITY
// ============================================================================
// LOCATION: /frontend/src/components/layout/PageLayout.tsx
// 
// PURPOSE: Provide consistent layout structure for ALL pages
// 
// 🔴 CRITICAL FIX (2026-02-11):
// ==============================
// PROBLEM: Tours page had TWO competing layouts:
//   1. PageLayout added pt-14/pt-16 for navbar
//   2. Tours page added its own h-[calc(100vh-4rem)] layout
// 
// RESULT: Double padding, overflow issues, black bars on sides
// 
// SOLUTION:
// ---------
// PageLayout now does ONE thing: provides the navbar and footer.
// It NO LONGER adds padding or container classes.
// 
// Each page is responsible for its own layout structure.
// This gives maximum flexibility while maintaining consistency.
// 
// USAGE:
// <PageLayout>
//   <YourPageContent /> {/* Page handles its own padding/spacing */}
// </PageLayout>
// ============================================================================

'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: ReactNode
  /** Optional: Hide footer on certain pages (e.g., checkout) */
  hideFooter?: boolean
}

export default function PageLayout({ 
  children, 
  hideFooter = false 
}: PageLayoutProps) {
  return (
    // ========================================
    // MINIMAL LAYOUT CONTAINER
    // ========================================
    // 
    // WHAT IT DOES:
    // - Provides Navigation bar at top
    // - Provides Footer at bottom (optional)
    // - Uses flex col to push footer down
    // - NO PADDING, NO CONTAINERS, NO MARGINS
    // 
    // WHAT IT DOES NOT DO:
    // - ❌ No pt-14/pt-16 (page handles this)
    // - ❌ No container-safe (page handles this)
    // - ❌ No max-width constraints (page handles this)
    // ========================================
    <div className="
      min-h-screen 
      w-full 
      flex flex-col 
      bg-white dark:bg-gray-950
    ">
      {/* Navigation - fixed position, no layout impact */}
      <Navigation />
      
      {/* 
        ========================================
        MAIN CONTENT AREA
        ========================================
        
        🔴 CRITICAL: NO PADDING TOP HERE!
        
        The Navigation component is position: fixed.
        Pages MUST add their own pt-14/sm:pt-16 to offset the navbar.
        
        WHY? Because different pages need different layouts:
        - Tours page: Full viewport height with scrolling sidebar
        - Guide profile: Hero section that overlaps navbar
        - Checkout: Centered card with no scrolling
        
        Each page knows its own layout best.
        ========================================
      */}
      <main className="flex-1 w-full">
        {children}
      </main>
      
      {/* 
        ========================================
        FOOTER - Optional
        ========================================
        
        Some pages (checkout, auth) don't need a footer.
        Hide it via hideFooter prop.
      */}
      {!hideFooter && (
        <footer className="
          py-6 
          bg-gray-50 dark:bg-gray-900 
          border-t border-gray-200 dark:border-gray-800
        ">
          <div className="container-safe mx-auto text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} SafariHub Travel Marketplace
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}

// ============================================================================
// USAGE GUIDE:
// ============================================================================
// 
// ✅ CORRECT USAGE (Tours Page):
// <PageLayout>
//   <div className="pt-14 sm:pt-16"> {/* Page adds its own padding */}
//     {/* Page content */}
//   </div>
// </PageLayout>
// 
// ✅ CORRECT USAGE (Home Page):
// <PageLayout>
//   <HeroSection /> {/* Hero has its own padding, no pt needed */}
// </PageLayout>
// 
// ✅ CORRECT USAGE (Checkout):
// <PageLayout hideFooter>
//   <div className="pt-14 sm:pt-16">
//     {/* Checkout content, no footer */}
//   </div>
// </PageLayout>
// 
// ❌ INCORRECT USAGE (What caused the black bars):
// <PageLayout>
//   <div className="pt-14 sm:pt-16">
//     <div className="h-[calc(100vh-4rem)]"> {/* DON'T NEST FIXED HEIGHTS */}
// ============================================================================