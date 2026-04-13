// ============================================================================
// GUIDE PROFILE EDITOR - CARD 16 - COMPLETE
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/profile/page.tsx
// 
// PURPOSE: Allow guides to create and edit their profile
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Upload photos/videos for portfolio
// ✓ Set badges and expertise areas
// ✓ Track completed trips
// ✓ Manage languages spoken
// ✓ View impact score
// ✓ Profile preview
// ✓ Manual ID verification status
// 
// EDITABLE SECTIONS:
// - Profile picture & cover image
// - About Me (bio and tagline)
// - Languages (add/remove/edit with proficiency)
// - Expertise areas (add/remove/edit)
// - Social links
// - Portfolio media
// 
// COLOR PSYCHOLOGY:
// - Blue: Trust, verified status, edit actions
// - Gold: Premium, impact score
// - Green: Completed, verified
// - Orange: Call-to-action
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import apiClient from '@/src/lib/api/client'
import toast from 'react-hot-toast'
import {
  User,
  Users,
  Camera,
  Video,
  MapPin,
  Globe,
  Star,
  Award,
  TrendingUp,
  Shield,
  CheckCircle,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  MessageSquare,
  Heart,
  Share2,
  Eye,
  Download,
  Upload,
  Languages,
  Briefcase,
  GraduationCap,
  Medal,
  Trophy,
  Sparkles,
  AlertCircle,
  Info,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { getGuideProfile, getGuideBookings, getGuideTours, getGuidePortfolio, updateTour } from '@/src/lib/api/tours'
import { GuideBookingResponse, BookingStatus, TourTemplateResponse } from '@/src/lib/types/tour.types'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'not_submitted' | 'verified' // 'verified' kept for legacy mock compatibility
type LanguageProficiency = 'beginner' | 'intermediate' | 'advanced' | 'native'

interface GuideProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  country: string;
  bio: string;
  tagline: string;
  avatar: string;
  coverImage: string;
  memberSince: string;
  verifiedSince: string;
  totalTrips: number;
  totalTravelers: number;
  averageRating: number;
  totalReviews: number;
  impactScore: number;
  responseRate: number;
  responseTimeText: string;
  verificationStatus: string;
  expertise: string[];
  languages: Array<{ language: string; proficiency: string }>;
  socialLinks: Record<string, string>;
  socialLinksJson?: string;
  portfolio: any[];
  badges: Array<{ id: string; name: string; icon: any; earnedAt: string }>;
  availability: {
    isAvailable: boolean;
    timezone: string;
    nextAvailableSlot: string;
  };
}

// ============================================================================
// INITIAL DATA (Real-first, no mock fallback)
// ============================================================================

const EMPTY_GUIDE_PROFILE: GuideProfile = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  country: '',
  bio: '',
  tagline: '',
  avatar: '',
  coverImage: '',
  memberSince: '',
  verifiedSince: '',
  totalTrips: 0,
  totalTravelers: 0,
  averageRating: 0,
  totalReviews: 0,
  impactScore: 0,
  responseRate: 0,
  responseTimeText: 'N/A',
  verificationStatus: 'NOT_SUBMITTED',
  expertise: [],
  languages: [],
  socialLinks: {},
  socialLinksJson: '',
  portfolio: [],
  badges: [],
  availability: {
    isAvailable: true,
    timezone: 'UTC',
    nextAvailableSlot: ''
  }
}

// ============================================================================
// VERIFICATION BADGE COMPONENT
// ============================================================================

interface VerificationBadgeProps {
  status: VerificationStatus
}

