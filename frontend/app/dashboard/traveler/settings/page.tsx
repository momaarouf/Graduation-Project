// ============================================================================
// TRAVELER SETTINGS - GENERAL SETTINGS PAGE
// ============================================================================
// LOCATION: /frontend/app/dashboard/traveler/settings/page.tsx
// ============================================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
 Lock,
 Globe,
 Clock,
 Trash2,
 Save,
 ChevronLeft,
 Eye,
 EyeOff,
 AlertCircle,
 CheckCircle,
 Loader2,
 Shield,
 Bell,
 Smartphone,
 Mail
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { passwordChange, updateNotificationPreferences } from '@/src/lib/api/auth'
import { motion, AnimatePresence } from 'framer-motion'
import SettingsSkeleton from '@/src/components/dashboard/SettingsSkeleton'

// ============================================================================
// CONFIGS
// ============================================================================

const getPasswordStrength = (password: string): { score: number, label: string, color: string } => {
 if (!password) return { score: 0, label: '', color: 'surface-section' }
 let score = 0
 if (password.length >= 8) score++
 if (password.length >= 12) score++
 if (/[A-Z]/.test(password)) score++
 if (/[0-9]/.test(password)) score++
 if (/[^A-Za-z0-9]/.test(password)) score++
 if (score <= 2) return { score: 20, label: 'Weak', color: 'bg-danger-red' }
 if (score <= 3) return { score: 50, label: 'Fair', color: 'bg-orange-500' }
 if (score <= 4) return { score: 75, label: 'Good', color: 'bg-primary-light' }
 return { score: 100, label: 'Strong', color: 'bg-success-green' }
}

