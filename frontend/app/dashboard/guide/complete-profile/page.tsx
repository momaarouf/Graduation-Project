'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, SkipForward, Plus, X, Globe, Award, User as UserIcon,
  Loader2, ChevronDown, CheckCircle
} from 'lucide-react'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { guideCompleteProfile } from '@/src/lib/api/auth'
import { getGuideProfile } from '@/src/lib/api/tours'
import apiClient from '@/src/lib/api/client'
import toast from 'react-hot-toast'
import PhoneInput, { COUNTRY_CODES } from '@/src/components/ui/PhoneInput'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const LANGUAGES = [
  'Arabic', 'English', 'French', 'Turkish', 'Spanish', 'German',
  'Italian', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Hindi',
  'Persian', 'Hebrew', 'Greek', 'Dutch', 'Portuguese',
].sort()

const PROFICIENCY_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Native', label: 'Native' },
]

const EXPERTISE_SUGGESTIONS = [
  'Historical Sites', 'Cultural Tours', 'Food & Culinary', 'Adventure Tourism',
  'Halal Tourism', 'Family Tours', 'Photography Tours', 'Nature & Wildlife',
  'Religious Sites', 'Shopping Tours', 'Architecture', 'Museums',
  'Desert Safaris', 'Beach Activities', 'Hiking & Trekking', 'City Tours',
]

