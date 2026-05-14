'use client'

import React, { useState, FormEvent, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import { 
 Search, Globe, ChevronDown, Check, Shield, Lock, Clock, Star, 
 ArrowRight, MapPin, Users, Calendar, Award, Heart, Filter, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
 getPublicStats, 
 getDiscoveryCategories, 
 getDiscoveryLocations,
 PublicStatsResponse,
 CategoryDiscoveryResponse,
 LocationDiscoveryResponse
} from '@/src/lib/api/discovery'
import CinematicBackground from '@/src/components/layout/CinematicBackground'
import { GlobePolaroids } from '@/src/components/ui/globe-polaroids'

// ─── Sub-Components ──────────────────────────────────────────────────────────

/**
 * Hero V4 - Globe Centered
 * Replaces the traditional background with the interactive 3D Globe.
 */
function HeroV4() {
 const router = useRouter()
 const [searchQuery, setSearchQuery] = useState('')
 const [selectedLocation, setSelectedLocation] = useState('')
 const { scrollY } = useScroll()
 const opacity = useTransform(scrollY, [0, 250], [1, 0])

 const handleSearch = (e: React.FormEvent) => {
 e.preventDefault()
 let url = '/tours'
 const params = new URLSearchParams()
 if (searchQuery) params.append('q', searchQuery)
 if (params.toString()) url += `?${params.toString()}`
 router.push(url)
 }

 return (
 <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
 <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
 {/* Left: Text Content */}
 <motion.div 
 initial={{ opacity: 0, x: -50 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
 className="flex-1 text-center lg:text-left"
 >
 <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-theme-primary leading-[0.95] tracking-tight mb-8">
 Beyond the <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-blue-600 dark:from-orange-400 dark:via-amber-200 dark:to-blue-400">
 Tourist Trail.
 </span>
 </h1>
 <p className="text-lg sm:text-xl text-theme-muted/50 font-medium tracking-wide mb-10 max-w-2xl">
 Experience Lebanon and Turkey through the eyes of local experts who have called these lands home for generations.
 </p>

 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 1, delay: 0.3 }}
 className="w-full max-w-xl surface-card  rounded-[2.5rem] p-3 shadow-2xl border border-theme"
 >
 <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
 <div className="flex-1 relative group surface-section rounded-2xl transition-all">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-theme-muted w-5 h-5 group-hover:text-orange-500 transition-colors" />
 <input 
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Where to?"
 className="w-full bg-transparent text-theme-primary border-0 focus:ring-0 font-bold placeholder-gray-400 pl-14 py-4"
 />
 </div>
 <button 
 type="submit" 
 className="bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all text-white px-8 py-4 rounded-[1.8rem] font-bold text-lg shadow-xl shadow-orange-600/20"
 >
 Explore
 </button>
 </form>
 </motion.div>
 </motion.div>

 {/* Right: The Globe */}
 <motion.div 
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 1.2, delay: 0.2 }}
 className="flex-1 w-full max-w-lg lg:max-w-xl aspect-square"
 >
 <div className="relative w-full h-full">
 {/* Soft background glow */}
 <div className="absolute inset-0 bg-primary-light/10 dark:bg-blue-400/5 blur-[100px] rounded-full" />
 <GlobePolaroids speed={0.002} className="relative z-10 w-full h-full" />
 </div>
 </motion.div>
 </div>
 
 {/* Scroll Indicator */}
 <motion.div 
 style={{ opacity }}
 animate={{ y: [0, 8, 0] }} 
 transition={{ repeat: Infinity, duration: 2 }}
 className="absolute bottom-10 left-1/2 -translate-x-1/2 text-theme-muted/50"
 >
 <ChevronDown className="w-6 h-6" />
 </motion.div>
 </section>
 )
}

// ─── Reuse existing components from LandingV3 to maintain consistency ────────────────

function PremiumShowcase() {
 const tours = [
 {
 id: 1, title:"Byblos Coast: Phoenician Legacy", location:"Byblos, Lebanon", price:"$45", type:"Cultural Heritage", image:"/images/landing/byblos.png", hotspots: [{ x:"30%", y:"40%", label:"Ancient Crusader Castle" }]
 },
 {
 id: 2, title:"Sultanahmet Secrets", location:"Istanbul, Turkey", price:"$65", type:"Hidden Gems", image:"/images/landing/istanbul.png", hotspots: [{ x:"40%", y:"30%", label:"Local Spice Artisans" }]
 }
 ]
 return (
 <section className="py-24 px-4 max-w-7xl mx-auto">
 <h2 className="text-4xl sm:text-6xl font-bold text-theme-primary mb-16 tracking-tight">Local's Choice.</h2>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 {tours.map((t) => (
 <div key={t.id} className="relative h-[500px] rounded-[3rem] overflow-hidden border dark:border-theme-strong shadow-xl">
 <Image src={t.image} alt={t.title} fill className="object-cover" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-10 flex flex-col justify-end">
 <span className="text-orange-400 font-bold mb-2 capitalize text-xs tracking-normal">{t.type}</span>
 <h3 className="text-3xl font-bold text-white mb-2">{t.title}</h3>
 <p className="text-white/60 text-sm">{t.location} • <span className="text-white">{t.price}</span></p>
 </div>
 </div>
 ))}
 </div>
 </section>
 )
}

function ProfessionalJourney() {
 const steps = [
 { title:"Handpicked Experts", desc:"Every guide undergoes identity verification.", icon: Shield },
 { title:"Tailor Your Story", desc:"Private doesn't mean rigid. Connect to tweak the route.", icon: Star },
 { title:"Secure Handshake", desc:"Whish/Card payments only released 48h after completion.", icon: Lock }
 ]
 return (
 <section className="py-24 px-4 surface-section transition-colors">
 <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
 {steps.map((s, i) => (
 <div key={i} className="flex flex-col items-center text-center p-8 surface-card rounded-[2.5rem] border dark:border-theme-strong shadow-sm">
 <div className="mb-6 p-4 bg-primary-light/10 rounded-2xl text-primary-light dark:text-primary-dark dark:text-orange-400">
 <s.icon className="w-8 h-8" />
 </div>
 <h3 className="text-xl font-bold text-theme-primary mb-4">{s.title}</h3>
 <p className="text-theme-muted/40 leading-relaxed">{s.desc}</p>
 </div>
 ))}
 </div>
 </section>
 )
}

// ─── Main Landing Export ─────────────────────────────────────────────────────

export function LandingV4Demo() {
 const [stats, setStats] = useState<PublicStatsResponse | null>(null)
 
 useEffect(() => {
 getPublicStats().then(setStats).catch(console.error)
 }, [])

 return (
 <CinematicBackground intensity="high">
 <div className="flex flex-col w-full relative overflow-hidden transition-colors duration-500">
 <HeroV4 />
 <ProfessionalJourney />
 <PremiumShowcase />
 
 {/* Simple Footer Link back */}
 <div className="text-center py-20 px-4">
 <Link href="/" className="text-primary-light dark:text-primary-dark dark:text-orange-500 font-bold hover:underline">← Back to Original Side by Side</Link>
 </div>
 </div>
 </CinematicBackground>
 )
}
