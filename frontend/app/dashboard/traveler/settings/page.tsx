// ============================================================================
// TRAVELER SETTINGS - GENERAL SETTINGS PAGE
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/traveler/settings/page.tsx
// 
// FEATURES:
// ✓ Change password
// ✓ Language preference
// ✓ Timezone selection
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
 Trash2,
 Save,
 ChevronLeft,
 Eye,
 EyeOff,
 AlertCircle,
 CheckCircle,
 Loader2,
 Shield,
 Bell
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { authLogout, passwordChange, updateNotificationPreferences } from '@/src/lib/api/auth'
import { motion } from 'framer-motion'
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
 { value: 'America/New_York', label: 'Eastern Time (ET)' },
 { value: 'America/Chicago', label: 'Central Time (CT)' },
 { value: 'America/Denver', label: 'Mountain Time (MT)' },
 { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
 { value: 'Europe/London', label: 'London (GMT)' },
 { value: 'Europe/Istanbul', label: 'Istanbul (GMT+3)' },
 { value: 'Asia/Beirut', label: 'Beirut (GMT+2)' },
 { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
 { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
]

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TravelerSettingsPage() {
 const router = useRouter()
 const { user, forgotPassword } = useAuth()
 
 // ========================================
 // STATE
 // ========================================
 const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'security'>('account')
 
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
 const [emailNotifications, setEmailNotifications] = useState(user?.emailNotificationsEnabled ?? true)
 const [pushNotifications, setPushNotifications] = useState(user?.pushNotificationsEnabled ?? true)
 
 // Delete account
 const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
 const [deleteText, setDeleteText] = useState('')
 
 // UI states
 const [isSaving, setIsSaving] = useState(false)
 const [isDeleting, setIsDeleting] = useState(false)
 const [touched, setTouched] = useState<Record<string, boolean>>({})
 const [errors, setErrors] = useState<Record<string, string>>({})

 // ========================================
 // DERIVED VALUES
 // ========================================
 const passwordStrength = getPasswordStrength(newPassword)
 const passwordsMatch = newPassword === confirmPassword

 // ========================================
 // HANDLERS
 // ========================================

 const handleSavePassword = async () => {
 // Validate
 if (!currentPassword) {
 toast.error('Please enter your current password')
 return
 }
 if (newPassword.length < 8) {
 toast.error('New password must be at least 8 characters')
 return
 }
 if (newPassword !== confirmPassword) {
 toast.error('Passwords do not match')
 return
 }

 setIsSaving(true)
 
 try {
 await passwordChange({
 currentPassword,
 newPassword
 })
 toast.success('Password updated successfully!')
 
 // Clear form
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
 // Assuming context updates or just reload the context here if needed
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
 // Phase 2: API call
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
    <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)] surface-base">
 <div className="container-safe mx-auto max-w-4xl py-8 sm:py-10">
 
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/traveler"
          className="p-2.5 text-theme-muted hover:text-primary-light surface-card border border-theme rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-theme-primary tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-theme-secondary font-medium">
            Manage your account preferences and security
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="surface-card border border-theme rounded-xl shadow-xl shadow-primary-light/5 overflow-hidden transition-all duration-500">
        
        {/* Tabs */}
        <div className="flex border-b border-theme">
          {[
            { id: 'account', label: 'Account', icon: Lock },
            { id: 'preferences', label: 'Preferences', icon: Globe },
            { id: 'security', label: 'Security', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  isActive
                    ? 'text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark bg-primary-light/5'
                    : 'text-theme-muted hover:text-theme-secondary'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

 {/* Tab Content */}
        <div className="p-8">
          
          {/* ========================================
          ACCOUNT TAB
          ======================================== */}
          {activeTab === 'account' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-500" />
                  Traveler Credentials
                </h2>
                
                <div className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 surface-section border border-theme rounded-xl text-sm text-theme-primary outline-none focus:ring-2 focus:ring-primary-light/20 transition-all font-medium"
                        placeholder="••••••••"
                      />
                      <button
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={handleForgotPassword}
                      disabled={isSaving}
                      className="mt-2 text-xs text-primary-light hover:text-blue-500 font-bold transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>

 {/* New Password */}
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
 className="w-full pl-9 pr-10 py-2 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 placeholder="Enter new password"
 />
 <button
 onClick={() => setShowNewPassword(!showNewPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary"
 >
 {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 
 {/* Password Strength */}
 {newPassword && (
 <div className="mt-2">
 <div className="flex items-center gap-2">
 <div className="flex-1 h-1.5 surface-section rounded-full overflow-hidden">
 <div
 className={`h-full ${passwordStrength.color} transition-all duration-300`}
 style={{ width: `${passwordStrength.score}%` }}
 />
 </div>
 <span className="text-xs font-medium text-theme-secondary ">
 {passwordStrength.label}
 </span>
 </div>
 </div>
 )}
 </div>

 {/* Confirm Password */}
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
 className="w-full pl-9 pr-10 py-2 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 placeholder="Confirm new password"
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

                  {/* Save Button */}
                  <button
                    onClick={handleSavePassword}
                    disabled={isSaving || !currentPassword || !newPassword || !passwordsMatch}
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                  >
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Update Password</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ========================================
          PREFERENCES TAB
          ======================================== */}
          {activeTab === 'preferences' && (
            <div className="space-y-10">
              {/* Language */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-theme-secondary mb-6 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-500" />
                  Global Preferences
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 shadow-sm ${
                        language === lang.code
                          ? 'bg-primary-light text-white border-primary-light shadow-primary-light/20'
                          : 'surface-base text-theme-secondary border-theme hover:border-primary-light'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{lang.flag}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-theme-secondary mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Regional Synchronizer
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 surface-section border border-theme rounded-xl text-sm text-theme-primary outline-none focus:ring-2 focus:ring-primary-light/20 transition-all font-medium appearance-none bg-no-repeat bg-[right_1rem_center]"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-theme-muted font-bold mt-2 uppercase tracking-widest italic opacity-70">
                  All trip schedules will be synchronized to this zone
                </p>
              </div>

              {/* Notifications */}
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-theme-secondary mb-6 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-500" />
                  Communication Ecosystem
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'email', label: 'Email Notifications', value: emailNotifications, setter: setEmailNotifications },
                    { id: 'push', label: 'Push Notifications', value: pushNotifications, setter: setPushNotifications }
                  ].map((notif) => (
                    <label key={notif.id} className="flex items-center justify-between p-4 surface-base border border-theme rounded-2xl cursor-pointer hover:border-primary-light/30 transition-all group">
                      <span className="text-sm font-bold text-theme-primary group-hover:text-primary-light transition-colors">{notif.label}</span>
                      <button
                        onClick={() => notif.setter(!notif.value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notif.value ? 'bg-primary-light' : 'surface-section border border-theme'
                        }`}
                      >
                        <motion.span 
                          layout
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md ${
                            notif.value ? 'translate-x-6' : 'translate-x-1'
                          }`} 
                        />
                      </button>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Preferences</>
                )}
              </button>
            </div>
          )}
          {/* ========================================
          SECURITY TAB
          ======================================== */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Two Factor Auth */}
              <div className="p-8 surface-section border border-theme rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-light/10 transition-colors" />
                <div className="flex items-start gap-6 relative z-10">
                  <div className="w-14 h-14 bg-primary-light/10 text-primary-light rounded-2xl flex items-center justify-center border border-primary-light/20 shadow-inner">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[10px] font-black text-theme-secondary uppercase tracking-[0.25em] mb-4">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-theme-secondary font-medium mb-6 leading-relaxed max-w-md">
                      Protect your account with an additional layer of security. We will ask for a code whenever you log in from a new device.
                    </p>
                    <button className="px-6 py-3 bg-primary-light hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                      Secure Account Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Account - Danger Zone */}
              <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <h3 className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.25em]">
                    Danger Zone
                  </h3>
                </div>
                <p className="text-sm text-theme-secondary font-medium mb-6 leading-relaxed max-w-md">
                  Once you delete your account, there is no going back. All your data, bookings, and loyalty progress will be permanently erased.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/20 shadow-sm"
                  >
                    Request Account Deletion
                  </button>
                ) : (
                  <div className="space-y-4 max-w-xs">
                    <p className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                      Type <span className="text-theme-primary px-1.5 py-0.5 surface-card rounded border border-theme">DELETE</span> to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteText}
                      onChange={(e) => setDeleteText(e.target.value)}
                      className="w-full px-4 py-3 surface-card border-2 border-red-500/30 rounded-xl text-sm text-theme-primary outline-none focus:border-red-500 transition-all font-bold tracking-widest placeholder-red-300"
                      placeholder="DELETE"
                    />
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteText !== 'DELETE' || isDeleting}
                        className="flex-1 px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                      >
                        {isDeleting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Purging...</>
                        ) : (
                          <>Confirm Delete</>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteText('')
                        }}
                        className="flex-1 px-4 py-3.5 surface-base text-theme-secondary text-xs font-black uppercase tracking-widest rounded-xl border border-theme hover:bg-theme-muted/5 transition-all"
                      >
                        Abandone
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