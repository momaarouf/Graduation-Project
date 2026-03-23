// ============================================================================
// GUIDE TOUR EDITOR - CARD 17
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/tours/new/page.tsx
// 
// PURPOSE: Allow guides to create and edit tours
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ One-time or recurring tours (e.g., every weekend)
// ✓ Min/max capacity settings
// ✓ Dynamic pricing (rush days, weekends, holidays)
// ✓ Halal badge toggle
// ✓ Language selection (Arabic, French, etc.)
// ✓ Visual itinerary builder
// ✓ Meeting point with map
// ✓ Media upload (images/videos)
// 
// COLOR PSYCHOLOGY:
// - Blue: Primary actions, form fields
// - Green: Success, availability
// - Orange: Pricing, premium features
// - Gold: Halal certification
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Camera, 
  MapPin, 
  Shield, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  Globe, 
  ChevronRight, 
  Plus, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Save,
  Eye, 
  Info,
  CheckCircle,
  X,
  Languages,
  CalendarRange,
  Zap,
  TrendingUp,
  Leaf,
  Repeat,
  RefreshCw,
  PlusCircle,
  Video,
  Undo2,
  AlertCircle,
  Sparkles,
  Star
} from 'lucide-react'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import CalendarPicker from '@/src/components/ui/CalendarPicker'
import { GuideProfileResponse } from '@/src/lib/types/guide.types'
import { 
  createTour, 
  updateTour, 
  getGuideProfile,
  getGuideTour,
  addTourMedia, 
  submitTourForReview,
  withdrawTourFromReview 
} from '@/src/lib/api/tours'
// ============================================================================
// PROPS INTERFACE - ADD THIS AFTER IMPORTS
// ============================================================================

interface TourFormProps {
  initialData: TourFormData
  isEditing: boolean
  tourId: string | null
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TourType = 'one-time' | 'recurring'
type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom'
type BookingMode = 'instant' | 'request'
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

interface TourFormData {
  // Basic Info
  title: string
  description: string
  category: string
  tags: string[]
  
  // Location
  location: string
  city: string
  country: string
  meetingPoint: {
    name: string
    address: string
    lat?: number
    lng?: number
    instructions?: string
  }
  
  // Media
  mainImage: string
  gallery: {
    id: string
    type: 'image' | 'video'
    url: string
    thumbnail?: string
    caption: string
  }[]
  
  // Capacity & Booking
  minCapacity: number
  maxCapacity: number
  bookingMode: BookingMode
  instantBookEnabled: boolean
  
  // Schedule
  tourType: TourType
  startDate?: string
  endDate?: string
  recurrencePattern?: RecurrencePattern
  recurringDays: DayOfWeek[]
  recurringUntil?: string
  recurringDates?: string[]
  excludedDates?: string[]
  
  // Duration
  durationHours: number
  durationMinutes: number
  
  // Pricing
  basePrice: number
  currency: 'USD' | 'TRY' | 'LBP'
  isPremium: boolean
  dynamicPricing: {
    enabled: boolean
    weekendMultiplier?: number
    holidayMultiplier?: number
    rushHourMultiplier?: number
    lastMinuteDiscount?: number
    earlyBirdDiscount?: number
  }
  
  // Group Discount
  groupDiscountEnabled: boolean
  groupDiscountThreshold: number
  groupDiscountPercent: number
  
  // Halal Features
  isHalalCertified: boolean
  isFamilyFriendly: boolean
  halalDetails?: {
    prayerSpace: boolean
    halalFood: boolean
    genderSensitiveGuides: boolean
    mosqueVisits: boolean
    qiblaDirection?: string
  }
  
  // Languages
  availableLanguages: {
    language: string
    proficiency: 'basic' | 'fluent' | 'native'
  }[]
  
  // Itinerary
  itinerary: {
    id: string
    order: number
    title: string
    description: string
    duration: string
    location?: {
      name: string
      lat?: number
      lng?: number
    }
    image?: string
  }[]
  
  // Inclusions/Exclusions
  inclusions: string[]
  exclusions: string[]
  
  // Requirements
  requirements: string[]
  whatToBring: string[]
  
  // Cancellation Policy
  cancellationPolicy: {
    fullRefund: number // hours before
    partialRefund: number // hours before
    partialRefundPercent: number
    noRefund: number // hours before
  }
  
  // Status
  status: 'draft' | 'published' | 'paused' | 'archived' | 'pending_review' | 'rejected'
}

// ============================================================================
// MOCK DATA - INITIAL FORM STATE
// ============================================================================

const MOCK_TOUR_DATA_FOR_EDIT: TourFormData = {
  title: '',
  description: '',
  category: 'historical',
  tags: [],
  
  location: '',
  city: '',
  country: '',
  meetingPoint: {
    name: '',
    address: '',
    instructions: ''
  },
  
  mainImage: '',
  gallery: [],
  
  minCapacity: 1,
  maxCapacity: 10,
  bookingMode: 'instant',
  instantBookEnabled: true,
  
  tourType: 'one-time',
  recurringDays: [],
  recurringUntil: undefined,
  
  durationHours: 2,
  durationMinutes: 0,
  
  basePrice: 50,
  currency: 'USD',
  dynamicPricing: {
    enabled: false
  },
  
  groupDiscountEnabled: false,
  groupDiscountThreshold: 4,
  groupDiscountPercent: 5,
  
  isHalalCertified: false,
  isFamilyFriendly: false,
  isPremium: false,
  halalDetails: {
    prayerSpace: false,
    halalFood: false,
    genderSensitiveGuides: false,
    mosqueVisits: false
  },
  
  availableLanguages: [],
  
  itinerary: [],
  
  inclusions: [],
  exclusions: [],
  
  requirements: [],
  whatToBring: [],
  
  cancellationPolicy: {
    fullRefund: 48,
    partialRefund: 24,
    partialRefundPercent: 50,
    noRefund: 24
  },
  
  status: 'draft'
}

// ============================================================================
// FORM SECTION COMPONENT
// ============================================================================

interface FormSectionProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultExpanded?: boolean
}

