'use client'

import Link from 'next/link'
import { Mail, User, Shield, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const COLORS = {
 blue: { bg: 'bg-primary-light/10 ', icon: 'bg-blue-100 text-primary-light dark:text-primary-dark dark:text-primary-dark ', btn: 'bg-primary-light hover:bg-primary-light-hover text-white' },
 amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600 text-white' },
 purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', btn: 'bg-purple-600 hover:bg-purple-700 text-white' },
}

interface Props {
 profileCompleted: boolean
 emailVerified: boolean
 verificationStatus?: 'not_submitted' | 'pending' | 'approved' | 'rejected' // guide only
 role: 'TRAVELER' | 'GUIDE' | 'ADMIN'
 /** Pass the user's email so the verification page auto-sends the code */
 userEmail?: string
}

export default function OnboardingBanner({ profileCompleted, emailVerified, verificationStatus, role, userEmail }: Props) {
 const [dismissed, setDismissed] = useState(false)

 // Build the email verification href with email pre-filled so the form auto-sends the code
 const emailVerifyHref = userEmail
 ? `/auth/email-verification?email=${encodeURIComponent(userEmail)}`
 : '/auth/email-verification'

 type Color = 'blue' | 'amber' | 'purple'
 const steps: { id: string; label: string; desc: string; href: string; icon: React.ElementType; color: Color; done: boolean; statusLabel?: string }[] = [
 { 
 id: 'email', 
 label: 'Verify your email', 
 desc: 'Confirm your address to secure your account.', 
 href: emailVerifyHref, 
 icon: Mail, 
 color: 'blue', 
 done: emailVerified 
 },
 { 
 id: 'profile', 
 label: 'Complete your profile', 
 desc: role === 'GUIDE' ? 'Add bio, languages and expertise so travelers can find you.' : 'Add your name, location and preferences.', 
 href: role === 'GUIDE' ? '/dashboard/guide/complete-profile' : '/dashboard/traveler/complete-profile', 
 icon: User, 
 color: 'purple', 
 done: profileCompleted 
 },
 ...(role === 'GUIDE' ? [{ 
 id: 'verify', 
 label: verificationStatus === 'pending' ? 'ID Verification Pending' : 'Submit ID verification', 
 desc: verificationStatus === 'pending' ? 'We are reviewing your documents. This usually takes 24-48h.' : 'Upload ID + selfie. Verified guides get 3× more bookings.', 
 href: '/dashboard/guide/verification', 
 icon: Shield, 
 color: 'amber' as Color, 
 done: verificationStatus === 'approved' || verificationStatus === 'pending',
 statusLabel: verificationStatus === 'pending' ? 'Reviewing' : undefined
 }] : []),
 ]

 const pending = steps.filter(s => !s.done)
 if (pending.length === 0 || dismissed) return null

 return (
 <div className="mb-6 surface-card border border-theme rounded-2xl overflow-hidden">
 <div className="flex items-center justify-between px-5 py-3 border-b border-theme">
 <div className="flex items-center gap-3">
 <div className="flex gap-1">
 {steps.map(s => (
 <div key={s.id} className={`w-2 h-2 rounded-full transition-colors ${s.done ? 'bg-emerald-500' : 'surface-section'}`} />
 ))}
 </div>
 <span className="text-sm font-semibold text-theme-primary">
 {pending.length} step{pending.length !== 1 ? 's' : ''} left to complete your account
 </span>
 </div>
 <button onClick={() => setDismissed(true)} className="p-1 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300 rounded-lg hover:surface-section dark:hover:surface-card transition">
 <X className="w-4 h-4" />
 </button>
 </div>
 <div className={`grid grid-cols-1 ${pending.length >= 2 ? 'sm:grid-cols-2' : ''} ${pending.length === 3 ? 'lg:grid-cols-3' : ''} divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800`}>
 {pending.map(step => {
 const c = COLORS[step.color]
 const Icon = step.icon
 return (
 <div key={step.id} className={`${c.bg} p-4 flex items-start gap-3`}>
 <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}>
 <Icon className="w-4 h-4" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-sm font-semibold text-theme-primary">{step.label}</p>
 {step.statusLabel && (
 <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-bold uppercase tracking-tighter rounded-md border border-accent-light dark:border-accent-dark/20">
 {step.statusLabel}
 </span>
 )}
 </div>
 <p className="text-xs text-theme-muted mt-0.5 leading-relaxed">{step.desc}</p>
 {!step.done && (
 <Link href={step.href} className={`inline-flex items-center gap-1 mt-2 px-3 py-1.5 text-xs font-medium rounded-lg transition ${c.btn}`}>
 Get started <ChevronRight className="w-3 h-3" />
 </Link>
 )}
 {step.done && step.statusLabel === 'Reviewing' && (
 <Link href={step.href} className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition uppercase tracking-widest">
 View Status <ChevronRight className="w-3 h-3" />
 </Link>
 )}
 </div>
 </div>
 )
 })}
 </div>
 </div>
 )
}
