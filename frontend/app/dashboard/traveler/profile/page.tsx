// ============================================================================
// TRAVELER PROFILE & VERIFICATION - CARD 14
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/traveler/profile/page.tsx
// 
// PURPOSE: Display and manage traveler profile, loyalty tiers, and preferences
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Track loyalty levels (Bronze → Silver → Gold → Platinum)
// ✓ View completed trips count
// ✓ Profile information management
// ✓ Review reminder preferences
// ✓ Streak tracking
// 
// LOYALTY TIERS:
// - Bronze: 0-2 trips (0% discount)
// - Silver: 3-9 trips (3% discount)
// - Gold: 10-24 trips (5% discount)
// - Platinum: 25+ trips (8% discount)
// 
// COLOR PSYCHOLOGY:
// - Blue: Trust, primary information
// - Gold: Loyalty, premium tiers
// - Green: Success, verified
// - Purple: Special achievements
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import apiClient from '@/src/lib/api/client'
import toast from 'react-hot-toast'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Star,
  TrendingUp,
  Settings,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  CheckCircle,
  Edit2,
  Camera,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Save,
  X,
  AlertCircle,
  HelpCircle,
  FileText,
  CreditCard,
  Heart,
  MessageSquare,
  Clock,
  Sparkles,
  Gem,
  Medal,
  Trophy
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

interface TravelerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  coverImage?: string
  dateOfBirth?: string
  nationality?: string
  languages: string[]
  memberSince: string
  totalTrips: number
  completedTrips: number
  cancelledTrips: number
  loyaltyTier: LoyaltyTier
  streakCount: number
  longestStreak: number
  reviewReminderEnabled: boolean
  newsletterOptIn: boolean
  twoFactorEnabled: boolean
  emailVerified: boolean
  phoneVerified: boolean
  averageRating: number
  totalReviews: number
  savedAmount: number
  referralCode: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
}

interface LoyaltyTierInfo {
  name: LoyaltyTier
  displayName: string
  minTrips: number
  maxTrips: number
  discount: number
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  icon: React.ElementType
  benefits: string[]
}

interface TripStat {
  year: number
  month: string
  count: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PROFILE: TravelerProfile = {
  id: 'trav-123',
  firstName: 'Ahmed',
  lastName: 'Khan',
  email: 'ahmed.khan@example.com',
  phone: '+961 76 123 456',
  avatar: '/images/travelers/ahmed.jpg',
  coverImage: '/images/travelers/cover.jpg',
  dateOfBirth: '1985-06-15',
  nationality: 'Lebanon',
  languages: ['English', 'Arabic', 'French'],
  memberSince: '2025-06-15',
  totalTrips: 24,
  completedTrips: 22,
  cancelledTrips: 2,
  loyaltyTier: 'gold',
  streakCount: 12,
  longestStreak: 15,
  reviewReminderEnabled: true,
  newsletterOptIn: true,
  twoFactorEnabled: false,
  emailVerified: true,
  phoneVerified: true,
  averageRating: 4.8,
  totalReviews: 18,
  savedAmount: 342,
  referralCode: 'AHMED2025',
  emergencyContact: {
    name: 'Fatima Khan',
    relationship: 'Spouse',
    phone: '+961 70 789 012'
  }
}

const MOCK_TIER_INFO: Record<LoyaltyTier, LoyaltyTierInfo> = {
  bronze: {
    name: 'bronze',
    displayName: 'Bronze',
    minTrips: 0,
    maxTrips: 2,
    discount: 0,
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-300',
    icon: Medal,
    benefits: [
      'Welcome to SafariHub',
      'Basic support',
      'Standard booking'
    ]
  },
  silver: {
    name: 'silver',
    displayName: 'Silver',
    minTrips: 3,
    maxTrips: 9,
    discount: 3,
    color: 'gray',
    bgColor: 'bg-gray-50 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    textColor: 'text-gray-700 dark:text-gray-300',
    icon: Medal,
    benefits: [
      '3% discount on all tours',
      'Priority support',
      'Early access to new tours'
    ]
  },
  gold: {
    name: 'gold',
    displayName: 'Gold',
    minTrips: 10,
    maxTrips: 24,
    discount: 5,
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-300',
    icon: Gem,
    benefits: [
      '5% discount on all tours',
      'VIP support',
      'Free cancellations',
      'Exclusive deals'
    ]
  },
  platinum: {
    name: 'platinum',
    displayName: 'Platinum',
    minTrips: 25,
    maxTrips: Infinity,
    discount: 8,
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: Trophy,
    benefits: [
      '8% discount on all tours',
      '24/7 dedicated support',
      'Free cancellations',
      'Exclusive experiences',
      'Guide meet & greet'
    ]
  }
}

const MOCK_TRIP_HISTORY: TripStat[] = [
  { year: 2025, month: 'Jun', count: 2 },
  { year: 2025, month: 'Jul', count: 3 },
  { year: 2025, month: 'Aug', count: 4 },
  { year: 2025, month: 'Sep', count: 3 },
  { year: 2025, month: 'Oct', count: 5 },
  { year: 2025, month: 'Nov', count: 2 },
  { year: 2025, month: 'Dec', count: 3 },
  { year: 2026, month: 'Jan', count: 4 },
  { year: 2026, month: 'Feb', count: 3 },
  { year: 2026, month: 'Mar', count: 2 }
]

// ============================================================================
// PROFILE HEADER COMPONENT
// ============================================================================

interface ProfileHeaderProps {
  profile: TravelerProfile
  onEdit: () => void
}

function ProfileHeader({ profile, onEdit }: ProfileHeaderProps) {
  const tier = MOCK_TIER_INFO[profile.loyaltyTier]
  const TierIcon = tier.icon

  return (
    <div className="relative mb-8">
      {/* Cover image - added mb-6 for spacing below */}
      <div className="h-48 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 mb-6">
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt="Profile cover"
            fill
            className="object-cover opacity-50"
          />
        )}
      </div>

