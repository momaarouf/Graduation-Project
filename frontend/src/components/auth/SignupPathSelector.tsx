'use client'

// ============================================================================
// SIGNUP PATH SELECTOR - CARD 9 MAIN COMPONENT
// ============================================================================
// LOCATION: /frontend/src/components/auth/SignupPathSelector.tsx
// 
// PURPOSE: Allow users to choose between Traveler and Guide paths
// 
// WHY THIS IS A CLIENT COMPONENT:
// --------------------------------
// 1. Manages selected role state
// 2. Handles dynamic preview switching
// 3. Smooth animations on selection
// 4. Interactive hover states
// 
// COLOR PSYCHOLOGY:
// - Traveler Card: Orange (#f97316) - Adventure, energy, exploration
// - Guide Card: Blue (#2563eb) - Trust, professionalism, reliability
// - Gold: Premium benefits and earnings potential
// 
// DUAL THEME: Full light/dark mode support with separate color classes
// ============================================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Compass,
    MapPin,
    Star,
    Heart,
    Users,
    Camera,
    Globe,
    Award,
    TrendingUp,
    Shield,
    CheckCircle,
    ChevronRight,
    Sparkles
} from 'lucide-react'
import { UserRole, UserRoleLabels } from '@/src/types/auth.types'
import GuideOnboardingPreview from './GuideOnboardingPreview'
import TravelerBenefitsPreview from './TravelerBenefitsPreview'
import AuthFormFooter from './AuthFormFooter'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface SignupPathSelectorProps {
    /** Optional className for custom styling */
    className?: string
}

// ============================================================================
// FEATURE LISTS - Each path's unique selling points
// ============================================================================

const TRAVELER_FEATURES = [
    {
        icon: Shield,
        label: 'Verified Guides',
        description: 'Every guide manually ID-verified',
        lightColor: 'text-blue-600',
        darkColor: 'dark:text-blue-400'
    },
    {
        icon: MapPin,
        label: 'Halal-Friendly Tours',
        description: 'Prayer spaces, halal food options',
        lightColor: 'text-emerald-600',
        darkColor: 'dark:text-emerald-400'
    },
    {
        icon: Star,
        label: 'Loyalty Rewards',
        description: 'Bronze → Silver → Gold → Platinum',
        lightColor: 'text-amber-600',
        darkColor: 'dark:text-amber-400'
    },
    {
        icon: Heart,
        label: 'Secure Payments',
        description: '48h payout freeze, full refunds',
        lightColor: 'text-purple-600',
        darkColor: 'dark:text-purple-400'
    },
    {
        icon: Users,
        label: 'Group Discounts',
        description: '5% off for groups of 4+',
        lightColor: 'text-pink-600',
        darkColor: 'dark:text-pink-400'
    },
    {
        icon: Camera,
        label: 'Photo Memories',
        description: 'Capture authentic moments',
        lightColor: 'text-indigo-600',
        darkColor: 'dark:text-indigo-400'
    }
]

const GUIDE_FEATURES = [
    {
        icon: Award,
        label: 'Earn Impact Score',
        description: 'Build reputation with every tour',
        lightColor: 'text-amber-600',
        darkColor: 'dark:text-amber-400'
    },
    {
        icon: TrendingUp,
        label: 'Lower Fees Over Time',
        description: 'Top guides pay less commission',
        lightColor: 'text-emerald-600',
        darkColor: 'dark:text-emerald-400'
    },
    {
        icon: Globe,
        label: 'Global Audience',
        description: 'Reach travelers worldwide',
        lightColor: 'text-blue-600',
        darkColor: 'dark:text-blue-400'
    },
    {
        icon: Sparkles,
        label: 'Free Marketing',
        description: 'We promote your tours',
        lightColor: 'text-purple-600',
        darkColor: 'dark:text-purple-400'
    },
    {
        icon: CheckCircle,
        label: 'ID Verification',
        description: 'Build trust with travelers',
        lightColor: 'text-green-600',
        darkColor: 'dark:text-green-400'
    },
    {
        icon: Users,
        label: 'Community Support',
        description: 'Join a network of expert guides',
        lightColor: 'text-orange-600',
        darkColor: 'dark:text-orange-400'
    }
]

// ============================================================================
// PATH CARD COMPONENT (Individual Card)
// ============================================================================

interface PathCardProps {
    /** Traveler or Guide */
    role: UserRole

    /** Whether this card is currently selected */
    isSelected: boolean

    /** Callback when card is clicked */
    onSelect: () => void

