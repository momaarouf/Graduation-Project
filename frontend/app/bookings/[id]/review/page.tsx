'use client'

import { useState, useEffect, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Camera,
  X,
  ChevronLeft,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  MapPin,
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  ShieldCheck,
  User,
  Sparkles,
  Trophy,
  History
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import CinematicBackground from '@/src/components/layout/CinematicBackground'

// Real API functions
import { getTravelerBooking, submitReview, getTravelerReviews } from '@/src/lib/api/tours'
import { BookingResponse, BookingStatus } from '@/src/lib/types/tour.types'

// ============================================================================
// ANIMATIONS
// ============================================================================

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = Number(params.id)

  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [isLoadingBooking, setIsLoadingBooking] = useState(true)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  // Feedback targets (from Backend)
  const [ratings, setRatings] = useState({
    overall: 0,
    guide: 0,
    tour: 0,
    value: 0
  })
  const [hoverRatings, setHoverRatings] = useState({
    overall: 0,
    guide: 0,
    tour: 0,
    value: 0
  })

  const [review, setReview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // ── FETCH DATA ────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingBooking(true)
      try {
        const [bookingRes, reviewsRes] = await Promise.all([
          getTravelerBooking(bookingId),
          getTravelerReviews().catch(() => ({ content: [] }))
        ])
        
        setBooking(bookingRes)

        // Check if already reviewed
        const reviewed = (reviewsRes.content || []).some(
          (r: any) => r.bookingId === bookingId
        )
        if (reviewed) {
          setAlreadyReviewed(true)
          toast.error('You have already reviewed this booking')
          router.push(`/dashboard/traveler/bookings/${bookingId}`)
          return
        }

        // Guard: must be COMPLETED
        if (bookingRes.status !== BookingStatus.Completed) {
          router.push(`/dashboard/traveler/bookings/${bookingId}`)
        }
      } catch (err: any) {
        console.error('Failed to load review context:', err)
        router.push('/dashboard/traveler/bookings')
      } finally {
        setIsLoadingBooking(false)
      }
    }
    loadData()
  }, [bookingId, router])

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  const handleRatingClick = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => {
      const next = { ...prev, [category]: value }
      
      // Auto-calculate Overall if changing one of the sub-ratings
      if (category !== 'overall') {
         const parts = [next.guide, next.tour, next.value].filter(v => v > 0)
         if (parts.length > 0) {
            const sum = parts.reduce((acc, curr) => acc + curr, 0)
            next.overall = Math.round(sum / parts.length)
         } else {
            next.overall = 0
         }
      }
      return next
    })
  }

  const handleHover = (category: keyof typeof ratings, value: number) => {
    setHoverRatings(prev => ({ ...prev, [category]: value }))
  }

  const handleSubmit = async () => {
    if (ratings.overall === 0 || ratings.guide === 0 || ratings.tour === 0 || ratings.value === 0) {
      toast.error('Please provide a rating for all 4 categories')
      return
    }

    setIsSubmitting(true)
    try {
      await submitReview({
        bookingId: bookingId,
        ratingOverall: ratings.overall,
        ratingGuide: ratings.guide,
        ratingTour: ratings.tour,
        ratingValue: ratings.value,
        comment: review.trim() || undefined,
      })

      setIsSubmitted(true)
      setTimeout(() => {
        router.push(`/dashboard/traveler/bookings/${bookingId}`)
      }, 3000)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── RENDER HELPERS ────────────────────────────────────────────────────────
  const renderStarMetric = (
    category: keyof typeof ratings,
    label: string,
    subtext: string,
    icon: React.ReactNode,
    isAggregate: boolean = false
  ) => {
    const current = ratings[category]
    const hover = hoverRatings[category]
    const activeValue = hover || current

    return (
      <motion.div 
        variants={fadeInUp}
        className={`relative group bg-white/5 dark:bg-gray-900/40 backdrop-blur-xl border border-white/10 dark:border-gray-800/80 p-8 rounded-[2.5rem] shadow-2xl shadow-black/10 overflow-hidden transition-all ${isAggregate ? 'ring-2 ring-amber-500/20 bg-amber-500/5' : ''}`}
      >
        {/* Glow effect on hover/focus */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {isAggregate && (
           <div className="absolute top-4 right-8">
              <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full uppercase tracking-widest border border-amber-500/10">
                 Final Score Calculation
              </span>
           </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${current > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'} transition-colors ${isAggregate ? 'scale-110 shadow-lg shadow-amber-500/20' : ''}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white leading-none mb-1 uppercase tracking-tighter">{label}</h3>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{subtext}</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 ${isAggregate ? 'pointer-events-none' : ''}`}>
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= activeValue
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => !isAggregate && handleHover(category, star)}
                  onMouseLeave={() => !isAggregate && handleHover(category, 0)}
                  onClick={() => !isAggregate && handleRatingClick(category, star)}
                  disabled={isAggregate}
                  className={`p-1 focus:outline-none transition-all ${!isAggregate ? 'active:scale-90 group/star' : ''}`}
                >
                  <Star
                    className={`
                      w-8 h-8 md:w-10 md:h-10 transition-all duration-300
                      ${isActive 
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' 
                        : 'text-gray-200 dark:text-gray-800 group-hover/star:text-amber-300/40'
                      }
                      ${((hover === star || (current === star && !hover)) && !isAggregate) ? 'scale-125' : ''}
                      ${isAggregate && isActive ? 'animate-pulse' : ''}
                    `}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>
    )
  }

  // ── FETCH STATES ──────────────────────────────────────────────────────────
  if (isLoadingBooking || !booking) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Reliving your journey...</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="relative min-h-screen pt-24 pb-32 overflow-hidden bg-gray-50 dark:bg-gray-950">
        <CinematicBackground />

        <div className="container-safe mx-auto px-4 relative z-10 max-w-5xl">
          
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="review-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Back Link */}
                <Link
                  href={`/dashboard/traveler/bookings/${bookingId}`}
                  className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-blue-600 transition-colors mb-10 group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="uppercase tracking-widest text-[10px]">Back to Dashboard</span>
                </Link>

                <div className="flex flex-col lg:flex-row gap-12">
                  
                  {/* Left: Summary and Brand */}
                  <div className="lg:w-1/3 flex flex-col gap-8">
                    <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10 dark:border-gray-800/50">
                      {booking.tourCoverImageUrl ? (
                        <Image src={booking.tourCoverImageUrl} alt={booking.tourTitle} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                          <MapPin className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                      
                      {/* Booking Badge Overlay */}
                      <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 text-white shadow-2xl">
                         <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Tour
                         </div>
                         <h3 className="text-lg font-black leading-tight mb-2">{booking.tourTitle}</h3>
                         <div className="flex items-center gap-3 text-xs text-white/70">
                            <Calendar className="w-3 h-3" />
                            <span className="font-bold">{new Date(booking.startTimeUtc).toLocaleDateString()}</span>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-6 bg-white/5 dark:bg-gray-900/40 backdrop-blur-xl border border-white/5 dark:border-gray-800/50 rounded-3xl">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Guide</h4>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                              <User className="w-5 h-5" />
                           </div>
                           <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Your Host Guide</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-500/10 rounded-2xl">
                         <Trophy className="w-3.5 h-3.5" />
                         Earn 50 Reward Points
                      </div>
                    </div>
                  </div>

                  {/* Right: The Review Form */}
                  <div className="lg:w-2/3 space-y-12">
                    
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <MessageSquare className="w-3 h-3" />
                        Traveler Insights
                      </div>
                      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-4">
                        Rate Your <span className="text-amber-500">Journey</span>.
                      </h1>
                      <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        Your feedback makes the next traveler's experience even better.
                      </p>
                    </div>

                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
                      
                      {renderStarMetric(
                        'overall', 
                        'Calculated Journey Vibe', 
                        'Your total experience score', 
                        <Star className="w-6 h-6 fill-current" />,
                        true // isAggregate
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                         {renderStarMetric(
                          'guide', 
                          'Guide Knowledge', 
                          'Service and communication', 
                          <User className="w-6 h-6" />
                        )}
                         {renderStarMetric(
                          'tour', 
                          'Tour Pacing', 
                          'Route and activities', 
                          <MapPin className="w-6 h-6" />
                        )}
                         {renderStarMetric(
                          'value', 
                          'Price for Value', 
                          'Was it worth the cost?', 
                          <DollarSign className="w-6 h-6" />
                        )}
                      </div>

                      {/* Written Feedback */}
                      <motion.div variants={fadeInUp} className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Share Your Thoughts</label>
                           <span className="text-[10px] font-black text-gray-400 uppercase">{review.length}/1000</span>
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                          <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value.slice(0, 1000))}
                            placeholder="What made this trip special? Any tips for future travelers?"
                            rows={6}
                            className="relative w-full px-8 py-6 bg-white/5 dark:bg-gray-900/40 backdrop-blur-xl border border-white/10 dark:border-gray-800/80 rounded-[2.5rem] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-2xl"
                          />
                        </div>
                      </motion.div>

                      {/* Submit */}
                      <motion.div variants={fadeInUp} className="pt-8">
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || ratings.overall === 0}
                          className="w-full relative group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                          <div className="relative flex items-center justify-center gap-4 px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-3xl group-hover:scale-[1.01] active:scale-95 transition-all shadow-2xl disabled:opacity-50 disabled:grayscale disabled:scale-100 overflow-hidden">
                             {/* Gloss effect */}
                             <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                             
                             {isSubmitting ? (
                               <Loader2 className="w-6 h-6 animate-spin" />
                             ) : (
                               <Send className="w-6 h-6" />
                             )}
                             <span className="uppercase tracking-[0.2em] text-sm">
                               {isSubmitting ? 'Publishing...' : 'Publish Experience'}
                             </span>
                          </div>
                        </button>
                        <p className="text-center mt-6 text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                           <ShieldCheck className="w-3 h-3" />
                           Your review will be shared publicly
                        </p>
                      </motion.div>

                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              // ── SUCCESS STATE ─────────────────────────────────────────────
              <motion.div
                key="success-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center pt-24 text-center max-w-xl mx-auto"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
                  className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                >
                   <CheckCircle className="w-16 h-16 text-emerald-500" />
                </motion.div>
                
                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 leading-none">
                  Thank You for <br /><span className="text-emerald-500">Sharing</span>.
                </h2>
                
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mb-10">
                  Your review has been published. Your insights help the whole community explore better.
                </p>

                <div className="flex items-center gap-3 p-4 bg-white/5 dark:bg-gray-900/40 backdrop-blur-xl border border-white/5 dark:border-gray-800/80 rounded-2xl w-full">
                   <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-emerald-500">
                      <Sparkles className="w-6 h-6" />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rewards Earned</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase">+50 Bonus Points</p>
                   </div>
                </div>

                <div className="mt-12 flex items-center gap-3 text-gray-400 group">
                   <History className="w-4 h-4 animate-spin-slow" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Returning to dashboard...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </PageLayout>
  )
}

function DollarSign(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
