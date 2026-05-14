// ============================================================================
// GUIDE ON-TOUR TOOLKIT — WIRED TO REAL BACKEND
// ============================================================================
// LOCATION: /frontend/app/dashboard/guide/on-tour/page.tsx
//
// PURPOSE: Tools for guides during active tours — check-in, QR scanner,
// tour completion. All data comes from the booking API.
//
// KEY CONSTRAINTS:
// - Guides have NO access to /api/traveler/waitlist — waitlist is read as a
// count only (the backend auto-promotes when a spot opens).
// - No-show reporting is a future card — button is disabled with tooltip.
// - QR scanner sends the raw UUID token to checkInByQrToken().
// ============================================================================

'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import GuideOnTourSkeleton from './skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  QrCode,
  Users,
  User,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Calendar,
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
  ExternalLink,
  AlertCircle,
  Search
} from 'lucide-react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

// API functions — all booking mutations go through this layer
import {
  getGuideBookings,
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
      return 'pending'
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
    pending: { className: 'badge-warning', icon: Clock, label: 'Awaiting' },
    confirmed: { className: 'badge-accent', icon: Check, label: 'Confirmed' },
    'checked-in': { className: 'badge-success', icon: CheckCircle, label: 'Checked In' },
    cancelled: { className: 'badge-neutral', icon: XCircle, label: 'Cancelled' }
  }

  const { className, icon: Icon, label } = config[status]

  return (
    <span className={`badge-base ${className} gap-1 px-2 py-0.5 text-[10px] capitalize tracking-normal`}>
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  )
}

