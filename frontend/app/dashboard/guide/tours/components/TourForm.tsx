'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
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
 Navigation,
 PlusCircle,
 Video,
 Undo2,
 Star,
 Sparkles,
 AlertCircle
} from 'lucide-react'
import { Country, City } from 'country-state-city'
import { Combobox } from '@headlessui/react'
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

// Dynamically import Map components with SSR disabled for Leaflet support
const MapPicker = dynamic(() => import('@/src/components/ui/MapPicker'), { 
 ssr: false,
 loading: () => <div className="h-[300px] surface-section rounded-xl animate-pulse flex items-center justify-center font-bold text-theme-muted">LOADING MAP PICKER...</div>
})

const RouteBuilderMap = dynamic(() => import('@/src/components/ui/RouteBuilderMap'), { 
 ssr: false,
 loading: () => <div className="h-[400px] surface-section rounded-3xl animate-pulse flex items-center justify-center font-bold text-theme-muted">PREPARING ROUTE BUILDER...</div>
})

// ============================================================================
// PROPS INTERFACE
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
 showMap?: boolean
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
// CONSTANTS
// ============================================================================

const COMMON_LANGUAGES = [
"Afrikaans","Albanian","Amharic","Arabic","Armenian","Azerbaijani", 
"Basque","Belarusian","Bengali","Bosnian","Bulgarian","Catalan", 
"Chinese (Simplified)","Chinese (Traditional)","Croatian","Czech", 
"Danish","Dutch","English","Esperanto","Estonian","Finnish", 
"French","Galician","Georgian","German","Greek","Gujarati", 
"Haitian Creole","Hausa","Hebrew","Hindi","Hungarian","Icelandic", 
"Igbo","Indonesian","Irish","Italian","Japanese","Javanese", 
"Kannada","Kazakh","Khmer","Kinyarwanda","Korean","Kurdish", 
"Kyrgyz","Lao","Latin","Latvian","Lithuanian","Luxembourgish", 
"Macedonian","Malagasy","Malay","Malayalam","Maltese","Maori", 
"Marathi","Mongolian","Myanmar (Burmese)","Nepali","Norwegian", 
"Nyanja (Chichewa)","Odia (Oriya)","Pashto","Persian","Polish", 
"Portuguese","Punjabi","Romanian","Russian","Samoan","Scots Gaelic", 
"Serbian","Sesotho","Shona","Sindhi","Sinhala (Sinhalese)","Slovak", 
"Slovenian","Somali","Spanish","Sundanese","Swahili","Swedish", 
"Tagalog (Filipino)","Tajik","Tamil","Tatar","Telugu","Thai", 
"Turkish","Turkmen","Ukrainian","Urdu","Uyghur","Uzbek", 
"Vietnamese","Welsh","Xhosa","Yiddish","Yoruba","Zulu"
].sort();

const TOUR_CATEGORIES = [
 { label: 'Historical', value: 'historical' },
 { label: 'Cultural', value: 'cultural' },
 { label: 'Food & Culinary', value: 'food' },
 { label: 'Adventure', value: 'adventure' },
 { label: 'Nature & Outdoors', value: 'nature' },
 { label: 'Family Friendly', value: 'family' },
 { label: 'Religious / Halal', value: 'religious' },
 { label: 'Hiking', value: 'hiking' },
 { label: 'Photography', value: 'photography' },
 { label: 'Nightlife', value: 'nightlife' },
 { label: 'Shopping', value: 'shopping' },
 { label: 'Beach', value: 'beach' },
 { label: 'Wellness', value: 'wellness' },
 { label: 'Art', value: 'art' },
 { label: 'Architecture', value: 'architecture' },
 { label: 'Education', value: 'education' },
].sort((a, b) => a.label.localeCompare(b.label));

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

interface SearchableSelectProps {
 value: string;
 onChange: (value: string) => void;
 options: { label: string; value: string }[];
 placeholder?: string;
 label?: string;
 disabled?: boolean;
}

