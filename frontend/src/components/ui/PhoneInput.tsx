'use client'

import { useState, useRef, useEffect } from 'react'
import { Phone, ChevronDown } from 'lucide-react'

// ============================================================================
// COUNTRY CODES — common codes, Middle East focused
// ============================================================================

export const COUNTRY_CODES = [
 { code: '+961', country: 'LB', name: 'Lebanon', flag: '🇱🇧' },
 { code: '+90', country: 'TR', name: 'Turkey', flag: '🇹🇷' },
 { code: '+966', country: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
 { code: '+971', country: 'AE', name: 'UAE', flag: '🇦🇪' },
 { code: '+974', country: 'QA', name: 'Qatar', flag: '🇶🇦' },
 { code: '+965', country: 'KW', name: 'Kuwait', flag: '🇰🇼' },
 { code: '+973', country: 'BH', name: 'Bahrain', flag: '🇧🇭' },
 { code: '+968', country: 'OM', name: 'Oman', flag: '🇴🇲' },
 { code: '+962', country: 'JO', name: 'Jordan', flag: '🇯🇴' },
 { code: '+20', country: 'EG', name: 'Egypt', flag: '🇪🇬' },
 { code: '+964', country: 'IQ', name: 'Iraq', flag: '🇮🇶' },
 { code: '+963', country: 'SY', name: 'Syria', flag: '🇸🇾' },
 { code: '+970', country: 'PS', name: 'Palestine', flag: '🇵🇸' },
 { code: '+212', country: 'MA', name: 'Morocco', flag: '🇲🇦' },
 { code: '+216', country: 'TN', name: 'Tunisia', flag: '🇹🇳' },
 { code: '+213', country: 'DZ', name: 'Algeria', flag: '🇩🇿' },
 { code: '+1', country: 'US', name: 'United States', flag: '🇺🇸' },
 { code: '+44', country: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
 { code: '+33', country: 'FR', name: 'France', flag: '🇫🇷' },
 { code: '+49', country: 'DE', name: 'Germany', flag: '🇩🇪' },
 { code: '+39', country: 'IT', name: 'Italy', flag: '🇮🇹' },
 { code: '+34', country: 'ES', name: 'Spain', flag: '🇪🇸' },
 { code: '+31', country: 'NL', name: 'Netherlands', flag: '🇳🇱' },
 { code: '+46', country: 'SE', name: 'Sweden', flag: '🇸🇪' },
 { code: '+47', country: 'NO', name: 'Norway', flag: '🇳🇴' },
 { code: '+45', country: 'DK', name: 'Denmark', flag: '🇩🇰' },
 { code: '+358', country: 'FI', name: 'Finland', flag: '🇫🇮' },
 { code: '+41', country: 'CH', name: 'Switzerland', flag: '🇨🇭' },
 { code: '+32', country: 'BE', name: 'Belgium', flag: '🇧🇪' },
 { code: '+43', country: 'AT', name: 'Austria', flag: '🇦🇹' },
 { code: '+353', country: 'IE', name: 'Ireland', flag: '🇮🇪' },
 { code: '+61', country: 'AU', name: 'Australia', flag: '🇦🇺' },
 { code: '+64', country: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
 { code: '+1', country: 'CA', name: 'Canada', flag: '🇨🇦' },
 { code: '+91', country: 'IN', name: 'India', flag: '🇮🇳' },
 { code: '+92', country: 'PK', name: 'Pakistan', flag: '🇵🇰' },
 { code: '+880', country: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
 { code: '+60', country: 'MY', name: 'Malaysia', flag: '🇲🇾' },
 { code: '+62', country: 'ID', name: 'Indonesia', flag: '🇮🇩' },
 { code: '+65', country: 'SG', name: 'Singapore', flag: '🇸🇬' },
 { code: '+27', country: 'ZA', name: 'South Africa', flag: '🇿🇦' },
 { code: '+234', country: 'NG', name: 'Nigeria', flag: '🇳🇬' },
 { code: '+254', country: 'KE', name: 'Kenya', flag: '🇰🇪' },
 { code: '+94', country: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
 { code: '+86', country: 'CN', name: 'China', flag: '🇨🇳' },
 { code: '+81', country: 'JP', name: 'Japan', flag: '🇯🇵' },
 { code: '+82', country: 'KR', name: 'South Korea', flag: '🇰🇷' },
 { code: '+7', country: 'RU', name: 'Russia', flag: '🇷🇺' },
 { code: '+55', country: 'BR', name: 'Brazil', flag: '🇧🇷' },
 { code: '+52', country: 'MX', name: 'Mexico', flag: '🇲🇽' },
]

// ============================================================================
// COMPONENT
// ============================================================================

interface PhoneInputProps {
 value: string
 onChange: (fullE164: string) => void
 error?: string
 disabled?: boolean
}

export default function PhoneInput({ value, onChange, error, disabled }: PhoneInputProps) {
 // Parse initial value to extract country code and local number
 const findInitialCode = () => {
 if (!value) return COUNTRY_CODES[0] // Default: Lebanon
 const match = COUNTRY_CODES.find(c => value.startsWith(c.code))
 return match || COUNTRY_CODES[0]
 }

 const [selectedCountry, setSelectedCountry] = useState(findInitialCode)
 const [localNumber, setLocalNumber] = useState(() => {
 if (!value) return ''
 const initial = findInitialCode()
 return value.startsWith(initial.code) ? value.slice(initial.code.length) : value.replace(/^\+/, '')
 })
 const [isOpen, setIsOpen] = useState(false)
 const [search, setSearch] = useState('')
 const dropdownRef = useRef<HTMLDivElement>(null)

 // Close dropdown on outside click
 useEffect(() => {
 const handler = (e: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
 setIsOpen(false)
 }
 }
 document.addEventListener('mousedown', handler)
 return () => document.removeEventListener('mousedown', handler)
 }, [])

 const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const num = e.target.value.replace(/[^0-9]/g, '')
 setLocalNumber(num)
 onChange(selectedCountry.code + num)
 }

 const handleSelectCountry = (country: typeof COUNTRY_CODES[0]) => {
 setSelectedCountry(country)
 setIsOpen(false)
 setSearch('')
 onChange(country.code + localNumber)
 }

 const filtered = search
 ? COUNTRY_CODES.filter(c =>
 c.name.toLowerCase().includes(search.toLowerCase()) ||
 c.code.includes(search) ||
 c.country.toLowerCase().includes(search.toLowerCase()))
 : COUNTRY_CODES

 return (
 <div className="space-y-1">
 <label className="block text-sm font-medium text-theme-secondary">
 Phone Number <span className="text-danger-red">*</span>
 </label>
 <div className="flex gap-2" ref={dropdownRef}>
 {/* Country code selector */}
 <div className="relative">
 <button
 type="button"
 onClick={() => !disabled && setIsOpen(!isOpen)}
 disabled={disabled}
 className={`
 flex items-center gap-1.5
 px-3 py-2.5
 surface-section
 border rounded-lg
 text-sm text-theme-primary
 hover:border-primary-light dark:hover:border-primary-dark dark:hover:border-primary-light dark:hover:border-primary-dark
 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20
 transition-all
 min-w-[110px]
 ${error
 ? 'border-danger-red'
 : 'border-theme-strong'}
 disabled:opacity-50 disabled:cursor-not-allowed
 `}
 >
 <span className="text-base">{selectedCountry.flag}</span>
 <span className="font-mono text-xs">{selectedCountry.code}</span>
 <ChevronDown className="w-3 h-3 text-theme-muted ml-auto" />
 </button>

 {/* Dropdown */}
 {isOpen && (
 <div className="absolute z-50 mt-1 w-64 max-h-60 overflow-auto surface-card border border-theme rounded-lg shadow-xl">
 <div className="p-2 sticky top-0 surface-card border-b border-theme">
 <input
 type="text"
 placeholder="Search country..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 autoFocus
 className="w-full px-3 py-1.5 text-sm surface-section border border-theme rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light dark:ring-primary-dark text-theme-primary"
 />
 </div>
 {filtered.map((c, i) => (
 <button
 key={`${c.country}-${i}`}
 type="button"
 onClick={() => handleSelectCountry(c)}
 className={`
 w-full flex items-center gap-3 px-3 py-2 text-sm
 hover:bg-primary-light/10 dark:hover:surface-base
 ${selectedCountry.country === c.country && selectedCountry.code === c.code
 ? 'bg-primary-light/10 font-medium'
 : ''}
 text-left
 `}
 >
 <span className="text-base">{c.flag}</span>
 <span className="text-theme-primary flex-1">{c.name}</span>
 <span className="text-xs text-theme-muted font-mono">{c.code}</span>
 </button>
 ))}
 {filtered.length === 0 && (
 <p className="px-3 py-4 text-sm text-theme-muted text-center">No countries found</p>
 )}
 </div>
 )}
 </div>

 {/* Local number input */}
 <div className="relative flex-1">
 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type="tel"
 value={localNumber}
 onChange={handleLocalChange}
 disabled={disabled}
 placeholder="70123456"
 className={`
 w-full pl-9 pr-3 py-2.5
 surface-section
 border rounded-lg
 text-sm text-theme-primary
 placeholder-gray-500 dark:placeholder-gray-400
 focus:outline-none focus:ring-2 transition-all
 ${error
 ? 'border-danger-red focus:ring-danger-red/20'
 : 'border-theme-strong focus:ring-primary-light dark:ring-primary-dark/20 focus:border-primary-light dark:border-primary-dark'}
 disabled:opacity-50 disabled:cursor-not-allowed
 `}
 />
 </div>
 </div>
 {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
 </div>
 )
}