      {/* Profile info overlay */}
      <div className="absolute -bottom-21 left-4 sm:left-8 flex items-end gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="
            w-24 h-24 sm:w-32 sm:h-32
            rounded-2xl
            border-4 border-white dark:border-gray-900
            bg-white dark:bg-gray-900
            overflow-hidden
            shadow-xl
          ">
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
          <button className="
            absolute -bottom-1 -right-1
            p-1.5
            bg-blue-600 hover:bg-blue-700
            text-white
            rounded-lg
            shadow-lg
            transition-colors
          ">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Name and tier */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            {profile.firstName} {profile.lastName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`
              inline-flex items-center gap-1
              px-3 py-1
              ${tier.bgColor}
              ${tier.borderColor}
              border
              rounded-full
              ${tier.textColor}
              text-sm font-medium
            `}>
              <TierIcon className="w-4 h-4" />
              {tier.displayName} Tier
            </div>
            <span className="text-white/90 text-sm">
              Member since {new Date(profile.memberSince).getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* Edit button */}
      <button
        onClick={onEdit}
        className="
          absolute top-4 right-4
          flex items-center gap-2
          px-4 py-2
          bg-white/90 dark:bg-gray-900/90
          backdrop-blur-sm
          text-gray-700 dark:text-gray-300
          rounded-lg
          hover:bg-white dark:hover:bg-gray-900
          transition-colors
          shadow-lg
        "
      >
        <Edit2 className="w-4 h-4" />
        <span className="hidden sm:inline">Edit Profile</span>
      </button>
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
  subtext?: string
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink'
  trend?: 'up' | 'down'
  trendValue?: string
}

function StatCard({ icon: Icon, label, value, subtext, color, trend, trendValue }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400'
  }

  return (
    <div className="
      p-5
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
      hover:shadow-md
      transition-shadow
    ">
      <div className="flex items-start justify-between mb-3">
        <div className={`
          p-2.5
          rounded-lg
          ${colorClasses[color]}
        `}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`
            text-xs font-medium
            ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
          `}>
            {trendValue}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </div>
        {subtext && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {subtext}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// LOYALTY PROGRESS COMPONENT
// ============================================================================

interface LoyaltyProgressProps {
  currentTier: LoyaltyTier
  completedTrips: number
}

function LoyaltyProgress({ currentTier, completedTrips }: LoyaltyProgressProps) {
  const tiers: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum']
  const currentIndex = tiers.indexOf(currentTier)
  const nextTier = tiers[currentIndex + 1]
  
  const currentTierInfo = MOCK_TIER_INFO[currentTier]
  const nextTierInfo = nextTier ? MOCK_TIER_INFO[nextTier] : null

  const tripsToNext = nextTierInfo 
    ? nextTierInfo.minTrips - completedTrips
    : 0

  const progress = nextTierInfo
    ? ((completedTrips - currentTierInfo.minTrips) / 
       (nextTierInfo.minTrips - currentTierInfo.minTrips)) * 100
    : 100

  const CurrentIcon = currentTierInfo.icon
  const NextIcon = nextTierInfo?.icon

  return (
    <div className="
      p-8
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
    ">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Loyalty Progress
      </h3>

      <div className="flex items-center justify-between mb-4">
        {/* Current tier */}
        <div className="text-center">
          <div className={`
            w-12 h-12
            mx-auto mb-2
            rounded-full
            ${currentTierInfo.bgColor}
            ${currentTierInfo.borderColor}
            border-2
            flex items-center justify-center
          `}>
            <CurrentIcon className={`w-6 h-6 ${currentTierInfo.textColor}`} />
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {currentTierInfo.displayName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {currentTierInfo.discount}% off
          </div>
        </div>

        {/* Progress line */}
        <div className="flex-1 mx-4">
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          {nextTierInfo && (
            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{completedTrips} trips</span>
              <span>{nextTierInfo.minTrips} trips</span>
            </div>
          )}
        </div>

        {/* Next tier */}
        {nextTierInfo ? (
          <div className="text-center opacity-50">
            <div className={`
              w-12 h-12
              mx-auto mb-2
              rounded-full
              ${nextTierInfo.bgColor}
              ${nextTierInfo.borderColor}
              border-2
              flex items-center justify-center
              opacity-50
            `}>
              {NextIcon && <NextIcon className={`w-6 h-6 ${nextTierInfo.textColor}`} />}
            </div>
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-500">
              {nextTierInfo.displayName}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-600">
              {nextTierInfo.discount}% off
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="
              w-12 h-12
              mx-auto mb-2
              rounded-full
              bg-gradient-to-r from-amber-500 to-blue-500
              flex items-center justify-center
              text-white
            ">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Max Tier
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              Best benefits!
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Next tier benefits include {nextTierInfo?.benefits[0] || 'premium perks'}
      </p>
    </div>
    </div>
  )
}

// ============================================================================
// PROFILE INFORMATION COMPONENT
// ============================================================================

interface ProfileInfoProps {
  profile: TravelerProfile
}

function ProfileInfo({ profile }: ProfileInfoProps) {
  const infoItems = [
    { icon: Mail, label: 'Email', value: profile.email, verified: profile.emailVerified },
    { icon: Phone, label: 'Phone', value: profile.phone, verified: profile.phoneVerified },
    { icon: MapPin, label: 'Nationality', value: profile.nationality },
    { icon: Calendar, label: 'Date of Birth', value: profile.dateOfBirth },
    { icon: Globe, label: 'Languages', value: profile.languages.join(', ') },
    { icon: Star, label: 'Member Since', value: new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
    { icon: Heart, label: 'Wishlist', value: '12 items' },
    { icon: Clock, label: 'Timezone', value: 'GMT+2' },
  ]

  return (
    <div className="
      p-7
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
    ">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Personal Information
      </h3>

      <div className="space-y-4">
        {infoItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="flex items-start gap-3">
              <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.label}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {item.value || 'Not provided'}
                  </span>
                  {item.verified !== undefined && (
                    item.verified ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        Unverified
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Emergency contact */}
      {profile.emergencyContact && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Emergency Contact
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400 w-20">Name:</span>
              <span className="text-gray-900 dark:text-white">
                {profile.emergencyContact.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400 w-20">Relation:</span>
              <span className="text-gray-900 dark:text-white">
                {profile.emergencyContact.relationship}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400 w-20">Phone:</span>
              <span className="text-gray-900 dark:text-white">
                {profile.emergencyContact.phone}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// PREFERENCES COMPONENT
// ============================================================================

interface PreferencesProps {
  profile: TravelerProfile
  onToggleReminder: () => void
  onToggleNewsletter: () => void
  onToggle2FA: () => void
}

function Preferences({ profile, onToggleReminder, onToggleNewsletter, onToggle2FA }: PreferencesProps) {
  return (
    <div className="
      p-7
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
    ">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Preferences
      </h3>

      <div className="space-y-4">
        {/* Review reminder */}
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-start gap-3">
            <Bell className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Review Reminders
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Get reminded to leave reviews after trips
              </div>
            </div>
          </div>
          <button
            onClick={onToggleReminder}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors duration-200
              ${profile.reviewReminderEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}
            `}
          >
            <span className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
              ${profile.reviewReminderEnabled ? 'translate-x-6' : 'translate-x-1'}
            `} />
          </button>
        </label>

        {/* Newsletter */}
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Newsletter
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Receive travel tips and exclusive offers
              </div>
            </div>
          </div>
          <button
            onClick={onToggleNewsletter}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors duration-200
              ${profile.newsletterOptIn ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}
            `}
          >
            <span className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
              ${profile.newsletterOptIn ? 'translate-x-6' : 'translate-x-1'}
            `} />
          </button>
        </label>

        {/* Two-factor authentication */}
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Two-Factor Authentication
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Add an extra layer of security
              </div>
            </div>
          </div>
          <button
            onClick={onToggle2FA}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              transition-colors duration-200
              ${profile.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}
            `}
          >
            <span className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
              ${profile.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}
            `} />
          </button>
        </label>
        {/* Add this after email notifications */}
<div className="flex items-center justify-between">
  <div className="flex items-start gap-3">
    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
    <div>
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        Booking Reminders
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Get reminders 24h before your tours
      </div>
    </div>
  </div>
  <button
    className={`
      relative inline-flex h-6 w-11 items-center rounded-full
      transition-colors duration-200
      bg-blue-600
    `}
  >
    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
  </button>
</div>
      </div>
                
      {/* Danger zone */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
          Danger Zone
        </h4>
        <div className="space-y-2">
          <button className="
            w-full
            px-4 py-2
            bg-red-50 hover:bg-red-100
            dark:bg-red-950/30 dark:hover:bg-red-900/30
            text-red-700 dark:text-red-400
            text-sm font-medium
            rounded-lg
            transition-colors
            flex items-center justify-center gap-2
          ">
            <LogOut className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TRIP HISTORY CHART
// ============================================================================

interface TripHistoryProps {
  history: TripStat[]
}

function TripHistory({ history }: TripHistoryProps) {
  const maxCount = Math.max(...history.map(h => h.count))

  return (
    <div className="
      p-8
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
    ">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Trip History
      </h3>
        {/* Make chart taller - change h-32 to h-48 */}
      <div className="flex items-end justify-between gap-1 h-32">
        {history.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-blue-600 dark:bg-blue-500 rounded-t-lg transition-all hover:bg-blue-700 dark:hover:bg-blue-600"
              style={{ height: `${(item.count / maxCount) * 100}%` }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.month}
            </span>
          </div>
        ))}
      </div>
<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Average per month:</span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {(history.reduce((sum, item) => sum + item.count, 0) / history.length).toFixed(1)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Best month:</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {Math.max(...history.map(h => h.count))} trips
        </span>
      </div>
    </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total trips:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {history.reduce((sum, item) => sum + item.count, 0)}
          </span>
        </div>
      </div>
      
    </div>
  )
}

// ============================================================================
// REFERRAL CARD
// ============================================================================

interface ReferralCardProps {
  code: string
  savedAmount: number
}

function ReferralCard({ code, savedAmount }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const recentReferrals = [
    { name: 'Omar K.', date: '2 days ago', status: 'Booked' },
    { name: 'Layla M.', date: '1 week ago', status: 'Pending' },
  ]

  return (
    <div className="
      p-6
      bg-gradient-to-br from-blue-600 to-indigo-700
      dark:from-blue-700 dark:to-indigo-800
      rounded-xl
      text-white
    ">
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-300" />
        Refer & Earn
      </h3>
      <p className="text-sm text-blue-100 mb-4">
        Share your code with friends. You both get $20 credit when they book their first tour!
      </p>

      <div className="flex gap-2 mb-4">
        <div className="
          flex-1
          px-3 py-2
          bg-white/20 backdrop-blur-sm
          rounded-lg
          font-mono text-sm
        ">
          {code}
        </div>
        <button
          onClick={handleCopy}
          className="
            px-4 py-2
            bg-white/20 hover:bg-white/30
            rounded-lg
            text-sm font-medium
            transition-colors
          "
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
        {/* Add more content */}
    <div className="space-y-2 mt-4 pt-4 border-t border-white/20">
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-blue-100">Friends referred:</span>
        <span className="font-bold">3</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-blue-100">Pending credits:</span>
        <span className="font-bold">$40</span>
      </div>
      <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-white/20">
        <span className="text-blue-100">Total saved:</span>
        <span className="font-bold text-lg">${savedAmount}</span>
      </div>
    </div>
      <div className="mt-3 pt-3 border-t border-white/20">
        <h4 className="text-xs font-semibold text-blue-200 mb-2">Recent Referrals</h4>
        <div className="space-y-2">
          {recentReferrals.map((referral, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span>{referral.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-200">{referral.date}</span>
                <span className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${referral.status === 'Booked' 
                    ? 'bg-emerald-500/30 text-emerald-200' 
                    : 'bg-amber-500/30 text-amber-200'
                  }
                `}>
                  {referral.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    
    </div>
  )
}