function FormSection({ title, icon: Icon, children, defaultExpanded = true }: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className=" bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden ">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className=" w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors "
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// BASIC INFO SECTION
// ============================================================================

interface BasicInfoSectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function BasicInfoSection({ formData, onChange }: BasicInfoSectionProps) {
  return (
    <FormSection title="Basic Information" icon={Info}>
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tour Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 "
            placeholder="e.g., Ottoman Heritage: Topkapi Palace & Hagia Sophia"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={5}
            className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none "
            placeholder="Describe your tour, what travelers will experience, and what makes it special..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => onChange('category', e.target.value)}
            className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
          >
            <option value="historical">Historical</option>
            <option value="cultural">Cultural</option>
            <option value="food">Food & Culinary</option>
            <option value="adventure">Adventure</option>
            <option value="nature">Nature & Outdoors</option>
            <option value="family">Family Friendly</option>
            <option value="religious">Religious / Halal</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={formData.tags.join(', ')}
            onChange={(e) => onChange('tags', e.target.value.split(',').map(t => t.trim()))}
            className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 "
            placeholder="istanbul, ottoman, history, palace"
          />
        </div>
      </div>
    </FormSection>
  )
}

// ============================================================================
// LOCATION SECTION
// ============================================================================

interface LocationSectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function LocationSection({ formData, onChange }: LocationSectionProps) {
  return (
    <FormSection title="Location & Meeting Point" icon={MapPin}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => onChange('city', e.target.value)}
              className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
              placeholder="e.g., Istanbul"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <select
              value={formData.country}
              onChange={(e) => onChange('country', e.target.value)}
              className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            >
              <option value="">Select country</option>
              <option value="turkey">Turkey</option>
              <option value="lebanon">Lebanon</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meeting Point Name
          </label>
          <input
            type="text"
            value={formData.meetingPoint.name}
            onChange={(e) => onChange('meetingPoint', { ...formData.meetingPoint, name: e.target.value })}
            className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            placeholder="e.g., Sultanahmet Square Fountain"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Address
          </label>
          <input
            type="text"
            value={formData.meetingPoint.address}
            onChange={(e) => onChange('meetingPoint', { ...formData.meetingPoint, address: e.target.value })}
            className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            placeholder="Full address with street, district, city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meeting Instructions (optional)
          </label>
          <textarea
            value={formData.meetingPoint.instructions || ''}
            onChange={(e) => onChange('meetingPoint', { ...formData.meetingPoint, instructions: e.target.value })}
            rows={2}
            className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            placeholder="e.g., Look for the guide holding an orange sign"
          />
        </div>

        {/* Map placeholder */}
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Map integration will be available in Phase 2
          </p>
        </div>
      </div>
    </FormSection>
  )
}

// ============================================================================
// CAPACITY & BOOKING SECTION
// ============================================================================

interface CapacitySectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function CapacitySection({ formData, onChange }: CapacitySectionProps) {
  return (
    <FormSection title="Capacity & Booking" icon={Users}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Capacity
            </label>
            <input
              type="number"
              min="1"
              value={formData.minCapacity || ''}
              onChange={(e) => onChange('minCapacity', e.target.value === '' ? 0 : parseInt(e.target.value))}
              className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Capacity
            </label>
            <input
              type="number"
              min={formData.minCapacity || 1}
              value={formData.maxCapacity || ''}
              onChange={(e) => onChange('maxCapacity', e.target.value === '' ? 0 : parseInt(e.target.value))}
              className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Instant Booking</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Travelers can book immediately without waiting
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.instantBookEnabled}
              onChange={(e) => {
                onChange('instantBookEnabled', e.target.checked)
                onChange('bookingMode', e.target.checked ? 'instant' : 'request')
              }}
              className="sr-only peer"
            />
            <div className=" w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 "></div>
          </label>
        </div>
      </div>
    </FormSection>
  )
}

// ============================================================================
// SCHEDULE SECTION
// ============================================================================

interface ScheduleSectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function ScheduleSection({ formData, onChange }: ScheduleSectionProps) {
  const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const toggleDay = (day: DayOfWeek) => {
    const current = formData.recurringDays || []
    if (current.includes(day)) {
      onChange('recurringDays', current.filter(d => d !== day))
    } else {
      onChange('recurringDays', [...current, day])
    }
  }

