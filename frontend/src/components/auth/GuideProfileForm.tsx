// ============================================================================
// GUIDE PROFILE FORM - STEP 3 (GUIDE)
// ============================================================================
// LOCATION: /frontend/src/components/auth/GuideProfileForm.tsx
// 
// PURPOSE: Collect guide-specific information for professional profile
// 
// BUSINESS REQUIREMENTS:
// ✓ Bio/description for profile page
// ✓ Languages spoken with proficiency levels
// ✓ Areas of expertise/specialization
// ✓ Impact score preparation data
// 
// FEATURES:
// - Rich text bio with character counter
// - Language selection with proficiency dropdowns
// - Expertise tags (add/remove)
// - Real-time validation
// - Responsive design
// - Dual theme support
// - API-ready data structure
// ============================================================================

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
 User,
 Globe,
 Award,
 Plus,
 X,
 CheckCircle,
 AlertCircle,
 ChevronDown,
 Star,
 MessageSquare,
 Users,
 Clock
} from 'lucide-react'
import { useSignup } from '@/src/lib/contexts/SignupContext'
import { LanguageProficiency, LanguageProficiencyLabels } from '@/src/types/auth.types'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GuideProfileFormProps {
 /** Callback when form is successfully completed */
 onNext: () => void
 /** Callback to go back to previous step */
 onBack: () => void
}

// ============================================================================
// CONSTANTS - Languages & Proficiency Levels
// ============================================================================

