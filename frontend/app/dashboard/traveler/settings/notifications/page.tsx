// ============================================================================
// TRAVELER NOTIFICATION SETTINGS
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/traveler/settings/notifications/page.tsx
// 
// PURPOSE: Manage all notification preferences for travelers
// 
// FEATURES:
// - Email notification toggles
// - Push notification toggles
// - SMS notification toggles
// - Frequency settings
// - Quiet hours
// - Review reminder settings
// - Marketing preferences
// ============================================================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Calendar,
  Star,
  Heart,
  Shield,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  Moon,
  Sun,
  Globe,
  Volume2,
  VolumeX,
  RefreshCw
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type NotificationChannel = 'email' | 'push' | 'sms'
type Frequency = 'immediate' | 'daily' | 'weekly' | 'never'

interface NotificationSetting {
  id: string
  title: string
  description: string
  channels: {
    email: boolean
    push: boolean
    sms: boolean
  }
  category: 'booking' | 'reminder' | 'promo' | 'system'
  icon: React.ElementType
}

interface QuietHours {
  enabled: boolean
  start: string
  end: string
  timezone: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: 'booking-confirmation',
    title: 'Booking Confirmation',
    description: 'Get notified when your booking is confirmed',
    channels: { email: true, push: true, sms: false },
    category: 'booking',
    icon: CheckCircle
  },
  {
    id: 'booking-reminder',
    title: 'Booking Reminders',
    description: 'Receive reminders 24h and 2h before your tour',
    channels: { email: true, push: true, sms: true },
    category: 'reminder',
    icon: Clock
  },
  {
    id: 'booking-changes',
    title: 'Booking Changes',
    description: 'Get notified about cancellations or schedule changes',
    channels: { email: true, push: true, sms: true },
    category: 'booking',
    icon: Calendar
  },
  {
    id: 'review-reminder',
    title: 'Review Reminders',
    description: 'Get reminded to leave reviews after your tours',
    channels: { email: true, push: true, sms: false },
    category: 'reminder',
    icon: Star
  },
  {
    id: 'guide-messages',
    title: 'Guide Messages',
    description: 'Get notified when guides send you messages',
    channels: { email: true, push: true, sms: false },
    category: 'booking',
    icon: MessageSquare
  },
  {
    id: 'wishlist-updates',
    title: 'Wishlist Updates',
    description: 'Get notified about price drops or availability on saved tours',
    channels: { email: true, push: true, sms: false },
    category: 'promo',
    icon: Heart
  },
  {
    id: 'promo-offers',
    title: 'Promotional Offers',
    description: 'Receive special offers and discounts',
    channels: { email: true, push: false, sms: false },
    category: 'promo',
    icon: Mail
  },
  {
    id: 'loyalty-updates',
    title: 'Loyalty Program',
    description: 'Get updates about your tier progress and rewards',
    channels: { email: true, push: true, sms: false },
    category: 'system',
    icon: Shield
  },
  {
    id: 'system-alerts',
    title: 'System Alerts',
    description: 'Important updates about your account or the platform',
    channels: { email: true, push: true, sms: true },
    category: 'system',
    icon: AlertCircle
  }
]

const MOCK_QUIET_HOURS: QuietHours = {
  enabled: true,
  start: '22:00',
  end: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}

const MOCK_FREQUENCIES = {
  marketing: 'weekly' as Frequency,
  digest: 'daily' as Frequency
}

// ============================================================================
// SETTING ROW COMPONENT
// ============================================================================

interface SettingRowProps {
  setting: NotificationSetting
  onToggle: (id: string, channel: NotificationChannel) => void
}

