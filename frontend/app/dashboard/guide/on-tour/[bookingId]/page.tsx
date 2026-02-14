// ============================================================================
// BOOKING DETAILS PAGE - CARD 18
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/on-tour/[bookingId]/page.tsx
// 
// PURPOSE: View detailed information for a specific booking during tour
// 
// FEATURES:
// - Traveler details and contact info
// - Booking status and check-in time
// - Special requests
// - Emergency contact
// - QR code display
// - Check-in/No-show actions
// ============================================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Users,
  MapPin,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  QrCode,
  Download,
  Printer,
  Shield,
  HelpCircle,
  Info,
  Edit,
  Flag,
  MoreVertical
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BookingDetails {
  id: string
  bookingReference: string
  tourId: string
  tourTitle: string
  tourImage: string
  tourDate: string
  tourTime: string
  meetingPoint: {
    name: string
    address: string
    instructions?: string
  }
  traveler: {
    id: string
    name: string
    avatar?: string
    email: string
    phone: string
    nationality?: string
    languages?: string[]
  }
  bookingDetails: {
    peopleCount: number
    totalPrice: number
    currency: string
    bookingMode: 'instant' | 'request'
    status: 'confirmed' | 'pending' | 'checked-in' | 'no-show' | 'cancelled'
    checkInTime?: string
    bookedAt: string
  }
  specialRequests?: string
  dietaryRestrictions?: string[]
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  qrCode: {
    code: string
    url: string
  }
  notes?: {
    id: string
    author: string
    content: string
    createdAt: string
  }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BOOKING_DETAILS: Record<string, BookingDetails> = {
  'b1': {
    id: 'b1',
    bookingReference: 'SH-1234-5678',
    tourId: '1',
    tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    tourImage: '/images/tours/istanbul-ottoman.jpg',
    tourDate: '2026-03-15',
    tourTime: '09:00',
    meetingPoint: {
      name: 'Sultanahmet Square Fountain',
      address: 'Sultanahmet Meydanı, Fatih/İstanbul',
      instructions: 'Look for the guide holding an orange sign'
    },
    traveler: {
      id: 't1',
      name: 'Ahmed Khan',
      avatar: '/images/travelers/ahmed.jpg',
      email: 'ahmed.khan@example.com',
      phone: '+90 555 111 2233',
      nationality: 'United Arab Emirates',
      languages: ['Arabic', 'English']
    },
    bookingDetails: {
      peopleCount: 2,
      totalPrice: 178,
      currency: 'USD',
      bookingMode: 'instant',
      status: 'confirmed',
      bookedAt: '2026-02-20T10:30:00Z'
    },
    specialRequests: 'Vegetarian food options needed. Also need wheelchair accessibility.',
    dietaryRestrictions: ['Vegetarian', 'No nuts'],
    emergencyContact: {
      name: 'Fatima Khan',
      phone: '+90 555 111 2244',
      relationship: 'Spouse'
    },
    qrCode: {
      code: 'QR-AHMED-123',
      url: '/qr/booking-b1.png'
    },
    notes: [
      {
        id: 'n1',
        author: 'Mehmet (Guide)',
        content: 'Traveler requested vegetarian lunch. Confirmed with restaurant.',
        createdAt: '2026-03-14T09:15:00Z'
      }
    ]
  },
  'b2': {
    id: 'b2',
    bookingReference: 'SH-2345-6789',
    tourId: '1',
    tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    tourImage: '/images/tours/istanbul-ottoman.jpg',
    tourDate: '2026-03-15',
    tourTime: '09:00',
    meetingPoint: {
      name: 'Sultanahmet Square Fountain',
      address: 'Sultanahmet Meydanı, Fatih/İstanbul',
      instructions: 'Look for the guide holding an orange sign'
    },
    traveler: {
      id: 't2',
      name: 'Omar Farooq',
      email: 'omar.f@example.com',
      phone: '+90 555 222 3344',
      nationality: 'United Kingdom'
    },
    bookingDetails: {
      peopleCount: 1,
      totalPrice: 89,
      currency: 'USD',
      bookingMode: 'instant',
      status: 'checked-in',
      checkInTime: '08:45',
      bookedAt: '2026-02-25T14:20:00Z'
    },
    emergencyContact: {
      name: 'Sarah Farooq',
      phone: '+90 555 222 3355',
      relationship: 'Sister'
    },
    qrCode: {
      code: 'QR-OMAR-456',
      url: '/qr/booking-b2.png'
    }
  }
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
  status: BookingDetails['bookingDetails']['status']
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    confirmed: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: CheckCircle,
      label: 'Confirmed'
    },
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: Clock,
      label: 'Pending'
    },
    'checked-in': {
      bg: 'bg-emerald-100 dark:bg-emerald-950/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle,
      label: 'Checked In'
    },
    'no-show': {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      icon: XCircle,
      label: 'No Show'
    },
    cancelled: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700',
      icon: XCircle,
      label: 'Cancelled'
    }
  }

  const { bg, text, border, icon: Icon, label } = config[status]

  return (
    <span className={`
      inline-flex items-center gap-1
      px-3 py-1
      ${bg}
      ${border}
      border
      rounded-full
      ${text}
      text-sm font-medium
    `}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  )
}

