// ============================================================================
// GUIDE PUBLIC PROFILE PAGE - CARD 6
// ============================================================================
// LOCATION: /frontend/app/guides/[id]/page.tsx
// 
// PURPOSE: Display comprehensive guide profile with portfolio and verification
// This page is PUBLIC and accessible to anyone.
// ============================================================================

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation' // Added useRouter
import { 
  Star, 
  MapPin, 
  Users, 
  Calendar, 
  Shield, 
  Globe, 
  CheckCircle, 
  MessageSquare, 
  Heart,
  Award,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import GuideToursGrid from '@/src/components/guides/GuideToursGrid'
import LoadingOverlay from '@/src/components/ui/LoadingOverlay'
import { getPublicGuideProfile, PublicGuideProfile } from '@/src/lib/api/guides'
import { motion } from 'framer-motion'

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-800/40',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-800/40',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-800/40',
    orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-100/50 dark:border-orange-800/40',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-800/40'
  }

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 12px 20px -5px rgb(0 0 0 / 0.1)' }}
      className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="flex items-center gap-4 text-left">
        <div className={`p-3 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">{value}</div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const router = useRouter()
  const [guide, setGuide] = useState<PublicGuideProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
          throw new Error('Invalid guide ID format')
        }
        const data = await getPublicGuideProfile(numericId)
        setGuide(data)
      } catch (err) {
        console.error('Failed to load guide profile:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  if (loading) return <LoadingOverlay isVisible={true} message="Loading Guide Profile..." />

  if (error || !guide) {
    return (
      <PageLayout>
        <div className="pt-32 pb-20 text-center container-safe">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Guide Profile Not Found</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              We couldn't retrieve the details for this guide. They might have deactivated their account or have a pending verification.
            </p>
            <Link 
              href="/guides"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Explorer
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  const memberSinceYear = guide.memberSince ? new Date(guide.memberSince).getFullYear() : '2024'

  return (
    <PageLayout>
      <main className="flex-1 w-full bg-white dark:bg-gray-950 pb-20 relative">
        
        {/* Immersive Cover Image Area */}
        <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden group">
          <Image
            src={guide.coverImageUrl || '/images/guides/default-cover.jpg'}
            alt={`${guide.name} cover`}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Floating Back Navigation - Desktop & Mobile Integrated */}
          <div className="absolute top-20 left-4 md:left-8 z-30">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-white rounded-2xl border border-gray-100 dark:border-white/5 shadow-2xl hover:bg-white dark:hover:bg-gray-900 transition-all group scale-90 hover:scale-100 origin-left"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Explorer</span>
            </button>
          </div>
        </div>

        {/* Integrated Header (Native Overlap CONTAINER) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Identity & Actions Container */}
          <div className="-mt-10 md:-mt-14 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 pb-10 border-b border-gray-100 dark:border-gray-800">
            
            {/* Guide Avatar */}
            <div className="relative shrink-0">
              <div className="relative w-32 h-32 md:w-52 md:h-52 rounded-[2rem] border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden ring-2 ring-blue-500/10 transition-all duration-700 hover:scale-105 hover:rotate-1 hover:shadow-blue-500/10">
                <Image 
                   src={guide.avatarUrl || '/images/guides/default-avatar.jpg'} 
                   alt={guide.name} 
                   width={208} 
                   height={208} 
                   className="object-cover w-full h-full" 
                />
              </div>
              {guide.verified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 rounded-2xl border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-xl">
                   <Shield className="w-5 h-5 text-white fill-current" />
                </div>
              )}
            </div>

            {/* Identity Text */}
            <div className="flex-1 text-center md:text-left mb-2 md:mb-0 md:translate-y-3">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div className="space-y-3">
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                     <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm dark:drop-shadow-md tracking-tight leading-none transition-colors">
                       {guide.name}
                     </h1>
                     <div className="px-2.5 py-1 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg border border-blue-400/30">
                        Expert Partner
                     </div>
                   </div>
                   
                   <p className="text-base md:text-lg font-black text-blue-600 dark:text-blue-300 drop-shadow-sm tracking-tight italic opacity-90 transition-colors">
                     {guide.tagline || 'Leading Local Expert'}
                   </p>

                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 dark:text-gray-200 uppercase tracking-widest bg-gray-100 dark:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 shadow-md dark:shadow-lg transition-all">
                         <MapPin className="w-3.5 h-3.5 text-orange-500" />
                         <span>{guide.city}, {guide.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 dark:text-gray-200 uppercase tracking-widest bg-gray-100 dark:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 shadow-md dark:shadow-lg transition-all">
                         <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                         <span>EST. {memberSinceYear}</span>
                      </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-3">
                   <Link
                     href={`/messages/new?user=${guide.id}`}
                     className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-2xl active:scale-95 flex items-center gap-2"
                   >
                     <MessageSquare className="w-4 h-4" />
                     Message
                   </Link>
                   <button className="p-3.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-100 dark:border-white/10 text-gray-400 hover:text-red-500 rounded-2xl transition-all shadow-xl group">
                     <Heart className="w-5 h-5 group-hover:fill-current transition-colors" />
                   </button>
                 </div>
               </div>
            </div>
          </div> {/* End Identity Header */}

          {/* Separated Premium Stats Area */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
             <StatCard icon={Award} label="Total Tours" value={guide.tourCount} color="amber" />
             <StatCard icon={Users} label="Guests Served" value={guide.totalGuidedTrips} color="blue" />
             <StatCard icon={Star} label="Guest Rating" value={guide.averageRating || '5.0'} color="emerald" />
             <StatCard icon={Shield} label="Verification" value="Advanced" color="emerald" />
          </div>

          {/* Main Content Layout Grid */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column (Portfolio & Bio) */}
            <div className="lg:col-span-2 space-y-16">
              <section className="bg-white dark:bg-gray-900 rounded-[2rem] p-10 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden group hover:translate-y-[-4px] hover:shadow-blue-500/10 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Biography</h2>
                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-400 leading-relaxed font-bold">
                  {guide.bio || 'Your host is a professional local guide with years of experience leading tours and creating memorable moments.'}
                </div>
              </section>

              <section className="space-y-10 pb-20">
                <div className="flex items-center justify-between border-b-2 border-gray-50 dark:border-gray-800 pb-4">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">Portfolio</h2>
                  <Link href={`/tours?guideId=${guide.id}`} className="text-orange-600 dark:text-orange-400 font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-75 transition-all flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl">
                    See All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <GuideToursGrid guideId={guide.id.toString()} />
              </section>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-8">
              
              {/* Specialized Expertise Card */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-10 space-y-10 hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 hover:border-blue-500/10">
                <div>
                  <h3 className="text-[10px] font-black text-gray-600 dark:text-gray-500 mb-6 uppercase tracking-[0.25em] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                    Available Languages
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {guide.languages.map((lang: { name: string; proficiency: string }, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest shadow-sm">
                        {lang.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-gray-600 dark:text-gray-500 mb-6 uppercase tracking-[0.25em] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Core Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {guide.expertise.map((item: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest shadow-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Trust Seal Card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-[2rem] p-10 shadow-xl dark:shadow-2xl relative overflow-hidden group border border-gray-100 dark:border-white/5 hover:shadow-2xl transition-all duration-300"
              >
                 <Shield className="absolute -bottom-6 -right-6 w-24 h-24 text-blue-600/10 rotate-12 transition-transform duration-500" />
                 <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    Trust Seal
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-md group/seal">
                      <CheckCircle className="w-4 h-4 text-emerald-400 group-hover/seal:scale-110 transition-transform" />
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest">ID Verified</span>
                         <span className="text-[8px] font-bold text-gray-400">Security Clearance Done</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-md group/seal">
                      <Shield className="w-4 h-4 text-blue-500 group-hover/seal:scale-110 transition-transform" />
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest">Premium Guide</span>
                         <span className="text-[8px] font-bold text-gray-400">High Reliability Track</span>
                      </div>
                    </div>
                 </div>
              </motion.div>

            </div> {/* End Sidebar Column */}
          </div> {/* End Main Content Layout Grid */}
        </div> {/* End Native Overlap CONTAINER */}
      </main>
    </PageLayout>
  )
}
