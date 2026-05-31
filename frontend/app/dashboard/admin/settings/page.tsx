'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { passwordChange, updateNotificationPreferences } from '@/src/lib/api/auth'
import SettingsSkeleton from '@/src/components/dashboard/SettingsSkeleton'
import {
  Settings, Globe, Percent, Mail, Shield, Save, ChevronLeft,
  Loader2, DollarSign, Clock, Bell, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle, Smartphone, Terminal, Sliders,
  Fingerprint, User, FileText, RefreshCw, Trash2
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// ── Password Strength ────────────────────────────────────────────────────────

const getPasswordStrength = (password: string) => {
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
  return { score: 100, label: 'Strong', color: 'bg-emerald-500' }
}

// ── Toggle Switch ────────────────────────────────────────────────────────────

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
      value ? 'bg-primary-light' : 'bg-gray-200 dark:bg-gray-700'
    }`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
)

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { user, forgotPassword, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading || !user) return <SettingsSkeleton />

  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'platform' | 'fees' | 'regions'>('account')
  const [isSaving, setIsSaving] = useState(false)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotificationsEnabled ?? true)
  const [pushNotifications, setPushNotifications] = useState(user?.pushNotificationsEnabled ?? true)

  // Platform
  const [platformName, setPlatformName] = useState('SafariHub')
  const [supportEmail, setSupportEmail] = useState('support@safarihub.com')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [welcomeEmail, setWelcomeEmail] = useState("Welcome to SafariHub! We're excited to have you...")
  const [bookingEmail, setBookingEmail] = useState('Your booking has been confirmed...')
  const [payoutEmail, setPayoutEmail] = useState('Your payout has been processed...')

  // Fees
  const [bronzeFee, setBronzeFee] = useState(15)
  const [silverFee, setSilverFee] = useState(12)
  const [goldFee, setGoldFee] = useState(10)
  const [platinumFee, setPlatinumFee] = useState(8)
  const [payoutFreezeHours, setPayoutFreezeHours] = useState(48)
  const [cartLockMinutes, setCartLockMinutes] = useState(15)

  // Regions
  const [lebanonActive, setLebanonActive] = useState(true)
  const [turkeyActive, setTurkeyActive] = useState(true)
  const [usdToLbp, setUsdToLbp] = useState(89500)
  const [usdToTry, setUsdToTry] = useState(32.5)

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
    } finally { setIsSaving(false) }
  }

  const handleForgotPassword = async () => {
    if (!user?.email) return toast.error('User email not found')
    setIsSaving(true)
    try {
      await forgotPassword(user.email)
      toast.success('Reset code sent to your email!')
      router.push(`/auth/reset-password?email=${encodeURIComponent(user.email)}`)
    } catch { toast.error('Failed to send reset code') }
    finally { setIsSaving(false) }
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    try {
      await updateNotificationPreferences({
        emailNotificationsEnabled: emailNotifications,
        pushNotificationsEnabled: pushNotifications,
      })
      toast.success('Preferences saved!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save preferences')
    } finally { setIsSaving(false) }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success('Settings saved!')
    } catch { toast.error('Failed to save settings') }
    finally { setIsSaving(false) }
  }

  const TABS = [
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Alerts' },
    { id: 'platform', label: 'Platform' },
    { id: 'fees', label: 'Fees' },
    { id: 'regions', label: 'Regions' },
  ] as const

  const inputClass = 'w-full pl-11 pr-4 py-3 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light transition-all font-bold'
  const labelClass = 'block text-[10px] font-bold capitalize tracking-normal text-theme-muted mb-2 ml-1'
  const sectionTitle = (dot: string, title: string) => (
    <h2 className="text-[9px] sm:text-[10px] font-bold text-theme-secondary capitalize tracking-[0.3em] mb-5 flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {title}
    </h2>
  )

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard/admin"
            className="p-2 text-theme-muted hover:text-theme-secondary hover:surface-section rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-theme-primary tracking-tight capitalize">
              Settings
            </h1>
            <p className="text-[10px] sm:text-sm text-theme-secondary font-bold capitalize tracking-normal opacity-70">
              Platform Governance & Account Preferences
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="surface-card border border-theme rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">

          {/* Tab Bar */}
          <div className="flex border-b border-[#c8d8f8] dark:border-[#1a3566] bg-surface-section/30 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex-1 min-w-[60px] px-2 sm:px-4 py-4 text-[9px] sm:text-xs font-bold capitalize tracking-[0.15em] transition-all relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary-light dark:text-primary-dark'
                    : 'text-theme-muted hover:text-theme-secondary'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="adminSettingsTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light dark:bg-primary-dark"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-8">

            {/* ── ACCOUNT ─────────────────────────────────────────────── */}
            {activeTab === 'account' && (
              <div className="space-y-8">
                {sectionTitle('bg-orange-500', 'Security Credentials')}

                <div className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className={labelClass}>Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className={inputClass}
                        placeholder="••••••••"
                      />
                      <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted">
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button onClick={handleForgotPassword} className="mt-2 text-[10px] text-primary-light hover:opacity-80 font-bold capitalize tracking-normal ml-1">
                      Forgot Password?
                    </button>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className={labelClass}>New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className={inputClass}
                        placeholder="••••••••"
                      />
                      <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-3 px-1 flex items-center gap-3">
                        <div className="flex-1 h-1.5 surface-section rounded-full overflow-hidden border border-theme">
                          <div className={`h-full ${passwordStrength.color} transition-all duration-500`} style={{ width: `${passwordStrength.score}%` }} />
                        </div>
                        <span className="text-[9px] font-bold text-theme-secondary whitespace-nowrap">{passwordStrength.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className={labelClass}>Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={inputClass}
                        placeholder="••••••••"
                      />
                      <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <p className={`mt-2 text-[10px] font-bold flex items-center gap-1.5 ml-1 ${passwordsMatch ? 'text-emerald-500' : 'text-danger-red'}`}>
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
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ───────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                {sectionTitle('bg-primary-light', 'Notification Preferences')}

                <div className="space-y-4">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'System alerts & updates via email', icon: Mail, state: emailNotifications, toggle: () => setEmailNotifications(!emailNotifications) },
                    { id: 'push', label: 'Push Notifications', desc: 'Instant alerts on mobile devices', icon: Smartphone, state: pushNotifications, toggle: () => setPushNotifications(!pushNotifications) },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 sm:p-6 surface-section border border-theme rounded-2xl hover:border-primary-light/30 transition-all">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-primary-light/10 text-primary-light rounded-xl flex-shrink-0">
                          <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-theme-primary truncate">{item.label}</p>
                          <p className="text-[9px] sm:text-xs text-theme-muted font-bold truncate">{item.desc}</p>
                        </div>
                      </div>
                      <Toggle value={item.state} onChange={item.toggle} />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold capitalize tracking-[0.2em] rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Settings</>}
                </button>
              </div>
            )}

            {/* ── PLATFORM ────────────────────────────────────────────── */}
            {activeTab === 'platform' && (
              <div className="space-y-8">
                {sectionTitle('bg-blue-500', 'Global Branding')}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Platform Name</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                      <input type="text" value={platformName} onChange={e => setPlatformName(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                      <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Maintenance Mode */}
                <div className={`p-5 sm:p-6 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${maintenanceMode ? 'bg-amber-500/10 border-amber-500/30' : 'surface-section border-theme'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${maintenanceMode ? 'bg-amber-500 text-white' : 'bg-primary-light/10 text-primary-light'}`}>
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-theme-primary">Maintenance Mode</p>
                      <p className="text-[10px] text-theme-muted font-bold mt-0.5">Suspend all public gateway traffic</p>
                    </div>
                  </div>
                  <Toggle value={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
                </div>

                <div className="pt-6 border-t border-[#c8d8f8] dark:border-[#1a3566]">
                  {sectionTitle('bg-purple-500', 'Email Templates')}
                  <div className="space-y-5">
                    {[
                      { label: 'Welcome Email', value: welcomeEmail, setter: setWelcomeEmail, icon: User },
                      { label: 'Booking Confirmation', value: bookingEmail, setter: setBookingEmail, icon: FileText },
                      { label: 'Payout Notification', value: payoutEmail, setter: setPayoutEmail, icon: DollarSign },
                    ].map(t => (
                      <div key={t.label}>
                        <label className={labelClass + ' flex items-center gap-1.5'}>
                          <t.icon className="w-3.5 h-3.5 text-primary-light" /> {t.label}
                        </label>
                        <textarea
                          value={t.value}
                          onChange={e => t.setter(e.target.value)}
                          rows={3}
                          className="w-full p-4 surface-section border border-theme rounded-xl text-sm font-medium text-theme-primary outline-none focus:ring-2 focus:ring-primary-light transition-all resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold capitalize tracking-[0.2em] rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Platform Settings</>}
                </button>
              </div>
            )}

            {/* ── FEES ────────────────────────────────────────────────── */}
            {activeTab === 'fees' && (
              <div className="space-y-8">
                {sectionTitle('bg-emerald-500', 'Guide Tier Fees')}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Bronze', value: bronzeFee, setter: setBronzeFee, color: 'border-orange-400/40 text-orange-500' },
                    { label: 'Silver', value: silverFee, setter: setSilverFee, color: 'border-slate-400/40 text-slate-500' },
                    { label: 'Gold', value: goldFee, setter: setGoldFee, color: 'border-amber-400/40 text-amber-500' },
                    { label: 'Platinum', value: platinumFee, setter: setPlatinumFee, color: 'border-blue-400/40 text-blue-500' },
                  ].map(tier => (
                    <div key={tier.label} className={`p-5 surface-section border-2 rounded-2xl ${tier.color}`}>
                      <p className="text-[10px] font-bold capitalize tracking-normal mb-3 opacity-60">{tier.label} (%)</p>
                      <div className="relative">
                        <input
                          type="number"
                          value={tier.value}
                          onChange={e => tier.setter(Number(e.target.value))}
                          className="w-full bg-transparent text-2xl font-black text-theme-primary outline-none pr-5"
                        />
                        <Percent className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 opacity-25" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-[#c8d8f8] dark:border-[#1a3566]">
                  {sectionTitle('bg-blue-500', 'Timing Rules')}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Payout Freeze', value: payoutFreezeHours, setter: setPayoutFreezeHours, unit: 'hrs', desc: 'Time-lock on guide payouts after completion' },
                      { label: 'Cart Lock', value: cartLockMinutes, setter: setCartLockMinutes, unit: 'min', desc: 'Checkout reservation window duration' },
                    ].map(rule => (
                      <div key={rule.label} className="p-5 surface-section border border-theme rounded-2xl flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-theme-primary">{rule.label}</p>
                          <p className="text-[10px] text-theme-muted font-bold mt-0.5 truncate">{rule.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 h-12 px-4 surface-card border border-theme rounded-xl flex-shrink-0">
                          <input
                            type="number"
                            value={rule.value}
                            onChange={e => rule.setter(Number(e.target.value))}
                            className="w-10 bg-transparent text-lg font-black text-theme-primary outline-none text-center"
                          />
                          <span className="text-[10px] font-bold text-theme-muted">{rule.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold capitalize tracking-[0.2em] rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Fee Structure</>}
                </button>
              </div>
            )}

            {/* ── REGIONS ─────────────────────────────────────────────── */}
            {activeTab === 'regions' && (
              <div className="space-y-6">
                {sectionTitle('bg-indigo-500', 'Active Regions')}

                {[
                  { name: 'Lebanon', active: lebanonActive, setActive: setLebanonActive, flag: '🇱🇧', unit: 'LBP', rate: usdToLbp, setRate: setUsdToLbp },
                  { name: 'Turkey', active: turkeyActive, setActive: setTurkeyActive, flag: '🇹🇷', unit: 'TRY', rate: usdToTry, setRate: setUsdToTry },
                ].map(region => (
                  <div key={region.name} className="p-5 sm:p-6 surface-section border border-theme rounded-2xl space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 surface-card rounded-xl border border-theme flex items-center justify-center text-2xl flex-shrink-0">
                          {region.flag}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-theme-primary">{region.name}</p>
                          <p className="text-[10px] text-theme-muted font-bold capitalize tracking-normal">Native currency: {region.unit}</p>
                        </div>
                      </div>
                      <Toggle value={region.active} onChange={() => region.setActive(!region.active)} />
                    </div>

                    <div className="flex items-center justify-between p-4 surface-card border border-theme rounded-xl">
                      <div>
                        <p className="text-[10px] font-bold text-theme-muted capitalize tracking-normal mb-1">Exchange Rate</p>
                        <div className="flex items-baseline gap-2">
                          <input
                            type="number"
                            value={region.rate}
                            onChange={e => region.setRate(Number(e.target.value))}
                            className="bg-transparent text-xl font-black text-theme-primary outline-none w-24"
                          />
                          <span className="text-[10px] font-bold text-theme-muted opacity-50">/ USD</span>
                        </div>
                      </div>
                      <button className="w-9 h-9 surface-section hover:bg-primary-light hover:text-white rounded-lg flex items-center justify-center transition-all">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold capitalize tracking-[0.2em] rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Region Config</>}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
