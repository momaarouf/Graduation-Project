// ============================================================================
// GUIDE BOOKING DETAIL - INDIVIDUAL BOOKING VIEW
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/bookings/[id]/page.tsx
// 
// PURPOSE: Display detailed information about a specific booking
// 
// FEATURES:
// - Complete booking information
// - Traveler details with contact info
// - Tour details and meeting point
// - Special requests and notes
// - Check-in status and actions
// - Message traveler
// - Report no-show
// - Download invoice
// ============================================================================

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  User,
  Mail,
  Eye,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  ChevronLeft,
  Edit,
  Flag,
  QrCode,
  Star,
  MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show' | 'checked-in'

interface BookingDetail {
  id: string
  bookingReference: string
  tourId: string
  tourTitle: string
  tourImage: string
  tourDate: string
  tourDuration: string
  meetingPoint: {
    name: string
    address: string
    instructions?: string
  }
  status: BookingStatus
  traveler: {
    id: string
    name: string
    avatar?: string
    email: string
    phone: string
    nationality?: string
    languages?: string[]
    totalTrips?: number
    joinedAt?: string
  }
  bookingDetails: {
    peopleCount: number
    totalPrice: number
    currency: 'USD' | 'TRY' | 'LBP'
    basePrice: number
    discounts?: {
      type: string
      amount: number
      description: string
    }[]
    platformFee: number
    bookedAt: string
    paymentMethod: string
    specialRequests?: string
    dietaryRestrictions?: string[]
  }
  checkIn?: {
    status: 'pending' | 'checked-in' | 'no-show'
    time?: string
    qrCode?: string
  }
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  notes?: {
    id: string
    content: string
    createdAt: string
  }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BOOKING_DETAIL: Record<string, BookingDetail> = {
  'b1': {
    id: 'b1',
    bookingReference: 'SH-1234-5678',
    tourId: '1',
    tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    tourImage: '/images/tours/istanbul-ottoman.jpg',
    tourDate: '2026-04-15T09:00:00Z',
    tourDuration: '4 hours',
    meetingPoint: {
      name: 'Sultanahmet Square Fountain',
      address: 'Sultanahmet Meydanı, Fatih/İstanbul',
      instructions: 'Look for the guide holding an orange sign'
    },
    status: 'confirmed',
    traveler: {
      id: 't1',
      name: 'Ahmed Khan',
      avatar: '/images/travelers/ahmed.jpg',
      email: 'ahmed.khan@example.com',
      phone: '+90 555 111 2233',
      nationality: 'United Arab Emirates',
      languages: ['Arabic', 'English'],
      totalTrips: 12,
      joinedAt: '2025-06-15'
    },
    bookingDetails: {
      peopleCount: 2,
      totalPrice: 178,
      currency: 'USD',
      basePrice: 89,
      discounts: [
        { type: 'group', amount: 9, description: 'Group discount (5%)' }
      ],
      platformFee: 17.8,
      bookedAt: '2026-03-20T14:30:00Z',
      paymentMethod: 'Visa •••• 4242',
      specialRequests: 'Vegetarian food options needed. Also need wheelchair accessibility.',
      dietaryRestrictions: ['Vegetarian', 'No nuts']
    },
    checkIn: {
      status: 'pending',
      qrCode: 'QR-AHMED-123'
    },
    emergencyContact: {
      name: 'Fatima Khan',
      phone: '+90 555 111 2244',
      relationship: 'Spouse'
    }
  },
  'b2': {
    id: 'b2',
    bookingReference: 'SH-2345-6789',
    tourId: '1',
    tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
    tourImage: '/images/tours/istanbul-ottoman.jpg',
    tourDate: '2026-04-15T09:00:00Z',
    tourDuration: '4 hours',
    meetingPoint: {
      name: 'Sultanahmet Square Fountain',
      address: 'Sultanahmet Meydanı, Fatih/İstanbul',
      instructions: 'Look for the guide holding an orange sign'
    },
    status: 'checked-in',
    traveler: {
      id: 't2',
      name: 'Fatima Al-Zahra',
      avatar: '/images/travelers/fatima.jpg',
      email: 'fatima.z@example.com',
      phone: '+90 555 222 3344',
      nationality: 'United Kingdom',
      languages: ['English'],
      totalTrips: 8,
      joinedAt: '2025-09-20'
    },
    bookingDetails: {
      peopleCount: 1,
      totalPrice: 89,
      currency: 'USD',
      basePrice: 89,
      platformFee: 8.9,
      bookedAt: '2026-03-21T10:15:00Z',
      paymentMethod: 'Mastercard •••• 5678'
    },
    checkIn: {
      status: 'checked-in',
      time: '08:45',
      qrCode: 'QR-FATIMA-456'
    }
  }
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ status }: { status: BookingStatus | 'checked-in' }) => {
  const styles = {
    confirmed: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: CheckCircle,
      label: 'Confirmed'
    },
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: Clock,
      label: 'Pending'
    },
    completed: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: CheckCircle,
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: XCircle,
      label: 'Cancelled'
    },
    'no-show': {
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/50',
      icon: AlertCircle,
      label: 'No Show'
    },
    'checked-in': {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: CheckCircle,
      label: 'Checked In'
    }
  }

  const { bg, text, border, icon: Icon, label } = styles[status as keyof typeof styles]

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${bg} ${text} ${border}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function GuideBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetail | null>(
    MOCK_BOOKING_DETAIL[params.id as string] || null
  )
  const [showQR, setShowQR] = useState(false)
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<{ id: string; content: string; createdAt: string }[]>(
    booking?.notes || []
  )
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
  if (!booking) {
    return (
      <>
        <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Not Found
            </h1>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const handleCheckIn = () => {
    setBooking(prev => {
      if (!prev) return prev
      return {
        ...prev,
        status: 'checked-in',
        checkIn: {
          status: 'checked-in',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          qrCode: prev.checkIn?.qrCode
        }
      }
    })
    toast.success('Traveler checked in successfully!')
  }

  const handleMarkNoShow = () => {
    if (confirm('Mark this traveler as no-show?')) {
      setBooking(prev => {
        if (!prev) return prev
        return {
          ...prev,
          status: 'no-show',
          checkIn: {
            status: 'no-show',
            qrCode: prev.checkIn?.qrCode
          }
        }
      })
      toast.success('Marked as no-show')
    }
  }

  const handleAddNote = () => {
    if (!note.trim()) return
    const newNote = {
      id: Date.now().toString(),
      content: note,
      createdAt: new Date().toISOString()
    }
    setNotes(prev => [newNote, ...prev])
    setNote('')
    toast.success('Note added')
  }

  const handleContact = () => {
    router.push(`/dashboard/guide/messages?traveler=${booking.traveler.id}`)
  }
  const handleDownloadInvoice = () => {
  const invoice = `
SAFARIHUB - INVOICE
===================
Booking Reference: ${booking.bookingReference}
Date: ${new Date().toLocaleDateString()}

TOUR DETAILS
------------
Tour: ${booking.tourTitle}
Date: ${formatDate(booking.tourDate)}
Duration: ${booking.tourDuration}
Meeting Point: ${booking.meetingPoint.name}

TRAVELER DETAILS
----------------
Name: ${booking.traveler.name}
Email: ${booking.traveler.email}
Phone: ${booking.traveler.phone}

BOOKING DETAILS
---------------
Number of People: ${booking.bookingDetails.peopleCount}
Base Price: $${booking.bookingDetails.basePrice} per person
${booking.bookingDetails.discounts?.map(d => `${d.description}: -$${d.amount}`).join('\n') || ''}
Platform Fee: $${booking.bookingDetails.platformFee}
----------------------------------------
TOTAL: $${booking.bookingDetails.totalPrice}

Payment Method: ${booking.bookingDetails.paymentMethod}
Booked On: ${new Date(booking.bookingDetails.bookedAt).toLocaleDateString()}

Thank you for choosing SafariHub!
This invoice is for your records.
  `
  
  const blob = new Blob([invoice], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${booking.bookingReference}.txt`
  a.click()
  URL.revokeObjectURL(url)
  
  toast.success('Invoice downloaded!')
}
  return (
    <>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-6xl py-8 sm:py-10">
          
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Bookings</span>
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Booking Details
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reference: {booking.bookingReference}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={booking.status} />
            
<div className="relative">
  <button
    onClick={() => setShowHeaderMenu(!showHeaderMenu)}
    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
  >
    <MoreVertical className="w-5 h-5" />
  </button>

  {showHeaderMenu && (
    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-10 py-1">
      <button
        onClick={() => {
          setShowHeaderMenu(false)
          router.push(`/dashboard/guide/tours/${booking.tourId}`)
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View Tour
      </button>
      
      <button
        onClick={() => {
          setShowHeaderMenu(false)
          window.open(`mailto:${booking.traveler.email}?subject=Booking%20${booking.bookingReference}`, '_blank')
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
      >
        <Mail className="w-4 h-4" />
        Email Traveler
      </button>
      
      <button
        onClick={() => {
          setShowHeaderMenu(false)
          // Copy booking reference to clipboard
          navigator.clipboard.writeText(booking.bookingReference)
          toast.success('Booking reference copied!')
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Copy Reference
      </button>
      
      <div className="border-t border-gray-200 dark:border-gray-800 my-1" />
      
      <button
        onClick={() => {
          setShowHeaderMenu(false)
          if (confirm('Report this booking as an issue?')) {
            toast.success('Reported to support')
          }
        }}
        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
      >
        <Flag className="w-4 h-4" />
        Report Issue
      </button>
    </div>
  )}
</div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tour Info Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <Image src={booking.tourImage} alt={booking.tourTitle} width={80} height={80} className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-1">
                      {booking.tourTitle}
                    </h2>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(booking.tourDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.tourDuration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traveler Info Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Traveler Information
                </h3>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    {booking.traveler.avatar ? (
                      <Image src={booking.traveler.avatar} alt={booking.traveler.name} width={64} height={64} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {booking.traveler.name}
                    </h4>
                    {booking.traveler.nationality && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.traveler.nationality}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${booking.traveler.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {booking.traveler.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${booking.traveler.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {booking.traveler.phone}
                    </a>
                  </div>
                  {booking.traveler.languages && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Languages:</span>
                      <span className="text-gray-900 dark:text-white">
                        {booking.traveler.languages.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {booking.bookingDetails.specialRequests && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Special Requests
                  </h3>
                  <p className="text-amber-700 dark:text-amber-400 mb-3">
                    {booking.bookingDetails.specialRequests}
                  </p>
                  {booking.bookingDetails.dietaryRestrictions && (
                    <div className="flex flex-wrap gap-2">
                      {booking.bookingDetails.dietaryRestrictions.map((item, i) => (
                        <span key={i} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes Section */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Notes
                </h3>

                <div className="space-y-3 mb-4">
                  {notes.map(note => (
                    <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!note.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* Check-in Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Check-in Status
                </h3>

                {booking.status === 'confirmed' && (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Ready to check in
                      </p>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={handleCheckIn}
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
                      >
                        Check In Traveler
                      </button>
                      <button
                        onClick={handleMarkNoShow}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
                      >
                        Mark No Show
                      </button>
                    </div>
                  </>
                )}

                {booking.status === 'checked-in' && booking.checkIn?.time && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      Checked in at {booking.checkIn.time}
                    </p>
                  </div>
                )}

                {booking.status === 'no-show' && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">
                      Marked as no-show
                    </p>
                  </div>
                )}

                {booking.checkIn?.qrCode && (
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="w-full mt-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    {showQR ? 'Hide QR' : 'Show QR'}
                  </button>
                )}

                {showQR && booking.checkIn?.qrCode && (
                  <div className="mt-3 p-4 bg-white border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                    <div className="inline-block p-3 bg-white rounded-lg shadow-sm mb-2">
                      <QrCode className="w-24 h-24 text-gray-900" />
                    </div>
                    <p className="text-xs font-mono text-gray-500">{booking.checkIn.qrCode}</p>
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              {booking.emergencyContact && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    Emergency Contact
                  </h3>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {booking.emergencyContact.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {booking.emergencyContact.relationship}
                  </p>
                  <a href={`tel:${booking.emergencyContact.phone}`} className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                    {booking.emergencyContact.phone}
                  </a>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={handleContact}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Traveler
                  </button>
                  <button onClick={handleDownloadInvoice} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Download className="w-4 h-4" />
                    Download Invoice
                  </button>
                </div>
              </div>

              {/* Meeting Point */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Meeting Point
                </h3>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.meetingPoint.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {booking.meetingPoint.address}
                </p>
                {booking.meetingPoint.instructions && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {booking.meetingPoint.instructions}
                  </p>
                )}
              </div>

              {/* Booking Summary */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  Booking Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">People</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {booking.bookingDetails.peopleCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ${booking.bookingDetails.totalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Booked</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(booking.bookingDetails.bookedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}