const LANGUAGES = [
 { code: 'en', name: 'English', native: 'English' },
 { code: 'ar', name: 'Arabic', native: 'العربية' },
 { code: 'tr', name: 'Turkish', native: 'Türkçe' },
 { code: 'fr', name: 'French', native: 'Français' },
 { code: 'es', name: 'Spanish', native: 'Español' },
 { code: 'de', name: 'German', native: 'Deutsch' },
 { code: 'it', name: 'Italian', native: 'Italiano' },
 { code: 'ru', name: 'Russian', native: 'Русский' },
 { code: 'zh', name: 'Chinese', native: '中文' },
 { code: 'ja', name: 'Japanese', native: '日本語' },
 { code: 'ko', name: 'Korean', native: '한국어' },
 { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
 { code: 'ur', name: 'Urdu', native: 'اردو' },
 { code: 'fa', name: 'Persian', native: 'فارسی' },
 { code: 'he', name: 'Hebrew', native: 'עברית' },
 { code: 'el', name: 'Greek', native: 'Ελληνικά' },
 { code: 'nl', name: 'Dutch', native: 'Nederlands' },
 { code: 'pt', name: 'Portuguese', native: 'Português' },
 { code: 'sv', name: 'Swedish', native: 'Svenska' },
 { code: 'da', name: 'Danish', native: 'Dansk' },
 { code: 'no', name: 'Norwegian', native: 'Norsk' },
 { code: 'fi', name: 'Finnish', native: 'Suomi' },
 { code: 'pl', name: 'Polish', native: 'Polski' },
 { code: 'cs', name: 'Czech', native: 'Čeština' },
 { code: 'hu', name: 'Hungarian', native: 'Magyar' },
].sort((a, b) => a.name.localeCompare(b.name))

const PROFICIENCY_LEVELS = [
 { value: LanguageProficiency.BEGINNER, label: LanguageProficiencyLabels[LanguageProficiency.BEGINNER], description: 'Basic conversational skills' },
 { value: LanguageProficiency.INTERMEDIATE, label: LanguageProficiencyLabels[LanguageProficiency.INTERMEDIATE], description: 'Can lead tours with preparation' },
 { value: LanguageProficiency.ADVANCED, label: LanguageProficiencyLabels[LanguageProficiency.ADVANCED], description: 'Fluent, can handle complex topics' },
 { value: LanguageProficiency.NATIVE, label: LanguageProficiencyLabels[LanguageProficiency.NATIVE], description: 'Native or bilingual proficiency' },
]

const EXPERTISE_SUGGESTIONS = [
 'Historical Sites',
 'Cultural Tours',
 'Food & Culinary',
 'Adventure Tourism',
 'Halal Tourism',
 'Family Tours',
 'Photography Tours',
 'Nature & Wildlife',
 'Religious Sites',
 'Shopping Tours',
 'Architecture',
 'Museums',
 'Desert Safaris',
 'Beach Activities',
 'Hiking & Trekking',
 'City Tours',
 'Sunset Cruises',
 'Hot Air Balloons',
 'Scuba Diving',
 'Cooking Classes',
]

// ============================================================================
// LANGUAGE SELECTOR COMPONENT
// ============================================================================

interface LanguageSelectorProps {
 onAdd: (language: string, proficiency: LanguageProficiency) => void
 existingLanguages: string[]
}

function LanguageSelector({ onAdd, existingLanguages }: LanguageSelectorProps) {
 const [selectedLanguage, setSelectedLanguage] = useState<string>('')
 const [selectedProficiency, setSelectedProficiency] = useState<LanguageProficiency>(LanguageProficiency.INTERMEDIATE)
 const [isOpen, setIsOpen] = useState(false)

 const availableLanguages = LANGUAGES.filter(
 lang => !existingLanguages.includes(lang.name)
 )

 const handleAdd = () => {
 if (selectedLanguage) {
 onAdd(selectedLanguage, selectedProficiency)
 setSelectedLanguage('')
 setSelectedProficiency(LanguageProficiency.INTERMEDIATE)
 setIsOpen(false)
 }
 }

 return (
 <div className="space-y-3">
 {/* Add Language Button */}
 <button
 type="button"
 onClick={() => setIsOpen(!isOpen)}
 className="
 w-full
 flex items-center justify-center gap-2
 px-4 py-3
 border-2 border-dashed border-theme-strong
 rounded-xl
 text-sm font-medium
 text-theme-secondary hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:text-primary-dark
 transition-all
"
 >
 <Plus className="w-4 h-4" />
 Add a Language
 </button>

 {/* Language Selection Form */}
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="p-4 surface-section rounded-xl border border-theme space-y-3"
 >
 {/* Language Dropdown */}
 <div>
 <label className="block text-xs font-medium text-theme-muted mb-1">
 Language
 </label>
 <Listbox value={selectedLanguage} onChange={setSelectedLanguage}>
 <div className="relative">
 <ListboxButton className="
 relative w-full
 flex items-center justify-between
 px-4 py-2.5
 surface-card
 border border-theme-strong
 rounded-lg
 text-sm text-left
 text-theme-primary
 hover:border-primary-light dark:hover:border-primary-dark
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20
 transition-all
">
 <span className="block truncate">
 {selectedLanguage || 'Select a language'}
 </span>
 <ChevronDown className="w-4 h-4 text-theme-muted" />
 </ListboxButton>

 <Transition
 leave="transition ease-in duration-100"
 leaveFrom="opacity-100"
 leaveTo="opacity-0"
 >
 <ListboxOptions className="
 absolute z-20 mt-1 w-full
 max-h-60 overflow-auto
 surface-card
 border border-theme
 rounded-lg
 shadow-lg
 focus:outline-none
" modal={false} /* Prevent dropdown from blocking the scroll*/>
 {availableLanguages.map((lang) => (
 <ListboxOption
 key={lang.code}
 value={lang.name}
 className={({ focus, selected }) => `
 relative cursor-default select-none
 py-2.5 pl-4 pr-4
 ${focus ? 'bg-primary-light/10 ' : ''}
 ${selected ? 'font-semibold' : ''}
 `}
 >
 {({ selected }) => (
 <div className="flex items-center justify-between">
 <span className={selected ? 'text-primary-light dark:text-primary-dark' : 'text-theme-primary'}>
 {lang.name}
 </span>
 <span className="text-xs text-theme-muted ">
 {lang.native}
 </span>
 </div>
 )}
 </ListboxOption>
 ))}
 </ListboxOptions>
 </Transition>
 </div>
 </Listbox>
 </div>

 {/* Proficiency Dropdown */}
 <div>
 <label className="block text-xs font-medium text-theme-muted mb-1">
 Proficiency Level
 </label>
 <Listbox value={selectedProficiency} onChange={setSelectedProficiency}>
 <div className="relative">
 <ListboxButton className="
 relative w-full
 flex items-center justify-between
 px-4 py-2.5
 surface-card
 border border-theme-strong
 rounded-lg
 text-sm text-left
 text-theme-primary
 hover:border-primary-light dark:hover:border-primary-dark
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20
 transition-all
">
 <span className="block truncate">
 {LanguageProficiencyLabels[selectedProficiency]}
 </span>
 <ChevronDown className="w-4 h-4 text-theme-muted" />
 </ListboxButton>

 <Transition
 leave="transition ease-in duration-100"
 leaveFrom="opacity-100"
 leaveTo="opacity-0"
 >
 <ListboxOptions className="
 absolute z-20 mt-1 w-full
 surface-card
 border border-theme
 rounded-lg
 shadow-lg
 focus:outline-none
" modal={false} /* Prevent dropdown from blocking the scroll*/>
 {PROFICIENCY_LEVELS.map((level) => (
 <ListboxOption
 key={level.value}
 value={level.value}
 className={({ focus, selected }) => `
 relative cursor-default select-none
 py-2.5 px-4
 ${focus ? 'bg-primary-light/10 ' : ''}
 ${selected ? 'font-semibold' : ''}
 `}
 >
 {({ selected }) => (
 <div>
 <div className="flex items-center justify-between">
 <span className={selected ? 'text-primary-light dark:text-primary-dark' : 'text-theme-primary'}>
 {level.label}
 </span>
 {selected && (
 <CheckCircle className="w-4 h-4 text-primary-light dark:text-primary-dark" />
 )}
 </div>
 <p className="text-xs text-theme-muted mt-0.5">
 {level.description}
 </p>
 </div>
 )}
 </ListboxOption>
 ))}
 </ListboxOptions>
 </Transition>
 </div>
 </Listbox>
 </div>

 {/* Action Buttons */}
 <div className="flex gap-2 pt-2">
 <button
 type="button"
 onClick={handleAdd}
 disabled={!selectedLanguage}
 className="
 flex-1
 px-4 py-2
 bg-primary-light dark:bg-primary-dark
 text-white text-sm font-medium
 rounded-lg
 hover:bg-primary-light-hover dark:hover:bg-primary-light-hover
 transition-colors
 disabled:opacity-50 disabled:cursor-not-allowed
"
 >
 Add Language
 </button>
 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="
 px-4 py-2
 surface-section
 text-theme-secondary text-sm font-medium
 rounded-lg
 hover:surface-section dark:hover:surface-section
 transition-colors
"
 >
 Cancel
 </button>
 </div>
 </motion.div>
 )}
 </div>
 )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GuideProfileForm({ onNext, onBack }: GuideProfileFormProps) {
 const { data, errors, updateField, addLanguage, removeLanguage, addExpertise, removeExpertise, isLoading } = useSignup()
 
 // ========================================
 // LOCAL STATE
 // ========================================
 const [touched, setTouched] = useState<Record<string, boolean>>({})
 const [newExpertise, setNewExpertise] = useState('')
 const [showSuggestions, setShowSuggestions] = useState(false)

 // ========================================
 // HANDLERS
 // ========================================

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
 const { name, value } = e.target
 updateField(name as keyof typeof data, value)
 }

 const handleBlur = (field: string) => {
 setTouched(prev => ({ ...prev, [field]: true }))
 }

 const handleAddExpertise = () => {
 if (newExpertise.trim()) {
 addExpertise(newExpertise.trim())
 setNewExpertise('')
 setShowSuggestions(false)
 }
 }

 const handleAddSuggestion = (suggestion: string) => {
 addExpertise(suggestion)
 }

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter') {
 e.preventDefault()
 handleAddExpertise()
 }
 }

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault()
 console.log('Submitting guide profile form with data:', data)
 // Mark all fields as touched
 setTouched({
 bio: true,
 languages: true,
 expertise: true
 })

 // Check if there are any errors
 // Check if fields are valid
