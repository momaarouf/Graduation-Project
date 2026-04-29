// ============================================================================
// TOUR INFO - DESCRIPTION, ITINERARY, & INCLUSIONS
// ============================================================================
// LOCATION: /frontend/src/components/tour-detail/TourInfo.tsx
// 
// PURPOSE: Detailed information about the tour experience
// 
// FEATURES:
// 1. Description with 'Read More' toggle (Phase 2)
// 2. Interactive visual itinerary
// 3. Halal certification details
// 4. Meeting point with simple map view
// 5. Requirements and what to bring
// ============================================================================

'use client'

import { useState } from 'react'

import {
 Check,
 X,
 MapPin,
 Clock,
 AlertTriangle,
 Backpack,
 ShieldCheck,
 ChevronDown,
 Info,
 Globe,
 Tag,
 Timer,
 Zap
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import Map component with SSR disabled for Leaflet support
const TourMap = dynamic(() => import('./TourMap'), { 
 ssr: false,
 loading: () => <div className="h-[300px] surface-section rounded-xl animate-pulse flex items-center justify-center font-black text-theme-muted">LOADING MAP...</div>
})
import type { TourInfoProps } from '@/src/types/tour-detail.types'
import { parseList, parseItinerary } from '@/src/lib/utils/tour-parser'

export default function TourInfo({
 description,
 itinerary,
 inclusions,
 exclusions,
 requirements,
 whatToBring,
 meetingPoint,
 route,
 safetyMeasures,
 isHalalCertified,
 halalCertificationDetails,
 tags,
 languages,
 durationHours,
 durationMinutes,
 occurrences
}: any) {
 const [isItineraryExpanded, setIsItineraryExpanded] = useState(false)
 const [isInclusionsExpanded, setIsInclusionsExpanded] = useState(false)
 const [isExclusionsExpanded, setIsExclusionsExpanded] = useState(false)
 
 const searchParams = useSearchParams()
 const selectedDateStr = searchParams.get('date')

 const inclusionList = parseList(inclusions)
 const exclusionList = parseList(exclusions)
 const requirementList = parseList(requirements)
 const bringList = parseList(whatToBring)
 const safetyList = parseList(safetyMeasures)
 const itineraryList = parseItinerary(itinerary)

 const tagList = Array.isArray(tags) ? tags : parseList(tags)
 const languageList = Array.isArray(languages) ? languages : parseList(languages)

 // Dynamic duration calculation
 let displayHours = durationHours
 let displayMinutes = durationMinutes
 let isOverridden = false

 if (selectedDateStr && occurrences && occurrences.length > 0) {
 const occ = occurrences.find((o: any) => (o.startTimeUtc === selectedDateStr || o.startTime === selectedDateStr))
 if (occ) {
 const start = new Date(occ.startTimeUtc || occ.startTime)
 const end = new Date(occ.endTimeUtc || occ.endTime)
 const diffMs = end.getTime() - start.getTime()
 const totalMinutes = Math.floor(diffMs / (60 * 1000))
 if (totalMinutes > 0) {
 displayHours = Math.floor(totalMinutes / 60)
 displayMinutes = totalMinutes % 60
 isOverridden = true
 }
 }
 }

 return (
 <div className="space-y-8">
 {/* Quick Specs / Tags & Languages */}
 <section className="flex flex-wrap gap-4 pb-6 border-b border-primary-light/10 dark:border-primary-dark/10">
 {/* Duration */}
 {(displayHours > 0 || displayMinutes > 0) && (
 <AnimatePresence mode="wait">
 <motion.div
 key={`${displayHours}-${displayMinutes}`}
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm transition-all ${
 isOverridden 
 ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700/50' 
 : 'bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light/20 dark:border-primary-dark/20'
 }`}
 >
 {isOverridden ? (
 <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
 ) : (
 <Timer className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 )}
 <span className={`text-sm font-bold ${isOverridden ? 'text-indigo-700 dark:text-indigo-300' : 'text-blue-700 dark:text-blue-300'}`}>
 {displayHours > 0 && `${displayHours}h`} {displayMinutes > 0 && `${displayMinutes}m`}
 {isOverridden && <span className="ml-1 text-[10px] opacity-70 font-medium">(Selected Date)</span>}
 </span>
 </motion.div>
 </AnimatePresence>
 )}

 {/* Languages */}
 {languageList.length > 0 && (
 <div className="flex items-center gap-2 px-5 py-2 surface-section rounded-lg border border-primary-light/10 dark:border-primary-dark/10 shadow-sm transition-all hover:shadow-md">
 <Globe className="w-4 h-4 text-theme-muted " />
 <div className="flex gap-2.5">
 {languageList.map((lang, i) => (
 <span key={i} className="text-[10px] font-black uppercase tracking-[0.15em] text-theme-primary ">
 {typeof lang === 'string' ? lang : (lang.language || JSON.stringify(lang))}
 </span>
 ))}
 </div>
 </div>
 )}
 </section>

 {/* ========================================
 ABOUT THE TOUR
 ======================================== */}
 <section>
 <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark mb-4">
 About this tour
 </h2>
 <div className="prose prose-blue dark:prose-invert max-w-none">
 <p className="text-theme-secondary leading-relaxed whitespace-pre-wrap">
 {description?.trim()}
 </p>
 </div>
 </section>

 {/* ========================================
 HALAL CERTIFICATION DETAILS
 ======================================== */}
 {isHalalCertified && halalCertificationDetails && (
 <section className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-success-green dark:border-success-green/10 rounded-xl shadow-sm">
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
 <ShieldCheck className="w-5 h-5 text-success-green dark:text-emerald-400" />
 </div>
 <div>
 <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">
 Halal Travel Commitment
 </h3>
 <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
 {halalCertificationDetails}
 </p>
 </div>
 </div>
 </section>
 )}

 {/* ========================================
 ROUTE & MEETING POINT (MAP)
 ======================================== */}
 <section id="location" className="scroll-mt-24">
 <div className="flex items-center gap-2 mb-4">
 <MapPin className="w-5 h-5 text-theme-muted" />
 <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark">Visual Route & Meeting Point</h2>
 </div>

 <div className="space-y-4">
 <div className="flex items-start gap-3">
 <MapPin className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark flex-shrink-0 mt-0.5" />
 <div className="space-y-1">
 <p className="font-bold text-theme-primary">
 {meetingPoint.name}
 </p>
 <p className="text-sm text-theme-muted ">
 {meetingPoint.address}
 </p>
 </div>
 </div>

 {meetingPoint.instructions && (
 <div className="flex items-start gap-3 p-4 bg-primary-light/5 dark:bg-primary-dark/5 rounded-xl border border-primary-light/10">
 <Info className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark flex-shrink-0 mt-0.5" />
 <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
 {meetingPoint.instructions}
 </p>
 </div>
 )}

 {/* Real Leaflet Map */}
 <TourMap 
 meetingPoint={{
 lat: meetingPoint.lat,
 lng: meetingPoint.lng,
 name: meetingPoint.name,
 address: meetingPoint.address
 }}
 route={route && route.length > 0 ? route : itineraryList.filter(it => it.location?.lat).map(it => ({
 id: it.id,
 latitude: it.location.lat,
 longitude: it.location.lng,
 pointName: it.title
 }))}
 height="400px"
 />
 </div>
 </section>

 {/* ========================================
 ITINERARY DETAILS (LIST)
 ======================================== */}
 <section className="scroll-mt-24">
 <button 
 onClick={() => setIsItineraryExpanded(!isItineraryExpanded)}
 className="w-full flex items-center justify-between group transition-all"
 >
 <div className="flex items-center gap-3">
 <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark group-hover:text-primary-light/80 transition-colors">
 Discovery Timeline
 </h2>
 <span className="text-sm text-theme-muted bg-primary-light/5 px-2 py-0.5 rounded-lg border border-primary-light/10">
 {itineraryList.length} stops
 </span>
 </div>
 <div className={`p-2 rounded-lg surface-section border border-primary-light/10 text-theme-muted transition-all ${isItineraryExpanded ? 'rotate-180 text-primary-light' : ''}`}>
 <ChevronDown className="w-5 h-5" />
 </div>
 </button>

 <AnimatePresence>
 {isItineraryExpanded && (
 <motion.div 
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.3, ease: 'easeInOut' }}
 className="overflow-hidden"
 >
 <div className="pt-8 space-y-0 text-left">
 {itineraryList.map((stop, index) => (
 <div key={stop.id} className="relative flex gap-6 pb-10 last:pb-0">
 {/* Connector line */}
 {index !== itineraryList.length - 1 && (
 <div className="absolute left-[19px] top-[40px] bottom-0 w-0.5 surface-section" />
 )}

 {/* Order number - Standard Circle */}
 <div className="relative z-10 w-10 h-10 rounded-lg bg-primary-light dark:bg-primary-dark text-white text-sm font-black flex items-center justify-center flex-shrink-0 shadow-md">
 {index + 1}
 </div>

 <div className="space-y-2 pt-1.5 flex-1">
 <h3 className="text-lg font-bold text-primary-light dark:text-primary-dark">
 {stop.title}
 </h3>
 <div className="flex flex-wrap items-center gap-4 text-sm text-theme-muted ">
 <div className="flex items-center gap-1.5 surface-section px-3 py-1 rounded-xl border border-primary-light/10 dark:border-primary-dark/10 ">
 <Clock className="w-3.5 h-3.5 text-primary-light" />
 <span className="font-bold text-[11px] uppercase tracking-wider">{stop.duration}</span>
 </div>
 {stop.location && (
 <div className="flex items-center gap-1.5 surface-section px-3 py-1 rounded-xl border border-primary-light/10 dark:border-primary-dark/10 ">
 <MapPin className="w-3.5 h-3.5 text-orange-500" />
 <span className="font-bold text-[11px] uppercase tracking-wider">{stop.location.name}</span>
 </div>
 )}
 </div>
 <p className="text-sm text-theme-secondary leading-relaxed">
 {stop.description}
 </p>
 </div>
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </section>

 {/* ========================================
 INCLUSIONS & EXCLUSIONS
 ======================================== */}
 <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Inclusions */}
 <div className="space-y-4">
 <button 
 onClick={() => setIsInclusionsExpanded(!isInclusionsExpanded)}
 className="w-full flex items-center justify-between group transition-all"
 >
 <h3 className="font-bold text-primary-light dark:text-primary-dark flex items-center gap-2">
 <Check className="w-5 h-5 text-success-green dark:text-emerald-400" />
 What's included
 </h3>
 <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform ${isInclusionsExpanded ? 'rotate-180' : ''}`} />
 </button>

 <AnimatePresence>
 {isInclusionsExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <ul className="space-y-2.5 pt-2">
 {inclusionList.map((item, i) => (
 <li key={i} className="flex items-start gap-2.5 text-sm text-theme-secondary ">
 <span className="text-success-green dark:text-emerald-400 mt-1">•</span>
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Exclusions */}
 <div className="space-y-4">
 <button 
 onClick={() => setIsExclusionsExpanded(!isExclusionsExpanded)}
 className="w-full flex items-center justify-between group transition-all"
 >
 <h3 className="font-bold text-primary-light dark:text-primary-dark flex items-center gap-2">
 <X className="w-5 h-5 text-red-600 dark:text-red-400" />
 What's excluded
 </h3>
 <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform ${isExclusionsExpanded ? 'rotate-180' : ''}`} />
 </button>

 <AnimatePresence>
 {isExclusionsExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <ul className="space-y-2.5 pt-2">
 {exclusionList.map((item, i) => (
 <li key={i} className="flex items-start gap-2.5 text-sm text-theme-secondary ">
 <span className="text-red-600 dark:text-red-400 mt-1">•</span>
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </section>

 {/* ========================================
 REQUIREMENTS & WHAT TO BRING
 ======================================== */}
 <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 surface-section rounded-xl border border-primary-light/10 dark:border-primary-dark/10">
 {/* Requirements */}
 {requirements && requirements.length > 0 && (
 <div className="space-y-4">
 <h3 className="text-sm font-bold text-primary-light dark:text-primary-dark flex items-center gap-2 uppercase tracking-wider">
 <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 Requirements
 </h3>
 <ul className="space-y-2 text-sm text-theme-secondary ">
 {requirementList.map((item, i) => (
 <li key={i} className="flex items-start gap-2">
 <span className="text-theme-muted mt-1">•</span>
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {/* What to bring */}
 {whatToBring && whatToBring.length > 0 && (
 <div className="space-y-4">
 <h3 className="text-sm font-bold text-primary-light dark:text-primary-dark flex items-center gap-2 uppercase tracking-wider">
 <Backpack className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 What to bring
 </h3>
 <ul className="space-y-2 text-sm text-theme-secondary ">
 {bringList.map((item, i) => (
 <li key={i} className="flex items-start gap-2">
 <span className="text-theme-muted mt-1">•</span>
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </section>

 {/* ========================================
 SAFETY MEASURES
 ======================================== */}
 {safetyMeasures && safetyMeasures.length > 0 && (
 <section className="space-y-4">
 <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark">
 Safety Measures
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {safetyList.map((measure, i) => (
 <div key={i} className="flex items-center gap-2 p-3.5 surface-section border border-primary-light/10 dark:border-primary-dark/10 rounded-lg text-sm font-bold text-theme-muted shadow-sm shadow-black/5">
 <Check className="w-4 h-4 text-success-green dark:text-emerald-400" />
 <span>{measure}</span>
 </div>
 ))}
 </div>
 </section>
 )}
 </div>
 )
}
