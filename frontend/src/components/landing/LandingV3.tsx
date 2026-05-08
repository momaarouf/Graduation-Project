'use client'

import React, { useState, FormEvent, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'

import { 
 Search, Globe, ChevronDown, Check, Shield, Lock, Clock, Star, 
 ArrowRight, MapPin, Users, Calendar, Award, Heart, Filter, ChevronLeft, ChevronRight
} from 'lucide-react'
import MobileFilterDrawer from '@/src/components/search/filters/MobileFilterDrawer'
import TourSearch from '@/src/components/search/TourSearch'
import CinematicBackground from '@/src/components/layout/CinematicBackground'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { 
 getUnifiedDiscovery,
 PublicStatsResponse,
 CategoryDiscoveryResponse,
 LocationDiscoveryResponse
} from '@/src/lib/api/discovery'
import { GlobePolaroids } from '@/src/components/ui/globe-polaroids'




// ─── Sub-Components ──────────────────────────────────────────────────────────


/**
 * Cinematic Hero Section
 * Uses a large background image, parallax effects, and a floating search card.
 * Now features an interactive 3D Globe with Polaroid memories.
 */
function HeroV3() {
 const router = useRouter()
 const [searchQuery, setSearchQuery] = useState('')
 const [selectedLocation, setSelectedLocation] = useState('')
 const { scrollY } = useScroll()
 const opacity = useTransform(scrollY, [0, 250], [1, 0])

 const handleSearch = (e: React.FormEvent) => {
 e.preventDefault()
 console.log('Search triggered:', searchQuery)
 let url = '/tours'
 const params = new URLSearchParams()
 if (searchQuery) params.append('q', searchQuery)
 if (selectedLocation) params.append('location', selectedLocation)
 if (params.toString()) url += `?${params.toString()}`
 
 // Use window.location as fallback if router is stuck
 if (router) {
 router.push(url)
 } else {
 window.location.href = url
 }
 }

 return (
  <section 
  className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden pt-12 sm:pt-20 pb-12"
  >
  {/* Hero Content Grid */}
  <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-8">
  
  {/* Left Column: Messaging & Search */}
  <motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
  className="flex-1 text-center lg:text-left w-full"
  >
  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/10 text-primary-light dark:text-primary-dark rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 mx-auto lg:mx-0">
  <Globe className="w-3 h-3" />
  Explore the undiscovered
  </div>

  <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-theme-primary leading-[1] lg:leading-[0.95] tracking-tight mb-6 sm:mb-8">
  Beyond the <br className="sm:hidden" />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-blue-600 dark:from-orange-400 dark:via-amber-200 dark:to-blue-400">
  Tourist Trail.
  </span>
  </h1>
  <p className="text-base sm:text-xl text-theme-muted font-medium tracking-wide mb-10 sm:mb-14 max-w-2xl mx-auto lg:mx-0">
  Connect with local experts who know the soul of every destination. Verified guides, authentic experiences.
  </p>

  <motion.div 
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -5, scale: 1.01 }}
  transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
  className="w-full max-w-2xl mx-auto lg:ml-0 surface-card rounded-[2rem] sm:rounded-[2.5rem] p-2 sm:p-3 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-theme relative z-[60]"
  >
  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
  <div className="flex-1 relative group hover:surface-section dark:hover:surface-card rounded-2xl transition-all">
  <Search className="absolute left-5 sm:left-7 top-1/2 -translate-y-1/2 text-theme-muted w-5 h-5 sm:w-6 sm:h-6 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
  <div className="flex flex-col pl-14 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 flex-1">
  <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] font-bold text-theme-muted group-hover:text-orange-500/70 transition-colors text-left whitespace-nowrap">Explore Global Destinations</span>
  <input 
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Where to next?"
  className={`w-full bg-transparent text-theme-primary border-0 focus:ring-0 font-bold placeholder-gray-400 p-0 leading-tight transition-all duration-300 text-lg sm:text-xl ${
  searchQuery.length > 25 ? 'text-lg' : 'text-xl'
  }`}
  />
  </div>
  </div>

  <button 
  type="submit" 
  className="bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all text-white px-8 py-4 sm:py-0 sm:h-[68px] rounded-2xl sm:rounded-[1.8rem] font-bold text-lg shadow-2xl shadow-orange-600/30"
  >
  Let's Go
  </button>
  </form>
  </motion.div>
  </motion.div>
 
  {/* Right Column: Hero Visual (The Globe - Hidden on Mobile) */}
  <motion.div 
  initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
  animate={{ opacity: 1, scale: 1, rotate: 0 }}
  transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
  className="hidden lg:flex flex-1 w-full max-w-lg lg:max-w-xl aspect-square relative mx-auto"
  >
  <div className="absolute inset-0 bg-primary-light/10 dark:bg-blue-400/5 blur-[120px] rounded-full animate-pulse" />
  <GlobePolaroids speed={0.0025} className="relative z-10 w-full h-full" />
  </motion.div>
 
  </div>
  </div>
 
 {/* Animated Scroll Down Indicator */}
 <motion.div 
 style={{ opacity }}
 animate={{ y: [0, 10, 0] }} 
 transition={{ repeat: Infinity, duration: 2 }}
 className="absolute bottom-6 left-1/2 -translate-x-1/2 text-theme-muted/40 flex flex-col items-center gap-3 z-20"
 >
 <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Explore</span>
 <div className="w-px h-12 bg-gradient-to-b from-gray-400 to-transparent dark:from-white/20 dark:to-transparent" />
 </motion.div>
 </section>
 )
}


