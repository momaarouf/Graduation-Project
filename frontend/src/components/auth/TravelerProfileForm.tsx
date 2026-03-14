'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
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
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import PhoneInput, { COUNTRY_CODES } from '@/src/components/ui/PhoneInput';

// ============================================================================
// PROPS
// ============================================================================

interface TravelerProfileFormProps {
  onSubmit: (data: TravelerProfileFormData) => Promise<void>;
  initialData?: TravelerProfileFormData | null;
}

export interface TravelerProfileFormData {
  fullName: string;
  phoneE164: string;
  country: string;
  city: string;
  nationality?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  preferences?: string[];
}

// ============================================================================
// CONSTANTS
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
].sort((a, b) => a.name.localeCompare(b.name));

const TRAVEL_PREFERENCES = [
  { id: 'cultural', label: 'Cultural Tours', icon: Landmark, description: 'History, museums, heritage sites' },
  { id: 'adventure', label: 'Adventure', icon: Mountain, description: 'Hiking, outdoor activities' },
  { id: 'food', label: 'Food & Culinary', icon: Utensils, description: 'Cooking classes, food tours' },
  { id: 'family', label: 'Family Friendly', icon: Users, description: 'Activities suitable for children' },
  { id: 'photography', label: 'Photography', icon: Camera, description: 'Scenic spots, golden hour tours' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, description: 'Markets, souks, boutiques' },
  { id: 'religious', label: 'Religious Tours', icon: Heart, description: 'Mosques, spiritual sites' },
  { id: 'nature', label: 'Nature & Wildlife', icon: Mountain, description: 'Parks, reserves, animals' },
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TravelerProfileForm({ onSubmit, initialData }: TravelerProfileFormProps) {
  // ========================================
  // STATE
  // ========================================
  const [formData, setFormData] = useState<TravelerProfileFormData>({
    fullName: initialData?.fullName || '',
    phoneE164: initialData?.phoneE164 || '',
    country: initialData?.country || '',
    city: initialData?.city || '',
    nationality: initialData?.nationality || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    preferences: initialData?.preferences || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(formData.preferences || []);

  // ========================================
  // HANDLERS
  // ========================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handlePreferenceToggle = (prefId: string) => {
    setSelectedPreferences(prev => {
      const newPrefs = prev.includes(prefId)
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId];
      setFormData(prevData => ({ ...prevData, preferences: newPrefs }));
      return newPrefs;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.phoneE164.trim()) {
      newErrors.phoneE164 = 'Phone number is required';
    } else if (!/^\+[1-9]\d{7,14}$/.test(formData.phoneE164)) {
      newErrors.phoneE164 = 'Phone must be in E.164 format (e.g., +96170123456)';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // dateOfBirth is optional, but if provided must be valid
    if (formData.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Date must be in YYYY-MM-DD format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Mark all fields as touched to show errors
      setTouched({
        fullName: true,
        phoneE164: true,
        country: true,
        city: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up optional fields: send undefined instead of empty string
      const submissionData = {
        ...formData,
        nationality: formData.nationality?.trim() || undefined,
        dateOfBirth: formData.dateOfBirth?.trim() || undefined,
      };
      await onSubmit(submissionData);
    } catch (error) {
      // If the backend returns field errors, we could handle them here
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
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
            Complete Your Profile
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help us personalize your experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={() => handleBlur('fullName')}
              disabled={isSubmitting}
              className={`
                w-full px-4 py-2.5
                bg-gray-50 dark:bg-gray-800
                border rounded-lg
                text-sm text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2
                transition-all
                ${errors.fullName && touched.fullName
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />
            {errors.fullName && touched.fullName && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <PhoneInput
            value={formData.phoneE164}
            onChange={(val) => {
              setFormData(prev => ({ ...prev, phoneE164: val }));
              if (errors.phoneE164) setErrors(prev => ({ ...prev, phoneE164: '' }));
            }}
            error={errors.phoneE164 && touched.phoneE164 ? errors.phoneE164 : undefined}
            disabled={isSubmitting}
          />

          {/* Country & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  onBlur={() => handleBlur('country')}
                  disabled={isSubmitting}
                  className={`
                    w-full pl-9 pr-8 py-2.5
                    bg-gray-50 dark:bg-gray-800
                    border
                    rounded-lg
                    text-sm text-gray-900 dark:text-white
                    appearance-none
                    focus:outline-none focus:ring-2
                    transition-all
                    ${errors.country && touched.country
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <option value="">Select your country</option>
                  {[...COUNTRY_CODES].sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                    <option key={c.code + c.name} value={c.name}>{c.flag} {c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.country && touched.country && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.country}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={() => handleBlur('city')}
                disabled={isSubmitting}
                placeholder="e.g., Beirut"
                className={`
                  w-full px-4 py-2.5
                  bg-gray-50 dark:bg-gray-800
                  border rounded-lg
                  text-sm text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2
                  transition-all
                  ${errors.city && touched.city
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
              {errors.city && touched.city && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          {/* Nationality (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nationality <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="nationality"
                name="nationality"
                value={formData.nationality || ''}
                onChange={handleChange}
                onBlur={() => handleBlur('nationality')}
                disabled={isSubmitting}
                className="
                  w-full pl-9 pr-8 py-2.5
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-300 dark:border-gray-700
                  rounded-lg
                  text-sm text-gray-900 dark:text-white
                  appearance-none
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <option value="">Select your nationality</option>
                {NATIONALITIES.map(country => (
                  <option key={country.code} value={country.name}>{country.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date of Birth (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date of Birth <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth || ''}
                onChange={handleChange}
                onBlur={() => handleBlur('dateOfBirth')}
                disabled={isSubmitting}
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
            {errors.dateOfBirth && touched.dateOfBirth && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Travel Preferences (optional) */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Travel Preferences <span className="text-gray-400">(optional)</span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
              Select the types of experiences you're interested in
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRAVEL_PREFERENCES.map((pref) => {
                const Icon = pref.icon;
                const isSelected = selectedPreferences.includes(pref.id);
                
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
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full
                py-3
                bg-gradient-to-r from-blue-600 to-indigo-600
                dark:from-blue-700 dark:to-indigo-700
                text-white font-semibold
                rounded-lg
                hover:from-blue-700 hover:to-indigo-700
                dark:hover:from-blue-800 dark:hover:to-indigo-800
                transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}