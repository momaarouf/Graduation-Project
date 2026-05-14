'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
 Users, 
 Search, 
 Filter, 
 MapPin, 
 ShieldCheck, 
 MessageSquare,
 ArrowRight,
 Sparkles,
 Globe
} from 'lucide-react'
import Link from 'next/link'
import PageLayout from '@/src/components/layout/PageLayout'
import GuideCard from '@/src/components/guides/GuideCard'
import { getDiscoveryGuides, PublicGuideProfileResponse } from '@/src/lib/api/discovery'

export default function GuideDirectoryPage() {
 const [guides, setGuides] = useState<PublicGuideProfileResponse[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [searchQuery, setSearchQuery] = useState('')
 const [selectedCity, setSelectedCity] = useState('All Cities')
 const [selectedExpertise, setSelectedExpertise] = useState('All Expertise')

 useEffect(() => {
 const fetchGuides = async () => {
 try {
 const data = await getDiscoveryGuides()
 setGuides(data)
 } catch (err) {
 console.error('Failed to fetch guides:', err)
 } finally {
 setIsLoading(false)
 }
 }
 fetchGuides()
 }, [])

 // Derived filters
 const cities = useMemo(() => {
 const uniqueCities = new Set(guides.map(g => g.city).filter(Boolean))
 return ['All Cities', ...Array.from(uniqueCities)]
 }, [guides])

 const expertiseTags = useMemo(() => {
 const allTags = guides.flatMap(g => g.expertise || [])
 const uniqueTags = new Set(allTags)
 return ['All Expertise', ...Array.from(uniqueTags)]
 }, [guides])

 const filteredGuides = useMemo(() => {
 return guides.filter(guide => {
 const matchesSearch = guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 guide.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
 const matchesCity = selectedCity === 'All Cities' || guide.city === selectedCity
 const matchesExpertise = selectedExpertise === 'All Expertise' || 
 guide.expertise?.includes(selectedExpertise)
 return matchesSearch && matchesCity && matchesExpertise
 })
 }, [guides, searchQuery, selectedCity, selectedExpertise])

 return (
 <PageLayout>
 <div className="min-h-screen surface-card">
 
 {/* --- CINEMATIC HERO --- */}
 <section className="relative pt-32 pb-20 overflow-hidden border-b border-theme dark:border-white/5">
 <div className="absolute inset-0 z-0">
 <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-blue-950/20 dark:via-gray-950 dark:to-gray-950" />
 <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary-light/5 dark:bg-primary-light/10 rounded-full blur-[120px]" />
 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-[0.05]" />
 </div>

 <div className="container-safe relative z-10 px-4 md:px-6">
 <div className="max-w-4xl">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8 }}
 >
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-200 dark:border-blue-800/50 mb-6 font-sans">
 <Globe className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <span className="text-[10px] font-bold tracking-normal text-blue-700 dark:text-blue-300 capitalize">
 Our Experts
 </span>
 </div>
 
 <h1 className="text-5xl md:text-8xl font-bold text-theme-primary mb-6 leading-[0.95] tracking-tight">
 Meet the People <br /> 
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-orange-500 dark:from-blue-400 dark:via-indigo-300 dark:to-orange-400">
 Behind the Stories.
 </span>
 </h1>
 
 <p className="text-xl text-theme-muted mb-10 max-w-xl leading-relaxed">
 Browse our network of verified local experts. Each guide is manually vetted to ensure your journey is safe, authentic, and unforgettable.
 </p>
 </motion.div>
 </div>
 </div>
 </section>

 {/* --- SEARCH & FILTERS --- */}
 <section className="sticky top-14 sm:top-16 z-40 surface-card  border-b border-theme dark:border-white/5 py-6">
 <div className="container-safe px-4">
 <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
 {/* Search Bar */}
 <div className="relative w-full lg:max-w-md group">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-primary-light dark:text-primary-dark transition-colors w-5 h-5" />
 <input 
 type="text"
 placeholder="Search guides by name or expertise..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-14 pr-6 py-4 rounded-2xl surface-section border-0 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-theme-primary placeholder-gray-400 shadow-sm"
 />
 </div>

 {/* Select Filters */}
 <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
 <div className="relative">
 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted w-4 h-4 pointer-events-none" />
 <select 
 value={selectedCity}
 onChange={(e) => setSelectedCity(e.target.value)}
 className="pl-11 pr-10 py-4 rounded-2xl surface-section border-0 focus:ring-2 focus:ring-blue-500 font-bold text-sm text-theme-secondary appearance-none shadow-sm cursor-pointer"
 >
 {cities.map(city => <option key={city} value={city}>{city}</option>)}
 </select>
 </div>

 <div className="relative">
 <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted w-4 h-4 pointer-events-none" />
 <select 
 value={selectedExpertise}
 onChange={(e) => setSelectedExpertise(e.target.value)}
 className="pl-11 pr-10 py-4 rounded-2xl surface-section border-0 focus:ring-2 focus:ring-blue-500 font-bold text-sm text-theme-secondary appearance-none shadow-sm cursor-pointer"
 >
 {expertiseTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
 </select>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* --- GUIDE GRID --- */}
 <section className="py-20 px-4">
 <div className="container-safe">
 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {[1, 2, 3, 4, 5, 6].map(i => (
 <div key={i} className="h-96 rounded-[2.5rem] surface-section animate-pulse" />
 ))}
 </div>
 ) : filteredGuides.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
 <AnimatePresence mode='popLayout'>
 {filteredGuides.map((guide) => (
 <GuideCard key={guide.id} guide={guide} />
 ))}
 </AnimatePresence>
 </div>
 ) : (
 <div className="text-center py-40">
 <Users className="w-16 h-16 text-gray-200 mx-auto mb-6" />
 <h3 className="text-2xl font-bold text-theme-primary mb-2">No experts found</h3>
 <p className="text-theme-muted ">Try adjusting your filters or search query.</p>
 </div>
 )}
 </div>
 </section>

 {/* --- BECOME A GUIDE CTA --- */}
 <section className="py-24 relative overflow-hidden">
 <div className="container-safe px-4 relative z-10">
 <div className="p-12 md:p-20 rounded-[4rem] surface-base dark:bg-primary-light text-white relative overflow-hidden shadow-2xl">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20" />
 <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
 <div className="lg:max-w-xl text-center lg:text-left">
 <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Got local secrets to share?</h2>
 <p className="text-white/80 mb-10 text-lg leading-relaxed">
 Join our network of elite local guides and start creating authentic experiences for travelers from around the world.
 </p>
 <div className="flex flex-wrap justify-center lg:justify-start gap-4">
 <Link 
 href="/guide/onboarding" 
 className="px-10 py-5 surface-card text-theme-primary font-bold rounded-3xl hover:scale-105 transition-transform shadow-xl shadow-white/10 flex items-center gap-2"
 >
 Start Hosting <ArrowRight className="w-5 h-5" />
 </Link>
 <Link 
 href="/how-it-works" 
 className="px-10 py-5 surface-card  border border-white/20 text-white font-bold rounded-3xl hover:surface-card transition-all"
 >
 How it works
 </Link>
 </div>
 </div>

 <div className="relative lg:w-1/3 flex justify-center">
 <div className="p-4 rounded-3xl surface-card  border border-white/20 shadow-2xl rotate-3">
 <ShieldCheck className="w-24 h-24 text-blue-200 mb-4" />
 <div className="text-xs font-bold tracking-normal capitalize opacity-60 mb-2">SafariHub Certified</div>
 <div className="text-xl font-bold">Verification Engine</div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>

 </div>
 </PageLayout>
 )
}
