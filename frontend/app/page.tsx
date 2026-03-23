import Navigation from '@/src/components/layout/Navigation'
import { LandingV3 } from '@/src/components/landing/LandingV3'
import ImpactMap from '@/src/components/landing/ImpactMap'

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

      <main className="relative overflow-hidden">
        {/* Unified Cinematic Experience */}
        <LandingV3 />
      </main>

      {/* Footer is rendered by the root layout */}
    </>
  )
}
