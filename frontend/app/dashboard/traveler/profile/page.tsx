// ============================================================================
// TRAVELER PROFILE EDITOR - REPLICATED FROM GUIDE PREMIUM EDITOR
// ============================================================================
// LOCATION: /frontend/app/dashboard/traveler/profile/page.tsx
// 
// PURPOSE: Allow travelers to edit their profile with premium UI
// ============================================================================

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import toast from 'react-hot-toast'
import {
 User,
 Camera,
 MapPin,
 Globe,
 Shield,
 CheckCircle,
 Edit2,
 Save,
 X,
 Plus,
 Trash2,
 Calendar,
 MessageSquare,
 Heart,
 Eye,
 Trophy,
 Sparkles,
 Info,
 Compass,
 TrendingUp,
 Medal,
 Gem
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTravelerProfile, completeTravelerProfile, TravelerProfile } from '@/src/lib/api/travelers'
import { travelerGetLoyaltyStatus, LoyaltyStatusResponse, LoyaltyTierType } from '@/src/lib/api/traveler'
import LoadingOverlay from '@/src/components/ui/LoadingOverlay'

import apiClient from '@/src/lib/api/client'

// ============================================================================
// LOYALTY TIER CONFIG
// Replicated from dashboard for consistency
// ============================================================================

const TIER_CONFIG: Record<LoyaltyTierType, {
  label: string
  icon: string
  badge: string
  text: string
  ring: string
  gradient: string
  discount: number
}> = {
  BRONZE: {
    label: 'Bronze',
    icon: '🥉',
    badge: 'bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/40 text-accent-light dark:text-accent-dark dark:text-amber-300',
    text: 'text-accent-light dark:text-accent-dark dark:text-amber-300',
    ring: 'ring-accent-light dark:ring-accent-dark/50',
    gradient: 'from-amber-500 to-orange-500',
    discount: 0
  },
  SILVER: {
    label: 'Silver',
    icon: '🥈',
    badge: 'bg-slate-100/60 text-slate-700',
    text: 'text-slate-600',
    ring: 'ring-slate-300/50',
    gradient: 'from-slate-400 to-gray-500',
    discount: 3
  },
  GOLD: {
    label: 'Gold',
    icon: '🥇',
    badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    text: 'text-yellow-700 dark:text-yellow-400',
    ring: 'ring-yellow-400/60',
    gradient: 'from-yellow-500 to-amber-400',
    discount: 5
  },
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colorClasses = {
    blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark border-primary-light dark:border-primary-dark/40',
    emerald: 'bg-success-green/10 text-success-green dark:text-emerald-400 border-success-green/40 dark:border-emerald-500/30',
    amber: 'bg-accent-light/10 text-accent-light dark:text-amber-400 border-accent-light dark:border-amber-500/30',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30'
  }

 return (
 <motion.div 
 whileHover={{ y: -4 }}
 className="p-3 sm:p-5 surface-card border border-theme rounded-2xl shadow-sm transition-all duration-300 overflow-hidden"
 >
 <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
 <div className={`p-2 sm:p-2.5 rounded-xl border flex-shrink-0 ${colorClasses[color as keyof typeof colorClasses]}`}>
 <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
 </div>
 <div className="min-w-0">
 <div className="text-base sm:text-xl font-extrabold text-theme-primary leading-none mb-1 truncate">{value}</div>
 <div className="text-[8px] sm:text-[10px] font-black capitalize tracking-normal text-theme-muted truncate">{label}</div>
 </div>
 </div>
 </motion.div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

import TravelerProfileLoading from './skeleton'

export default function TravelerDashboardProfilePage() {
 const router = useRouter()
 const { user } = useAuth()
  const [profile, setProfile] = useState<TravelerProfile | null>(null)
// ============================================================================
// TRAVELER PROFILE EDITOR - REPLICATED FROM GUIDE PREMIUM EDITOR
// ============================================================================
// LOCATION: /frontend/app/dashboard/traveler/profile/page.tsx
// 
// PURPOSE: Allow travelers to edit their profile with premium UI
// ============================================================================

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import toast from 'react-hot-toast'
import {
 User,
 Camera,
 MapPin,
 Globe,
 Shield,
 CheckCircle,
 Edit2,
 Save,
 X,
 Plus,
 Trash2,
 Calendar,
 MessageSquare,
 Heart,
 Eye,
 Trophy,
 Sparkles,
 Info,
 Compass,
 TrendingUp,
 Medal,
 Gem
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTravelerProfile, completeTravelerProfile, TravelerProfile } from '@/src/lib/api/travelers'
import { travelerGetLoyaltyStatus, LoyaltyStatusResponse, LoyaltyTierType } from '@/src/lib/api/traveler'
import LoadingOverlay from '@/src/components/ui/LoadingOverlay'

import apiClient from '@/src/lib/api/client'

// ============================================================================
// LOYALTY TIER CONFIG
// Replicated from dashboard for consistency
// ============================================================================

const TIER_CONFIG: Record<LoyaltyTierType, {
  label: string
  icon: string
  badge: string
  text: string
  ring: string
  gradient: string
  discount: number
}> = {
  BRONZE: {
    label: 'Bronze',
    icon: '🥉',
    badge: 'bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/40 text-accent-light dark:text-accent-dark dark:text-amber-300',
    text: 'text-accent-light dark:text-accent-dark dark:text-amber-300',
    ring: 'ring-accent-light dark:ring-accent-dark/50',
    gradient: 'from-amber-500 to-orange-500',
    discount: 0
  },
  SILVER: {
    label: 'Silver',
    icon: '🥈',
    badge: 'bg-slate-100/60 text-slate-700',
    text: 'text-slate-600',
    ring: 'ring-slate-300/50',
    gradient: 'from-slate-400 to-gray-500',
    discount: 3
  },
  GOLD: {
    label: 'Gold',
    icon: '🥇',
    badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    text: 'text-yellow-700 dark:text-yellow-400',
    ring: 'ring-yellow-400/60',
    gradient: 'from-yellow-500 to-amber-400',
    discount: 5
  },
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colorClasses = {
    blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark border-primary-light dark:border-primary-dark/40',
    emerald: 'bg-success-green/10 text-success-green dark:text-emerald-400 border-success-green/40 dark:border-emerald-500/30',
    amber: 'bg-accent-light/10 text-accent-light dark:text-amber-400 border-accent-light dark:border-amber-500/30',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30'
  }

 return (
 <motion.div 
 whileHover={{ y: -4 }}
 className="p-3 sm:p-5 surface-card border border-theme rounded-2xl shadow-sm transition-all duration-300 overflow-hidden"
 >
 <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
 <div className={`p-2 sm:p-2.5 rounded-xl border flex-shrink-0 ${colorClasses[color as keyof typeof colorClasses]}`}>
 <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
 </div>
 <div className="min-w-0">
 <div className="text-base sm:text-xl font-extrabold text-theme-primary leading-none mb-1 truncate">{value}</div>
 <div className="text-[8px] sm:text-[10px] font-black capitalize tracking-normal text-theme-muted truncate">{label}</div>
 </div>
 </div>
 </motion.div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

import TravelerProfileLoading from './skeleton'

export default function TravelerDashboardProfilePage() {
 const router = useRouter()
 const { user } = useAuth()
  const [profile, setProfile] = useState<TravelerProfile | null>(null)
  const [loyalty, setLoyalty] = useState<LoyaltyStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<TravelerProfile>>({})
   const [newPreference, setNewPreference] = useState('')
   const [isAdding, setIsAdding] = useState(false)

   const [pendingFiles, setPendingFiles] = useState<{ avatarUrl?: File, coverImageUrl?: File }>({})

  useEffect(() => {
    async function load() {
      try {
        const [profileData, loyaltyData] = await Promise.all([
          getTravelerProfile(),
          travelerGetLoyaltyStatus().catch(() => null)
        ])
        setProfile(profileData)
        setLoyalty(loyaltyData)
        setFormData(profileData)
      } catch (err) {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

 const avatarInputRef = useRef<HTMLInputElement>(null)
 const coverInputRef = useRef<HTMLInputElement>(null)

 const handleAvatarClick = () => avatarInputRef.current?.click()
 const handleCoverClick = () => coverInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatarUrl' | 'coverImageUrl') => {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
  toast.error("Image too large. Please select a file under 5MB")
  return
  }

  const url = URL.createObjectURL(file)
  setFormData(prev => ({ ...prev, [type]: url }))
  setPendingFiles(prev => ({ ...prev, [type]: file }))
  e.target.value = ''
  }

  const handleSave = async () => {
  try {
  setLoading(true)

  let finalAvatarUrl = formData.avatarUrl
  let finalCoverUrl = formData.coverImageUrl

  const uploadToCloudinary = async (file: File) => {
  const res = await apiClient.get('/api/cloudinary/signature')
  const { signature, timestamp, apiKey, cloudName } = res.data || res
  const cloudFormData = new FormData()
  cloudFormData.append('file', file)
  cloudFormData.append('api_key', apiKey)
  cloudFormData.append('timestamp', timestamp)
  cloudFormData.append('signature', signature)
  cloudFormData.append('folder', 'tourongo/profiles')
  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: cloudFormData })
  if (!uploadRes.ok) throw new Error("Cloudinary upload failed")
  const data = await uploadRes.json()
  return data.secure_url
  }

  if (pendingFiles.avatarUrl) finalAvatarUrl = await uploadToCloudinary(pendingFiles.avatarUrl)
  if (pendingFiles.coverImageUrl) finalCoverUrl = await uploadToCloudinary(pendingFiles.coverImageUrl)

  const payloadToSave = { ...formData, avatarUrl: finalAvatarUrl, coverImageUrl: finalCoverUrl }

  const updated = await completeTravelerProfile(payloadToSave)
  setProfile(updated)
  setFormData(updated)
  setPendingFiles({})
  setIsEditing(false)
  toast.success('Profile updated successfully')
  } catch (err) {
  toast.error('Failed to update profile')
  } finally {
  setLoading(false)
  }
  }

 const handleAddPreference = () => {
 if (!newPreference.trim()) return
 const currentPrefs = formData.preferences || []
 if (currentPrefs.includes(newPreference.trim())) {
 toast.error('Preference already exists')
 return
 }
 setFormData({
 ...formData,
 preferences: [...currentPrefs, newPreference.trim()]
 })
 setNewPreference('')
 setIsAdding(false)
 }

 const handleRemovePreference = (index: number) => {
 const currentPrefs = formData.preferences || []
 setFormData({
 ...formData,
 preferences: currentPrefs.filter((_, i) => i !== index)
 })
 }

 if (loading && !profile) return <TravelerProfileLoading />
 if (!profile) return null

 return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
 <div className="max-w-6xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-10">
  
  {/* Premium Header Replicated */}
  <div className="relative mb-48 sm:mb-36">
  <div className="relative h-48 sm:h-64 rounded-3xl sm:rounded-[2rem] overflow-hidden surface-section border border-theme shadow-xl group">
  <Image
  src={formData.coverImageUrl || '/images/travelers/default-cover.jpg'}
  alt="Cover"
  fill
  className="object-cover transition-transform duration-1000 group-hover:scale-110"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
  <button 
  onClick={handleCoverClick}
  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60  text-white rounded-xl shadow-lg transition-all text-xs font-black capitalize tracking-normal sm:opacity-0 group-hover:opacity-100"
  >
  <Camera className="w-4 h-4" />
  Change Cover
  </button>
  </div>

  <div className="absolute -bottom-36 sm:-bottom-28 left-4 sm:left-8 flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-6">
    <div className="relative group/avatar">
      <div className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-3xl border-4 border-theme surface-card overflow-hidden shadow-2xl ring-2 ring-primary-light dark:ring-primary-dark/10 transition-all duration-700 hover:scale-105 group-hover/avatar:ring-4 group-hover/avatar:ring-primary-light dark:ring-primary-dark/30">
        <Image
          src={formData.avatarUrl || '/images/travelers/default-avatar.jpg'}
          alt="Avatar"
          fill
          className="object-cover"
        />
      </div>
      <button 
        onClick={handleAvatarClick}
        className="absolute -bottom-2 -right-2 p-2 bg-primary-light text-white rounded-xl shadow-lg hover:bg-primary-light-hover transition-all opacity-100 sm:opacity-0 group-hover/avatar:opacity-100 z-10"
      >
        <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>

    <div className="mb-4 sm:mb-6 space-y-0.5 sm:space-y-1">
      <h1 className="text-xl sm:text-4xl font-extrabold text-theme-primary tracking-tight drop-shadow-md break-words capitalize">
        {profile.fullName}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-1 bg-emerald-600 text-white text-[8px] sm:text-[10px] font-black capitalize tracking-normal rounded-full shadow-lg">
          Active Traveler
        </span>
        <span className="text-[9px] sm:text-xs font-bold text-theme-muted flex items-center gap-1 capitalize tracking-normal">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {profile.city}, {profile.country}
        </span>
      </div>
    </div>
  </div>

  <div className="absolute top-4 right-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
  {isEditing ? (
  <div className="flex gap-2">
  <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] sm:text-xs font-black capitalize tracking-normal rounded-xl transition-all shadow-xl">
  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
  Save
  </button>
  <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 surface-card text-theme-secondary text-[9px] sm:text-xs font-black capitalize tracking-normal rounded-xl border border-theme transition-all shadow-xl">
  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
  Cancel
  </button>
  </div>
  ) : (
  <div className="flex gap-2">
  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 surface-card text-theme-secondary text-[9px] sm:text-xs font-black capitalize tracking-normal rounded-xl border border-theme transition-all shadow-xl">
  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
  Edit
  </button>
  <Link href={`/travelers/${user?.travelerProfileId}`} className="flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 bg-primary-light hover:bg-primary-light-hover text-white text-[9px] sm:text-xs font-black capitalize tracking-normal rounded-xl transition-all shadow-xl">
  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
  View
  </Link>
  </div>
  )}
  </div>
  </div>

  {/* Stats Grid - Increased top margin for consistency with Guide profile */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-36 sm:mt-40 mb-6">
   <StatCard
     icon={Trophy}
     label="Loyalty Tier"
     value={TIER_CONFIG[profile.loyaltyTier as LoyaltyTierType]?.label || profile.loyaltyTier}
     color="amber"
   />
  <StatCard icon={Compass} label="Total Adventures" value={profile.completedTrips} color="blue" />
  <StatCard icon={Shield} label="Trust Level" value="Verified" color="emerald" />
  <StatCard icon={Sparkles} label="Impact Score" value="450" color="purple" />
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
  <div className="lg:col-span-2 space-y-10">
  
  <motion.section 
  whileHover={{ y: -4 }}
  className="surface-card p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border border-theme shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary-light dark:hover:border-primary-dark/20 space-y-6"
  >
  <h2 className="text-xl sm:text-2xl font-extrabold text-theme-primary flex items-center gap-3 capitalize tracking-tight">
  About Me
  </h2>
  {isEditing ? (
  <div className="space-y-6">
  <div>
  <label className="block text-[10px] font-black capitalize tracking-normal text-theme-muted mb-2">Headline / Tagline</label>
  <input
  type="text"
  value={formData.tagline || ''}
  onChange={(e) => setFormData({...formData, tagline: e.target.value})}
  className="w-full px-4 py-3 surface-section border-2 border-theme rounded-2xl focus:border-primary-light dark:border-primary-dark outline-none transition-all font-bold"
  placeholder="e.g. World traveler on a mission to see Lebanon's wonders"
  />
  </div>
  <div>
  <label className="block text-[10px] font-black capitalize tracking-normal text-theme-muted mb-2">My Story (Bio)</label>
  <textarea
  value={formData.bio || ''}
  onChange={(e) => setFormData({...formData, bio: e.target.value})}
  rows={6}
  className="w-full px-4 py-3 surface-section border-2 border-theme rounded-2xl focus:border-primary-light dark:border-primary-dark outline-none transition-all font-bold resize-none"
  placeholder="Tell us about your travel philosophy, favorite destinations, and what you look for in a tour..."
  />
  </div>
  </div>
  ) : (
  <div className="space-y-4">
  <p className="text-lg sm:text-xl font-extrabold text-primary-light dark:text-primary-dark italic capitalize tracking-tight">
  {profile.tagline || 'World Explorer'}
  </p>
  <p className="text-xs sm:text-sm text-theme-secondary font-bold leading-relaxed whitespace-pre-wrap break-words overflow-hidden opacity-80">
  {profile.bio || 'Add a bio to tell guides and other travelers about yourself!'}
  </p>
  </div>
  )}
  </motion.section>

  <motion.section 
  whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
  className="surface-section p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border border-theme shadow-sm transition-all duration-300 hover:shadow-lg hover:border-orange-500/20"
  >
  <div className="flex items-center justify-between mb-8">
  <h2 className="text-lg sm:text-xl font-extrabold text-theme-primary capitalize tracking-tight italic flex items-center gap-3">
  <Compass className="w-5 h-5 sm:w-6 h-6 text-orange-500" />
  Travel Interests
  </h2>
  {isEditing && (
  <button 
  onClick={() => setIsAdding(!isAdding)} 
  className={`p-2 rounded-xl transition-all ${isAdding ? 'bg-red-600/10 text-danger-red' : 'bg-primary-light/10 text-primary-light dark:text-primary-dark hover:bg-primary-light/20'}`}
  >
  {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
  </button>
  )}
  </div>

  {isEditing && isAdding && (
  <motion.div 
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-6 flex gap-3"
  >
  <input
  type="text"
  value={newPreference}
  onChange={(e) => setNewPreference(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && handleAddPreference()}
  placeholder="Type an interest (e.g. Hiking, History)..."
  className="flex-1 px-4 py-2.5 surface-card border-2 border-primary-light dark:border-primary-dark/20 focus:border-primary-light dark:border-primary-dark rounded-xl outline-none transition-all font-bold text-sm"
  autoFocus
  />
  <button 
  onClick={handleAddPreference}
  className="px-6 py-2.5 bg-primary-light text-white text-[10px] font-black capitalize tracking-normal rounded-xl shadow-lg hover:bg-primary-light-hover transition-all"
  >
  Add
  </button>
  </motion.div>
  )}
  
  <div className="flex flex-wrap gap-3">
  {formData.preferences?.map((pref, idx) => (
  <div key={idx} className="group relative">
  <span className="px-5 py-2.5 surface-card border border-theme rounded-2xl text-xs font-black text-theme-primary capitalize tracking-normal shadow-sm flex items-center gap-2">
  <Sparkles className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark" />
  {pref}
  {isEditing && (
  <button 
  onClick={() => handleRemovePreference(idx)}
  className="bg-danger-red/10 hover:bg-danger-red/20 p-1 rounded-md transition-colors"
  >
  <X className="w-3 h-3 text-danger-red cursor-pointer" />
  </button>
  )}
  </span>
  </div>
  ))}
  {!formData.preferences?.length && (
  <p className="text-sm font-bold text-theme-muted italic">No preferences set yet.</p>
  )}
  </div>
  </motion.section>
  </div>

  <div className="space-y-10">
   {/* Loyalty Card Premium Style */}
   <div className="surface-card p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border border-theme shadow-xl overflow-hidden relative group">
     <div className={`absolute top-0 right-0 w-40 h-40 bg-primary-light/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary-light/10 transition-colors`} />
     <h3 className="text-base sm:text-lg font-extrabold text-theme-primary mb-6 flex items-center gap-2 capitalize tracking-tight">
       <Trophy className="w-5 h-5 text-accent-light dark:text-accent-dark" />
       Loyalty Progress
     </h3>
     
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <div className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Current Tier</div>
           <div className="text-2xl font-black text-theme-primary flex items-center gap-2">
             <Medal className="w-6 h-6 text-accent-light dark:text-accent-dark" />
             {TIER_CONFIG[profile.loyaltyTier as LoyaltyTierType]?.label || profile.loyaltyTier}
           </div>
         </div>
         <div className="text-right">
           <div className="text-[10px] font-black text-theme-muted capitalize tracking-normal mb-1">Discount</div>
           <div className="text-2xl font-black text-success-green dark:text-emerald-400">
             {loyalty?.discountPct || 0}%
           </div>
         </div>
       </div>

       <div className="space-y-2">
         <div className="flex justify-between text-[10px] font-black capitalize tracking-normal">
           <span className="text-theme-muted">Progress</span>
           <span className="text-primary-light dark:text-primary-dark">{profile.completedTrips} Trips Total</span>
         </div>
         
         {loyalty && loyalty.tripsToNextTier > 0 ? (
           <>
             <div className="h-4 surface-section rounded-full overflow-hidden p-1 border border-theme">
               {/* Progress calculation synched with dashboard logic: (Current / (Current + Needed)) * 100 */}
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min((profile.completedTrips / (profile.completedTrips + loyalty.tripsToNextTier)) * 100, 100)}%` }}
                 className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg transition-all duration-1000"
               />
             </div>
             <p className="text-[9px] font-bold text-theme-muted text-center leading-relaxed">
               Only {loyalty.tripsToNextTier} more trip{loyalty.tripsToNextTier !== 1 ? 's' : ''} to reach <span className="text-primary-light dark:text-primary-dark capitalize">{loyalty.nextTier}</span> status!
             </p>
           </>
         ) : (
           <div className="text-center p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
             <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 capitalize tracking-[0.2em]">✨ Ultimate Tier Achieved</p>
           </div>
         )}
       </div>
     </div>
   </div>

  {/* Digital Security Card - Adjusted to be"whiter" and reflect traveler status */}
  <motion.div 
  whileHover={{ y: -4 }}
  className="surface-card p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border border-theme dark:border-theme shadow-xl relative overflow-hidden group transition-all duration-300 hover:shadow-2xl"
  >
  <div className="absolute top-0 right-0 w-32 h-32 bg-success-green/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-success-green/10 transition-colors" />
  <Shield className="absolute -bottom-8 -right-8 w-24 h-24 text-gray-100/5 rotate-12" />
  <h3 className="text-base sm:text-lg font-extrabold text-theme-primary mb-8 flex items-center gap-3 capitalize tracking-tight">
  <Shield className="w-5 h-5 sm:w-6 h-6 text-success-green" />
  Digital Security
  </h3>
  <div className="space-y-4">
  {/* Email Verification */}
  <div className="flex items-center justify-between p-4 surface-section rounded-2xl border border-theme dark:border-theme-strong">
  <div className="flex items-center gap-3">
  <CheckCircle className={`w-4 h-4 ${profile.emailVerified ? 'text-success-green' : 'text-theme-muted'}`} />
  <span className="text-[10px] font-black capitalize tracking-normal text-theme-secondary">Email Verified</span>
  </div>
  {profile.emailVerified && <div className="w-2 h-2 bg-success-green rounded-full animate-pulse" />}
  </div>

  {/* TFA - Shown as Disabled (it's not enabled now) */}
  <div className="flex items-center justify-between p-4 surface-section rounded-2xl border border-theme dark:border-theme-strong">
  <div className="flex items-center gap-3">
  <Shield className="w-4 h-4 text-primary-light dark:text-primary-dark" />
  <span className="text-[10px] font-black capitalize tracking-normal text-theme-secondary">Two-Factor Auth</span>
  </div>
  <div className="text-[8px] font-black text-danger-red capitalize tracking-normal bg-danger-red/10 dark:bg-red-900/20 px-2 py-0.5 rounded-md">Disabled</div>
  </div>
  </div>
  <button className="w-full mt-6 py-4 surface-base shadow-lg shadow-gray-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] text-white text-[10px] font-black capitalize tracking-[0.2em] rounded-2xl transition-all">
  Manage Security
  </button>
  </motion.div>

  </div>
  </div>

  {/* Hidden File Inputs */}
  <input
  type="file"
  ref={avatarInputRef}
  className="hidden"
  accept="image/*"
  onChange={(e) => handleFileChange(e, 'avatarUrl')}
  />
  <input
  type="file"
  ref={coverInputRef}
  className="hidden"
  accept="image/*"
  onChange={(e) => handleFileChange(e, 'coverImageUrl')}
  />
  
  </div>
  </div>
  )
}
