'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
    CheckCircle,
    UserCheck,
    MessageSquare,
    Globe,
    Star,
    ChevronRight,
    Award
} from 'lucide-react'

export default function TourGuide({ guide }: any) {
    const guideName = guide.displayName || guide.name || 'Local Guide'
    const isVerified = guide.verified ?? guide.guideVerified ?? false
    
    const stats = {
        totalReviews: guide.totalReviews || 0,
        averageRating: guide.averageRating || '5.0',
        joinedYear: guide.memberSince ? new Date(guide.memberSince).getFullYear() : 2024,
        languages: guide.languages || []
    }

    const profileUrl = `/guides/${guide.id}`

    return (
        <section className="pt-10 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 bg-gray-50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <Link href={profileUrl} className="relative group shrink-0">
                        <div className="w-20 h-20 ring-4 ring-white dark:ring-gray-900 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                            {guide.avatar ? (
                                <Image
                                    src={guide.avatar}
                                    alt={guideName}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            )}
                        </div>
                        {isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
                                <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                            </div>
                        )}
                    </Link>

                    <div className="text-center sm:text-left space-y-1.5">
                        <Link href={profileUrl} className="block group">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Guided by {guideName}
                            </h2>
                        </Link>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm">
                            <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                                <Star className="w-4 h-4 fill-amber-500" />
                                {stats.averageRating}
                                <span className="text-gray-500 dark:text-gray-400 font-normal">({stats.totalReviews} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                <UserCheck className="w-4 h-4 text-blue-500" />
                                <span>Verified Expert</span>
                            </div>
                        </div>

                        {/* Languages Section */}
                        {stats.languages.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                <Globe className="w-3.5 h-3.5 text-gray-400" />
                                <div className="flex gap-1.5">
                                    {stats.languages.slice(0, 3).map((lang: any, i: number) => (
                                        <span key={i} className="text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded">
                                            {typeof lang === 'string' ? lang : lang.language}
                                        </span>
                                    ))}
                                    {stats.languages.length > 3 && (
                                        <span className="text-xs text-gray-500">+{stats.languages.length - 3}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        Message
                    </button>
                    <Link 
                        href={profileUrl}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                    >
                        View Profile
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
