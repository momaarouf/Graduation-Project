// ============================================================================
// TRAVELER PROFILE FORM - STEP 3 (TRAVELER)
// ============================================================================
// LOCATION: /frontend/src/components/auth/TravelerProfileForm.tsx
// 
// PURPOSE: Collect traveler-specific information after account creation
// 
// BUSINESS REQUIREMENTS:
// ✓ Phone number for emergency contact
// ✓ Nationality for demographic insights
// ✓ Date of birth for age verification (if needed)
// ✓ Travel preferences (optional)
// 
// FEATURES:
// - Phone number validation with country code
// - Country selector for nationality
// - Date picker with age validation
// - Preference toggles for travel style
// - All fields optional (travelers can skip)
// - Dual theme support
// - Responsive design
// ============================================================================

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Phone,
    Globe,
    Calendar,
    Heart,
    Users,
    Camera,
    Utensils,
    Landmark,
    Mountain,
    ShoppingBag,
    CheckCircle,
    AlertCircle,
    ChevronDown
} from 'lucide-react'
import { useSignup } from '@/src/lib/contexts/SignupContext'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TravelerProfileFormProps {
    /** Callback when form is successfully completed */
    onNext: () => void
    /** Callback to go back to previous step */
    onBack: () => void
}

// ============================================================================
// CONSTANTS - Travel Preferences
// ============================================================================

const NATIONALITIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'BE', name: 'Belgium' },
    { code: 'AT', name: 'Austria' },
    { code: 'IE', name: 'Ireland' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'SG', name: 'Singapore' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'AE', name: 'UAE' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'QA', name: 'Qatar' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'OM', name: 'Oman' },
    { code: 'JO', name: 'Jordan' },
    { code: 'EG', name: 'Egypt' },
    { code: 'MA', name: 'Morocco' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'TR', name: 'Turkey' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'IN', name: 'India' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'KE', name: 'Kenya' },
].sort((a, b) => a.name.localeCompare(b.name))

