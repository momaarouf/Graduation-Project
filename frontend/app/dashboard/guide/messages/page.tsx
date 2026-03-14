// ============================================================================
// GUIDE MESSAGING INBOX - CARD 19 (FULLY FIXED LAYOUT)
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/guide/messages/page.tsx
// 
// PURPOSE: Secure messaging system for guides to communicate with travelers
// 
// FIXED LAYOUT ISSUES:
// ✓ No outside scrollbar - overflow-hidden on all containers
// ✓ Consistent layout with/without selected chat
// ✓ No shifting on refresh - stable heights
// ✓ Proper background colors
// ✓ Search fully visible
// 
// BUSINESS REQUIREMENTS (from project spec):
// ✓ Safe chat messaging with travelers
// ✓ Regex anti-leakage shield - blur phone numbers/emails
// ✓ Suspicious messages flagged for admin audit
// ✓ Message history with travelers
// ✓ Unread indicators
// ✓ Booking context in conversations
// ============================================================================

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  MessageSquare,
  Send,
  Paperclip,
  MoreVertical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  AlertTriangle,
  Shield,
  CheckCircle,
  Clock,
  User,
  Users,
  Flag,
  Eye,
  EyeOff,
  Ban,
  Star,
  Calendar,
  MapPin,
  X,
  Info,
  DollarSign,
  Award,
  TrendingUp,
  HelpCircle
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type MessageStatus = 'sent' | 'delivered' | 'read' | 'flagged'
type ConversationStatus = 'active' | 'blocked' | 'archived'
type SafetyLevel = 'safe' | 'suspicious' | 'blocked'
type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'

