// ============================================================================
// GUIDE PROFILE - PORTFOLIO & BIO
// ============================================================================
// LOCATION: /frontend/src/components/tour-detail/TourGuide.tsx
// 
// PURPOSE: Display guide biography, expertise, and stats
// 
// FEATURES:
// 1. Bio with languages and verification badge
// 2. Stats (Reviews, Total travelers, Trips)
// 3. Response rate and time indicators
// 4. Earned badges display
// 5. 'Impact Score' (Loyalty & Quality metric)
// ============================================================================

'use client'

import Image from 'next/image'
import {
    CheckCircle,
    UserCheck,
    MessageSquare,
    Clock,
    Globe,
    Award,
    Users,
    Compass,
    Star,
    ChevronRight
} from 'lucide-react'
import type { GuideProfileCardProps } from '@/src/types/tour-detail.types'

export default function TourGuide({ guide }: GuideProfileCardProps) {
    return (
        <section className="pt-10 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-8">
                {/* ========================================
            HEADER: AVATAR & QUICK INFO
            ======================================== */}
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="relative">
                        <div className="
              w-24 h-24
              ring-4 ring-white dark:ring-gray-900
              rounded-2xl
              overflow-hidden
              shadow-xl
            ">
                            <Image
                                src={guide.avatar}
                                alt={guide.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Status dot */}
                        <div className="
              absolute -bottom-1 -right-1
              w-5 h-5
              bg-emerald-500
              rounded-full
              border-2 border-white dark:border-gray-900
            " />
                    </div>

                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Guided by {guide.name}
                            </h2>
                            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Joined {new Date(guide.memberSince).getFullYear()} • Last seen online 10 mins ago
                        </p>

                        <div className="flex flex-wrap items-center gap-4 py-1">
                            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="font-bold">{guide.averageRating}</span>
                                <span className="text-gray-500">({guide.totalReviews} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="font-bold">{guide.verifiedAt ? 'Verified Identity' : 'Pending Verification'}</span>
                            </div>
                        </div>
                    </div>

                    <button className="
            px-5 py-2.5
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl
            text-sm font-semibold
            text-gray-900 dark:text-white
            hover:bg-gray-50 dark:hover:bg-gray-700
            transition-all
            flex items-center gap-2
            shadow-sm
          ">
                        <MessageSquare className="w-4 h-4" />
                        Message Guide
                    </button>
                </div>

                {/* ========================================
            CORE STATS GRID
            ======================================== */}
                <div className="
          grid 
          grid-cols-2 
          md:grid-cols-4 
          gap-4
          p-6
          bg-gray-50 dark:bg-gray-800/50
          rounded-2xl
        ">
                    <div className="text-center md:text-left space-y-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{guide.totalTravelers.toLocaleString()}</p>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Users className="w-3.5 h-3.5" />
                            <span>Travelers</span>
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{guide.completedTrips}</p>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Compass className="w-3.5 h-3.5" />
                            <span>Completed trips</span>
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-1">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{guide.responseRate}%</p>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Response rate</span>
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{guide.impactScore}</p>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Award className="w-3.5 h-3.5" />
                            <span>Impact Score</span>
                        </div>
                    </div>
                </div>

                {/* ========================================
            BIO & LANGUAGES
            ======================================== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            Biography
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {guide.bio}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Languages
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {guide.languages.map((item, i) => (
                                    <span key={i} className="
                    px-3 py-1.5
                    bg-blue-50 dark:bg-blue-900/20
                    text-blue-700 dark:text-blue-300
                    text-xs font-semibold
                    rounded-lg
                    capitalize
                  ">
                                        {item.language} ({item.proficiency})
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                Badges
                            </h3>
                            <div className="space-y-2">
                                {guide.badges.map((badge, i) => (
                                    <div key={i} className="
                    flex items-center gap-2.5
                    p-2
                    border border-gray-100 dark:border-gray-800
                    rounded-xl
                    text-xs
                  ">
                                        <div className="
                      w-7 h-7
                      bg-amber-100 dark:bg-amber-900/30
                      rounded-full
                      flex items-center justify-center
                      flex-shrink-0
                    ">
                                            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{badge.label}</p>
                                            <p className="text-gray-500 dark:text-gray-400">Earned {new Date(badge.earnedAt).getFullYear()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================
            VIEW PORTFOLIO ACTION
            ======================================== */}
                <button className="
          w-full
          flex items-center justify-between
          p-4
          bg-blue-50/50 dark:bg-blue-900/10
          border border-blue-100 dark:border-blue-900/20
          rounded-2xl
          group
          transition-all
          hover:bg-blue-50 dark:hover:bg-blue-900/20
        ">
                    <div className="flex items-center gap-3">
                        <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div className="text-left">
                            <p className="font-bold text-blue-900 dark:text-blue-100 text-sm">
                                View Mehmet's Full Portfolio
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                156 trips completed • 98% happy travelers
                            </p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </section>
    )
}
