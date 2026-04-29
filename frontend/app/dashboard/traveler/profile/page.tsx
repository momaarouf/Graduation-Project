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
 blue: 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark border-primary-light dark:border-primary-dark/50 dark:border-primary-light dark:border-primary-dark/40',
 emerald: 'bg-success-green/10 dark:bg-emerald-950/30 text-success-green dark:text-emerald-400 border-success-green/50 dark:border-success-green/40',
 amber: 'bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/30 text-accent-light dark:text-accent-dark dark:text-amber-400 border-accent-light dark:border-accent-dark/50 dark:border-accent-light dark:border-accent-dark/40',
 purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100/50 dark:border-purple-800/40'
 }

 return (
 <motion.div 
 whileHover={{ y: -4 }}
 className="p-5 surface-card border border-theme dark:border-theme rounded-2xl shadow-sm transition-all duration-300"
 >
 <div className="flex items-center gap-4">
 <div className={`p-2.5 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
 <Icon className="w-5 h-5" />
 </div>
 <div>
 <div className="text-xl font-black text-theme-primary leading-none mb-1">{value}</div>
 <div className="text-[10px] font-black uppercase tracking-widest text-theme-muted">{label}</div>
 </div>
 </div>
 </motion.div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

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

 if (file.size > 2 * 1024 * 1024) {
 toast.error('Image is too large (max 2MB)')
 return
 }

 const reader = new FileReader()
 reader.onloadend = () => {
 setFormData(prev => ({ ...prev, [type]: reader.result as string }))
 }
 reader.readAsDataURL(file)
 }

 const handleSave = async () => {
 try {
 setLoading(true)
 const updated = await completeTravelerProfile(formData)
 setProfile(updated)
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

 if (loading && !profile) return <LoadingOverlay isVisible={true} message="Loading Profile..." />
 if (!profile) return null

 return (
 <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
 
 {/* Premium Header Replicated */}
 <div className="relative mb-36">
 <div className="relative h-48 sm:h-64 rounded-[2rem] overflow-hidden surface-section border border-theme shadow-xl group">
 <Image
 src={formData.coverImageUrl || '/images/travelers/default-cover.jpg'}
 alt="Cover"
 fill
 className="object-cover transition-transform duration-1000 group-hover:scale-110"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
 <button 
 onClick={handleCoverClick}
 className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60  text-white rounded-xl shadow-lg transition-all text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100"
 >
 <Camera className="w-4 h-4" />
 Change Cover
 </button>
 </div>

 <div className="absolute -bottom-28 left-4 sm:left-8 flex items-end gap-6">
 <div className="relative group/avatar">
 <div className="relative w-24 h-24 sm:w-40 sm:h-40 rounded-3xl border-4 border-theme surface-card overflow-hidden shadow-2xl ring-2 ring-primary-light dark:ring-primary-dark/10 transition-all duration-700 hover:scale-105 group-hover/avatar:ring-4 group-hover/avatar:ring-primary-light dark:ring-primary-dark/30">
 <Image
 src={formData.avatarUrl || '/images/travelers/default-avatar.jpg'}
 alt="Avatar"
 fill
 className="object-cover"
 />
 </div>
 <button 
 onClick={handleAvatarClick}
 className="absolute -bottom-2 -right-2 p-2.5 bg-primary-light text-white rounded-xl shadow-lg hover:bg-primary-light-hover transition-all hover:scale-110 opacity-0 group-hover/avatar:opacity-100 z-10"
 >
 <Camera className="w-5 h-5" />
 </button>
 </div>

 <div className="mb-6 space-y-1">
 <h1 className="text-2xl sm:text-4xl font-black text-theme-primary tracking-tight drop-shadow-sm group-hover:text-primary-light dark:text-primary-dark transition-colors">
 {profile.fullName}
 </h1>
 <div className="flex items-center gap-3">
 <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg hover:scale-105 transition-transform">
 Active Traveler
 </span>
 <span className="text-xs font-bold text-theme-muted flex items-center gap-1 hover:text-theme-secondary dark:hover:text-gray-300 transition-colors">
 <MapPin className="w-3.5 h-3.5" />
 {profile.city}, {profile.country}
 </span>
 </div>
 </div>
 </div>

 <div className="absolute top-4 right-4 flex gap-3">
 {isEditing ? (
 <>
 <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl hover:scale-105">
 <Save className="w-4 h-4" />
 Save
 </button>
 <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="flex items-center gap-2 px-6 py-2.5 surface-card text-theme-secondary text-xs font-black uppercase tracking-widest rounded-xl border border-theme transition-all shadow-xl">
 <X className="w-4 h-4" />
 Cancel
 </button>
 </>
 ) : (
 <>
 <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 surface-card text-theme-secondary text-xs font-black uppercase tracking-widest rounded-xl border border-theme transition-all shadow-xl hover:scale-105">
 <Edit2 className="w-4 h-4" />
 Edit Profile
 </button>
 <Link href={`/travelers/${user?.travelerProfileId}`} className="flex items-center gap-2 px-6 py-2.5 bg-primary-light hover:bg-primary-light-hover text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl hover:scale-105">
 <Eye className="w-4 h-4" />
 View Public
 </Link>
 </>
 )}
 </div>
 </div>

 {/* Stats Grid - Increased top margin for consistency with Guide profile */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-44 sm:mt-40 mb-6">
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
 className="surface-card p-10 rounded-[2.5rem] border border-theme shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary-light dark:hover:border-primary-dark/20 space-y-6"
 >
 <h2 className="text-2xl font-black text-theme-primary flex items-center gap-3">
 About Me
 </h2>
 {isEditing ? (
 <div className="space-y-6">
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2">Headline / Tagline</label>
 <input
 type="text"
 value={formData.tagline || ''}
 onChange={(e) => setFormData({...formData, tagline: e.target.value})}
 className="w-full px-4 py-3 surface-section border-2 border-theme rounded-2xl focus:border-primary-light dark:border-primary-dark outline-none transition-all font-bold"
 placeholder="e.g. World traveler on a mission to see Lebanon's wonders"
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2">My Story (Bio)</label>
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
 <p className="text-xl font-black text-primary-light dark:text-primary-dark dark:text-primary-dark italic">
 {profile.tagline || 'World Explorer'}
 </p>
 <p className="text-theme-secondary font-bold leading-relaxed whitespace-pre-wrap">
 {profile.bio || 'Add a bio to tell guides and other travelers about yourself!'}
 </p>
 </div>
 )}
 </motion.section>

 <motion.section 
 whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
 className="surface-section p-10 rounded-[2.5rem] border border-theme shadow-sm transition-all duration-300 hover:shadow-lg hover:border-orange-500/20"
 >
 <div className="flex items-center justify-between mb-8">
 <h2 className="text-xl font-black text-theme-primary uppercase tracking-tight italic flex items-center gap-3">
 <Compass className="w-6 h-6 text-orange-500" />
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
 className="px-6 py-2.5 bg-primary-light text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-primary-light-hover transition-all"
 >
 Add
 </button>
 </motion.div>
 )}
 
 <div className="flex flex-wrap gap-3">
 {formData.preferences?.map((pref, idx) => (
 <div key={idx} className="group relative">
 <span className="px-5 py-2.5 surface-card border border-theme rounded-2xl text-xs font-black text-theme-primary uppercase tracking-widest shadow-sm flex items-center gap-2">
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
  <div className="surface-card p-10 rounded-[2.5rem] border border-theme shadow-xl overflow-hidden relative group">
    <div className={`absolute top-0 right-0 w-40 h-40 bg-primary-light/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary-light/10 transition-colors`} />
    <h3 className="text-lg font-black text-theme-primary mb-6 flex items-center gap-2">
      <Trophy className="w-5 h-5 text-accent-light dark:text-accent-dark" />
      Loyalty Progress
    </h3>
    
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">Current Tier</div>
          <div className="text-2xl font-black text-theme-primary flex items-center gap-2">
            <Medal className="w-6 h-6 text-accent-light dark:text-accent-dark" />
            {TIER_CONFIG[profile.loyaltyTier as LoyaltyTierType]?.label || profile.loyaltyTier}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-theme-muted uppercase tracking-widest mb-1">Discount</div>
          <div className="text-2xl font-black text-success-green dark:text-emerald-400">
            {loyalty?.discountPct || 0}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
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
              Only {loyalty.tripsToNextTier} more trip{loyalty.tripsToNextTier !== 1 ? 's' : ''} to reach <span className="text-primary-light dark:text-primary-dark uppercase">{loyalty.nextTier}</span> status!
            </p>
          </>
        ) : (
          <div className="text-center p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
            <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-[0.2em]">✨ Ultimate Tier Achieved</p>
          </div>
        )}
      </div>
    </div>
  </div>

 {/* Digital Security Card - Adjusted to be"whiter" and reflect traveler status */}
 <motion.div 
 whileHover={{ y: -4 }}
 className="surface-card p-10 rounded-[2.5rem] border border-theme dark:border-theme shadow-xl relative overflow-hidden group transition-all duration-300 hover:shadow-2xl"
 >
 <div className="absolute top-0 right-0 w-32 h-32 bg-success-green/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-success-green/10 transition-colors" />
 <Shield className="absolute -bottom-8 -right-8 w-24 h-24 text-gray-100/5 rotate-12" />
 <h3 className="text-lg font-black text-theme-primary mb-8 flex items-center gap-3">
 <Shield className="w-6 h-6 text-success-green" />
 Digital Security
 </h3>
 <div className="space-y-4">
 {/* Email Verification */}
 <div className="flex items-center justify-between p-4 surface-section rounded-2xl border border-theme dark:border-theme-strong">
 <div className="flex items-center gap-3">
 <CheckCircle className={`w-4 h-4 ${profile.emailVerified ? 'text-success-green' : 'text-theme-muted'}`} />
 <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary">Email Verified</span>
 </div>
 {profile.emailVerified && <div className="w-2 h-2 bg-success-green rounded-full animate-pulse" />}
 </div>

 {/* TFA - Shown as Disabled (it's not enabled now) */}
 <div className="flex items-center justify-between p-4 surface-section rounded-2xl border border-theme dark:border-theme-strong">
 <div className="flex items-center gap-3">
 <Shield className="w-4 h-4 text-primary-light dark:text-primary-dark" />
 <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary">Two-Factor Auth</span>
 </div>
 <div className="text-[8px] font-black text-danger-red uppercase tracking-widest bg-danger-red/10 dark:bg-red-900/20 px-2 py-0.5 rounded-md">Disabled</div>
 </div>
 </div>
 <button className="w-full mt-6 py-4 surface-base shadow-lg shadow-gray-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all">
 Manage Security
 </button>
 </motion.div>

 </div>
 </div>
 <div className="h-20" /> {/* Spacer */}

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
 )
}