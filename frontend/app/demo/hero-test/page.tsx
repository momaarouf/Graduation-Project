"use client"

import Navigation from '@/src/components/layout/Navigation'
import { LandingV3 } from '@/src/components/landing/LandingV3'
import { LandingV4Demo } from '@/src/components/landing/LandingV4Demo'

export default function HeroTestPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <Navigation />
      
      <main className="flex flex-col">
        {/* NEW HERO SECTION */}
        <section className="relative">
          <div className="bg-orange-600/10 dark:bg-orange-500/5 py-4 px-8 border-b dark:border-white/10 text-center">
            <span className="text-sm font-black uppercase tracking-[0.3em] text-orange-600 dark:text-orange-400">
              Variant A: New Interactive Globe Hero
            </span>
          </div>
          <LandingV4Demo />
        </section>

        {/* SPACING DIVIDER */}
        <div className="h-32 bg-gray-100 dark:bg-white/5 flex items-center justify-center">
          <div className="w-px h-full bg-gray-300 dark:bg-white/10" />
        </div>

        {/* OLD HERO SECTION */}
        <section className="relative">
          <div className="bg-blue-600/10 dark:bg-blue-500/5 py-4 px-8 border-y dark:border-white/10 text-center">
            <span className="text-sm font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
              Variant B: Original Cinematic Hero
            </span>
          </div>
          <LandingV3 />
        </section>
      </main>

      <footer className="py-20 bg-gray-50 dark:bg-gray-900 border-t dark:border-white/5 text-center">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Hero Comparison Demo • SafariHub</p>
      </footer>
    </div>
  )
}
