'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, SkipForward } from 'lucide-react'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import TravelerProfileForm from '@/src/components/auth/TravelerProfileForm'
import apiClient from '@/src/lib/api/client'
import toast from 'react-hot-toast'

export default function TravelerCompleteProfilePage() {
 const router = useRouter()
 const { user, isLoading, refetchUser } = useAuth()
 const [initialData, setInitialData] = useState<any>(undefined)
 const [isFetchingData, setIsFetchingData] = useState(true)

 useEffect(() => {
 if (!isLoading && (!user || user.role !== 'TRAVELER')) router.push('/dashboard')
 }, [user, isLoading, router])

 useEffect(() => {
 const fetchProfile = async () => {
 try {
 const res = await apiClient.get('/api/traveler/profile')
 if (res.data) {
 setInitialData(res.data)
 }
 } catch (err: any) {
 // If 404 or missing, that's fine, we fall back to Google name if available
 if (user?.fullName) {
 setInitialData({ fullName: user.fullName })
 }
 } finally {
 setIsFetchingData(false)
 }
 }
 
 if (user && user.role !== 'TRAVELER') {
 fetchProfile()
 } else {
 setIsFetchingData(false)
 }
 }, [user])

 const handleSubmit = async (formData: any) => {
 try {
 await apiClient.post('/api/traveler/profile/complete', formData)
 // Refetch /me so profileCompleted becomes true in AuthContext — banner will hide automatically
 await refetchUser()
 toast.success('Profile completed!')
 router.push('/dashboard/traveler')
 } catch (err: any) {
 const msg = err?.response?.data?.message ?? 'Failed to save profile. Please try again.'
 toast.error(msg)
 }
 }

 if (isLoading || isFetchingData) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark" />
 </div>
 )
 }

 return (
 <div className="flex-1 overflow-y-auto chat-scrollbar">
 <div className="max-w-2xl mx-auto py-8 sm:py-10 px-4 sm:px-6">

 {/* Top bar */}
 <div className="flex items-center justify-between mb-6">
 <Link href="/dashboard/traveler"
 className="inline-flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-primary dark:hover:text-gray-200 transition">
 <ChevronLeft className="w-4 h-4" /> Back to dashboard
 </Link>
 <button
 onClick={() => {
 toast('You can complete your profile later from Settings.', { icon: 'ℹ️' })
 router.push('/dashboard/traveler')
 }}
 className="inline-flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300 transition"
 >
 <SkipForward className="w-4 h-4" />
 Skip for now
 </button>
 </div>

 {/* Info banner */}
 <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 rounded-xl text-sm text-orange-800 dark:text-orange-200">
 <strong>Required to make bookings.</strong> You can skip for now, but you won't be able to book tours until your profile is complete and email is verified.
 </div>

 <TravelerProfileForm onSubmit={handleSubmit} initialData={initialData as any} />
 </div>
 </div>
 )
}