const TRAVEL_PREFERENCES = [
    { id: 'cultural', label: 'Cultural Tours', icon: Landmark, description: 'History, museums, heritage sites' },
    { id: 'adventure', label: 'Adventure', icon: Mountain, description: 'Hiking, outdoor activities' },
    { id: 'food', label: 'Food & Culinary', icon: Utensils, description: 'Cooking classes, food tours' },
    { id: 'family', label: 'Family Friendly', icon: Users, description: 'Activities suitable for children' },
    { id: 'photography', label: 'Photography', icon: Camera, description: 'Scenic spots, golden hour tours' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, description: 'Markets, souks, boutiques' },
    { id: 'religious', label: 'Religious Tours', icon: Heart, description: 'Mosques, spiritual sites' },
    { id: 'nature', label: 'Nature & Wildlife', icon: Mountain, description: 'Parks, reserves, animals' },
] as const

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TravelerProfileForm({ onNext, onBack }: TravelerProfileFormProps) {
    const { data, errors, updateField, updateMultipleFields, isLoading } = useSignup()
    
    // ========================================
    // LOCAL STATE
    // ========================================
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])

    // ========================================
    // HANDLERS
    // ========================================

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        updateField(name as keyof typeof data, value)
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
    }

    const handlePreferenceToggle = (prefId: string) => {
        setSelectedPreferences(prev => {
            const newPrefs = prev.includes(prefId)
                ? prev.filter(id => id !== prefId)
                : [...prev, prefId]
            
            // Update in context (you can store this in expertise field for now)
            updateField('expertise', newPrefs)
            
            return newPrefs
        })
    }

    const handleSkip = () => {
        // Mark as touched to show validation but allow skip
        onNext()
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        // Mark all fields as touched
        setTouched({
            phone: true,
            nationality: true,
            dateOfBirth: true
        })

        // Check if there are any errors
        const hasErrors = Object.keys(errors).some(key =>
            ['phone', 'nationality', 'dateOfBirth'].includes(key)
        )

        if (!hasErrors) {
            onNext()
        }
    }

    // ========================================
    // RENDER
    // ========================================

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl mx-auto"
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-6 sm:p-8">
                
                {/* ========================================
                    FORM HEADER
                    ======================================== */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Heart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Tell Us About Yourself
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Help us personalize your experience (all fields optional)
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* ========================================
                        PHONE NUMBER FIELD
                        ======================================== */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Phone Number <span className="text-gray-400">(optional)</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={data.phone || ''}
                                onChange={handleChange}
                                onBlur={() => handleBlur('phone')}
                                disabled={isLoading}
                                placeholder="+1 (555) 123-4567"
                                className={`
                                    w-full pl-9 pr-3 py-2.5
                                    bg-gray-50 dark:bg-gray-800
                                    border rounded-lg
                                    text-sm text-gray-900 dark:text-white
                                    placeholder-gray-500 dark:placeholder-gray-400
                                    focus:outline-none focus:ring-2
                                    transition-all
                                    ${errors.phone && touched.phone
                                        ? 'border-red-500 focus:ring-red-500/20'
                                        : data.phone && !errors.phone
                                            ? 'border-emerald-500 focus:ring-emerald-500/20'
                                            : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            />
                        </div>
                        {errors.phone && touched.phone && (
                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.phone}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            For emergency contact during your tours
                        </p>
                    </div>

                    {/* ========================================
                        NATIONALITY SELECTOR
                        ======================================== */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="nationality"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Nationality <span className="text-gray-400">(optional)</span>
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                            <select
                                id="nationality"
                                name="nationality"
                                value={data.nationality || ''}
                                onChange={handleChange}
                                onBlur={() => handleBlur('nationality')}
                                disabled={isLoading}
                                className={`
                                    w-full pl-9 pr-8 py-2.5
                                    bg-gray-50 dark:bg-gray-800
                                    border rounded-lg
                                    text-sm text-gray-900 dark:text-white
                                    appearance-none
                                    focus:outline-none focus:ring-2
                                    transition-all
                                    ${errors.nationality && touched.nationality
                                        ? 'border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                <option value="">Select your nationality</option>
                                {NATIONALITIES.map(country => (
                                    <option key={country.code} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* ========================================
                        DATE OF BIRTH FIELD
                        ======================================== */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="dateOfBirth"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Date of Birth <span className="text-gray-400">(optional)</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={data.dateOfBirth || ''}
                                onChange={handleChange}
                                onBlur={() => handleBlur('dateOfBirth')}
                                disabled={isLoading}
                                max={new Date().toISOString().split('T')[0]}
                                className={`
                                    w-full pl-9 pr-3 py-2.5
                                    bg-gray-50 dark:bg-gray-800
                                    border rounded-lg
                                    text-sm text-gray-900 dark:text-white
                                    focus:outline-none focus:ring-2
                                    transition-all
                                    ${errors.dateOfBirth && touched.dateOfBirth
                                        ? 'border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            />
                        </div>
                    </div>

                    {/* ========================================
                        TRAVEL PREFERENCES
                        ======================================== */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Travel Preferences <span className="text-gray-400">(optional)</span>
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                            Select the types of experiences you're interested in
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {TRAVEL_PREFERENCES.map((pref) => {
                                const Icon = pref.icon
                                const isSelected = selectedPreferences.includes(pref.id)
                                
                                return (
                                    <button
                                        key={pref.id}
                                        type="button"
                                        onClick={() => handlePreferenceToggle(pref.id)}
                                        className={`
                                            group relative
                                            flex items-start gap-3
                                            p-3
                                            border-2 rounded-lg
                                            transition-all duration-200
                                            text-left
                                            ${isSelected
                                                ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                                            ${isSelected
                                                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }
                                        `}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`
                                                text-sm font-medium mb-0.5
                                                ${isSelected
                                                    ? 'text-blue-900 dark:text-blue-100'
                                                    : 'text-gray-900 dark:text-white'
                                                }
                                            `}>
                                                {pref.label}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {pref.description}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle className="absolute top-2 right-2 w-3 h-3 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* ========================================
                        FORM ACTIONS
                        ======================================== */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="
                                flex-1
                                px-4 py-2.5
                                bg-gray-100 dark:bg-gray-800
                                text-gray-700 dark:text-gray-300
                                font-medium
                                rounded-lg
                                hover:bg-gray-200 dark:hover:bg-gray-700
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-gray-500/20
                            "
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={handleSkip}
                            className="
                                flex-1
                                px-4 py-2.5
                                bg-gray-100 dark:bg-gray-800
                                text-gray-700 dark:text-gray-300
                                font-medium
                                rounded-lg
                                hover:bg-gray-200 dark:hover:bg-gray-700
                                transition-colors
                                focus:outline-none focus:ring-2 focus:ring-gray-500/20
                            "
                        >
                            Skip for Now
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="
                                flex-1
                                px-4 py-2.5
                                bg-gradient-to-r from-blue-600 to-indigo-600
                                dark:from-blue-700 dark:to-indigo-700
                                text-white font-medium
                                rounded-lg
                                hover:from-blue-700 hover:to-indigo-700
                                dark:hover:from-blue-800 dark:hover:to-indigo-800
                                transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed
                                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                            "
                        >
                            Continue
                        </button>
                    </div>

                    {/* ========================================
                        NOTE ABOUT OPTIONAL FIELDS
                        ======================================== */}
                    <p className="text-xs text-center text-gray-500 dark:text-gray-500 pt-4">
                        All fields are optional. You can always update them later in your profile settings.
                    </p>
                </form>
            </div>
        </motion.div>
    )
}