interface Traveler {
  id: string
  name: string
  avatar?: string
  email: string
  phone?: string
  isVerified?: boolean
  totalTrips?: number
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface BookingInfo {
  id: string
  tourId: string
  tourTitle: string
  tourImage?: string
  date: string
  time: string
  peopleCount: number
  totalPrice: number
  currency: string
  status: BookingStatus
  meetingPoint?: string
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  status: MessageStatus
  isFlagged: boolean
  flagReason?: string
  hasBlurredContent: boolean
  attachments?: {
    id: string
    type: 'image' | 'file'
    url: string
    name: string
    size?: number
  }[]
}

interface Conversation {
  id: string
  traveler: Traveler
  booking?: BookingInfo
  lastMessage: Message
  unreadCount: number
  status: ConversationStatus
  safetyLevel: SafetyLevel
  bookingConfirmed: boolean
  updatedAt: string
  isTyping?: boolean
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    traveler: {
      id: 'trav-123',
      name: 'Ahmed Khan',
      avatar: '/images/travelers/ahmed.jpg',
      email: 'ahmed.khan@example.com',
      phone: '+90 555 111 2233',
      isVerified: true,
      totalTrips: 12,
      loyaltyTier: 'gold'
    },
    booking: {
      id: 'b1',
      tourId: '1',
      tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
      tourImage: '/images/tours/istanbul-ottoman.jpg',
      date: '2026-03-15',
      time: '09:00',
      peopleCount: 2,
      totalPrice: 178,
      currency: 'USD',
      status: 'confirmed',
      meetingPoint: 'Sultanahmet Square Fountain'
    },
    lastMessage: {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'trav-123',
      senderName: 'Ahmed Khan',
      content: "Perfect! I'll meet you at the fountain. My phone is +90 555 111 2233 if anything changes.",
      timestamp: '2026-03-14T09:30:00Z',
      status: 'delivered',
      isFlagged: true,
      flagReason: 'Phone number detected',
      hasBlurredContent: true
    },
    unreadCount: 2,
    status: 'active',
    safetyLevel: 'suspicious',
    bookingConfirmed: true,
    updatedAt: '2026-03-14T09:30:00Z'
  },
  {
    id: 'conv-2',
    traveler: {
      id: 'trav-456',
      name: 'Fatima Al-Zahra',
      avatar: '/images/travelers/fatima.jpg',
      email: 'fatima.z@example.com',
      phone: '+90 555 222 3344',
      isVerified: true,
      totalTrips: 5,
      loyaltyTier: 'silver'
    },
    booking: {
      id: 'b2',
      tourId: '1',
      tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
      tourImage: '/images/tours/istanbul-ottoman.jpg',
      date: '2026-03-18',
      time: '09:00',
      peopleCount: 1,
      totalPrice: 89,
      currency: 'USD',
      status: 'confirmed',
      meetingPoint: 'Sultanahmet Square Fountain'
    },
    lastMessage: {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'guide-123',
      senderName: 'Mehmet Yilmaz',
      content: "Of course! I can accommodate vegetarian options. Just let the restaurant know when we arrive.",
      timestamp: '2026-03-13T14:15:00Z',
      status: 'read',
      isFlagged: false,
      hasBlurredContent: false
    },
    unreadCount: 0,
    status: 'active',
    safetyLevel: 'safe',
    bookingConfirmed: true,
    updatedAt: '2026-03-13T14:15:00Z'
  },
  {
    id: 'conv-3',
    traveler: {
      id: 'trav-789',
      name: 'Omar Farooq',
      email: 'omar.f@example.com',
      phone: '+90 555 333 4455',
      totalTrips: 2,
      loyaltyTier: 'bronze'
    },
    booking: {
      id: 'b3',
      tourId: '2',
      tourTitle: 'Cappadocia Sunrise Balloon & Valley Hike',
      tourImage: '/images/tours/cappadocia-balloon.jpg',
      date: '2026-03-20',
      time: '04:30',
      peopleCount: 2,
      totalPrice: 398,
      currency: 'USD',
      status: 'pending',
      meetingPoint: 'Göreme Sunrise Point'
    },
    lastMessage: {
      id: 'msg-9',
      conversationId: 'conv-3',
      senderId: 'trav-789',
      senderName: 'Omar Farooq',
      content: "Can we pay via bank transfer instead? omar.farooq@email.com",
      timestamp: '2026-03-12T11:20:00Z',
      status: 'delivered',
      isFlagged: true,
      flagReason: 'Email address detected',
      hasBlurredContent: true
    },
    unreadCount: 1,
    status: 'active',
    safetyLevel: 'suspicious',
    bookingConfirmed: false,
    updatedAt: '2026-03-12T11:20:00Z'
  },
  {
    id: 'conv-4',
    traveler: {
      id: 'trav-101',
      name: 'Layla Hassan',
      avatar: '/images/travelers/layla.jpg',
      email: 'layla.h@example.com',
      phone: '+90 555 444 5566',
      isVerified: true,
      totalTrips: 8,
      loyaltyTier: 'silver'
    },
    booking: {
      id: 'b4',
      tourId: '3',
      tourTitle: 'Bosphorus Sunset Cruise with Dinner',
      tourImage: '/images/tours/bosphorus-cruise.jpg',
      date: '2026-03-22',
      time: '17:30',
      peopleCount: 2,
      totalPrice: 258,
      currency: 'USD',
      status: 'confirmed',
      meetingPoint: 'Kabataş Ferry Terminal'
    },
    lastMessage: {
      id: 'msg-12',
      conversationId: 'conv-4',
      senderId: 'guide-123',
      senderName: 'Mehmet Yilmaz',
      content: "Perfect! I'll meet you at the terminal entrance. Looking forward to the cruise!",
      timestamp: '2026-03-11T16:45:00Z',
      status: 'read',
      isFlagged: false,
      hasBlurredContent: false
    },
    unreadCount: 0,
    status: 'active',
    safetyLevel: 'safe',
    bookingConfirmed: true,
    updatedAt: '2026-03-11T16:45:00Z'
  }
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'trav-123',
      senderName: 'Ahmed Khan',
      senderAvatar: '/images/travelers/ahmed.jpg',
      content: "Hi Mehmet! I'm excited about the Ottoman tour. Is it suitable for children? We have two kids aged 8 and 10.",
      timestamp: '2026-03-13T10:15:00Z',
      status: 'read',
      isFlagged: false,
      hasBlurredContent: false
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'guide-123',
      senderName: 'Mehmet Yilmaz',
      content: "Hello Ahmed! Yes, it's very family-friendly. Kids especially love the Topkapi Palace treasury rooms with all the jewels! I've guided many families with children that age.",
      timestamp: '2026-03-13T10:25:00Z',
      status: 'read',
      isFlagged: false,
      hasBlurredContent: false
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'trav-123',
      senderName: 'Ahmed Khan',
      content: "Perfect! I'll meet you at the fountain. My phone is +90 555 111 2233 if anything changes.",
      timestamp: '2026-03-14T09:30:00Z',
      status: 'delivered',
      isFlagged: true,
      flagReason: 'Phone number detected',
      hasBlurredContent: true
    }
  ],
  'conv-2': [
    {
      id: 'msg-4',
      conversationId: 'conv-2',
      senderId: 'trav-456',
      senderName: 'Fatima Al-Zahra',
      senderAvatar: '/images/travelers/fatima.jpg',
      content: "Salam Mehmet! I'm interested in the tour but I have dietary restrictions. Are there vegetarian options available?",
      timestamp: '2026-03-12T14:00:00Z',
      status: 'read',
      isFlagged: false,
      hasBlurredContent: false
    },
    {
      id: 'msg-5',
      conversationId: 'conv-2',
      senderId: 'guide-123',
      senderName: 'Mehmet Yilmaz',
      content: "Wa alaikum salam Fatima! Yes, absolutely. The restaurant we visit has excellent vegetarian options. I'll make sure to notify them in advance.",
      timestamp: '2026-03-12T14:10:00Z',
      status: 'read',
      isFlagged: false,
      hasBlurredContent: false
    },
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'trav-456',
      senderName: 'Fatima Al-Zahra',
      content: "That's wonderful, thank you! Also, is there a prayer space nearby?",
      timestamp: '2026-03-13T14:05:00Z',
      status: 'read',
      isFlagged: false,
      hasBlurredContent: false
    },
    {
      id: 'msg-7',
      conversationId: 'conv-2',
      senderId: 'guide-123',
      senderName: 'Mehmet Yilmaz',
      content: "Of course! There's a small masjid just 5 minutes from the restaurant. I always include a prayer break in the itinerary for Muslim travelers.",
      timestamp: '2026-03-13T14:15:00Z',
      status: 'read',
      isFlagged: false,
      hasBlurredContent: false
    }
  ],
  'conv-3': [
    {
      id: 'msg-8',
      conversationId: 'conv-3',
      senderId: 'trav-789',
      senderName: 'Omar Farooq',
      content: "Hi, I'd like to book the Cappadocia tour for 2 people on March 20th. Is it still available?",
      timestamp: '2026-03-11T11:00:00Z',
      status: 'read',
      isFlagged: false,
      hasBlurredContent: false
    },
    {
      id: 'msg-9',
      conversationId: 'conv-3',
      senderId: 'trav-789',
      senderName: 'Omar Farooq',
      content: "Can we pay via bank transfer instead? omar.farooq@email.com",
      timestamp: '2026-03-12T11:20:00Z',
      status: 'delivered',
      isFlagged: true,
      flagReason: 'Email address detected',
      hasBlurredContent: true
    }
  ]
}