  return (
    <FormSection title="Schedule & Duration" icon={Calendar}>
      <div className="space-y-4">
        {/* Tour Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tour Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="tourType"
                checked={formData.tourType === 'one-time'}
                onChange={() => onChange('tourType', 'one-time')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">One-time</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="tourType"
                checked={formData.tourType === 'recurring'}
                onChange={() => onChange('tourType', 'recurring')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Recurring</span>
            </label>
          </div>
        </div>

        {/* Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hours
            </label>
            <input
              type="number"
              min="0"
              max="24"
              value={formData.durationHours || ''}
              onChange={(e) => onChange('durationHours', e.target.value === '' ? 0 : parseInt(e.target.value))}
              className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minutes
            </label>
            <select
              value={formData.durationMinutes || 0}
              onChange={(e) => onChange('durationMinutes', parseInt(e.target.value) || 0)}
              className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            >
              <option value={0}>0 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
            </select>
          </div>
        </div>

        {formData.tourType === 'recurring' && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repeats
              </label>
              <select
                value={formData.recurrencePattern || 'weekly'}
                onChange={(e) => onChange('recurrencePattern', e.target.value)}
                className=" w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom (Select Dates)</option>
              </select>
            </div>

            {formData.recurrencePattern === 'custom' && (
              <p className="text-xs text-blue-600 font-medium">
                Click dates on the calendar below to add/remove them from your schedule.
              </p>
            )}

            {(!formData.recurrencePattern || formData.recurrencePattern === 'weekly') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repeat on
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = formData.recurringDays?.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={` px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' 
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recurring Until (Optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.recurringUntil ? formData.recurringUntil.split('T')[0] : ''}
                  onChange={(e) => onChange('recurringUntil', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                  className=" w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
                  min={new Date().toISOString().split('T')[0]}
                />
                {formData.recurringUntil && (
                  <button
                    type="button"
                    onClick={() => onChange('recurringUntil', undefined)}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty to repeat indefinitely
              </p>
            </div>
          </div>
        )}

        {/* Recurring Date Preview */}
        {formData.tourType === 'recurring' && (
          <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
             <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest">
                  Upcoming Departure Preview
                </h4>
             </div>
             <CalendarPicker
               selectedDates={(() => {
                 if (formData.recurrencePattern === 'custom') {
                   return (formData.recurringDates || []).map(d => {
                     const [year, month, day] = d.split('-').map(Number)
                     return new Date(year, month - 1, day)
                   })
                 }
                 
                 const dates: Date[] = []
                 const dayMap: Record<string, number> = {
                   'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
                   'thursday': 4, 'friday': 5, 'saturday': 6
                 }
                 const targetDays = (formData.recurringDays || []).map(d => dayMap[d.toLowerCase()])
                 
                 if (targetDays.length === 0 && formData.recurrencePattern !== 'daily') return []

                 let current = new Date()
                 let count = 0
                 while (count < 90 && dates.length < 24) {
                   const isPatternDay = formData.recurrencePattern === 'daily' || targetDays.includes(current.getDay())
                    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
                   const isExcluded = formData.excludedDates?.includes(dateStr)

                   if (isPatternDay && !isExcluded) {
                     if (formData.recurringUntil && current > new Date(formData.recurringUntil)) {
                       break;
                     }
                     dates.push(new Date(current))
                   }
                   current.setDate(current.getDate() + 1)
                   count++
                 }
                 return dates
               })()}
               highlightedDates={(formData.excludedDates || []).map(d => {
                  const [year, month, day] = d.split('-').map(Number)
                  return new Date(year, month - 1, day)
                })}
                onToggleDate={(date) => {
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                 if (formData.recurrencePattern === 'custom') {
                   const current = formData.recurringDates || []
                   if (current.includes(dateStr)) {
                     onChange('recurringDates', current.filter(d => d !== dateStr))
                   } else {
                     onChange('recurringDates', [...current, dateStr])
                   }
                 } else {
                   const current = formData.excludedDates || []
                   if (current.includes(dateStr)) {
                     onChange('excludedDates', current.filter(d => d !== dateStr))
                   } else {
                     onChange('excludedDates', [...current, dateStr])
                   }
                 }
               }}
             />
             <p className="mt-3 text-[10px] font-bold text-blue-600/60 uppercase tracking-widest text-center italic">
                Check the "Occurrences" page after saving for full schedule management
             </p>
          </div>
        )}

        {/* Start Date Selection (Unified) */}
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {formData.tourType === 'recurring' ? 'First Occurrence Date & Time' : 'Start Date & Time'}
            </label>
            <input
              type="datetime-local"
              value={formData.startDate || ''}
              onChange={(e) => onChange('startDate', e.target.value)}
              className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            />
          </div>
      </div>
    </FormSection>
  )
}

// ============================================================================
// PRICING SECTION
// ============================================================================

interface PricingSectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function PricingSection({ formData, onChange }: PricingSectionProps) {
  return (
    <FormSection title="Pricing" icon={DollarSign}>
      <div className="space-y-4">
        {/* Base Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Base Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                min="0"
                value={formData.basePrice || ''}
                onChange={(e) => onChange('basePrice', e.target.value === '' ? 0 : parseInt(e.target.value))}
                className=" w-full pl-7 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => onChange('currency', e.target.value)}
              className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            >
              <option value="USD">USD ($)</option>
              <option value="TRY">TRY (₺)</option>
              <option value="LBP">LBP (ل.ل)</option>
            </select>
          </div>
        </div>

        {/* Premium Toggle */}
        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Premium Experience</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Mark this tour as a high-end, premium offering
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPremium || false}
              onChange={(e) => onChange('isPremium', e.target.checked)}
              className="sr-only peer"
            />
            <div className=" w-11 h-6 bg-amber-200/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-amber-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500 "></div>
          </label>
        </div>