const isBioValid = data.bio && data.bio.length >= 50
const isLanguagesValid = data.languages && data.languages.length > 0
const isExpertiseValid = data.expertise && data.expertise.length > 0

const isValid = isBioValid && isLanguagesValid && isExpertiseValid

console.log('🔍 Guide Profile validation:', {
 isBioValid,
 isLanguagesValid,
 isExpertiseValid,
 isValid,
 data: {
 bio: data.bio,
 bioLength: data.bio?.length,
 languagesCount: data.languages?.length,
 expertiseCount: data.expertise?.length
 }
})

if (isValid) {
 console.log('✅ Guide Profile valid, calling onNext()')
 onNext()
} else {
 console.log('❌ Guide Profile has errors')
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
 <div className="surface-card rounded-2xl border border-theme shadow-xl p-6 sm:p-8">
 
 {/* ========================================
 FORM HEADER
 ======================================== */}
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
 <Award className="w-8 h-8 text-amber-600 dark:text-amber-400" />
 </div>
 <h2 className="text-2xl font-bold text-theme-primary mb-2">
 Complete Your Guide Profile
 </h2>
 <p className="text-sm text-theme-secondary ">
 Tell travelers about yourself and your expertise
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 
 {/* ========================================
 BIO FIELD
 ======================================== */}
 <div className="space-y-1.5">
 <label
 htmlFor="bio"
 className="block text-sm font-medium text-theme-secondary"
 >
 Bio / About You <span className="text-danger-red">*</span>
 </label>
 <div className="relative">
 <User className="absolute left-3 top-3 w-4 h-4 text-theme-muted" />
 <textarea
 id="bio"
 name="bio"
 value={data.bio || ''}
 onChange={handleChange}
 onBlur={() => handleBlur('bio')}
 disabled={isLoading}
 rows={5}
 placeholder="Tell travelers about yourself, your experience, and what makes your tours special..."
 className={`
 w-full pl-9 pr-3 py-2.5
 surface-section
 border rounded-lg
 text-sm text-theme-primary
 placeholder-gray-500 dark:placeholder-gray-400
 focus:outline-none focus:ring-2
 transition-all
 resize-none
 ${errors.bio && touched.bio
 ? 'border-danger-red focus:ring-danger-red/20'
 : data.bio && !errors.bio && data.bio.length >= 50
 ? 'border-success-green focus:ring-success-green/20'
 : 'border-theme-strong focus:ring-primary-light dark:ring-primary-dark/20 focus:border-primary-light dark:border-primary-dark'
 }
 disabled:opacity-50 disabled:cursor-not-allowed
 `}
 />
 </div>
 
 {/* Character Counter */}
 <div className="flex items-center justify-between text-xs">
 <span className={`
 ${(data.bio?.length || 0) >= 50
 ? 'text-success-green dark:text-emerald-400'
 : 'text-theme-muted '
 }
 `}>
 {(data.bio?.length || 0)}/50 minimum characters
 </span>
 {(data.bio?.length || 0) >= 50 && (
 <span className="flex items-center gap-1 text-success-green dark:text-emerald-400">
 <CheckCircle className="w-3 h-3" />
 Minimum reached
 </span>
 )}
 </div>

 {errors.bio && touched.bio && (
 <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
 <AlertCircle className="w-3 h-3" />
 {errors.bio}
 </p>
 )}
 </div>

 {/* ========================================
 LANGUAGES SECTION
 ======================================== */}
 <div className="space-y-3">
 <label className="block text-sm font-medium text-theme-secondary">
 Languages You Speak <span className="text-danger-red">*</span>
 </label>
 
 {/* Language List */}
 {data.languages && data.languages.length > 0 && (
 <div className="space-y-2 mb-3">
 {data.languages.map((lang, index) => (
 <div
 key={index}
 className="
 flex items-center justify-between
 p-3
 surface-section
 border border-theme
 rounded-lg
 group
"
 >
 <div className="flex items-center gap-3">
 <Globe className="w-4 h-4 text-primary-light dark:text-primary-dark" />
 <div>
 <span className="text-sm font-medium text-theme-primary">
 {lang.language}
 </span>
 <span className="ml-2 text-xs px-2 py-0.5 surface-section text-theme-secondary rounded-full">
 {LanguageProficiencyLabels[lang.proficiency]}
 </span>
 </div>
 </div>
 <button
 type="button"
 onClick={() => removeLanguage(index)}
 className="
 p-1
 text-theme-muted hover:text-red-600
 dark:hover:text-red-400
 transition-colors
 opacity-0 group-hover:opacity-100
"
 aria-label="Remove language"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}

 {/* Language Selector */}
 <LanguageSelector
 onAdd={addLanguage}
 existingLanguages={data.languages?.map(l => l.language) || []}
 />

 {errors.languages && touched.languages && (
 <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
 <AlertCircle className="w-3 h-3" />
 {errors.languages}
 </p>
 )}
 </div>

 {/* ========================================
 EXPERTISE SECTION
 ======================================== */}
 <div className="space-y-3">
 <label className="block text-sm font-medium text-theme-secondary">
 Areas of Expertise <span className="text-danger-red">*</span>
 </label>

 {/* Expertise Tags */}
 {data.expertise && data.expertise.length > 0 && (
 <div className="flex flex-wrap gap-2 mb-3">
 {data.expertise.map((item, index) => (
 <span
 key={index}
 className="
 inline-flex items-center gap-1.5
 px-3 py-1.5
 bg-primary-light/10
 text-blue-700 dark:text-blue-300
 text-sm
 rounded-full
 group
"
 >
 {item}
 <button
 type="button"
 onClick={() => removeExpertise(index)}
 className="
 p-0.5
 hover:bg-blue-200 dark:hover:bg-primary-light-hover
 rounded-full
 transition-colors
"
 aria-label="Remove expertise"
 >
 <X className="w-3 h-3" />
 </button>
 </span>
 ))}
 </div>
 )}

 {/* Add Expertise Input */}
 <div className="relative">
 <input
 type="text"
 value={newExpertise}
 onChange={(e) => {
 setNewExpertise(e.target.value)
 setShowSuggestions(true)
 }}
 onKeyDown={handleKeyDown}
 onFocus={() => setShowSuggestions(true)}
 placeholder="e.g., Ottoman History, Islamic Architecture, Food Tours"
 className="
 w-full
 px-4 py-2.5
 surface-section
 border border-theme-strong
 rounded-lg
 text-sm text-theme-primary
 placeholder-gray-500 dark:placeholder-gray-400
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20 focus:border-primary-light dark:border-primary-dark
 transition-all
"
 />
 
 {/* Add Button */}
 {newExpertise && (
 <button
 type="button"
 onClick={handleAddExpertise}
 className="
 absolute right-2 top-1/2 -translate-y-1/2
 p-1.5
 bg-primary-light dark:bg-primary-dark
 text-white
 rounded-lg
 hover:bg-primary-light-hover dark:hover:bg-primary-light-hover
 transition-colors
"
 >
 <Plus className="w-4 h-4" />
 </button>
 )}
 </div>

 {/* Suggestions Dropdown */}
 {showSuggestions && newExpertise.length > 0 && (
 <div className="
 absolute z-10
 mt-1 w-full max-w-md
 surface-card
 border border-theme
 rounded-lg
 shadow-lg
 p-2
">
 <p className="text-xs text-theme-muted mb-2 px-2">
 Suggestions:
 </p>
 <div className="flex flex-wrap gap-2">
 {EXPERTISE_SUGGESTIONS
 .filter(s => 
 s.toLowerCase().includes(newExpertise.toLowerCase()) &&
 !data.expertise?.includes(s)
 )
 .slice(0, 5)
 .map(suggestion => (
 <button
 key={suggestion}
 type="button"
 onClick={() => handleAddSuggestion(suggestion)}
 className="
 px-2 py-1
 surface-section
 text-theme-secondary
 text-xs
 rounded-full
 hover:surface-section dark:hover:surface-section
 transition-colors
"
 >
 {suggestion}
 </button>
 ))
 }
 </div>
 </div>
 )}

 {errors.expertise && touched.expertise && (
 <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
 <AlertCircle className="w-3 h-3" />
 {errors.expertise}
 </p>
 )}
 </div>

 {/* ========================================
 PREVIEW CARD (Visual feedback)
 ======================================== */}
 {(data.bio || data.languages?.length || data.expertise?.length) && (
 <div className="
 p-4
 bg-gradient-to-br from-blue-50 to-indigo-50
 dark:from-blue-950/30 dark:to-indigo-950/30
 border border-primary-light dark:border-primary-dark
 rounded-xl
">
 <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
 <Star className="w-4 h-4" />
 Your Profile Preview
 </h4>
 <div className="space-y-2 text-sm">
 {data.bio && (
 <p className="text-blue-800 dark:text-blue-200 line-clamp-2">
"{data.bio.substring(0, 100)}..."
 </p>
 )}
 <div className="flex items-center gap-4 text-blue-700 dark:text-blue-300">
 {data.languages && data.languages.length > 0 && (
 <span className="flex items-center gap-1">
 <Globe className="w-3 h-3" />
 {data.languages.length} languages
 </span>
 )}
 {data.expertise && data.expertise.length > 0 && (
 <span className="flex items-center gap-1">
 <Award className="w-3 h-3" />
 {data.expertise.length} expertise areas
 </span>
 )}
 </div>
 </div>
 </div>
 )}

 {/* ========================================
 FORM ACTIONS
 ======================================== */}
 <div className="flex gap-3 pt-6">
 <button
 type="button"
 onClick={onBack}
 className="
 flex-1
 px-4 py-2.5
 surface-section
 text-theme-secondary
 font-medium
 rounded-lg
 hover:surface-section dark:hover:surface-section
 transition-colors
 focus:outline-none focus:ring-2 focus:ring-gray-500/20
"
 >
 Back
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
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20
"
 >
 Continue
 </button>
 </div>

 {/* ========================================
 IMPORTANCE NOTE
 ======================================== */}
 <p className="text-xs text-center text-theme-muted pt-4">
 <MessageSquare className="inline w-3 h-3 mr-1" />
 A complete profile helps you stand out and build trust with travelers
 </p>
 </form>
 </div>
 
 </motion.div>
 )
}