const SettingRow = ({ setting, onToggle }: SettingRowProps) => {
  const Icon = setting.icon

  return (
    <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 last:border-0">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg mt-1">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            {setting.title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {setting.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-11 sm:ml-0">
        {/* Email Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={setting.channels.email}
              onChange={() => onToggle(setting.id, 'email')}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </div>
          <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </label>

        {/* Push Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={setting.channels.push}
              onChange={() => onToggle(setting.id, 'push')}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </div>
          <Smartphone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </label>

        {/* SMS Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={setting.channels.sms}
              onChange={() => onToggle(setting.id, 'sms')}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </div>
          <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </label>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TravelerNotificationSettingsPage() {
  const [settings, setSettings] = useState(MOCK_NOTIFICATION_SETTINGS)
  const [quietHours, setQuietHours] = useState(MOCK_QUIET_HOURS)
  const [frequencies, setFrequencies] = useState(MOCK_FREQUENCIES)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (id: string, channel: NotificationChannel) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? {
              ...setting,
              channels: {
                ...setting.channels,
                [channel]: !setting.channels[channel]
              }
            }
          : setting
      )
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setHasChanges(false)
      toast.success('Notification settings saved')
    }, 1000)
  }

  const handleReset = () => {
    setSettings(MOCK_NOTIFICATION_SETTINGS)
    setQuietHours(MOCK_QUIET_HOURS)
    setFrequencies(MOCK_FREQUENCIES)
    setHasChanges(true)
    toast.success('Settings reset to default')
  }

  // Group settings by category
  const bookingSettings = settings.filter(s => s.category === 'booking')
  const reminderSettings = settings.filter(s => s.category === 'reminder')
  const promoSettings = settings.filter(s => s.category === 'promo')
  const systemSettings = settings.filter(s => s.category === 'system')

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-3xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/dashboard/traveler/profile"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  ← Back to Profile
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Notification Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage how and when you receive notifications
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            
            {/* Booking Notifications */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
                Booking Notifications
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Updates about your bookings and messages
              </p>
              <div className="space-y-1">
                {bookingSettings.map(setting => (
                  <SettingRow
                    key={setting.id}
                    setting={setting}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>

            {/* Reminders */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
                Reminders
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Get reminded before and after your tours
              </p>
              <div className="space-y-1">
                {reminderSettings.map(setting => (
                  <SettingRow
                    key={setting.id}
                    setting={setting}
                    onToggle={handleToggle}
                  />
                ))}
              </div>

              {/* Review Reminder Frequency */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Reminder Frequency
                </label>
                <select
                  value={frequencies.digest}
                  onChange={(e) => {
                    setFrequencies(prev => ({ ...prev, digest: e.target.value as Frequency }))
                    setHasChanges(true)
                  }}
                  className="w-full sm:w-48 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            {/* Promotional */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
                Promotional
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Offers, discounts, and updates
              </p>
              <div className="space-y-1">
                {promoSettings.map(setting => (
                  <SettingRow
                    key={setting.id}
                    setting={setting}
                    onToggle={handleToggle}
                  />
                ))}
              </div>

              {/* Marketing Frequency */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marketing Email Frequency
                </label>
                <select
                  value={frequencies.marketing}
                  onChange={(e) => {
                    setFrequencies(prev => ({ ...prev, marketing: e.target.value as Frequency }))
                    setHasChanges(true)
                  }}
                  className="w-full sm:w-48 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            {/* System */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
                System Notifications
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Important updates about your account
              </p>
              <div className="space-y-1">
                {systemSettings.map(setting => (
                  <SettingRow
                    key={setting.id}
                    setting={setting}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
                Quiet Hours
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Mute notifications during certain hours
              </p>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={quietHours.enabled}
                      onChange={(e) => {
                        setQuietHours(prev => ({ ...prev, enabled: e.target.checked }))
                        setHasChanges(true)
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable quiet hours
                  </span>
                </label>

                {quietHours.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-14">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={quietHours.start}
                        onChange={(e) => {
                          setQuietHours(prev => ({ ...prev, start: e.target.value }))
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={quietHours.end}
                        onChange={(e) => {
                          setQuietHours(prev => ({ ...prev, end: e.target.value }))
                          setHasChanges(true)
                        }}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Timezone
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {quietHours.timezone}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Your Privacy Matters
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  We'll never share your contact information with third parties. 
                  You can change these settings anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}