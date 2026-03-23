'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  CalendarRange,
  Repeat,
  DollarSign,
  MapPin,
  X,
  PlusCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import CalendarPicker from '@/src/components/ui/CalendarPicker'
import { 
  getGuideTour, 
  getGuideOccurrences, 
  createOccurrence, 
  updateOccurrence, 
  deleteOccurrence 
} from '@/src/lib/api/tours'
import { 
  TourTemplateResponse, 
  TourOccurrenceResponse, 
  TourOccurrenceStatus,
  CreateOccurrenceRequest
} from '@/src/lib/types/tour.types'

// ============================================================================
// UTILITIES
// ============================================================================

const toUTC = (localDateTime: string) => {
  if (!localDateTime) return ''
  return new Date(localDateTime).toISOString()
}

const fromUTC = (utcDateTime: string) => {
  if (!utcDateTime) return ''
  const d = new Date(utcDateTime)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatDateTime = (isoString: string) => {
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge = ({ status }: { status: TourOccurrenceStatus }) => {
  const styles: Record<TourOccurrenceStatus, { bg: string, text: string, border: string, icon: any }> = {
    SCHEDULED: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: Calendar
    },
    FULL: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: Users
    },
    COMPLETED: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: CheckCircle
    },
    CANCELLED: {
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800/50',
      icon: XCircle
    }
  }

  const config = styles[status] || styles.SCHEDULED

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${config.bg} ${config.text} ${config.border}`}>
      <config.icon className="w-3.5 h-3.5" />
      {status}
    </span>
  )
}

// ============================================================================
// MODAL: ADD/EDIT OCCURRENCE
// ============================================================================

interface OccurrenceModalProps {
  onClose: () => void
  onSave: (data: CreateOccurrenceRequest) => Promise<void>
  initialData?: TourOccurrenceResponse | null
  template: TourTemplateResponse
}

const OccurrenceModal = ({ onClose, onSave, initialData, template }: OccurrenceModalProps) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    startTime: initialData ? fromUTC(initialData.startTimeUtc) : '',
    endTime: initialData ? fromUTC(initialData.endTimeUtc) : ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.startTime || !formData.endTime) {
      toast.error('Both start and end times are required')
      return
    }

    setLoading(true)
    try {
      await onSave({
        startTimeUtc: toUTC(formData.startTime),
        endTimeUtc: toUTC(formData.endTime)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {initialData ? 'Edit Date' : 'Schedule New Date'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Start Date & Time
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                End Date & Time
              </label>
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              {formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime) && (
                <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                  ⚠️ End time must be after start time
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">Capacity Rule</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 font-bold">
              Inherited from template: {template.minCapacity}-{template.maxCapacity} Guests
            </p>
          </div>

          <div className="pt-4 flex gap-3">
             <button
               type="button"
               onClick={onClose}
               className="flex-1 h-12 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
             >
               Cancel
             </button>
              <button
                type="submit"
                disabled={Boolean(loading || (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)))}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
               {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : (initialData ? 'Update Date' : 'Schedule Date')}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// OCCURRENCE CARD COMPONENT
// ============================================================================

const OccurrenceCard = ({ 
  occurrence, 
  onAction 
}: { 
  occurrence: TourOccurrenceResponse; 
  onAction: (action: string, id: number) => void 
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const capacityPercentage = (occurrence.seatsReserved / occurrence.maxCapacity) * 100
  const isFull = occurrence.status === 'FULL' || occurrence.availableSeats === 0
  const isPast = new Date(occurrence.startTimeUtc) < new Date()

  return (
    <div className={`group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ${isPast ? 'opacity-70 grayscale-[0.3]' : ''}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 shadow-inner group-hover:scale-110 transition-transform">
                <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
                  {new Date(occurrence.startTimeUtc).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
                  {new Date(occurrence.startTimeUtc).getDate()}
                </span>
             </div>
             <div>
                <h3 className="font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-1">
                  {new Date(occurrence.startTimeUtc).toLocaleDateString('en-US', { weekday: 'long' })}
                </h3>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  {new Date(occurrence.startTimeUtc).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  <span>—</span>
                  {new Date(occurrence.endTimeUtc).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <StatusBadge status={occurrence.status} />
             <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-20 py-1 font-bold text-sm overflow-hidden">
                       <button
                         onClick={() => { setShowMenu(false); onAction('edit', occurrence.id); }}
                         className="w-full px-4 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 flex items-center gap-2 transition-colors"
                       >
                         <Edit className="w-4 h-4" /> Edit Time
                       </button>
                       <button
                         onClick={() => { setShowMenu(false); onAction('cancel', occurrence.id); }}
                         className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                       >
                         <XCircle className="w-4 h-4" /> Cancel Run
                       </button>
                       <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                       <button
                         onClick={() => { setShowMenu(false); onAction('delete', occurrence.id); }}
                         className="w-full px-4 py-2.5 text-left text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                       >
                         <Trash2 className="w-4 h-4" /> Force Delete
                       </button>
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>

        {/* Capacity Indicator */}
        <div className="mb-4">
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
              <span>Attendance</span>
              <span className={isFull ? 'text-red-600' : 'text-emerald-600'}>
                {occurrence.seatsReserved} / {occurrence.maxCapacity} Booked
              </span>
           </div>
           <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
             <div
               className={`h-full rounded-full transition-all duration-500 ${
                 isFull ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
               }`}
               style={{ width: `${capacityPercentage}%` }}
             />
           </div>
        </div>

        {/* Action Link to Bookings */}
        <Link
          href={`/dashboard/guide/bookings?occurrence=${occurrence.id}`}
          className="w-full py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900/30"
        >
          <Users className="w-4 h-4" />
          View Attendee List
        </Link>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL: BULK SCHEDULE
// ============================================================================

interface BulkScheduleModalProps {
  onClose: () => void
  onSave: (dates: { startTimeUtc: string, endTimeUtc: string }[]) => Promise<void>
  template: TourTemplateResponse
}

const BulkScheduleModal = ({ onClose, onSave, template }: BulkScheduleModalProps) => {
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [durationHours, setDurationHours] = useState(2)
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [selectedDays, setSelectedDays] = useState<number[]>([]) // 0=Sun, 1=Mon, etc.
  const [generatedDates, setGeneratedDates] = useState<Date[]>([])

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const generateDates = () => {
    if (!startDate || !endDate || selectedDays.length === 0) {
      toast.error('Please select range and days')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates: Date[] = []

    let current = new Date(start)
    while (current <= end) {
      if (selectedDays.includes(current.getDay())) {
        dates.push(new Date(current))
      }
      current.setDate(current.getDate() + 1)
    }

    if (dates.length === 0) {
      toast.error('No dates found in this range with selected days')
    } else {
      setGeneratedDates(dates)
      toast.success(`Generated ${dates.length} departures`)
    }
  }

  const handleSubmit = async () => {
    if (generatedDates.length === 0) {
      toast.error('No dates to schedule')
      return
    }

    setLoading(true)
    try {
      const payloads = generatedDates.map(date => {
        const start = new Date(date)
        const [h, m] = startTime.split(':').map(Number)
        start.setHours(h, m, 0, 0)

        const end = new Date(start)
        end.setHours(start.getHours() + durationHours, start.getMinutes() + durationMinutes)

        return {
          startTimeUtc: start.toISOString(),
          endTimeUtc: end.toISOString()
        }
      })
      await onSave(payloads)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
             <Repeat className="w-6 h-6 text-blue-600" />
             <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
               Bulk Scheduling Tool
             </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Days of Week (Twice a week? Pick 2!)</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${selectedDays.includes(i) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-500'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Departure Time</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Duration (Hours)</label>
                  <input type="number" min="1" value={durationHours} onChange={e => setDurationHours(Number(e.target.value))} className="w-full h-11 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono" />
                </div>
              </div>

              <button
                onClick={generateDates}
                className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-[1.02] transition-all"
              >
                Generate Preview
              </button>
            </div>

            {/* Preview Calendar */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Generated Schedule Preview</label>
              <CalendarPicker
                selectedDates={generatedDates}
                onToggleDate={(date) => {
                  setGeneratedDates(prev => {
                    const exists = prev.some(d => d.getTime() === date.getTime())
                    return exists ? prev.filter(d => d.getTime() !== date.getTime()) : [...prev, date]
                  })
                }}
              />
              <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                Click a date on the calendar to manually add/remove it
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-4">
          <button onClick={onClose} className="px-6 h-14 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-xs uppercase tracking-widest">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || generatedDates.length === 0}
            className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Create {generatedDates.length} Departures <PlusCircle className="w-5 h-5" /></>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TourOccurrencesPage() {
  const params = useParams()
  const router = useRouter()
  const tourId = parseInt(params.id as string)

  const [tour, setTour] = useState<TourTemplateResponse | null>(null)
  const [occurrences, setOccurrences] = useState<TourOccurrenceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingOccId, setEditingOccId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tourRes, occRes] = await Promise.all([
        getGuideTour(tourId),
        getGuideOccurrences(tourId)
      ])
      setTour(tourRes.data)
      setOccurrences(occRes.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to sync data')
      router.push('/dashboard/guide/tours')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [tourId])

  const handleAction = async (action: string, id: number) => {
    if (action === 'edit') {
      setEditingOccId(id)
      setShowModal(true)
      return
    }

    if (action === 'delete') {
      if (confirm('Are you sure you want to delete this occurrence? This will orphan any existing bookings.')) {
        try {
          await deleteOccurrence(id)
          toast.success('Occurrence deleted')
          fetchData()
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to delete')
        }
      }
      return
    }

    if (action === 'cancel') {
        try {
            await updateOccurrence(id, { status: 'CANCELLED' })
            toast.success('Occurrence cancelled')
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel')
        }
        return
    }
  }

  const handleSave = async (data: CreateOccurrenceRequest) => {
    try {
      if (editingOccId) {
        await updateOccurrence(editingOccId, data)
        toast.success('Date updated successfully')
      } else {
        await createOccurrence(tourId, data)
        toast.success('Tour date scheduled')
      }
      setShowModal(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
  }

  // Grouping logic
  const upcoming = useMemo(() => 
    occurrences.filter(o => new Date(o.startTimeUtc) >= new Date() && o.status !== 'CANCELLED')
    .sort((a,b) => a.startTimeUtc.localeCompare(b.startTimeUtc))
  , [occurrences])

  const pastAndCancelled = useMemo(() => 
    occurrences.filter(o => new Date(o.startTimeUtc) < new Date() || o.status === 'CANCELLED')
    .sort((a,b) => b.startTimeUtc.localeCompare(a.startTimeUtc))
  , [occurrences])

  const occurrenceDates = useMemo(() => 
    occurrences.map(o => new Date(o.startTimeUtc))
  , [occurrences])

  const handleBulkSave = async (payloads: { startTimeUtc: string, endTimeUtc: string }[]) => {
    try {
      setLoading(true)
      toast.loading(`Creating ${payloads.length} departures...`, { id: 'bulk-create' })
      
      // We can't do parallel calls easily because the backend might have rate limits or sequential processing requirements
      // But we can try to batch them
      for (const payload of payloads) {
        await createOccurrence(tourId, payload)
      }
      
      toast.success(`${payloads.length} dates scheduled successfully`, { id: 'bulk-create' })
      setShowBulkModal(false)
      fetchData()
    } catch (err: any) {
      toast.error('Partial failure during bulk scheduling', { id: 'bulk-create' })
      fetchData()
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500 px-10 text-center font-bold uppercase tracking-widest opacity-50">Syncing Reservation Ledger...</p>
      </div>
    )
  }

  if (!tour) return null

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-transparent sm:bg-gray-50 dark:sm:bg-gray-950">
      <div className="container-safe mx-auto max-w-5xl py-8 sm:py-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
             <Link 
               href={`/dashboard/guide/tours/${tourId}`}
               className="inline-flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4 hover:translate-x-[-4px] transition-transform"
             >
               <ChevronLeft className="w-4 h-4" />
               Tour Summary
             </Link>
             <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
               Schedule & <span className="text-blue-600">Dates</span>
             </h1>
             <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-md">
               Manage departures for <span className="font-black text-gray-900 dark:text-gray-200">"{tour.title}"</span>. 
               Only published tours are visible to travelers.
             </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { setEditingOccId(null); setShowModal(true); }}
              disabled={tour.status !== 'PUBLISHED'}
              className="group relative inline-flex items-center gap-3 px-6 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed font-black text-sm uppercase tracking-widest"
            >
              <Plus className="w-5 h-5" />
              Single Date
            </button>

            <button
              onClick={() => setShowBulkModal(true)}
              disabled={tour.status !== 'PUBLISHED'}
              className="group relative inline-flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed font-black text-sm uppercase tracking-widest"
            >
              <Repeat className="w-5 h-5 text-blue-200" />
              Schedule Multiple
              {tour.status !== 'PUBLISHED' && (
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Tour must be PUBLISHED to schedule dates
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-12">
           
           {/* Upcoming Runs */}
           <section>
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Upcoming Departures
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 opacity-60'}`}
                      >
                        List
                      </button>
                      <button 
                        onClick={() => setViewMode('calendar')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400 opacity-60'}`}
                      >
                        Calendar
                      </button>
                    </div>
                    <span className="text-xs font-bold text-gray-400 ml-4">{upcoming.length} Found</span>
                  </div>
               </div>

              {upcoming.length > 0 ? (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcoming.map(occ => (
                        <OccurrenceCard key={occ.id} occurrence={occ} onAction={handleAction} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800">
                       <div>
                          <CalendarPicker 
                            selectedDates={[]} 
                            highlightedDates={occurrenceDates}
                            onToggleDate={() => {}} 
                          />
                          <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                            Green dots indicate scheduled departures
                          </p>
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Quick Legend</h4>
                          <div className="space-y-3">
                             {upcoming.slice(0, 5).map(occ => (
                               <div key={occ.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
                                 <div className="flex items-center gap-3">
                                   <Calendar className="w-4 h-4 text-blue-500" />
                                   <span className="text-xs font-bold text-gray-900 dark:text-white">{formatDateTime(occ.startTimeUtc)}</span>
                                 </div>
                                 <StatusBadge status={occ.status} />
                               </div>
                             ))}
                             {upcoming.length > 5 && (
                               <p className="text-[10px] font-bold text-gray-400 italic text-center">Plus {upcoming.length - 5} more departures scheduled</p>
                             )}
                          </div>
                       </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-20 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center">
                   <CalendarRange className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
                   <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">No Future Runs Scheduled</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
                     Travelers can't book this tour until you add available dates to the schedule.
                   </p>
                   {tour.status === 'PUBLISHED' && (
                     <div className="flex gap-4">
                        <button
                          onClick={() => { setEditingOccId(null); setShowModal(true); }}
                          className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          Single Date
                        </button>
                        <button
                          onClick={() => setShowBulkModal(true)}
                          className="px-6 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                        >
                          Bulk Schedule
                        </button>
                     </div>
                   )}
                </div>
              )}
           </section>

           {/* Past / History Section (Keep it collapsed or smaller) */}
           {pastAndCancelled.length > 0 && (
             <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Clock className="w-4 h-4" />
                    Archive & History
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastAndCancelled.map(occ => (
                    <OccurrenceCard key={occ.id} occurrence={occ} onAction={handleAction} />
                  ))}
                </div>
             </section>
           )}

        </div>

        {/* Modal Portals */}
        {showModal && (
          <OccurrenceModal
            onClose={() => setShowModal(false)}
            onSave={handleSave}
            template={tour}
            initialData={editingOccId ? occurrences.find(o => o.id === editingOccId) : null}
          />
        )}
        {showBulkModal && (
          <BulkScheduleModal
            onClose={() => setShowBulkModal(false)}
            onSave={handleBulkSave}
            template={tour}
          />
        )}

      </div>
    </div>
  )
}