    /** Icon component */
    icon: typeof Compass

    /** Title (Traveler or Guide) */
    title: string

    /** Short description */
    description: string

    /** Color for accent (light mode) */
    accentColor: string

    /** Color for accent (dark mode) */
    darkAccentColor: string

    /** Background gradient (light mode) */
    bgGradient: string

    /** Background gradient (dark mode) */
    darkBgGradient: string

    /** List of features */
    features: typeof TRAVELER_FEATURES

    /** Is this the "popular" choice? (Guide) */
    isPopular?: boolean
}

function PathCard({
    role,
    isSelected,
    onSelect,
    icon: Icon,
    title,
    description,
    accentColor,
    darkAccentColor,
    bgGradient,
    darkBgGradient,
    features,
    isPopular = false
}: PathCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    // Map text colors to ring colors
    const colorToRingClass: Record<string, string> = {
        'text-orange-600': 'ring-orange-600',
        'text-blue-600': 'ring-blue-600',
        'text-amber-600': 'ring-amber-600',
        'text-emerald-600': 'ring-emerald-600',
        'text-purple-600': 'ring-purple-600',
        'text-pink-600': 'ring-pink-600',
        'text-indigo-600': 'ring-indigo-600',
        'text-green-600': 'ring-green-600'
    }

    const darkColorToRingClass: Record<string, string> = {
        'dark:text-orange-400': 'dark:ring-orange-400',
        'dark:text-blue-400': 'dark:ring-blue-400',
        'dark:text-amber-400': 'dark:ring-amber-400',
        'dark:text-emerald-400': 'dark:ring-emerald-400',
        'dark:text-purple-400': 'dark:ring-purple-400',
        'dark:text-pink-400': 'dark:ring-pink-400',
        'dark:text-indigo-400': 'dark:ring-indigo-400',
        'dark:text-green-400': 'dark:ring-green-400'
    }

    return (
        <div className={`group relative ${isSelected ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ${colorToRingClass[accentColor]} ${darkColorToRingClass[darkAccentColor]}` : ''} transition-all duration-300 hover:z-10`}>
            {/* ========================================
          POPULAR BADGE (Only for Guide)
          ======================================== */}
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        MOST POPULAR
                    </div>
                </div>
            )}

            {/* ========================================
          MAIN CARD
          ======================================== */}
            <div
                onClick={onSelect}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'shadow-2xl scale-105' : 'shadow-lg hover:shadow-xl hover:scale-102'} ${isPopular && !isSelected ? 'border-2 border-amber-200 dark:border-amber-800' : ''}`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelect()
                    }
                }}
            >
                {/* ========================================
            BACKGROUND GRADIENT
            ======================================== */}
                <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} ${darkBgGradient} transition-opacity duration-300 ${isHovered || isSelected ? 'opacity-100' : 'opacity-90'}`} />

                {/* ========================================
            DECORATIVE PATTERN (Light/Dark specific)
            ======================================== */}
                <div className="absolute inset-0 bg-theme-grid opacity-[0.02]" />

                {/* ========================================
            CONTENT
            ======================================== */}
                <div className="relative p-6 sm:p-8 h-full flex flex-col">

                    {/* ========================================
              ICON CONTAINER
              ======================================== */}
                    <div className="mb-6">
                        <div className={`inline-flex p-3 bg-white dark:bg-gray-900 rounded-xl shadow-md transition-transform duration-300 ${isHovered || isSelected ? 'scale-110 rotate-3' : ''}`}>
                            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${accentColor} ${darkAccentColor} transition-all duration-300 ${isHovered || isSelected ? 'scale-110' : ''}`} />
                        </div>
                    </div>

                    {/* ========================================
              TITLE & DESCRIPTION
              ======================================== */}
                    <div className="mb-6">
                        <h3 className={`text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white ${isSelected ? accentColor.replace('text-', 'text-') : ''} dark:${isSelected ? darkAccentColor.replace('dark:', '') : ''}`}>
                            {title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {description}
                        </p>
                    </div>

                    {/* ========================================
              FEATURES LIST
              ======================================== */}
                    <div className="flex-1 space-y-3 mb-8">
                        {features.slice(0, 4).map((feature, index) => {
                            const FeatureIcon = feature.icon
                            return (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 group/feature"
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        <FeatureIcon className={`
                      w-4 h-4
                      ${feature.lightColor}
                      ${feature.darkColor}
                      transition-transform duration-300
                      group-hover/feature:scale-110
                    `} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {feature.label}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* ========================================
              CTA BUTTON
              ======================================== */}
                    <button
                        onClick={onSelect}
                        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/cta ${isSelected ? `bg-gradient-to-r ${bgGradient} ${darkBgGradient} text-gray-900 dark:text-white shadow-lg` : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:shadow-md border border-gray-200 dark:border-gray-800'}`}
                    >
                        <span>Continue as {title}</span>
                        <ChevronRight className={`
              w-4 h-4
              transition-transform duration-300
              group-hover/cta:translate-x-1
            `} />
                    </button>

                    {/* ========================================
              SELECTION INDICATOR (Checkmark)
              ======================================== */}
                    {isSelected && (
                        <div className="absolute top-4 right-4">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${bgGradient} ${darkBgGradient} flex items-center justify-center shadow-lg animate-in zoom-in duration-300`}>
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN PATH SELECTOR COMPONENT
// ============================================================================

export default function SignupPathSelector({ className = '' }: SignupPathSelectorProps) {
    const router = useRouter()
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

    // ========================================
    // HANDLERS
    // ========================================

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role)

        // Phase 1: Just update state
        // Phase 3: Navigate to actual signup forms
        // if (role === UserRole.TRAVELER) {
        //   router.push('/auth/signup/traveler')
        // } else {
        //   router.push('/auth/signup/guide')
        // }
    }

    const handleContinue = () => {
        if (!selectedRole) return

        // Phase 1: Navigate to placeholder dashboard
        if (selectedRole === UserRole.TRAVELER) {
            router.push('/dashboard/traveler')
        } else {
            router.push('/dashboard/guide/onboarding')
        }
    }

    return (
        <div className={className}>
            {/* ========================================
          PATH SELECTION CARDS
          ======================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 mb-10">
                {/* Traveler Card */}
                <PathCard
                    role={UserRole.TRAVELER}
                    isSelected={selectedRole === UserRole.TRAVELER}
                    onSelect={() => handleRoleSelect(UserRole.TRAVELER)}
                    icon={Compass}
                    title={UserRoleLabels[UserRole.TRAVELER]}
                    description="Discover authentic halal-friendly experiences"
                    accentColor="text-orange-600"
                    darkAccentColor="dark:text-orange-400"
                    bgGradient="from-orange-50 to-amber-50"
                    darkBgGradient="dark:from-orange-950/30 dark:to-amber-950/30"
                    features={TRAVELER_FEATURES}
                />

                {/* Guide Card */}
                <PathCard
                    role={UserRole.GUIDE}
                    isSelected={selectedRole === UserRole.GUIDE}
                    onSelect={() => handleRoleSelect(UserRole.GUIDE)}
                    icon={Award}
                    title={UserRoleLabels[UserRole.GUIDE]}
                    description="Share your expertise and earn money"
                    accentColor="text-blue-600"
                    darkAccentColor="dark:text-blue-400"
                    bgGradient="from-blue-50 to-indigo-50"
                    darkBgGradient="dark:from-blue-950/30 dark:to-indigo-950/30"
                    features={GUIDE_FEATURES}
                    isPopular={true}
                />
            </div>

            {/* ========================================
          DYNAMIC PREVIEW SECTION
          ========================================
          Changes based on selected role
          Shows benefits and onboarding steps
      */}
            {selectedRole === UserRole.GUIDE && (
                <div className="mb-10 animate-in slide-in-from-bottom-4 duration-500">
                    <GuideOnboardingPreview />
                </div>
            )}

            {selectedRole === UserRole.TRAVELER && (
                <div className="mb-10 animate-in slide-in-from-bottom-4 duration-500">
                    <TravelerBenefitsPreview />
                </div>
            )}

            {/* ========================================
          CONTINUE BUTTON (Enabled only when role selected)
          ======================================== */}
            {selectedRole && (
                <div className="text-center mb-8 animate-in fade-in duration-500">
                    <button
                        onClick={handleContinue}
                        className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${selectedRole === UserRole.TRAVELER ? 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' : 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
                    >
                        <span>Continue as {UserRoleLabels[selectedRole]}</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {/* ========================================
          AUTH FOOTER (Login link, terms)
          ======================================== */}
            <AuthFormFooter type="signup" />
        </div>
    )
}

// ============================================================================
// STYLING NOTES:
// ============================================================================
//
// 1. scale-102 is a custom scale value - add to tailwind.config.ts:
//    extend: {
//      scale: {
//        '102': '1.02',
//      }
//    }
//
// 2. The animations use Tailwind's built-in animate classes
//    No additional CSS needed
// ============================================================================