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
  getPublicStats, 
  getDiscoveryCategories, 
  getDiscoveryLocations,
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
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-12"
    >
      {/* Hero Content Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left Column: Messaging & Search */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-gray-900 dark:text-white leading-[0.95] tracking-tight mb-8">
              Beyond the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-blue-600 dark:from-orange-400 dark:via-amber-200 dark:to-blue-400">
                Tourist Trail.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 dark:text-white/50 font-medium tracking-wide mb-10 max-w-2xl mx-auto lg:mx-0">
              With guides who call it home.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl mx-auto lg:ml-0 bg-white/95 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[2.5rem] p-3 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 dark:border-gray-800 relative z-[60]"
            >
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all">
                  <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 group-hover:text-orange-500 transition-colors pointer-events-none" />
                  <div className="flex flex-col pl-16 pr-6 py-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 group-hover:text-orange-500/70 transition-colors text-left uppercase whitespace-nowrap">Explore Lebanon & Turkey</span>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Where do you want to go?"
                      className={`w-full bg-transparent text-gray-900 dark:text-white border-0 focus:ring-0 font-bold placeholder-gray-400 p-0 leading-tight transition-all duration-300 ${
                        searchQuery.length > 25 ? 'text-lg' : 'text-xl'
                      }`}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all text-white px-10 py-5 lg:py-0 rounded-[1.8rem] font-black text-lg shadow-2xl shadow-orange-600/30"
                >
                  Let's Go
                </button>
              </form>
            </motion.div>
          </motion.div>

          {/* Right Column: Hero Visual (The Globe) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full max-w-lg lg:max-w-xl aspect-square relative"
          >
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/5 blur-[120px] rounded-full animate-pulse" />
            <GlobePolaroids speed={0.0025} className="relative z-10 w-full h-full" />
          </motion.div>

        </div>
      </div>
      
      {/* Animated Scroll Down Indicator */}
      <motion.div 
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-500 dark:text-white/20 flex flex-col items-center gap-3 z-20"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-gray-300 to-transparent dark:from-white/10 dark:to-transparent" />
      </motion.div>
    </section>
  )
}


/**
 * Premium Showcase
 * Highlights specific "Local's Choice" tours with interactive hotspots.
 */