// ============================================================================
// REGEX PATTERNS FOR CONTENT BLURRING
// ============================================================================

const PHONE_REGEX = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const SUSPICIOUS_KEYWORDS = [
  'direct payment',
  'outside platform',
  'wire transfer',
  'paypal',
  'venmo',
  'cashapp',
  'western union',
  'discount for cash',
  'book directly',
  'bank transfer',
  'zelle',
  'money gram'
]

// ============================================================================
// MESSAGE CONTENT RENDERER WITH BLUR
// ============================================================================

interface MessageContentProps {
  content: string
  isFlagged: boolean
  hasBlurredContent: boolean
  bookingConfirmed: boolean
}

function MessageContent({ content, isFlagged, hasBlurredContent, bookingConfirmed }: MessageContentProps) {
  const [showBlurred, setShowBlurred] = useState(false)

  // If booking is confirmed, always show content
  const shouldBlur = !bookingConfirmed && hasBlurredContent && !showBlurred

  // Check for suspicious keywords
  const hasSuspiciousContent = SUSPICIOUS_KEYWORDS.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  )

  // Apply regex highlighting
  const highlightContent = (text: string) => {
    let parts = []
    let lastIndex = 0
    
    // Find all matches
    const phoneMatches = [...text.matchAll(PHONE_REGEX)]
    const emailMatches = [...text.matchAll(EMAIL_REGEX)]
    const allMatches = [...phoneMatches, ...emailMatches].sort((a, b) => a.index! - b.index!)
    
    if (allMatches.length === 0) return text
    
    allMatches.forEach((match, i) => {
      const matchStart = match.index!
      const matchEnd = matchStart + match[0].length
      
      // Add text before match
      if (matchStart > lastIndex) {
        parts.push(text.substring(lastIndex, matchStart))
      }
      
      // Add highlighted match
      parts.push(
        `<span class="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1 rounded font-mono text-xs">${match[0]}</span>`
      )
      
      lastIndex = matchEnd
    })
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }
    
    return parts.join('')
  }

  return (
    <div className="relative group">
      {/* Blur overlay */}
      {shouldBlur && (
        <div className="absolute inset-0 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 rounded flex items-center justify-center z-10">
          <button
            onClick={() => setShowBlurred(true)}
            className="
              flex items-center gap-1
              px-2 py-1
              bg-gray-900 dark:bg-white
              text-white dark:text-gray-900
              text-xs font-medium
              rounded
              opacity-0 group-hover:opacity-100
              transition-opacity
            "
          >
            <Eye className="w-3 h-3" />
            Reveal contact info
          </button>
        </div>
      )}

      {/* Message content */}
      <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
        {isFlagged ? (
          <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
                This message has been flagged for review
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {content}
              </p>
            </div>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: highlightContent(content) }} />
        )}
      </div>

      {/* Suspicious warning */}
      {hasSuspiciousContent && !isFlagged && (
        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <Shield className="w-3 h-3" />
          <span>This message contains suspicious content</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// TRAVELER AVATAR WITH TIER BADGE
// ============================================================================

interface TravelerAvatarProps {
  traveler: Traveler
  size?: 'sm' | 'md' | 'lg'
}

function TravelerAvatar({ traveler, size = 'md' }: TravelerAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const tierColors = {
    bronze: 'bg-amber-100 text-amber-700 border-amber-300',
    silver: 'bg-gray-100 text-gray-700 border-gray-300',
    gold: 'bg-amber-100 text-amber-700 border-amber-400',
    platinum: 'bg-blue-100 text-blue-700 border-blue-400'
  }

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden`}>
        {traveler.avatar ? (
          <Image
            src={traveler.avatar}
            alt={traveler.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-1/2 h-1/2 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Loyalty tier badge */}
      {traveler.loyaltyTier && (
        <div className={`
          absolute -bottom-1 -right-1
          w-4 h-4
          rounded-full
          border-2 border-white dark:border-gray-900
          flex items-center justify-center
          text-[8px] font-bold
          ${tierColors[traveler.loyaltyTier]}
        `}>
          {traveler.loyaltyTier === 'gold' ? 'G' : 
           traveler.loyaltyTier === 'platinum' ? 'P' :
           traveler.loyaltyTier === 'silver' ? 'S' : 'B'}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// CONVERSATION ITEM COMPONENT
// ============================================================================

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const lastMessage = conversation.lastMessage
  const time = new Date(lastMessage.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  const safetyColors = {
    safe: 'border-l-4 border-emerald-500',
    suspicious: 'border-l-4 border-amber-500',
    blocked: 'border-l-4 border-red-500'
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full
        p-4
        text-left
        border-b border-gray-200 dark:border-gray-800
        hover:bg-gray-50 dark:hover:bg-gray-800/50
        transition-colors
        ${isActive ? 'bg-blue-50 dark:bg-blue-950/30' : ''}
        ${safetyColors[conversation.safetyLevel]}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <TravelerAvatar traveler={conversation.traveler} size="md" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white truncate">
                {conversation.traveler.name}
              </span>
              {conversation.traveler.isVerified && (
                <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {time}
            </span>
          </div>

          {/* Booking reference */}
          {conversation.booking && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
              🎫 {conversation.booking.tourTitle} • {conversation.booking.date}
            </p>
          )}

          {/* Last message preview */}
          <div className="flex items-center gap-1 text-sm">
            {lastMessage.senderId === 'guide-123' && (
              <span className="text-xs text-gray-400">You: </span>
            )}
            <p className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">
              {lastMessage.hasBlurredContent && !conversation.bookingConfirmed
                ? '📞 Contact information hidden'
                : lastMessage.content}
            </p>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2 mt-1">
            {conversation.unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                {conversation.unreadCount}
              </span>
            )}
            {lastMessage.isFlagged && (
              <Flag className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            )}
            {conversation.safetyLevel === 'blocked' && (
              <Ban className="w-3 h-3 text-red-600 dark:text-red-400" />
            )}
            {!conversation.bookingConfirmed && (
              <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Booking pending
              </span>
            )}
            {conversation.booking?.status === 'completed' && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  bookingConfirmed: boolean
  showAvatar?: boolean
  travelerName?: string
  travelerAvatar?: string
}

function MessageBubble({ 
  message, 
  isOwn, 
  bookingConfirmed, 
  showAvatar = true,
  travelerName,
  travelerAvatar 
}: MessageBubbleProps) {
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {isOwn ? (
            <div className="w-full h-full flex items-center justify-center bg-blue-600">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : travelerAvatar ? (
            <Image
              src={travelerAvatar}
              alt={travelerName || ''}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      )}

      {/* Message */}
      <div className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
        {/* Sender name */}
        {!isOwn && showAvatar && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {travelerName}
          </p>
        )}

        {/* Message content */}
        <div className={`
          inline-block max-w-full
          p-3
          rounded-2xl
          ${isOwn 
            ? 'bg-blue-600 dark:bg-blue-700 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          }
        `}>
          <MessageContent
            content={message.content}
            isFlagged={message.isFlagged}
            hasBlurredContent={message.hasBlurredContent}
            bookingConfirmed={bookingConfirmed}
          />
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="
                  flex items-center gap-2
                  p-2
                  bg-gray-50 dark:bg-gray-800
                  rounded-lg
                  text-sm
                "
              >
                <Paperclip className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{att.name}</span>
                {att.size && (
                  <span className="text-xs text-gray-500">
                    ({(att.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp and status */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
          <span>{time}</span>
          {isOwn && message.status === 'read' && (
            <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          )}
          {isOwn && message.status === 'delivered' && (
            <CheckCircle className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// BOOKING INFO CARD
// ============================================================================

interface BookingInfoCardProps {
  booking: BookingInfo
}

function BookingInfoCard({ booking }: BookingInfoCardProps) {
  const date = new Date(`${booking.date}T${booking.time}`)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const statusColors = {
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
    pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
    completed: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
    cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
  }

  return (
    <div className="
      p-4
      bg-gray-50 dark:bg-gray-800/50
      border border-gray-200 dark:border-gray-700
      rounded-xl
      mb-4
    ">
      <div className="flex items-start gap-3">
        {/* Tour image placeholder */}
        <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {booking.tourTitle}
          </h4>
          
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate} at {booking.time}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {booking.peopleCount} people • ${booking.totalPrice}
            </div>
            {booking.meetingPoint && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {booking.meetingPoint}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className={`
              px-2 py-0.5
              text-xs font-medium
              rounded-full
              border
              ${statusColors[booking.status]}
            `}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            <Link
              href={`/dashboard/guide/tours/${booking.tourId}`}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View tour
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SAFETY INFO PANEL
// ============================================================================

function SafetyInfoPanel() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          p-1.5
          text-gray-500 hover:text-gray-700
          dark:text-gray-400 dark:hover:text-gray-200
          rounded-lg
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors
        "
        aria-label="Safety information"
      >
        <Info className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="
          absolute top-full right-0 mt-2
          w-72
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-800
          rounded-xl
          shadow-xl
          p-4
          z-50
        ">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Safe Chat Protection
          </h4>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <EyeOff className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Phone numbers and emails are automatically blurred until booking is confirmed</span>
            </li>
            <li className="flex items-start gap-2">
              <Flag className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Suspicious messages (payment requests outside platform) are flagged for admin review</span>
            </li>
            <li className="flex items-start gap-2">
              <Ban className="w-3 h-3 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <span>Never share personal contact information before booking is confirmed</span>
            </li>
            <li className="flex items-start gap-2">
              <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>All payments must go through the platform for protection</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// QUICK REPLY TEMPLATES
// ============================================================================

interface QuickReplyTemplatesProps {
  onSelect: (text: string) => void
}

function QuickReplyTemplates({ onSelect }: QuickReplyTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false)

  const templates = [
    { text: "Thank you for your message! I'll get back to you shortly." },
    { text: "Yes, that date is available. Would you like to proceed with booking?" },
    { text: "The meeting point is at the fountain. I'll be holding an orange sign." },
    { text: "Please remember that all payments must go through the platform." },
    { text: "I can accommodate dietary restrictions. Please let me know your requirements." }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          p-2
          text-gray-500 hover:text-gray-700
          dark:text-gray-400 dark:hover:text-gray-200
          rounded-lg
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors
        "
        title="Quick replies"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="
          absolute bottom-full left-0 mb-2
          w-64
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-800
          rounded-xl
          shadow-xl
          p-2
          z-50
        ">
          {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(template.text)
                setIsOpen(false)
              }}
              className="
                w-full
                text-left
                p-2
                text-sm text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                rounded-lg
                transition-colors
              "
            >
              {template.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EMPTY STATE COMPONENT - FOR WHEN NO CHAT IS SELECTED
// ============================================================================

function EmptyChatState() {
  return (
    <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center px-4">
        <div className="
          w-20 h-20
          mx-auto mb-4
          bg-blue-50 dark:bg-blue-950/30
          rounded-full
          flex items-center justify-center
        ">
          <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No conversation selected
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Choose a conversation from the list to start messaging with your travelers
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN MESSAGING PAGE - FULLY FIXED LAYOUT
// ============================================================================

export default function GuideMessagingPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('null')
  const [showMobileList, setShowMobileList] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const currentConversation = selectedConversation 
    ? MOCK_CONVERSATIONS.find(c => c.id === selectedConversation)
    : null
  const messages = selectedConversation ? MOCK_MESSAGES[selectedConversation] || [] : []

  // Filter conversations based on search
  const filteredConversations = MOCK_CONVERSATIONS.filter(conv => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      conv.traveler.name.toLowerCase().includes(term) ||
      conv.booking?.tourTitle.toLowerCase().includes(term) ||
      conv.lastMessage.content.toLowerCase().includes(term)
    )
  })

  const isInitialMount = useRef(true)

// Scroll to bottom when changing conversations (clicking on a chat)
useEffect(() => {
  // Skip on initial mount
  if (isInitialMount.current) {
    isInitialMount.current = false
    return
  }

  // Scroll to bottom when switching to a new conversation
  if (selectedConversation && messagesEndRef.current) {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100) // Small delay to ensure messages are rendered
  }
}, [selectedConversation]) // Only trigger when selectedConversation changes

// Optional: Also scroll when new messages arrive (if you want)
useEffect(() => {
  if (messages.length > 0 && scrollContainerRef.current && selectedConversation) {
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }
}, [messages]) // Only trigger when messages change

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    // In Phase 4: Send message via API
    console.log('Sending message:', newMessage)
    setNewMessage('')
  }

  const handleQuickReply = (text: string) => {
    setNewMessage(text)
  }

  const handleFlagMessage = (messageId: string) => {
    console.log('Flag message:', messageId)
    // In Phase 4: Report message to admin
  }

  return (
    <>
      {/* Main container - exactly viewport height minus navbar, no overflow, if you want the page to be for you need to controll this sm:h-[calc(100vh-4rem-5px)] in this measures the footer appear and without scroll bar because you are subtracting from height  */}
      <div className="pt-14 sm:pt-16 h-[calc(100vh)] sm:h-[calc(100vh)] bg-gray-50 dark:bg-gray-950 overflow-hidden">
        
        {/* Inner container - fills remaining height, no overflow */}
        <div className="h-full flex flex-col overflow-hidden">
          
          {/* Header - Fixed at top */}
          <div className="flex-none bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Messages
                </h1>
                <span className="
                  px-2 py-0.5
                  bg-blue-100 dark:bg-blue-900/30
                  text-blue-700 dark:text-blue-300
                  text-xs font-medium
                  rounded-full
                ">
                  {MOCK_CONVERSATIONS.reduce((acc, c) => acc + c.unreadCount, 0)} unread
                </span>
              </div>
              <div className="flex items-center gap-2">
                <SafetyInfoPanel />
                <button className="
                  p-2
                  text-gray-500 hover:text-gray-700
                  dark:text-gray-400 dark:hover:text-gray-200
                  rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors
                ">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="
                  p-2
                  text-gray-500 hover:text-gray-700
                  dark:text-gray-400 dark:hover:text-gray-200
                  rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors
                ">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="
                  w-full
                  pl-9 pr-4 py-2
                  bg-gray-100 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  text-sm
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                "
              />
            </div>
          </div>

          {/* Main messaging area - flex-1 with overflow-hidden */}
          <div className="flex-1 flex min-h-0 overflow-hidden bg-white dark:bg-gray-900">
            
            {/* Conversation list - Fixed width, scrollable */}
            <div className={`
              w-full sm:w-80 border-r border-gray-200 dark:border-gray-800
              flex flex-col overflow-hidden
              ${showMobileList ? 'block' : 'hidden sm:block'}
            `}>
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={selectedConversation === conv.id}
                      onClick={() => {
                        setSelectedConversation(conv.id)
                        setShowMobileList(false)
                      }}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No conversations found
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat area - Takes remaining width, handles overflow properly */}
            <div className={`
              flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-gray-900
              ${!showMobileList ? 'block' : 'hidden sm:block'}
            `}>
              {selectedConversation && currentConversation ? (
                <>
                  {/* Chat header - Fixed */}
                  <div className="flex-none flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Back button - mobile only */}
                      <button
                        onClick={() => setShowMobileList(true)}
                        className="sm:hidden p-1 text-gray-500 hover:text-gray-700"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Traveler info */}
                      <TravelerAvatar traveler={currentConversation.traveler} size="sm" />
                      <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                          {currentConversation.traveler.name}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {currentConversation.traveler.totalTrips} trips • {currentConversation.traveler.loyaltyTier} tier
                        </p>
                      </div>
                    </div>

                    {/* Safety indicator */}
                    {currentConversation.safetyLevel === 'suspicious' && (
                      <div className="flex-none px-2 py-1 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-lg flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        Under Review
                      </div>
                    )}
                  </div>

                  {/* Messages - Scrollable area */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {/* Booking info card */}
                    {currentConversation.booking && (
                      <BookingInfoCard booking={currentConversation.booking} />
                    )}

                    {messages.map((message, index) => (
                      <div key={message.id} className="relative group">
                        <MessageBubble
                          message={message}
                          isOwn={message.senderId === 'guide-123'}
                          bookingConfirmed={currentConversation.bookingConfirmed}
                          showAvatar={
                            index === 0 || 
                            messages[index - 1]?.senderId !== message.senderId
                          }
                          travelerName={currentConversation.traveler.name}
                          travelerAvatar={currentConversation.traveler.avatar}
                        />
                        
                        {/* Flag button */}
                        {!message.isFlagged && message.senderId !== 'guide-123' && (
                          <button
                            onClick={() => handleFlagMessage(message.id)}
                            className="
                              absolute -right-2 top-1/2 -translate-y-1/2
                              p-1
                              bg-white dark:bg-gray-800
                              border border-gray-200 dark:border-gray-700
                              rounded-lg
                              shadow-md
                              opacity-0 group-hover:opacity-100
                              transition-opacity
                              hover:bg-red-50 dark:hover:bg-red-900/30
                              text-gray-400 hover:text-red-600
                            "
                            title="Report message"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message input - Fixed at bottom */}
                  <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <QuickReplyTemplates onSelect={handleQuickReply} />
                      <button
                        type="button"
                        className="
                          flex-none p-2
                          text-gray-500 hover:text-gray-700
                          dark:text-gray-400 dark:hover:text-gray-200
                          rounded-lg
                          hover:bg-gray-100 dark:hover:bg-gray-800
                          transition-colors
                        "
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="
                          flex-1 min-w-0
                          px-4 py-2
                          bg-gray-100 dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700
                          rounded-lg
                          text-sm
                          text-gray-900 dark:text-white
                          placeholder-gray-500 dark:placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500/20
                        "
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="
                          flex-none p-2
                          bg-blue-600 dark:bg-blue-700
                          text-white
                          rounded-lg
                          hover:bg-blue-700 dark:hover:bg-blue-800
                          transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>

                    {/* Safety reminder */}
                    {!currentConversation.bookingConfirmed && (
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Contact info is blurred until booking is confirmed. Never share payment details.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <EmptyChatState />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}