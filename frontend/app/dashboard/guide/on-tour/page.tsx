// ============================================================================
// GUIDE ON-TOUR TOOLKIT — WIRED TO REAL BACKEND
// ============================================================================
// LOCATION: /frontend/app/dashboard/guide/on-tour/page.tsx
//
// PURPOSE: Tools for guides during active tours — check-in, QR scanner,
//          tour completion. All data comes from the booking API.
//
// KEY CONSTRAINTS:
// - Guides have NO access to /api/traveler/waitlist — waitlist is read as a
//   count only (the backend auto-promotes when a spot opens).
// - No-show reporting is a future card — button is disabled with tooltip.
// - QR scanner sends the raw UUID token to checkInByQrToken().
// ============================================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
    QrCode,
    Camera,
    Users,
    User,
    Clock,
    CheckCircle,
    XCircle,
    UserPlus,
    Calendar,
    MapPin,
    Phone,
    Mail,
    MessageSquare,
    ChevronDown,
    Check,
    RefreshCw,
    Smartphone,
    Timer,
    TrendingUp,
    Loader2,
    Info,
    Sparkles,
    ExternalLink
} from 'lucide-react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

// API functions — all booking mutations go through this layer
import {
    getGuideBookings,
    confirmBooking,
    rejectBooking,
    noShowBooking,
    checkInByQrToken,
    completeBooking,
} from '@/src/lib/api/tours'
import { BookingStatus, GuideBookingResponse } from '@/src/lib/types/tour.types'

// ============================================================================
// TYPE: Occurrence group — bookings grouped by occurrence for the selector
// ============================================================================

interface OccurrenceGroup {
    occurrenceId: number
    tourId: number
    tourTitle: string
    startTimeUtc: string
    endTimeUtc: string
    bookings: GuideBookingResponse[]
}

// ============================================================================
// HELPER: Map backend BookingStatus to check-in display status
// ============================================================================
// The backend has no "no-show" status yet (future card), so we only show
// the statuses the backend actually returns for this context.

type CheckInDisplay = 'pending' | 'confirmed' | 'checked-in' | 'cancelled'

function mapToCheckInDisplay(status: BookingStatus | string): CheckInDisplay {
    switch (status) {
        case BookingStatus.InProgress:
        case BookingStatus.Completed:
            return 'checked-in'
        case BookingStatus.Cancelled:
            return 'cancelled'
        case BookingStatus.Confirmed:
            return 'confirmed'
        default:
            return 'pending' // PendingGuide, PendingPayment all show as "pending"
    }
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
    status: CheckInDisplay
}

