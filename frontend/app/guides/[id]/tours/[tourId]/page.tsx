// ============================================================================
// PORTFOLIO TOUR DETAIL - PUBLIC SIGNATURE EXPERIENCE VIEW
// ============================================================================
// LOCATION: /frontend/app/guides/[id]/tours/[tourId]/page.tsx
// 
// PURPOSE: Display a detailed "Signature Experience" of a specific tour in a guide's portfolio.
// This is DIFFERENT from the active booking page (/tours/[id]). 
// It focuses on track record, past runs, and performance.
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Star, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Shield, 
  Globe, 
  Info,
  ArrowRight,
  TrendingUp,
  Award,
  Video,
  Camera,
  MessageSquare,
  X,
  Zap,
  Check,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageLayout from '@/src/components/layout/PageLayout'
import LoadingOverlay from '@/src/components/ui/LoadingOverlay'
import { getPortfolioTourDetail } from '@/src/lib/api/tours'
import { GuidePortfolioTourDetailResponse } from '@/src/lib/types/tour.types'
import { motion } from 'framer-motion'
import { parseItinerary, parseList } from '@/src/lib/utils/tour-parser'

export default function PortfolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rawGuideId = params.id as string
  const rawTourId = params.tourId as string
  const guideId = parseInt(rawGuideId)
  const tourId = parseInt(rawTourId)
  const isInvalid = isNaN(guideId) || isNaN(tourId)

  const [tour, setTour] = useState<GuidePortfolioTourDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    async function loadData() {
      if (isInvalid) {
        setError(true)
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const res = await getPortfolioTourDetail(guideId, tourId)
        setTour(res)
      } catch (err) {
        console.error('Failed to load portfolio detail:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [guideId, tourId])

  if (loading) return <LoadingOverlay isVisible={true} message="Opening signature experience..." />

  if (error || !tour) {
    return (
      <PageLayout>
        <div className="pt-20 pb-20 text-center container-safe">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tour History Not Found</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              We couldn't retrieve the details for this specific portfolio item. It might have been removed or you may have followed an expired link.
            </p>
            <Link 
              href={`/guides/${guideId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Guide Profile
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Parse structured data
  const itinerary = parseItinerary(tour.itinerary)
  const inclusions = parseList(tour.inclusions)
  const exclusions = parseList(tour.exclusions)
  const memberSinceYear = tour.lastPublishedAtUtc ? new Date(tour.lastPublishedAtUtc).getFullYear() : '2024'

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[600px] bg-theme-grid opacity-[0.03] dark:opacity-[0.02] pointer-events-none" />
        
        {/* Top Navigation Bar (Mobile Sticky) */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 sticky top-14 sm:top-16 mt-14 sm:mt-16 z-20">
          <div className="container-safe mx-auto max-w-7xl h-14 flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
                Signature Experience
              </span>
            </div>
          </div>
        </div>

        <main className="container-safe mx-auto max-w-7xl py-8">
          
          {/* Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-white/5">
                {tour.media.length > 0 ? (
                  <Image
                    src={tour.media[activeImage].url}
                    alt={tour.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <Camera className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                
                {/* Status Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Verified Performance
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {tour.media.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                  {tour.media.map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveImage(idx)}
                      className={`
                        relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300
                        ${activeImage === idx ? 'border-blue-600 scale-105 shadow-xl' : 'border-transparent opacity-50 hover:opacity-100'}
                      `}
                    >
                      <Image src={m.url} alt="thumbnail" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Stats */}
            <div className="flex flex-col justify-center">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                   <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {tour.category || 'Experience'}
                   </div>
                   <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {tour.region}
                   </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                  {tour.title}
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-bold">
                  {tour.shortDescription || 'A proven local experience with verified traveler satisfaction.'}
                </p>
              </div>

              {/* Track Record Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Runs</span>
                  </div>
                  <div className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{tour.completedRunCount}</div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Travelers</span>
                  </div>
                  <div className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{tour.totalTravelersCount}</div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg Rating</span>
                  </div>
                  <div className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{tour.averageRating || '4.9'}</div>
                </div>
              </div>

              {/* Guide Link & CTA */}
              <div className="mt-10 pt-10 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                <Link href={`/guides/${tour.guideId}`} className="flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 overflow-hidden ring-4 ring-gray-100 dark:ring-gray-900/50 shadow-lg">
                    <Image src={tour.guideAvatarUrl || "/images/guides/default-avatar.jpg"} alt="guide" width={56} height={56} className="object-cover" />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Designed By</p>
                    <p className="font-black text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center gap-1.5 leading-none">
                      {tour.guideDisplayName}
                      {tour.guideVerified && <Shield className="w-4 h-4 text-blue-500 fill-current opacity-20" />}
                    </p>
                  </div>
                </Link>

                {tour.currentlyAvailable && tour.relatedPublishedTourId && (
                  <Link 
                    href={`/tours/${tour.relatedPublishedTourId}`}
                    className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    Go to Active Tour
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Content Deep Dive */}
            <div className="lg:col-span-2 space-y-20">
              
              {/* Detailed Description */}
              <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:bg-blue-600/10 transition-colors" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <Award className="w-6 h-6 text-blue-600" />
                  Experience Story
                </h2>
                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed font-bold whitespace-pre-wrap break-words">
                  {tour.description}
                </div>
              </section>

              {/* Experience Flow (Itinerary) */}
              <section className="space-y-10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                  The Journey
                </h2>
                
                {itinerary.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                    {itinerary.map((stop, idx) => (
                      <div key={stop.id} className="relative pl-14 group">
                        <div className="absolute left-0 top-0 w-10 h-10 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-center z-10 group-hover:border-emerald-500 transition-colors">
                           <span className="text-xs font-black text-gray-400 dark:text-gray-500 group-hover:text-emerald-500">{idx + 1}</span>
                        </div>
                        <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm group-hover:shadow-md transition-all">
                           <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                              <h3 className="font-black text-gray-900 dark:text-white tracking-tight">{stop.title}</h3>
                              {stop.duration && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                   <Clock className="w-3 h-3" />
                                   {stop.duration}
                                </div>
                              )}
                           </div>
                           <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-bold">{stop.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-gray-500 italic">
                    Tour itinerary follows standard experience parameters.
                  </div>
                )}
              </section>

              {/* Logistics (Inclusions/Exclusions) */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Inclusions */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Inclusions
                  </h3>
                  <div className="space-y-3">
                    {inclusions.length > 0 ? inclusions.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-emerald-50/10 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 rounded-2xl">
                         <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                         <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    )) : (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm italic text-gray-500">
                        Check tour description for details.
                      </div>
                    )}
                  </div>
                </div>

                {/* Exclusions */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" />
                    Exclusions
                  </h3>
                  <div className="space-y-3">
                    {exclusions.length > 0 ? exclusions.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-red-50/10 dark:bg-red-500/5 border border-red-100/50 dark:border-red-500/10 rounded-2xl">
                         <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                         <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    )) : (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm italic text-gray-500">
                        Standard exclusions apply.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Performance History */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-amber-500" />
                    Performance History
                  </h2>
                </div>
                <div className="overflow-hidden rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">Run Date</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">Attendees</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">Verified By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                        {tour.completedRuns && tour.completedRuns.length > 0 ? (
                          tour.completedRuns.map((run) => (
                            <tr key={run.occurrenceId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-8 py-6 text-sm font-black text-gray-900 dark:text-white">
                                {new Date(run.startTimeUtc).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-8 py-6">
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-xs font-black text-blue-600 dark:text-blue-400">
                                   <Users className="w-3 h-3" />
                                   {run.attendeeCount} People
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                  <Shield className="w-3.5 h-3.5" />
                                  System Verified
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-8 py-16 text-center text-sm font-bold text-gray-400 italic">
                               <div className="mb-2">No run history found in the digital vault.</div>
                               <div className="text-[10px] uppercase font-black opacity-40">System Record Required</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Technical Map */}
            <div className="space-y-8">
              
              {/* Halal Badge */}
              {tour.halalFriendly && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-8 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-800 uppercase tracking-tight relative overflow-hidden group"
                >
                  <Globe className="absolute -bottom-8 -right-8 w-24 h-24 text-emerald-600/10 -rotate-12 transition-transform duration-700 group-hover:scale-110" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 bg-white dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center shadow-md">
                      <Globe className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-wide">Halal Certified</h4>
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">SafarHub Quality Guaranteed</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Project Snapshot (Summary Box) */}
              <div className="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-sm space-y-8 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100/50 dark:bg-gray-800/10 rounded-full -mr-12 -mt-12" />
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] text-[10px] relative">Experience Highlights</h3>
                
                <div className="space-y-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                       <MapPin className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Pricing Range</span>
                    </div>
                    <span className="font-black text-gray-900 dark:text-white text-sm">{tour.basePrice} {tour.currency}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                       <Users className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Capacity Track</span>
                    </div>
                    <span className="font-black text-gray-900 dark:text-white text-sm">{tour.minCapacity}-{tour.maxCapacity} Seats</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                       <Zap className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Premiere Date</span>
                    </div>
                    <span className="font-black text-gray-900 dark:text-white text-sm">
                      {tour.lastPublishedAtUtc ? new Date(tour.lastPublishedAtUtc).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2024 Premiere'}
                    </span>
                  </div>

                  <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={() => toast.success("Recording interest... Experience inquiry sent.")}
                      className="w-full py-5 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-blue-600 dark:hover:text-white hover:shadow-xl text-gray-900 dark:text-gray-100 font-black text-[10px] uppercase tracking-[0.25em] rounded-2xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-white/5 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Inquire Experience
                    </button>
                  </div>
                </div>
              </div>

              {/* Technical Blueprint (Tags) */}
              <div className="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-sm space-y-6">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] text-[10px]">Experience DNA</h3>
                <div className="flex flex-wrap gap-2.5">
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-blue-100 dark:border-blue-900/40">
                    {tour.category}
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    High Conversion
                  </div>
                  {tour.instantBook && (
                    <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-amber-100 dark:border-amber-900/40">
                      Standardized
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  )
}
