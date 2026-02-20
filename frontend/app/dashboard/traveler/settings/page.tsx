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
  Shield
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import toast from 'react-hot-toast'

// ============================================================================
// PASSWORD STRENGTH INDICATOR
// ============================================================================

const getPasswordStrength = (password: string): {
  score: number
  label: string
  color: string
} => {
  if (!password) return { score: 0, label: '', color: 'bg-gray-200' }
  
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score: 20, label: 'Weak', color: 'bg-red-500' }
  if (score <= 3) return { score: 50, label: 'Fair', color: 'bg-orange-500' }
  if (score <= 4) return { score: 75, label: 'Good', color: 'bg-blue-500' }
  return { score: 100, label: 'Strong', color: 'bg-emerald-500' }
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
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  
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
      // Phase 2: API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Password updated successfully!')
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Failed to update password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    
    try {
      // Phase 2: API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Preferences saved!')
    } catch (error) {
      toast.error('Failed to save preferences')
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
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-4xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/dashboard/traveler"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your account preferences and security
              </p>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'account'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'preferences'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Change Password
                    </h2>
                    
                    <div className="space-y-4">
                      {/* Current Password */}
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
                      </div>

                      {/* New Password */}
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
                        
                        {/* Password Strength */}
                        {newPassword && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                  style={{ width: `${passwordStrength.score}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {passwordStrength.label}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
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

                      {/* Save Button */}
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
                </div>
              )}

              {/* ========================================
                  PREFERENCES TAB
                  ======================================== */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Language
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            language === lang.code
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                          }`}
                        >
                          <span className="text-xl mb-1 block">{lang.flag}</span>
                          <span className="text-sm">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      All times will be shown in your local timezone
                    </p>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>
                    
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Push Notifications</span>
                      <button
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          pushNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pushNotifications ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>
                  </div>

                  {/* Save Button */}
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
              )}

              {/* ========================================
                  SECURITY TAB
                  ======================================== */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Two Factor Auth (Placeholder) */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                          Add an extra layer of security to your account
                        </p>
                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Account - Danger Zone */}
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
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
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-red-300 dark:border-red-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
    </PageLayout>
  )
}