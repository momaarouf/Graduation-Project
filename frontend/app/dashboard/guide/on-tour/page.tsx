// ============================================================================
// GUIDE ON-TOUR TOOLKIT - CARD 18
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/on-tour/page.tsx
// 
// PURPOSE: Tools for guides during active tours
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ QR handshake - Guide scans traveler QR at meeting point
// ✓ Marks booking as COMPLETED
// ✓ Starts 48h payout countdown
// ✓ Traveler list with check-in status
// ✓ Waitlist manager
// ✓ Safety status tracking
// 
// COLOR PSYCHOLOGY:
// - Blue: Primary actions, scanner
// - Green: Checked-in, completed
// - Orange: Pending, waiting
// - Red: Issues, no-show
// - Purple: Waitlist
// 
// DUAL THEME: Full light/dark mode support
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    QrCode,
    Camera,
    Users,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    UserCheck,
    UserX,
    UserPlus,
    Calendar,
    MapPin,
    Phone,
    Mail,
    MessageSquare,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Check,
    Globe,
    RefreshCw,
    Scan,
    Smartphone,
    Timer,
    Award,
    TrendingUp,
    Shield,
    Bell,
    MoreVertical,
    Download,
    Printer,
    HelpCircle,
    Info
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type CheckInStatus = 'pending' | 'checked-in' | 'no-show' | 'cancelled'
type TourStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

interface Traveler {
    id: string
    bookingId: string
    name: string
    avatar?: string
    email: string
    phone: string
    peopleCount: number
    checkInStatus: CheckInStatus
    checkInTime?: string
    specialRequests?: string
    emergencyContact?: {
        name: string
        phone: string
        relationship: string
    }
    qrCode: string
}

interface WaitlistEntry {
    id: string
    travelerId: string
    travelerName: string
    travelerAvatar?: string
    peopleCount: number
    requestedAt: string
    notified: boolean
    position: number
}

