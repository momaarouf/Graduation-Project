// ============================================================================
// REVOKED REGISTRY - PUBLIC BLACKLIST PAGE
// ============================================================================
// LOCATION: /frontend/src/app/blacklist/page.tsx
// 
// PURPOSE: Public transparency - show banned guides to protect travelers
// 
// PRIVACY COMPLIANCE:
// ✓ No personal names - only anonymized IDs
// ✓ No contact information
// ✓ No profile photos
// ✓ No location details
// 
// SEO: noindex,nofollow (this is not for search engines)
// ============================================================================

import { Metadata } from 'next'
import PageLayout from '@/src/components/layout/PageLayout'
import RevokedRegistryClient from './RevokedRegistryClient'
import { getRevokedGuides, getBlacklistStats } from '@/src/lib/api/blacklist'

// ============================================================================
// SEO - HIDE FROM SEARCH ENGINES
// ============================================================================
export const metadata: Metadata = {
 title: 'Revoked Guides Registry | SafariHub',
 description: 'Transparency report: Guides who have been permanently removed from our platform.',
 robots: {
 index: false, // ❌ Do not index this page
 follow: false, // ❌ Do not follow links
 noarchive: true,
 nosnippet: true,
 noimageindex: true
 }
}

// ============================================================================
// SERVER COMPONENT - Initial Data Fetch
// ============================================================================
export default async function BlacklistPage() {
 // Fetch initial data on the server
 const [guidesData, stats] = await Promise.all([
 getRevokedGuides({ page: 1, limit: 10 }),
 getBlacklistStats()
 ])

 return (
 <PageLayout>
 <div className="pt-14 sm:pt-16">
 <div className="container-safe mx-auto max-w-7xl py-8 sm:py-12">
 
 {/* ========================================
 HEADER SECTION
 ======================================== */}
 <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
 {/* Warning badge */}
 <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
 </span>
 <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">
 Public Registry · Updated Daily
 </span>
 </div>

 <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-primary mb-4">
 Revoked Guides Registry
 </h1>
 
 <p className="text-sm sm:text-base text-theme-secondary max-w-2xl mx-auto">
 To protect our community, we publicly list guides who have been permanently removed 
 from SafariHub after confirmed violations. This is part of our commitment to 
 transparency and traveler safety.
 </p>
 </div>

 {/* ========================================
 CLIENT COMPONENT - Interactive table
 ======================================== */}
 <RevokedRegistryClient 
 initialGuides={guidesData.items}
 initialStats={stats}
 initialPagination={{
 page: guidesData.page,
 total: guidesData.total,
 totalPages: guidesData.totalPages,
 hasNext: guidesData.hasNext,
 hasPrev: guidesData.hasPrev
 }}
 />

 {/* ========================================
 TRUST & TRANSPARENCY NOTE
 ======================================== */}
 <div className="mt-12 p-6 bg-primary-light/10 dark:bg-primary-dark/14 border border-blue-200 dark:border-blue-800 rounded-2xl">
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
 <span className="text-primary-light dark:text-primary-dark dark:text-primary-dark text-lg">🔒</span>
 </div>
 <div className="flex-1">
 <h3 className="font-semibold text-theme-primary mb-1">
 Privacy Protection
 </h3>
 <p className="text-sm text-theme-secondary ">
 Guide names and personal information are never displayed. Each entry uses 
 an anonymized identifier to protect privacy while maintaining accountability.
 If you recognize a guide you've booked with, please contact support.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </PageLayout>
 )
}