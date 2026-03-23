// ============================================================================
// TRAVELER PUBLIC PROFILE PAGE - CLONED FROM GUIDE PROFILE (CARD 6)
// ============================================================================
// LOCATION: /frontend/app/travelers/[id]/page.tsx
// 
// PURPOSE: Display comprehensive traveler profile with preferences and status
// This page is PUBLIC and accessible to anyone.
// ============================================================================

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Calendar, 
  Shield, 
  Globe, 
  CheckCircle, 
  MessageSquare, 
  Heart,
  Award,
  ChevronLeft,
  Sparkles,
  Info,
  Compass,
  Trophy
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import LoadingOverlay from '@/src/components/ui/LoadingOverlay'
import { getPublicTravelerProfile, PublicTravelerProfile } from '@/src/lib/api/travelers'
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
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-800/40',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100/50 dark:border-purple-800/40'
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

export default function TravelerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const router = useRouter()
  const [traveler, setTraveler] = useState<PublicTravelerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const numericId = parseInt(id)
        if (isNaN(numericId)) {
          throw new Error('Invalid traveler ID format')
        }
        const data = await getPublicTravelerProfile(numericId)
        setTraveler(data)
      } catch (err) {
        console.error('Failed to load traveler profile:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  if (loading) return <LoadingOverlay isVisible={true} message="Loading Traveler Profile..." />

  if (error || !traveler) {
    return (
      <PageLayout>
        <div className="pt-32 pb-20 text-center container-safe">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Traveler Not Found</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              We couldn't retrieve the details for this traveler. They might have a private profile or a deactivated account.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <main className="flex-1 w-full bg-white dark:bg-gray-950 pb-20 relative">
        
        {/* Immersive Cover Image Area */}
        <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden group">
          <Image
            src={traveler.coverImageUrl || '/images/travelers/default-cover.jpg'}
            alt={`${traveler.fullName} cover`}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Floating Back Navigation */}
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

        {/* Integrated Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Identity & Actions Container */}
          <div className="-mt-6 md:-mt-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 pb-12 mb-8 border-b border-gray-100 dark:border-gray-800">
            
            {/* Traveler Avatar */}
            <div className="relative shrink-0">
            <div className="relative w-32 h-32 md:w-52 md:h-52 rounded-[2rem] border-4 border-white dark:border-gray-950 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden ring-2 ring-blue-500/10 transition-all duration-700 hover:scale-105 hover:rotate-1 hover:shadow-blue-500/10">
                <Image 
                   src={traveler.avatarUrl || '/images/travelers/default-avatar.jpg'} 
                   alt={traveler.fullName} 
                   width={208} 
                   height={208} 
                   className="object-cover w-full h-full" 
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 rounded-2xl border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-xl">
                 <Shield className="w-5 h-5 text-white fill-current" />
              </div>
            </div>

            {/* Identity Text */}
            <div className="flex-1 text-center md:text-left mb-2 md:mb-0 md:translate-y-3">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div className="space-y-3">
                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                     <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white drop-shadow-sm dark:drop-shadow-md tracking-tight leading-none transition-colors">
                       {traveler.fullName}
                     </h1>
                     <div className="px-2.5 py-1 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg border border-blue-400/30">
                        Top Traveler
                     </div>
                   </div>
                   
                   <p className="text-base md:text-lg font-black text-blue-600 dark:text-blue-300 drop-shadow-sm tracking-tight italic opacity-90 transition-colors">
                     {traveler.tagline || 'World Explorer & Culture Enthusiast'}
                   </p>

                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 dark:text-gray-200 uppercase tracking-widest bg-gray-100 dark:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 shadow-md dark:shadow-lg transition-all">
                         <MapPin className="w-3.5 h-3.5 text-orange-500" />
                         <span>{traveler.location || 'Exploring the World'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 dark:text-gray-200 uppercase tracking-widest bg-gray-100 dark:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 shadow-md dark:shadow-lg transition-all">
                         <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                         <span>EST. {traveler.memberSince}</span>
                      </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-3">
                   <Link
                     href={`/messages/new?user=${traveler.id}`}
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
          </div>

          {/* Premium Stats Area */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
             <StatCard icon={Compass} label="Adventures" value={traveler.completedTrips} color="amber" />
             <StatCard icon={Trophy} label="Loyalty Tier" value={traveler.loyaltyTier} color="blue" />
             <StatCard icon={MapPin} label="Destinations" value={traveler.completedTrips > 0 ? Math.ceil(traveler.completedTrips * 0.7) : 0} color="emerald" />
             <StatCard icon={Shield} label="Verified" value="Yes" color="emerald" />
          </div>

          {/* Main Content Layout Grid */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column (Bio & Experience) */}
            <div className="lg:col-span-2 space-y-16">
              <motion.section 
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-900 rounded-[2rem] p-10 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:border-blue-500/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-600/10 transition-colors" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">About Me</h2>
                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-400 leading-relaxed font-bold">
                  {traveler.bio || 'This traveler is passionate about discovering new places, meeting local people, and experiencing diverse cultures through authentic travel experiences.'}
                </div>
              </motion.section>

              {/* Preferences / Past Experiences Placeholder Section */}
              <section className="bg-gray-50/50 dark:bg-gray-900/50 rounded-[2rem] p-10 md:p-12 border border-dashed border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                 <div className="flex flex-col items-center justify-center text-center py-10">
                    <Compass className="w-16 h-16 text-blue-500/20 mb-6" />
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">My Travel Stories</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm font-bold">
                       Stories from past adventures will appear here soon. Stay tuned for authentic travel reviews and photos!
                    </p>
                 </div>
              </section>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-8">
              
              {/* Preferences Card */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-10 space-y-10 hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 hover:border-blue-500/10">
                <div>
                  <h3 className="text-[10px] font-black text-gray-600 dark:text-gray-500 mb-6 uppercase tracking-[0.25em] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                    Preferred Hubs
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {['Lebanon', 'Turkey', 'International'].map((item, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest shadow-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-gray-600 dark:text-gray-500 mb-6 uppercase tracking-[0.25em] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {traveler.preferences.length > 0 ? traveler.preferences.map((item, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest shadow-sm">
                        {item}
                      </span>
                    )) : (
                      <span className="text-[10px] font-bold text-gray-400 italic">No interests listed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Trust Seal Card - Reflected for Travelers */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-[2rem] p-10 shadow-xl dark:shadow-2xl relative overflow-hidden group border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-2xl"
              >
                 <Shield className="absolute -bottom-6 -right-6 w-24 h-24 text-blue-600/10 rotate-12 transition-transform duration-500" />
                 <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    Trust Seal
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white">
                       <CheckCircle className={`w-4 h-4 ${traveler.emailVerified ? 'text-emerald-500' : 'text-gray-400'}`} />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest">Email Verified</span>
                          <span className="text-[8px] font-bold text-gray-400">{traveler.emailVerified ? 'Communication Secure' : 'Pending Verification'}</span>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white">
                       <CheckCircle className={`w-4 h-4 ${traveler.phoneVerified ? 'text-emerald-500' : 'text-gray-400'}`} />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest">Phone Verified</span>
                          <span className="text-[8px] font-bold text-gray-400">{traveler.phoneVerified ? 'Mobile Linked' : 'Mobile Unverified'}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white">
                       <Shield className="w-4 h-4 text-blue-500" />
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest">Member Status</span>
                          <span className="text-[8px] font-bold text-gray-400">Trusted Explorer</span>
                       </div>
                    </div>
                 </div>
              </motion.div>

            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
