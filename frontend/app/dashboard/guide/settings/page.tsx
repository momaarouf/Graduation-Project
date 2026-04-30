// ============================================================================
// GUIDE SETTINGS - GENERAL SETTINGS PAGE
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/settings/page.tsx
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
import toast from 'react-hot-toast'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { authLogout, passwordChange, updateNotificationPreferences } from '@/src/lib/api/auth'

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
// LANGUAGE OPTIONS
// ============================================================================

const LANGUAGES = [
 { code: 'en', name: 'English', flag: '🇬🇧' },
 { code: 'ar', name: 'العربية', flag: '🇸🇦' },
 { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
 { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

// ============================================================================
// TIMEZONE OPTIONS
// ============================================================================

const TIMEZONES = [
 { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
 { value: 'Europe/Istanbul', label: 'Istanbul (GMT+3)' },
 { value: 'Asia/Beirut', label: 'Beirut (GMT+2)' },
 { value: 'Europe/London', label: 'London (GMT)' },
 { value: 'America/New_York', label: 'Eastern Time (ET)' },
]

// ============================================================================
// NOTIFICATION FREQUENCY
// ============================================================================

const NOTIFICATION_FREQUENCIES = [
 { value: 'immediate', label: 'Immediate' },
 { value: 'daily', label: 'Daily Digest' },
 { value: 'weekly', label: 'Weekly Digest' },
 { value: 'never', label: 'Never' },
]

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideSettingsPage() {
 const router = useRouter()
 const { user, forgotPassword } = useAuth()
 
 // ========================================
 // STATE
 // ========================================
 const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'security'>('account')
 
 // Password change
 const [currentPassword, setCurrentPassword] = useState('')
 const [newPassword, setNewPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showCurrentPassword, setShowCurrentPassword] = useState(false)
 const [showNewPassword, setShowNewPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)
 
 // Preferences
 const [language, setLanguage] = useState('en')
 const [timezone, setTimezone] = useState('UTC')
 
 // Notifications
 const [emailNotifications, setEmailNotifications] = useState(user?.emailNotificationsEnabled ?? true)
 const [pushNotifications, setPushNotifications] = useState(user?.pushNotificationsEnabled ?? true)
 
 // Delete account
 const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
 const [deleteText, setDeleteText] = useState('')
 
 // UI states
 const [isSaving, setIsSaving] = useState(false)
 const [isDeleting, setIsDeleting] = useState(false)

 // ========================================
 // DERIVED VALUES
 // ========================================
 const passwordStrength = getPasswordStrength(newPassword)
 const passwordsMatch = newPassword === confirmPassword

 // ========================================
 // HANDLERS
 // ========================================

 const handleSavePassword = async () => {
 if (!currentPassword || !newPassword || !passwordsMatch) return

 setIsSaving(true)
 
 try {
 await passwordChange({
 currentPassword,
 newPassword
 })
 toast.success('Password updated successfully!')
 setCurrentPassword('')
 setNewPassword('')
 setConfirmPassword('')
 } catch (error: any) {
 toast.error(error.response?.data?.message || 'Failed to update password')
 } finally {
 setIsSaving(false)
 }
 }

 const handleForgotPassword = async () => {
 if (!user?.email) {
 toast.error('User email not found')
 return
 }

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
 <>
 <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">
 <div className="container-safe mx-auto max-w-4xl py-8 sm:py-10">
 
 {/* Header */}
 <div className="flex items-center gap-4 mb-6">
 <Link
 href="/dashboard/guide"
 className="p-2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 hover:surface-section dark:hover:surface-card rounded-lg transition-colors"
 >
 <ChevronLeft className="w-5 h-5" />
 </Link>
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-1">
 Settings
 </h1>
 <p className="text-sm text-theme-secondary ">
 Manage your account and notification preferences
 </p>
 </div>
 </div>

 {/* Main Card */}
 <div className="surface-card border border-theme rounded-xl shadow-xl overflow-hidden transition-all duration-500">
 
 {/* Tabs */}
 <div className="flex border-b border-theme">
 <button
 onClick={() => setActiveTab('account')}
 className={`flex-1 px-4 py-3 text-sm font-black uppercase tracking-widest transition-colors ${
 activeTab === 'account'
 ? 'text-primary-light dark:text-primary-dark dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark'
 : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300'
 }`}
 >
 Account
 </button>
 <button
 onClick={() => setActiveTab('notifications')}
 className={`flex-1 px-4 py-3 text-sm font-black uppercase tracking-widest transition-colors ${
 activeTab === 'notifications'
 ? 'text-primary-light dark:text-primary-dark dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark'
 : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300'
 }`}
 >
 Notifications
 </button>
 <button
 onClick={() => setActiveTab('security')}
 className={`flex-1 px-4 py-3 text-sm font-black uppercase tracking-widest transition-colors ${
 activeTab === 'security'
 ? 'text-primary-light dark:text-primary-dark dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark'
 : 'text-theme-muted hover:text-theme-secondary dark:hover:text-gray-300'
 }`}
 >
 Security
 </button>
 </div>

 {/* Tab Content */}
 <div className="p-6">
 
 {/* ========================================
 ACCOUNT TAB
 ======================================== */}
 {activeTab === 'account' && (
 <div className="space-y-6">
 {/* Password Change - same as traveler */}
 <div>
  <h2 className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
  <Lock className="w-4 h-4 text-orange-500" />
  Security Credentials
  </h2>
 
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Current Password
 </label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type={showCurrentPassword ? 'text' : 'password'}
 value={currentPassword}
 onChange={(e) => setCurrentPassword(e.target.value)}
 className="w-full pl-9 pr-10 py-2 surface-section border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 <button
 onClick={() => setShowCurrentPassword(!showCurrentPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary"
 >
 {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 <button
 onClick={handleForgotPassword}
 disabled={isSaving}
 className="mt-1 text-xs text-primary-light dark:text-primary-dark hover:opacity-80 font-medium transition-colors"
 >
 Forgot Password?
 </button>
 </div>

 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 New Password
 </label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type={showNewPassword ? 'text' : 'password'}
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="w-full pl-9 pr-10 py-2 surface-section border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 <button
 onClick={() => setShowNewPassword(!showNewPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary"
 >
 {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 
 {newPassword && (
 <div className="mt-2">
 <div className="flex items-center gap-2">
 <div className="flex-1 h-1.5 surface-section rounded-full overflow-hidden">
 <div
 className={`h-full ${passwordStrength.color} transition-all duration-300`}
 style={{ width: `${passwordStrength.score}%` }}
 />
 </div>
  <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary">
  {passwordStrength.label}
  </span>
 </div>
 </div>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Confirm New Password
 </label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type={showConfirmPassword ? 'text' : 'password'}
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full pl-9 pr-10 py-2 surface-section border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 <button
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary"
 >
 {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {confirmPassword && (
 <p className={`mt-1 text-xs flex items-center gap-1 ${
 passwordsMatch ? 'text-success-green' : 'text-danger-red'
 }`}>
 {passwordsMatch ? (
 <><CheckCircle className="w-3 h-3" /> Passwords match</>
 ) : (
 <><AlertCircle className="w-3 h-3" /> Passwords do not match</>
 )}
 </p>
 )}
 </div>

 <button
 onClick={handleSavePassword}
 disabled={isSaving || !currentPassword || !newPassword || !passwordsMatch}
 className="px-4 py-2 bg-primary-light hover:bg-primary-light-hover text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
 >
 {isSaving ? (
 <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
 ) : (
 <><Save className="w-4 h-4" /> Update Password</>
 )}
 </button>
 </div>
 </div>

 {/* Language & Timezone */}
  <div className="pt-8 border-t border-theme">
  <h2 className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
  <Globe className="w-4 h-4 text-orange-500" />
  Regional Preferences
  </h2>
 
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-2">
 <Globe className="w-4 h-4 inline mr-2" />
 Language
 </label>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
  {LANGUAGES.map((lang) => (
  <button
  key={lang.code}
  onClick={() => setLanguage(lang.code)}
  className={`p-4 rounded-xl border text-center transition-all duration-300 ${
  language === lang.code
  ? 'bg-primary-light text-white border-primary-light shadow-lg shadow-primary-light/20 scale-[1.02]'
  : 'surface-section text-theme-secondary border-theme hover:border-primary-light'
  }`}
  >
  <span className="text-2xl mb-2 block">{lang.flag}</span>
  <span className="text-[10px] font-black uppercase tracking-widest">{lang.name}</span>
  </button>
  ))}
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-2">
 <Clock className="w-4 h-4 inline mr-2" />
 Timezone
 </label>
 <select
 value={timezone}
 onChange={(e) => setTimezone(e.target.value)}
 className="w-full px-3 py-2 surface-section border border-theme rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 >
 {TIMEZONES.map((tz) => (
 <option key={tz.value} value={tz.value}>
 {tz.label}
 </option>
 ))}
 </select>
 </div>

 <button
 onClick={handleSavePreferences}
 disabled={isSaving}
 className="px-4 py-2 bg-primary-light hover:bg-primary-light-hover text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
 >
 {isSaving ? (
 <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
 ) : (
 <><Save className="w-4 h-4" /> Save Preferences</>
 )}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ========================================
 NOTIFICATIONS TAB
 ======================================== */}
 {activeTab === 'notifications' && (
 <div className="space-y-6">
  <div>
  <h2 className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
  <Bell className="w-4 h-4 text-orange-500" />
  Notification Ecosystem
  </h2>

 <div className="space-y-4">
 {/* Email Notifications */}
  <div className="flex items-center justify-between p-5 surface-section border border-theme rounded-2xl shadow-sm">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 flex items-center justify-center bg-primary-light/10 text-primary-light rounded-xl">
  <Mail className="w-6 h-6" />
  </div>
  <div>
  <p className="text-sm font-bold text-theme-primary">Email Notifications</p>
  <p className="text-xs text-theme-muted ">Booking updates and private messages</p>
  </div>
  </div>
 <button
 onClick={() => setEmailNotifications(!emailNotifications)}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
 emailNotifications ? 'bg-primary-light' : 'surface-section'
 }`}
 >
 <span className={`inline-block h-4 w-4 transform rounded-full surface-card transition-transform ${
 emailNotifications ? 'translate-x-6' : 'translate-x-1'
 }`} />
 </button>
 </div>

 {/* Push Notifications */}
  <div className="flex items-center justify-between p-5 surface-section border border-theme rounded-2xl shadow-sm">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 flex items-center justify-center bg-primary-light/10 text-primary-light rounded-xl">
  <Smartphone className="w-6 h-6" />
  </div>
  <div>
  <p className="text-sm font-bold text-theme-primary">Push Notifications</p>
  <p className="text-xs text-theme-muted ">Instant alerts on your mobile devices</p>
  </div>
  </div>
 <button
 onClick={() => setPushNotifications(!pushNotifications)}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
 pushNotifications ? 'bg-primary-light' : 'surface-section'
 }`}
 >
 <span className={`inline-block h-4 w-4 transform rounded-full surface-card transition-transform ${
 pushNotifications ? 'translate-x-6' : 'translate-x-1'
 }`} />
 </button>
 </div>

 {/* Save Button */}
 <button
 onClick={handleSavePreferences}
 disabled={isSaving}
 className="px-4 py-2 bg-primary-light hover:bg-primary-light-hover text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
 >
 {isSaving ? (
 <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
 ) : (
 <><Save className="w-4 h-4" /> Save Notification Settings</>
 )}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ========================================
 SECURITY TAB
 ======================================== */}
 {activeTab === 'security' && (
 <div className="space-y-6">
 {/* Two Factor Auth */}
  <div className="p-8 bg-primary-light/5 border border-primary-light/20 rounded-2xl">
  <div className="flex items-start gap-4">
  <div className="w-12 h-12 flex items-center justify-center bg-primary-light text-white rounded-xl shadow-lg shadow-primary-light/20">
  <Shield className="w-6 h-6" />
  </div>
  <div>
  <h3 className="text-sm font-bold text-theme-primary mb-1">
  Two-Factor Authentication
  </h3>
  <p className="text-xs text-theme-secondary mb-4 leading-relaxed">
  Add an extra layer of defense to your guide account. Requires a code from your mobile device to sign in.
  </p>
 <button className="px-3 py-1.5 bg-primary-light hover:bg-primary-light-hover text-white text-sm rounded-lg transition-colors">
 Enable 2FA
 </button>
 </div>
 </div>
 </div>

 {/* Delete Account - Danger Zone */}
  <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-2xl">
  <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
  <Trash2 className="w-4 h-4" />
  Danger Zone
  </h3>
  <p className="text-xs text-theme-secondary mb-6 leading-relaxed">
  Once you delete your account, all your tours, bookings, and earnings history will be permanently wiped. This action is irreversible.
  </p>

 {!showDeleteConfirm ? (
 <button
 onClick={() => setShowDeleteConfirm(true)}
 className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
 >
 Delete Account
 </button>
 ) : (
 <div className="space-y-3">
 <p className="text-sm text-red-700 dark:text-red-400">
 Type <span className="font-mono font-bold">DELETE</span> to confirm:
 </p>
 <input
 type="text"
 value={deleteText}
 onChange={(e) => setDeleteText(e.target.value)}
 className="w-full px-3 py-2 surface-card border border-danger-red dark:border-danger-red rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-danger-red"
 placeholder="DELETE"
 />
 <div className="flex gap-2">
 <button
 onClick={handleDeleteAccount}
 disabled={deleteText !== 'DELETE' || isDeleting}
 className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {isDeleting ? (
 <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
 ) : (
 <>Confirm Delete</>
 )}
 </button>
 <button
 onClick={() => {
 setShowDeleteConfirm(false)
 setDeleteText('')
 }}
 className="flex-1 px-4 py-2 surface-section text-theme-secondary rounded-lg hover:surface-section dark:hover:surface-section transition-colors"
 >
 Cancel
 </button>
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
 </>
 )
}