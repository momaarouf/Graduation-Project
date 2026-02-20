// ============================================================================
// START NEW MESSAGE
// ============================================================================
// LOCATION: /frontend/src/app/messages/new/page.tsx
// 
// PURPOSE: Initiate a new conversation with a guide or traveler
// 
// FEATURES:
// - Select recipient (from context)
// - Pre-filled from URL params
// - Message composition
// - Subject line
// - Send first message
// - View recipient profile
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Send,
  ChevronLeft,
  User,
  Star,
  MapPin,
  Shield,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Recipient {
  id: string
  name: string
  avatar?: string
  role: 'guide' | 'traveler'
  rating?: number
  location?: string
  verified?: boolean
  tourId?: string
  tourTitle?: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_RECIPIENTS: Record<string, Recipient> = {
  'guide-123': {
    id: 'guide-123',
    name: 'Mehmet Yilmaz',
    avatar: '/images/guides/mehmet.jpg',
    role: 'guide',
    rating: 4.9,
    location: 'Istanbul, Turkey',
    verified: true
  },
  'guide-456': {
    id: 'guide-456',
    name: 'Layla Hassan',
    avatar: '/images/guides/layla.jpg',
    role: 'guide',
    rating: 4.8,
    location: 'Beirut, Lebanon',
    verified: true
  },
  'traveler-123': {
    id: 'traveler-123',
    name: 'Ahmed Khan',
    avatar: '/images/travelers/ahmed.jpg',
    role: 'traveler',
    location: 'Dubai, UAE',
    verified: true
  }
}

const MOCK_TOURS: Record<string, { id: string; title: string }> = {
  '1': { id: '1', title: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia' },
  '2': { id: '2', title: 'Bosphorus Sunset Cruise with Dinner' },
  '3': { id: '3', title: 'Cappadocia Sunrise Balloon & Valley Hike' }
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function NewMessagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [recipient, setRecipient] = useState<Recipient | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [tourId, setTourId] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const MAX_CHARS = 1000

  // Get params from URL
  const recipientId = searchParams.get('user')
  const tourParam = searchParams.get('tour')
  const bookingParam = searchParams.get('booking')

  useEffect(() => {
    if (recipientId && MOCK_RECIPIENTS[recipientId]) {
      setRecipient(MOCK_RECIPIENTS[recipientId])
    }

    if (tourParam && MOCK_TOURS[tourParam]) {
      setTourId(tourParam)
      setSubject(`Question about: ${MOCK_TOURS[tourParam].title}`)
    }
  }, [recipientId, tourParam])

  const handleSend = () => {
    if (!recipient) {
      toast.error('Please select a recipient')
      return
    }

    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    setIsSending(true)

    // Simulate API call
    setTimeout(() => {
      setIsSending(false)
      toast.success('Message sent successfully')
      router.push('/messages')
    }, 1500)
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= MAX_CHARS) {
      setMessage(text)
      setCharCount(text.length)
    }
  }

  if (!recipient) {
    return (
      <PageLayout>
        <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="container-safe mx-auto max-w-2xl py-8 sm:py-10">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Recipient Selected
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please select a user to message from their profile or booking.
              </p>
              <Link
                href="/messages"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Messages
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="pt-14 sm:pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container-safe mx-auto max-w-3xl py-8 sm:py-10">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/messages"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              New Message
            </h1>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            
            {/* Recipient Info */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    {recipient.avatar ? (
                      <Image src={recipient.avatar} alt={recipient.name} width={64} height={64} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {recipient.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {recipient.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{recipient.role}</span>
                    {recipient.rating && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {recipient.rating}
                        </span>
                      </>
                    )}
                    {recipient.location && (
                      <>
                        <span>•</span>
                        <span>{recipient.location}</span>
                      </>
                    )}
                  </div>
                </div>

                <Link
                  href={`/${recipient.role === 'guide' ? 'guides' : 'travelers'}/${recipient.id}`}
                  className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Profile
                </Link>
              </div>
            </div>

            {/* Message Form */}
            <div className="p-6 space-y-4">
              
              {/* Subject Line */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={handleMessageChange}
                  placeholder={`Write your message to ${recipient.name}...`}
                  rows={6}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${charCount >= MAX_CHARS ? 'text-red-600' : 'text-gray-500'}`}>
                    {charCount}/{MAX_CHARS}
                  </span>
                </div>
              </div>

              {/* Tour Context (if applicable) */}
              {tourId && MOCK_TOURS[tourId] && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Regarding: {MOCK_TOURS[tourId].title}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        This will help the recipient understand your question context.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Templates */}
              {recipient.role === 'guide' && (
                <div className="pt-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Quick questions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setMessage("Hi! I'm interested in your tour. Is it available on...")}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Check availability
                    </button>
                    <button
                      onClick={() => setMessage("Hi! Is this tour suitable for children?")}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Family friendly?
                    </button>
                    <button
                      onClick={() => setMessage("Hi! Do you offer vegetarian food options?")}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Dietary restrictions
                    </button>
                  </div>
                </div>
              )}

              {/* Safety Notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                      Safety Reminder
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Never share personal contact information or payment details. 
                      All communication should stay on the platform until booking is confirmed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <Link
                href="/messages"
                className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}