// ============================================================================
// TOUR STATUS BADGE
// ============================================================================

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
    scheduled: { className: 'badge-accent', icon: Clock, label: 'Scheduled' },
    'in-progress': { className: 'badge-success', icon: TrendingUp, label: 'In Progress' },
    completed: { className: 'badge-primary', icon: CheckCircle, label: 'Completed' }
  }

  const { className, icon: Icon, label } = config[status]

  return (
    <span className={`badge-base ${className} gap-1.5 px-3 py-1 text-[11px] capitalize tracking-normal`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

// ============================================================================
// QR SCANNER MODAL
// ============================================================================

import { Html5Qrcode } from 'html5-qrcode'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScan: (qrData: string) => void
}

function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isSecureContext, setIsSecureContext] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const regionId = "reader"

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSecureContext(false)
        setCameraError("Camera access requires HTTPS on mobile browsers.")
        return
      }
      setIsSecureContext(true)

      const html5QrCode = new Html5Qrcode(regionId)
      scannerRef.current = html5QrCode

      const startScanner = async () => {
        try {
          setScanning(true)
          setCameraError(null)
          
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              setScannedData(decodedText)
              if (decodedText.length > 20) {
                onScan(decodedText)
                onClose()
              }
              html5QrCode.stop().catch(console.error)
              setScanning(false)
            },
            () => {}
          )
        } catch (err: any) {
          console.error("Camera error:", err)
          if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            setCameraError("Camera requires HTTPS on mobile. Use localhost or an HTTPS tunnel (like ngrok).")
          } else {
            setCameraError("Camera access denied or unavailable.")
          }
          setScanning(false)
        }
      }

      const timer = setTimeout(startScanner, 300)
      return () => clearTimeout(timer)
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
      scannerRef.current = null
    }
  }, [isOpen, onScan, onClose])

  if (!isOpen) return null

  const handleConfirmManual = () => {
    const token = manualInput.trim()
    if (token) {
      onScan(token)
      setManualInput('')
      onClose()
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.length > 10) {
        setManualInput(text)
        toast.success('Token pasted!')
      }
    } catch (err) {
      toast.error('Clipboard access denied')
    }
  }

  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const tempScanner = scannerRef.current || new Html5Qrcode(regionId)
    
    setIsProcessingFile(true)
    try {
      const result = await tempScanner.scanFile(file, true)
      setScannedData(result)
      toast.success('QR Code detected!')
      setTimeout(() => {
        onScan(result)
        onClose()
      }, 1000)
    } catch (err) {
      toast.error('Could not find a QR code in this image.')
    } finally {
      setIsProcessingFile(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md surface-card rounded-3xl shadow-2xl overflow-hidden border border-theme">
        <div className="p-6 bg-primary-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <QrCode className="w-6 h-6" />
              <h3 className="text-xl font-bold">Ticket Scanner</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="relative aspect-square surface-base rounded-2xl overflow-hidden border-2 border-theme bg-black">
            <div id={regionId} className="w-full h-full" />
            {!scanning && !scannedData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40">
                {cameraError ? (
                  <>
                    <AlertCircle className="w-12 h-12 text-danger-red mb-3" />
                    <p className="text-sm text-white font-medium">{cameraError}</p>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-12 h-12 text-primary-light animate-spin mb-3" />
                    <p className="text-sm text-white font-medium">Starting camera...</p>
                  </>
                )}
              </div>
            )}
            {scannedData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-600/90 text-white p-6 animate-in fade-in zoom-in duration-300">
                <CheckCircle className="w-16 h-16 mb-4" />
                <p className="text-lg font-bold">Scanned Successfully!</p>
              </div>
            )}
            {scanning && !scannedData && (
              <div className="absolute inset-x-0 top-0 h-1 bg-primary-light shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_3s_linear_infinite]" />
            )}
          </div>

          {!isSecureContext && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                <p className="font-bold mb-1">Testing on Mobile WiFi?</p>
                Browsers block live cameras on HTTP. You can still scan by taking a photo of the QR code below.
              </div>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile}
              className="w-full py-3 surface-section hover:surface-hover border border-theme text-theme-primary font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4 text-primary-light" />
              {isProcessingFile ? 'Processing Image...' : 'Take Photo or Upload Image'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment"
              onChange={handleFileScan}
            />
          </div>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Or enter token manually..."
                className="w-full px-4 py-3 surface-section border border-theme rounded-xl text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              <button onClick={handlePasteFromClipboard} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-theme-muted hover:text-primary-light transition-colors">
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleConfirmManual}
              disabled={!manualInput.trim()}
              className="w-full py-3 bg-primary-light hover:bg-blue-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary-light/20"
            >
              Verify Ticket
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes scan {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          :global(#reader video) {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 1rem;
          }
        `}</style>
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

function TravelerCard({ booking, onNoShow, onContact, now }: TravelerCardProps) {
  const [expanded, setExpanded] = useState(false)
  const displayStatus = mapToCheckInDisplay(booking.status)

  return (
    <div className="surface-card border border-theme rounded-xl overflow-hidden hover:shadow-md transition-shadow active:scale-[0.99]">
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary-light/10 flex items-center justify-center text-primary-light text-xs font-bold">
                {booking.traveler?.fullName?.charAt(0) || 'T'}
              </div>
              {displayStatus === 'checked-in' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-theme flex items-center justify-center">
                  <Check className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-theme-primary truncate max-w-[120px]">
                {booking.traveler?.fullName || 'Unknown'}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] text-theme-muted capitalize font-bold mt-0.5">
                <Users className="w-2.5 h-2.5" />
                <span>{booking.peopleCount} PAX</span>
                <span>•</span>
                <span>#{booking.id}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={displayStatus} />
        </div>

        <div className="flex items-center gap-2 mt-3.5">
          {booking.status === BookingStatus.Confirmed && (
            <button
              onClick={() => onNoShow(booking.id)}
              disabled={new Date(now) < new Date(booking.startTimeUtc)}
              className={`flex-1 h-8 px-3 text-[10px] font-extrabold capitalize tracking-normal rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                new Date(now) < new Date(booking.startTimeUtc)
                  ? 'surface-section text-theme-muted cursor-not-allowed opacity-50 border border-theme'
                  : 'badge-danger border border-danger-red/20 shadow-sm active:scale-95'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              No Show
            </button>
          )}
          <button
            onClick={() => onContact(booking)}
            className="flex-1 h-8 px-3 bg-surface-base hover:bg-surface-hover text-primary-light border border-theme text-[10px] font-extrabold capitalize tracking-normal rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Contact
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 flex items-center justify-center surface-card text-theme-secondary rounded-lg active:scale-90 transition-all border border-theme"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-theme space-y-3 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 gap-2.5">
              <a href={`mailto:${booking.traveler?.email}`} className="flex items-center gap-2 text-xs font-medium text-theme-secondary hover:text-primary-light truncate">
                <Mail className="w-3.5 h-3.5 text-theme-muted" />
                {booking.traveler?.email}
              </a>
              {booking.traveler?.phoneE164 && (
                <a href={`tel:${booking.traveler.phoneE164}`} className="flex items-center gap-2 text-xs font-medium text-theme-secondary hover:text-primary-light">
                  <Phone className="w-3.5 h-3.5 text-theme-muted" />
                  {booking.traveler.phoneE164}
                </a>
              )}
            </div>

            {booking.message && (
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 capitalize tracking-normal mb-1">Note</p>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  &ldquo;{booking.message}&rdquo;
                </p>
              </div>
            )}
            
            {(booking.checkedInAtUtc || booking.completedAtUtc) && (
              <div className="space-y-1.5 pt-1">
                {booking.checkedInAtUtc && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 capitalize">
                    <CheckCircle className="w-3 h-3" />
                    In: {new Date(booking.checkedInAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {booking.completedAtUtc && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-purple-600 capitalize">
                    <CheckCircle className="w-3 h-3" />
                    Out: {new Date(booking.completedAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            )}
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

function TourOverview({ group, tourStatus, onCompleteTour }: TourOverviewProps) {
  const startTime = new Date(group.startTimeUtc)
  const endTime = new Date(group.endTimeUtc)
  const currentTime = new Date()
  const minutesUntilStart = Math.floor((startTime.getTime() - currentTime.getTime()) / (1000 * 60))

  const checkedInCount = group.bookings.filter(
    b => b.status === BookingStatus.InProgress || b.status === BookingStatus.Completed
  ).length
  const totalBookings = group.bookings.length

  return (
    <div className="surface-card border border-theme rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start justify-between mb-5 gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-theme-primary truncate">
              {group.tourTitle}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-theme-muted font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary-light" />
              {startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary-light" />
              {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <TourStatusBadge status={tourStatus} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="surface-section rounded-xl p-3 text-center border border-theme">
          <div className="text-xl font-extrabold text-theme-primary tracking-tight">{checkedInCount}</div>
          <div className="text-[9px] text-theme-muted font-bold capitalize tracking-normal">Checked In</div>
        </div>
        <div className="surface-section rounded-xl p-3 text-center border border-theme">
          <div className="text-xl font-extrabold text-theme-primary tracking-tight">{totalBookings - checkedInCount}</div>
          <div className="text-[9px] text-theme-muted font-bold capitalize tracking-normal">Left</div>
        </div>
        <div className="bg-primary-light/5 rounded-xl p-3 text-center border border-primary-light/20">
          <div className="text-xl font-extrabold text-primary-light tracking-tight">{totalBookings}</div>
          <div className="text-[9px] text-primary-light/70 font-bold capitalize tracking-normal">Total</div>
        </div>
      </div>

      {tourStatus === 'in-progress' && (
        <button
          onClick={onCompleteTour}
          className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-[11px] capitalize tracking-normal"
        >
          Complete Tour Session
        </button>
      )}

      {tourStatus === 'scheduled' && minutesUntilStart > 0 && minutesUntilStart < 60 && (
        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center flex items-center justify-center gap-2">
          <Timer className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-xs text-amber-700 dark:text-amber-400 font-bold capitalize tracking-normal">
            Starts in {minutesUntilStart}m
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

  const [groups, setGroups] = useState<OccurrenceGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<OccurrenceGroup | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'travelers' | 'info'>('travelers')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const fetchActiveBookings = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getGuideBookings()
      const bookings: GuideBookingResponse[] = res || []

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

      setSelectedGroup(prev => {
        if (occurrenceGroups.length === 0) return null
        if (!prev) return occurrenceGroups[0]
        const refreshed = occurrenceGroups.find(g => g.occurrenceId === prev.occurrenceId)
        return refreshed || occurrenceGroups[0]
      })
    } catch {
      toast.error('Failed to load active tours')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActiveBookings()
  }, [fetchActiveBookings])

  const handleQRScan = async (qrToken: string) => {
    setIsProcessing(true)
    try {
      const res = await checkInByQrToken(qrToken)
      toast.success(`${res.traveler?.fullName || 'Traveler'} checked in!`)
      fetchActiveBookings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'QR check-in failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNoShow = async (bookingId: number) => {
    if (!confirm('Mark this traveler as a No-Show?')) return

    setIsProcessing(true)
    try {
      await noShowBooking(bookingId, { reason: 'No-Show' })
      toast.success('Reported')
      fetchActiveBookings()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const onContact = (booking: GuideBookingResponse) => {
    if (booking.traveler?.email) {
      window.location.href = `mailto:${booking.traveler.email}`
    }
  }

  const handleCompleteTour = async () => {
    if (!selectedGroup) return
    const inProgressBookings = selectedGroup.bookings.filter(b => b.status === BookingStatus.InProgress)
    if (inProgressBookings.length === 0) {
      toast.error('No sessions in progress')
      return
    }
    setIsProcessing(true)
    try {
      await Promise.all(inProgressBookings.map(b => completeBooking(b.id)))
      toast.success('Tour session completed!')
      fetchActiveBookings()
    } catch (err: any) {
      toast.error('Failed to complete')
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredBookings = useMemo(() => {
    if (!selectedGroup) return []
    return selectedGroup.bookings.filter(b =>
      (b.traveler?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.id).includes(searchTerm)
    )
  }, [selectedGroup, searchTerm])

  const tourStatus = useMemo(() => {
    return selectedGroup ? deriveTourStatus(selectedGroup.bookings) : 'scheduled'
  }, [selectedGroup])

  if (isLoading) {
    return <GuideOnTourSkeleton />
  }

  if (groups.length === 0) {
    return (
      <div className="pt-12 sm:pt-16 min-h-[calc(100vh-4rem)] surface-base">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-theme-primary mb-2">No Active Tours</h2>
          <p className="text-theme-muted max-w-md mx-auto text-sm font-medium">
            You don't have any upcoming tours with confirmed bookings. They will appear here once travelers book.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-base pb-6">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
            <div className="text-left">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-theme-primary mb-1 tracking-tight capitalize">
                On-Tour <span className="text-primary-light">Toolkit</span>.
              </h1>
              <p className="text-xs sm:text-sm text-theme-muted font-bold capitalize tracking-normal">
                Real-time check-ins and session management
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
              {/* Tour selector */}
              <div className="relative flex-1 sm:w-72 min-w-0">
                <Listbox
                  value={selectedGroup?.occurrenceId || 0}
                  onChange={(val) => {
                    const group = groups.find(g => g.occurrenceId === val)
                    if (group) setSelectedGroup(group)
                  }}
                >
                  <div className="relative">
                    <ListboxButton className="relative w-full flex items-center justify-between px-4 py-2.5 surface-card border border-theme rounded-xl text-xs font-bold text-theme-primary shadow-sm active:scale-[0.98] transition-all">
                      <span className="flex items-center gap-2 truncate">
                        <Calendar className="w-4 h-4 text-primary-light shrink-0" />
                        <span className="truncate capitalize tracking-normal">
                          {selectedGroup
                            ? `${new Date(selectedGroup.startTimeUtc).toLocaleDateString()} - ${selectedGroup.tourTitle}`
                            : 'Select Tour'}
                        </span>
                      </span>
                      <ChevronDown className="w-4 h-4 text-theme-muted shrink-0" />
                    </ListboxButton>

                    <Transition leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                      <ListboxOptions className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl surface-card py-1.5 text-xs font-bold shadow-xl border border-theme focus:outline-none">
                        {groups.map((group) => (
                          <ListboxOption
                            key={group.occurrenceId}
                            value={group.occurrenceId}
                            className={({ focus, selected }) => `relative cursor-default select-none py-3 pl-10 pr-4 transition-colors capitalize tracking-normal ${
                              focus ? 'bg-primary-light/10 text-primary-light' : 'text-theme-primary'
                            } ${selected ? 'bg-primary-light/5' : ''}`}
                          >
                            {({ selected }) => (
                              <>
                                <span className="block truncate">{new Date(group.startTimeUtc).toLocaleDateString()} - {group.tourTitle}</span>
                                {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-light"><Check className="w-4 h-4" /></span>}
                              </>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </Transition>
                  </div>
                </Listbox>
              </div>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="w-11 h-11 flex items-center justify-center bg-primary-light text-white rounded-xl shadow-lg shadow-primary-light/20 active:scale-90 transition-all shrink-0"
              >
                <QrCode className="w-5 h-5" />
              </button>

              <button
                onClick={fetchActiveBookings}
                className="w-11 h-11 flex items-center justify-center surface-card border border-theme text-theme-muted rounded-xl shadow-sm active:scale-90 transition-all shrink-0"
              >
                <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {selectedGroup && (
            <div className="mb-8">
              <TourOverview
                group={selectedGroup}
                tourStatus={tourStatus}
                onCompleteTour={handleCompleteTour}
              />
            </div>
          )}

          <div className="flex p-1 bg-theme/5 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('travelers')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold capitalize tracking-normal transition-all ${
                activeTab === 'travelers' ? 'bg-white dark:bg-card-dark text-primary-light shadow-sm' : 'text-theme-muted'
              }`}
            >
              <Users className="w-4 h-4" />
              Travelers ({selectedGroup?.bookings.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold capitalize tracking-normal transition-all ${
                activeTab === 'info' ? 'bg-white dark:bg-card-dark text-purple-600 shadow-sm' : 'text-theme-muted'
              }`}
            >
              <Info className="w-4 h-4" />
              Guidelines
            </button>
          </div>

          {activeTab === 'travelers' && (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find traveler by name or reference..."
                  className="w-full pl-10 pr-4 py-3.5 surface-card border border-theme rounded-2xl text-sm text-theme-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light/20 transition-all"
                />
              </div>

              <div className="space-y-3">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map(booking => (
                    <TravelerCard key={booking.id} booking={booking} now={now} onNoShow={handleNoShow} onContact={onContact} />
                  ))
                ) : (
                  <div className="text-center py-12 border border-dashed border-theme rounded-3xl">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-xs font-bold text-theme-muted capitalize tracking-normal">No travelers found</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200 mb-1">Waitlist System</h3>
                    <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                      Travelers manage their own waitlist entries. When a confirmed booking is cancelled, the first eligible waitlisted traveler is automatically promoted to a real booking by the system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-primary-light/5 border border-primary-light/10 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-light/10 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">Check-in Protocol</h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      Scan the traveler's QR code at the meeting point to verify their ticket. This is mandatory for check-in and moves their booking from Confirmed to In Progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleQRScan} />
    </div>
  )
}
