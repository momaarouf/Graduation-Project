"use client"

import Navigation from '@/src/components/layout/Navigation'
import { LandingV3 } from '@/src/components/landing/LandingV3'
import { LandingV4Demo } from '@/src/components/landing/LandingV4Demo'

export default function HeroTestPage() {
 return (
 <div className="surface-card min-h-screen">
 <Navigation />
 
 <main className="flex flex-col">
 {/* NEW HERO SECTION */}
 <section className="relative">
 <div className="bg-orange-600/10 dark:bg-orange-500/5 py-4 px-8 border-b dark:border-theme-strong text-center">
 <span className="text-sm font-black uppercase tracking-[0.3em] text-orange-600 dark:text-orange-400">
 Variant A: New Interactive Globe Hero
 </span>
 </div>
 <LandingV4Demo />
 </section>

 {/* SPACING DIVIDER */}
 <div className="h-32 surface-section flex items-center justify-center">
 <div className="w-px h-full surface-section " />
 </div>

 {/* OLD HERO SECTION */}
 <section className="relative">
 <div className="bg-primary-light/10 dark:bg-primary-light/5 py-4 px-8 border-y dark:border-theme-strong text-center">
 <span className="text-sm font-black uppercase tracking-[0.3em] text-primary-light dark:text-primary-dark dark:text-primary-dark ">
 Variant B: Original Cinematic Hero
 </span>
 </div>
 <LandingV3 />
 </section>
 </main>

 <footer className="py-20 surface-section border-t dark:border-white/5 text-center">
 <p className="text-theme-muted text-sm font-medium uppercase tracking-widest">Hero Comparison Demo • SafariHub</p>
 </footer>
 </div>
 )
}