// ============================================================================
// MAIN BOOKING DETAILS PAGE
// ============================================================================

interface BookingDetailsPageProps {
  params: {
    bookingId: string
  }
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetails | null>(
    MOCK_BOOKING_DETAILS[params.bookingId] || null
  )
  const [showQR, setShowQR] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [newNote, setNewNote] = useState('')

  if (!booking) {
    return (
      <PageLayout>
        <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The booking you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.back()}
              className="
                px-6 py-3
                bg-blue-600 hover:bg-blue-700
                text-white font-medium
                rounded-lg
                transition-colors
                inline-flex items-center gap-2
              "
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  const handleCheckIn = () => {
    setBooking(prev => {
      if (!prev) return prev
      return {
        ...prev,
        bookingDetails: {
          ...prev.bookingDetails,
          status: 'checked-in',
          checkInTime: new Date().toLocaleTimeString()
        }
      }
    })
  }

  const handleMarkNoShow = () => {
    setBooking(prev => {
      if (!prev) return prev
      return {
        ...prev,
        bookingDetails: {
          ...prev.bookingDetails,
          status: 'no-show'
        }
      }
    })
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    setBooking(prev => {
      if (!prev) return prev
      return {
        ...prev,
        notes: [
          ...(prev.notes || []),
          {
            id: Date.now().toString(),
            author: 'You (Guide)',
            content: newNote,
            createdAt: new Date().toISOString()
          }
        ]
      }
    })
    setNewNote('')
  }

  return (
    <PageLayout>
      {/* Page offset */}
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        
        <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">
          
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="
              flex items-center gap-2
              text-gray-600 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white
              mb-6
              transition-colors
            "
          >
            <ArrowLeft className="w-4 h-4" />
            Back to On-Tour Toolkit
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Booking Details
                </h1>
                <StatusBadge status={booking.bookingDetails.status} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reference: {booking.bookingReference}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowQR(!showQR)}
                className="
                  px-4 py-2
                  bg-blue-600 hover:bg-blue-700
                  text-white
                  rounded-lg
                  transition-colors
                  flex items-center gap-2
                "
              >
                <QrCode className="w-4 h-4" />
                {showQR ? 'Hide QR' : 'Show QR'}
              </button>
              <button className="
                p-2
                bg-gray-100 dark:bg-gray-800
                text-gray-700 dark:text-gray-300
                rounded-lg
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-colors
              ">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          {showQR && (
            <div className="mb-6 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-center">
              <div className="inline-block p-4 bg-white rounded-lg shadow-lg mb-4">
                <QrCode className="w-32 h-32 text-gray-900" />
              </div>
              <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-3">
                {booking.qrCode.code}
              </p>
              <div className="flex gap-2 justify-center">
                <button className="
                  px-4 py-2
                  bg-gray-100 dark:bg-gray-800
                  text-gray-700 dark:text-gray-300
                  rounded-lg
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  transition-colors
                  flex items-center gap-2
                ">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="
                  px-4 py-2
                  bg-gray-100 dark:bg-gray-800
                  text-gray-700 dark:text-gray-300
                  rounded-lg
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  transition-colors
                  flex items-center gap-2
                ">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Traveler Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Traveler Profile Card */}
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="
                      w-16 h-16
                      rounded-full
                      bg-gray-100 dark:bg-gray-800
                      overflow-hidden
                    ">
                      {booking.traveler.avatar ? (
                        <Image
                          src={booking.traveler.avatar}
                          alt={booking.traveler.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {booking.bookingDetails.status === 'checked-in' && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {booking.traveler.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {booking.traveler.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {booking.traveler.phone}
                      </span>
                    </div>
                    {booking.traveler.nationality && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Nationality:</span> {booking.traveler.nationality}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons (if pending) */}
                {booking.bookingDetails.status === 'confirmed' && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={handleCheckIn}
                      className="
                        flex-1
                        px-4 py-2
                        bg-emerald-600 hover:bg-emerald-700
                        text-white font-medium
                        rounded-lg
                        transition-colors
                        flex items-center justify-center gap-2
                      "
                    >
                      <CheckCircle className="w-4 h-4" />
                      Check In
                    </button>
                    <button
                      onClick={handleMarkNoShow}
                      className="
                        flex-1
                        px-4 py-2
                        bg-red-600 hover:bg-red-700
                        text-white font-medium
                        rounded-lg
                        transition-colors
                        flex items-center justify-center gap-2
                      "
                    >
                      <XCircle className="w-4 h-4" />
                      Mark No Show
                    </button>
                    <button className="
                      px-4 py-2
                      bg-blue-600 hover:bg-blue-700
                      text-white font-medium
                      rounded-lg
                      transition-colors
                      flex items-center justify-center gap-2
                    ">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                )}
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="
                  bg-amber-50 dark:bg-amber-950/30
                  border border-amber-200 dark:border-amber-800
                  rounded-xl
                  p-6
                ">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Special Requests
                  </h3>
                  <p className="text-amber-700 dark:text-amber-400 mb-3">
                    {booking.specialRequests}
                  </p>
                  {booking.dietaryRestrictions && (
                    <div className="flex flex-wrap gap-2">
                      {booking.dietaryRestrictions.map((restriction, index) => (
                        <span
                          key={index}
                          className="
                            px-2 py-1
                            bg-amber-100 dark:bg-amber-900/50
                            text-amber-700 dark:text-amber-300
                            text-xs
                            rounded-full
                          "
                        >
                          {restriction}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Notes
                </h3>

                {/* Notes list */}
                <div className="space-y-3 mb-4">
                  {booking.notes && booking.notes.length > 0 ? (
                    booking.notes.map(note => (
                      <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {note.author}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {note.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No notes yet
                    </p>
                  )}
                </div>

                {/* Add note */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="
                      flex-1
                      px-3 py-2
                      bg-gray-50 dark:bg-gray-800
                      border border-gray-200 dark:border-gray-700
                      rounded-lg
                      text-gray-900 dark:text-white
                      placeholder-gray-500 dark:placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                    "
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="
                      px-4 py-2
                      bg-blue-600 hover:bg-blue-700
                      text-white
                      rounded-lg
                      transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Details */}
            <div className="space-y-6">
              {/* Tour Info */}
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Tour Information
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(booking.tourDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.tourTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.meetingPoint.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.meetingPoint.address}
                      </p>
                      {booking.meetingPoint.instructions && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {booking.meetingPoint.instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {booking.bookingDetails.peopleCount} people
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      Booked: {new Date(booking.bookingDetails.bookedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {booking.bookingDetails.checkInTime && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">
                        Checked in at {booking.bookingDetails.checkInTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  Emergency Contact
                </h3>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.emergencyContact.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {booking.emergencyContact.relationship}
                  </p>
                  <a
                    href={`tel:${booking.emergencyContact.phone}`}
                    className="
                      inline-flex items-center gap-2
                      text-blue-600 dark:text-blue-400
                      hover:underline
                    "
                  >
                    <Phone className="w-3 h-3" />
                    {booking.emergencyContact.phone}
                  </a>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                rounded-xl
                p-6
              ">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="
                    w-full
                    px-4 py-2
                    bg-blue-600 hover:bg-blue-700
                    text-white
                    rounded-lg
                    transition-colors
                    flex items-center justify-center gap-2
                  ">
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                  <button className="
                    w-full
                    px-4 py-2
                    bg-gray-100 dark:bg-gray-800
                    text-gray-700 dark:text-gray-300
                    rounded-lg
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    transition-colors
                    flex items-center justify-center gap-2
                  ">
                    <Flag className="w-4 h-4" />
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}