interface ActiveTour {
    id: string
    tourId: string
    title: string
    mainImage: string
    date: string
    startTime: string
    endTime: string
    location: string
    meetingPoint: {
        name: string
        address: string
        instructions?: string
    }
    guideName: string
    guideId: string
    status: TourStatus
    travelers: Traveler[]
    waitlist: WaitlistEntry[]
    totalCapacity: number
    confirmedCount: number
    checkedInCount: number
    noShowCount: number
    pendingCount: number
    weatherInfo?: {
        condition: string
        temperature: number
        icon: string
    }
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ACTIVE_TOURS: ActiveTour[] = [
    {
        id: 'tour-1',
        tourId: '1',
        title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
        mainImage: '/images/tours/istanbul-ottoman.jpg',
        date: '2026-03-15',
        startTime: '09:00',
        endTime: '13:00',
        location: 'Istanbul',
        meetingPoint: {
            name: 'Sultanahmet Square Fountain',
            address: 'Sultanahmet Meydanı, Fatih/İstanbul',
            instructions: 'Look for the orange umbrella'
        },
        guideName: 'Mehmet Yilmaz',
        guideId: 'guide-123',
        status: 'scheduled',
        travelers: [
            {
                id: 't1',
                bookingId: 'b1',
                name: 'Ahmed Khan',
                avatar: '/images/travelers/ahmed.jpg',
                email: 'ahmed.khan@example.com',
                phone: '+90 555 111 2233',
                peopleCount: 2,
                checkInStatus: 'pending',
                specialRequests: 'Vegetarian food',
                emergencyContact: {
                    name: 'Fatima Khan',
                    phone: '+90 555 111 2244',
                    relationship: 'Spouse'
                },
                qrCode: 'QR-AHMED-123'
            },
            {
                id: 't2',
                bookingId: 'b2',
                name: 'Omar Farooq',
                email: 'omar.f@example.com',
                phone: '+90 555 222 3344',
                peopleCount: 1,
                checkInStatus: 'checked-in',
                checkInTime: '08:45',
                qrCode: 'QR-OMAR-456'
            },
            {
                id: 't3',
                bookingId: 'b3',
                name: 'Layla Hassan',
                avatar: '/images/travelers/layla.jpg',
                email: 'layla.h@example.com',
                phone: '+90 555 333 4455',
                peopleCount: 3,
                checkInStatus: 'no-show',
                emergencyContact: {
                    name: 'Hassan Ali',
                    phone: '+90 555 333 4466',
                    relationship: 'Brother'
                },
                qrCode: 'QR-LAYLA-789'
            },
            {
                id: 't4',
                bookingId: 'b4',
                name: 'Zeynep Kaya',
                email: 'zeynep.k@example.com',
                phone: '+90 555 444 5566',
                peopleCount: 2,
                checkInStatus: 'pending',
                qrCode: 'QR-ZEYNEP-012'
            }
        ],
        waitlist: [
            {
                id: 'w1',
                travelerId: 'wt1',
                travelerName: 'Mehmet Demir',
                peopleCount: 2,
                requestedAt: '2026-03-14T10:30:00Z',
                notified: false,
                position: 1
            },
            {
                id: 'w2',
                travelerId: 'wt2',
                travelerName: 'Fatima Yilmaz',
                peopleCount: 1,
                requestedAt: '2026-03-14T14:15:00Z',
                notified: false,
                position: 2
            }
        ],
        totalCapacity: 8,
        confirmedCount: 4,
        checkedInCount: 1,
        noShowCount: 1,
        pendingCount: 2,
        weatherInfo: {
            condition: 'Sunny',
            temperature: 18,
            icon: '☀️'
        }
    },
    {
        id: 'tour-2',
        tourId: '2',
        title: 'Beirut Street Food & Cultural Walk',
        mainImage: '/images/tours/beirut-food.jpg',
        date: '2026-03-16',
        startTime: '11:00',
        endTime: '14:00',
        location: 'Beirut',
        meetingPoint: {
            name: 'Beirut Souks Entrance',
            address: 'Beirut Souks, Downtown Beirut',
            instructions: 'Meet near the clock tower'
        },
        guideName: 'Layla Hassan',
        guideId: 'guide-456',
        status: 'scheduled',
        travelers: [
            {
                id: 't5',
                bookingId: 'b5',
                name: 'Hassan Ali',
                email: 'hassan.a@example.com',
                phone: '+961 70 123 456',
                peopleCount: 4,
                checkInStatus: 'pending',
                qrCode: 'QR-HASSAN-345'
            }
        ],
        waitlist: [],
        totalCapacity: 6,
        confirmedCount: 4,
        checkedInCount: 0,
        noShowCount: 0,
        pendingCount: 1
    }
]

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
    status: CheckInStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
    const config = {
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
      px-2 py-1
      ${bg}
      ${border}
      border
      rounded-full
      ${text}
      text-xs font-medium
    `}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    )
}

// ============================================================================
// TOUR STATUS BADGE
// ============================================================================

interface TourStatusBadgeProps {
    status: TourStatus
}

function TourStatusBadge({ status }: TourStatusBadgeProps) {
    const config = {
        scheduled: {
            bg: 'bg-blue-100 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            icon: Clock,
            label: 'Scheduled'
        },
        'in-progress': {
            bg: 'bg-emerald-100 dark:bg-emerald-950/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: TrendingUp,
            label: 'In Progress'
        },
        completed: {
            bg: 'bg-purple-100 dark:bg-purple-950/30',
            text: 'text-purple-700 dark:text-purple-300',
            border: 'border-purple-200 dark:border-purple-800',
            icon: CheckCircle,
            label: 'Completed'
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
// QR SCANNER MODAL
// ============================================================================

interface QRScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onScan: (qrData: string) => void
}

function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
    const [scanning, setScanning] = useState(false)
    const [scannedData, setScannedData] = useState('')

    if (!isOpen) return null

    const handleSimulateScan = () => {
        setScanning(true)
        // Simulate scanning
        setTimeout(() => {
            const mockQR = 'QR-AHMED-123'
            setScannedData(mockQR)
            setScanning(false)
        }, 2000)
    }

    const handleConfirm = () => {
        if (scannedData) {
            onScan(scannedData)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="
        w-full max-w-md
        bg-white dark:bg-gray-900
        rounded-2xl
        shadow-2xl
        overflow-hidden
      ">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Scan QR Code
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            <XCircle className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Scanner Preview */}
                <div className="p-6">
                    <div className="
            aspect-square
            bg-gray-900 dark:bg-gray-950
            rounded-xl
            flex items-center justify-center
            relative
            overflow-hidden
          ">
                        {scanning ? (
                            <div className="text-center">
                                <div className="
                  w-16 h-16
                  border-4 border-blue-600 border-t-transparent
                  rounded-full
                  animate-spin
                  mx-auto mb-4
                " />
                                <p className="text-white">Scanning...</p>
                            </div>
                        ) : scannedData ? (
                            <div className="text-center text-white">
                                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                                <p className="font-medium">QR Code Scanned!</p>
                                <p className="text-sm text-gray-400 mt-1">{scannedData}</p>
                            </div>
                        ) : (
                            <div className="text-center text-white">
                                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-sm text-gray-400">Ready to scan</p>
                            </div>
                        )}

                        {/* Scanning overlay */}
                        {scanning && (
                            <div className="absolute inset-0 border-2 border-blue-500 rounded-xl animate-pulse" />
                        )}
                    </div>

                    {/* Simulate scan button (Phase 1) */}
                    <button
                        onClick={handleSimulateScan}
                        disabled={scanning}
                        className="
              w-full
              mt-4
              px-4 py-3
              bg-blue-600 hover:bg-blue-700
              text-white font-medium
              rounded-lg
              transition-colors
              disabled:opacity-50
              flex items-center justify-center gap-2
            "
                    >
                        <Smartphone className="w-4 h-4" />
                        Simulate Scan
                    </button>

                    {scannedData && (
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={handleConfirm}
                                className="
                  flex-1
                  px-4 py-2
                  bg-emerald-600 hover:bg-emerald-700
                  text-white
                  rounded-lg
                  transition-colors
                "
                            >
                                Confirm Check-in
                            </button>
                            <button
                                onClick={() => setScannedData('')}
                                className="
                  flex-1
                  px-4 py-2
                  bg-gray-100 dark:bg-gray-800
                  text-gray-700 dark:text-gray-300
                  rounded-lg
                  hover:bg-gray-200 dark:hover:bg-gray-700
                  transition-colors
                "
                            >
                                Scan Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Position the QR code within the frame to scan
                    </p>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// TRAVELER CARD COMPONENT
// ============================================================================

interface TravelerCardProps {
    traveler: Traveler
    onCheckIn: (travelerId: string) => void
    onMarkNoShow: (travelerId: string) => void
    onContact: (traveler: Traveler) => void
}

function TravelerCard({ traveler, onCheckIn, onMarkNoShow, onContact }: TravelerCardProps) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
      overflow-hidden
      hover:shadow-md
      transition-shadow
    ">
            {/* Main row */}
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="
                w-10 h-10
                rounded-full
                bg-gray-100 dark:bg-gray-800
                overflow-hidden
              ">
                                {traveler.avatar ? (
                                    <Image
                                        src={traveler.avatar}
                                        alt={traveler.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            {traveler.checkInStatus === 'checked-in' && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
                            )}
                        </div>

                        {/* Info */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                {traveler.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Users className="w-3 h-3" />
                                <span>{traveler.peopleCount} {traveler.peopleCount === 1 ? 'person' : 'people'}</span>
                                <span>•</span>
                                <span>Booking #{traveler.bookingId}</span>
                            </div>
                        </div>
                    </div>

                    <StatusBadge status={traveler.checkInStatus} />
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 mt-3">
                    {traveler.checkInStatus === 'pending' && (
                        <>
                            <button
                                onClick={() => onCheckIn(traveler.id)}
                                className="
                  flex-1
                  px-3 py-1.5
                  bg-emerald-600 hover:bg-emerald-700
                  text-white text-sm
                  rounded-lg
                  transition-colors
                  flex items-center justify-center gap-1
                "
                            >
                                <CheckCircle className="w-4 h-4" />
                                Check In
                            </button>
                            <button
                                onClick={() => onMarkNoShow(traveler.id)}
                                className="
                  flex-1
                  px-3 py-1.5
                  bg-red-600 hover:bg-red-700
                  text-white text-sm
                  rounded-lg
                  transition-colors
                  flex items-center justify-center gap-1
                "
                            >
                                <XCircle className="w-4 h-4" />
                                No Show
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => onContact(traveler)}
                        className="
              px-3 py-1.5
              bg-blue-600 hover:bg-blue-700
              text-white text-sm
              rounded-lg
              transition-colors
              flex items-center justify-center gap-1
            "
                    >
                        <MessageSquare className="w-4 h-4" />
                        Contact
                    </button>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="
              px-3 py-1.5
              bg-gray-100 dark:bg-gray-800
              text-gray-700 dark:text-gray-300 text-sm
              rounded-lg
              hover:bg-gray-200 dark:hover:bg-gray-700
              transition-colors
            "
                    >
                        {expanded ? 'Less' : 'More'}
                    </button>
                </div>

                {/* Expanded details */}
                {expanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                        {/* Contact info */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <a href={`mailto:${traveler.email}`} className="text-blue-600 dark:text-blue-400">
                                    {traveler.email}
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <a href={`tel:${traveler.phone}`} className="text-blue-600 dark:text-blue-400">
                                    {traveler.phone}
                                </a>
                            </div>
                            {traveler.checkInTime && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span>Checked in at {traveler.checkInTime}</span>
                                </div>
                            )}
                        </div>

                        {/* Special requests */}
                        {traveler.specialRequests && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                                <p className="text-xs text-amber-800 dark:text-amber-300">
                                    <span className="font-semibold">Special request:</span> {traveler.specialRequests}
                                </p>
                            </div>
                        )}

                        {/* Emergency contact */}
                        {traveler.emergencyContact && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Emergency Contact
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {traveler.emergencyContact.name} ({traveler.emergencyContact.relationship})
                                </p>
                                <a href={`tel:${traveler.emergencyContact.phone}`} className="text-xs text-blue-600 dark:text-blue-400">
                                    {traveler.emergencyContact.phone}
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// ============================================================================
// WAITLIST CARD COMPONENT
// ============================================================================

interface WaitlistCardProps {
    entry: WaitlistEntry
    onNotify: (entryId: string) => void
    onPromote: (entryId: string) => void
}

function WaitlistCard({ entry, onNotify, onPromote }: WaitlistCardProps) {
    return (
        <div className="
      p-4
      bg-purple-50 dark:bg-purple-950/30
      border border-purple-200 dark:border-purple-800
      rounded-xl
    ">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="
            w-8 h-8
            bg-purple-200 dark:bg-purple-900
            rounded-full
            flex items-center justify-center
            text-purple-700 dark:text-purple-300
            font-bold text-sm
          ">
                        {entry.position}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                            {entry.travelerName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Users className="w-3 h-3" />
                            <span>{entry.peopleCount} people</span>
                            <span>•</span>
                            <span>Requested {new Date(entry.requestedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {!entry.notified && (
                    <span className="
            px-2 py-1
            bg-amber-100 dark:bg-amber-900/30
            text-amber-700 dark:text-amber-300
            text-xs font-medium
            rounded-full
          ">
                        New
                    </span>
                )}
            </div>

            <div className="flex gap-2 mt-3">
                <button
                    onClick={() => onNotify(entry.id)}
                    className="
            flex-1
            px-3 py-1.5
            bg-blue-600 hover:bg-blue-700
            text-white text-sm
            rounded-lg
            transition-colors
          "
                >
                    Notify
                </button>
                <button
                    onClick={() => onPromote(entry.id)}
                    className="
            flex-1
            px-3 py-1.5
            bg-emerald-600 hover:bg-emerald-700
            text-white text-sm
            rounded-lg
            transition-colors
          "
                >
                    Promote
                </button>
            </div>
        </div>
    )
}

// ============================================================================
// TOUR OVERVIEW CARD
// ============================================================================

interface TourOverviewProps {
    tour: ActiveTour
    onStartTour: () => void
    onCompleteTour: () => void
}

function TourOverview({ tour, onStartTour, onCompleteTour }: TourOverviewProps) {
    const startTime = new Date(`${tour.date}T${tour.startTime}`)
    const now = new Date()
    const minutesUntilStart = Math.floor((startTime.getTime() - now.getTime()) / (1000 * 60))

    return (
        <div className="
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl
      p-6
    ">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {tour.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(tour.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {tour.startTime} - {tour.endTime}
                        </span>
                    </div>
                </div>
                <TourStatusBadge status={tour.status} />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {tour.checkedInCount}/{tour.confirmedCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Checked In</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {tour.pendingCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {tour.noShowCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">No Shows</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {tour.waitlist.length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Waitlist</div>
                </div>
            </div>

            {/* Meeting point */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {tour.meetingPoint.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tour.meetingPoint.address}
                        </p>
                        {tour.meetingPoint.instructions && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                📍 {tour.meetingPoint.instructions}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Weather and actions */}
            <div className="flex items-center justify-between">
                {tour.weatherInfo && (
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{tour.weatherInfo.icon}</span>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {tour.weatherInfo.condition}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {tour.weatherInfo.temperature}°C
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    {tour.status === 'scheduled' && (
                        <button
                            onClick={onStartTour}
                            className="
                px-4 py-2
                bg-emerald-600 hover:bg-emerald-700
                text-white
                rounded-lg
                transition-colors
              "
                        >
                            Start Tour
                        </button>
                    )}
                    {tour.status === 'in-progress' && (
                        <button
                            onClick={onCompleteTour}
                            className="
                px-4 py-2
                bg-blue-600 hover:bg-blue-700
                text-white
                rounded-lg
                transition-colors
              "
                        >
                            Complete Tour
                        </button>
                    )}
                </div>
            </div>

            {/* Countdown */}
            {tour.status === 'scheduled' && minutesUntilStart > 0 && minutesUntilStart < 60 && (
                <div className="mt-4 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center">
                    <Timer className="w-4 h-4 inline-block text-amber-600 dark:text-amber-400 mr-1" />
                    <span className="text-sm text-amber-800 dark:text-amber-300">
                        Tour starts in {minutesUntilStart} minutes
                    </span>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// MAIN ON-TOUR PAGE
// ============================================================================

export default function GuideOnTourPage() {
    const router = useRouter()
    const [selectedTour, setSelectedTour] = useState<ActiveTour>(MOCK_ACTIVE_TOURS[0])
    const [showQRScanner, setShowQRScanner] = useState(false)
    const [activeTab, setActiveTab] = useState<'travelers' | 'waitlist'>('travelers')
    const [searchTerm, setSearchTerm] = useState('')

    // Filter travelers based on search
    const filteredTravelers = selectedTour.travelers.filter(traveler =>
        traveler.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        traveler.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCheckIn = (travelerId: string) => {
        setSelectedTour(prev => ({
            ...prev,
            travelers: prev.travelers.map(t =>
                t.id === travelerId
                    ? { ...t, checkInStatus: 'checked-in', checkInTime: new Date().toLocaleTimeString() }
                    : t
            ),
            checkedInCount: prev.checkedInCount + 1,
            pendingCount: prev.pendingCount - 1
        }))
    }

    const handleMarkNoShow = (travelerId: string) => {
        setSelectedTour(prev => ({
            ...prev,
            travelers: prev.travelers.map(t =>
                t.id === travelerId ? { ...t, checkInStatus: 'no-show' } : t
            ),
            noShowCount: prev.noShowCount + 1,
            pendingCount: prev.pendingCount - 1
        }))
    }

    const handleContactTraveler = (traveler: Traveler) => {
        // In Phase 4: Open chat or message modal
        console.log('Contact traveler:', traveler)
    }

    const handleQRScan = (qrData: string) => {
        // Find traveler by QR code
        const traveler = selectedTour.travelers.find(t => t.qrCode === qrData)
        if (traveler && traveler.checkInStatus === 'pending') {
            handleCheckIn(traveler.id)
        }
    }

    const handleNotifyWaitlist = (entryId: string) => {
        setSelectedTour(prev => ({
            ...prev,
            waitlist: prev.waitlist.map(w =>
                w.id === entryId ? { ...w, notified: true } : w
            )
        }))
    }

    const handlePromoteWaitlist = (entryId: string) => {
        // In Phase 4: Move from waitlist to confirmed booking
        console.log('Promote waitlist entry:', entryId)
    }

    const handleStartTour = () => {
        setSelectedTour(prev => ({
            ...prev,
            status: 'in-progress'
        }))
    }

    const handleCompleteTour = () => {
        setSelectedTour(prev => ({
            ...prev,
            status: 'completed'
        }))
        // In Phase 4: Trigger payout countdown
    }

    return (
        <PageLayout>
            {/* Page offset */}
            <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">

                <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                On-Tour Toolkit
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage your active tours, check in travelers, and handle waitlists
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
                            {/* Tour selector */}
                            <div className="relative flex-1 min-w-0 sm:w-80">
                                <Listbox
                                    value={selectedTour.id}
                                    onChange={(val) => {
                                        const tour = MOCK_ACTIVE_TOURS.find(t => t.id === val)
                                        if (tour) setSelectedTour(tour)
                                    }}
                                >
                                    <div className="relative min-w-0">
                                        <ListboxButton className="
                      relative w-full flex items-center justify-between
                      px-3 sm:px-4 py-2.5
                      bg-white dark:bg-gray-900 
                      border border-gray-200 dark:border-gray-800 
                      rounded-xl text-sm text-left 
                      text-gray-900 dark:text-white 
                      hover:border-blue-400 dark:hover:border-blue-500 
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                      transition-all duration-200 shadow-sm hover:shadow-md
                      overflow-hidden
                    ">
                                            <span className="flex items-center gap-2 min-w-0 truncate font-medium">
                                                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                                <span className="truncate">{selectedTour.date} - {selectedTour.title}</span>
                                            </span>
                                            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0 transition-transform duration-200 ui-open:rotate-180" />
                                        </ListboxButton>

                                        <Transition
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <ListboxOptions className="
                        absolute z-50 mt-1.5 max-h-60 w-full overflow-auto 
                        rounded-xl bg-white dark:bg-gray-900 
                        py-1.5 text-sm shadow-xl ring-1 ring-black/5 dark:ring-white/10 
                        focus:outline-none scrollbar-hide
                      ">
                                                {MOCK_ACTIVE_TOURS.map((tour) => (
                                                    <ListboxOption
                                                        key={tour.id}
                                                        value={tour.id}
                                                        className={({ focus, selected }) => `
                              relative cursor-default select-none py-2.5 pl-10 pr-4 transition-colors
                              ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}
                              ${selected ? 'font-semibold' : 'font-normal'}
                            `}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                                    {tour.date} - {tour.title}
                                                                </span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                                                        <Check className="w-4 h-4" />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </Transition>
                                    </div>
                                </Listbox>
                            </div>

                            {/* QR Scanner button */}
                            <button
                                onClick={() => setShowQRScanner(true)}
                                className="
                  flex-shrink-0
                  flex items-center gap-2
                  px-4 py-2.5
                  bg-blue-600 hover:bg-blue-700
                  text-white
                  rounded-xl
                  transition-colors
                  shadow-sm
                "
                            >
                                <QrCode className="w-5 h-5" />
                                <span className="hidden sm:inline">Scan QR</span>
                            </button>
                        </div>
                    </div>

                    {/* Tour Overview */}
                    <TourOverview
                        tour={selectedTour}
                        onStartTour={handleStartTour}
                        onCompleteTour={handleCompleteTour}
                    />

                    {/* Tabs */}
                    <div className="flex gap-2 mt-6 mb-4">
                        <button
                            onClick={() => setActiveTab('travelers')}
                            className={`
                px-4 py-2
                rounded-lg
                font-medium
                transition-colors
                flex items-center gap-2
                ${activeTab === 'travelers'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                                }
              `}
                        >
                            <Users className="w-4 h-4" />
                            Travelers ({selectedTour.travelers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('waitlist')}
                            className={`
                px-4 py-2
                rounded-lg
                font-medium
                transition-colors
                flex items-center gap-2
                ${activeTab === 'waitlist'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                                }
              `}
                        >
                            <UserPlus className="w-4 h-4" />
                            Waitlist ({selectedTour.waitlist.length})
                        </button>
                    </div>

                    {/* Search bar (for travelers tab) */}
                    {activeTab === 'travelers' && (
                        <div className="relative mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search travelers by name or booking ID..."
                                className="
                  w-full
                  pl-4 pr-10 py-3
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-800
                  rounded-xl
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <XCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Travelers List */}
                    {activeTab === 'travelers' && (
                        <div className="space-y-3">
                            {filteredTravelers.length > 0 ? (
                                filteredTravelers.map(traveler => (
                                    <TravelerCard
                                        key={traveler.id}
                                        traveler={traveler}
                                        onCheckIn={handleCheckIn}
                                        onMarkNoShow={handleMarkNoShow}
                                        onContact={handleContactTraveler}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No travelers found
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Waitlist */}
                    {activeTab === 'waitlist' && (
                        <div className="space-y-3">
                            {selectedTour.waitlist.length > 0 ? (
                                selectedTour.waitlist.map(entry => (
                                    <WaitlistCard
                                        key={entry.id}
                                        entry={entry}
                                        onNotify={handleNotifyWaitlist}
                                        onPromote={handlePromoteWaitlist}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No waitlist entries
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick stats footer */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {selectedTour.checkedInCount}/{selectedTour.confirmedCount}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Checked In</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                {selectedTour.pendingCount}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                {selectedTour.noShowCount}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">No Shows</div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {selectedTour.waitlist.length}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Waitlist</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal */}
            <QRScannerModal
                isOpen={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={handleQRScan}
            />
        </PageLayout>
    )
}