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
            content: "Perfect! I'll meet you at the fountain with an orange sign. My phone is +90 555 123 4567 if you need to reach me.",
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
            content: "Can we start at 10am instead of 11am?",
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
            content: "I can offer a discount if you book directly through me. Let's discuss payment options.",
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
                `<span class="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1 rounded font-mono text-xs">${match[0]}</span>`
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
                <div className="absolute inset-0 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 rounded flex items-center justify-center z-10">
                    {hasSuspiciousContent ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                            <Lock className="w-3 h-3" />
                            Payment Info Locked
                        </span>
                    ) : (
                        <button
                            onClick={() => setShowBlurred(true)}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Eye className="w-3 h-3" />
                            Reveal contact info
                        </button>
                    )}
                </div>
            )}

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
            <div className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden`}>
                {guide.avatar ? (
                    <Image src={guide.avatar} alt={guide.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User className="w-1/2 h-1/2 text-gray-400" />
                    </div>
                )}
            </div>
            {guide.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
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
        safe: 'border-l-4 border-emerald-500',
        suspicious: 'border-l-4 border-amber-500',
        blocked: 'border-l-4 border-red-500'
    }

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 text-left border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-950/30' : ''} ${safetyColors[conversation.safetyLevel]}`}
        >
            <div className="flex items-start gap-3">
                <GuideAvatar guide={guide} size="md" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white truncate">
                                {guide.name}
                            </span>
                            {guide.badges && guide.badges.length > 0 && (
                                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {time}
                        </span>
                    </div>
                    {conversation.booking && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                            🎫 {conversation.booking.tourTitle} • {conversation.booking.date}
                        </p>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                        {lastMessage.senderId === user?.userId && (
                            <span className="text-xs text-gray-400">You: </span>
                        )}
                        <p className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                            {lastMessage.hasBlurredContent && !conversation.bookingConfirmed
                                ? 'Contact information hidden'
                                : lastMessage.content}
                        </p>
                    </div>
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
                        <div className="relative w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            {senderAvatar ? (
                                <Image src={senderAvatar} alt={senderName || ''} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-400" />
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                        {senderName}
                    </p>
                )}

                <div 
                    onClick={onToggle}
                    className={`
                        relative p-3 rounded-2xl text-sm transition-all cursor-pointer
                        ${isOwn 
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-md hover:bg-blue-700' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none hover:bg-gray-200 dark:hover:bg-gray-700'}
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
                            <div className={`flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
                                <span>{time}</span>
                                {isOwn && (
                                    message.readAtUtc ? (
                                        <CheckCheck className="w-3 h-3 text-blue-500" strokeWidth={3} />
                                    ) : (
                                        <Check className="w-3 h-3 text-gray-400" strokeWidth={3} />
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
                                    <span className="text-[9px] text-gray-400 whitespace-nowrap">
                                        {new Date(message.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • {time}
                                    </span>
                                    {isOwn && (
                                        message.readAtUtc ? (
                                            <CheckCheck className="w-2.5 h-2.5 text-blue-500" strokeWidth={3} />
                                        ) : (
                                            <Check className="w-2.5 h-2.5 text-gray-400" strokeWidth={3} />
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
        confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
        pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
        completed: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
        cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
    }

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl mb-4">
            <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{booking.tourTitle}</h4>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
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
                        <Link href={`/tours/${booking.tourId}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View tour</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function TravelerMessagingPage() {
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
                } else if (initialTourId) {
                    const newConv = await chatApi.initiateConversation({
                        tourId: parseInt(initialTourId),
                        bookingId: initialBookingId ? parseInt(initialBookingId) : undefined
                    })
                    setRealConvs(prev => prev.some(c => c.id === newConv.id) ? prev : [newConv, ...prev])
                    setSelectedConversation(newConv.id.toString())
                    setShowSidebar(false)
                }
            } catch (err) { console.error(err) }
            finally { setIsLoadingConvs(false) }
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
        if (selectedConversation) {
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
    }, [selectedConversation])

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
            booking: { id: c.bookingId?.toString() || '', tourId: c.tourId.toString(), tourTitle: c.tourTitle, date: bookingDate, time: bookingTime, peopleCount: c.peopleCount || 1, totalPrice: c.totalPrice || 0, currency: c.currency || 'USD', status: (c.bookingStatus?.toLowerCase() as BookingStatus || 'pending') }
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
        <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 overflow-hidden">
            <NewChatModal 
                isOpen={isNewChatModalOpen} 
                onClose={() => setIsNewChatModalOpen(false)} 
                role="TRAVELER"
                onConversationInitiated={handleConversationInitiated} 
            />
            <div className="h-full flex flex-col overflow-hidden">
                <div className="flex-none bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('toggle-sidebar'))
                                }}
                                className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                                Messages
                            </h1>
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                                {realConvs.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} unread
                            </span>
                            <button
                                onClick={() => setIsNewChatModalOpen(true)}
                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors ml-1"
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
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
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
                                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-30 py-1 overflow-hidden"
                                            >
                                                {(['all', 'unread', 'suspicious'] as const).map((t) => (
                                                    <button
                                                        key={t}
                                                        onClick={() => {
                                                            setFilter(t)
                                                            setIsFilterMenuOpen(false)
                                                        }}
                                                        className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${
                                                            filter === t ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'
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
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm" />
                    </div>
                </div>

                <div className="flex-1 flex min-h-0 overflow-hidden bg-white dark:bg-gray-900">
                    <div className={`w-full sm:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden ${showSidebar ? 'block' : 'hidden'}`}>
                        <div className="flex-1 overflow-y-auto chat-scrollbar">
                            {isLoadingConvs ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="p-4 border-b border-gray-100 dark:border-gray-800 animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                                        </div>
                                    </div>
                                ))
                            ) : filteredConversations.map(conv => (
                                <ConversationItem key={conv.id} conversation={conv} isActive={selectedConversation === conv.id} onClick={() => { setSelectedConversation(conv.id); setShowSidebar(false); }} />
                            ))}
                        </div>
                    </div>

                    <div className={`flex-1 flex flex-col overflow-hidden ${!showSidebar ? 'block' : 'hidden sm:block'}`}>
                        {currentConversation ? (
                            <>
                                <div className="flex-none h-16 px-4 sm:px-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-20">
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => {
                                                setSelectedConversation(null)
                                                setShowSidebar(true)
                                            }}
                                            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center group"
                                            title="Back to List"
                                        >
                                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                                        </button>
                                        <Link href={`/guides/${currentConversation.guide.profileId}`} className="flex items-center gap-3 flex-1 min-w-0">
                                            <GuideAvatar guide={currentConversation.guide} size="sm" />
                                            <div className="min-w-0">
                                                <h2 className="font-semibold truncate">{currentConversation.guide.name}</h2>
                                                <p className="text-xs text-gray-500 truncate">Guide</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar">
                                    {currentConversation.booking && <BookingInfoCard booking={currentConversation.booking} />}
                                    {isLoadingMsgs ? (
                                        <div className="space-y-4">
                                            {[1,2,3].map(i => <div key={i} className={`h-16 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse ${i % 2 === 0 ? 'ml-auto' : ''}`} />)}
                                        </div>
                                    ) : messages.map((m, i) => (
                                        <MessageBubble key={m.id} message={m} isOwn={m.senderId === user?.userId} bookingConfirmed={currentConversation.bookingConfirmed} showAvatar={i === messages.length - 1 || messages[i+1]?.senderId !== m.senderId} senderName={currentConversation.guide.name} senderAvatar={currentConversation.guide.avatar} index={i} messages={messages} isExpanded={expandedMessageId === m.id} onToggle={() => setExpandedMessageId(expandedMessageId === m.id ? null : m.id)} />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-800">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm" />
                                        <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"><Send className="w-5 h-5" /></button>
                                    </form>
                                </div>
                            </>
                        ) : <div className="h-full flex items-center justify-center text-gray-500">Pick a chat to start</div>}
                    </div>
                </div>
            </div>
        </div>
    )
}