function SearchableSelect({ value, onChange, options, placeholder ="Search...", label, disabled }: SearchableSelectProps) {
 const [query, setQuery] = useState('')

 const filteredOptions = query === ''
 ? options
 : options.filter((opt) =>
 opt.label.toLowerCase().includes(query.toLowerCase())
 )

 const selectedOption = options.find(opt => opt.value === value) || null

 return (
 <div className="w-full">
 {label && (
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 {label}
 </label>
 )}
 <Combobox value={value} onChange={(val: string | null) => val !== null && onChange(val)} disabled={disabled}>
 {({ open }) => (
 <div className="relative">
 <Combobox.Button as="div" className="relative w-full cursor-pointer overflow-hidden rounded-lg surface-section border-2 border-theme text-left focus-within:border-primary-light dark:border-primary-dark focus-within:ring-2 focus-within:ring-primary-light dark:ring-primary-dark/20 transition-all sm:text-sm shadow-sm hover:surface-card dark:hover:surface-card">
 <Combobox.Input
 className="w-full border-none py-2.5 pl-3 pr-10 text-sm leading-5 text-theme-primary bg-transparent focus:ring-0 outline-none cursor-pointer"
 displayValue={() => selectedOption?.label || ''}
 onChange={(event) => setQuery(event.target.value)}
 placeholder={placeholder}
 />
 <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
 <ChevronDown
 className={`h-5 w-5 text-theme-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
 aria-hidden="true"
 />
 </div>
 </Combobox.Button>
 <Combobox.Options className="absolute z-[100] mt-1 pr-2 max-h-60 w-full overflow-auto rounded-md surface-card py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-theme">
 {filteredOptions.length === 0 && query !== '' ? (
 <div className="relative cursor-default select-none py-2 px-4 text-theme-secondary">
 Nothing found.
 </div>
 ) : (
 filteredOptions.map((opt) => (
 <Combobox.Option
 key={opt.value}
 className={({ active }) =>
 `relative cursor-default select-none py-2 pl-10 pr-4 ${
 active ? 'bg-primary-light text-white' : 'text-theme-primary'
 }`
 }
 value={opt.value}
 >
 {({ selected, active }) => (
 <>
 <span
 className={`block truncate ${
 selected ? 'font-medium' : 'font-normal'
 }`}
 >
 {opt.label}
 </span>
 {selected ? (
 <span
 className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
 active ? 'text-white' : 'text-primary-light dark:text-primary-dark'
 }`}
 >
 <CheckCircle className="h-5 w-5" aria-hidden="true" />
 </span>
 ) : null}
 </>
 )}
 </Combobox.Option>
 ))
 )}
 </Combobox.Options>
 </div>
 )}
 </Combobox>
 </div>
 )
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
    <div className="surface-card border border-theme rounded-2xl sm:rounded-[2rem] relative shadow-xl shadow-black/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 sm:p-6 surface-section hover:surface-card transition-all rounded-t-2xl sm:rounded-t-[2rem]"
      >
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary-light/10 rounded-lg">
 <Icon className="w-5 h-5 text-primary-light dark:text-primary-dark" />
 </div>
 <h3 className="font-bold text-theme-primary capitalize tracking-tight">
 {title}
 </h3>
 </div>
 {isExpanded ? (
 <ChevronUp className="w-5 h-5 text-theme-muted " />
 ) : (
 <ChevronDown className="w-5 h-5 text-theme-muted " />
 )}
 </button>

      {isExpanded && (
        <div className="p-4 sm:p-6">
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
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Tour Title <span className="text-danger-red">*</span>
 </label>
  <input
  type="text"
  value={formData.title}
  onChange={(e) => onChange('title', e.target.value)}
  className=" w-full px-4 py-3 surface-section border-2 border-theme rounded-2xl text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-4 focus:ring-primary-light/10 dark:ring-primary-dark/5 transition-all shadow-sm hover:surface-card dark:hover:surface-card font-bold"
  placeholder=""
  />
 </div>

 {/* Description */}
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Description <span className="text-danger-red">*</span>
 </label>
  <textarea
  value={formData.description}
  onChange={(e) => onChange('description', e.target.value)}
  rows={5}
  className=" w-full px-4 py-3 surface-section border-2 border-theme rounded-2xl text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-4 focus:ring-primary-light/10 dark:ring-primary-dark/5 transition-all shadow-sm hover:surface-card dark:hover:surface-card resize-none font-bold"
  placeholder=""
  />
 </div>

 {/* Category */}
  <div>
  <label className="block text-sm font-medium text-theme-secondary mb-1">
  Category <span className="text-danger-red">*</span>
  </label>
  <select
  value={formData.category}
  onChange={(e) => onChange('category', e.target.value)}
  className=" w-full px-4 py-3 surface-section border-2 border-theme rounded-2xl text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-4 focus:ring-primary-light/10 dark:ring-primary-dark/5 transition-all shadow-sm hover:surface-card dark:hover:surface-card font-bold"
  >
  {TOUR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
  </select>
  </div>

 {/* Tags */}
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Tags (comma separated)
 </label>
 <input
 type="text"
 value={formData.tags.join(', ')}
 onChange={(e) => onChange('tags', e.target.value.split(',').map(t => t.trim()))}
 className=" w-full px-3 py-2 surface-section border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 placeholder=""
 />
 </div>
 </div>
 </FormSection>
 )
}

// ============================================================================
// LOCATION SECTION
// ============================================================================

function TourLocationSection({ formData, onChange, mapId }: { formData: TourFormData; onChange: any; mapId?: string }) {
 const countryOptions = useMemo(() => 
 Country.getAllCountries().map(c => ({ label: c.name, value: c.name })),
 [])

 const cityOptions = useMemo(() => {
 if (!formData.country) return []
 const countryObj = Country.getAllCountries().find(c => c.name === formData.country)
 if (!countryObj) return []
 const cities = City.getCitiesOfCountry(countryObj.isoCode)
 return (cities || []).map(c => ({ label: c.name, value: c.name }))
 }, [formData.country])

 return (
 <FormSection title="Location & Meeting Point" icon={MapPin}>
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <SearchableSelect
 label="Country"
 value={formData.country}
 onChange={(val) => {
 onChange('country', val)
 onChange('city', '') // Reset city when country changes
 }}
 options={countryOptions}
 placeholder="Select country"
 />
 </div>
 <div>
 <SearchableSelect
 label="City"
 value={formData.city}
 onChange={(val) => onChange('city', val)}
 options={cityOptions}
 placeholder={formData.country ?"Select city" :"Select country first"}
 disabled={!formData.country}
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Meeting Point Name
 </label>
 <input
 type="text"
 value={formData.meetingPoint.name}
 onChange={(e) => onChange('meetingPoint', { ...formData.meetingPoint, name: e.target.value })}
 className=" w-full px-4 py-3 surface-section border-2 border-theme rounded-2xl text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-4 focus:ring-primary-light/10 dark:ring-primary-dark/5 transition-all font-bold shadow-sm hover:surface-card"
 placeholder="e.g. Beirut Souks, Martyrs Square"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Full Address
 </label>
 <input
 type="text"
 value={formData.meetingPoint.address}
 onChange={(e) => onChange('meetingPoint', { ...formData.meetingPoint, address: e.target.value })}
 className=" w-full px-4 py-3 surface-section border-2 border-theme rounded-2xl text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-4 focus:ring-primary-light/10 dark:ring-primary-dark/5 transition-all font-bold shadow-sm hover:surface-card"
 placeholder="Street name, building, floor"
 />
 </div>

 {/* Interactive Map Picker - Meeting Point */}
 <div className="mt-6">
 <label className="block text-[10px] font-bold text-theme-muted capitalize tracking-normal mb-3 flex items-center gap-2">
 <Navigation className="w-3 h-3" />
 Pick on Map (Automatically fills name & address)
 </label>
  <MapPicker 
  lat={formData.meetingPoint.lat}
  lng={formData.meetingPoint.lng}
  onChange={(lat, lng, address, name) => {
  onChange('meetingPoint', { 
  ...formData.meetingPoint, 
  lat, 
  lng,
  address: address || formData.meetingPoint.address,
  name: name || formData.meetingPoint.name
  })
  toast.success('Location & Address updated', { id: 'map-pick' })
  }}
  height="350px"
  />
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
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Minimum Capacity
 </label>
 <input
 type="number"
 min="1"
 value={formData.minCapacity || ''}
 onChange={(e) => onChange('minCapacity', e.target.value === '' ? 0 : parseInt(e.target.value))}
 className=" w-full px-3 py-2 surface-section border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Maximum Capacity
 </label>
 <input
 type="number"
 min={formData.minCapacity || 1}
 max="999"
 value={formData.maxCapacity || ''}
 onChange={(e) => {
 const val = e.target.value === '' ? 0 : parseInt(e.target.value);
 onChange('maxCapacity', val);
 }}
 className=" w-full px-3 py-2 surface-section border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark transition-all"
 />
 <p className="text-[10px] text-theme-muted mt-1 capitalize tracking-tight">Total spots available per tour</p>
 </div>
 </div>

 <div className="flex items-center justify-between p-3 surface-section rounded-lg">
 <div className="flex items-center gap-2">
 <Zap className="w-4 h-4 text-accent-light dark:text-accent-dark dark:text-amber-400" />
 <div>
 <p className="text-sm font-medium text-theme-primary">Instant Booking</p>
 <p className="text-xs text-theme-muted ">
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
 <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/30 dark:peer-focus:ring-primary-dark/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
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
 <label className="block text-sm font-medium text-theme-secondary mb-2">
 Tour Type
 </label>
 <div className="flex gap-4">
 <label className="flex items-center gap-2">
 <input
 type="radio"
 name="tourType"
 checked={formData.tourType === 'one-time'}
 onChange={() => onChange('tourType', 'one-time')}
 className="w-4 h-4 text-primary-light dark:text-primary-dark"
 />
 <span className="text-sm text-theme-secondary">One-time</span>
 </label>
 <label className="flex items-center gap-2">
 <input
 type="radio"
 name="tourType"
 checked={formData.tourType === 'recurring'}
 onChange={() => onChange('tourType', 'recurring')}
 className="w-4 h-4 text-primary-light dark:text-primary-dark"
 />
 <span className="text-sm text-theme-secondary">Recurring</span>
 </label>
 </div>
 </div>

 {/* Duration */}
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Hours
 </label>
 <input
 type="number"
 min="0"
 max="24"
 value={formData.durationHours || ''}
 onChange={(e) => onChange('durationHours', e.target.value === '' ? 0 : parseInt(e.target.value))}
 className=" w-full px-4 py-3 surface-section border-2 border-theme rounded-2xl text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-4 focus:ring-primary-light/10 dark:ring-primary-dark/5 transition-all font-bold shadow-sm hover:surface-card"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Minutes
 </label>
 <input
 type="number"
 min="0"
 max="59"
 value={formData.durationMinutes ?? 0}
 onChange={(e) => {
 const val = parseInt(e.target.value) || 0
 onChange('durationMinutes', Math.min(59, Math.max(0, val)))
 }}
 className=" w-full px-4 py-3 surface-section border-2 border-theme rounded-2xl text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-4 focus:ring-primary-light/10 dark:ring-primary-dark/5 transition-all font-bold shadow-sm hover:surface-card"
 />
 </div>
 </div>

 {formData.tourType === 'recurring' && (
 <div className="space-y-4 p-4 surface-section rounded-lg border border-theme">
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-2">
 Repeats
 </label>
 <select
 value={formData.recurrencePattern || 'weekly'}
 onChange={(e) => onChange('recurrencePattern', e.target.value)}
 className=" w-full px-3 py-2 surface-card border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 >
 <option value="daily">Daily</option>
 <option value="weekly">Weekly</option>
 <option value="monthly">Monthly</option>
 <option value="custom">Custom (Select Dates)</option>
 </select>
 </div>

 {formData.recurrencePattern === 'custom' && (
 <p className="text-xs text-primary-light dark:text-primary-dark font-medium">
 Click dates on the calendar below to add/remove them from your schedule.
 </p>
 )}

 {(!formData.recurrencePattern || formData.recurrencePattern === 'weekly') && (
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-2">
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
 className={` px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSelected
 ? 'bg-primary-light text-white'
 : 'surface-section text-theme-secondary'
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
 <label className="block text-sm font-medium text-theme-secondary mb-2">
 Recurring Until (Optional)
 </label>
 <div className="relative">
 <input
 type="date"
 value={formData.recurringUntil ? formData.recurringUntil.split('T')[0] : ''}
 onChange={(e) => onChange('recurringUntil', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
 className=" w-full px-3 py-2 surface-card border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 min={new Date().toISOString().split('T')[0]}
 />
 {formData.recurringUntil && (
 <button
 type="button"
 onClick={() => onChange('recurringUntil', undefined)}
 className="absolute right-10 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>
 <p className="mt-1 text-xs text-theme-muted ">
 Leave empty to repeat indefinitely
 </p>
 </div>
 </div>
 )}

 {/* Recurring Date Preview */}
 {formData.tourType === 'recurring' && (
 <div className="mt-6 p-4 bg-primary-light/50 dark:bg-primary-dark/14 rounded-2xl border border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark/20">
 <div className="flex items-center gap-2 mb-4">
 <Calendar className="w-4 h-4 text-primary-light dark:text-primary-dark" />
  <h4 className="text-xs font-bold text-primary-light dark:text-primary-dark capitalize tracking-normal">
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
 <p className="mt-3 text-[10px] font-bold text-primary-light dark:text-primary-dark/60 capitalize tracking-normal text-center">
 Check the"Occurrences" page after saving for full schedule management
 </p>
 </div>
 )}

 {/* Start Date & Time Selection (Unified) */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 {formData.tourType === 'recurring' ? 'Base Start Date' : 'Start Date'}
 </label>
 <input
 type="date"
 value={formData.startDate ? formData.startDate.split('T')[0] : ''}
 onChange={(e) => {
 const datePart = e.target.value;
 const timePart = formData.startDate ? formData.startDate.split('T')[1]?.split('.')[0] || '09:00:00' : '09:00:00';
 onChange('startDate', `${datePart}T${timePart}.000Z`);
 }}
 className=" w-full px-3 py-2 surface-section border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Start Time
 </label>
 <div className="relative group">
 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted group-focus-within:text-primary-light dark:text-primary-dark transition-colors pointer-events-none" />
 <input
 type="time"
 value={(() => {
 if (!formData.startDate) return '09:00';
 try {
 // Stage 1: Absolute UTC Normalization
 let dateStr = formData.startDate.trim();
 if (!dateStr.includes('Z') && !dateStr.includes('+')) {
 dateStr = dateStr.replace(' ', 'T') + 'Z';
 }
 const d = new Date(dateStr);
 if (isNaN(d.getTime())) return '09:00';

 // Stage 2: Deterministic Beirut Offset (2026 Calendar)
 const isDST = d >= new Date('2026-03-29T00:00:00Z') && d < new Date('2026-10-25T00:00:00Z');
 const offset = isDST ? 3 : 2;
 
 // Stage 3: UTC-based Wall-Clock Extraction
 const shifted = new Date(d.getTime() + (offset * 3600000));
 const hh = shifted.getUTCHours().toString().padStart(2, '0');
 const mm = shifted.getUTCMinutes().toString().padStart(2, '0');
 
 return `${hh}:${mm}`;
 } catch (e) {
 return '09:00';
 }
 })()}
 onChange={(e) => {
 const newTime = e.target.value;
 if (!newTime) return;
 
 const [h, m] = newTime.split(':').map(Number);
 const d1 = formData.startDate ? new Date(formData.startDate) : new Date();
 const datePart = d1.toISOString().split('T')[0];
 
 const targetDay = new Date(`${datePart}T12:00:00Z`);
 const isDST = targetDay >= new Date('2026-03-29T00:00:00Z') && targetDay < new Date('2026-10-25T00:00:00Z');
 const offset = isDST ? 3 : 2;
 
 const finalUTC = new Date(Date.UTC(
 parseInt(datePart.split('-')[0]),
 parseInt(datePart.split('-')[1]) - 1,
 parseInt(datePart.split('-')[2]),
 h - offset,
 m
 ));
 
 onChange('startDate', finalUTC.toISOString());
 }}
 className=" w-full pl-10 pr-3 py-3 surface-section border-2 border-theme rounded-2xl text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-4 focus:ring-primary-light/10 dark:ring-primary-dark/5 transition-all font-bold shadow-sm hover:surface-card"
 />
 </div>
 </div>
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
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Base Price
 </label>
 <div className="relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted">
 $
 </span>
 <input
 type="number"
 min="0"
 value={formData.basePrice || ''}
 onChange={(e) => onChange('basePrice', e.target.value === '' ? 0 : parseInt(e.target.value))}
 className=" w-full pl-8 pr-3 py-3 surface-section border-2 border-theme rounded-2xl text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-4 focus:ring-primary-light/10 dark:ring-primary-dark/5 transition-all font-bold shadow-sm hover:surface-card"
 />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Currency
 </label>
 <select
 value={formData.currency}
 onChange={(e) => onChange('currency', e.target.value)}
 className=" w-full px-3 py-2 surface-section border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 >
 <option value="USD">USD ($)</option>
 <option value="TRY">TRY (₺)</option>
 <option value="LBP">LBP (ل.ل)</option>
 </select>
 </div>
 </div>

 {/* Premium Toggle */}
 <div className="flex items-center justify-between p-3 bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-900/10 border border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark/20 rounded-lg mb-4">
 <div className="flex items-center gap-2">
 <Star className="w-4 h-4 text-accent-light dark:text-accent-dark dark:text-amber-400" />
 <div>
 <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Premium Experience</p>
 <p className="text-xs text-accent-light dark:text-accent-dark dark:text-amber-400">
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
 <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
 </label>
 </div>

 {/* Dynamic Pricing Toggle */}
 <div className="flex items-center justify-between p-3 surface-section rounded-lg">
 <div className="flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
 <div>
 <p className="text-sm font-medium text-theme-primary">Dynamic Pricing</p>
 <p className="text-xs text-theme-muted ">
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
 <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/30 dark:peer-focus:ring-primary-dark/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
 </label>
 </div>

 {/* Dynamic Pricing Options */}
 {formData.dynamicPricing.enabled && (
 <div className="space-y-3 pl-4 border-l-2 border-primary-light dark:border-primary-dark dark:border-primary-light dark:border-primary-dark">
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Weekend Multiplier (x)
 </label>
 <input
 type="number"
 min="1"
 step="0.01"
 value={formData?.dynamicPricing?.weekendMultiplier ?? ''}
 onChange={(e) => onChange('dynamicPricing', {
 ...(formData.dynamicPricing || {}),
 weekendMultiplier: e.target.value === '' ? 1.0 : parseFloat(e.target.value)
 })}
 className=" w-full px-3 py-2 surface-section border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 <p className="text-xs text-theme-muted mt-1">Example: Enter 1.2 for 20% extra on weekends, or 1.0 for normal price.</p>
 </div>

 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Holiday Multiplier (x)
 </label>
 <input
 type="number"
 min="1"
 step="0.01"
 value={formData?.dynamicPricing?.holidayMultiplier ?? ''}
 onChange={(e) => onChange('dynamicPricing', {
 ...(formData.dynamicPricing || {}),
 holidayMultiplier: e.target.value === '' ? 1.0 : parseFloat(e.target.value)
 })}
 className=" w-full px-3 py-2 surface-section border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 <p className="text-xs text-theme-muted mt-1">Example: Enter 1.25 for 25% extra on holidays, or 1.0 for normal price.</p>
 </div>
 </div>
 )}

 {/* Group Discount Toggle */}
 <div className="flex items-center justify-between p-3 surface-section rounded-lg">
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-success-green dark:text-emerald-400" />
 <div>
 <p className="text-sm font-medium text-theme-primary">Group Discount</p>
 <p className="text-xs text-theme-muted ">
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
 <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/30 dark:peer-focus:ring-primary-dark/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
 </label>
 </div>

 {/* Group Discount Options */}
 {formData.groupDiscountEnabled && (
 <div className="grid grid-cols-2 gap-4 pl-4">
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Min. Group Size
 </label>
 <input
 type="number"
 min="2"
 value={formData.groupDiscountThreshold || ''}
 onChange={(e) => onChange('groupDiscountThreshold', e.target.value === '' ? 0 : parseInt(e.target.value))}
 className=" w-full px-3 py-2 surface-section border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-theme-secondary mb-1">
 Discount (%)
 </label>
 <input
 type="number"
 min="0"
 max="100"
 step="0.01"
 value={Math.round((formData.groupDiscountPercent || 0) * 100) / 100 || ''}
 onChange={(e) => {
 const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
 onChange('groupDiscountPercent', Math.round(val * 100) / 100);
 }}
 className=" w-full px-3 py-2 surface-section border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark transition-all"
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

 const updateMediaCaption = (index: number, caption: string) => {
 const updated = [...formData.gallery]
 updated[index] = { ...updated[index], caption }
 onChange('gallery', updated)
 }

 return (
 <FormSection title="Photos & Videos" icon={Camera}>
 <div className="space-y-4">
 <p className="text-xs text-theme-muted mb-2">
 The first image will be used as the cover photo. Max 100MB per file.
 </p>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 {formData.gallery.map((item, index) => (
 <div key={item.id} className="flex flex-col gap-2">
 <div className="relative aspect-video rounded-xl overflow-hidden border border-theme surface-section group">
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
 <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary-light text-[10px] font-bold text-white rounded-full shadow-lg">
 COVER
 </div>
 )}
 </div>
 <div className="mt-1 px-1">
 <input
 type="text"
 placeholder="Add a caption..."
 value={item.caption || ''}
 onChange={(e) => updateMediaCaption(index, e.target.value)}
 className="w-full text-[11px] py-1 bg-transparent border-b border-theme focus:border-primary-light dark:border-primary-dark outline-none text-theme-secondary placeholder:italic transition-colors"
 />
 </div>
 </div>
 ))}

 <label className="relative aspect-video rounded-xl border-2 border-dashed border-theme-strong hover:border-primary-light dark:hover:border-primary-dark hover:bg-primary-light/10 dark:hover:surface-base cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
 <input
 type="file"
 multiple
 accept="image/*,video/*"
 className="hidden"
 onChange={handleFileChange}
 disabled={uploading}
 />
 {uploading ? (
 <div className="w-6 h-6 border-2 border-primary-light dark:border-primary-dark border-t-transparent rounded-full animate-spin" />
 ) : (
 <>
 <Camera className="w-6 h-6 text-theme-muted" />
 <span className="text-xs font-semibold text-theme-muted">Add Media</span>
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
 <div className="flex items-center justify-between p-3 surface-section rounded-lg">
 <div className="flex items-center gap-2">
 <Leaf className="w-4 h-4 text-success-green dark:text-emerald-400" />
 <div>
 <p className="text-sm font-medium text-theme-primary">Halal Certified</p>
 <p className="text-xs text-theme-muted ">
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
 <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
 </label>
 </div>

 {/* Family Friendly Toggle */}
 <div className="flex items-center justify-between p-3 surface-section rounded-lg">
 <div className="flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-400" />
 <div>
 <p className="text-sm font-medium text-theme-primary">Family Friendly</p>
 <p className="text-xs text-theme-muted ">
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
 <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500/30 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
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
 className="w-4 h-4 text-success-green rounded"
 />
 <span className="text-sm text-theme-secondary">Prayer space available</span>
 </div>
 <div className="flex items-center gap-2">
 <input
 type="checkbox"
 checked={formData.halalDetails?.halalFood || false}
 onChange={(e) => onChange('halalDetails', {
 ...formData.halalDetails,
 halalFood: e.target.checked
 })}
 className="w-4 h-4 text-success-green rounded"
 />
 <span className="text-sm text-theme-secondary">Halal food options</span>
 </div>
 <div className="flex items-center gap-2">
 <input
 type="checkbox"
 checked={formData.halalDetails?.genderSensitiveGuides || false}
 onChange={(e) => onChange('halalDetails', {
 ...formData.halalDetails,
 genderSensitiveGuides: e.target.checked
 })}
 className="w-4 h-4 text-success-green rounded"
 />
 <span className="text-sm text-theme-secondary">Gender-sensitive guides available</span>
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
 <div key={index} className="flex items-center justify-between p-2 surface-section rounded-lg">
 <div className="flex items-center gap-2">
 <Globe className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <span className="text-sm font-medium text-theme-primary">
 {lang.language}
 </span>
 <span className="text-xs px-2 py-0.5 surface-section rounded-full">
 {lang.proficiency}
 </span>
 </div>
 <button
 onClick={() => handleRemoveLanguage(index)}
 className="text-danger-red hover:text-red-700"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}

 {formData.availableLanguages.length === 0 && (
 <p className="text-sm text-theme-muted text-center py-4">
 No languages added yet
 </p>
 )}
 </div>

 {/* Add new language */}
 <div className="flex gap-2">
 <SearchableSelect
 value={newLanguage}
 onChange={(val) => setNewLanguage(val)}
 options={COMMON_LANGUAGES.map(l => ({ label: l, value: l }))}
 placeholder="Search language..."
 />
 <select
 value={newProficiency}
 onChange={(e) => setNewProficiency(e.target.value as any)}
 className=" w-24 px-3 py-2 surface-section border border-theme rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark"
 >
 <option value="basic">Basic</option>
 <option value="fluent">Fluent</option>
 <option value="native">Native</option>
 </select>
 <button
 onClick={handleAddLanguage}
 className=" px-4 py-2 bg-primary-light hover:bg-primary-light-hover text-white rounded-lg transition-colors"
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

function ItinerarySection({ formData, onChange, mapId }: ItinerarySectionProps & { mapId?: string }) {
 const addItineraryItem = () => {
 const newItem = {
 id: Date.now().toString(),
 order: formData.itinerary.length + 1,
 title: '',
 description: '',
 duration: '0h 30m',
 location: undefined
 }
 onChange('itinerary', [...formData.itinerary, newItem])
 }

 const updateItineraryItem = (index: number, field: string, value: any) => {
 const updated = [...formData.itinerary]
 updated[index] = { ...updated[index], [field]: value }
 onChange('itinerary', updated)
 }

 const updateItineraryLocation = (index: number, locationName: string, lat?: number, lng?: number, address?: string) => {
 const updated = [...formData.itinerary]
 const currentLoc = updated[index].location || { name: '' }
 
 // Set title to full address as requested
 if (address) {
 updated[index].title = address;
 } else if (locationName) {
 updated[index].title = locationName;
 }
 
 // Leave description empty for the guide to specify
 updated[index].description = '';

 updated[index] = {
 ...updated[index],
 location: { 
 ...currentLoc,
 name: locationName ?? currentLoc.name,
 lat: lat ?? currentLoc.lat,
 lng: lng ?? currentLoc.lng
 }
 }
 onChange('itinerary', updated)
 }

 const removeItineraryItem = (index: number) => {
 onChange('itinerary', formData.itinerary.filter((_, i) => i !== index))
 }

 return (
 <FormSection title="Itinerary" icon={CalendarRange}>
 <div className="space-y-6">
 {/* UNIFIED ROUTE BUILDER MAP */}
 <div className="mb-6 sm:mb-8">
 <label className="block text-[10px] sm:text-xs font-bold text-theme-muted capitalize tracking-[0.15em] mb-3 flex items-center gap-2">
 <Sparkles className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark" />
 Visual Route Builder (A → B → C)
 </label>
 <RouteBuilderMap 
 stops={formData.itinerary}
 onAddStop={(lat, lng, address, name) => {
 const newItem = {
 id: Date.now().toString(),
 order: formData.itinerary.length + 1,
 title: address || name || `Stop ${formData.itinerary.length + 1}`,
 description: '', // Leave empty for guide to specify
 duration: '0h 30m',
 location: { name: name || 'Custom Point', lat, lng }
 }
 onChange('itinerary', [...formData.itinerary, newItem])
 toast.success(`Stop ${newItem.order} added to trail`, { id: 'route-add' })
 }}
 onUpdateStop={(idx, lat, lng, address, name) => {
 updateItineraryLocation(idx, name || '', lat, lng, address)
 }}
 onRemoveStop={removeItineraryItem}
 height={typeof window !== 'undefined' && window.innerWidth < 640 ? "350px" : "450px"}
 />
 <p className="mt-3 text-[10px] text-theme-muted text-center leading-relaxed">
 PRO TIP: Just click anywhere on the map to add stops in sequence. The trail will form automatically.
 </p>
 </div>

 <div className="space-y-4">
 {formData.itinerary.map((item, index) => (
 <div key={item.id} className="p-4 surface-section rounded-lg space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-sm font-semibold text-theme-primary">
 Stop {index + 1}
 </span>
 <button
 onClick={() => removeItineraryItem(index)}
 className="text-danger-red hover:text-red-700"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>

 <input
 type="text"
 value={item.title}
 onChange={(e) => updateItineraryItem(index, 'title', e.target.value)}
 placeholder=""
 className=" w-full px-3 py-2.5 surface-card border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20 transition-all shadow-sm hover:surface-section dark:hover:surface-base"
 />

 <textarea
 value={item.description}
 onChange={(e) => updateItineraryItem(index, 'description', e.target.value)}
 placeholder="Description of this stop"
 rows={2}
 className=" w-full px-3 py-2.5 surface-card border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20 transition-all shadow-sm hover:surface-section dark:hover:surface-base resize-none"
 />

 <div className="grid grid-cols-2 gap-2">
 <div className="flex items-center gap-1.5">
 <div className="flex-1 relative">
 <input
 type="number"
 min="0"
 placeholder="Hr"
 value={(() => {
 const match = item.duration.match(/^(-?\d*)h/);
 return match ? match[1] : '';
 })()}
 onChange={(e) => {
 const val = e.target.value;
 const mMatch = item.duration.match(/h\s*(-?\d*)m/);
 const m = mMatch ? mMatch[1] : '0';
 updateItineraryItem(index, 'duration', `${val}h ${m}m`);
 }}
 className=" w-full px-3 py-2 surface-card border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark transition-all text-sm"
 />
 <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-theme-muted font-bold pointer-events-none capitalize">Hr</span>
 </div>
 <div className="flex-1 relative">
 <input
 type="number"
 min="0"
 max="59"
 placeholder="Min"
 value={(() => {
 const match = item.duration.match(/h\s*(-?\d*)m/);
 return match ? match[1] : '';
 })()}
 onChange={(e) => {
 const val = e.target.value;
 const hMatch = item.duration.match(/^(-?\d*)h/);
 const h = hMatch ? hMatch[1] : '0';
 updateItineraryItem(index, 'duration', `${h}h ${val}m`);
 }}
 className=" w-full px-3 py-2 surface-card border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark transition-all text-sm"
 />
 <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-theme-muted font-bold pointer-events-none capitalize">Min</span>
 </div>
 </div>
 <div className="flex-1">
 <input
 type="text"
 value={item.location?.name || ''}
 onChange={(e) => updateItineraryLocation(index, e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItineraryItem())}
 placeholder="Location Name"
 className=" w-full px-3 py-2 surface-card border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark transition-all text-xs"
 />
 </div>
 </div>

 {/* Map Picker for Itinerary Stop */}
 <div className="mt-4 border-t border-theme pt-3">
 <button
 type="button"
 onClick={() => {
 const items = [...formData.itinerary]
 items[index] = { ...items[index], showMap: !(items as any)[index].showMap }
 onChange('itinerary', items)
 }}
 className={`flex items-center gap-2 text-[10px] font-bold capitalize tracking-normal transition-colors ${(item as any).showMap ? 'text-primary-light dark:text-primary-dark' : 'text-theme-muted hover:text-theme-secondary'}`}
 >
 <MapPin className="w-3.5 h-3.5" />
 {(item as any).showMap ? 'Hide Map' : 'Pick stop on Map'}
 </button>
 
 {(item as any).showMap && (
 <div className="mt-3">
 <MapPicker 
 lat={item.location?.lat}
 lng={item.location?.lng}
 trail={formData.itinerary.slice(0, index).map(it => ({
 lat: it.location?.lat || 0,
 lng: it.location?.lng || 0,
 label: String(it.order)
 }))}
 onChange={(lat, lng, address, name) => {
 updateItineraryLocation(index, name || item.location?.name || '', lat, lng)
 }}
 mapId={`${mapId || 'itinerary-map'}-stop-${index}`}
 height="200px"
 />
 </div>
 )}
 </div>
 </div>
 ))}

 <button
 onClick={addItineraryItem}
 className=" w-full py-3 border-2 border-dashed border-theme-strong rounded-lg text-theme-muted hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:text-primary-dark transition-colors flex items-center justify-center gap-2"
 >
 <Plus className="w-4 h-4" />
 Add Itinerary Stop
 </button>
 </div>
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
 <h4 className="text-sm font-semibold text-theme-primary mb-2">
 What's Included
 </h4>
 <div className="space-y-2 mb-3">
 {formData.inclusions.map((item, index) => (
 <div key={index} className="flex items-center justify-between p-2 surface-section rounded-lg">
 <span className="text-sm text-theme-secondary">{item}</span>
 <button
 onClick={() => removeInclusion(index)}
 className="text-danger-red hover:text-red-700"
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
 onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
 placeholder=""
 className=" flex-1 px-3 py-2.5 surface-section border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20 transition-all shadow-sm hover:surface-card dark:hover:surface-card"
 />
 <button
 onClick={addInclusion}
 className=" px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
 >
 Add
 </button>
 </div>
 </div>

 {/* Exclusions */}
 <div>
 <h4 className="text-sm font-semibold text-theme-primary mb-2">
 What's Excluded
 </h4>
 <div className="space-y-2 mb-3">
 {formData.exclusions.map((item, index) => (
 <div key={index} className="flex items-center justify-between p-2 surface-section rounded-lg">
 <span className="text-sm text-theme-secondary">{item}</span>
 <button
 onClick={() => removeExclusion(index)}
 className="text-danger-red hover:text-red-700"
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
 onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
 placeholder=""
 className=" flex-1 px-3 py-2.5 surface-section border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20 transition-all shadow-sm hover:surface-card dark:hover:surface-card"
 />
 <button
 onClick={addExclusion}
 className=" px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
 <h4 className="text-sm font-semibold text-theme-primary mb-2">
 Tour Requirements
 </h4>
 <div className="space-y-2 mb-3">
 {formData.requirements.map((item, index) => (
 <div key={index} className="flex items-center justify-between p-2 surface-section rounded-lg">
 <span className="text-sm text-theme-secondary">{item}</span>
 <button
 onClick={() => removeRequirement(index)}
 className="text-danger-red hover:text-red-700"
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
 onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
 placeholder=""
 className="flex-1 px-3 py-2.5 surface-section border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20 transition-all shadow-sm hover:surface-card dark:hover:surface-card"
 />
 <button
 onClick={addRequirement}
 className="px-4 py-2 bg-primary-light hover:bg-primary-light-hover text-white rounded-lg transition-colors"
 >
 Add
 </button>
 </div>
 </div>

 {/* What To Bring */}
 <div>
 <h4 className="text-sm font-semibold text-theme-primary mb-2">
 What to Bring
 </h4>
 <div className="space-y-2 mb-3">
 {formData.whatToBring.map((item, index) => (
 <div key={index} className="flex items-center justify-between p-2 surface-section rounded-lg">
 <span className="text-sm text-theme-secondary">{item}</span>
 <button
 onClick={() => removeThing(index)}
 className="text-danger-red hover:text-red-700"
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
 onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addThing())}
 placeholder=""
 className="flex-1 px-3 py-2.5 surface-section border-2 border-theme rounded-lg text-theme-primary focus:outline-none focus:border-primary-light dark:border-primary-dark focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20 transition-all shadow-sm hover:surface-card dark:hover:surface-card"
 />
 <button
 onClick={addThing}
 className="px-4 py-2 bg-primary-light hover:bg-primary-light-hover text-white rounded-lg transition-colors"
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
 } as any;

 // Map backend 'media' to frontend 'gallery'
 if (initialData && (initialData as any).media) {
 base.gallery = (initialData as any).media.map((m: any) => ({
 id: m.id.toString(),
 type: (m.mediaType || 'IMAGE').toLowerCase() === 'video' ? 'video' : 'image',
 url: m.url,
 caption: m.caption || ''
 }));
 }

 // Initialize category from backend
  if (initialData && initialData.category) {
    base.category = initialData.category;
  } else if (!isEditing) {
    base.category = 'historical';
  }

 // Deriving tourType from isRecurring
 if (initialData && (initialData as any).isRecurring !== undefined) {
 base.tourType = (initialData as any).isRecurring ? 'recurring' : 'one-time';
 }

 // Map halalFriendly to isHalalCertified
 if (initialData && (initialData as any).halalFriendly !== undefined) {
 base.isHalalCertified = (initialData as any).halalFriendly;
 }

 // Map locationName to city (backend uses locationName as a general field)
 if (initialData && (initialData as any).locationName) {
 base.city = (initialData as any).locationName;
 }

 // Map countryCode to country name
 if (initialData && (initialData as any).countryCode) {
 const code = (initialData as any).countryCode.toUpperCase();
 if (code === 'LB') base.country = 'Lebanon';
 else if (code === 'TR') base.country = 'Turkey';
 }

 // Map instantBook to bookingMode
 if (initialData && (initialData as any).instantBook !== undefined) {
 base.bookingMode = (initialData as any).instantBook ? 'instant' : 'request';
 base.instantBookEnabled = (initialData as any).instantBook;
 }

 // Parse JSON strings to objects/arrays
 const jsonFields = [
 'halalDetails', 'dynamicPricing', 'itinerary', 'inclusions',
 'exclusions', 'requirements', 'whatToBring', 'tags', 'languages'
 ];

 jsonFields.forEach(field => {
 const val = (initialData as any)?.[field];
 if (typeof val === 'string' && val.trim()) {
 try {
 base[field] = JSON.parse(val);
 } catch (e) {
 console.error(`Failed to parse ${field} from backend:`, e);
 }
 } else if (val && typeof val === 'object') {
 base[field] = val;
 }

 // Normalize dynamic pricing: scale decimals to percentages for UI
 if (field === 'dynamicPricing' && base[field]) {
 // Clone to prevent double-normalization if React re-runs this initializer
 const dp = { ...base[field] };
 if (dp.weekendMultiplier !== undefined && dp.weekendMultiplier <= 10) {
 dp.weekendMultiplier = Math.round(dp.weekendMultiplier * 100);
 }
 if (dp.holidayMultiplier !== undefined && dp.holidayMultiplier <= 10) {
 dp.holidayMultiplier = Math.round(dp.holidayMultiplier * 100);
 }
 base[field] = dp;
 }

 // Normalize itinerary durations to Xh Ym format
 if (field === 'itinerary' && Array.isArray(base[field])) {
 base[field] = base[field].map((item: any) => {
 let d = item.duration || '0h 0m';
 if (item.duration && (!item.duration.includes('h') || !item.duration.includes('m'))) {
 const numeric = parseInt(item.duration) || 0;
 if (item.duration.toLowerCase().includes('hour') || item.duration.toLowerCase().includes('hr')) {
 d = `${numeric}h 0m`;
 } else {
 const h = Math.floor(numeric / 60);
 const m = numeric % 60;
 d = `${h}h ${m}m`;
 }
 }
 return { ...item, duration: d };
 });
 }
 if (field === 'languages' && base[field]) {
 base.availableLanguages = base[field];
 }
 });

 // Parse specific date JSON strings
 ['recurringDates', 'excludedDates'].forEach(field => {
 const val = (initialData as any)?.[field];
 if (typeof val === 'string' && val.trim()) {
 try {
 const parsed = JSON.parse(val);
 if (Array.isArray(parsed)) {
 base[field] = parsed;
 }
 } catch (e) {
 console.error(`Failed to parse ${field} from backend:`, e);
 }
 }
 });

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
 setProfile(res)
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
 <div className="min-h-screen flex items-center justify-center surface-section">
 <div className="flex flex-col items-center gap-4">
 <div className="w-10 h-10 border-4 border-primary-light dark:border-primary-dark border-t-transparent rounded-full animate-spin" />
 <p className="text-sm font-medium text-theme-muted animate-pulse">Verifying access...</p>
 </div>
 </div>
 )
 }

 // If not verified, block tour creation (unless editing an already existing tour? 
 // No, the user wants it blocked from creating. If it's editing a draft, maybe allow? 
 // But submission should definitely be blocked.)
 if (!isEditing && !isVerified) {
 return (
 <div className="min-h-screen pt-24 pb-12 px-4 surface-section flex items-center justify-center">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="max-w-md w-full surface-card border border-theme rounded-3xl p-8 text-center shadow-xl"
 >
 <div className="w-16 h-16 bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
 <Shield className="w-8 h-8 text-accent-light dark:text-accent-dark dark:text-amber-400" />
 </div>
 <h2 className="text-2xl font-bold text-theme-primary mb-2">Verification Required</h2>
 <p className="text-theme-muted mb-8 leading-relaxed">
 To create and manage tours, you need to complete a few verification steps first.
 This helps us maintain a high-trust marketplace.
 </p>

 <div className="space-y-3 mb-8">
 <div className={`flex items-center justify-between p-3 rounded-xl border ${user?.emailVerified ? 'bg-success-green/10 dark:bg-emerald-950/20 border-success-green dark:border-success-green/30' : 'surface-section border-theme'}`}>
 <div className="flex items-center gap-3">
 <div className={`w-2 h-2 rounded-full ${user?.emailVerified ? 'bg-success-green' : 'surface-section'}`} />
 <span className="text-sm font-medium">Email Verification</span>
 </div>
 {!user?.emailVerified && <Link href="/auth/email-verification" className="text-xs font-bold text-primary-light dark:text-primary-dark">Complete</Link>}
 </div>

 <div className={`flex items-center justify-between p-3 rounded-xl border ${user?.profileCompleted ? 'bg-success-green/10 dark:bg-emerald-950/20 border-success-green dark:border-success-green/30' : 'surface-section border-theme'}`}>
 <div className="flex items-center gap-3">
 <div className={`w-2 h-2 rounded-full ${user?.profileCompleted ? 'bg-success-green' : 'surface-section'}`} />
 <span className="text-sm font-medium">Profile Completion</span>
 </div>
 {!user?.profileCompleted && <Link href="/dashboard/guide/complete-profile" className="text-xs font-bold text-primary-light dark:text-primary-dark">Complete</Link>}
 </div>

 <div className={`flex items-center justify-between p-3 rounded-xl border ${profile?.verificationStatus === 'approved' ? 'bg-success-green/10 dark:bg-emerald-950/20 border-success-green dark:border-success-green/30' : 'surface-section border-theme'}`}>
 <div className="flex items-center gap-3">
 <div className={`w-2 h-2 rounded-full ${profile?.verificationStatus === 'approved' ? 'bg-success-green' : 'surface-section'}`} />
 <span className="text-sm font-medium text-left">
 ID Verification
 {profile?.verificationStatus === 'pending' && <span className="block text-[10px] text-accent-light dark:text-accent-dark font-bold capitalize tracking-normal mt-0.5">Under Review</span>}
 </span>
 </div>
 {profile?.verificationStatus === 'not_submitted' && <Link href="/dashboard/guide/verification" className="text-xs font-bold text-primary-light dark:text-primary-dark">Start</Link>}
 </div>
 </div>

 <button
 onClick={() => router.push('/dashboard/guide')}
 className="w-full py-4 surface-base text-white rounded-2xl font-bold hover:opacity-90 transition"
 >
 Back to Dashboard
 </button>
 </motion.div>
 </div>
 )
 }

 const handleChange = (field: string, value: any) => {
 setFormData(prev => {
 const next = { ...prev, [field]: value };
 
 // If switching to recurring, ensure we have a pattern (default to weekly)
 if (field === 'tourType' && value === 'recurring') {
 if (!next.recurrencePattern || next.recurrencePattern === 'none' as any) {
 next.recurrencePattern = 'weekly';
 }
 }
 
 return next;
 });
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
 // Only enforce future date on NEW tours. 
 // For editing, allow the date to be in the past (it might be an old template).
 if (!isEditing && start < new Date()) {
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
 category: formData.category || 'historical',
 locationName: formData.city, // Backend calls it locationName
 city: formData.city,
 countryCode: formData.country?.toLowerCase() === 'lebanon' ? 'LB' : 'TR',
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
 isFamilyFriendly: formData.isFamilyFriendly !== undefined ? formData.isFamilyFriendly : false,
 dynamicPricing: JSON.stringify({
 ...formData.dynamicPricing,
 weekendMultiplier: (formData.dynamicPricing.weekendMultiplier || 100) / 100,
 holidayMultiplier: (formData.dynamicPricing.holidayMultiplier || 100) / 100
 }),
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

 const tour = tourResponse

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
 displayOrder: i,
 caption: m.caption
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
 category: formData.category || 'historical',
 locationName: formData.city,
 city: formData.city,
 countryCode: formData.country?.toLowerCase() === 'lebanon' ? 'LB' : 'TR',
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
 isFamilyFriendly: formData.isFamilyFriendly !== undefined ? formData.isFamilyFriendly : false,
 dynamicPricing: JSON.stringify({
 ...formData.dynamicPricing,
 weekendMultiplier: (formData.dynamicPricing.weekendMultiplier || 100) / 100,
 holidayMultiplier: (formData.dynamicPricing.holidayMultiplier || 100) / 100
 }),
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

 const tour = tourResponse

 // 2. Upload media
 if (formData.gallery.length > 0) {
 for (let i = 0; i < formData.gallery.length; i++) {
 const m = formData.gallery[i]
 if (m.id.startsWith('temp-')) {
 await addTourMedia(tour.id, {
 url: m.url,
 mediaType: m.type.toUpperCase(),
 displayOrder: i,
 caption: m.caption
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
 <div className="pt-14 sm:pt-16 min-h-screen surface-base">

 <div className="container-safe mx-auto max-w-4xl py-8 sm:py-10">

  {/* Status Banner for Pending Review */}
  {isEditing && formData.status === 'pending_review' && (
    <div className="mb-8 p-4 sm:p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl shadow-orange-500/5">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-orange-500/20 rounded-xl shrink-0">
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
        </div>
        <div className="min-w-0">
          <p className="text-base sm:text-lg font-bold text-orange-500 capitalize tracking-tight">
            Tour is Under Review
          </p>
          <p className="text-xs sm:text-sm text-theme-muted mt-1 font-bold leading-relaxed">
            Locked for editing while our team reviews it.
            You can withdraw it back to draft mode.
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
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20 rounded-xl text-[10px] font-bold capitalize tracking-normal transition-all shadow-lg active:scale-95 shrink-0"
      >
        <Undo2 className="w-4 h-4" />
        Withdraw to Edit
      </button>
    </div>
  )}

  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
    <div className="flex items-center gap-4 sm:gap-5">
      <button
        onClick={() => router.back()}
        className="p-2.5 sm:p-3 surface-card border border-theme rounded-xl hover:surface-section transition-all text-theme-secondary shadow-lg active:scale-95 shrink-0"
        title="Go Back"
      >
        <Undo2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-4xl font-bold text-theme-primary tracking-tight leading-tight mb-1">
          {isEditing ? 'Edit' : 'Create'} <span className="text-primary-light">Tour</span>.
        </h1>
        <p className="text-[10px] sm:text-xs text-theme-muted font-bold capitalize tracking-[0.15em] truncate">
          {isEditing ? 'Refine your masterpiece' : 'Craft a new legend'}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 sm:gap-3">
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 surface-card text-theme-secondary text-[10px] font-bold capitalize tracking-normal rounded-xl border border-theme transition-all shadow-xl active:scale-95 disabled:opacity-50"
      >
        Save Draft
      </button>
      <button
        onClick={handleSendForReview}
        disabled={isSaving || (isEditing && formData.status !== 'draft' && formData.status !== 'rejected')}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-primary-light hover:bg-primary-light-hover text-white text-[10px] font-bold capitalize tracking-normal rounded-xl transition-all shadow-xl shadow-primary-light/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        <span className="truncate">{isSaving ? 'Sending...' : 'Publish'}</span>
      </button>
    </div>
 </div>


  {/* Edit/Preview Tabs */}
  <div className="flex gap-2 sm:gap-3 mb-8 sm:mb-10">
    <button
      onClick={() => setActiveTab('edit')}
      className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-bold capitalize tracking-normal transition-all shadow-lg ${activeTab === 'edit' ? 'bg-primary-light text-white shadow-primary-light/20 scale-105' : 'surface-card border border-theme text-theme-secondary hover:surface-section'} `}
    >
      Configuration
    </button>
    <button
      onClick={() => setActiveTab('preview')}
      className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-bold capitalize tracking-normal transition-all shadow-lg ${activeTab === 'preview' ? 'bg-primary-light text-white shadow-primary-light/20 scale-105' : 'surface-card border border-theme text-theme-secondary hover:surface-section'} `}
    >
      Live Preview
    </button>
  </div>

 {/* Edit Form */}
 {activeTab === 'edit' && (
 <div className="space-y-4">
 <BasicInfoSection formData={formData} onChange={handleChange} />
 <TourLocationSection formData={formData} onChange={handleChange} />
 <ItinerarySection formData={formData} onChange={handleChange} />
 <MediaSection formData={formData} onChange={handleChange} />
 <CapacitySection formData={formData} onChange={handleChange} />
 <ScheduleSection formData={formData} onChange={handleChange} />
 <PricingSection formData={formData} onChange={handleChange} />
 <HalalSection formData={formData} onChange={handleChange} />
 <LanguagesSection formData={formData} onChange={handleChange} />
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
 <div className="surface-card border border-theme rounded-xl p-6">
 <h2 className="text-xl font-bold text-theme-primary mb-4">
 {formData.title || 'Untitled Tour'}
 </h2>
 <p className="text-theme-secondary mb-4">
 {formData.description || 'No description provided'}
 </p>
 <div className="space-y-2 text-sm">
 <div className="flex items-center gap-2">
 <MapPin className="w-4 h-4 text-theme-muted" />
 <span>{formData.city || 'City not set'}, {formData.country || 'Country not set'}</span>
 </div>
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-theme-muted" />
 <span>{formData.minCapacity} - {formData.maxCapacity} people</span>
 </div>
 <div className="flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-theme-muted" />
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
 isFamilyFriendly: false,

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