interface LanguageEntry {
  name: string
  proficiency: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE — uses ONLY local state (no SignupContext dependency)
// ─────────────────────────────────────────────────────────────────────────────

export default function GuideCompleteProfilePage() {
  const router = useRouter()
  const { user, isLoading, refetchUser } = useAuth()

  // Identity fields
  const [fullName, setFullName] = useState('')
  const [phoneE164, setPhoneE164] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')

  // Guide-specific fields
  const [bio, setBio] = useState('')
  const [languages, setLanguages] = useState<LanguageEntry[]>([])
  const [expertise, setExpertise] = useState<string[]>([])

  // Language adder sub-state
  const [langName, setLangName] = useState('')
  const [langProf, setLangProf] = useState('Intermediate')
  const [showLangAdder, setShowLangAdder] = useState(false)

  // Expertise adder
  const [expertiseInput, setExpertiseInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(true)

  // Role guard
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'GUIDE')) router.push('/auth/login')
  }, [user, isLoading, router])

  // Pre-fill existing profile data
  useEffect(() => {
    if (!user || user.role !== 'GUIDE') return
    const fetchProfile = async () => {
      try {
        const d = await getGuideProfile()
        if (d) {
          if (d.fullName)   setFullName(d.fullName)
          if (d.phoneE164)  setPhoneE164(d.phoneE164)
          if (d.country)    setCountry(d.country)
          if (d.city)       setCity(d.city)
          if (d.bio)        setBio(d.bio)
          if (d.languages)  setLanguages(
            d.languages.map((l: any) => ({ name: l.name ?? l.language, proficiency: l.proficiency }))
          )
          if (d.expertise)  setExpertise(d.expertise)
        }
      } catch {
        // No existing profile — use defaults; pre-fill name from Google if available
        if (user.fullName) setFullName(user.fullName)
      } finally {
        setIsFetchingData(false)
      }
    }
    fetchProfile()
  }, [user])

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!fullName.trim() || fullName.trim().length < 2) errs.fullName = 'Full name is required (min 2 chars)'
    if (!phoneE164.trim()) errs.phoneE164 = 'Phone number is required'
    else if (!/^\+[1-9]\d{7,14}$/.test(phoneE164)) errs.phoneE164 = 'Use E.164 format, e.g. +96170123456'
    if (!country.trim()) errs.country = 'Country is required'
    if (!city.trim()) errs.city = 'City is required'
    if (!bio.trim() || bio.trim().length < 30) errs.bio = 'Bio must be at least 30 characters'
    if (languages.length === 0) errs.languages = 'Add at least one language'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fill in all required fields.')
      return
    }
    setIsSubmitting(true)
    try {
      await guideCompleteProfile({
        fullName: fullName.trim(),
        phoneE164: phoneE164.trim(),
        country: country.trim(),
        city: city.trim(),
        bio: bio.trim(),
        expertise,
        languages: languages.map(l => ({ name: l.name, proficiency: l.proficiency })),
      })
      // Refresh AuthContext so profileCompleted becomes true — banner disappears
      await refetchUser()
      toast.success('Profile saved!')
      router.push('/dashboard/guide')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Language helpers ─────────────────────────────────────────────────────────
  const addLanguage = () => {
    if (!langName) return
    if (languages.find(l => l.name === langName)) { toast.error('Already added'); return }
    setLanguages(prev => [...prev, { name: langName, proficiency: langProf }])
    setLangName('')
    setLangProf('Intermediate')
    setShowLangAdder(false)
    if (errors.languages) setErrors(p => ({ ...p, languages: '' }))
  }

  const removeLanguage = (i: number) => setLanguages(prev => prev.filter((_, idx) => idx !== i))

  // ── Expertise helpers ────────────────────────────────────────────────────────
  const addExpertise = (tag: string) => {
    if (!tag.trim()) return
    if (expertise.includes(tag.trim())) return
    setExpertise(prev => [...prev, tag.trim()])
    setExpertiseInput('')
    setShowSuggestions(false)
    if (errors.expertise) setErrors(p => ({ ...p, expertise: '' }))
  }

  const removeExpertise = (i: number) => setExpertise(prev => prev.filter((_, idx) => idx !== i))

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-red-500 focus:ring-red-500/20'
        : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
    }`

  // ── Loading states ───────────────────────────────────────────────────────────
  if (isLoading || isFetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
        <div className="container-safe mx-auto max-w-2xl px-4">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/dashboard/guide"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition">
              <ChevronLeft className="w-4 h-4" /> Back to dashboard
            </Link>
            <button
              onClick={() => { toast('You can complete your profile later from Settings.', { icon: 'ℹ️' }); router.push('/dashboard/guide') }}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              <SkipForward className="w-4 h-4" /> Skip for now
            </button>
          </div>

          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
            <strong>Required to accept bookings.</strong> Complete your profile and ID verification before receiving tour bookings.
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Personal Info ─────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name <span className="text-red-500">*</span></label>
                <div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={fullName} onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: '' })) }}
                    placeholder="Your full name"
                    className={`${inputClass('fullName')} pl-9`} />
                </div>
                {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
              </div>

              <PhoneInput value={phoneE164} onChange={v => { setPhoneE164(v); setErrors(p => ({ ...p, phoneE164: '' })) }} error={errors.phoneE164} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select value={country} onChange={e => { setCountry(e.target.value); setErrors(p => ({ ...p, country: '' })) }}
                      className={`${inputClass('country')} pl-9 pr-8 appearance-none`}>
                      <option value="">Select Country</option>
                      {[...COUNTRY_CODES].sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                        <option key={c.code + c.name} value={c.name}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.country && <p className="text-xs text-red-600">{errors.country}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City <span className="text-red-500">*</span></label>
                  <input type="text" value={city} onChange={e => { setCity(e.target.value); setErrors(p => ({ ...p, city: '' })) }}
                    placeholder="e.g., Beirut" className={inputClass('city')} />
                  {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
                </div>
              </div>
            </div>

            {/* ── Guide Profile ─────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Guide Profile
              </h3>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio / About You <span className="text-red-500">*</span></label>
                <textarea value={bio} onChange={e => { setBio(e.target.value); if (e.target.value.length >= 30) setErrors(p => ({ ...p, bio: '' })) }}
                  rows={5} placeholder="Tell travelers about yourself, your experience, and what makes your tours special..."
                  className={`${inputClass('bio')} resize-none`} />
                <div className="flex justify-between text-xs">
                  <span className={bio.length >= 30 ? 'text-emerald-600' : 'text-gray-500'}>{bio.length}/30 minimum</span>
                  {bio.length >= 30 && <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-3 h-3" /> Good</span>}
                </div>
                {errors.bio && <p className="text-xs text-red-600">{errors.bio}</p>}
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Languages <span className="text-red-500">*</span></label>

                {languages.length > 0 && (
                  <div className="space-y-2">
                    {languages.map((l, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{l.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">{l.proficiency}</span>
                        </div>
                        <button type="button" onClick={() => removeLanguage(i)} className="p-1 text-gray-400 hover:text-red-500 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!showLangAdder && (
                  <button type="button" onClick={() => setShowLangAdder(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 transition">
                    <Plus className="w-4 h-4" /> Add a Language
                  </button>
                )}

                {showLangAdder && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Language</label>
                        <select value={langName} onChange={e => setLangName(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option value="">Select...</option>
                          {LANGUAGES.filter(l => !languages.find(x => x.name === l)).map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Proficiency</label>
                        <select value={langProf} onChange={e => setLangProf(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          {PROFICIENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={addLanguage} disabled={!langName}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                        Add
                      </button>
                      <button type="button" onClick={() => setShowLangAdder(false)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {errors.languages && <p className="text-xs text-red-600">{errors.languages}</p>}
              </div>

              {/* Expertise */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Areas of Expertise <span className="text-gray-400 font-normal">(optional)</span></label>

                {expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {expertise.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeExpertise(i)} className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <input type="text" value={expertiseInput}
                    onChange={e => { setExpertiseInput(e.target.value); setShowSuggestions(true) }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExpertise(expertiseInput) } }}
                    placeholder="e.g., Historical Sites, Halal Tourism..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {expertiseInput && (
                    <button type="button" onClick={() => addExpertise(expertiseInput)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Suggestions */}
                {showSuggestions && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {EXPERTISE_SUGGESTIONS
                      .filter(s => !expertise.includes(s) && (expertiseInput === '' || s.toLowerCase().includes(expertiseInput.toLowerCase())))
                      .slice(0, 8)
                      .map(s => (
                        <button key={s} type="button" onClick={() => addExpertise(s)}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                          + {s}
                        </button>
                      ))}
                  </div>
                )}
                {errors.expertise && <p className="text-xs text-red-600">{errors.expertise}</p>}
              </div>
            </div>

            {/* ── Submit ────────────────────────────────────────────────── */}
            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : 'Save Profile'}
            </button>
          </form>

        </div>
      </div>
    )
}