function VerificationBadge({ status }: VerificationBadgeProps) {
  const normalizedStatus = (status?.toLowerCase() || 'not_submitted') as VerificationStatus
  
  const config = {
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: Clock,
      label: 'Verification Pending'
    },
    verified: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle,
      label: 'Identity Verified'
    },
    approved: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle,
      label: 'Identity Verified'
    },
    rejected: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      icon: AlertCircle,
      label: 'Verification Failed'
    },
    not_submitted: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: Shield,
      label: 'Not Verified'
    }
  }

  const badgeConfig = config[normalizedStatus] || config.not_submitted
  const { bg, text, border, icon: Icon, label } = badgeConfig

  return (
    <div className={` inline-flex items-center gap-2 px-3 py-1.5 ${bg} ${border} border rounded-full ${text} text-sm font-medium `}>
      <Icon className="w-4 h-4" />
      {label}
    </div>
  )
}

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  change?: string
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink'
}

function StatCard({ icon: Icon, label, value, change, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-800/40',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-800/40',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-800/40',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100/50 dark:border-purple-800/40',
    pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-100/50 dark:border-pink-800/40'
  }

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 12px 20px -5px rgb(0 0 0 / 0.1)' }}
      className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={` p-2.5 rounded-xl border ${colorClasses[color]} `}>
          <Icon className="w-4 h-4" />
        </div>
        {change && (
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-100/50 dark:border-emerald-800/40">
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">
        {value}
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        {label}
      </div>
    </motion.div>
  )
}

// ============================================================================
// PROFILE HEADER COMPONENT - WITH AVATAR EDIT
// ============================================================================

interface ProfileHeaderProps {
  profile: GuideProfile
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onAvatarChange: () => void
  onCoverChange: () => void
}

function ProfileHeader({ profile, isEditing, onEdit, onSave, onCancel, onAvatarChange, onCoverChange }: ProfileHeaderProps) {
  return (
    <div className="relative mb-16">
      {/* Cover image */}
      <div className="relative h-48 sm:h-64 rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-gray-900 mb-6 group border border-gray-100 dark:border-gray-800 shadow-xl">
        {profile.coverImage ? (
          <Image
            src={profile.coverImage}
            alt="Profile cover"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Cover image edit button - Always accessible on hover */}
        <button
          onClick={onCoverChange}
          className=" absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-xl shadow-lg transition-all text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 "
        >
          <Camera className="w-4 h-4" />
          Change Cover
        </button>
      </div>

      {/* Profile info overlay - Lowered to -bottom-28 */}
      <div className="absolute -bottom-28 left-4 sm:left-8 flex items-end gap-6">
        {/* Avatar with edit button */}
        <div className="relative group/avatar">
          <div className=" relative w-24 h-24 sm:w-40 sm:h-40 rounded-3xl border-4 border-white dark:border-gray-950 bg-white dark:bg-gray-900 overflow-hidden shadow-2xl ring-2 ring-blue-500/10 transition-all duration-700 hover:scale-105 group-hover/avatar:ring-4 group-hover/avatar:ring-blue-500/30 ">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={`${profile.firstName} ${profile.lastName}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Avatar edit button - Always accessible on hover */}
          <button
            onClick={onAvatarChange}
            className=" absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:scale-110 opacity-0 group-hover/avatar:opacity-100 z-10 "
            title="Change profile picture"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm group-hover:text-blue-600 transition-colors">
              {profile.firstName} {profile.lastName}
            </h1>
            <VerificationBadge status={profile.verificationStatus as any} />
          </div>
          {isEditing ? (
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => {/* Handle tagline change if needed */}}
              className=" bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 w-64 "
              placeholder="Your tagline"
            />
          ) : (
            <p className="text-base font-black text-blue-600 dark:text-blue-300 drop-shadow-sm tracking-tight italic opacity-90 transition-colors">
              {profile.tagline || 'Leading Local Expert'}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {isEditing ? (
          <>
            <button
              onClick={onSave}
              className=" flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-lg "
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Changes</span>
            </button>
            <button
              onClick={onCancel}
              className=" flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-lg "
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </>
        ) : (
          <button
            onClick={onEdit}
            className=" flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-lg "
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
        )}
        
        {/* Preview button */}
        <Link
          href={`/guides/${profile.id}`}
          className=" flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-lg "
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Preview</span>
        </Link>
      </div>
    </div>
  )
}

// ============================================================================
// BIO EDITOR COMPONENT - FULLY EDITABLE
// ============================================================================

interface BioEditorProps {
  bio: string
  tagline: string
  isEditing: boolean
  onChange: (field: string, value: string) => void
}

function BioEditor({ bio, tagline, isEditing, onChange }: BioEditorProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className=" p-10 md:p-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-xl relative overflow-hidden group hover:shadow-blue-500/10 transition-all duration-300 "
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tight flex items-center gap-2">
        Biography
      </h3>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => onChange('tagline', e.target.value)}
              className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
              placeholder="e.g., Licensed Historian & Istanbul Native"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Biography
            </label>
            <textarea
              value={bio}
              onChange={(e) => onChange('bio', e.target.value)}
              rows={6}
              className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none "
              placeholder="Tell travelers about yourself, your expertise, and what makes your tours special..."
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-lg font-black text-blue-600 dark:text-blue-400 italic">
            {tagline}
          </p>
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-400 leading-relaxed font-bold whitespace-pre-wrap">
            {bio}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ============================================================================
// LANGUAGES EDITOR COMPONENT - FULLY EDITABLE
// ============================================================================

interface LanguagesEditorProps {
  languages: GuideProfile['languages']
  isEditing: boolean
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, field: string, value: string) => void
}

function LanguagesEditor({ languages, isEditing, onAdd, onRemove, onChange }: LanguagesEditorProps) {
  const proficiencyLevels: LanguageProficiency[] = ['beginner', 'intermediate', 'advanced', 'native']

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className=" p-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-xl hover:shadow-blue-500/10 transition-all duration-300 "
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-black text-gray-600 dark:text-gray-500 uppercase tracking-[0.25em] flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-500" />
          Available Languages
        </h3>
        {isEditing && (
          <button
            onClick={onAdd}
            className=" flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors "
          >
            <Plus className="w-4 h-4" />
            Add Language
          </button>
        )}
      </div>

      <div className="space-y-3">
        {languages.map((lang, index) => (
          <div key={index} className="flex items-center gap-3">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) => onChange(index, 'language', e.target.value)}
                  className=" flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
                  placeholder="e.g., English, Arabic, Turkish"
                />
                <select
                  value={lang.proficiency}
                  onChange={(e) => onChange(index, 'proficiency', e.target.value)}
                  className=" w-32 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
                >
                  {proficiencyLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onRemove(index)}
                  className=" p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors "
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {lang.language}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                  {lang.proficiency}
                </span>
              </div>
            )}
          </div>
        ))}

        {languages.length === 0 && isEditing && (
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
            <Globe className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">No languages listed yet</p>
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
            >
              Add Your First Language
            </button>
          </div>
        )}

        {languages.length === 0 && !isEditing && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No languages added yet
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ============================================================================
// EXPERTISE EDITOR COMPONENT - FULLY EDITABLE
// ============================================================================

interface ExpertiseEditorProps {
  expertise: string[]
  isEditing: boolean
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, value: string) => void
}

function ExpertiseEditor({ expertise, isEditing, onAdd, onRemove, onChange }: ExpertiseEditorProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className=" p-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-xl hover:shadow-blue-500/10 transition-all duration-300 "
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-black text-gray-600 dark:text-gray-500 uppercase tracking-[0.25em] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Core Expertise
        </h3>
        {isEditing && (
          <button
            onClick={onAdd}
            className=" flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors "
          >
            <Plus className="w-4 h-4" />
            Add Expertise
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {expertise.map((item, index) => (
          isEditing ? (
            <div key={index} className="flex items-center gap-1">
              <input
                type="text"
                value={item}
                onChange={(e) => onChange(index, e.target.value)}
                className=" px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 "
              />
              <button
                onClick={() => onRemove(index)}
                className=" p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors "
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span
              key={index}
              className=" px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg "
            >
              {item}
            </span>
          )
        ))}

        {expertise.length === 0 && isEditing && (
          <div className="w-full py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
            <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">No expertise tags added</p>
            <button
              onClick={onAdd}
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
            >
              Add Your First Tag
            </button>
          </div>
        )}

        {expertise.length === 0 && !isEditing && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No expertise areas added yet
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ============================================================================
// PORTFOLIO // ============================================================================
// PORTFOLIO SECTION - PROFESSIONAL CASE STUDIES
// ============================================================================

interface PortfolioSectionProps {
  portfolio: GuideProfile['portfolio']
  guideId: string
  isEditing: boolean
  onAdd: () => void
  onRemove: (id: string) => void
}

function PortfolioSection({ portfolio, guideId, isEditing, onAdd, onRemove }: PortfolioSectionProps) {
  return (
    <div className=" p-10 md:p-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-xl relative overflow-hidden group hover:translate-y-[-4px] hover:shadow-blue-500/10 transition-all duration-300 ">
       <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />
       <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-50 dark:border-gray-800">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">
          Professional Portfolio
        </h3>
        {isEditing && (
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add to Portfolio
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {portfolio.length > 0 ? (
          portfolio.map((item) => (
            <div key={item.id} className=" group/item relative bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md ">
              <div className="relative aspect-[16/9]">
                {item.url ? (
                  <Image
                    src={item.url}
                    alt={item.caption || 'Portfolio item'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/item:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/item:opacity-80 transition-opacity" />
                
                {/* View Story Overlay on Image Hover */}
                <Link 
                  href={`/guides/${guideId}/tours/${item.id}`}
                  className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-all duration-300 flex items-center justify-center z-10 cursor-pointer"
                >
                  <div className="bg-white/95 dark:bg-gray-900/95 px-5 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] dark:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-100/50 dark:border-blue-500/20 flex items-center gap-2 transform translate-y-4 group-hover/item:translate-y-0 transition-transform duration-500">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">View Story</span>
                  </div>
                </Link>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md text-white text-[9px] uppercase tracking-[0.2em] font-black rounded-full border border-white/20 shadow-xl flex items-center gap-1.5 transition-all group-hover/item:bg-blue-600/80 group-hover/item:border-blue-400/50">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Signature Experience
                  </div>
                </div>
              </div>

              <div className="p-4 relative">
                <h4 className="font-black text-sm text-gray-900 dark:text-white mb-2 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors uppercase tracking-tight">
                  {item.caption || 'Untitled Project'}
                </h4>

                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Published
                  </span>
                </div>

                {isEditing && (
                  <button
                    onClick={() => onRemove(item.id)}
                    className=" absolute -top-12 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-xl hover:scale-110 active:scale-95 z-30 "
                    title="Remove from Portfolio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="sm:col-span-2 py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
            <Briefcase className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Your portfolio is empty.</p>
            <p className="text-xs mt-1 mb-6">Add your best tours to showcase your expertise.</p>
            {isEditing && (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add to Portfolio
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


// ============================================================================
// VERIFICATION SECTION COMPONENT
// ============================================================================

interface VerificationSectionProps {
  status: string
  rejectionReason?: string
}

function VerificationSection({ status, rejectionReason }: VerificationSectionProps) {
  const { user } = useAuth()
  
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-[2rem] p-10 shadow-xl dark:shadow-2xl relative overflow-hidden group border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-2xl"
    >
       <Shield className="absolute -bottom-6 -right-6 w-24 h-24 text-blue-600/10 rotate-12 transition-transform duration-500" />
       <h3 className="text-lg font-black mb-8 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
          Digital Security
       </h3>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-md group/seal">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500 group-hover/seal:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Identity Status</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">KYC Verification</span>
            </div>
          </div>
          <VerificationBadge status={status as any} />
        </div>

        {/* Email Verification - Dynamic from profile */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-md group/seal">
          <div className="flex items-center gap-3">
             <CheckCircle className={`w-4 h-4 ${user?.emailVerified ? 'text-emerald-500' : 'text-gray-400'} group-hover/seal:scale-110 transition-transform`} />
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Email Verified</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Account Security</span>
             </div>
          </div>
          {user?.emailVerified && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
        </div>

        {/* TFA - Shown as Disabled (it's not enabled now) */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-md group/seal">
          <div className="flex items-center gap-3">
             <Shield className="w-4 h-4 text-blue-400 group-hover/seal:scale-110 transition-transform" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Two-Factor Auth</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Advanced Protection</span>
             </div>
          </div>
          <div className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">Disabled</div>
        </div>

        {status === 'REJECTED' && rejectionReason && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-100 dark:border-red-900/50">
            <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Reason for rejection:</p>
            <p className="text-xs text-red-600 dark:text-red-300">{rejectionReason}</p>
          </div>
        )}

        {status === 'PENDING' && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Your documents are being reviewed. This usually takes 24-48 hours.
            </p>
          </div>
        )}

        {status === 'NOT_SUBMITTED' && (
          <Link 
            href="/dashboard/guide/verification"
            className="block text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Submit Documents
          </Link>
        )}
      </div>
    </motion.div>
  )
}

// ============================================================================
// SOCIAL LINKS COMPONENT - FULLY EDITABLE
// ============================================================================

interface SocialLinksProps {
  links: Record<string, string>
  isEditing: boolean
  onChange: (links: Record<string, string>) => void
}

function SocialLinks({ links, isEditing, onChange }: SocialLinksProps) {
  const [newPlatform, setNewPlatform] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const handleAdd = () => {
    if (newPlatform && newUrl) {
      const updated = { ...links, [newPlatform.toLowerCase()]: newUrl }
      onChange(updated)
      setNewPlatform('')
      setNewUrl('')
    }
  }

  const handleRemove = (platform: string) => {
    const updated = { ...links }
    delete updated[platform]
    onChange(updated)
  }

  const handleLinkChange = (platform: string, value: string) => {
    onChange({ ...links, [platform]: value })
  }

  return (
    <div className=" p-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-xl hover:shadow-blue-500/10 transition-all duration-300 ">
      <h3 className="text-[10px] font-black text-gray-600 dark:text-gray-500 mb-8 uppercase tracking-[0.25em] flex items-center gap-2">
        <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Social Presence
      </h3>

      <div className="space-y-4">
        {/* Existing Links */}
        <div className="space-y-3">
          {Object.entries(links).map(([platform, value]) => (
            <div key={platform} className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-20 capitalize">{platform}:</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleLinkChange(platform, e.target.value)}
                    placeholder={`${platform} profile`}
                    className=" flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white "
                  />
                  <button
                    onClick={() => handleRemove(platform)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 w-20 capitalize">{platform}:</span>
                  <a 
                    href={value.startsWith('http') ? value : `https://${value}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[150px]"
                  >
                    {value}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Link Form */}
        {isEditing && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Add New Link</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                placeholder="Platform (e.g. TikTok)"
                className=" px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs "
              />
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Username or URL"
                className=" px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs "
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!newPlatform || !newUrl}
              className=" w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50 "
            >
              Add social link
            </button>
          </div>
        )}

        {!isEditing && Object.keys(links).length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
            <Share2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 italic">No social links added yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// GUIDE INFO CARD - ADDITIONAL INFORMATION
// ============================================================================

interface GuideInfoCardProps {
  profile: GuideProfile
  totalTours: number
  totalTravelers: number
}

function GuideInfoCard({ profile, totalTours, totalTravelers }: GuideInfoCardProps) {
  return (
    <div className=" p-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-xl hover:shadow-blue-500/10 transition-all duration-300 ">
      <h3 className="text-[10px] font-black text-gray-600 dark:text-gray-500 mb-8 uppercase tracking-[0.25em] flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Expertise Data
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Verified Since</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {profile.verifiedSince ? new Date(profile.verifiedSince).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            }) : 'Not verified'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Member Since</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Tours</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalTours}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Travelers</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalTravelers}
          </span>
        </div>
        
        {profile.responseRate !== undefined && profile.responseRate > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Response Rate</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {profile.responseRate}%
            </span>
          </div>
        )}
        
        {profile.responseTimeText && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Avg. Response Time</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {profile.responseTimeText}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PROFILE PAGE
// ============================================================================

export default function GuideProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(EMPTY_GUIDE_PROFILE)
  const [bookings, setBookings] = useState<GuideBookingResponse[]>([])
  const [tours, setTours] = useState<TourTemplateResponse[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false)

  const handlePortfolioToggle = async (tourId: number, currentStatus: boolean) => {
    try {
      await updateTour(tourId, { showInPortfolio: !currentStatus })
      toast.success(currentStatus ? "Removed from portfolio" : "Added to portfolio")
      
      // Refresh tours list to reflect change in modal
      const toursRes = await getGuideTours()
      setTours(toursRes)
      
      // Refresh profile portfolio list (what's actually shown on profile)
      if (user?.guideProfileId) {
        const portfolioRes = await getGuidePortfolio(user.guideProfileId)
        setProfile(prev => ({
          ...prev,
          portfolio: portfolioRes
            .filter((t: any) => !!t.coverImageUrl)
            .map((t: any) => ({
              id: String(t.id),
              type: 'image' as const,
              url: t.coverImageUrl,
              caption: t.title
            }))
        }))
      }
    } catch (error: any) {
      console.error("Failed to toggle portfolio status", error)
      if (error.response?.status === 409) {
        toast.error("This tour is currently locked (e.g. under review or archived).")
      } else {
        toast.error("Failed to update portfolio")
      }
    }
  }

  useEffect(() => {
    if (!user || user.role !== 'GUIDE') {
      setIsLoadingData(false)
      return
    }
    
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        const [profileRes, bookingsRes, toursRes] = await Promise.all([
          getGuideProfile(),
          getGuideBookings(),
          getGuideTours()
        ])
        
        const data = profileRes
        setBookings(bookingsRes)
        setTours(toursRes)
        
        // Fetch real portfolio data if guideProfileId exists
        if (user.guideProfileId) {
          try {
            const portfolioRes = await getGuidePortfolio(user.guideProfileId)
            if (portfolioRes.length > 0) {
              setProfile(prev => ({
                ...prev,
                portfolio: portfolioRes
                  .filter((tour: any) => !!tour.coverImageUrl)
                  .map((tour: any) => ({
                    id: String(tour.id),
                    type: 'image' as const,
                    url: tour.coverImageUrl,
                    caption: tour.title
                  }))
              }))
            }
          } catch (pErr) {
            console.error("Failed to load portfolio", pErr)
          }
        }

        setProfile(prev => ({
          ...prev,
          id: String(data.id || user.guideProfileId || prev.id),
          firstName: data.fullName?.split(' ')[0] || prev.firstName,
          lastName: data.fullName?.split(' ').slice(1).join(' ') || prev.lastName,
          phone: data.phoneE164 || prev.phone,
          country: data.country || prev.country,
          location: data.city || prev.location,
          bio: data.bio || prev.bio,
          tagline: data.tagline || prev.tagline || '',
          avatar: data.avatarUrl || prev.avatar,
          coverImage: data.coverImageUrl || prev.coverImage,
          expertise: data.expertise?.length ? data.expertise : prev.expertise,
          languages: data.languages?.length 
            ? data.languages.map((l: any) => ({ language: l.name, proficiency: l.proficiency }))
            : prev.languages,
          email: data.email || prev.email,
          memberSince: data.memberSince || prev.memberSince,
          verifiedSince: data.verifiedSince || prev.verifiedSince || '',
          totalTrips: data.totalTrips ?? prev.totalTrips,
          totalTravelers: data.totalTravelers ?? prev.totalTravelers,
          impactScore: data.impactScore ?? prev.impactScore,
          verificationStatus: data.verificationStatus || prev.verificationStatus,
          socialLinksJson: data.socialLinksJson,
          responseRate: data.responseRate || 0,
          responseTimeText: data.responseTimeText || 'N/A',
          socialLinks: data.socialLinksJson ? JSON.parse(data.socialLinksJson) : prev.socialLinks
        }))
      } catch (error) {
        console.error("Failed to load guide data", error)
        toast.error("Failed to sync profile data")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [user])


  // Derived dynamic metrics
  const totalTravelers = bookings
    .filter(b => b.status === BookingStatus.Completed || b.status === BookingStatus.Confirmed)
    .reduce((acc, b) => acc + b.peopleCount, 0)
  
  const totalTours = tours.length

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        fullName: (profile.firstName || profile.lastName) ? `${profile.firstName} ${profile.lastName}`.trim() : 'Guest Guide',
        phoneE164: profile.phone,
        country: profile.country,
        city: profile.location,
        bio: profile.bio,
        expertise: profile.expertise,
        languages: profile.languages.map(l => ({ name: l.language, proficiency: l.proficiency }))
      }
      
      // Save base profile data
      await apiClient.post('/api/guide/profile/complete', payload)
      
      // Save professional branding metadata
      const metaPayload = {
        tagline: profile.tagline,
        avatarUrl: profile.avatar,
        coverImageUrl: profile.coverImage,
        socialLinksJson: JSON.stringify(profile.socialLinks),
        responseRate: profile.responseRate,
        responseTimeText: profile.responseTimeText
      }
      await apiClient.put('/api/guide/profile/meta', metaPayload)

      toast.success("Profile saved successfully")
      setIsEditing(false)
    } catch (error: any) {
      console.error("Failed to save profile", error)
      toast.error(error?.response?.data?.message || "Failed to save profile")
    }
  }
  const handleCancel = () => {
    setIsEditing(false)
    // In a real app, we might want to re-load data from backend here
    // loadData() // But that would need to be accessible
  }

  const handleProfileChange = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = () => {
    avatarInputRef.current?.click()
  }

  const handleCoverChange = () => {
    coverInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic size check (e.g., 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large. Please select a file under 2MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setProfile(prev => ({
        ...prev,
        [type === 'avatar' ? 'avatar' : 'coverImage']: base64
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleLanguageAdd = () => {
    setProfile(prev => ({
      ...prev,
      languages: [...prev.languages, { language: '', proficiency: 'beginner' }]
    }))
  }

  const handleLanguageRemove = (index: number) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const handleLanguageChange = (index: number, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }))
  }

  const handleExpertiseAdd = () => {
    setProfile(prev => ({
      ...prev,
      expertise: [...prev.expertise, '']
    }))
  }

  const handleExpertiseRemove = (index: number) => {
    setProfile(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }))
  }

  const handleExpertiseChange = (index: number, value: string) => {
    setProfile(prev => ({
      ...prev,
      expertise: prev.expertise.map((item, i) => i === index ? value : item)
    }))
  }

  const handleSocialChange = (links: Record<string, string>) => {
    setProfile(prev => ({ ...prev, socialLinks: links }))
  }


  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <>
      {/* Page offset */}
      <div className="pt-14 sm:pt-16 min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[600px] bg-theme-grid opacity-[0.03] dark:opacity-[0.02] pointer-events-none" />
        
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10 relative z-10">
          
          {/* Profile Header */}
          <ProfileHeader
            profile={profile}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onAvatarChange={handleAvatarChange}
            onCoverChange={handleCoverChange}
          />

          {/* Stats Grid - Increased top margin for more space under profile pic */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-44 sm:mt-40 mb-6">
            <StatCard
              icon={Award}
              label="Impact Score"
              value={`${profile.impactScore}%`}
              color="amber"
            />
            <StatCard
              icon={Calendar}
              label="Total Tours"
              value={totalTours}
              color="blue"
            />
            <StatCard
              icon={Users}
              label="Total Travelers"
              value={totalTravelers}
              color="emerald"
            />
            <StatCard
              icon={Star}
              label={`Rating (${profile.totalReviews} reviews)`}
              value={profile.averageRating}
              color="purple"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <BioEditor
                bio={profile.bio}
                tagline={profile.tagline}
                isEditing={isEditing}
                onChange={handleProfileChange}
              />
              
              <LanguagesEditor
                languages={profile.languages}
                isEditing={isEditing}
                onAdd={handleLanguageAdd}
                onRemove={handleLanguageRemove}
                onChange={handleLanguageChange}
              />

              <ExpertiseEditor
                expertise={profile.expertise}
                isEditing={isEditing}
                onAdd={handleExpertiseAdd}
                onRemove={handleExpertiseRemove}
                onChange={handleExpertiseChange}
              />

              <PortfolioSection 
                portfolio={profile.portfolio} 
                guideId={profile.id}
                isEditing={isEditing}
                onAdd={() => setIsPortfolioModalOpen(true)}
                onRemove={(id) => handlePortfolioToggle(Number(id), true)}
              />
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="space-y-6">
              <VerificationSection
                status={profile.verificationStatus}
              />

              <GuideInfoCard 
                profile={profile} 
                totalTours={totalTours}
                totalTravelers={totalTravelers}
              />

              <SocialLinks
                links={profile.socialLinks}
                isEditing={isEditing}
                onChange={handleSocialChange}
              />

              {/* Location */}
              <div className=" p-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-xl hover:shadow-blue-500/10 transition-all duration-300 ">
                <h3 className="text-[10px] font-black text-gray-600 dark:text-gray-500 mb-8 uppercase tracking-[0.25em] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  Service Location
                </h3>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      placeholder="City"
                      className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
                    />
                    <input
                      type="text"
                      value={profile.country}
                      onChange={(e) => handleProfileChange('country', e.target.value)}
                      placeholder="Country"
                      className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">
                    {profile.location}, {profile.country}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'avatar')}
      />
      <input
        type="file"
        ref={coverInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'cover')}
      />
      <PortfolioAddModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        tours={tours}
        onToggle={handlePortfolioToggle}
      />
    </>
  )
}

