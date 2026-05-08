// ============================================================================
// TRAVELER SAFE-CHAT INBOX - CARD 13 (ENHANCED LAYOUT)
// ============================================================================
// LOCATION: /frontend/src/app/dashboard/traveler/messages/page.tsx
// 
// PURPOSE: Secure messaging system between travelers and guides
// 
// DESIGN: Enhanced layout matching Guide version (Card 19)
// FEATURES: Traveler-specific (guide info, verification badges, booking context)
// ============================================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useBadgeReset } from '@/src/lib/hooks/useBadgeReset'
import Image from 'next/image'
import Link from 'next/link'
import { chatApi, ConversationResponse, MessageResponse } from '@/src/lib/api/chat'
import { notificationsApi } from '@/src/lib/api/notifications'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { useChatSocket } from '@/src/lib/hooks/useChatSocket'
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
 Lock,
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
 Award,
 TrendingUp,
 HelpCircle,
 Check,
 CheckCheck,
 Menu,
 Plus
} from 'lucide-react'
import NewChatModal from '@/src/components/chat/NewChatModal'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type MessageStatus = 'sent' | 'delivered' | 'read' | 'flagged'
type ConversationStatus = 'active' | 'blocked' | 'archived'
type SafetyLevel = 'safe' | 'suspicious' | 'blocked'
type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'

interface Guide {
 id: string
 profileId: string
 name: string
 avatar?: string
 email: string
 phone?: string
 isVerified: boolean
 impactScore?: number
 totalTrips?: number
 languages?: string[]
 badges?: {
 type: 'top_rated' | 'super_guide' | 'halal_specialist'
 label: string
 }[]
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
 hasSuspiciousContent: boolean
 readAtUtc?: string
 attachments?: {
 id: string
 type: 'image' | 'file'
 url: string
 name: string
 }[]
}

interface Conversation {
 id: string
 guide: Guide
 booking?: BookingInfo
 lastMessage: Message
 unreadCount: number
 status: ConversationStatus
 safetyLevel: SafetyLevel
 bookingConfirmed: boolean
 updatedAt: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CONVERSATIONS: Conversation[] = [
 {
 id: 'conv-1',
 guide: {
 id: 'guide-123',
 profileId: '123',
 name: 'Mehmet Yilmaz',
 avatar: '/images/guides/mehmet.jpg',
 email: 'mehmet.guide@example.com',
 phone: '+90 555 123 4567',
 isVerified: true,
 impactScore: 87,
 totalTrips: 156,
 languages: ['English', 'Arabic', 'Turkish'],
 badges: [
 { type: 'top_rated', label: 'Top Rated' },
 { type: 'super_guide', label: 'Super Guide' },
 { type: 'halal_specialist', label: 'Halal Specialist' }
 ]
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
 senderId: 'guide-123',
 senderName: 'Mehmet Yilmaz',
 content:"Perfect! I'll meet you at the fountain with an orange sign. My phone is +90 555 123 4567 if you need to reach me.",
 timestamp: '2026-03-10T14:30:00Z',
 status: 'delivered',
 isFlagged: true,
 flagReason: 'Phone number detected',
 hasBlurredContent: true,
 hasSuspiciousContent: true
 },
 unreadCount: 2,
 status: 'active',
 safetyLevel: 'suspicious',
 bookingConfirmed: true,
 updatedAt: '2026-03-10T14:30:00Z'
 },
 {
 id: 'conv-2',
 guide: {
 id: 'guide-456',
 profileId: '456',
 name: 'Layla Hassan',
 avatar: '/images/guides/layla.jpg',
 email: 'layla.hassan@example.com',
 phone: '+961 70 123 456',
 isVerified: true,
 impactScore: 92,
 totalTrips: 89,
 languages: ['English', 'Arabic', 'French'],
 badges: [
 { type: 'top_rated', label: 'Top Rated' },
 { type: 'halal_specialist', label: 'Halal Specialist' }
 ]
 },
 booking: {
 id: 'b2',
 tourId: '2',
 tourTitle: 'Beirut Street Food & Cultural Walk',
 tourImage: '/images/tours/beirut-food.jpg',
 date: '2026-03-22',
 time: '11:00',
 peopleCount: 4,
 totalPrice: 171,
 currency: 'USD',
 status: 'confirmed',
 meetingPoint: 'Beirut Souks Entrance'
 },
 lastMessage: {
 id: 'msg-6',
 conversationId: 'conv-2',
 senderId: 'traveler-123',
 senderName: 'Ahmed Khan',
 content:"Can we start at 10am instead of 11am?",
 timestamp: '2026-03-09T16:45:00Z',
 status: 'read',
 isFlagged: false,
 hasBlurredContent: false,
 hasSuspiciousContent: false
 },
 unreadCount: 0,
 status: 'active',
 safetyLevel: 'safe',
 bookingConfirmed: true,
 updatedAt: '2026-03-09T16:45:00Z'
 },
 {
 id: 'conv-3',
 guide: {
 id: 'guide-789',
 profileId: '789',
 name: 'Ahmet Demir',
 avatar: '/images/guides/ahmet.jpg',
 email: 'ahmet.demir@example.com',
 phone: '+90 555 987 6543',
 isVerified: true,
 impactScore: 78,
 totalTrips: 45,
 languages: ['English', 'Turkish'],
 badges: [
 { type: 'super_guide', label: 'Super Guide' }
 ]
 },
 booking: {
 id: 'b3',
 tourId: '3',
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
 senderId: 'guide-789',
 senderName: 'Ahmet Demir',
 content: 'Your booking is confirmed! Check your email at ahmed.khan@email.com for details.',
 timestamp: '2026-03-08T09:20:00Z',
 status: 'delivered',
 isFlagged: true,
 flagReason: 'Email address detected',
 hasBlurredContent: true,
 hasSuspiciousContent: true
 },
 unreadCount: 1,
 status: 'active',
 safetyLevel: 'suspicious',
 bookingConfirmed: false,
 updatedAt: '2026-03-08T09:20:00Z'
 },
 {
 id: 'conv-4',
 guide: {
 id: 'guide-101',
 profileId: '101',
 name: 'Elias Khoury',
 avatar: '/images/guides/elias.jpg',
 email: 'elias.khoury@example.com',
 phone: '+961 76 789 012',
 isVerified: true,
 impactScore: 65,
 totalTrips: 23,
 languages: ['English', 'Arabic'],
 badges: []
 },
 booking: {
 id: 'b4',
 tourId: '4',
 tourTitle: 'Byblos Ancient Ruins & Archaeological Tour',
 tourImage: '/images/tours/byblos-ruins.jpg',
 date: '2026-03-25',
 time: '10:00',
 peopleCount: 2,
 totalPrice: 110,
 currency: 'USD',
 status: 'cancelled',
 meetingPoint: 'Byblos Castle Entrance'
 },
 lastMessage: {
 id: 'msg-12',
 conversationId: 'conv-4',
 senderId: 'guide-101',
 senderName: 'Elias Khoury',
 content:"I can offer a discount if you book directly through me. Let's discuss payment options.",
 timestamp: '2026-03-07T14:10:00Z',
 status: 'read',
 isFlagged: true,
 flagReason: 'Suspicious payment discussion',
 hasBlurredContent: false,
 hasSuspiciousContent: false
 },
 unreadCount: 0,
 status: 'blocked',
 safetyLevel: 'blocked',
 bookingConfirmed: false,
 updatedAt: '2026-03-07T14:10:00Z'
 }
]

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
 'book directly'
]