function PremiumShowcase() {
  const tours = [
    {
      id: 1,
      title: "Byblos Coast: Phoenician Legacy",
      location: "Byblos (Jbeil), Lebanon",
      price: "$45",
      type: "Cultural Heritage",
      image: "/images/landing/byblos.png",
      hotspots: [
        { x: "30%", y: "40%", label: "Ancient Crusader Castle" },
        { x: "60%", y: "70%", label: "Authentic Phoenician Port" }
      ]
    },
    {
      id: 2,
      title: "Sultanahmet Secrets: Hidden Courtyards",
      location: "Istanbul, Turkey",
      price: "$65",
      type: "Hidden Gems",
      image: "/images/landing/istanbul.png",
      hotspots: [
        { x: "40%", y: "30%", label: "Local Spice Artisans" },
        { x: "70%", y: "60%", label: "Ottoman Hidden Cistern" }
      ]
    }
  ]

  return (
    <section className="py-32 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-[0.9]">Local's Choice.</h2>
          <p className="text-lg text-gray-500 dark:text-white/40 leading-relaxed font-medium">Handpicked experiences from verified guides in Lebanon and Turkey. No tourist traps, just the authentic pulse of the region.</p>
        </motion.div>
        <Link href="/tours" className="group flex items-center gap-3 text-blue-600 dark:text-orange-500 font-black uppercase tracking-[0.2em] text-sm hover:gap-5 transition-all">
          Explore All Stories <ArrowRight className="w-5 h-5 text-blue-600 dark:text-orange-500" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {tours.map((tour, i) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: i * 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="group relative"
          >
            <div className="relative h-[650px] rounded-[3.5rem] overflow-hidden border border-gray-100 dark:border-white/10 shadow-2xl">
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
                    <div className="w-5 h-5 bg-white rounded-full animate-ping absolute inset-0 opacity-75" />
                    <div className="w-5 h-5 bg-white rounded-full relative border-2 border-orange-500" />
                    <div className="absolute left-7 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gray-950/80 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-xs font-black whitespace-nowrap opacity-0 group-hover/spot:opacity-100 transition-all pointer-events-none translate-x-4 group-hover/spot:translate-x-0">
                      {spot.label}
                    </div>
                  </div>
                </div>
              ))}

              <div className="absolute inset-x-12 bottom-12">
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">{tour.type}</span>
                  <span className="text-orange-400 font-black text-3xl">{tour.price}</span>
                </div>
                <h3 className="text-5xl font-black text-white mb-4 tracking-tight group-hover:text-orange-400 transition-colors">{tour.title}</h3>
                <div className="flex items-center gap-2 text-white/50 font-black uppercase tracking-widest text-[10px]">
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
    offset: ["start center", "end center"]
  })

  // Smooth line growth
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  const steps = [
    {
      title: "Handpicked Local Experts",
      desc: "Skip the generic agencies. Every guide undergoes manual identity & selfie verification. True locals with stories you won't find on Google.",
      icon: Shield,
      color: "from-blue-500 to-indigo-500",
      badge: "Verified Identity"
    },
    {
      title: "Tailor Your Story",
      desc: "Private doesn't mean rigid. Connect with guides fluent in Arabic, French, or English to tweak the route to your rhythm.",
      icon: Star,
      color: "from-orange-500 to-amber-500",
      badge: "Multilingual"
    },
    {
      title: "Secure Halal Handshake",
      desc: "Whish/Card payments held in escrow. Instant book or request options. Total protection with our 48h cancellation policy.",
      icon: Lock,
      color: "from-emerald-500 to-teal-500",
      badge: "Escrow Protection"
    },
    {
      title: "The Handshake Completion",
      desc: "Experience the undiscovered, then finalize with a secure QR handshake. Payouts are only frozen for 48h after your approval.",
      icon: Check,
      color: "from-blue-600 to-blue-400",
      badge: "QR Handshake"
    }
  ]

  return (
    <section ref={containerRef} className="relative py-32 px-4 max-w-5xl mx-auto">
      {/* Central Trail Line */}
      <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-gray-200 dark:bg-white/5 hidden md:block">
        <motion.div 
          style={{ scaleY, originY: 0 }}
          className="w-full h-full bg-gradient-to-b from-orange-500 via-blue-500 to-emerald-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
        />
      </div>

      <div className="space-y-40">
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
                <div className="group p-8 rounded-[2.5rem] bg-white/70 dark:bg-white/5 backdrop-blur-3xl border border-gray-100 dark:border-white/10 hover:border-blue-500/30 transition-all shadow-xl dark:shadow-2xl relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${step.color} opacity-30`} />
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-blue-600 dark:text-white transition-transform group-hover:scale-110`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-gray-500 dark:text-white/50 text-lg leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>

              {/* Central Node Visual */}
              <div className="relative z-10 flex-shrink-0 hidden md:block">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: false }}
                  className={`w-12 h-12 rounded-full border-4 border-white dark:border-gray-950 bg-gradient-to-br ${step.color} shadow-lg`}
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
    { title: "Flexibility Focus", desc: "100% refund for cancellations >48h. We respect your plans and your freedom.", icon: Clock },
    { title: "Escrow Protection", desc: "Whish/Card payments only released to guides 48h after tour completion.", icon: Shield },
    { title: "Halal-Friendly", desc: "Prayer spaces, Halal dietary options, and cultural respect build into every trail.", icon: Check },
    { title: "Verified Experts", desc: "Manual ID and Selfie vetting for all guides to ensure safety and quality.", icon: Lock }
  ]

  return (
    <section className="py-32 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
              className="p-10 rounded-[3rem] bg-gray-50/40 dark:bg-white/5 backdrop-blur-xl border border-gray-100 dark:border-white/10 flex flex-col items-center text-center group hover:bg-blue-500/5 dark:hover:bg-white/[0.08] transition-all"
            >
              <div className="mb-6 p-5 bg-blue-500/10 dark:bg-orange-500/10 rounded-2xl text-blue-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{p.title}</h4>
              <p className="text-gray-500 dark:text-white/40 text-[13px] leading-relaxed font-medium">{p.desc}</p>
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
        const [s, c, l] = await Promise.all([
          getPublicStats(),
          getDiscoveryCategories(),
          getDiscoveryLocations()
        ])
        setStats(s)
        setCategories(c)
        setLocations(l)
      } catch (error) {
        console.error('Failed to fetch landing data:', error)
      }
    }
    fetchData()
  }, [])

  

  return (
    <CinematicBackground intensity="high">
      <div className="bg-transparent dark:bg-gray-950/20 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500">
        
        <div className="relative z-10 w-full">
          <HeroV3 />
        </div>

        {/* Page Sections */}
        <div className="relative z-10 bg-transparent w-full">
          <div className="text-center py-24 px-4 bg-gray-50/50 dark:bg-transparent border-y border-gray-100 dark:border-transparent">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-[0.9] tracking-tighter uppercase">
                Beyond the <br className="hidden sm:block" /> Tourist Trail.
              </h2>
              <p className="text-gray-500 dark:text-white/40 text-lg sm:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                Experience the authentic soul of Lebanon and Turkey through the eyes of verified local experts. Trust is our foundation; adventure is our language.
              </p>
            </motion.div>
          </div>

          <ProfessionalJourney />
          <PremiumShowcase />
          <TrustPillars />

          {/* Final Recruiting & Booking CTA */}
          <div className="max-w-7xl mx-auto px-4 pb-32 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.01 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => router.push('/tours')}
              className="p-12 bg-blue-600 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-blue-500 dark:border-white/10 shadow-2xl relative overflow-hidden group flex flex-col justify-between cursor-pointer"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Find Your Guide</h3>
                <p className="text-white/70 dark:text-white/40 mb-10 text-xl leading-relaxed">Join thousands of travelers exploring Lebanon and Turkey with peace of mind.</p>
              </div>
              <button className="inline-flex w-full justify-center py-5 bg-white dark:bg-orange-600 hover:bg-gray-100 dark:hover:bg-orange-700 text-blue-600 dark:text-white rounded-xl font-black text-xl transition-all shadow-2xl active:scale-95">Browse All Tours</button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.01 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => router.push('/auth/signup')}
              className="p-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-[3rem] shadow-xl relative overflow-hidden group flex flex-col justify-between cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/10 transition-all duration-700" />
              <div>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Become a Local Expert</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-10 text-xl leading-relaxed">Share your culture, build your reputation, and earn more with Whish payouts.</p>
              </div>
              <button className="inline-flex w-full justify-center py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 rounded-xl font-black text-xl transition-all shadow-xl active:scale-95">Apply to Guide</button>
            </motion.div>
          </div>
        </div>
      </div>
    </CinematicBackground>
  )
}
