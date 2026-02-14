// ============================================================================
// EDIT TOUR PAGE
// ============================================================================

import TourForm from '../../components/TourForm'

// Mock data for different tour IDs (Phase 1)
const MOCK_TOUR_DATA: Record<string, any> = {
  '1': {
    title: 'Ottoman Heritage Tour',
    description: 'Explore Istanbul\'s rich history with a licensed guide...',
    category: 'historical',
    tags: ['istanbul', 'ottoman', 'history'],
    city: 'Istanbul',
    country: 'turkey',
    meetingPoint: {
      name: 'Sultanahmet Square Fountain',
      address: 'Sultanahmet Meydanı, Istanbul',
      instructions: 'Look for the orange umbrella'
    },
    minCapacity: 2,
    maxCapacity: 8,
    bookingMode: 'instant',
    instantBookEnabled: true,
    tourType: 'recurring',
    recurrencePattern: 'weekly',
    recurringDays: ['monday', 'wednesday', 'friday'],
    durationHours: 4,
    durationMinutes: 0,
    basePrice: 89,
    currency: 'USD',
    dynamicPricing: { enabled: true, weekendMultiplier: 120, holidayMultiplier: 150 },
    groupDiscountEnabled: true,
    groupDiscountThreshold: 4,
    groupDiscountPercent: 5,
    isHalalCertified: true,
    halalDetails: { prayerSpace: true, halalFood: true, genderSensitiveGuides: true },
    availableLanguages: [
      { language: 'English', proficiency: 'native' },
      { language: 'Arabic', proficiency: 'fluent' }
    ],
    itinerary: [
      { id: '1', order: 1, title: 'Hagia Sophia', description: 'Visit the iconic mosque', duration: '1.5 hours' },
      { id: '2', order: 2, title: 'Topkapi Palace', description: 'Explore the Ottoman palace', duration: '2 hours' }
    ],
    inclusions: ['Professional guide', 'Entry tickets', 'Lunch'],
    exclusions: ['Hotel pickup', 'Personal expenses'],
    requirements: ['Modest dress code'],
    whatToBring: ['Camera', 'Water'],
    cancellationPolicy: { fullRefund: 48, partialRefund: 24, partialRefundPercent: 50, noRefund: 24 },
    status: 'published'
  },
  '2': {
    title: 'Bosphorus Sunset Cruise',
    description: 'Enjoy a beautiful sunset cruise on the Bosphorus...',
    category: 'nature',
    tags: ['bosphorus', 'cruise', 'sunset'],
    city: 'Istanbul',
    country: 'turkey',
    meetingPoint: {
      name: 'Kabataş Ferry Terminal',
      address: 'Kabataş, Istanbul',
      instructions: 'Meet at the main entrance'
    },
    minCapacity: 4,
    maxCapacity: 20,
    bookingMode: 'request',
    instantBookEnabled: false,
    tourType: 'one-time',
    startDate: '2026-06-15T18:00',
    durationHours: 3,
    durationMinutes: 0,
    basePrice: 129,
    currency: 'USD',
    dynamicPricing: { enabled: false },
    groupDiscountEnabled: true,
    groupDiscountThreshold: 6,
    groupDiscountPercent: 10,
    isHalalCertified: true,
    halalDetails: { halalFood: true },
    availableLanguages: [
      { language: 'English', proficiency: 'fluent' },
      { language: 'Turkish', proficiency: 'native' }
    ],
    itinerary: [
      { id: '1', order: 1, title: 'Departure', description: 'Board the boat at Kabataş', duration: '30 min' },
      { id: '2', order: 2, title: 'Sunset Viewing', description: 'Enjoy the sunset', duration: '1.5 hours' }
    ],
    inclusions: ['Boat cruise', 'Dinner', 'Soft drinks'],
    exclusions: ['Alcoholic drinks'],
    requirements: [],
    whatToBring: ['Camera', 'Jacket'],
    cancellationPolicy: { fullRefund: 48, partialRefund: 24, partialRefundPercent: 50, noRefund: 24 },
    status: 'published'
  }
}

export default function EditTourPage({ params }: { params: { id: string } }) {
  const tourData = MOCK_TOUR_DATA[params.id]
  
  if (!tourData) {
    return (
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tour Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The tour you're trying to edit doesn't exist.</p>
        </div>
      </div>
    )
  }
  
  return (
    <TourForm 
      initialData={tourData}
      isEditing={true}
      tourId={params.id}
    />
  )
}