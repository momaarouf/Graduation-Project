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
import { passwordChange, updateNotificationPreferences, deleteAccount, generate2FA, enable2FA, disable2FA } from '@/src/lib/api/auth'
import SettingsSkeleton from '@/src/components/dashboard/SettingsSkeleton'
import SetPasswordForm from '@/src/components/auth/SetPasswordForm'

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
 const { user, forgotPassword, isLoading, logout } = useAuth()
 
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
 const [isSaving, setIsSaving] = useState(false)
 const [isDeletingAccount, setIsDeletingAccount] = useState(false)
 const [deleteConfirmText, setDeleteConfirmText] = useState('')
 const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

 // 2FA states
 const [twoFaStatus, setTwoFaStatus] = useState<'idle' | 'scanning' | 'disabling'>('idle')
 const [qrCodeUri, setQrCodeUri] = useState('')
 const [twoFaCode, setTwoFaCode] = useState('')
 const [is2FaEnabled, setIs2FaEnabled] = useState(false)
 const [is2FaLoading, setIs2FaLoading] = useState(false)

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

 const handleGenerate2FA = async () => {
 setIs2FaLoading(true)
 try {
 const data = await generate2FA()
 setQrCodeUri(data.qrCodeUri)
 setTwoFaStatus('scanning')
 } catch (error: any) {
 toast.error(error.response?.data?.message || 'Failed to generate 2FA setup')
 } finally {
 setIs2FaLoading(false)
 }
 }

 const handleEnable2FA = async () => {
 if (twoFaCode.length < 6) return
 setIs2FaLoading(true)
 try {
 await enable2FA(twoFaCode)
 setIs2FaEnabled(true)
 setTwoFaStatus('idle')
 setTwoFaCode('')
 setQrCodeUri('')
 toast.success('Two-Factor Authentication enabled!')
 } catch (error: any) {
 toast.error(error.response?.data?.message || 'Invalid code. Please try again.')
 } finally {
 setIs2FaLoading(false)
 }
 }

 const handleDisable2FA = async () => {
 if (twoFaCode.length < 6) return
 setIs2FaLoading(true)
 try {
 await disable2FA(twoFaCode)
 setIs2FaEnabled(false)
 setTwoFaStatus('idle')
 setTwoFaCode('')
 toast.success('Two-Factor Authentication disabled.')
 } catch (error: any) {
 toast.error(error.response?.data?.message || 'Invalid code. Please try again.')
 } finally {
 setIs2FaLoading(false)
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
 if (deleteConfirmText !== 'DELETE') {
 toast.error('Please type DELETE to confirm')
 return
 }
 setIsDeletingAccount(true)
 try {
 await deleteAccount()
 toast.success('Account deleted. Goodbye!')
 await logout()
 } catch (error: any) {
 toast.error(error.response?.data?.message || 'Failed to delete account')
 } finally {
 setIsDeletingAccount(false)
 setShowDeleteConfirm(false)
 setDeleteConfirmText('')
 }
 }

 return (
 <>
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
 <h1 className="text-xl sm:text-3xl font-bold text-theme-primary mb-0.5 tracking-tight capitalize">
 Settings
 </h1>
 <p className="text-[10px] sm:text-sm text-theme-secondary font-bold capitalize tracking-normal opacity-70">
 Account & Platform Preferences
 </p>
 </div>
 </div>

 {/* Main Settings Card */}
 <div className="surface-card border border-theme rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden transition-all duration-500">
 
 {/* Tabs - Optimized for Mobile Density */}
 <div className="flex border-b border-[#c8d8f8] dark:border-[#1a3566] bg-surface-section/30">
 {['account', 'notifications', 'security'].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab as any)}
 className={`flex-1 px-2 sm:px-4 py-4 text-[9px] sm:text-xs font-bold capitalize tracking-[0.2em] transition-all relative ${
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
 <h2 className="text-[9px] sm:text-[10px] font-bold text-theme-secondary capitalize tracking-[0.3em] mb-6 flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
 Security Credentials
 </h2>
 
 <div className="space-y-5">
  {/* Conditionally show Set Password (OAuth) or Change Password (normal) */}
  {!user.hasPassword ? (
  <div>
  <div className="flex items-center gap-2 mb-4">
  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
  <span className="text-[9px] sm:text-[10px] font-bold text-theme-secondary capitalize tracking-[0.3em]">Secure Your Account</span>
  </div>
  <SetPasswordForm />
  </div>
  ) : (
  <>
  <div>
  <label className="block text-[10px] font-bold capitalize tracking-normal text-theme-muted mb-2 ml-1">Current Password</label>
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
  className="mt-2 text-[10px] text-primary-light dark:text-primary-dark hover:opacity-80 font-bold capitalize tracking-normal ml-1"
  >
  Forgot Password?
  </button>
  </div>

  <div>
  <label className="block text-[10px] font-bold capitalize tracking-normal text-theme-muted mb-2 ml-1">New Password</label>
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
  <span className="text-[9px] font-bold capitalize tracking-normal text-theme-secondary whitespace-nowrap">{passwordStrength.label}</span>
  </div>
  </div>
  )}
  </div>

  <div>
  <label className="block text-[10px] font-bold capitalize tracking-normal text-theme-muted mb-2 ml-1">Confirm New Password</label>
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
  className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold capitalize tracking-[0.2em] rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
  >
  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Save className="w-4 h-4" /> Update Password</>}
  </button>
  </>
  )}
 </div>
 </div>

 {/* Regional Options */}
 <div className="pt-8 border-t border-[#c8d8f8] dark:border-[#1a3566]">
 <h2 className="text-[9px] sm:text-[10px] font-bold text-theme-secondary capitalize tracking-[0.3em] mb-6 flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-primary-light" />
 Regional Preferences
 </h2>
 
 <div className="space-y-6">
 <div>
 <label className="block text-[10px] font-bold capitalize tracking-normal text-theme-muted mb-3 ml-1">System Language</label>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {LANGUAGES.map((lang) => (
 <button
 key={lang.code}
 onClick={() => setLanguage(lang.code)}
 className={`p-4 rounded-xl border text-center transition-all duration-300 ${language === lang.code ? 'bg-primary-light text-white border-primary-light shadow-xl' : 'surface-section text-theme-secondary border-theme hover:border-primary-light'}`}
 >
 <span className="text-2xl mb-2 block">{lang.flag}</span>
 <span className="text-[9px] font-bold capitalize tracking-normal block">{lang.name}</span>
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-[10px] font-bold capitalize tracking-normal text-theme-muted mb-2 ml-1">Local Timezone</label>
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
 className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold capitalize tracking-[0.2em] rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
 >
 {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Preferences</>}
 </button>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'notifications' && (
 <div className="space-y-8">
 <h2 className="text-[9px] sm:text-[10px] font-bold text-theme-secondary capitalize tracking-[0.3em] mb-6 flex items-center gap-2">
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
 className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold capitalize tracking-[0.2em] rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
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
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-sm sm:text-base font-bold text-theme-primary tracking-tight">Two-Factor Authentication</h3>
          {is2FaEnabled && (
            <span className="px-2 py-0.5 bg-success-green/10 text-success-green text-[9px] font-black uppercase tracking-widest rounded-full border border-success-green/20">Active</span>
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-theme-secondary mb-5 leading-relaxed font-bold opacity-80">Add an extra layer of defense. Requires a secure code from your mobile device to sign in.</p>

        {twoFaStatus === 'idle' && !is2FaEnabled && (
          <button onClick={handleGenerate2FA} disabled={is2FaLoading} className="px-5 py-2 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold capitalize tracking-normal rounded-lg transition-all flex items-center gap-2 disabled:opacity-50">
            {is2FaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Enable 2FA
          </button>
        )}

        {twoFaStatus === 'idle' && is2FaEnabled && (
          <button onClick={() => { setTwoFaStatus('disabling'); setTwoFaCode('') }} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold capitalize tracking-normal rounded-lg transition-all flex items-center gap-2">
            <Shield className="w-4 h-4" /> Disable 2FA
          </button>
        )}

        {twoFaStatus === 'scanning' && qrCodeUri && (
          <div className="space-y-4">
            <p className="text-xs text-theme-secondary font-bold">1. Open <span className="text-primary-light font-black">Google Authenticator</span> or Authy on your phone.</p>
            <p className="text-xs text-theme-secondary font-bold">2. Tap <span className="font-black">+</span> → <span className="font-black">Scan a QR code</span> and scan below:</p>
            <div className="inline-block p-3 bg-white rounded-2xl border border-theme shadow-lg">
              <img src={qrCodeUri} alt="2FA QR Code" className="w-44 h-44 rounded-lg" />
            </div>
            <p className="text-xs text-theme-secondary font-bold">3. Enter the 6-digit code to confirm:</p>
            <div className="flex gap-3 items-center flex-wrap">
              <input type="text" value={twoFaCode} onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} className="w-40 px-4 py-3 surface-section border border-theme rounded-xl text-lg font-black tracking-widest text-center text-theme-primary focus:ring-2 focus:ring-primary-light outline-none" />
              <button onClick={handleEnable2FA} disabled={is2FaLoading || twoFaCode.length < 6} className="px-6 py-3 bg-success-green hover:opacity-90 text-white text-[10px] font-bold rounded-lg flex items-center gap-2 disabled:opacity-50">
                {is2FaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Verify & Enable
              </button>
            </div>
            <button onClick={() => { setTwoFaStatus('idle'); setQrCodeUri(''); setTwoFaCode('') }} className="text-[10px] text-theme-muted hover:text-theme-secondary font-bold">Cancel</button>
          </div>
        )}

        {twoFaStatus === 'disabling' && (
          <div className="space-y-4">
            <p className="text-xs text-theme-secondary font-bold">Enter your current Authenticator code to confirm:</p>
            <div className="flex gap-3 items-center flex-wrap">
              <input type="text" value={twoFaCode} onChange={e => setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} className="w-40 px-4 py-3 surface-section border border-theme rounded-xl text-lg font-black tracking-widest text-center text-theme-primary focus:ring-2 focus:ring-primary-light outline-none" />
              <button onClick={handleDisable2FA} disabled={is2FaLoading || twoFaCode.length < 6} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-2 disabled:opacity-50">
                {is2FaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Confirm Disable
              </button>
            </div>
            <button onClick={() => { setTwoFaStatus('idle'); setTwoFaCode('') }} className="text-[10px] text-theme-muted hover:text-theme-secondary font-bold">Cancel</button>
          </div>
        )}
      </div>
    </div>
  </div>

 <div className="p-6 sm:p-8 bg-red-500/5 border border-red-500/20 rounded-2xl sm:rounded-3xl">
 <h3 className="text-[10px] font-bold text-red-600 dark:text-red-400 capitalize tracking-[0.3em] mb-4 flex items-center gap-2">
 <Trash2 className="w-4 h-4" />
 Danger Zone
 </h3>
 <p className="text-[10px] sm:text-xs text-theme-secondary mb-6 leading-relaxed font-bold opacity-80">Permanently delete your account and all associated data. This action is irreversible.</p>
 
 {!showDeleteConfirm ? (
 <button
 onClick={() => setShowDeleteConfirm(true)}
 className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold capitalize tracking-normal rounded-lg transition-all active:scale-95 flex items-center gap-2"
 >
 <Trash2 className="w-4 h-4" />
 Delete Account
 </button>
 ) : (
 <motion.div
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-4 border border-red-500/30 bg-red-500/5 rounded-2xl p-5"
 >
 <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">⚠ This cannot be undone</p>
 <p className="text-xs text-theme-secondary font-medium">Type <span className="font-black text-red-500">DELETE</span> to confirm:</p>
 <input
 type="text"
 value={deleteConfirmText}
 onChange={e => setDeleteConfirmText(e.target.value)}
 placeholder="Type DELETE here"
 className="w-full px-4 py-3 surface-section border border-red-500/30 focus:border-red-500 rounded-xl text-sm font-bold outline-none transition-all"
 />
 <div className="flex gap-3">
 <button
 onClick={handleDeleteAccount}
 disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
 className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold capitalize tracking-normal rounded-lg transition-all active:scale-95 flex items-center gap-2"
 >
 {isDeletingAccount ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Confirm Delete</>}
 </button>
 <button
 onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
 className="px-6 py-2.5 surface-section border border-theme text-theme-muted text-[10px] font-bold capitalize tracking-normal rounded-lg transition-all active:scale-95"
 >
 Cancel
 </button>
 </div>
 </motion.div>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </>
 );
}