/**
 * Premium Showcase
 * Highlights specific"Local's Choice" tours with interactive hotspots.
 */
function PremiumShowcase() {
 const tours = [
 {
 id: 1,
 title:"Byblos Coast: Phoenician Legacy",
 location:"Byblos (Jbeil), Lebanon",
 price:"$45",
 type:"Cultural Heritage",
 image:"/images/landing/byblos.png",
 hotspots: [
 { x:"30%", y:"40%", label:"Ancient Crusader Castle" },
 { x:"60%", y:"70%", label:"Authentic Phoenician Port" }
 ]
 },
 {
 id: 2,
 title:"Sultanahmet Secrets: Hidden Courtyards",
 location:"Istanbul, Turkey",
 price:"$65",
 type:"Hidden Gems",
 image:"/images/landing/istanbul.png",
 hotspots: [
 { x:"40%", y:"30%", label:"Local Spice Artisans" },
 { x:"70%", y:"60%", label:"Ottoman Hidden Cistern" }
 ]
 }
 ]

 return (
 <section className="py-14 sm:py-20 lg:py-32 px-4 max-w-7xl mx-auto">
 <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
 <motion.div
 initial={{ opacity: 0, x: -30 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: false, amount: 0.3 }}
 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
 className="max-w-2xl"
 >
 <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-theme-primary mb-4 sm:mb-6 tracking-tight leading-[0.9]">Local's Choice.</h2>
 <p className="text-lg text-theme-muted leading-relaxed font-medium">Handpicked experiences from verified guides across the globe. No tourist traps, just the authentic pulse of every region.</p>
 </motion.div>
 <Link href="/tours" className="group flex items-center gap-3 text-primary-light dark:text-primary-dark hover:gap-5 transition-all font-bold uppercase tracking-[0.2em] text-sm">
 Explore All Stories <ArrowRight className="w-5 h-5 text-primary-light dark:text-primary-dark" />
 </Link>
 </div>

 <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 md:gap-12 pb-8 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2">
 {tours.map((tour, i) => (
 <motion.div
 key={tour.id}
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: false, amount: 0.2 }}
 transition={{ delay: i * 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
 className="group relative snap-center min-w-[85vw] md:min-w-0"
 >
 <div className="relative h-[380px] sm:h-[520px] lg:h-[650px] rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden border border-theme dark:border-theme-strong shadow-2xl">
 <Image 
 src={tour.image} 
 alt={tour.title} 
 fill 
 className="object-cover transition-transform duration-[3s] group-hover:scale-110" 
 />
 <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
 
 {/* Interactive Hotspots */}
 {tour.hotspots.map((spot, j) => (
 <div 
 key={j} 
 className="absolute z-20 cursor-help group/spot"
 style={{ left: spot.x, top: spot.y }}
 >
 <div className="relative">
 <div className="w-5 h-5 surface-card rounded-full animate-ping absolute inset-0 opacity-75" />
 <div className="w-5 h-5 surface-card rounded-full relative border-2 border-orange-500" />
 <div className="absolute left-7 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover/spot:opacity-100 transition-all pointer-events-none translate-x-4 group-hover/spot:translate-x-0">
 {spot.label}
 </div>
 </div>
 </div>
 ))}

 <div className="absolute inset-x-12 bottom-12">
 <div className="flex items-center gap-4 mb-6">
 <span className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">{tour.type}</span>
 <span className="text-orange-400 font-bold text-3xl">{tour.price}</span>
 </div>
 <h3 className="text-5xl font-bold text-white mb-4 tracking-tight group-hover:text-orange-400 transition-colors">{tour.title}</h3>
 <div className="flex items-center gap-2 text-white/50 font-bold uppercase tracking-widest text-[10px]">
 <MapPin className="w-4 h-4 text-orange-500" />
 {tour.location}
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </section>
 )
}


/**
 * Professional Journey Trail
 * An interactive vertical progression showing how the platform works.
 */
function ProfessionalJourney() {
 const containerRef = useRef<HTMLDivElement>(null)
 const { scrollYProgress } = useScroll({
 target: containerRef,
 offset: ["start center","end center"]
 })

 // Smooth line growth
 const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

 const steps = [
 {
 title:"Handpicked Local Experts",
 desc:"Skip the generic agencies. Every guide undergoes manual identity & selfie verification. True locals with stories you won't find on Google.",
 icon: Shield,
 color:"from-blue-500 to-indigo-500",
 badge:"Verified Identity"
 },
 {
 title:"Tailor Your Story",
 desc:"Private doesn't mean rigid. Connect with guides fluent in Arabic, French, or English to tweak the route to your rhythm.",
 icon: Star,
 color:"from-orange-500 to-amber-500",
 badge:"Multilingual"
 },
 {
 title:"Secure Halal Handshake",
 desc:"Whish/Card payments held in escrow. Instant book or request options. Total protection with our 48h cancellation policy.",
 icon: Lock,
 color:"from-emerald-500 to-teal-500",
 badge:"Escrow Protection"
 },
 {
 title:"The Handshake Completion",
 desc:"Experience the undiscovered, then finalize with a secure QR handshake. Payouts are only frozen for 48h after your approval.",
 icon: Check,
 color:"from-blue-600 to-blue-400",
 badge:"QR Handshake"
 }
 ]

 return (
 <section ref={containerRef} className="relative py-14 sm:py-24 px-4 max-w-5xl mx-auto">
 {/* Central Trail Line */}
 <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 surface-section hidden md:block">
 <motion.div 
 style={{ scaleY, originY: 0 }}
 className="w-full h-full bg-gradient-to-b from-orange-500 via-blue-500 to-emerald-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
 />
 </div>

 <div className="space-y-8 sm:space-y-28 md:space-y-40">
 {steps.map((step, i) => {
 const isEven = i % 2 === 0
 const Icon = step.icon
 return (
 <div key={i} className={`flex flex-col md:flex-row items-center gap-12 ${isEven ? 'md:flex-row-reverse' : ''}`}>
 {/* Content Card */}
 <motion.div 
 initial={{ opacity: 0, y: 40, x: isEven ? 20 : -20 }}
 whileInView={{ opacity: 1, y: 0, x: 0 }}
 viewport={{ once: false, amount: 0.3 }}
 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
 className="flex-1 w-full"
 >
 <div className="group p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] surface-card  border border-theme dark:border-theme-strong hover:border-primary-light dark:hover:border-primary-dark/30 transition-all shadow-xl dark:shadow-2xl relative overflow-hidden">
 <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${step.color} opacity-30`} />
 <div className="flex items-center justify-between mb-6">
  <div className={`p-3 rounded-2xl surface-section bg-primary-light/15 dark:bg-primary-dark/15 text-primary-light dark:text-primary-dark transition-transform group-hover:scale-110`}>
  <Icon className="w-6 h-6" fill="currentColor" fillOpacity={0.15} />
 </div>
 <span className="px-3 py-1 rounded-full bg-primary-light/10 text-primary-light dark:text-primary-dark text-[9px] font-bold uppercase tracking-widest border border-primary-light/20 dark:border-primary-dark/20">
 {step.badge}
 </span>
 </div>
 <h3 className="text-lg sm:text-2xl font-bold text-theme-primary mb-2 sm:mb-3 tracking-tight">{step.title}</h3>
 <p className="text-theme-muted text-lg leading-relaxed">{step.desc}</p>
 </div>
 </motion.div>

 {/* Central Node Visual */}
 <div className="relative z-10 flex-shrink-0 hidden md:block">
 <motion.div 
 initial={{ scale: 0 }}
 whileInView={{ scale: 1 }}
 viewport={{ once: false }}
 className={`w-12 h-12 rounded-full border-4 border-theme bg-gradient-to-br ${step.color} shadow-lg`}
 />
 </div>

 <div className="flex-1 hidden md:block" />
 </div>
 )
 })}
 </div>
 </section>
 )
}


/**
 * Professional Trust Pillars
 * Clean, high-authority markers.
 */
function TrustPillars() {
 const pillars = [
 { title:"Flexibility Focus", desc:"100% refund for cancellations >48h. We respect your plans and your freedom.", icon: Clock },
 { title:"Escrow Protection", desc:"Whish/Card payments only released to guides 48h after tour completion.", icon: Shield },
 { title:"Halal-Friendly", desc:"Prayer spaces, Halal dietary options, and cultural respect build into every trail.", icon: Check },
 { title:"Verified Experts", desc:"Manual ID and Selfie vetting for all guides to ensure safety and quality.", icon: Lock }
 ]

 return (
 <section className="py-14 sm:py-20 lg:py-32 px-4 max-w-7xl mx-auto">
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
 {pillars.map((p, i) => {
 const Icon = p.icon
 return (
 <motion.div 
 key={i}
 initial={{ opacity: 0, y: 30, scale: 0.95 }}
 whileInView={{ opacity: 1, y: 0, scale: 1 }}
 whileHover={{ y: -5, scale: 1.02 }}
 viewport={{ once: false, amount: 0.2 }}
 transition={{ delay: i * 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
 className="p-5 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[3rem] surface-card border border-theme dark:border-theme-strong flex flex-col items-center text-center group hover:bg-primary-light/5 dark:hover:surface-card/[0.08] transition-all"
 >
    <div className="mb-6 p-5 bg-primary-light/10 dark:bg-orange-500/10 rounded-2xl text-primary-light dark:text-primary-dark dark:text-orange-400 group-hover:scale-110 transition-transform">
    <Icon className="w-8 h-8" fill="currentColor" fillOpacity={0.15} />
 </div>
 <h4 className="text-lg sm:text-2xl font-bold text-theme-primary mb-2 sm:mb-3 tracking-tight">{p.title}</h4>
 <p className="text-theme-muted text-[13px] leading-relaxed font-medium">{p.desc}</p>
 </motion.div>
 )
 })}
 </div>
 </section>
 )
}

// ─── Main Landing Export ─────────────────────────────────────────────────────

export function LandingV3() {
 const router = useRouter()
 const [stats, setStats] = useState<PublicStatsResponse | null>(null)
 const [categories, setCategories] = useState<CategoryDiscoveryResponse[]>([])
 const [locations, setLocations] = useState<LocationDiscoveryResponse[]>([])
 
 // Immersive Background Tracking
 

 useEffect(() => {
 const fetchData = async () => {
 try {
 const data = await getUnifiedDiscovery();
 setStats(data.stats);
 setCategories(data.categories);
 setLocations(data.locations);
 } catch (error) {
 console.error('Failed to fetch landing data:', error)
 }
 }
 fetchData()
 }, [])

 

 return (
 <CinematicBackground intensity="high">
  <div className="flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500">
 
 <div className="relative z-10 w-full">
 <HeroV3 />
 </div>

 {/* Page Sections */}
 <div className="relative z-10 bg-transparent w-full">
  <div className="text-center py-12 sm:py-20 lg:py-24 px-4">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 30 }}
 whileInView={{ opacity: 1, scale: 1, y: 0 }}
 viewport={{ once: false, amount: 0.5 }}
 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
 >
 <h2 className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold text-theme-primary mb-4 sm:mb-6 leading-[0.9] tracking-tighter uppercase">
 Beyond the <br className="hidden sm:block" /> Tourist Trail.
 </h2>
 <p className="text-theme-muted text-lg sm:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
 Experience the authentic soul of global destinations through the eyes of verified local experts. Trust is our foundation; adventure is our language.
 </p>
 </motion.div>
 </div>

 <ProfessionalJourney />
 <PremiumShowcase />
 <TrustPillars />

 {/* Final Recruiting & Booking CTA */}
 <div className="max-w-7xl mx-auto px-4 pb-14 sm:pb-24 lg:pb-32 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
 <motion.div 
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 whileHover={{ y: -10, scale: 1.01 }}
 viewport={{ once: false, amount: 0.3 }}
 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
 onClick={() => router.push('/tours')}
  className="p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col justify-between cursor-pointer"
 >
 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
 <div>
 <h3 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tighter">Find Your Guide</h3>
 <p className="text-white/50 mb-5 sm:mb-10 text-sm sm:text-xl leading-relaxed">Join thousands of travelers exploring the world with peace of mind.</p>
 </div>
  <button className="inline-flex w-full justify-center py-3 sm:py-5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xl transition-all shadow-2xl active:scale-95">Browse All Tours</button>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 whileHover={{ y: -10, scale: 1.01 }}
 viewport={{ once: false, amount: 0.3 }}
 transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
 onClick={() => router.push('/auth/signup')}
  className="p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-[3rem] border border-orange-500/20 hover:border-orange-500/40 shadow-xl relative overflow-hidden group flex flex-col justify-between cursor-pointer transition-colors"
 >
  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-all duration-700" />
 <div>
 <h3 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tighter">Become a Local Expert</h3>
 <p className="text-white/70 mb-5 sm:mb-10 text-sm sm:text-xl leading-relaxed">Share your culture, build your reputation, and earn more with Whish payouts.</p>
 </div>
  <button className="inline-flex w-full justify-center py-3 sm:py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 rounded-xl font-bold text-xl transition-all shadow-xl active:scale-95">Apply to Guide</button>
 </motion.div>
 </div>
 </div>
 </div>
 </CinematicBackground>
 )
}
