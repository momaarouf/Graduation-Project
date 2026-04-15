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
import { passwordChange } from '@/src/lib/api/auth'
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
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/dashboard/admin"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Platform Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure global platform settings and rules
              </p>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setActiveTab('account')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'account'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'general'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'fees'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Fees & Payouts
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'email'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Email Templates
              </button>
              <button
                onClick={() => setActiveTab('regions')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'regions'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Regions & Currency
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Change Password
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter current password"
                          />
                          <button
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          onClick={handleForgotPassword}
                          disabled={isSaving}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter new password"
                          />
                          <button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirm new password"
                          />
                          <button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPassword && (
                          <p className={`mt-1 text-xs flex items-center gap-1 ${
                            passwordsMatch ? 'text-emerald-600' : 'text-red-600'
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
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Notification Preferences
                    </h2>
                    
                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive system alerts via email</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setEmailNotifications(!emailNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      {/* Push Notifications */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive instant alerts on your device</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setPushNotifications(!pushNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            pushNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pushNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <button
                        onClick={handleSavePreferences}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Maintenance Mode
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Temporarily disable the platform for maintenance
                        </p>
                      </div>
                      <button
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          maintenanceMode ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>
                  </div>
                </div>
              )}

              {/* Fees & Payouts */}
              {activeTab === 'fees' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Tiered Commission Rates
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Bronze (%)
                        </label>
                        <input
                          type="number"
                          value={bronzeFee}
                          onChange={(e) => setBronzeFee(Number(e.target.value))}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Silver (%)
                        </label>
                        <input
                          type="number"
                          value={silverFee}
                          onChange={(e) => setSilverFee(Number(e.target.value))}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Gold (%)
                        </label>
                        <input
                          type="number"
                          value={goldFee}
                          onChange={(e) => setGoldFee(Number(e.target.value))}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Platinum (%)
                        </label>
                        <input
                          type="number"
                          value={platinumFee}
                          onChange={(e) => setPlatinumFee(Number(e.target.value))}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Payout Rules
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Payout Freeze (hours)
                        </label>
                        <input
                          type="number"
                          value={payoutFreezeHours}
                          onChange={(e) => setPayoutFreezeHours(Number(e.target.value))}
                          min="0"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Cart Lock (minutes)
                        </label>
                        <input
                          type="number"
                          value={cartLockMinutes}
                          onChange={(e) => setCartLockMinutes(Number(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Templates */}
              {activeTab === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Welcome Email
                    </label>
                    <textarea
                      value={welcomeEmail}
                      onChange={(e) => setWelcomeEmail(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Booking Confirmation
                    </label>
                    <textarea
                      value={bookingConfirmationEmail}
                      onChange={(e) => setBookingConfirmationEmail(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payout Notification
                    </label>
                    <textarea
                      value={payoutEmail}
                      onChange={(e) => setPayoutEmail(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Regions & Currency */}
              {activeTab === 'regions' && (
                <div className="space-y-6">
                  {/* Lebanon */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Lebanon</h3>
                      <button
                        onClick={() => setLebanonActive(!lebanonActive)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          lebanonActive ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          lebanonActive ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Currency
                        </label>
                        <select
                          value={lebanonCurrency}
                          onChange={(e) => setLebanonCurrency(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="LBP">Lebanese Pound (LBP)</option>
                          <option value="USD">US Dollar (USD)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          USD → LBP Rate
                        </label>
                        <input
                          type="number"
                          value={usdToLbp}
                          onChange={(e) => setUsdToLbp(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Turkey */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Turkey</h3>
                      <button
                        onClick={() => setTurkeyActive(!turkeyActive)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          turkeyActive ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          turkeyActive ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Currency
                        </label>
                        <select
                          value={turkeyCurrency}
                          onChange={(e) => setTurkeyCurrency(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="TRY">Turkish Lira (TRY)</option>
                          <option value="USD">US Dollar (USD)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          USD → TRY Rate
                        </label>
                        <input
                          type="number"
                          value={usdToTry}
                          onChange={(e) => setUsdToTry(Number(e.target.value))}
                          step="0.1"
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Save Button */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save All Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}