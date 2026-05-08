import Navigation from '@/src/components/layout/Navigation'
import { LandingV3 } from '@/src/components/landing/LandingV3'
import ImpactMap from '@/src/components/landing/ImpactMap'
import { Suspense } from 'react'

/**
 * HOME PAGE V3 - CINEMATIC & SPACIOUS
 * 
 * This page assembles the unified LandingV3 component and the ImpactMap.
 * LandingV3 handles the Hero, Trust Stats, Categories, Destinations, and CTA.
 * ImpactMap handles the live community metrics and reviews.
 */
export default function HomePage() {
 return (
 <>
 {/* Dynamic Navigation */}
 <Navigation />

 <main className="relative overflow-hidden pb-24 md:pb-0">
 {/* Unified Cinematic Experience */}
 <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
  <LandingV3 />
 </Suspense>
 </main>

 {/* Footer is rendered by the root layout */}
 </>
 )
}