function StatusBadge({ status }: StatusBadgeProps) {
    const config = {
        pending: {
            bg: 'bg-amber-100 dark:bg-amber-950/30',
            text: 'text-amber-700 dark:text-amber-300',
            border: 'border-amber-200 dark:border-amber-800',
            icon: Clock,
            label: 'Awaiting'
        },
        confirmed: {
            bg: 'bg-blue-100 dark:bg-blue-950/30',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200 dark:border-blue-800',
            icon: Check,
            label: 'Confirmed'
        },
        'checked-in': {
            bg: 'bg-emerald-100 dark:bg-emerald-950/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: CheckCircle,
            label: 'Checked In'
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

// Determines the overall "tour status" from its bookings:
// - If any booking is InProgress → "in-progress"
// - If all bookings are Completed → "completed"
// - Otherwise → "scheduled" (waiting for check-ins to begin)
type TourStatus = 'scheduled' | 'in-progress' | 'completed'

function deriveTourStatus(bookings: GuideBookingResponse[]): TourStatus {
    const hasInProgress = bookings.some(b => b.status === BookingStatus.InProgress)
    const allCompleted = bookings.length > 0 && bookings.every(
        b => b.status === BookingStatus.Completed || b.status === BookingStatus.Cancelled
    )
    if (allCompleted) return 'completed'
    if (hasInProgress) return 'in-progress'
    return 'scheduled'
}

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
    // Manual input fallback — guide can type the UUID if camera fails
    const [manualInput, setManualInput] = useState('')

    if (!isOpen) return null

    // Simulate a QR scan. In production, this would use a real scanner library.
    // For this project, we provide a "Scan from Clipboard" button to make 
    // it easy to test with the traveler's token.
    const handleSimulateScan = () => {
        setScanning(true)
        setTimeout(() => {
            if (manualInput.trim()) {
                setScannedData(manualInput.trim())
            }
            setScanning(false)
        }, 1200)
    }

    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (text.length > 10) { // Basic UUID check length
                setManualInput(text)
                toast.success('Token pasted from clipboard!')
            } else {
                toast.error('Clipboard does not contain a valid token')
            }
        } catch (err) {
            toast.error('Could not access clipboard')
        }
    }

    const handleConfirm = () => {
        const token = scannedData || manualInput.trim()
        if (token) {
            onScan(token)
            setScannedData('')
            setManualInput('')
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 shadow-2xl backdrop-blur-sm">
            <div className="
        w-full max-w-md
        bg-white dark:bg-gray-900
        rounded-3xl
        shadow-2xl
        overflow-hidden
        border border-gray-200 dark:border-gray-800
      ">
                {/* Header */}
                <div className="p-6 bg-blue-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <QrCode className="w-6 h-6 text-white" />
                            <h3 className="text-xl font-bold text-white">
                                Ticket Scanner
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Scanner Content */}
                <div className="p-8">
                    {/* Scanner Rect */}
                    <div className="
            aspect-square
            bg-gray-900 dark:bg-gray-950
            rounded-3xl
            flex items-center justify-center
            relative
            overflow-hidden
            border-2 border-gray-100 dark:border-gray-800
          ">
                        {scanning ? (
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                                <p className="text-white font-medium">Analyzing...</p>
                            </div>
                        ) : scannedData ? (
                            <div className="text-center text-white px-6">
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-10 h-10 text-white" />
                                </div>
                                <p className="text-lg font-bold">Successfully Scanned!</p>
                                <p className="text-xs text-emerald-400 mt-2 break-all opacity-80">{scannedData}</p>
                            </div>
                        ) : (
                            <div className="text-center text-white p-8">
                                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                                <p className="text-sm text-gray-400">Scan traveler&apos;s digital ticket</p>
                                {/* Overlay scan lines */}
                                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500/30 blur-[1px] animate-[pulse_1s_infinite]" />
                            </div>
                        )}

                        {/* Animated Scanning Frame */}
                        {scanning && (
                            <div className="absolute inset-10 border-2 border-blue-500 rounded-xl">
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-[scan_2s_linear_infinite]" />
                                <style jsx>{`
                                    @keyframes scan {
                                        0% { top: 0%; }
                                        50% { top: 100%; }
                                        100% { top: 0%; }
                                    }
                                `}</style>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                placeholder="Paste or type Token UUID..."
                                className="
                  w-full px-4 py-4
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-2xl text-sm
                  text-gray-900 dark:text-white
                  placeholder-gray-400
                  focus:outline-none focus:ring-4 focus:ring-blue-500/10
                "
                            />
                            <button
                                onClick={handlePasteFromClipboard}
                                title="Paste from clipboard"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                <Smartphone className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleSimulateScan}
                                disabled={scanning || scannedData !== ''}
                                className="
                  flex items-center justify-center gap-2
                  px-4 py-4
                  bg-blue-600 hover:bg-blue-700
                  text-white font-bold
                  rounded-2xl
                  transition-all
                  disabled:opacity-50
                  shadow-lg shadow-blue-500/20
                "
                            >
                                <Camera className="w-5 h-5" />
                                {manualInput ? 'Apply' : 'Scan'}
                            </button>

                            <button
                                onClick={handleConfirm}
                                disabled={!scannedData && !manualInput.trim()}
                                className="
                  flex-1
                  px-4 py-4
                  bg-emerald-600 hover:bg-emerald-700
                  text-white font-bold
                  rounded-2xl
                  transition-all
                  disabled:opacity-50
                  shadow-lg shadow-emerald-500/20
                "
                            >
                                Confirm
                            </button>
                        </div>
                    </div>

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
    booking: GuideBookingResponse
    onNoShow: (bookingId: number) => void
    onContact: (booking: GuideBookingResponse) => void
    now: Date
}

// Renders one traveler's booking as a card with check-in actions.
function TravelerCard({ booking, onNoShow, onContact, now }: TravelerCardProps) {
    const [expanded, setExpanded] = useState(false)
    const displayStatus = mapToCheckInDisplay(booking.status)

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
                        {/* Avatar placeholder */}
                        <div className="relative">
                            <div className="
                w-10 h-10
                rounded-full
                bg-gray-100 dark:bg-gray-800
                overflow-hidden
                flex items-center justify-center
              ">
                                <User className="w-5 h-5 text-gray-400" />
                            </div>
                            {displayStatus === 'checked-in' && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
                            )}
                        </div>

                        {/* Info */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                {booking.traveler?.fullName || 'Unknown Traveler'}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Users className="w-3 h-3" />
                                <span>{booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}</span>
                                <span>•</span>
                                <span>Booking #{booking.id}</span>
                            </div>
                        </div>
                    </div>

                    <StatusBadge status={displayStatus} />
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 mt-3">
                    {/* No-show button — enabled after tour starts */}
                    {booking.status === BookingStatus.Confirmed && (
                        <button
                            onClick={() => onNoShow(booking.id)}
                            disabled={new Date(now) < new Date(booking.startTimeUtc)}
                            title={new Date(now) < new Date(booking.startTimeUtc) ? "Only available after tour starts" : "Mark as No-Show"}
                            className={`
                  flex-1
                  px-3 py-1.5
                  text-sm
                  rounded-lg
                  transition-colors
                  flex items-center justify-center gap-1
                  ${new Date(now) < new Date(booking.startTimeUtc)
                                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }
                `}
                        >
                            <XCircle className="w-4 h-4" />
                            No Show
                        </button>
                    )}
                    <button
                        onClick={() => onContact(booking)}
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
                    {/* Manual check-in button REMOVED — QR code is mandatory */}
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

                {/* Expanded details — shows traveler contact info and check-in time */}
                {expanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <a href={`mailto:${booking.traveler?.email}`} className="text-blue-600 dark:text-blue-400">
                                    {booking.traveler?.email}
                                </a>
                            </div>
                            {booking.traveler?.phoneE164 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <a href={`tel:${booking.traveler.phoneE164}`} className="text-blue-600 dark:text-blue-400">
                                        {booking.traveler.phoneE164}
                                    </a>
                                </div>
                            )}

                            {/* Traveler's personalized message / request note */}
                            {booking.message && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1 text-blue-800 dark:text-blue-300">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Note from Traveler</span>
                                    </div>
                                    <p className="text-sm text-blue-700 dark:text-blue-200 indent-0 italic">
                                        &ldquo;{booking.message}&rdquo;
                                    </p>
                                </div>
                            )}
                            {/* Show check-in timestamp if guide has already scanned this traveler */}
                            {booking.checkedInAtUtc && (
                                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Checked in at {new Date(booking.checkedInAtUtc).toLocaleTimeString()}</span>
                                </div>
                            )}
                            {/* Show completion timestamp for audit trail */}
                            {booking.completedAtUtc && (
                                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Completed at {new Date(booking.completedAtUtc).toLocaleTimeString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ============================================================================
// TOUR OVERVIEW CARD
// ============================================================================

interface TourOverviewProps {
    group: OccurrenceGroup
    tourStatus: TourStatus
    onCompleteTour: () => void
}

// Displays the selected occurrence's summary with stats, meeting time, and
// the "Complete Tour" button (which marks all InProgress bookings as Completed).
function TourOverview({ group, tourStatus, onCompleteTour }: TourOverviewProps) {
    const startTime = new Date(group.startTimeUtc)
    const endTime = new Date(group.endTimeUtc)
    const currentTime = new Date()
    const minutesUntilStart = Math.floor((startTime.getTime() - currentTime.getTime()) / (1000 * 60))

    // Compute stats from real bookings
    const confirmedCount = group.bookings.filter(
        b => b.status === BookingStatus.Confirmed
    ).length
    const checkedInCount = group.bookings.filter(
        b => b.status === BookingStatus.InProgress || b.status === BookingStatus.Completed
    ).length
    const totalBookings = group.bookings.length

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
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {group.tourTitle}
                        </h2>
                        <Link
                            href={`/tours/${group.tourId}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                            title="View Public Tour Page"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {startTime.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            <Timer className="w-3.5 h-3.5" />
                            {Math.round((endTime.getTime() - startTime.getTime()) / 3600000 * 10) / 10}h Duration
                        </span>
                    </div>
                </div>
                <TourStatusBadge status={tourStatus} />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {checkedInCount}/{totalBookings}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Checked In</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {confirmedCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pending Check-in</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {totalBookings}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Bookings</div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end">
                <div className="flex gap-2">
                    {/* Complete Tour: marks all InProgress bookings as Completed.
                        Only shows when at least one booking is InProgress. */}
                    {tourStatus === 'in-progress' && (
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

            {/* Countdown timer — shows when tour is scheduled and starting soon */}
            {tourStatus === 'scheduled' && minutesUntilStart > 0 && minutesUntilStart < 60 && (
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

    // All guide bookings, grouped by occurrence for the tour selector
    const [groups, setGroups] = useState<OccurrenceGroup[]>([])
    // The currently selected occurrence group (one "active tour")
    const [selectedGroup, setSelectedGroup] = useState<OccurrenceGroup | null>(null)
    const [isScannerOpen, setIsScannerOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'travelers' | 'info'>('travelers')
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [now, setNow] = useState(new Date())

    // Update 'now' every minute to keep time-gated buttons fresh
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    // ── Data loading ──────────────────────────────────────────────────────────
    // Fetch all guide bookings then group by occurrenceId.
    // We show Confirmed and InProgress bookings as "active" occurrences;
    // Completed bookings are also shown so the guide can see the full roster
    // once the tour is done.

    const fetchActiveBookings = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getGuideBookings()
            const bookings: GuideBookingResponse[] = res.data || []

            // Group bookings by occurrence — each occurrence = one tour run
            const grouped = bookings.reduce((acc, booking) => {
                const id = booking.occurrenceId
                if (!acc[id]) {
                    acc[id] = {
                        occurrenceId: id,
                        tourId: booking.tourId,
                        tourTitle: booking.tourTitle,
                        startTimeUtc: booking.startTimeUtc,
                        endTimeUtc: booking.endTimeUtc,
                        bookings: []
                    }
                }
                acc[id].bookings.push(booking)
                return acc
            }, {} as Record<number, OccurrenceGroup>)

            const occurrenceGroups = Object.values(grouped)
            setGroups(occurrenceGroups)

            // Update selected group without creating a circular dependency
            setSelectedGroup(prev => {
                if (occurrenceGroups.length === 0) return null
                if (!prev) return occurrenceGroups[0]
                
                // Re-select same occurrence to preserve context, or fallback to first
                const refreshed = occurrenceGroups.find(g => g.occurrenceId === prev.occurrenceId)
                return refreshed || occurrenceGroups[0]
            })
        } catch {
            toast.error('Failed to load active tours')
        } finally {
            setIsLoading(false)
        }
    }, []) // Stable dependency array prevents infinite loops

    // Load bookings on mount
    useEffect(() => {
        fetchActiveBookings()
    }, [fetchActiveBookings])

    // ── Handlers ──────────────────────────────────────────────────────────────


    // Called by the QR scanner modal when a token is confirmed.
    // The raw UUID scanned from the traveler's QR code is sent directly
    // to the backend, which validates it against this guide's own occurrences.
    const handleQRScan = async (qrToken: string) => {
        setIsProcessing(true)
        try {
            const res = await checkInByQrToken(qrToken)
            toast.success(`${res.data.traveler?.fullName || 'Traveler'} checked in!`)
            fetchActiveBookings()
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'QR check-in failed';
            
            if (err.response?.status === 404) {
                toast.error('QR code not recognized or not your tour')
            } else {
                toast.error(errorMessage)
            }
        } finally {
            setIsProcessing(false)
        }
    }

    const handleNoShow = async (bookingId: number) => {
        if (!confirm('Are you sure you want to mark this traveler as a No-Show? This will cancel their booking.')) return

        setIsProcessing(true)
        try {
            await noShowBooking(bookingId, { reason: 'No-Show' })
            toast.success('Traveler marked as No-Show')
            fetchActiveBookings()
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to report no-show')
        } finally {
            setIsProcessing(false)
        }
    }

    // Contact traveler — future chat card
    const onContact = (booking: GuideBookingResponse) => {
        if (booking.traveler?.email) {
            window.location.href = `mailto:${booking.traveler.email}`
        }
    }

    // Complete tour — marks ALL InProgress bookings for this occurrence as Completed.
    // completedAtUtc starts the 48h payout freeze (future payout card).
    const handleCompleteTour = async () => {
        if (!selectedGroup) return
        const inProgressBookings = selectedGroup.bookings.filter(
            b => b.status === BookingStatus.InProgress
        )
        if (inProgressBookings.length === 0) {
            toast.error('No in-progress bookings to complete')
            return
        }
        setIsProcessing(true)
        try {
            await Promise.all(inProgressBookings.map(b => completeBooking(b.id)))
            toast.success('Tour marked as completed!')
            fetchActiveBookings()
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to complete tour')
        } finally {
            setIsProcessing(false)
        }
    }

    // Derived state — filter travelers by search term within the selected group
    const filteredBookings = selectedGroup
        ? selectedGroup.bookings.filter(b =>
            (b.traveler?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(b.id).includes(searchTerm)
        )
        : []

    const tourStatus = selectedGroup ? deriveTourStatus(selectedGroup.bookings) : 'scheduled'

    // ── Loading state ─────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    // ── Empty state — no active bookings ──────────────────────────────────────

    if (groups.length === 0) {
        return (
            <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="container-safe mx-auto max-w-7xl py-8 sm:py-10">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        On-Tour Toolkit
                    </h1>
                    <div className="text-center py-20">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            No Active Tours
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            You don&apos;t have any upcoming tours with confirmed bookings yet.
                            Once travelers book your tours, they&apos;ll appear here.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <>
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
                                Manage your active tours, check in travelers, and track progress
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
                            {/* Tour selector — picks which occurrence to manage */}
                            <div className="relative flex-1 min-w-0 sm:w-80">
                                <Listbox
                                    value={selectedGroup?.occurrenceId || 0}
                                    onChange={(val) => {
                                        const group = groups.find(g => g.occurrenceId === val)
                                        if (group) setSelectedGroup(group)
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
                                                <span className="truncate">
                                                    {selectedGroup
                                                        ? `${new Date(selectedGroup.startTimeUtc).toLocaleDateString()} - ${selectedGroup.tourTitle}`
                                                        : 'Select a tour'}
                                                </span>
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
                                                {groups.map((group) => (
                                                    <ListboxOption
                                                        key={group.occurrenceId}
                                                        value={group.occurrenceId}
                                                        className={({ focus, selected }) => `
                              relative cursor-default select-none py-2.5 pl-10 pr-4 transition-colors
                              ${focus ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200'}
                              ${selected ? 'font-semibold' : 'font-normal'}
                            `}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                                    {new Date(group.startTimeUtc).toLocaleDateString()} - {group.tourTitle}
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

                            {/* Refresh button */}
                            <button
                                onClick={fetchActiveBookings}
                                disabled={isProcessing}
                                className="
                  flex-shrink-0
                  p-2.5
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-800
                  rounded-xl
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  transition-colors
                "
                            >
                                <RefreshCw className={`w-5 h-5 text-gray-500 ${isProcessing ? 'animate-spin' : ''}`} />
                            </button>

                            {/* QR Scanner button */}
                            <button
                                onClick={() => setIsScannerOpen(true)}
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
                    {selectedGroup && (
                        <TourOverview
                            group={selectedGroup}
                            tourStatus={tourStatus}
                            onCompleteTour={handleCompleteTour}
                        />
                    )}

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
                            Travelers ({selectedGroup?.bookings.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`
                px-4 py-2
                rounded-lg
                font-medium
                transition-colors
                flex items-center gap-2
                ${activeTab === 'info'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                                }
              `}
                        >
                            <Info className="w-4 h-4" />
                            Info
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
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map(booking => (
                                    <TravelerCard
                                        key={booking.id}
                                        booking={booking}
                                        now={now}
                                        onNoShow={handleNoShow}
                                        onContact={onContact}
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

                    {/* Info tab — waitlist is read-only for guides, explain auto-promotion */}
                    {activeTab === 'info' && (
                        <div className="space-y-4">
                            {/* Waitlist explainer — guides have no waitlist management API */}
                            <div className="
                p-4 
                bg-purple-50 dark:bg-purple-950/20
                border border-purple-200 dark:border-purple-800
                rounded-xl
              ">
                                <div className="flex items-start gap-3">
                                    <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">
                                            Waitlist
                                        </h3>
                                        <p className="text-sm text-purple-700 dark:text-purple-300">
                                            Travelers manage their own waitlist entries. When a confirmed booking
                                            is cancelled, the first eligible waitlisted traveler is automatically
                                            promoted to a real booking by the system — no guide action required.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* How check-in works */}
                            <div className="
                p-4 
                bg-blue-50 dark:bg-blue-950/20
                border border-blue-200 dark:border-blue-800
                rounded-xl
              ">
                                <div className="flex items-start gap-3">
                                    <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                                            QR Check-in
                                        </h3>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Scan the traveler&apos;s QR code at the meeting point to verify their ticket. 
                                            This is mandatory for check-in and moves their booking from Confirmed to In Progress.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick stats footer */}
                    {selectedGroup && (
                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {selectedGroup.bookings.filter(b => b.status === BookingStatus.InProgress || b.status === BookingStatus.Completed).length}/{selectedGroup.bookings.length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Checked In</div>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                    {selectedGroup.bookings.filter(b => b.status === BookingStatus.Confirmed).length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    {selectedGroup.bookings.length}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Total Bookings</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* QR Scanner Modal */}
            <QRScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleQRScan}
            />
        </>
    )
}