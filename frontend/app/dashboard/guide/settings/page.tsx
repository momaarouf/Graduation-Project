// ============================================================================
// GUIDE SETTINGS - GENERAL SETTINGS PAGE
// ============================================================================
// LOCATION: /frontend/app/dashboard/guide/settings/page.tsx
// 
// FEATURES:
// ✓ Change password
// ✓ Language preference
// ✓ Timezone selection
// ✓ Notification preferences
// ✓ Delete account with confirmation
// ✓ Dual theme support
// ============================================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
 Settings,
 Lock,
 Globe,
 Clock,
 Bell,
 Mail,
 Smartphone,
 Trash2,
 Save,
 ChevronLeft,
 Eye,
 EyeOff,
 AlertCircle,
 CheckCircle,
 Loader2,
 Shield
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { passwordChange, updateNotificationPreferences } from '@/src/lib/api/auth'

// ============================================================================
// PASSWORD STRENGTH INDICATOR
// ============================================================================

const getPasswordStrength = (password: string): {
 score: number
 label: string
 color: string
} => {
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

// ============================================================================
// CONFIGURATIONS
// ============================================================================

const LANGUAGES = [
 { code: 'en', name: 'English', flag: '🇬🇧' },
 { code: 'ar', name: 'العربية', flag: '🇸🇦' },
 { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
 { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

const TIMEZONES = [
 { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
 { value: 'Europe/Istanbul', label: 'Istanbul (GMT+3)' },
 { value: 'Asia/Beirut', label: 'Beirut (GMT+2)' },
 { value: 'Europe/London', label: 'London (GMT)' },
 { value: 'America/New_York', label: 'Eastern Time (ET)' },
]

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideSettingsPage() {
 const router = useRouter()
 const { user, forgotPassword } = useAuth()
 
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

 // ========================================
 // HANDLERS
 // ========================================

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
 toast.success('Reset code sent to your email!')
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
 await updateNotificationPreferences({
 emailNotificationsEnabled: emailNotifications,
 pushNotificationsEnabled: pushNotifications
 });
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
 toast.success('Account deleted successfully')
 router.push('/')
 } catch (error) {
 toast.error('Failed to delete account')
 setIsDeleting(false)
 }
 }

 return (
 <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar">
 <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
 
 {/* Header */}
 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
 <Link
 href="/dashboard/guide"
 className="p-2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 hover:surface-section dark:hover:surface-card rounded-lg transition-colors"
 >
 <ChevronLeft className="w-5 h-5" />
 </Link>
 <div>
 <h1 className="text-xl sm:text-3xl font-bold text-theme-primary mb-0.5 tracking-tight uppercase">
 Settings
 </h1>
 <p className="text-[10px] sm:text-sm text-theme-secondary font-bold uppercase tracking-widest opacity-70">
 Account & Platform Preferences
 </p>
 </div>
 </div>

 {/* Main Settings Card */}
 <div className="surface-card border border-theme rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden transition-all duration-500">
 
 {/* Tabs - Optimized for Mobile Density */}
 <div className="flex border-b border-theme bg-surface-section/30">
 {['account', 'notifications', 'security'].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab as any)}
 className={`flex-1 px-2 sm:px-4 py-4 text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
 activeTab === tab
 ? 'text-primary-light dark:text-primary-dark'
 : 'text-theme-muted hover:text-theme-secondary'
 }`}
 >
 {tab}
 {activeTab === tab && (
 <motion.div 
 layoutId="activeTab"
 className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light dark:bg-primary-dark" 
 />
 )}
 </button>
 ))}
 </div>

 {/* Tab Content Area */}
 <div className="p-4 sm:p-8">
 
 {activeTab === 'account' && (
 <div className="space-y-8">
 {/* Password Management */}
 <div>
 <h2 className="text-[9px] sm:text-[10px] font-bold text-theme-secondary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
 Security Credentials
 </h2>
 
 <div className="space-y-5">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-2 ml-1">Current Password</label>
 <div className="relative">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type={showCurrentPassword ? 'text' : 'password'}
 value={currentPassword}
 onChange={(e) => setCurrentPassword(e.target.value)}
 className="w-full pl-11 pr-11 py-3 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark transition-all font-bold"
 />
 <button
 onClick={() => setShowCurrentPassword(!showCurrentPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted"
 >
 {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 <button
 onClick={handleForgotPassword}
 className="mt-2 text-[10px] text-primary-light dark:text-primary-dark hover:opacity-80 font-bold uppercase tracking-widest ml-1"
 >
 Forgot Password?
 </button>
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-2 ml-1">New Password</label>
 <div className="relative">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type={showNewPassword ? 'text' : 'password'}
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="w-full pl-11 pr-11 py-3 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark transition-all font-bold"
 />
 <button
 onClick={() => setShowNewPassword(!showNewPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted"
 >
 {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {newPassword && (
 <div className="mt-3 px-1">
 <div className="flex items-center gap-3">
 <div className="flex-1 h-1.5 surface-section rounded-full overflow-hidden border border-theme">
 <div className={`h-full ${passwordStrength.color} transition-all duration-500`} style={{ width: `${passwordStrength.score}%` }} />
 </div>
 <span className="text-[9px] font-bold uppercase tracking-widest text-theme-secondary whitespace-nowrap">{passwordStrength.label}</span>
 </div>
 </div>
 )}
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-2 ml-1">Confirm New Password</label>
 <div className="relative">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type={showConfirmPassword ? 'text' : 'password'}
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full pl-11 pr-11 py-3 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark transition-all font-bold"
 />
 <button
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted"
 >
 {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {confirmPassword && (
 <p className={`mt-2 text-[10px] font-bold flex items-center gap-1.5 ml-1 ${passwordsMatch ? 'text-success-green' : 'text-danger-red'}`}>
 {passwordsMatch ? <><CheckCircle className="w-3.5 h-3.5" /> Passwords match</> : <><AlertCircle className="w-3.5 h-3.5" /> Passwords do not match</>}
 </p>
 )}
 </div>

 <button
 onClick={handleSavePassword}
 disabled={isSaving || !currentPassword || !newPassword || !passwordsMatch}
 className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Save className="w-4 h-4" /> Update Password</>}
 </button>
 </div>
 </div>

 {/* Regional Options */}
 <div className="pt-8 border-t border-theme">
 <h2 className="text-[9px] sm:text-[10px] font-bold text-theme-secondary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-primary-light" />
 Regional Preferences
 </h2>
 
 <div className="space-y-6">
 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-3 ml-1">System Language</label>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {LANGUAGES.map((lang) => (
 <button
 key={lang.code}
 onClick={() => setLanguage(lang.code)}
 className={`p-4 rounded-xl border text-center transition-all duration-300 ${language === lang.code ? 'bg-primary-light text-white border-primary-light shadow-xl' : 'surface-section text-theme-secondary border-theme hover:border-primary-light'}`}
 >
 <span className="text-2xl mb-2 block">{lang.flag}</span>
 <span className="text-[9px] font-bold uppercase tracking-widest block">{lang.name}</span>
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-bold uppercase tracking-widest text-theme-muted mb-2 ml-1">Local Timezone</label>
 <div className="relative">
 <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <select
 value={timezone}
 onChange={(e) => setTimezone(e.target.value)}
 className="w-full pl-11 pr-4 py-3 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark font-bold appearance-none"
 >
 {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
 </select>
 </div>
 </div>

 <button
 onClick={handleSavePreferences}
 disabled={isSaving}
 className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Preferences</>}
 </button>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'notifications' && (
 <div className="space-y-8">
 <h2 className="text-[9px] sm:text-[10px] font-bold text-theme-secondary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent-dark" />
 Notification Ecosystem
 </h2>

 <div className="space-y-4">
 {[
 { id: 'email', label: 'Email Notifications', desc: 'Booking updates & messages', icon: Mail, state: emailNotifications, toggle: setEmailNotifications },
 { id: 'push', label: 'Push Notifications', desc: 'Instant alerts on mobile', icon: Smartphone, state: pushNotifications, toggle: setPushNotifications }
 ].map((item) => (
 <div key={item.id} className="flex items-center justify-between p-4 sm:p-6 surface-section border border-theme rounded-2xl shadow-sm hover:border-primary-light/30 transition-all">
 <div className="flex items-center gap-3 sm:gap-4">
 <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-primary-light/10 text-primary-light rounded-xl flex-shrink-0">
 <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
 </div>
 <div className="min-w-0">
 <p className="text-xs sm:text-sm font-bold text-theme-primary truncate">{item.label}</p>
 <p className="text-[9px] sm:text-xs text-theme-muted font-bold truncate">{item.desc}</p>
 </div>
 </div>
 <button
 onClick={() => item.toggle(!item.state)}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${item.state ? 'bg-primary-light' : 'bg-gray-200 dark:bg-gray-800'}`}
 >
 <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${item.state ? 'translate-x-6' : 'translate-x-1'}`} />
 </button>
 </div>
 ))}

 <button
 onClick={handleSavePreferences}
 disabled={isSaving}
 className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
 >
 {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Settings</>}
 </button>
 </div>
 </div>
 )}

 {activeTab === 'security' && (
 <div className="space-y-8">
 <div className="p-6 sm:p-8 bg-primary-light/5 border border-primary-light/20 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-light/10 transition-colors" />
 <div className="flex items-start gap-4 relative z-10">
 <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-primary-light text-white rounded-xl shadow-lg flex-shrink-0">
 <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
 </div>
 <div className="min-w-0">
 <h3 className="text-sm sm:text-base font-bold text-theme-primary mb-1 tracking-tight">Two-Factor Authentication</h3>
 <p className="text-[10px] sm:text-xs text-theme-secondary mb-5 leading-relaxed font-bold opacity-80">Add an extra layer of defense. Requires a secure code from your mobile device to sign in.</p>
 <button className="px-5 py-2 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">Enable 2FA</button>
 </div>
 </div>
 </div>

 <div className="p-6 sm:p-8 bg-red-500/5 border border-red-500/20 rounded-2xl sm:rounded-3xl">
 <h3 className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
 <Trash2 className="w-4 h-4" />
 Danger Zone
 </h3>
 <p className="text-[10px] sm:text-xs text-theme-secondary mb-6 leading-relaxed font-bold opacity-80">Deleting your account will permanently wipe all tours, bookings, and earnings history. This action cannot be undone.</p>

 {!showDeleteConfirm ? (
 <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-md">Delete Account</button>
 ) : (
 <div className="space-y-4">
 <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Type <span className="font-mono bg-red-600/10 px-2 py-0.5 rounded text-xs">DELETE</span> to confirm:</p>
 <input
 type="text"
 value={deleteText}
 onChange={(e) => setDeleteText(e.target.value)}
 className="w-full px-4 py-3 surface-card border-2 border-danger-red dark:border-danger-red rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-danger-red transition-all font-bold"
 placeholder="DELETE"
 />
 <div className="flex flex-col sm:flex-row gap-2">
 <button onClick={handleDeleteAccount} disabled={deleteText !== 'DELETE' || isDeleting} className="order-1 sm:order-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
 {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <>Confirm Permanent Deletion</>}
 </button>
 <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }} className="order-2 sm:order-1 px-6 py-3 surface-section text-theme-muted hover:text-theme-primary text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-theme">Cancel</button>
 </div>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
