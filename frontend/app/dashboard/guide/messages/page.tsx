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
// ✓ WhatsApp-style message details (click to see time)
// ============================================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useBadgeReset } from '@/src/lib/hooks/useBadgeReset'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { chatApi, ConversationResponse, MessageResponse } from '@/src/lib/api/chat'
import { notificationsApi } from '@/src/lib/api/notifications'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { useChatSocket } from '@/src/lib/hooks/useChatSocket'
import NewChatModal from '@/src/components/chat/NewChatModal'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
 MessageSquare,
 Send,
 Paperclip,
 MoreVertical,
 Search,
 Filter,
 ChevronLeft,
 ChevronRight,
 ArrowLeft,
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
 Award,
 Menu,
 RefreshCw,
 Calendar,
 MapPin,
 X,
 Info,
 DollarSign,
 TrendingUp,
 HelpCircle,
 Check,
 CheckCheck,
 Plus
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
 profileId: string
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
 hasSuspiciousContent: boolean
 readAtUtc?: string
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
 profileId: '123',
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
 content:"Perfect! I'll meet you at the fountain. My phone is +90 555 111 2233 if anything changes.",
 timestamp: '2026-03-14T09:30:00Z',
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
 updatedAt: '2026-03-14T09:30:00Z'
 },
 {
 id: 'conv-2',
 traveler: {
 id: 'trav-456',
 profileId: '456',
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
 content:"Of course! I can accommodate vegetarian options. Just let the restaurant know when we arrive.",
 timestamp: '2026-03-13T14:15:00Z',
 status: 'read',
 isFlagged: false,
 hasBlurredContent: false,
 hasSuspiciousContent: false
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
 profileId: '789',
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
 content:"Can we pay via bank transfer instead? omar.farooq@email.com",
 timestamp: '2026-03-12T11:20:00Z',
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
 updatedAt: '2026-03-12T11:20:00Z'
 },
 {
 id: 'conv-4',
 traveler: {
 id: 'trav-101',
 profileId: '101',
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
 content:"Perfect! I'll meet you at the terminal entrance. Looking forward to the cruise!",
 timestamp: '2026-03-11T16:45:00Z',
 status: 'read',
 isFlagged: false,
 hasBlurredContent: false,
 hasSuspiciousContent: false
 },
 unreadCount: 0,
 status: 'active',
 safetyLevel: 'safe',
 bookingConfirmed: true,
 updatedAt: '2026-03-11T16:45:00Z'
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
 hasSuspiciousContent: boolean
 bookingConfirmed: boolean
}

function MessageContent({ content, isFlagged, hasBlurredContent, hasSuspiciousContent, bookingConfirmed }: MessageContentProps) {
 const [showBlurred, setShowBlurred] = useState(false)

 // If booking is confirmed, always show content unless it's suspicious
 const shouldBlur = (hasBlurredContent && !bookingConfirmed && !showBlurred) || (hasSuspiciousContent && !showBlurred)

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
 `<span class="bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-900/30 text-accent-light dark:text-accent-dark dark:text-amber-300 px-1 rounded font-mono text-xs">${match[0]}</span>`
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
 <div className="absolute inset-0  surface-card rounded flex items-center justify-center z-10">
 {hasSuspiciousContent ? (
 <span className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-[10px] font-bold capitalize tracking-normal rounded">
 <Lock className="w-3 h-3" />
 Payment Info Locked
 </span>
 ) : (
 <button
 onClick={() => setShowBlurred(true)}
 className="
 flex items-center gap-1
 px-2 py-1
 surface-base text-white text-xs font-medium
 rounded
 opacity-0 group-hover:opacity-100
 transition-opacity
"
 >
 <Eye className="w-3 h-3" />
 Reveal contact info
 </button>
 )}
 </div>
 )}

 {/* Message content */}
 <div className="text-sm text-theme-primary whitespace-pre-wrap break-words">
 {isFlagged ? (
 <div className="flex items-start gap-2 p-2 bg-accent-light/10 dark:bg-accent-dark/10 dark:bg-amber-950/30 border border-accent-light dark:border-accent-dark dark:border-accent-light dark:border-accent-dark rounded">
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

 {/* Suspicious warning */}
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

 interface TierStyle {
 border: string
 badge: string
 icon?: React.ReactNode
 label?: string
 }

 const tierStyles: Record<string, TierStyle> = {
 bronze: {
 border: 'border-accent-light dark:border-accent-dark/40',
 badge: 'bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark border-accent-light dark:border-accent-dark',
 icon: <Award className="w-2.5 h-2.5" />
 },
 silver: {
 border: 'border-theme-strong/50',
 badge: 'surface-section text-theme-secondary border-theme-strong',
 label: 'S'
 },
 gold: {
 border: 'border-accent-light dark:border-accent-dark',
 badge: 'bg-accent-light/20 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark border-accent-light dark:border-accent-dark',
 label: 'G'
 },
 platinum: {
 border: 'border-primary-light dark:border-primary-dark',
 badge: 'bg-primary-light/20 dark:bg-primary-dark/20 text-blue-700 border-primary-light dark:border-primary-dark',
 label: 'P'
 }
 }

 const currentStyle = traveler.loyaltyTier ? tierStyles[traveler.loyaltyTier] : null

 return (
 <div className="relative flex-shrink-0">
 <div className={`
 ${sizeClasses[size]} 
 rounded-full 
 surface-section 
 overflow-hidden 
 aspect-square
 border-2
 ${currentStyle?.border || 'border-transparent'}
 shadow-sm
 `}>
 {traveler.avatar ? (
 <Image
 src={traveler.avatar}
 alt={traveler.name}
 fill
 className="object-cover rounded-full"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <User className="w-1/2 h-1/2 text-theme-muted" />
 </div>
 )}
 </div>
 
 {/* Loyalty tier badge */}
 {traveler.loyaltyTier && (
 <div className={`
 absolute -bottom-1 -right-1
 w-4 h-4
 rounded-full
 border-2 border-theme flex items-center justify-center
 text-[8px] font-bold
 shadow-sm
 ${currentStyle?.badge}
 `}>
 {traveler.loyaltyTier === 'bronze' ? (
 currentStyle?.icon
 ) : (
 currentStyle?.label
 )}
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
 className={`
 w-full
 p-3 sm:p-4
 text-left
 border-b border-theme
 hover:surface-section dark:hover:surface-card
 transition-colors
 ${isActive ? 'bg-primary-light/10 ' : ''}
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
 <span className="font-semibold text-theme-primary truncate">
 {conversation.traveler.name}
 </span>
 {conversation.traveler.isVerified && (
 <Shield className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 )}
 </div>
 <span className="text-xs text-theme-muted flex-shrink-0">
 {time}
 </span>
 </div>

 {/* Booking reference */}
 {conversation.booking && (
 <p className="text-xs text-theme-muted mb-1 truncate">
 🎫 {conversation.booking.tourTitle} • {conversation.booking.date}
 </p>
 )}

 {/* Last message preview */}
 <div className="flex items-center gap-1 text-sm">
 {lastMessage.senderId === user?.userId && (
 <span className="text-xs text-theme-muted">You: </span>
 )}
 <p className="flex-1 text-xs text-theme-secondary truncate">
 {lastMessage.hasBlurredContent && !conversation.bookingConfirmed
 ? '📞 Contact information hidden'
 : lastMessage.content}
 </p>
 </div>

 {/* Status indicators */}
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
 {conversation.booking?.status === 'completed' && (
 <span className="text-xs text-success-green dark:text-emerald-400 flex items-center gap-1">
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
 showAvatar: boolean
 travelerName: string
 travelerAvatar?: string
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
 travelerName, 
 travelerAvatar,
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
 {/* Avatar block */}
 {!isOwn ? (
 <div className="flex-shrink-0 w-8">
 {showAvatar && (
 <TravelerAvatar 
 traveler={{ 
 id: message.senderId, 
 profileId: '', // placeholder
 name: travelerName, 
 avatar: travelerAvatar, 
 email: '', 
 totalTrips: 0, 
 loyaltyTier: 'bronze' 
 }} 
 size="sm" 
 />
 )}
 </div>
 ) : (
 <div className="flex-shrink-0 w-8" />
 )}

 {/* Message content block */}
 <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} min-w-0`}>
 {/* Sender name - Only show on the first message of a block when not own */}
 {!isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId) && (
 <p className="text-xs text-theme-muted mb-1 ml-1">
 {travelerName}
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

 {/* Timestamp section */}
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

 {/* Right spacer for own messages to match the left avatar column width */}
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
 <div className="
 p-4
 surface-section
 border border-theme
 rounded-xl
 mb-4
">
 <div className="flex items-start gap-3">
 {/* Tour image placeholder */}
 <div className="w-16 h-16 rounded-lg surface-section flex-shrink-0" />

 <div className="flex-1">
 <h4 className="font-semibold text-theme-primary mb-1">
 {booking.tourTitle}
 </h4>
 
 <div className="space-y-1 text-xs text-theme-secondary ">
 <div className="flex items-center gap-1">
 <Calendar className="w-3 h-3" />
 {formattedDate} at {booking.time}
 </div>
 <div className="flex items-center gap-1">
 <Users className="w-3 h-3" />
 {booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'} • ${booking.totalPrice}
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
 ${statusColors[booking.status as keyof typeof statusColors] || statusColors.pending}
 `}>
 {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
 </span>
 <Link
 href={`/dashboard/guide/tours/${booking.tourId}`}
 className="text-xs text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline"
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
 className="p-1.5 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 rounded-lg hover:surface-section dark:hover:surface-card transition-colors"
 aria-label="Safety information"
 >
 <Info className="w-4 h-4" />
 </button>

 {isOpen && (
 <div className="
 absolute top-full right-0 mt-2
 w-72
 surface-card
 border border-theme
 rounded-xl
 shadow-xl
 p-4
 z-50
">
 <h4 className="font-semibold text-theme-primary mb-2 flex items-center gap-1">
 <Shield className="w-4 h-4 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 Safe Chat Protection
 </h4>
 <ul className="space-y-2 text-xs text-theme-secondary ">
 <li className="flex items-start gap-2">
 <EyeOff className="w-3 h-3 text-accent-light dark:text-accent-dark dark:text-amber-400 flex-shrink-0 mt-0.5" />
 <span>Phone numbers and emails are automatically blurred until booking is confirmed</span>
 </li>
 <li className="flex items-start gap-2">
 <Flag className="w-3 h-3 text-accent-light dark:text-accent-dark dark:text-amber-400 flex-shrink-0 mt-0.5" />
 <span>Suspicious messages (payment requests outside platform) are flagged for admin review</span>
 </li>
 <li className="flex items-start gap-2">
 <Ban className="w-3 h-3 text-danger-red dark:text-red-400 flex-shrink-0 mt-0.5" />
 <span>Never share personal contact information before booking is confirmed</span>
 </li>
 <li className="flex items-start gap-2">
 <DollarSign className="w-3 h-3 text-success-green dark:text-emerald-400 flex-shrink-0 mt-0.5" />
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
 { text:"Thank you for your message! I'll get back to you shortly." },
 { text:"Yes, that date is available. Would you like to proceed with booking?" },
 { text:"The meeting point is at the fountain. I'll be holding an orange sign." },
 { text:"Please remember that all payments must go through the platform." },
 { text:"I can accommodate dietary restrictions. Please let me know your requirements." }
 ]

 return (
 <div className="relative">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="
 p-2
 text-theme-muted hover:text-theme-secondary
 dark:hover:text-gray-200
 rounded-lg
 hover:surface-section dark:hover:surface-card
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
 surface-card
 border border-theme
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
 text-sm text-theme-secondary
 hover:surface-section dark:hover:surface-card
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
 <div className="h-full flex items-center justify-center surface-card">
 <div className="text-center px-4">
 <div className="w-20 h-20 mx-auto mb-4 bg-primary-light/10 rounded-full flex items-center justify-center">
 <MessageSquare className="w-8 h-8 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 </div>
 <h3 className="text-lg font-semibold text-theme-primary mb-2">
 No conversation selected
 </h3>
 <p className="text-sm text-theme-muted max-w-sm">
 Choose a conversation from the list to start messaging with your travelers
 </p>
 </div>
 </div>
 )
}

// ============================================================================
// MAIN MESSAGING PAGE - FULLY FIXED LAYOUT
// ============================================================================

// ── Inner component (owns useSearchParams) ────────────────────────────────────
function GuideMessagingContent() {
 const searchParams = useSearchParams()
 const initialConvoId = searchParams.get('id')
 const initialTourId = searchParams.get('tourId')
 const initialBookingId = searchParams.get('bookingId')

 const { user } = useAuth()
 const [selectedConversation, setSelectedConversation] = React.useState<string | null>(null)
 const [showSidebar, setShowSidebar] = React.useState(true)
 const [isLoadingConvs, setIsLoadingConvs] = React.useState(true)
 const [isLoadingMsgs, setIsLoadingMsgs] = React.useState(false)
 const [expandedMessageId, setExpandedMessageId] = React.useState<string | null>(null)
 const messagesEndRef = React.useRef<HTMLDivElement>(null)
 const scrollContainerRef = React.useRef<HTMLDivElement>(null)

 const [realConvs, setRealConvs] = React.useState<ConversationResponse[]>([])
 const [realMsgs, setRealMsgs] = React.useState<MessageResponse[]>([])
 const [newMessage, setNewMessage] = React.useState('')
 const [searchTerm, setSearchTerm] = React.useState('')
 const [isSending, setIsSending] = React.useState(false)

 const [showFilterMenu, setShowFilterMenu] = useState(false)
 const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
 const [filter, setFilter] = useState<'all' | 'unread' | 'suspicious'>('all')
 const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
 const [showMoreMenu, setShowMoreMenu] = useState(false)

 useBadgeReset('guide-messages')

 const handleConversationInitiated = (convId: number) => {
 setSelectedConversation(convId.toString())
 setShowSidebar(false)
 setIsNewChatModalOpen(false)
 // Refresh conversations list to ensure the new one appears (or wait for socket)
 chatApi.getConversations().then(setRealConvs)
 }

 React.useEffect(() => {
 if (!user) return
 
 const loadConversations = async () => {
 setIsLoadingConvs(true)
 try {
 const convs = await chatApi.getConversations()
 setRealConvs(convs)

 // Handle direct redirection from bookings
 if (initialConvoId) {
 setSelectedConversation(initialConvoId)
 setShowSidebar(false)
 } else if (initialTourId || initialBookingId) {
 const tId = (initialTourId && initialTourId !== 'null' && initialTourId !== 'undefined')
 ? parseInt(initialTourId)
 : NaN;
 const bId = (initialBookingId && initialBookingId !== 'null' && initialBookingId !== 'undefined') 
 ? parseInt(initialBookingId) 
 : NaN;

 // GUIDES cannot initiate a chat without a valid bookingId (backend restriction)
 // Exception: if bookingId is present, tourId can be deduced on backend.
 if (isNaN(bId) && isNaN(tId)) {
 console.warn('Guide tried to initiate chat with invalid context:', { initialTourId, initialBookingId });
 // Only show toast if they actually clicked something intent-based
 if (initialTourId || initialBookingId) {
 toast.error("Invalid chat link: missing booking context.");
 }
 setIsLoadingConvs(false)
 return
 }

 try {
 const newConv = await chatApi.initiateConversation({
 tourId: tId,
 bookingId: bId
 })
 
 setRealConvs(prev => {
 const exists = prev.find(c => c.id === newConv.id)
 if (exists) return prev
 return [newConv, ...prev]
 })
 setSelectedConversation(newConv.id.toString())
 setShowSidebar(false)
 } catch (e: any) {
 console.error('Failed to initiate:', e)
 const errorMsg = e.response?.data?.message || e.message || 'Failed to start conversation'
 toast.error(errorMsg)
 }
 }
 } catch (err) {
 console.error(err)
 } finally {
 setIsLoadingConvs(false)
 }
 }

 loadConversations()
 }, [user, initialConvoId, initialTourId, initialBookingId])

 React.useEffect(() => {
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
 // If the receipt is for our currently selected conversation, update all our sent messages to"read"
 if (selectedConversation && String(receipt.conversationId) === String(selectedConversation)) {
 setRealMsgs(prev => prev.map(m => {
 // If we were the sender and it wasn't read before, mark it as read
 if (String(m.senderId) !== String(receipt.readerId) && !m.readAtUtc) {
 return { ...m, readAtUtc: receipt.readAt }
 }
 return m
 }))
 }
 
 // Also update the conversation list to show the checkmarks status
 setRealConvs(prev => prev.map(c => {
 if (String(c.id) === String(receipt.conversationId)) {
 return { ...c, lastMessageRead: true }
 }
 return c
 }))
 }, [selectedConversation])

 const onMessageReceived = React.useCallback((receivedMsg: MessageResponse) => {
 // Update messages list
 setRealMsgs(prev => {
 const exists = prev.some(m => String(m.id) === String(receivedMsg.id))
 if (exists) return prev
 return [...prev, receivedMsg]
 })

 // Update conversations list metadata
 setRealConvs(prev => prev.map(c => 
 String(c.id) === String(receivedMsg.conversationId) 
 ? { ...c, updatedAtUtc: receivedMsg.createdAtUtc, lastMessageContent: receivedMsg.content, lastMessageRead: false } 
 : c
 ).sort((a, b) => new Date(b.updatedAtUtc).getTime() - new Date(a.updatedAtUtc).getTime()))

 // If this message belongs to the current open conversation, mark it as read immediately
 if (selectedConversation && String(receivedMsg.conversationId) === String(selectedConversation)) {
 chatApi.markAsRead(receivedMsg.conversationId).catch(console.error)
 setRealConvs(prev => prev.map(c => 
 String(c.id) === String(receivedMsg.conversationId)
 ? { ...c, unreadCount: 0, lastMessageRead: true }
 : c
 ))
 } else {
 // Increment unread count in sidebar for other conversations
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
 
 let bookingDate = ''
 let bookingTime = ''
 if (c.bookingStartTimeUtc) {
 const date = new Date(c.bookingStartTimeUtc)
 bookingDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
 bookingTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
 }

 return {
 id: c.id.toString(),
 traveler: { 
 id: c.travelerId.toString(), 
 profileId: c.travelerProfileId?.toString() || c.travelerId.toString(),
 name: c.travelerName, 
 avatar: c.travelerAvatarUrl,
 email: '', 
 isVerified: true, 
 totalTrips: c.travelerTripsCount || 0,
 loyaltyTier: (c.travelerLoyaltyTier ? c.travelerLoyaltyTier.toLowerCase() as any : 'bronze')
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
 status: (c.bookingStatus ? c.bookingStatus.toLowerCase() as BookingStatus : 'pending') 
 } : undefined
 }
 })

 const currentConversation = selectedConversation 
 ? mappedConvs.find(c => c.id === selectedConversation) || null
 : null

 const messages: Message[] = realMsgs.map(m => {
 const hasPII = EMAIL_REGEX.test(m.content) || PHONE_REGEX.test(m.content)
 const hasSuspicion = SUSPICIOUS_KEYWORDS.some(kw => m.content.toLowerCase().includes(kw.toLowerCase()))

 return {
 id: m.id.toString(),
 conversationId: m.conversationId.toString(),
 senderId: m.senderId.toString(),
 senderName: m.senderName,
 content: m.content,
 timestamp: m.createdAtUtc ? (m.createdAtUtc.endsWith('Z') ? m.createdAtUtc : m.createdAtUtc + 'Z') : new Date().toISOString(),
 status: 'read',
 isFlagged: false,
 hasBlurredContent: hasPII,
 hasSuspiciousContent: hasSuspicion,
 readAtUtc: m.readAtUtc
 }
 })

 const filteredConversations = mappedConvs.filter(conv => {
 // Only show chats with messages, or the currently selected one
 const hasMessages = conv.lastMessage && 
 conv.lastMessage.content && 
 conv.lastMessage.content !== 'Tap to view messages...'
 const isSelected = selectedConversation === conv.id
 
 if (!hasMessages && !isSelected) return false

 // Apply Filter Type
 if (filter === 'unread' && conv.unreadCount === 0) return false
 if (filter === 'suspicious' && conv.safetyLevel === 'safe') return false

 if (!searchTerm) return true
 const term = searchTerm.toLowerCase()
 return (
 conv.traveler.name.toLowerCase().includes(term) ||
 (conv.booking?.tourTitle.toLowerCase() || '').includes(term) ||
 conv.lastMessage.content.toLowerCase().includes(term)
 )
 })

 const isInitialMount = React.useRef(true)

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
 
 // Safety check: ensure selectedConversation is numeric (not 'null' or empty)
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

 const handleQuickReply = (text: string) => {
 setNewMessage(text)
 }

 const handleFlagMessage = (messageId: string) => {
 console.log('Flag message:', messageId)
 }

 return (
  <div className="flex-1 h-full surface-base overflow-hidden relative">
 <div className="h-full flex flex-col overflow-hidden">
 <div className="flex-none surface-base border-b border-theme px-4 sm:px-6 py-2.5 sm:py-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <MessageSquare className="w-5 h-5 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 <h1 className="text-lg font-bold text-theme-primary">
 Messages
 </h1>
 <span className="px-2 py-0.5 bg-primary-light/10 text-primary-light dark:text-primary-dark text-[10px] font-bold capitalize tracking-normal rounded-full border border-primary-light/20">
 {mappedConvs.reduce((acc, c) => acc + c.unreadCount, 0)}
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
 <SafetyInfoPanel />
 
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
 {isFilterMenuOpen && (
 <div className="absolute right-0 mt-2 w-48 surface-base border border-theme rounded-xl shadow-xl z-50 overflow-hidden">
 <div className="p-2 space-y-1">
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
 </button>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* More Menu */}
 <div className="relative">
 <button 
 onClick={() => setShowMoreMenu(!showMoreMenu)}
 className="p-2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 rounded-lg hover:surface-section dark:hover:surface-card transition-colors"
 >
 <MoreVertical className="w-4 h-4" />
 </button>
 {showMoreMenu && (
 <div className="absolute right-0 mt-2 w-48 surface-card border border-theme rounded-xl shadow-xl z-50 overflow-hidden">
 <div className="p-2">
 <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-theme-secondary hover:surface-section dark:hover:surface-section rounded-lg transition-colors">
 <CheckCircle className="w-3 h-3" />
 Mark all as read
 </button>
 <button 
 onClick={() => window.location.reload()}
 className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-theme-secondary hover:surface-section dark:hover:surface-section rounded-lg transition-colors"
 >
 <RefreshCw className="w-3 h-3" />
 Refresh List
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
                <div className="relative mt-2 px-4 sm:px-6 pb-2 border-b border-theme dark:border-primary-dark/10">
 <Search className="absolute left-7 sm:left-9 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-muted" />
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search conversations..."
 className="w-full pl-8 sm:pl-9 pr-4 py-2 surface-section border border-theme rounded-xl text-xs sm:text-sm text-theme-primary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light/20 transition-all"
 />
 </div>
 </div>

  <div className="flex-1 flex min-h-0 overflow-hidden surface-base">
 <div className={`w-full sm:w-80 border-r border-theme dark:border-primary-dark/10 flex flex-col min-h-0 overflow-hidden ${showSidebar ? 'block' : 'hidden'}`}>
 <div className="flex-1 overflow-y-auto chat-scrollbar">
 {isLoadingConvs ? (
 Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="p-4 border-b border-theme animate-pulse">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 surface-section rounded-full" />
 <div className="flex-1">
 <div className="h-4 surface-section rounded w-1/3 mb-2" />
 <div className="h-3 surface-section rounded w-2/3" />
 </div>
 </div>
 </div>
 ))
 ) : filteredConversations.length > 0 ? (
 filteredConversations.map((conv) => (
 <ConversationItem
 key={conv.id}
 conversation={conv}
 isActive={selectedConversation === conv.id}
 onClick={() => {
 setSelectedConversation(conv.id)
 setShowSidebar(false)
 }}
 />
 ))
 ) : (
 <div className="p-8 text-center">
 <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 " />
 <p className="text-theme-muted ">
 No conversations found
 </p>
 </div>
 )}
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
 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
 </button>
 <Link href={`/travelers/${currentConversation.traveler.profileId}`} className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
 <TravelerAvatar traveler={currentConversation.traveler} size="sm" />
 <div className="min-w-0">
 <h2 className="font-semibold text-theme-primary truncate">
 {currentConversation.traveler.name}
 </h2>
 <p className="text-xs text-theme-muted truncate">
 {currentConversation.traveler.totalTrips} trips • {currentConversation.traveler.loyaltyTier}
 </p>
 </div>
 </Link>
 </div>
 {currentConversation.safetyLevel === 'suspicious' && (
 <div className="flex-none px-2 py-1 bg-accent-light/20 dark:bg-accent-dark/20 dark:bg-amber-950/30 text-accent-light dark:text-accent-dark dark:text-amber-300 text-xs font-medium rounded-lg flex items-center gap-1">
 <Flag className="w-3 h-3" />
 Under Review
 </div>
 )}
 </div>

 <div 
 ref={scrollContainerRef}
 className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar"
 >
 {currentConversation.booking && (
 <BookingInfoCard booking={currentConversation.booking} />
 )}

 {isLoadingMsgs ? (
 <div className="space-y-4">
 {Array.from({ length: 3 }).map((_, i) => (
 <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
 <div className={`w-2/3 h-16 surface-section rounded-2xl animate-pulse`} />
 </div>
 ))}
 </div>
 ) : (
 messages.map((message, index) => (
 <div key={message.id} className="relative group">
 <MessageBubble
 message={message}
 isOwn={message.senderId === user?.userId}
 bookingConfirmed={currentConversation.bookingConfirmed}
 showAvatar={
 index === messages.length - 1 || 
 messages[index + 1]?.senderId !== message.senderId
 }
 index={index}
 messages={messages}
 travelerName={currentConversation.traveler.name}
 travelerAvatar={currentConversation.traveler.avatar}
 isExpanded={expandedMessageId === message.id}
 onToggle={() => setExpandedMessageId(expandedMessageId === message.id ? null : message.id)}
 />
 {!message.isFlagged && message.senderId !== user?.userId && (
 <button
 onClick={() => handleFlagMessage(message.id)}
 className="absolute -right-2 top-1/2 -translate-y-1/2 p-1 surface-card border border-theme rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger-red/10 dark:hover:bg-red-900/30 text-theme-muted hover:text-danger-red"
 title="Report message"
 >
 <Flag className="w-3 h-3" />
 </button>
 )}
 </div>
 ))
 )}
 <div ref={messagesEndRef} />
 </div>

 <div className="flex-none p-4 border-t border-theme dark:border-primary-dark/10">
 <form onSubmit={handleSendMessage} className="flex gap-2">
 <QuickReplyTemplates onSelect={handleQuickReply} />
 <button
 type="button"
 className="flex-none p-2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 rounded-lg hover:surface-section dark:hover:surface-card transition-colors"
 >
 <Paperclip className="w-5 h-5" />
 </button>
 <input
 type="text"
 value={newMessage}
 onChange={(e) => setNewMessage(e.target.value)}
 placeholder={isSending ?"Sending..." :"Type a message..."}
 disabled={isSending}
 className="flex-1 min-w-0 px-4 py-2 surface-section border border-theme rounded-lg text-sm text-theme-primary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20 disabled:opacity-50"
 />
 <button
 type="submit"
 disabled={!newMessage.trim() || isSending}
 className="flex-none p-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:bg-primary-light-hover dark:hover:bg-primary-light-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isSending ? (
 <div className="w-5 h-5 border-2 border-theme border-t-white rounded-full animate-spin" />
 ) : (
 <Send className="w-5 h-5" />
 )}
 </button>
 </form>
 </div>
 </>
 ) : (
 <EmptyChatState />
 )}
 </div>
 </div>
 </div>

  <NewChatModal
  isOpen={isNewChatModalOpen}
  onClose={() => setIsNewChatModalOpen(false)}
  role="GUIDE"
  existingBookingIds={realConvs.map(c => c.bookingId).filter(Boolean) as number[]}
  onConversationInitiated={(id: number) => handleConversationInitiated(id)}
  />
  </div>
  )
}

import GuideMessagesSkeleton from './skeleton'

export default function GuideMessagesPage() {
  return (
    <React.Suspense fallback={<GuideMessagesSkeleton />}>
      <GuideMessagingContent />
    </React.Suspense>
  )
}