        {/* Dynamic Pricing Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Dynamic Pricing</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Adjust prices for weekends, holidays, and rush times
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.dynamicPricing.enabled}
              onChange={(e) => onChange('dynamicPricing', { ...formData.dynamicPricing, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className=" w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 "></div>
          </label>
        </div>

        {/* Dynamic Pricing Options */}
        {formData.dynamicPricing.enabled && (
          <div className="space-y-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weekend Multiplier (%)
              </label>
              <input
                type="number"
                min="0"
                value={formData.dynamicPricing.weekendMultiplier || ''}
                onChange={(e) => onChange('dynamicPricing', { 
                  ...formData.dynamicPricing, 
                  weekendMultiplier: e.target.value === '' ? 0 : parseInt(e.target.value)
                })}
                className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
              <p className="text-xs text-gray-500 mt-1">Example: 120% means 20% extra on weekends</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Holiday Multiplier (%)
              </label>
              <input
                type="number"
                min="0"
                value={formData.dynamicPricing.holidayMultiplier || ''}
                onChange={(e) => onChange('dynamicPricing', { 
                  ...formData.dynamicPricing, 
                  holidayMultiplier: e.target.value === '' ? 0 : parseInt(e.target.value)
                })}
                className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
            </div>
          </div>
        )}

        {/* Group Discount Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Group Discount</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Offer discount for larger groups
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.groupDiscountEnabled}
              onChange={(e) => onChange('groupDiscountEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className=" w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 "></div>
          </label>
        </div>

        {/* Group Discount Options */}
        {formData.groupDiscountEnabled && (
          <div className="grid grid-cols-2 gap-4 pl-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min. Group Size
              </label>
              <input
                type="number"
                min="2"
                value={formData.groupDiscountThreshold || ''}
                onChange={(e) => onChange('groupDiscountThreshold', e.target.value === '' ? 0 : parseInt(e.target.value))}
                className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.groupDiscountPercent || ''}
                onChange={(e) => onChange('groupDiscountPercent', e.target.value === '' ? 0 : parseInt(e.target.value))}
                className=" w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
            </div>
          </div>
        )}
      </div>
    </FormSection>
  )
}

// ============================================================================
// MEDIA SECTION
// ============================================================================

