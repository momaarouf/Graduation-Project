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
    Award,
    TrendingUp,
    HelpCircle
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type MessageStatus = 'sent' | 'delivered' | 'read' | 'flagged'
type ConversationStatus = 'active' | 'blocked' | 'archived'
type SafetyLevel = 'safe' | 'suspicious' | 'blocked'
type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'

interface Guide {
    id: string
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
            hasBlurredContent: true
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
            hasBlurredContent: false
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
            hasBlurredContent: true
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
            hasBlurredContent: false
        },
        unreadCount: 0,
        status: 'blocked',
        safetyLevel: 'blocked',
        bookingConfirmed: false,
        updatedAt: '2026-03-07T14:10:00Z'
    }
]

const MOCK_MESSAGES: Record<string, Message[]> = {
    'conv-1': [
        {
            id: 'msg-1',
            conversationId: 'conv-1',
            senderId: 'traveler-123',
            senderName: 'Ahmed Khan',
            content: "Hi Mehmet! I'm excited about the Ottoman tour. Is it suitable for children? We have two kids aged 8 and 10.",
            timestamp: '2026-03-09T10:15:00Z',
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
            timestamp: '2026-03-09T10:25:00Z',
            status: 'read',
            isFlagged: false,
            hasBlurredContent: false
        },
        {
            id: 'msg-3',
            conversationId: 'conv-1',
            senderId: 'traveler-123',
            senderName: 'Ahmed Khan',
            content: "Great! We're a family of 4. Where should we meet?",
            timestamp: '2026-03-10T14:20:00Z',
            status: 'delivered',
            isFlagged: false,
            hasBlurredContent: false
        },
        {
            id: 'msg-4',
            conversationId: 'conv-1',
            senderId: 'guide-123',
            senderName: 'Mehmet Yilmaz',
            content: "Perfect! I'll meet you at the fountain with an orange sign. My phone is +90 555 123 4567 if you need to reach me.",
            timestamp: '2026-03-10T14:30:00Z',
            status: 'delivered',
            isFlagged: true,
            flagReason: 'Phone number detected',
            hasBlurredContent: true
        }
    ],
    'conv-2': [
        {
            id: 'msg-5',
            conversationId: 'conv-2',
            senderId: 'traveler-123',
            senderName: 'Ahmed Khan',
            content: "Hi Layla! We're a group of 4 for the food tour. Any vegetarian options?",
            timestamp: '2026-03-08T16:30:00Z',
            status: 'read',
            isFlagged: false,
            hasBlurredContent: false
        },
        {
            id: 'msg-6',
            conversationId: 'conv-2',
            senderId: 'guide-456',
            senderName: 'Layla Hassan',
            content: "Absolutely! There are plenty of vegetarian options. I'll make sure to include extra stops for you.",
            timestamp: '2026-03-08T17:15:00Z',
            status: 'read',
            isFlagged: false,
            hasBlurredContent: false
        },
        {
            id: 'msg-7',
            conversationId: 'conv-2',
            senderId: 'traveler-123',
            senderName: 'Ahmed Khan',
            content: "Can we start at 10am instead of 11am?",
            timestamp: '2026-03-09T16:45:00Z',
            status: 'read',
            isFlagged: false,
            hasBlurredContent: false
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
    'book directly'
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
                        className="flex items-center gap-1 px-2 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity"
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

            {/* Verified badge */}
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
                {/* Avatar */}
                <GuideAvatar guide={guide} size="md" />

                {/* Content */}
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

                    {/* Booking reference */}
                    {conversation.booking && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                            🎫 {conversation.booking.tourTitle} • {conversation.booking.date}
                        </p>
                    )}

                    {/* Last message preview */}
                    <div className="flex items-center gap-1 text-sm">
                        {lastMessage.senderId === 'traveler-123' && (
                            <span className="text-xs text-gray-400">You: </span>
                        )}
                        <p className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                            {lastMessage.hasBlurredContent && !conversation.bookingConfirmed
                                ? 'Contact information hidden'
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
    senderName?: string
    senderAvatar?: string
}

function MessageBubble({
    message,
    isOwn,
    bookingConfirmed,
    showAvatar = true,
    senderName,
    senderAvatar
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
                    {senderAvatar ? (
                        <Image src={senderAvatar} alt={senderName || ''} fill className="object-cover" />
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
                        {senderName}
                    </p>
                )}

                {/* Message content */}
                <div className={`inline-block max-w-full p-3 rounded-2xl ${isOwn ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'}`}>
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
                                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                            >
                                <Paperclip className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">{att.name}</span>
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
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl mb-4">
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
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[booking.status]}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <Link
                            href={`/tours/${booking.tourId}`}
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
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Safety information"
            >
                <Info className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-4 z-50">
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
                            <span>Suspicious messages are flagged for admin review</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Ban className="w-3 h-3 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <span>Never share payment information outside the platform</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// QUICK REPLY TEMPLATES (Traveler version - questions for guides)
// ============================================================================

interface QuickReplyTemplatesProps {
    onSelect: (text: string) => void
}

function QuickReplyTemplates({ onSelect }: QuickReplyTemplatesProps) {
    const [isOpen, setIsOpen] = useState(false)

    const templates = [
        { text: "Thank you! I have a few questions about the tour." },
        { text: "Is this tour suitable for children?" },
        { text: "Are there vegetarian/vegan options available?" },
        { text: "Where exactly is the meeting point?" },
        { text: "What should I bring with me?" }
    ]

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Quick questions"
            >
                <HelpCircle className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-2 z-50">
                    {templates.map((template, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onSelect(template.text)
                                setIsOpen(false)
                            }}
                            className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
// MAIN CHAT INTERFACE
// ============================================================================

export default function TravelerMessagesPage() {
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
    const [showMobileList, setShowMobileList] = useState(true)
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const currentConversation = selectedConversation
        ? MOCK_CONVERSATIONS.find(c => c.id === selectedConversation)
        : null
    const messages = selectedConversation ? MOCK_MESSAGES[selectedConversation] || [] : []

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedConversation) return

        // In Phase 3: Send message via API
        console.log('Sending message:', newMessage)
        setNewMessage('')
    }

    const handleQuickReply = (text: string) => {
        setNewMessage(text)
    }

    const handleFlagMessage = (messageId: string) => {
        console.log('Flag message:', messageId)
        // In Phase 3: Report message to admin
    }

    return (
        <PageLayout>
            {/* Page offset if you want the page to be for you need to controll this sm:h-[calc(100vh-4rem-5px)] in this measures the footer appear and without scroll bar because you are subtracting from height  and there is 2 one for mobile other for desktop*/}
            <div className="pt-14 sm:pt-16 h-[calc(100vh)] sm:h-[calc(100vh)] bg-gray-50 dark:bg-gray-950 overflow-hidden">
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Messages
                                </h1>
                                <SafetyInfoPanel />
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <Filter className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mt-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    {/* Main chat area */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Conversation list */}
                        <div className={`w-full sm:w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto ${showMobileList ? 'block' : 'hidden sm:block'}`}>
                            {MOCK_CONVERSATIONS.map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    conversation={conv}
                                    isActive={selectedConversation === conv.id}
                                    onClick={() => {
                                        setSelectedConversation(conv.id)
                                        setShowMobileList(false)
                                    }}
                                />
                            ))}
                        </div>

                        {/* Chat area */}
                        <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 ${!showMobileList ? 'block' : 'hidden sm:block'}`}>
                            {currentConversation ? (
                                <>
                                    {/* Chat header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                                        <div className="flex items-center gap-3">
                                            {/* Back button - mobile only */}
                                            <button
                                                onClick={() => setShowMobileList(true)}
                                                className="sm:hidden p-1 text-gray-500 hover:text-gray-700"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>

                                            {/* Guide info */}
                                            <GuideAvatar guide={currentConversation.guide} size="sm" />
                                            <div>
                                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                                    {currentConversation.guide.name}
                                                </h2>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {currentConversation.booking?.tourTitle || 'No active booking'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Safety indicator */}
                                        {currentConversation.safetyLevel === 'suspicious' && (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-lg">
                                                <Flag className="w-3 h-3" />
                                                Under Review
                                            </div>
                                        )}
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {/* Booking info card */}
                                        {currentConversation.booking && (
                                            <BookingInfoCard booking={currentConversation.booking} />
                                        )}

                                        {messages.map((message, index) => (
                                            <div key={message.id} className="relative group">
                                                <MessageBubble
                                                    message={message}
                                                    isOwn={message.senderId === 'traveler-123'}
                                                    bookingConfirmed={currentConversation.bookingConfirmed}
                                                    showAvatar={
                                                        index === 0 ||
                                                        messages[index - 1]?.senderId !== message.senderId
                                                    }
                                                    senderName={currentConversation.guide.name}
                                                    senderAvatar={currentConversation.guide.avatar}
                                                />

                                                {/* Flag button */}
                                                {!message.isFlagged && message.senderId !== 'traveler-123' && (
                                                    <button
                                                        onClick={() => handleFlagMessage(message.id)}
                                                        className="absolute -right-2 top-1/2 -translate-y-1/2 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600"
                                                        title="Report message"
                                                    >
                                                        <Flag className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message input */}
                                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800">
                                        <div className="flex gap-2">
                                            <QuickReplyTemplates onSelect={handleQuickReply} />
                                            <button
                                                type="button"
                                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <Paperclip className="w-5 h-5" />
                                            </button>
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="p-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Safety reminder */}
                                        {!currentConversation.bookingConfirmed && (
                                            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                <Shield className="w-3 h-3" />
                                                Contact info is blurred until booking is confirmed
                                            </p>
                                        )}
                                    </form>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a conversation to start chatting
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}