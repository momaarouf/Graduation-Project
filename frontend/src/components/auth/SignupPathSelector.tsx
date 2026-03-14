// ============================================================================
// SIGNUP PATH SELECTOR - RESTORED TO ORIGINAL SIZE
// ============================================================================
// LOCATION: /frontend/src/components/auth/SignupPathSelector.tsx
// ============================================================================

'use client'

import { useState } from 'react'
import {
    Compass,
    Award,
    Shield,
    MapPin,
    Star,
    Heart,
    Users,
    Camera,
    Globe,
    TrendingUp,
    CheckCircle,
    ChevronRight,
    Sparkles
} from 'lucide-react'
import { UserRole, UserRoleLabels } from '@/src/types/auth.types'

interface SignupPathSelectorProps {
    selectedRole: UserRole | null
    onSelect: (role: UserRole) => void
    className?: string
}

const TRAVELER_FEATURES = [
    { icon: Shield, label: 'Verified Guides', description: 'Every guide manually ID-verified', color: 'text-blue-600 dark:text-blue-400' },
    { icon: MapPin, label: 'Halal-Friendly Tours', description: 'Prayer spaces, halal food options', color: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Star, label: 'Loyalty Rewards', description: 'Bronze → Silver → Gold → Platinum', color: 'text-amber-600 dark:text-amber-400' },
    { icon: Heart, label: 'Secure Payments', description: '48h payout freeze, full refunds', color: 'text-purple-600 dark:text-purple-400' },
    { icon: Users, label: 'Group Discounts', description: '5% off for groups of 4+', color: 'text-pink-600 dark:text-pink-400' },
    { icon: Camera, label: 'Photo Memories', description: 'Capture authentic moments', color: 'text-indigo-600 dark:text-indigo-400' }
]

const GUIDE_FEATURES = [
    { icon: Award, label: 'Earn Impact Score', description: 'Build reputation with every tour', color: 'text-amber-600 dark:text-amber-400' },
    { icon: TrendingUp, label: 'Lower Fees Over Time', description: 'Top guides pay less commission', color: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Globe, label: 'Global Audience', description: 'Reach travelers worldwide', color: 'text-blue-600 dark:text-blue-400' },
    { icon: Sparkles, label: 'Free Marketing', description: 'We promote your tours', color: 'text-purple-600 dark:text-purple-400' },
    { icon: CheckCircle, label: 'ID Verification', description: 'Build trust with travelers', color: 'text-green-600 dark:text-green-400' },
    { icon: Users, label: 'Community Support', description: 'Join a network of expert guides', color: 'text-orange-600 dark:text-orange-400' }
]

interface PathCardProps {
    role: UserRole
    isSelected: boolean
    onSelect: () => void
    onGoogleSelect: () => void
    icon: typeof Compass
    title: string
    description: string
    accentColor: string
    darkAccentColor: string
    bgGradient: string
    darkBgGradient: string
    features: typeof TRAVELER_FEATURES
    isPopular?: boolean
}

function PathCard({
    role,
    isSelected,
    onSelect,
    onGoogleSelect,
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

    const colorToRingClass: Record<string, string> = {
        'text-orange-600': 'ring-orange-600',
        'text-blue-600': 'ring-blue-600',
    }

    const darkColorToRingClass: Record<string, string> = {
        'dark:text-orange-400': 'dark:ring-orange-400',
        'dark:text-blue-400': 'dark:ring-blue-400',
    }

    return (
        <div className={`group relative ${isSelected ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ${colorToRingClass[accentColor]} ${darkColorToRingClass[darkAccentColor]}` : ''} transition-all duration-300 hover:z-10`}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
                        <Sparkles className="w-3 h-3" />
                        MOST POPULAR
                    </div>
                </div>
            )}

            <div
                onClick={onSelect}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'shadow-2xl scale-[1.02]' : 'shadow-lg hover:shadow-xl hover:scale-[1.02]'} ${isPopular && !isSelected ? 'border-2 border-amber-200 dark:border-amber-800' : ''}`}
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
                <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} ${darkBgGradient} transition-opacity duration-300 ${isHovered || isSelected ? 'opacity-100' : 'opacity-90'}`} />
                <div className="absolute inset-0 bg-theme-grid opacity-[0.02]" />

                <div className="relative p-8 h-full flex flex-col">
                    <div className="mb-8">
                        <div className={`inline-flex p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md transition-transform duration-300 ${isHovered || isSelected ? 'scale-110 rotate-3' : ''}`}>
                            <Icon className={`w-8 h-8 sm:w-9 sm:h-9 ${accentColor} ${darkAccentColor} transition-all duration-300 ${isHovered || isSelected ? 'scale-110' : ''}`} />
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className={`text-2xl sm:text-3xl font-bold mb-3 text-gray-900 dark:text-white ${isSelected ? accentColor : ''} dark:${isSelected ? darkAccentColor.replace('dark:', '') : ''}`}>
                            {title}
                        </h3>
                        <p className="text-base text-gray-600 dark:text-gray-400">
                            {description}
                        </p>
                    </div>

                    <div className="flex-1 space-y-4 mb-10">
                        {features.slice(0, 4).map((feature, index) => {
                            const FeatureIcon = feature.icon
                            return (
                                <div key={index} className="flex items-start gap-4 group/feature">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <FeatureIcon className={`w-5 h-5 ${feature.color} transition-transform duration-300 group-hover/feature:scale-110`} />
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                                            {feature.label}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Email signup button */}
                    <button
                        onClick={onSelect}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 group/cta ${
                            isSelected 
                                ? `bg-gradient-to-r ${bgGradient} ${darkBgGradient} text-gray-900 dark:text-white shadow-lg` 
                                : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:shadow-md border border-gray-200 dark:border-gray-800'
                        }`}
                    >
                        <span>Continue with email</span>
                        <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover/cta:translate-x-1" />
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>

                    {/* Google OAuth button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onGoogleSelect(); }}
                        className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        {/* Google G SVG */}
                        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    {isSelected && (
                        <div className="absolute top-6 right-6">
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${bgGradient} ${darkBgGradient} flex items-center justify-center shadow-lg animate-in zoom-in duration-300`}>
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function SignupPathSelector({ 
    selectedRole, 
    onSelect,
    className = '' 
}: SignupPathSelectorProps) {
    return (
        <div className={`w-full ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
                {/* Traveler Card */}
                <PathCard
                    role={UserRole.TRAVELER}
                    isSelected={selectedRole === UserRole.TRAVELER}
                    onSelect={() => onSelect(UserRole.TRAVELER)}
                    onGoogleSelect={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth2/google/start?role=Traveler` }}
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
                    onSelect={() => onSelect(UserRole.GUIDE)}
                    onGoogleSelect={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth2/google/start?role=Guide` }}
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
        </div>
    )
}