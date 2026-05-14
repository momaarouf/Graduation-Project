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
 Award,
 Loader2
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { chatApi } from '@/src/lib/api/chat'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function TourGuide({ guide, tourId, tourTitle }: any) {
 const { user } = useAuth()
 const router = useRouter()
 const searchParams = useSearchParams()
 const [isSending, setIsSending] = useState(false)
 
 const guideName = guide.displayName || guide.name || 'Local Guide'
 const isVerified = guide.verified ?? guide.guideVerified ?? false

 const handleMessageClick = useCallback(async () => {
 if (!user) {
 toast.error('Please login to message the guide')
 router.push(`/auth/login?redirect=/tours/${tourId}`)
 return
 }

 if (user.role === 'GUIDE' && user.userId === guide.id) {
 toast.error("You can't message yourself!")
 return
 }

 setIsSending(true)
 try {
 const selectedDate = searchParams.get('date')
 let dateContext = ''
 if (selectedDate) {
 const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 })
 dateContext = ` for the date ${formattedDate}`
 }
 
 const message = await chatApi.sendMessage({
 tourId: parseInt(tourId),
 content: `Hi ${guideName}, I have a question about the tour"${tourTitle}"${dateContext}.`
 })

 toast.success('Conversation started!')
 router.push(`/dashboard/traveler/messages?id=${message.conversationId}`)
 } catch (error) {
 console.error('Failed to start conversation:', error)
 toast.error('Could not start conversation')
 } finally {
 setIsSending(false)
 }
 }, [user, tourId, tourTitle, guideName, searchParams, router, guide.id])

 const stats = {
 totalReviews: guide.totalReviews || 0,
 averageRating: guide.averageRating || '5.0',
 joinedYear: guide.memberSince ? new Date(guide.memberSince).getFullYear() : 2024,
 languages: guide.languages || []
 }

 const profileUrl = `/guides/${guide.id}`

 return (
 <section className="pt-10 border-t border-theme">
 <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 surface-section p-6 rounded-xl border border-theme shadow-sm">
 {/* Avatar & Basic Info */}
 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
 <Link href={profileUrl} className="relative group shrink-0">
 <div className="w-20 h-20 surface-paper rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 border-2 border-theme-strong relative">
 {guide.avatar ? (
 <Image
 src={guide.avatar}
 alt={guideName}
 fill
 className="object-cover group-hover:scale-110 transition-transform duration-500"
 />
 ) : (
 <div className="w-full h-full bg-blue-100 flex items-center justify-center">
 <Award className="w-8 h-8 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 </div>
 )}
 </div>
 {isVerified && (
 <div className="absolute -bottom-1 -right-1 surface-card rounded-lg p-0.5 shadow-sm">
 <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
 </div>
 )}
 </Link>

 <div className="text-center sm:text-left space-y-1.5">
 <Link href={profileUrl} className="block group">
 <h2 className="text-xl font-bold text-primary-light dark:text-primary-dark group-hover:text-primary-light dark:text-primary-dark dark:group-hover:text-primary-light dark:text-primary-dark transition-colors">
 Guided by {guideName}
 </h2>
 </Link>
 
 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm">
 <div className="flex items-center gap-1.5 text-accent-light dark:text-accent-dark font-semibold">
 <Star className="w-4 h-4 fill-amber-500" />
 {stats.averageRating}
 <span className="text-theme-muted font-normal">({stats.totalReviews} reviews)</span>
 </div>
 <div className="flex items-center gap-1.5 text-theme-muted ">
 <UserCheck className="w-4 h-4 text-primary-light dark:text-primary-dark" />
 <span>Verified Expert</span>
 </div>
 </div>

 {/* Languages Section */}
 {stats.languages.length > 0 && (
 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
 <Globe className="w-3.5 h-3.5 text-theme-muted" />
 <div className="flex gap-1.5">
 {stats.languages.slice(0, 3).map((lang: any, i: number) => (
 <span key={i} className="text-[10px] capitalize font-bold tracking-normal text-theme-muted surface-section border border-theme px-3 py-1 rounded-lg shadow-sm">
 {typeof lang === 'string' ? lang : lang.language}
 </span>
 ))}
 {stats.languages.length > 3 && (
 <span className="text-xs text-theme-muted">+{stats.languages.length - 3}</span>
 )}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
 <button 
 onClick={handleMessageClick}
 disabled={isSending}
 className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 surface-card border border-theme rounded-lg text-sm font-bold text-theme-primary hover:surface-section dark:hover:surface-card transition-all shadow-md disabled:opacity-50"
 >
 {isSending ? (
 <Loader2 className="w-4 h-4 text-primary-light animate-spin" />
 ) : (
 <MessageSquare className="w-4 h-4 text-primary-light" />
 )}
 {isSending ? 'Sending...' : 'Message'}
 </button>
 <Link 
 href={profileUrl}
 className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-light hover:bg-primary-light-hover text-white rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-primary-light/20"
 >
 View Profile
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </section>
 )
}
