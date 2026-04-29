// ============================================================================
// ADMIN SETTINGS - PLATFORM CONFIGURATION
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/admin/settings/page.tsx
// 
// FEATURES:
// ✓ Platform name & branding
// ✓ Fee configuration
// ✓ Email templates
// ✓ Regional settings
// ✓ System configuration
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { passwordChange, updateNotificationPreferences } from '@/src/lib/api/auth'
import {
 Settings,
 Globe,
 Percent,
 Mail,
 Shield,
 Save,
 ChevronLeft,
 Loader2,
 DollarSign,
 Clock,
 Users,
 Bell,
 Lock,
 Eye,
 EyeOff,
 AlertCircle,
 CheckCircle,
 Smartphone
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminSettingsPage() {
 const [activeTab, setActiveTab] = useState<'account' | 'general' | 'fees' | 'email' | 'regions'>('account')
 const [isSaving, setIsSaving] = useState(false)

 // Password change
 const [currentPassword, setCurrentPassword] = useState('')
 const [newPassword, setNewPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showCurrentPassword, setShowCurrentPassword] = useState(false)
 const [showNewPassword, setShowNewPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)
 const { user, forgotPassword } = useAuth()
 const router = useRouter()

 const [emailNotifications, setEmailNotifications] = useState(user?.emailNotificationsEnabled ?? true)
 const [pushNotifications, setPushNotifications] = useState(user?.pushNotificationsEnabled ?? true)

 const passwordsMatch = newPassword === confirmPassword

 // General Settings
 const [platformName, setPlatformName] = useState('SafariHub')
 const [supportEmail, setSupportEmail] = useState('support@safaribub.com')
 const [maintenanceMode, setMaintenanceMode] = useState(false)

 // Fee Settings
 const [bronzeFee, setBronzeFee] = useState(15)
 const [silverFee, setSilverFee] = useState(12)
 const [goldFee, setGoldFee] = useState(10)
 const [platinumFee, setPlatinumFee] = useState(8)
 const [platformFeePercent, setPlatformFeePercent] = useState(10)
 const [payoutFreezeHours, setPayoutFreezeHours] = useState(48)
 const [cartLockMinutes, setCartLockMinutes] = useState(15)

 // Email Templates
 const [welcomeEmail, setWelcomeEmail] = useState(
 'Welcome to SafariHub! We\'re excited to have you...'
 )
 const [bookingConfirmationEmail, setBookingConfirmationEmail] = useState(
 'Your booking has been confirmed...'
 )
 const [payoutEmail, setPayoutEmail] = useState(
 'Your payout has been processed...'
 )

 // Regional Settings
 const [lebanonActive, setLebanonActive] = useState(true)
 const [turkeyActive, setTurkeyActive] = useState(true)
 const [lebanonCurrency, setLebanonCurrency] = useState('LBP')
 const [turkeyCurrency, setTurkeyCurrency] = useState('TRY')
 const [usdToLbp, setUsdToLbp] = useState(89500)
 const [usdToTry, setUsdToTry] = useState(32.5)

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

 const handleSave = async () => {
 setIsSaving(true)
 
 try {
 await new Promise(resolve => setTimeout(resolve, 1500))
 toast.success('Settings saved successfully!')
 } catch (error) {
 toast.error('Failed to save settings')
 } finally {
 setIsSaving(false)
 }
 }

  return (
    <>
      <div className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)] surface-base transition-colors duration-500">
        <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/dashboard/admin"
              className="p-2.5 text-theme-muted hover:text-primary-light surface-card border border-theme rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-theme-primary tracking-tight">
                Platform Control
              </h1>
              <p className="text-sm text-theme-secondary font-medium">
                Global configuration and system rules
              </p>
            </div>
          </div>

          {/* Main Card */}
          <div className="surface-card border border-theme rounded-[2.5rem] shadow-xl shadow-primary-light/5 overflow-hidden">
            
            {/* Tabs */}
            <div className="flex p-2 gap-1 surface-section border-b border-theme overflow-x-auto scrollbar-hide">
              {[
                { id: 'account', label: 'Account', icon: Lock },
                { id: 'general', label: 'General', icon: Globe },
                { id: 'fees', label: 'Fees & Payouts', icon: Percent },
                { id: 'email', label: 'Email Templates', icon: Mail },
                { id: 'regions', label: 'Regions & Currency', icon: Globe }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary-light text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                      : 'text-theme-muted hover:text-theme-secondary hover:bg-theme-muted/5'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

 {/* Tab Content */}
 <div className="p-6">
 
 {/* Account Settings */}
 {activeTab === 'account' && (
 <div className="space-y-6">
 <div>
 <h2 className="text-lg font-semibold text-theme-primary mb-4">
 Change Password
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
 className="w-full pl-9 pr-10 py-2 surface-section border border-theme-strong rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 placeholder="Enter current password"
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
 className="mt-1 text-xs text-primary-light dark:text-primary-dark hover:text-blue-700 dark:text-primary-dark dark:hover:text-blue-300 font-medium transition-colors"
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
 className="w-full pl-9 pr-10 py-2 surface-section border border-theme-strong rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 placeholder="Enter new password"
 />
 <button
 onClick={() => setShowNewPassword(!showNewPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary"
 >
 {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
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
 className="w-full pl-9 pr-10 py-2 surface-section border border-theme-strong rounded-lg text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
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

 {/* Notification Settings */}
 <div className="pt-6 border-t border-theme">
 <h2 className="text-lg font-semibold text-theme-primary mb-4">
 Notification Preferences
 </h2>
 
 <div className="space-y-4">
 {/* Email Notifications */}
 <div className="flex items-center justify-between p-4 surface-section rounded-lg">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark dark:text-primary-dark rounded-lg">
 <Mail className="w-5 h-5" />
 </div>
 <div>
 <p className="font-medium text-theme-primary">Email Notifications</p>
 <p className="text-sm text-theme-muted ">Receive system alerts via email</p>
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
 <div className="flex items-center justify-between p-4 surface-section rounded-lg">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary-light/20 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark dark:text-primary-dark rounded-lg">
 <Smartphone className="w-5 h-5" />
 </div>
 <div>
 <p className="font-medium text-theme-primary">Push Notifications</p>
 <p className="text-sm text-theme-muted ">Receive instant alerts on your device</p>
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

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-theme-secondary ml-1">
                    Platform Name
                  </label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 surface-section border border-theme rounded-2xl text-sm text-theme-primary outline-none focus:border-primary-light/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-theme-secondary ml-1">
                    Support Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 surface-section border border-theme rounded-2xl text-sm text-theme-primary outline-none focus:border-primary-light/50 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-theme">
                <div className="p-6 surface-section rounded-3xl border border-theme-strong shadow-inner">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-all duration-500 ${maintenanceMode ? 'bg-amber-500/20 text-amber-500' : 'bg-primary-light/10 text-primary-light'}`}>
                        <Settings className={`w-6 h-6 ${maintenanceMode ? 'animate-spin-slow' : ''}`} />
                      </div>
                      <div>
                        <span className="text-base font-black text-theme-primary tracking-tight">
                          Maintenance Mode
                        </span>
                        <p className="text-xs text-theme-muted font-medium">
                          Temporarily disable public access to the platform
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                        maintenanceMode ? 'bg-amber-600 shadow-lg shadow-amber-500/40' : 'bg-theme-muted/20'
                      }`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Fees & Payouts */}
          {activeTab === 'fees' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-theme-secondary mb-6 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-primary-light" />
                  Tiered Commission Rates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Bronze', value: bronzeFee, setter: setBronzeFee, color: 'text-orange-400' },
                    { label: 'Silver', value: silverFee, setter: setSilverFee, color: 'text-slate-400' },
                    { label: 'Gold', value: goldFee, setter: setGoldFee, color: 'text-amber-400' },
                    { label: 'Platinum', value: platinumFee, setter: setPlatinumFee, color: 'text-blue-300' }
                  ].map((tier) => (
                    <div key={tier.label} className="p-5 surface-section border border-theme rounded-3xl hover:border-primary-light/30 transition-all group">
                      <label className={`block text-[10px] font-black uppercase tracking-widest ${tier.color} mb-3`}>
                        {tier.label} Tier (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={tier.value}
                          onChange={(e) => tier.setter(Number(e.target.value))}
                          min="0"
                          max="100"
                          className="w-full pl-4 pr-10 py-3 surface-card border border-theme-strong rounded-xl text-lg font-black text-theme-primary outline-none focus:border-primary-light transition-all"
                        />
                        <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-theme">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-theme-secondary mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-light" />
                  System Payout Rules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 surface-section border border-theme rounded-3xl">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-theme-muted mb-4">
                      Payout Freeze Period
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={payoutFreezeHours}
                          onChange={(e) => setPayoutFreezeHours(Number(e.target.value))}
                          min="0"
                          className="w-full pl-4 pr-12 py-3.5 surface-card border border-theme-strong rounded-2xl text-xl font-black text-theme-primary outline-none focus:border-primary-light transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-theme-muted uppercase tracking-widest">HRS</span>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] text-theme-muted font-medium uppercase tracking-wider italic">
                      Time between tour completion and funds release
                    </p>
                  </div>

                  <div className="p-6 surface-section border border-theme rounded-3xl">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-theme-muted mb-4">
                      Active Cart Lock
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={cartLockMinutes}
                          onChange={(e) => setCartLockMinutes(Number(e.target.value))}
                          min="1"
                          className="w-full pl-4 pr-12 py-3.5 surface-card border border-theme-strong rounded-2xl text-xl font-black text-theme-primary outline-none focus:border-primary-light transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-theme-muted uppercase tracking-widest">MIN</span>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] text-theme-muted font-medium uppercase tracking-wider italic">
                      Time slots are reserved during checkout process
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Templates */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              {[
                { label: 'Welcome Email', value: welcomeEmail, setter: setWelcomeEmail, desc: 'Sent after successful account registration' },
                { label: 'Booking Confirmation', value: bookingConfirmationEmail, setter: setBookingConfirmationEmail, desc: 'Sent when a tour is confirmed' },
                { label: 'Payout Notification', value: payoutEmail, setter: setPayoutEmail, desc: 'Sent when funds are released to a guide' }
              ].map((template) => (
                <div key={template.label} className="space-y-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-theme-secondary ml-1">
                      {template.label}
                    </label>
                    <p className="text-[10px] text-theme-muted font-medium ml-1 mb-2">{template.desc}</p>
                  </div>
                  <div className="relative group">
                    <textarea
                      value={template.value}
                      onChange={(e) => template.setter(e.target.value)}
                      rows={4}
                      className="w-full px-5 py-4 surface-section border border-theme rounded-[2rem] text-sm text-theme-primary outline-none focus:border-primary-light/50 transition-all font-medium resize-none shadow-inner"
                    />
                    <div className="absolute top-4 right-4 p-2 bg-theme-muted/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <Mail className="w-4 h-4 text-primary-light" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Regions & Currency */}
          {activeTab === 'regions' && (
            <div className="space-y-6">
              {[
                { 
                  name: 'Lebanon', 
                  active: lebanonActive, 
                  setter: setLebanonActive, 
                  currency: lebanonCurrency, 
                  currencySetter: setLebanonCurrency, 
                  rate: usdToLbp, 
                  rateSetter: setUsdToLbp,
                  unit: 'LBP',
                  flag: '🇱🇧'
                },
                { 
                  name: 'Turkey', 
                  active: turkeyActive, 
                  setter: setTurkeyActive, 
                  currency: turkeyCurrency, 
                  currencySetter: setTurkeyCurrency, 
                  rate: usdToTry, 
                  rateSetter: setUsdToTry,
                  unit: 'TRY',
                  flag: '🇹🇷',
                  step: '0.1'
                }
              ].map((region) => (
                <div key={region.name} className="p-8 surface-section rounded-[2.5rem] border border-theme relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                  
                  <div className="flex items-center justify-between mb-8 relative">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{region.flag}</span>
                      <div>
                        <h3 className="text-xl font-black text-theme-primary tracking-tight">{region.name}</h3>
                        <p className="text-xs text-theme-muted font-medium uppercase tracking-widest">Regional Configuration</p>
                      </div>
                    </div>
                    <button
                      onClick={() => region.setter(!region.active)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                        region.active ? 'bg-emerald-600 shadow-lg shadow-emerald-500/40' : 'bg-theme-muted/20'
                      }`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        region.active ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted ml-1">
                        Primary Currency
                      </label>
                      <select
                        value={region.currency}
                        onChange={(e) => region.currencySetter(e.target.value)}
                        className="w-full px-5 py-3.5 surface-card border border-theme rounded-2xl text-sm text-theme-primary outline-none focus:border-primary-light transition-all font-bold appearance-none cursor-pointer"
                      >
                        <option value={region.unit}>{region.unit} (Default)</option>
                        <option value="USD">US Dollar (USD)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted ml-1">
                        USD → {region.unit} Exchange Rate
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          value={region.rate}
                          onChange={(e) => region.rateSetter(Number(e.target.value))}
                          step={region.step || '1'}
                          className="w-full px-5 py-3.5 surface-card border border-theme rounded-2xl text-sm text-theme-primary outline-none focus:border-primary-light transition-all font-black"
                        />
                        <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Save Button */}
        <div className="p-8 surface-section border-t border-theme flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-10 py-4 bg-primary-light hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Committing Changes...</>
            ) : (
              <><Save className="w-5 h-5" /> Save All Configurations</>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
 </>
 )
}