// ============================================================================
// MESSAGE CONTENT RENDERER WITH BLUR
// ============================================================================

interface MessageContentProps {
 content: string
 isFlagged: boolean
 hasBlurredContent: boolean
 hasSuspiciousContent: boolean
 bookingConfirmed: boolean
}

function MessageContent({ content, isFlagged, hasBlurredContent, hasSuspiciousContent, bookingConfirmed }: MessageContentProps) {
 const [showBlurred, setShowBlurred] = useState(false)

 // If booking is confirmed, always show content unless it's suspicious
 const shouldBlur = (hasBlurredContent && !bookingConfirmed && !showBlurred) || (hasSuspiciousContent && !showBlurred)

 const highlightContent = (text: string) => {
 let parts = []
 let lastIndex = 0

 const phoneMatches = [...text.matchAll(PHONE_REGEX)]
 const emailMatches = [...text.matchAll(EMAIL_REGEX)]
 const allMatches = [...phoneMatches, ...emailMatches].sort((a, b) => a.index! - b.index!)

 if (allMatches.length === 0) return text

 allMatches.forEach((match, i) => {
 const matchStart = match.index!
 const matchEnd = matchStart + match[0].length
 if (matchStart > lastIndex) {
 parts.push(text.substring(lastIndex, matchStart))
 }
 parts.push(
 `<span class="bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/30 text-accent-light dark:text-accent-dark dark:text-amber-300 px-1 rounded font-mono text-xs">${match[0]}</span>`
 )
 lastIndex = matchEnd
 })
 if (lastIndex < text.length) {
 parts.push(text.substring(lastIndex))
 }
 return parts.join('')
 }

 return (
 <div className="relative group">
 {shouldBlur && (
 <div className="absolute inset-0  surface-card rounded flex items-center justify-center z-10">
 {hasSuspiciousContent ? (
 <span className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">
 <Lock className="w-3 h-3" />
 Payment Info Locked
 </span>
 ) : (
 <button
 onClick={() => setShowBlurred(true)}
 className="flex items-center gap-1 px-2 py-1 surface-base text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <Eye className="w-3 h-3" />
 Reveal contact info
 </button>
 )}
 </div>
 )}

 <div className="text-sm text-theme-primary whitespace-pre-wrap break-words">
 {isFlagged ? (
 <div className="flex items-start gap-2 p-2 bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/30 border border-theme rounded">
 <AlertTriangle className="w-4 h-4 text-accent-light dark:text-accent-dark dark:text-amber-400 flex-shrink-0 mt-0.5" />
 <div>
 <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">
 This message has been flagged for review
 </p>
 <p className="text-xs text-accent-light dark:text-accent-dark dark:text-amber-400">
 {content}
 </p>
 </div>
 </div>
 ) : (
 <div dangerouslySetInnerHTML={{ __html: highlightContent(content) }} />
 )}
 </div>

 {hasSuspiciousContent && !isFlagged && (
 <div className="mt-1 flex items-center gap-1 text-xs text-accent-light dark:text-accent-dark dark:text-amber-400">
 <Shield className="w-3 h-3" />
 <span>This message contains suspicious content</span>
 </div>
 )}
 </div>
 )
}