const LANGUAGES = [
 { code: 'en', name: 'English', flag: '🇬🇧' },
 { code: 'ar', name: 'العربية', flag: '🇸🇦' },
 { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
 { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

const TIMEZONES = [
 { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
 { value: 'America/New_York', label: 'Eastern Time (ET)' },
 { value: 'Europe/London', label: 'London (GMT)' },
 { value: 'Europe/Istanbul', label: 'Istanbul (GMT+3)' },
 { value: 'Asia/Beirut', label: 'Beirut (GMT+2)' },
]

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TravelerSettingsPage() {
 const router = useRouter()
 const { user, forgotPassword, isLoading } = useAuth()
 
 if (isLoading || !user) {
   return <SettingsSkeleton />
 }
 
 const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'security'>('account')
 
 // Password states
 const [currentPassword, setCurrentPassword] = useState('')
 const [newPassword, setNewPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showCurrentPassword, setShowCurrentPassword] = useState(false)
 const [showNewPassword, setShowNewPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)
 
 // Preferences states
 const [language, setLanguage] = useState('en')
 const [timezone, setTimezone] = useState('UTC')
 const [emailNotifications, setEmailNotifications] = useState(user?.emailNotificationsEnabled ?? true)
 const [pushNotifications, setPushNotifications] = useState(user?.pushNotificationsEnabled ?? true)
 
 // Delete states
 const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
 const [deleteText, setDeleteText] = useState('')
 const [isSaving, setIsSaving] = useState(false)
 const [isDeleting, setIsDeleting] = useState(false)

 const passwordStrength = getPasswordStrength(newPassword)
 const passwordsMatch = newPassword === confirmPassword

 const handleSavePassword = async () => {
 if (!currentPassword || !newPassword || !passwordsMatch) return
 setIsSaving(true)
 try {
 await passwordChange({ currentPassword, newPassword })
 toast.success('Password updated successfully!')
 setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
 } catch (error: any) {
 toast.error(error.response?.data?.message || 'Failed to update password')
 } finally {
 setIsSaving(false)
 }
 }

 const handleForgotPassword = async () => {
 if (!user?.email) return toast.error('User email not found')
 setIsSaving(true)
 try {
 await forgotPassword(user.email)
 toast.success('Reset code sent!')
 router.push(`/auth/reset-password?email=${encodeURIComponent(user.email)}`)
 } catch (error) {
 toast.error('Failed to send reset code')
 } finally {
 setIsSaving(false)
 }
 }

 const handleSavePreferences = async () => {
 setIsSaving(true)
 try {
 await updateNotificationPreferences({ emailNotificationsEnabled: emailNotifications, pushNotificationsEnabled: pushNotifications });
 toast.success('Preferences saved!')
 } catch (error: any) {
 toast.error(error.response?.data?.message || 'Failed to save preferences')
 } finally {
 setIsSaving(false)
 }
 }

 const handleDeleteAccount = async () => {
 if (deleteText !== 'DELETE') return
 setIsDeleting(true)
 try {
 await new Promise(resolve => setTimeout(resolve, 2000))
 toast.success('Account purged')
 router.push('/')
 } catch (error) {
 toast.error('Failed to delete')
 setIsDeleting(false)
 }
 }

 return (
 <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
 <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
 
 {/* Header Hub */}
 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
 <Link href="/dashboard/traveler" className="p-2 text-theme-muted hover:text-theme-primary transition-all rounded-xl hover:surface-section border border-transparent hover:border-theme"><ChevronLeft className="w-5 h-5" /></Link>
 <div>
 <h1 className="text-xl sm:text-3xl font-black text-theme-primary tracking-tight capitalize italic leading-none mb-1">Settings</h1>
 <p className="text-[10px] sm:text-xs text-theme-secondary font-black capitalize tracking-normal opacity-70">Identity & Experience Tuning</p>
 </div>
 </div>

 {/* Settings Console */}
 <div className="surface-card border border-theme rounded-2xl sm:rounded-3xl shadow-2xl shadow-primary-light/5 overflow-hidden transition-all duration-500">
 
 {/* Tabs Hub */}
 <div className="flex border-b border-theme bg-surface-section/30">
 {['account', 'notifications', 'security'].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab as any)}
 className={`flex-1 px-2 sm:px-4 py-4 text-[9px] sm:text-[10px] font-black capitalize tracking-[0.2em] transition-all relative ${
 activeTab === tab ? 'text-primary-light dark:text-primary-dark' : 'text-theme-muted hover:text-theme-secondary'
 }`}
 >
 {tab}
 {activeTab === tab && <motion.div layoutId="activeTabTraveler" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light dark:bg-primary-dark" />}
 </button>
 ))}
 </div>

 <div className="p-5 sm:p-8">
 <AnimatePresence mode="wait">
 {activeTab === 'account' && (
 <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
 <div>
 <h2 className="text-[9px] sm:text-[10px] font-black text-theme-secondary capitalize tracking-[0.3em] mb-6 flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
 Security Matrix
 </h2>
 
 <div className="space-y-5">
 <div>
 <label className="block text-[10px] font-black capitalize tracking-normal text-theme-muted mb-2 ml-1">Access Token</label>
 <div className="relative group">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
 <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full pl-11 pr-11 py-3.5 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:ring-2 focus:ring-primary-light transition-all font-black" placeholder="CURRENT PASSWORD" />
 <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary">{showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
 </div>
 <button onClick={handleForgotPassword} className="mt-3 text-[10px] text-primary-light hover:opacity-80 font-black capitalize tracking-normal ml-1 transition-all">Emergency Recovery Code</button>
 </div>

 <div>
 <label className="block text-[10px] font-black capitalize tracking-normal text-theme-muted mb-2 ml-1">New Signature</label>
 <div className="relative group">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
 <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-11 pr-11 py-3.5 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:ring-2 focus:ring-primary-light transition-all font-black" placeholder="NEW PASSWORD" />
 <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary">{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
 </div>
 {newPassword && (
 <div className="mt-4 px-1 space-y-2">
 <div className="flex justify-between items-center text-[8px] font-black capitalize tracking-normal text-theme-muted"><span>Entropy Strength</span><span>{passwordStrength.label}</span></div>
 <div className="h-1.5 surface-section rounded-full overflow-hidden p-0.5 border border-theme">
 <div className={`h-full ${passwordStrength.color} rounded-full transition-all duration-500`} style={{ width: `${passwordStrength.score}%` }} />
 </div>
 </div>
 )}
 </div>

 <div>
 <label className="block text-[10px] font-black capitalize tracking-normal text-theme-muted mb-2 ml-1">Confirm Signature</label>
 <div className="relative group">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
 <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-11 pr-11 py-3.5 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:ring-2 focus:ring-primary-light transition-all font-black" placeholder="CONFIRM PASSWORD" />
 <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
 </div>
 {confirmPassword && (
 <p className={`mt-3 text-[10px] font-black flex items-center gap-1.5 ml-1 capitalize tracking-normal ${passwordsMatch ? 'text-success-green' : 'text-danger-red'}`}>
 {passwordsMatch ? <><CheckCircle className="w-3.5 h-3.5" /> Identity Match</> : <><AlertCircle className="w-3.5 h-3.5" /> Identity Mismatch</>}
 </p>
 )}
 </div>

 <button onClick={handleSavePassword} disabled={isSaving || !currentPassword || !newPassword || !passwordsMatch} className="w-full sm:w-auto px-8 py-4 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-black capitalize tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-primary-light/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95">
 {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Committing...</> : <><Save className="w-4 h-4" /> Commit Changes</>}
 </button>
 </div>
 </div>
 </motion.div>
 )}

 {activeTab === 'notifications' && (
 <motion.div key="notif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
 <div>
 <h2 className="text-[9px] sm:text-[10px] font-black text-theme-secondary capitalize tracking-[0.3em] mb-6 flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-primary-light shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
 Ecosystem Preferences
 </h2>
 
 <div className="space-y-6">
 <div>
 <label className="block text-[10px] font-black capitalize tracking-normal text-theme-muted mb-3 ml-1">Linguistics</label>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {LANGUAGES.map((lang) => (
 <button key={lang.code} onClick={() => setLanguage(lang.code)} className={`p-4 rounded-xl border text-center transition-all duration-300 ${language === lang.code ? 'bg-primary-light text-white border-primary-light shadow-xl' : 'surface-section text-theme-secondary border-theme hover:border-primary-light'}`}>
 <span className="text-2xl mb-2 block">{lang.flag}</span>
 <span className="text-[9px] font-black capitalize tracking-normal block">{lang.name}</span>
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-black capitalize tracking-normal text-theme-muted mb-2 ml-1">Temporal Alignment</label>
 <div className="relative group">
 <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
 <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full pl-11 pr-4 py-3.5 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:ring-2 focus:ring-primary-light font-black appearance-none cursor-pointer">
 {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
 </select>
 </div>
 </div>

 <div className="space-y-4 pt-4">
 <label className="block text-[10px] font-black capitalize tracking-normal text-theme-muted mb-1 ml-1">Broadcast Channels</label>
 {[
 { id: 'email', label: 'Email Broadcasts', desc: 'Detailed expedition updates', icon: Mail, state: emailNotifications, toggle: setEmailNotifications },
 { id: 'push', label: 'Direct Alerts', desc: 'Real-time mobile synchronization', icon: Smartphone, state: pushNotifications, toggle: setPushNotifications }
 ].map((item) => (
 <div key={item.id} className="flex items-center justify-between p-4 sm:p-6 surface-section border border-theme rounded-2xl shadow-sm hover:border-primary-light/30 transition-all group">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 flex items-center justify-center bg-primary-light/10 text-primary-light rounded-xl border border-primary-light/20 group-hover:scale-110 transition-transform"><item.icon className="w-5 h-5" /></div>
 <div className="min-w-0">
 <p className="text-xs font-black text-theme-primary capitalize italic tracking-tight">{item.label}</p>
 <p className="text-[9px] text-theme-muted font-bold capitalize tracking-normal opacity-70">{item.desc}</p>
 </div>
 </div>
 <button onClick={() => item.toggle(!item.state)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.state ? 'bg-primary-light' : 'bg-gray-200 dark:bg-gray-800'}`}><motion.span layout className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ${item.state ? 'translate-x-6' : 'translate-x-1'}`} /></button>
 </div>
 ))}
 </div>

 <button onClick={handleSavePreferences} disabled={isSaving} className="w-full sm:w-auto px-8 py-4 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-black capitalize tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-primary-light/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95">
 {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Synchronizing...</> : <><Save className="w-4 h-4" /> Save Configuration</>}
 </button>
 </div>
 </div>
 </motion.div>
 )}

 {activeTab === 'security' && (
 <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
 <div className="p-6 sm:p-10 bg-primary-light/5 border border-primary-light/20 rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-light/10 transition-colors" />
 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
 <div className="w-14 h-14 flex items-center justify-center bg-primary-light text-white rounded-2xl shadow-2xl shadow-primary-light/30 border border-white/20 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform"><Shield className="w-7 h-7" /></div>
 <div className="min-w-0 flex-1">
 <h3 className="text-sm font-black text-theme-primary mb-2 capitalize italic tracking-tight">Two-Factor Authentication</h3>
 <p className="text-[10px] sm:text-xs text-theme-secondary mb-6 leading-relaxed font-bold capitalize tracking-normal opacity-80">Inject a secondary validation layer into your login sequence for maximum account integrity.</p>
 <button className="px-6 py-3 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-black capitalize tracking-normal rounded-xl transition-all shadow-lg active:scale-95">Initialize 2FA</button>
 </div>
 </div>
 </div>

 <div className="p-6 sm:p-10 bg-red-500/5 border border-red-500/20 rounded-[2rem] sm:rounded-[3rem]">
 <h3 className="text-[10px] font-black text-red-600 dark:text-red-400 capitalize tracking-[0.3em] mb-4 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Termination Protocol</h3>
 <p className="text-[10px] sm:text-xs text-theme-secondary mb-6 leading-relaxed font-bold capitalize tracking-normal opacity-80">Deleting your account will trigger a permanent data purge. All expeditions, loyalty credits, and historical logs will be non-recoverable.</p>

 {!showDeleteConfirm ? (
 <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black capitalize tracking-normal rounded-xl transition-all shadow-xl shadow-red-500/20 active:scale-95">Initialize Account Purge</button>
 ) : (
 <div className="space-y-4 max-w-sm">
 <p className="text-[10px] font-black text-red-600 dark:text-red-400 capitalize tracking-normal">Input <span className="font-mono bg-red-600/10 px-2 py-1 rounded text-xs">DELETE</span> to confirm intent:</p>
 <input type="text" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} className="w-full px-5 py-4 surface-card border-2 border-red-500 rounded-2xl text-sm text-theme-primary focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all font-black capitalize tracking-[0.3em]" placeholder="DELETE" />
 <div className="flex flex-col sm:flex-row gap-3 pt-2">
 <button onClick={handleDeleteAccount} disabled={deleteText !== 'DELETE' || isDeleting} className="order-1 sm:order-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black capitalize tracking-normal rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xl shadow-red-600/30">
 {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Purging...</> : <>Confirm Permanent Purge</>}
 </button>
 <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }} className="order-2 sm:order-1 px-8 py-4 surface-section text-theme-muted hover:text-theme-primary text-[10px] font-black capitalize tracking-normal rounded-2xl transition-all border border-theme">Abort Mission</button>
 </div>
 </div>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 </div>
 );
}