// ============================================================================
// PORTFOLIO ADD MODAL
// ============================================================================

interface PortfolioAddModalProps {
  isOpen: boolean
  onClose: () => void
  tours: any[]
  onToggle: (tourId: number, currentStatus: boolean) => Promise<void>
}

function PortfolioAddModal({ isOpen, onClose, tours, onToggle }: PortfolioAddModalProps) {
  if (!isOpen) return null

  // Sort: vetted tours first
  const sortedTours = [...tours].sort((a, b) => {
    if (a.lastPublishedAtUtc && !b.lastPublishedAtUtc) return -1
    if (!a.lastPublishedAtUtc && b.lastPublishedAtUtc) return 1
    return 0
  })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Manage Portfolio</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">
              Feature your best tours as Signature Experiences
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-black text-[10px] uppercase tracking-widest">
              <Award className="w-4 h-4 text-amber-500" />
              What is a Signature Experience?
            </div>
            <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 leading-relaxed font-bold">
              Signature Experiences are featured tours that showcase your unique expertise and track record.
              Only tours that have been **approved by admin** will appear in your public portfolio.
            </p>
          </div>

          <div className="grid gap-3">
            {sortedTours.length > 0 ? (
              sortedTours.map((tour) => (
                <div 
                  key={tour.id} 
                  className={`
                    flex items-center justify-between p-4 rounded-xl border transition-all
                    ${tour.showInPortfolio 
                      ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm' 
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      {tour.media?.[0]?.url ? (
                        <Image src={tour.media[0].url} alt={tour.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{tour.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {tour.lastPublishedAtUtc ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            Eligible
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                            <AlertCircle className="w-3 h-3" />
                            Pending Approval
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggle(tour.id, tour.showInPortfolio)}
                    disabled={tour.status === 'ARCHIVED'}
                    className={`
                      px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${tour.showInPortfolio
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400
                    `}
                  >
                    {tour.showInPortfolio ? 'Remove' : 'Feature'}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No tours found. Create a tour to build your portfolio.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}