// ============================================================================
// GUIDE AVATAR WITH BADGES
// ============================================================================

interface GuideAvatarProps {
 guide: Guide
 size?: 'sm' | 'md' | 'lg'
}

function GuideAvatar({ guide, size = 'md' }: GuideAvatarProps) {
 const sizeClasses = {
 sm: 'w-8 h-8',
 md: 'w-10 h-10',
 lg: 'w-12 h-12'
 }

 return (
 <div className="relative flex-shrink-0">
 <div className={`${sizeClasses[size]} rounded-full surface-section overflow-hidden`}>
 {guide.avatar ? (
 <Image src={guide.avatar} alt={guide.name} fill className="object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <User className="w-1/2 h-1/2 text-theme-muted" />
 </div>
 )}
 </div>
 {guide.isVerified && (
 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-light rounded-full border-2 border-theme flex items-center justify-center">
 <Shield className="w-2 h-2 text-white" />
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
 const { user } = useAuth()
 const guide = conversation.guide
 const lastMessage = conversation.lastMessage
 const time = new Date(lastMessage.timestamp).toLocaleTimeString('en-US', {
 hour: 'numeric',
 minute: '2-digit'
 })

 const safetyColors = {
 safe: 'border-l-4 border-success-green',
 suspicious: 'border-l-4 border-accent-light dark:border-accent-dark',
 blocked: 'border-l-4 border-danger-red'
 }

 return (
 <button
 onClick={onClick}
 className={`w-full p-3 sm:p-4 text-left border-b border-theme hover:surface-section dark:hover:surface-card transition-colors ${isActive ? 'bg-primary-light/10 ' : ''} ${safetyColors[conversation.safetyLevel]}`}
 >
 <div className="flex items-start gap-3">
 <GuideAvatar guide={guide} size="md" />
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-1">
 <div className="flex items-center gap-2">
 <span className="font-semibold text-theme-primary truncate">
 {guide.name}
 </span>
 {guide.badges && guide.badges.length > 0 && (
 <Award className="w-3.5 h-3.5 text-accent-light dark:text-accent-dark dark:text-amber-400" />
 )}
 </div>
 <span className="text-xs text-theme-muted flex-shrink-0">
 {time}
 </span>
 </div>
 {conversation.booking && (
 <p className="text-xs text-theme-muted mb-1 truncate">
 🎫 {conversation.booking.tourTitle} • {conversation.booking.date}
 </p>
 )}
 <div className="flex items-center gap-1 text-sm">
 {lastMessage.senderId === user?.userId && (
 <span className="text-xs text-theme-muted">You: </span>
 )}
 <p className="flex-1 text-xs text-theme-secondary truncate">
 {lastMessage.hasBlurredContent && !conversation.bookingConfirmed
 ? 'Contact information hidden'
 : lastMessage.content}
 </p>
 </div>
 <div className="flex items-center gap-2 mt-1">
 {conversation.unreadCount > 0 && (
 <span className="px-1.5 py-0.5 bg-primary-light text-white text-xs font-medium rounded-full">
 {conversation.unreadCount}
 </span>
 )}
 {lastMessage.isFlagged && (
 <Flag className="w-3 h-3 text-accent-light dark:text-accent-dark dark:text-amber-400" />
 )}
 {conversation.safetyLevel === 'blocked' && (
 <Ban className="w-3 h-3 text-danger-red dark:text-red-400" />
 )}
 {!conversation.bookingConfirmed && (
 <span className="text-xs text-accent-light dark:text-accent-dark dark:text-amber-400 flex items-center gap-1">
 <Clock className="w-3 h-3" />
 Booking pending
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
 showAvatar: boolean
 senderName: string
 senderAvatar?: string
 index: number
 messages: Message[]
 isExpanded: boolean
 onToggle: () => void
}

function MessageBubble({
 message,
 isOwn,
 bookingConfirmed,
 showAvatar,
 senderName,
 senderAvatar,
 index,
 messages,
 isExpanded,
 onToggle
}: MessageBubbleProps) {
 const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
 hour: 'numeric',
 minute: '2-digit',
 hour12: true
 })

 return (
 <div className={`flex items-end gap-2 w-full max-w-[85%] ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}>
 {!isOwn ? (
 <div className="flex-shrink-0 w-8">
 {showAvatar && (
 <div className="relative w-8 h-8 rounded-full surface-section overflow-hidden">
 {senderAvatar ? (
 <Image src={senderAvatar} alt={senderName || ''} fill className="object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <User className="w-4 h-4 text-theme-muted" />
 </div>
 )}
 </div>
 )}
 </div>
 ) : (
 <div className="flex-shrink-0 w-8" />
 )}

 <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} min-w-0`}>
 {!isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId) && (
 <p className="text-xs text-theme-muted mb-1 ml-1">
 {senderName}
 </p>
 )}

 <div 
 onClick={onToggle}
 className={`
 relative p-2.5 sm:p-3 rounded-2xl text-[13px] sm:text-sm transition-all cursor-pointer
 ${isOwn 
 ? 'bg-primary-light text-white rounded-tr-none shadow-md hover:bg-primary-light-hover' 
 : 'surface-section text-theme-primary rounded-tl-none hover:surface-section dark:hover:surface-section'}
 ${isExpanded ? 'shadow-lg scale-[1.01]' : ''}
 `}
 >
 <MessageContent
 content={message.content}
 isFlagged={message.isFlagged}
 hasBlurredContent={message.hasBlurredContent}
 hasSuspiciousContent={message.hasSuspiciousContent}
 bookingConfirmed={bookingConfirmed}
 />
 </div>

 {(showAvatar || isExpanded) && (
 <motion.div 
 initial={false}
 animate={{ height: isExpanded ? 'auto' : '1.25rem', opacity: 1 }}
 className={`flex flex-col mt-0.5 ${isOwn ? 'items-end' : 'items-start'}`}
 >
 {!isExpanded ? (
 <div className={`flex items-center gap-1 text-[10px] text-theme-muted ${isOwn ? 'justify-end' : ''}`}>
 <span>{time}</span>
 {isOwn && (
 message.readAtUtc ? (
 <CheckCheck className="w-3 h-3 text-primary-light dark:text-primary-dark" strokeWidth={3} />
 ) : (
 <Check className="w-3 h-3 text-theme-muted" strokeWidth={3} />
 )
 )}
 </div>
 ) : (
 <motion.div 
 initial={{ opacity: 0, y: -4 }}
 animate={{ opacity: 1, y: 0 }}
 className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
 >
 <div className="flex items-center gap-1">
 <span className="text-[9px] text-theme-muted whitespace-nowrap">
 {new Date(message.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • {time}
 </span>
 {isOwn && (
 message.readAtUtc ? (
 <CheckCheck className="w-2.5 h-2.5 text-primary-light dark:text-primary-dark" strokeWidth={3} />
 ) : (
 <Check className="w-2.5 h-2.5 text-theme-muted" strokeWidth={3} />
 )
 )}
 </div>
 </motion.div>
 )}
 </motion.div>
 )}
 </div>
 
 {isOwn && <div className="flex-shrink-0 w-8" />}
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
 const dateStr = booking.date && booking.time ? `${booking.date}T${booking.time}` : ''
 const date = dateStr ? new Date(dateStr) : null
 const formattedDate = date && !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', {
 weekday: 'short',
 month: 'short',
 day: 'numeric',
 year: 'numeric'
 }) : booking.date

 const statusColors = {
 confirmed: 'bg-success-green/20 text-emerald-700 border-success-green dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-success-green',
 pending: 'bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark border-accent-light dark:border-accent-dark dark:bg-amber-950/30 dark:text-amber-300 dark:border-accent-light dark:border-accent-dark',
 completed: 'bg-primary-light/20 dark:bg-primary-dark/20 text-blue-700 border-primary-light dark:border-primary-dark dark:text-blue-300 dark:border-primary-light dark:border-primary-dark',
 cancelled: 'bg-danger-red/20 text-red-700 border-danger-red dark:bg-red-950/30 dark:text-red-300 dark:border-danger-red'
 }

 return (
 <div className="p-4 surface-section border border-theme rounded-xl mb-4">
 <div className="flex items-start gap-3">
 <div className="w-16 h-16 rounded-lg surface-section flex-shrink-0" />
 <div className="flex-1">
 <h4 className="font-semibold text-theme-primary mb-1">{booking.tourTitle}</h4>
 <div className="space-y-1 text-xs text-theme-secondary ">
 <div className="flex items-center gap-1">
 <Calendar className="w-3 h-3" />
 {formattedDate} at {booking.time}
 </div>
 <div className="flex items-center gap-1">
 <Users className="w-3 h-3" />
 {booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'} • ${booking.totalPrice}
 </div>
 </div>
 <div className="mt-2 flex items-center gap-2">
 <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[booking.status as keyof typeof statusColors] || statusColors.pending}`}>
 {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
 </span>
 <Link href={`/tours/${booking.tourId}`} className="text-xs text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline">View tour</Link>
 </div>
 </div>
 </div>
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

// ── Inner component (owns useSearchParams) ────────────────────────────────────
function TravelerMessagingContent() {
 const searchParams = useSearchParams()
 const initialConvoId = searchParams.get('id')
 const initialTourId = searchParams.get('tourId')
 const initialBookingId = searchParams.get('bookingId')

 const { user } = useAuth()
 const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
 const [showSidebar, setShowSidebar] = useState(true)
 const [isLoadingConvs, setIsLoadingConvs] = useState(true)
 const [isLoadingMsgs, setIsLoadingMsgs] = useState(false)
 const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null)
 const [searchTerm, setSearchTerm] = useState('')
 const [newMessage, setNewMessage] = useState('')
 const [realConvs, setRealConvs] = useState<ConversationResponse[]>([])
 const [realMsgs, setRealMsgs] = useState<MessageResponse[]>([])
 const [isSending, setIsSending] = useState(false)
 const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
 const [filter, setFilter] = useState<'all' | 'unread' | 'suspicious'>('all')
 const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)

 const messagesEndRef = useRef<HTMLDivElement>(null)
 const scrollContainerRef = useRef<HTMLDivElement>(null)

 useBadgeReset('traveler-messages')

 useEffect(() => {
 if (!user) return
 const load = async () => {
 setIsLoadingConvs(true)
 try {
 const convs = await chatApi.getConversations()
 setRealConvs(convs)
 if (initialConvoId) {
 setSelectedConversation(initialConvoId)
 setShowSidebar(false)
 } else if (initialTourId || initialBookingId) {
 // PARSE & VALIDATE: Explicitly handle string literals"null"/"undefined" from router
 const tourIdNum = (initialTourId && initialTourId !== 'null' && initialTourId !== 'undefined') 
 ? parseInt(initialTourId) 
 : NaN
 
 const bookingIdNum = (initialBookingId && initialBookingId !== 'null' && initialBookingId !== 'undefined')
 ? parseInt(initialBookingId)
 : NaN

 // SAFETY: Prevent 400 Bad Request by checking for at least one valid identifier
 if (isNaN(tourIdNum) && isNaN(bookingIdNum)) {
 setIsLoadingConvs(false)
 return
 }

 // OPTIMIZATION: Check if we already have a conversation for this tour/booking in the list we just fetched
 const existing = convs.find(c => {
 const matchTour = !isNaN(tourIdNum) && c.tourId === tourIdNum
 const matchBooking = !isNaN(bookingIdNum) && c.bookingId === bookingIdNum
 
 if (!isNaN(bookingIdNum)) return matchBooking
 return matchTour
 })

 if (existing) {
 console.log('Conversation already exists locally, selecting it.', { id: existing.id })
 setSelectedConversation(existing.id.toString())
 setShowSidebar(false)
 setIsLoadingConvs(false)
 return
 }

 try {
 console.log('Initiating conversation from URL params...', { 
 tourId: isNaN(tourIdNum) ? undefined : tourIdNum, 
 bookingId: isNaN(bookingIdNum) ? undefined : bookingIdNum 
 })
 const newConv = await chatApi.initiateConversation({
 tourId: isNaN(tourIdNum) ? undefined : tourIdNum,
 bookingId: isNaN(bookingIdNum) ? undefined : bookingIdNum
 })
 setRealConvs(prev => prev.some(c => c.id === newConv.id) ? prev : [newConv, ...prev])
 setSelectedConversation(newConv.id.toString())
 setShowSidebar(false)
 } catch (initErr: any) {
 console.error('Failed to auto-initiate conversation:', initErr)
 // Extract detailed backend message if available
 const backendData = initErr.response?.data
 const backendMessage = backendData?.message || backendData?.error
 const errorMsg = backendMessage || (backendData ? JSON.stringify(backendData) : initErr.message) || 'Unknown error'
 toast.error(`Could not start chat: ${errorMsg}`, { duration: 5000 })
 }
 }
 } catch (err) { 
 console.error('Failed to load conversations:', err)
 toast.error('Failed to load messages inbox.')
 } finally { 
 setIsLoadingConvs(false) 
 }
 }
 load()
 }, [user, initialConvoId, initialTourId, initialBookingId])

 const handleConversationInitiated = (convId: number) => {
 setSelectedConversation(convId.toString())
 setShowSidebar(false)
 setIsNewChatModalOpen(false)
 chatApi.getConversations().then(setRealConvs)
 }

 useEffect(() => {
    if (selectedConversation && user) {
      setIsLoadingMsgs(true)
      
      // PERSISTENT SYNC: Mark messages and notifications for this conversation as read
      const syncMessages = async () => {
        try {
          const convId = parseInt(selectedConversation);
          
          // 1. Mark persistent messages as read in DB
          await chatApi.markAsRead(convId);
          
          // 2. Mark notifications as read
          await notificationsApi.markByReference('NEW_MESSAGE', selectedConversation);
          
          // 3. Clear unread count in local state
          setRealConvs(prev => prev.map(c => 
            String(c.id) === String(selectedConversation) 
              ? { ...c, unreadCount: 0 } 
              : c
          ));

          // 4. Local badge sync (for Navigation/Sidebar)
          window.dispatchEvent(new CustomEvent('notification-mark-read', { 
            detail: { type: 'NEW_MESSAGE', referenceId: selectedConversation } 
          }));
        } catch (err) {
          console.error('Failed to mark messages as read:', err);
        }
      };
      
      syncMessages();

      chatApi.getMessages(parseInt(selectedConversation))
        .then(msgs => {
          const unique = Array.from(new Map(msgs.map(m => [String(m.id), m])).values())
          setRealMsgs(unique)
        })
        .catch(console.error)
        .finally(() => setIsLoadingMsgs(false))
    } else {
      setRealMsgs([])
    }
  }, [selectedConversation, user])

 const onReadReceipt = React.useCallback((receipt: { conversationId: number; readerId: number; readAt: string }) => {
 if (selectedConversation && String(receipt.conversationId) === String(selectedConversation)) {
 setRealMsgs(prev => prev.map(m => {
 if (String(m.senderId) !== String(receipt.readerId) && !m.readAtUtc) {
 return { ...m, readAtUtc: receipt.readAt }
 }
 return m
 }))
 }
 
 setRealConvs(prev => prev.map(c => {
 if (String(c.id) === String(receipt.conversationId)) {
 return { ...c, lastMessageRead: true }
 }
 return c
 }))
 }, [selectedConversation])

 const onMessageReceived = React.useCallback((receivedMsg: MessageResponse) => {
 setRealMsgs(prev => {
 const exists = prev.some(m => String(m.id) === String(receivedMsg.id))
 if (exists) return prev
 return [...prev, receivedMsg]
 })

 setRealConvs(prev => prev.map(c => 
 String(c.id) === String(receivedMsg.conversationId) 
 ? { ...c, updatedAtUtc: receivedMsg.createdAtUtc, lastMessageContent: receivedMsg.content, lastMessageRead: false } 
 : c
 ).sort((a, b) => new Date(b.updatedAtUtc).getTime() - new Date(a.updatedAtUtc).getTime()))

 if (selectedConversation && String(receivedMsg.conversationId) === String(selectedConversation)) {
 // If we are currently in this chat, mark as read in DB and keep unreadCount at 0
 chatApi.markAsRead(receivedMsg.conversationId).catch(console.error)
 setRealConvs(prev => prev.map(c => 
 String(c.id) === String(receivedMsg.conversationId)
 ? { ...c, unreadCount: 0, lastMessageRead: true }
 : c
 ))
 } else {
 // Increment unread count for other conversations
 setRealConvs(prev => prev.map(c => 
 String(c.id) === String(receivedMsg.conversationId)
 ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
 : c
 ))
 }
 }, [selectedConversation])

 useChatSocket(
 selectedConversation ? parseInt(selectedConversation) : null,
 onMessageReceived,
 onReadReceipt
 )

 const mappedConvs: Conversation[] = realConvs.map(c => {
 const timeStr = c.updatedAtUtc ? (c.updatedAtUtc.endsWith('Z') ? c.updatedAtUtc : c.updatedAtUtc + 'Z') : new Date().toISOString()
 let bookingDate = '', bookingTime = ''
 if (c.bookingStartTimeUtc) {
 const date = new Date(c.bookingStartTimeUtc)
 bookingDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
 bookingTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
 }
 return {
 id: c.id.toString(),
 guide: { 
 id: c.guideId.toString(), 
 profileId: c.guideProfileId?.toString() || c.guideId.toString(),
 name: c.guideName || 'Guide', 
 avatar: c.guideAvatarUrl, 
 isVerified: true, 
 email: '' 
 },
 lastMessage: { 
 id: `last-${c.id}`, 
 conversationId: c.id.toString(), 
 senderId: '', 
 senderName: '', 
 content: c.lastMessageContent || 'Tap to view messages...', 
 timestamp: timeStr, 
 status: (c.lastMessageRead ? 'read' : 'sent') as MessageStatus, 
 isFlagged: false, 
 hasBlurredContent: false, 
 hasSuspiciousContent: false 
 },
 unreadCount: c.unreadCount || 0, 
 status: 'active', 
 safetyLevel: 'safe', 
 bookingConfirmed: c.bookingStatus === 'Confirmed' || c.bookingStatus === 'Completed', 
 updatedAt: timeStr,
 booking: c.bookingId ? { 
 id: c.bookingId.toString(), 
 tourId: c.tourId.toString(), 
 tourTitle: c.tourTitle, 
 date: bookingDate, 
 time: bookingTime, 
 peopleCount: c.peopleCount || 1, 
 totalPrice: c.totalPrice || 0, 
 currency: c.currency || 'USD', 
 status: (c.bookingStatus?.toLowerCase() as BookingStatus || 'pending') 
 } : undefined
 }
 })

 const currentConversation = selectedConversation ? mappedConvs.find(c => c.id === selectedConversation) : null
 const messages: Message[] = realMsgs.map(m => ({
 id: m.id.toString(), 
 conversationId: m.conversationId.toString(), 
 senderId: m.senderId.toString(), 
 senderName: m.senderName, 
 content: m.content,
 timestamp: m.createdAtUtc ? (m.createdAtUtc.endsWith('Z') ? m.createdAtUtc : m.createdAtUtc + 'Z') : new Date().toISOString(),
 status: 'read', 
 isFlagged: false, 
 hasBlurredContent: EMAIL_REGEX.test(m.content) || PHONE_REGEX.test(m.content),
 hasSuspiciousContent: SUSPICIOUS_KEYWORDS.some(kw => m.content.toLowerCase().includes(kw)),
 readAtUtc: m.readAtUtc
 }))

 const filteredConversations = mappedConvs.filter(conv => {
 // Only show chats with messages, or the currently selected one
 const hasMessages = conv.lastMessage && 
 conv.lastMessage.content && 
 conv.lastMessage.content !== 'Tap to view messages...'
 const isSelected = selectedConversation === conv.id
 
 if (!hasMessages && !isSelected) return false

 const matchesSearch = conv.guide.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
 conv.booking?.tourTitle.toLowerCase().includes(searchTerm.toLowerCase())
 if (!matchesSearch) return false

 if (filter === 'unread') return conv.unreadCount > 0
 if (filter === 'suspicious') return conv.safetyLevel !== 'safe'
 return true
 })

 useEffect(() => {
 if (selectedConversation && messages.length > 0) {
 const timer = setTimeout(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
 }, 50)
 return () => clearTimeout(timer)
 }
 }, [selectedConversation])

 useEffect(() => {
 if (selectedConversation && messages.length > 0) {
 const timer = setTimeout(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
 }, 50)
 return () => clearTimeout(timer)
 }
 }, [messages.length])

 const handleSendMessage = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!newMessage.trim() || !selectedConversation || isSending) return
 
 if (isNaN(parseInt(selectedConversation))) {
 console.error('Invalid conversation ID:', selectedConversation)
 return
 }

 setIsSending(true)
 try {
 await chatApi.sendMessage({ 
 conversationId: parseInt(selectedConversation), 
 content: newMessage 
 })
 setNewMessage('')
 } catch (error: any) { 
 console.error('Failed to send:', error)
 const errorMsg = error.response?.data?.message || error.message || 'Unknown error'
 alert(`Failed to send message: ${errorMsg}. Please try refreshing or check your internet connection.`)
 } finally {
 setIsSending(false)
 }
 }

  return (
  <div className="h-[100dvh] md:h-[calc(100vh-4rem)] surface-base overflow-hidden">
 <NewChatModal 
 isOpen={isNewChatModalOpen}
 onClose={() => setIsNewChatModalOpen(false)}
 role="TRAVELER"
 existingBookingIds={realConvs.map(c => c.bookingId).filter(Boolean) as number[]}
 onConversationInitiated={(id) => {
 setSelectedConversation(id.toString())
 // Refresh conversations list
 chatApi.getConversations().then(setRealConvs)
 }}
 />
  <div className="h-full flex flex-col overflow-hidden">
  <div className="flex-none surface-base border-b border-theme dark:border-primary-dark/10 px-4 sm:px-6 py-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <MessageSquare className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <h1 className="text-lg font-bold text-theme-primary">
 Messages
 </h1>
  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-500/20">
  {realConvs.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
  </span>
 <button
 onClick={() => setIsNewChatModalOpen(true)}
 className="p-1.5 text-primary-light dark:text-primary-dark dark:text-primary-dark hover:bg-primary-light/10 dark:hover:surface-base rounded-full transition-colors ml-1"
 title="New Chat"
 >
 <Plus className="w-5 h-5" />
 </button>
 </div>
 <div className="flex items-center gap-2">
 {/* Filter Menu */}
 <div className="relative">
 <button
 onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
 className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
 filter !== 'all' 
 ? 'bg-primary-light/10 text-primary-light dark:text-primary-dark dark:text-primary-dark ' 
 : 'text-theme-muted hover:surface-section dark:hover:surface-card'
 }`}
 >
 <Filter className="w-5 h-5" />
 <span className="text-sm font-medium hidden sm:inline">
 {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Suspicious'}
 </span>
 </button>

 <AnimatePresence>
 {isFilterMenuOpen && (
 <>
 <div 
 className="fixed inset-0 z-20" 
 onClick={() => setIsFilterMenuOpen(false)} 
 />
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 className="absolute right-0 mt-2 w-48 surface-card rounded-xl shadow-xl border border-theme z-30 py-1 overflow-hidden"
 >
 {(['all', 'unread', 'suspicious'] as const).map((t) => (
 <button
 key={t}
 onClick={() => {
 setFilter(t)
 setIsFilterMenuOpen(false)
 }}
 className={`w-full px-4 py-2 text-sm text-left hover:surface-section dark:hover:surface-card transition-colors flex items-center justify-between ${
 filter === t ? 'text-primary-light dark:text-primary-dark dark:text-primary-dark font-medium' : 'text-theme-secondary '
 }`}
 >
 {t.charAt(0).toUpperCase() + t.slice(1)}
 {filter === t && <Check className="w-4 h-4" />}
 </button>
 ))}
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 </div>
 <div className="relative mt-2 px-4 sm:px-6 pb-2 border-b border-theme dark:border-primary-dark/10">
 <Search className="absolute left-7 sm:left-9 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-muted" />
 <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-8 sm:pl-9 pr-4 py-2 surface-section border border-theme rounded-xl text-xs sm:text-sm text-theme-primary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light/20 transition-all" />
 </div>

  <div className="flex-1 flex min-h-0 overflow-hidden surface-base">
 <div className={`w-full sm:w-80 border-r border-theme dark:border-primary-dark/10 flex flex-col min-h-0 overflow-hidden ${showSidebar ? 'block' : 'hidden'}`}>
 <div className="flex-1 overflow-y-auto chat-scrollbar">
 {isLoadingConvs ? (
 Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="p-4 border-b border-theme animate-pulse flex items-center gap-3">
 <div className="w-10 h-10 surface-section rounded-full" />
 <div className="flex-1 space-y-2">
 <div className="h-3 surface-section rounded w-1/2" />
 <div className="h-2 surface-section rounded w-3/4" />
 </div>
 </div>
 ))
 ) : filteredConversations.map(conv => (
 <ConversationItem key={conv.id} conversation={conv} isActive={selectedConversation === conv.id} onClick={() => { setSelectedConversation(conv.id); setShowSidebar(false); }} />
 ))}
 </div>
 </div>

 <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${!showSidebar ? 'relative surface-base' : 'hidden sm:flex'}`}>
  {currentConversation ? (
  <>
  <div className="flex-none h-14 sm:h-16 px-4 sm:px-6 border-b border-theme dark:border-primary-dark/10 flex items-center justify-between surface-base sticky top-0 z-20 shadow-sm">
 <div className="flex items-center gap-3">
 <button 
 onClick={() => {
 setSelectedConversation(null)
 setShowSidebar(true)
 }}
 className="p-2 -ml-2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 transition-colors flex items-center group"
 title="Back to List"
 >
 <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
 </button>
 <Link href={`/guides/${currentConversation.guide.profileId}`} className="flex items-center gap-3 flex-1 min-w-0">
 <GuideAvatar guide={currentConversation.guide} size="sm" />
 <div className="min-w-0">
 <h2 className="font-semibold truncate">{currentConversation.guide.name}</h2>
 <p className="text-xs text-theme-muted truncate">Guide</p>
 </div>
 </Link>
 </div>
 </div>
 <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar">
 {currentConversation.booking && <BookingInfoCard booking={currentConversation.booking} />}
 {isLoadingMsgs ? (
 <div className="space-y-4">
 {[1,2,3].map(i => <div key={i} className={`h-16 w-2/3 surface-section rounded-2xl animate-pulse ${i % 2 === 0 ? 'ml-auto' : ''}`} />)}
 </div>
 ) : messages.map((m, i) => (
 <MessageBubble key={m.id} message={m} isOwn={m.senderId === user?.userId} bookingConfirmed={currentConversation.bookingConfirmed} showAvatar={i === messages.length - 1 || messages[i+1]?.senderId !== m.senderId} senderName={currentConversation.guide.name} senderAvatar={currentConversation.guide.avatar} index={i} messages={messages} isExpanded={expandedMessageId === m.id} onToggle={() => setExpandedMessageId(expandedMessageId === m.id ? null : m.id)} />
 ))}
 <div ref={messagesEndRef} />
 </div>
 <div className="flex-none p-4 border-t border-theme dark:border-primary-dark/10">
 <form onSubmit={handleSendMessage} className="flex gap-2">
 <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 surface-section border-none rounded-lg text-sm" />
 <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-primary-light text-white rounded-lg disabled:opacity-50"><Send className="w-5 h-5" /></button>
 </form>
 </div>
 </>
 ) : <div className="h-full flex items-center justify-center text-theme-muted">Pick a chat to start</div>}
 </div>
 </div>
 </div>
 </div>
 )
}

export default function TravelerMessagesPage() {
  return (
    <React.Suspense fallback={<div className="h-screen surface-base flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-light border-t-transparent rounded-full animate-spin" /></div>}>
      <TravelerMessagingContent />
    </React.Suspense>
  )
}