interface MediaSectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function MediaSection({ formData, onChange }: MediaSectionProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const newMedia = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // 50MB limit check
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max 100MB.`)
          continue
        }

        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })
        const base64 = await base64Promise
        
        newMedia.push({
          id: `temp-${Date.now()}-${i}`,
          type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
          url: base64,
          caption: ''
        })
      }
      onChange('gallery', [...formData.gallery, ...newMedia])
    } catch (err) {
      toast.error('Failed to process image')
    } finally {
      setUploading(false)
    }
  }

  const removeMedia = (index: number) => {
    onChange('gallery', formData.gallery.filter((_, i) => i !== index))
  }

  return (
    <FormSection title="Photos & Videos" icon={Camera}>
      <div className="space-y-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          The first image will be used as the cover photo. Max 100MB per file.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {formData.gallery.map((item, index) => (
            <div key={item.id} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 group">
              {item.type === 'image' ? (
                <Image src={item.url} alt={`Media ${index}`} fill className="object-cover" />
              ) : (
                <video 
                  src={item.url} 
                  className="w-full h-full object-cover" 
                  muted 
                  playsInline 
                  onMouseOver={(e) => e.currentTarget.play()}
                  onMouseOut={(e) => e.currentTarget.pause()}
                />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-[10px] font-bold text-white rounded-full shadow-lg">
                  COVER
                </div>
              )}
            </div>
          ))}
          
          <label className="relative aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500">Add Media</span>
              </>
            )}
          </label>
        </div>
      </div>
    </FormSection>
  )
}

// ============================================================================
// HALAL FEATURES SECTION
// ============================================================================

interface HalalSectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function HalalSection({ formData, onChange }: HalalSectionProps) {
  return (
    <FormSection title="Halal & Special Features" icon={Leaf}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Halal Certified</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mark this tour as Halal-friendly
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isHalalCertified || false}
              onChange={(e) => onChange('isHalalCertified', e.target.checked)}
              className="sr-only peer"
            />
            <div className=" w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600 "></div>
          </label>
        </div>

        {/* Family Friendly Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Family Friendly</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Suitable for children and families
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFamilyFriendly || false}
              onChange={(e) => onChange('isFamilyFriendly', e.target.checked)}
              className="sr-only peer"
            />
            <div className=" w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600 "></div>
          </label>
        </div>

        {formData.isHalalCertified && (
          <div className="space-y-3 pl-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.halalDetails?.prayerSpace || false}
                onChange={(e) => onChange('halalDetails', {
                  ...formData.halalDetails,
                  prayerSpace: e.target.checked
                })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Prayer space available</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.halalDetails?.halalFood || false}
                onChange={(e) => onChange('halalDetails', {
                  ...formData.halalDetails,
                  halalFood: e.target.checked
                })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Halal food options</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.halalDetails?.genderSensitiveGuides || false}
                onChange={(e) => onChange('halalDetails', {
                  ...formData.halalDetails,
                  genderSensitiveGuides: e.target.checked
                })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Gender-sensitive guides available</span>
            </div>
          </div>
        )}
      </div>
    </FormSection>
  )
}

// ============================================================================
// LANGUAGES SECTION
// ============================================================================

interface LanguagesSectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function LanguagesSection({ formData, onChange }: LanguagesSectionProps) {
  const [newLanguage, setNewLanguage] = useState('')
  const [newProficiency, setNewProficiency] = useState<'basic' | 'fluent' | 'native'>('fluent')

  const handleAddLanguage = () => {
    if (!newLanguage.trim()) return
    
    onChange('availableLanguages', [
      ...formData.availableLanguages,
      { language: newLanguage, proficiency: newProficiency }
    ])
    
    setNewLanguage('')
  }

  const handleRemoveLanguage = (index: number) => {
    onChange('availableLanguages', formData.availableLanguages.filter((_, i) => i !== index))
  }

  return (
    <FormSection title="Available Languages" icon={Globe}>
      <div className="space-y-4">
        {/* Language list */}
        <div className="space-y-2">
          {formData.availableLanguages.map((lang, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {lang.language}
                </span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                  {lang.proficiency}
                </span>
              </div>
              <button
                onClick={() => handleRemoveLanguage(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {formData.availableLanguages.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
              No languages added yet
            </p>
          )}
        </div>

        {/* Add new language */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="e.g., Arabic"
            className=" flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
          />
          <select
            value={newProficiency}
            onChange={(e) => setNewProficiency(e.target.value as any)}
            className=" w-24 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
          >
            <option value="basic">Basic</option>
            <option value="fluent">Fluent</option>
            <option value="native">Native</option>
          </select>
          <button
            onClick={handleAddLanguage}
            className=" px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors "
          >
            Add
          </button>
        </div>
      </div>
    </FormSection>
  )
}

// ============================================================================
// ITINERARY SECTION
// ============================================================================

// ============================================================================
// ITINERARY SECTION - FIXED
// ============================================================================

interface ItinerarySectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function ItinerarySection({ formData, onChange }: ItinerarySectionProps) {
  const addItineraryItem = () => {
    const newItem = {
      id: Date.now().toString(),
      order: formData.itinerary.length + 1,
      title: '',
      description: '',
      duration: '30 min',
      location: undefined
    }
    onChange('itinerary', [...formData.itinerary, newItem])
  }

  const updateItineraryItem = (index: number, field: string, value: any) => {
    const updated = [...formData.itinerary]
    updated[index] = { ...updated[index], [field]: value }
    onChange('itinerary', updated)
  }

  const updateItineraryLocation = (index: number, locationName: string) => {
    const updated = [...formData.itinerary]
    updated[index] = { 
      ...updated[index], 
      location: locationName ? { name: locationName } : undefined 
    }
    onChange('itinerary', updated)
  }

  const removeItineraryItem = (index: number) => {
    onChange('itinerary', formData.itinerary.filter((_, i) => i !== index))
  }

  return (
    <FormSection title="Itinerary" icon={CalendarRange}>
      <div className="space-y-4">
        {formData.itinerary.map((item, index) => (
          <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Stop {index + 1}
              </span>
              <button
                onClick={() => removeItineraryItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItineraryItem(index, 'title', e.target.value)}
              placeholder="Title (e.g., Hagia Sophia)"
              className=" w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            />

            <textarea
              value={item.description}
              onChange={(e) => updateItineraryItem(index, 'description', e.target.value)}
              placeholder="Description of this stop"
              rows={2}
              className=" w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none "
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={item.duration}
                onChange={(e) => updateItineraryItem(index, 'duration', e.target.value)}
                placeholder="Duration (e.g., 1 hour)"
                className=" px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
              <input
                type="text"
                value={item.location?.name || ''}
                onChange={(e) => updateItineraryLocation(index, e.target.value)}
                placeholder="Location (optional)"
                className=" px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
            </div>
          </div>
        ))}

        <button
          onClick={addItineraryItem}
          className=" w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 "
        >
          <Plus className="w-4 h-4" />
          Add Itinerary Stop
        </button>
      </div>
    </FormSection>
  )
}

// ============================================================================
// INCLUSIONS SECTION
// ============================================================================

interface InclusionsExclusionsSectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function InclusionsExclusionsSection({ formData, onChange }: InclusionsExclusionsSectionProps) {
  const [newInclusion, setNewInclusion] = useState('')
  const [newExclusion, setNewExclusion] = useState('')

  const addInclusion = () => {
    if (!newInclusion.trim()) return
    onChange('inclusions', [...formData.inclusions, newInclusion])
    setNewInclusion('')
  }

  const addExclusion = () => {
    if (!newExclusion.trim()) return
    onChange('exclusions', [...formData.exclusions, newExclusion])
    setNewExclusion('')
  }

  const removeInclusion = (index: number) => {
    onChange('inclusions', formData.inclusions.filter((_, i) => i !== index))
  }

  const removeExclusion = (index: number) => {
    onChange('exclusions', formData.exclusions.filter((_, i) => i !== index))
  }

  return (
    <FormSection title="Inclusions & Exclusions" icon={CheckCircle}>
      <div className="space-y-6">
        {/* Inclusions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            What's Included
          </h4>
          <div className="space-y-2 mb-3">
            {formData.inclusions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                <button
                  onClick={() => removeInclusion(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              placeholder="e.g., Professional guide"
              className=" flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            />
            <button
              onClick={addInclusion}
              className=" px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors "
            >
              Add
            </button>
          </div>
        </div>

        {/* Exclusions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            What's Excluded
          </h4>
          <div className="space-y-2 mb-3">
            {formData.exclusions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                <button
                  onClick={() => removeExclusion(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              placeholder="e.g., Hotel pickup"
              className=" flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "
            />
            <button
              onClick={addExclusion}
              className=" px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors "
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </FormSection>
  )
}

// ============================================================================
// REQUIREMENTS & WHAT TO BRING SECTION
// ============================================================================

interface RequirementsSectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function RequirementsSection({ formData, onChange }: RequirementsSectionProps) {
  const [newRequirement, setNewRequirement] = useState('')
  const [newThing, setNewThing] = useState('')

  const addRequirement = () => {
    if (!newRequirement.trim()) return
    onChange('requirements', [...formData.requirements, newRequirement.trim()])
    setNewRequirement('')
  }

  const addThing = () => {
    if (!newThing.trim()) return
    onChange('whatToBring', [...formData.whatToBring, newThing.trim()])
    setNewThing('')
  }

  const removeRequirement = (index: number) => {
    onChange('requirements', formData.requirements.filter((_, i) => i !== index))
  }

  const removeThing = (index: number) => {
    onChange('whatToBring', formData.whatToBring.filter((_, i) => i !== index))
  }

  return (
    <FormSection title="Requirements & What to Bring" icon={Info}>
      <div className="space-y-6">
        {/* Requirements */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Tour Requirements
          </h4>
          <div className="space-y-2 mb-3">
            {formData.requirements.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                <button
                  onClick={() => removeRequirement(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="e.g., Moderate fitness level"
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addRequirement}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* What To Bring */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            What to Bring
          </h4>
          <div className="space-y-2 mb-3">
            {formData.whatToBring.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                <button
                  onClick={() => removeThing(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newThing}
              onChange={(e) => setNewThing(e.target.value)}
              placeholder="e.g., Comfortable walking shoes"
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addThing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </FormSection>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TourForm({ initialData, isEditing, tourId }: TourFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<GuideProfileResponse | null>(null)
  const [formData, setFormData] = useState<TourFormData>(() => {
    const base = {
      ...INITIAL_FORM_DATA,
      ...initialData
    };
    
    // Parse recurringDays from string to array if it comes from backend
    if (initialData && typeof initialData.recurringDays === 'string' && initialData.recurringDays) {
      base.recurringDays = (initialData.recurringDays as string)
        .split(',')
        .map(d => d.toLowerCase() as DayOfWeek);
    }

    // Normalize casing for recurrencePattern and status
    if (base.recurrencePattern) {
      base.recurrencePattern = base.recurrencePattern.toLowerCase() as any;
    }
    if (base.status) {
      base.status = base.status.toLowerCase() as any;
    }
    
    return base as TourFormData;
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await getGuideProfile()
        setProfile(res.data)
      } catch (err) {
        console.error('Failed to fetch guide profile in TourForm:', err)
      } finally {
        setIsLoadingProfile(false)
      }
    }
    fetchProfileData()
  }, [])

  // Guard: Check if the guide is allowed to manage tours
  const isVerified = user?.emailVerified && user?.profileCompleted && profile?.verificationStatus === 'approved'

  // If loading profile, show a subtle loading state
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">Verifying access...</p>
        </div>
      </div>
    )
  }

  // If not verified, block tour creation (unless editing an already existing tour? 
  // No, the user wants it blocked from creating. If it's editing a draft, maybe allow? 
  // But submission should definitely be blocked.)
  if (!isEditing && !isVerified) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center shadow-xl"
        >
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Required</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            To create and manage tours, you need to complete a few verification steps first. 
            This helps us maintain a high-trust marketplace.
          </p>

          <div className="space-y-3 mb-8">
            <div className={`flex items-center justify-between p-3 rounded-xl border ${user?.emailVerified ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${user?.emailVerified ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="text-sm font-medium">Email Verification</span>
              </div>
              {!user?.emailVerified && <Link href="/auth/email-verification" className="text-xs font-bold text-blue-600">Complete</Link>}
            </div>
            
            <div className={`flex items-center justify-between p-3 rounded-xl border ${user?.profileCompleted ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${user?.profileCompleted ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="text-sm font-medium">Profile Completion</span>
              </div>
              {!user?.profileCompleted && <Link href="/dashboard/guide/complete-profile" className="text-xs font-bold text-blue-600">Complete</Link>}
            </div>

            <div className={`flex items-center justify-between p-3 rounded-xl border ${profile?.verificationStatus === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${profile?.verificationStatus === 'approved' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <span className="text-sm font-medium text-left">
                  ID Verification
                  {profile?.verificationStatus === 'pending' && <span className="block text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">Under Review</span>}
                </span>
              </div>
              {profile?.verificationStatus === 'not_submitted' && <Link href="/dashboard/guide/verification" className="text-xs font-bold text-blue-600">Start</Link>}
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard/guide')}
            className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-bold hover:opacity-90 transition"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Tour title is required')
      return false
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      toast.error('Please provide a description (at least 20 characters)')
      return false
    }
    if (!formData.city || !formData.country) {
      toast.error('City and Country are required')
      return false
    }
    if (formData.basePrice <= 0) {
      toast.error('Price must be greater than 0')
      return false
    }
    if (formData.minCapacity <= 0) {
      toast.error('Minimum capacity must be at least 1')
      return false
    }
    if (formData.maxCapacity < formData.minCapacity) {
      toast.error('Maximum capacity cannot be less than minimum')
      return false
    }
    if (!formData.startDate) {
      toast.error('Please select a start date for your tour')
      return false
    }
    if (formData.startDate) {
      const start = new Date(formData.startDate)
      if (start < new Date()) {
        toast.error('Start date must be in the future')
        return false
      }
    }
    if (formData.itinerary.length === 0) {
      toast.error('Please add at least one stop to your itinerary')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      // 1. Align field names for backend
      const payload: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        locationName: formData.city, // Backend calls it locationName
        city: formData.city,
        countryCode: formData.country === 'lebanon' ? 'LB' : 'TR',
        basePrice: formData.basePrice,
        currency: formData.currency,
        isPremium: formData.isPremium || false,
        minCapacity: formData.minCapacity,
        maxCapacity: formData.maxCapacity,
        instantBook: formData.bookingMode === 'instant',
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        isRecurring: formData.tourType === 'recurring',
        recurrencePattern: formData.recurrencePattern?.toUpperCase(),
        recurringDays: formData.recurringDays.length > 0 ? formData.recurringDays.map(d => d.toUpperCase()).join(',') : null,
        recurringUntil: formData.recurringUntil ? new Date(formData.recurringUntil).toISOString() : null,
        recurringDates: formData.recurringDates && formData.recurringDates.length > 0 ? JSON.stringify(formData.recurringDates.map(d => new Date(d).toISOString())) : null,
        excludedDates: formData.excludedDates && formData.excludedDates.length > 0 ? JSON.stringify(formData.excludedDates.map(d => new Date(d).toISOString())) : null,
        halalFriendly: formData.isHalalCertified,
        halalDetails: JSON.stringify(formData.halalDetails),
        isFamilyFriendly: formData.isFamilyFriendly !== undefined ? formData.isFamilyFriendly : true,
        dynamicPricing: JSON.stringify(formData.dynamicPricing),
        hasGroupDiscount: formData.groupDiscountEnabled,
        groupDiscountThreshold: formData.groupDiscountThreshold,
        groupDiscountPercent: formData.groupDiscountPercent,
        meetingPointName: formData.meetingPoint.name,
        meetingPointAddress: formData.meetingPoint.address,
        meetingPointInstructions: formData.meetingPoint.instructions,
        meetingLatitude: formData.meetingPoint.lat,
        meetingLongitude: formData.meetingPoint.lng,
        itinerary: JSON.stringify(formData.itinerary),
        inclusions: JSON.stringify(formData.inclusions),
        exclusions: JSON.stringify(formData.exclusions),
        requirements: JSON.stringify(formData.requirements),
        whatToBring: JSON.stringify(formData.whatToBring),
        durationHours: formData.durationHours,
        durationMinutes: formData.durationMinutes,
        tags: JSON.stringify(formData.tags),
        languages: JSON.stringify(formData.availableLanguages)
      }

      let tourResponse
      if (isEditing && tourId) {
        tourResponse = await updateTour(parseInt(tourId), payload)
        toast.success('Tour updated successfully')
      } else {
        tourResponse = await createTour(payload)
        toast.success('Tour created successfully')
      }

      const tour = tourResponse.data

      // 2. Upload media
      if (formData.gallery.length > 0) {
        toast.loading('Uploading media...', { id: 'media-upload' })
        for (let i = 0; i < formData.gallery.length; i++) {
          const m = formData.gallery[i]
          // ONLY upload if it's a new media item (temp ID)
          if (m.id.startsWith('temp-')) {
            await addTourMedia(tour.id, {
              url: m.url,
              mediaType: m.type.toUpperCase(),
              displayOrder: i
            })
          }
        }
        toast.success('Media uploaded', { id: 'media-upload' })
      }

      router.push('/dashboard/guide/tours')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save tour')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendForReview = async () => {
    if (!validateForm()) return
    
    if (!isVerified) {
      toast.error('You must be fully verified to submit a tour for review.')
      return
    }

    setIsSaving(true)
    try {
      // 1. Save the tour first
      const payload: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        locationName: formData.city,
        city: formData.city,
        countryCode: formData.country === 'lebanon' ? 'LB' : 'TR',
        basePrice: formData.basePrice,
        currency: formData.currency,
        isPremium: formData.isPremium || false,
        minCapacity: formData.minCapacity,
        maxCapacity: formData.maxCapacity,
        instantBook: formData.bookingMode === 'instant',
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        isRecurring: formData.tourType === 'recurring',
        recurrencePattern: formData.recurrencePattern?.toUpperCase(),
        recurringDays: formData.recurringDays.length > 0 ? formData.recurringDays.map(d => d.toUpperCase()).join(',') : null,
        recurringUntil: formData.recurringUntil ? new Date(formData.recurringUntil).toISOString() : null,
        recurringDates: formData.recurringDates && formData.recurringDates.length > 0 ? JSON.stringify(formData.recurringDates.map(d => new Date(d).toISOString())) : null,
        excludedDates: formData.excludedDates && formData.excludedDates.length > 0 ? JSON.stringify(formData.excludedDates.map(d => new Date(d).toISOString())) : null,
        halalFriendly: formData.isHalalCertified,
        halalDetails: JSON.stringify(formData.halalDetails),
        isFamilyFriendly: formData.isFamilyFriendly !== undefined ? formData.isFamilyFriendly : true,
        dynamicPricing: JSON.stringify(formData.dynamicPricing),
        hasGroupDiscount: formData.groupDiscountEnabled,
        groupDiscountThreshold: formData.groupDiscountThreshold,
        groupDiscountPercent: formData.groupDiscountPercent,
        meetingPointName: formData.meetingPoint.name,
        meetingPointAddress: formData.meetingPoint.address,
        meetingPointInstructions: formData.meetingPoint.instructions,
        meetingLatitude: formData.meetingPoint.lat,
        meetingLongitude: formData.meetingPoint.lng,
        itinerary: JSON.stringify(formData.itinerary),
        inclusions: JSON.stringify(formData.inclusions),
        exclusions: JSON.stringify(formData.exclusions),
        requirements: JSON.stringify(formData.requirements),
        whatToBring: JSON.stringify(formData.whatToBring),
        durationHours: formData.durationHours,
        durationMinutes: formData.durationMinutes,
        tags: JSON.stringify(formData.tags),
        languages: JSON.stringify(formData.availableLanguages)
      }

      let tourResponse
      if (isEditing && tourId) {
        tourResponse = await updateTour(parseInt(tourId), payload)
      } else {
        tourResponse = await createTour(payload)
      }

      const tour = tourResponse.data

      // 2. Upload media
      if (formData.gallery.length > 0) {
        for (let i = 0; i < formData.gallery.length; i++) {
          const m = formData.gallery[i]
          if (m.id.startsWith('temp-')) {
            await addTourMedia(tour.id, {
              url: m.url,
              mediaType: m.type.toUpperCase(),
              displayOrder: i
            })
          }
        }
      }

      // 3. Submit for review
      toast.loading('Submitting for review...', { id: 'submit-review' })
      await submitTourForReview(tour.id)
      toast.success('Tour sent for review', { id: 'submit-review' })
      router.push('/dashboard/guide/tours')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit tour')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAsDraft = () => {
    // Current save status is DRAFT by default on creation
    handleSave()
  }

  return (
    <>
      {/* Page offset */}
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        
        <div className="container-safe mx-auto max-w-4xl py-8 sm:py-10">
          
          {/* Status Banner for Pending Review */}
          {isEditing && formData.status === 'pending_review' && (
            <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-orange-900 dark:text-orange-200">
                    Tour is Under Review
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                    This tour is currently locked for editing while our team reviews it. 
                    If you need to make changes, you can withdraw it back to draft mode.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    if (tourId) {
                      await withdrawTourFromReview(parseInt(tourId));
                      toast.success('Tour withdrawn to draft');
                      router.push('/dashboard/guide/tours');
                    }
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Failed to withdraw tour');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg text-sm font-semibold transition-colors shrink-0"
              >
                <Undo2 className="w-4 h-4" />
                Withdraw to Edit
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className=" p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 "
                title="Go Back"
              >
                <Undo2 className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {isEditing ? 'Edit Tour' : 'Create New Tour'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isEditing ? 'Update your tour details' : 'Fill in the details below to create your tour listing'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className=" px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 "
              >
                Save Draft
              </button>
              <button
                onClick={handleSendForReview}
                disabled={isSaving}
                className=" flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed "
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Send for Review
                  </>
                )}
              </button>
            </div>
          </div>


          {/* Edit/Preview Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('edit')}
              className={` px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' } `}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={` px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' } `}
            >
              Preview
            </button>
          </div>

          {/* Edit Form */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              <BasicInfoSection formData={formData} onChange={handleChange} />
              <LocationSection formData={formData} onChange={handleChange} />
              <MediaSection formData={formData} onChange={handleChange} />
              <CapacitySection formData={formData} onChange={handleChange} />
              <ScheduleSection formData={formData} onChange={handleChange} />
              <PricingSection formData={formData} onChange={handleChange} />
              <HalalSection formData={formData} onChange={handleChange} />
              <LanguagesSection formData={formData} onChange={handleChange} />
              <ItinerarySection formData={formData} onChange={handleChange} />
              <InclusionsExclusionsSection 
              formData={formData} 
              onChange={handleChange} 
            />

            <RequirementsSection 
              formData={formData} 
              onChange={handleChange} 
            />
            </div>
          )}

          {/* Preview Mode */}
          {activeTab === 'preview' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {formData.title || 'Untitled Tour'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {formData.description || 'No description provided'}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{formData.city || 'City not set'}, {formData.country || 'Country not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{formData.minCapacity} - {formData.maxCapacity} people</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span>${formData.basePrice} per person</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )

}
// ============================================================================
// EXPORT INITIAL FORM DATA - ADD AT THE VERY END
// ============================================================================

export const INITIAL_FORM_DATA: TourFormData = {
  title: '',
  description: '',
  category: 'historical',
  tags: [],
  
  location: '',
  city: '',
  country: '',
  meetingPoint: {
    name: '',
    address: '',
    instructions: ''
  },
  
  mainImage: '',
  gallery: [],
  
  minCapacity: 1,
  maxCapacity: 10,
  bookingMode: 'instant',
  instantBookEnabled: true,
  
  tourType: 'one-time',
  recurringDays: [],
  recurringUntil: undefined,
  recurringDates: [],
  excludedDates: [],
  
  durationHours: 2,
  durationMinutes: 0,
  
  basePrice: 50,
  currency: 'USD',
  dynamicPricing: {
    enabled: false
  },
  
  groupDiscountEnabled: false,
  groupDiscountThreshold: 4,
  groupDiscountPercent: 5,
  
  isHalalCertified: false,
  halalDetails: {
    prayerSpace: false,
    halalFood: false,
    genderSensitiveGuides: false,
    mosqueVisits: false
  },
  
  isPremium: false,
  isFamilyFriendly: true,
  
  availableLanguages: [],
  
  itinerary: [],
  
  inclusions: [],
  exclusions: [],
  
  requirements: [],
  whatToBring: [],
  
  cancellationPolicy: {
    fullRefund: 48,
    partialRefund: 24,
    partialRefundPercent: 50,
    noRefund: 24
  },
  
  status: 'draft'
}