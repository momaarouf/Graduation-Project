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

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Leaf,
  Globe,
  Camera,
  Video,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Eye,
  Copy,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Info,
  Sun,
  Moon,
  Star,
  Zap,
  Award,
  TrendingUp,
  Repeat,
  CalendarRange
} from 'lucide-react'
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
  recurringDays?: DayOfWeek[]
  recurringDates?: string[]
  excludedDates?: string[]
  
  // Duration
  durationHours: number
  durationMinutes: number
  
  // Pricing
  basePrice: number
  currency: 'USD' | 'TRY' | 'LBP'
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
  status: 'draft' | 'published' | 'paused' | 'archived'
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
    <div className="
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
      overflow-hidden
    ">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          w-full
          flex items-center justify-between
          p-4
          bg-gray-50 dark:bg-gray-800/50
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors
        "
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
            className="
              w-full
              px-3 py-2
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
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
            className="
              w-full
              px-3 py-2
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
              resize-none
            "
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
            className="
              w-full
              px-3 py-2
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
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
            className="
              w-full
              px-3 py-2
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
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
              className="
                w-full
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
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
              className="
                w-full
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
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
            className="
              w-full
              px-3 py-2
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
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
            className="
              w-full
              px-3 py-2
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
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
            className="
              w-full
              px-3 py-2
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
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
              value={formData.minCapacity}
              onChange={(e) => onChange('minCapacity', parseInt(e.target.value))}
              className="
                w-full
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Capacity
            </label>
            <input
              type="number"
              min={formData.minCapacity}
              value={formData.maxCapacity}
              onChange={(e) => onChange('maxCapacity', parseInt(e.target.value))}
              className="
                w-full
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
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
            <div className="
              w-11 h-6
              bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
              dark:peer-focus:ring-blue-800 rounded-full peer
              dark:bg-gray-700
              peer-checked:after:translate-x-full peer-checked:after:border-white
              after:content-[''] after:absolute after:top-[2px] after:left-[2px]
              after:bg-white after:border-gray-300 after:border after:rounded-full
              after:h-5 after:w-5 after:transition-all
              dark:border-gray-600 peer-checked:bg-blue-600
            "></div>
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
                checked={formData.tourType === 'one-time'}
                onChange={() => onChange('tourType', 'one-time')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">One-time</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
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
              value={formData.durationHours}
              onChange={(e) => onChange('durationHours', parseInt(e.target.value))}
              className="
                w-full
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minutes
            </label>
            <select
              value={formData.durationMinutes}
              onChange={(e) => onChange('durationMinutes', parseInt(e.target.value))}
              className="
                w-full
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              <option value="0">0 min</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
            </select>
          </div>
        </div>

        {/* Recurring options */}
        {formData.tourType === 'recurring' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repeats
              </label>
              <select
                value={formData.recurrencePattern || 'weekly'}
                onChange={(e) => onChange('recurrencePattern', e.target.value)}
                className="
                  w-full
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Days of week for weekly recurrence */}
            {formData.recurrencePattern === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repeat on
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        const current = formData.recurringDays || []
                        const newDays = current.includes(day)
                          ? current.filter(d => d !== day)
                          : [...current, day]
                        onChange('recurringDays', newDays)
                      }}
                      className={`
                        px-3 py-1.5
                        rounded-lg
                        text-sm font-medium
                        transition-colors
                        ${formData.recurringDays?.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Date range for one-time */}
        {formData.tourType === 'one-time' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.startDate || ''}
              onChange={(e) => onChange('startDate', e.target.value)}
              className="
                w-full
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>
        )}
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
                value={formData.basePrice}
                onChange={(e) => onChange('basePrice', parseInt(e.target.value))}
                className="
                  w-full
                  pl-7 pr-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
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
              className="
                w-full
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              <option value="USD">USD ($)</option>
              <option value="TRY">TRY (₺)</option>
              <option value="LBP">LBP (ل.ل)</option>
            </select>
          </div>
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
            <div className="
              w-11 h-6
              bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
              dark:peer-focus:ring-blue-800 rounded-full peer
              dark:bg-gray-700
              peer-checked:after:translate-x-full peer-checked:after:border-white
              after:content-[''] after:absolute after:top-[2px] after:left-[2px]
              after:bg-white after:border-gray-300 after:border after:rounded-full
              after:h-5 after:w-5 after:transition-all
              dark:border-gray-600 peer-checked:bg-blue-600
            "></div>
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
                value={formData.dynamicPricing.weekendMultiplier || 120}
                onChange={(e) => onChange('dynamicPricing', { 
                  ...formData.dynamicPricing, 
                  weekendMultiplier: parseInt(e.target.value) 
                })}
                className="
                  w-full
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
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
                value={formData.dynamicPricing.holidayMultiplier || 150}
                onChange={(e) => onChange('dynamicPricing', { 
                  ...formData.dynamicPricing, 
                  holidayMultiplier: parseInt(e.target.value) 
                })}
                className="
                  w-full
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
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
            <div className="
              w-11 h-6
              bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
              dark:peer-focus:ring-blue-800 rounded-full peer
              dark:bg-gray-700
              peer-checked:after:translate-x-full peer-checked:after:border-white
              after:content-[''] after:absolute after:top-[2px] after:left-[2px]
              after:bg-white after:border-gray-300 after:border after:rounded-full
              after:h-5 after:w-5 after:transition-all
              dark:border-gray-600 peer-checked:bg-blue-600
            "></div>
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
                value={formData.groupDiscountThreshold}
                onChange={(e) => onChange('groupDiscountThreshold', parseInt(e.target.value))}
                className="
                  w-full
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
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
                value={formData.groupDiscountPercent}
                onChange={(e) => onChange('groupDiscountPercent', parseInt(e.target.value))}
                className="
                  w-full
                  px-3 py-2
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
            </div>
          </div>
        )}
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
    <FormSection title="Halal Features" icon={Leaf}>
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
              checked={formData.isHalalCertified}
              onChange={(e) => onChange('isHalalCertified', e.target.checked)}
              className="sr-only peer"
            />
            <div className="
              w-11 h-6
              bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
              dark:peer-focus:ring-blue-800 rounded-full peer
              dark:bg-gray-700
              peer-checked:after:translate-x-full peer-checked:after:border-white
              after:content-[''] after:absolute after:top-[2px] after:left-[2px]
              after:bg-white after:border-gray-300 after:border after:rounded-full
              after:h-5 after:w-5 after:transition-all
              dark:border-gray-600 peer-checked:bg-emerald-600
            "></div>
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
            className="
              flex-1
              px-3 py-2
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
          <select
            value={newProficiency}
            onChange={(e) => setNewProficiency(e.target.value as any)}
            className="
              w-24
              px-3 py-2
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            <option value="basic">Basic</option>
            <option value="fluent">Fluent</option>
            <option value="native">Native</option>
          </select>
          <button
            onClick={handleAddLanguage}
            className="
              px-4 py-2
              bg-blue-600 hover:bg-blue-700
              text-white
              rounded-lg
              transition-colors
            "
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
              className="
                w-full
                px-3 py-2
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />

            <textarea
              value={item.description}
              onChange={(e) => updateItineraryItem(index, 'description', e.target.value)}
              placeholder="Description of this stop"
              rows={2}
              className="
                w-full
                px-3 py-2
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
                resize-none
              "
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={item.duration}
                onChange={(e) => updateItineraryItem(index, 'duration', e.target.value)}
                placeholder="Duration (e.g., 1 hour)"
                className="
                  px-3 py-2
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
              <input
                type="text"
                value={item.location?.name || ''}
                onChange={(e) => updateItineraryLocation(index, e.target.value)}
                placeholder="Location (optional)"
                className="
                  px-3 py-2
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
            </div>
          </div>
        ))}

        <button
          onClick={addItineraryItem}
          className="
            w-full
            py-3
            border-2 border-dashed border-gray-300 dark:border-gray-700
            rounded-lg
            text-gray-500 dark:text-gray-400
            hover:border-blue-500 hover:text-blue-500
            transition-colors
            flex items-center justify-center gap-2
          "
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

interface InclusionsSectionProps {
  formData: TourFormData
  onChange: (field: string, value: any) => void
}

function InclusionsSection({ formData, onChange }: InclusionsSectionProps) {
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
              className="
                flex-1
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
            <button
              onClick={addInclusion}
              className="
                px-4 py-2
                bg-emerald-600 hover:bg-emerald-700
                text-white
                rounded-lg
                transition-colors
              "
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
              className="
                flex-1
                px-3 py-2
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-lg
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
            <button
              onClick={addExclusion}
              className="
                px-4 py-2
                bg-red-600 hover:bg-red-700
                text-white
                rounded-lg
                transition-colors
              "
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
  const router = useRouter()
  const [formData, setFormData] = useState<TourFormData>(INITIAL_FORM_DATA)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // In Phase 4: API call to save tour
    console.log('Saving tour:', formData)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    router.push('/dashboard/guide/tours')
  }

  const handleSaveAsDraft = () => {
    console.log('Saving as draft:', formData)
    router.push('/dashboard/guide/tours')
  }

  return (
    <>
      {/* Page offset */}
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        
        <div className="container-safe mx-auto max-w-4xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Create New Tour
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fill in the details below to create your tour listing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAsDraft}
                className="
                  px-4 py-2
                  bg-gray-100 dark:bg-gray-800
                  text-gray-700 dark:text-gray-300
                  rounded-lg
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  transition-colors
                "
              >
                Save Draft
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="
                  flex items-center gap-2
                  px-4 py-2
                  bg-blue-600 hover:bg-blue-700
                  text-white
                  rounded-lg
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Publish Tour
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Edit/Preview Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('edit')}
              className={`
                px-4 py-2
                rounded-lg
                font-medium
                transition-colors
                ${activeTab === 'edit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }
              `}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`
                px-4 py-2
                rounded-lg
                font-medium
                transition-colors
                ${activeTab === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }
              `}
            >
              Preview
            </button>
          </div>

          {/* Edit Form */}
          {activeTab === 'edit' && (
            <div className="space-y-4">
              <BasicInfoSection formData={formData} onChange={handleChange} />
              <LocationSection formData={formData} onChange={handleChange} />
              <CapacitySection formData={formData} onChange={handleChange} />
              <ScheduleSection formData={formData} onChange={handleChange} />
              <PricingSection formData={formData} onChange={handleChange} />
              <HalalSection formData={formData} onChange={handleChange} />
              <LanguagesSection formData={formData} onChange={handleChange} />
              <ItinerarySection formData={formData} onChange={handleChange} />
              <InclusionsSection formData={formData} onChange={handleChange} />
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