// ============================================================================
// MAIN PROFILE PAGE
// ============================================================================

export default function TravelerProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(MOCK_PROFILE)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'Traveler') {
      setIsLoadingData(false)
      return
    }

    const loadProfile = async () => {
      try {
        setIsLoadingData(true)
        const res = await apiClient.get('/api/traveler/profile')
        const data = res.data

        setProfile(prev => ({
          ...prev,
          firstName: data.fullName?.split(' ')[0] || prev.firstName,
          lastName: data.fullName?.split(' ').slice(1).join(' ') || prev.lastName,
          phone: data.phoneE164 || prev.phone,
          nationality: data.nationality || prev.nationality,
          dateOfBirth: data.dateOfBirth || prev.dateOfBirth,
          email: data.email || prev.email,
          emailVerified: data.emailVerified ?? prev.emailVerified,
          phoneVerified: data.phoneVerified ?? prev.phoneVerified,
          memberSince: data.memberSince || prev.memberSince,
          loyaltyTier: data.loyaltyTier ? (data.loyaltyTier.toLowerCase()) : prev.loyaltyTier,
          completedTrips: data.completedTrips ?? prev.completedTrips,
          reviewReminderEnabled: data.reviewReminderEnabled ?? prev.reviewReminderEnabled,
          newsletterOptIn: data.newsletterOptIn ?? prev.newsletterOptIn
        }))
      } catch (error) {
        console.error("Failed to load traveler profile", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadProfile()
  }, [user])

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    )
  }

  const handleToggleReminder = () => {
    setProfile(prev => ({
      ...prev,
      reviewReminderEnabled: !prev.reviewReminderEnabled
    }))
  }

  const handleToggleNewsletter = () => {
    setProfile(prev => ({
      ...prev,
      newsletterOptIn: !prev.newsletterOptIn
    }))
  }

  const handleToggle2FA = () => {
    setProfile(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }))
  }

  return (
    <>
      {/* Page offset for navbar */}
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        
        <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
          
          {/* ========================================
              PROFILE HEADER
              ======================================== */}
          <ProfileHeader
            profile={profile}
            onEdit={() => router.push('/dashboard/traveler/complete-profile')}
          />

          {/* ========================================
              STATS GRID - Added mt-24 for spacing below header
              ======================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-32 sm:mt-28 mb-6">
            <StatCard
              icon={Award}
              label="Loyalty Tier"
              value={MOCK_TIER_INFO[profile.loyaltyTier].displayName}
              subtext={`${MOCK_TIER_INFO[profile.loyaltyTier].discount}% discount`}
              color="amber"
            />
            <StatCard
              icon={TrendingUp}
              label="Current Streak"
              value={`${profile.streakCount} weeks`}
              subtext={`Longest: ${profile.longestStreak}`}
              color="emerald"
              trend="up"
              trendValue="+2"
            />
            <StatCard
              icon={Star}
              label="Completed Trips"
              value={profile.completedTrips}
              subtext={`${profile.totalReviews} reviews`}
              color="blue"
            />
            <StatCard
              icon={Heart}
              label="Saved"
              value={`$${profile.savedAmount}`}
              subtext="From discounts"
              color="pink"
            />
          </div>

          {/* ========================================
              MAIN CONTENT GRID
              ======================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info & Preferences */}
            <div className="lg:col-span-2 space-y-6">
              <ProfileInfo profile={profile} />
              <Preferences
                profile={profile}
                onToggleReminder={handleToggleReminder}
                onToggleNewsletter={handleToggleNewsletter}
                onToggle2FA={handleToggle2FA}
              />
            </div>

            {/* Right Column - Loyalty & Stats */}
            <div className="space-y-6">
              <LoyaltyProgress
                currentTier={profile.loyaltyTier}
                completedTrips={profile.completedTrips}
              />
              <TripHistory history={MOCK_TRIP_HISTORY} />
              <ReferralCard
                code={profile.referralCode}
                savedAmount={profile.savedAmount}
              />
            </div>
          </div>

          {/* ========================================
              QUICK LINKS
              ======================================== */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/dashboard/traveler/bookings"
              className="
                p-4
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                text-center
                hover:shadow-md
                transition-shadow
              "
            >
              <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                My Bookings
              </span>
            </Link>
            <Link
              href="/dashboard/traveler/messages"
              className="
                p-4
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                text-center
                hover:shadow-md
                transition-shadow
              "
            >
              <MessageSquare className="w-5 h-5 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Messages
              </span>
            </Link>
            <Link
              href="/wishlist"
              className="
                p-4
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                text-center
                hover:shadow-md
                transition-shadow
              "
            >
              <Heart className="w-5 h-5 mx-auto mb-2 text-rose-600 dark:text-rose-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Wishlist
              </span>
            </Link>
            <Link
              href="/settings"
              className="
                p-4
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                text-center
                hover:shadow-md
                transition-shadow
              "
            >
              <Settings className="w-5 h-5 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Settings
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}