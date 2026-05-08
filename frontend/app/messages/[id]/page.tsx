// ============================================================================
// MESSAGE THREAD - INDIVIDUAL CONVERSATION
// ============================================================================
// LOCATION: /frontend/src/app/messages/[id]/page.tsx
// 
// PURPOSE: Display full conversation between traveler and guide
// 
// FEATURES:
// - Full message history
// - Real-time messaging (Phase 2)
// - Contact info blur until booking confirmed
// - Send/reply to messages
// - Booking context in sidebar
// - Report message option
// ============================================================================

'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
 MessageSquare,
 Send,
 Paperclip,
 MoreVertical,
 ChevronLeft,
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
 Calendar,
 MapPin,
 DollarSign,
 Star,
 Info
} from 'lucide-react'
import PageLayout from '@/src/components/layout/PageLayout'
import toast from 'react-hot-toast'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type MessageStatus = 'sent' | 'delivered' | 'read'
type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled'

interface Message {
 id: string
 senderId: string
 senderName: string
 senderAvatar?: string
 content: string
 timestamp: string
 status: MessageStatus
 isOwn: boolean
 isFlagged?: boolean
 hasBlurredContent?: boolean
}

interface Conversation {
 id: string
 otherUser: {
 id: string
 name: string
 avatar?: string
 role: 'traveler' | 'guide'
 isVerified?: boolean
 rating?: number
 totalTrips?: number
 }
 booking?: {
 id: string
 tourId: string
 tourTitle: string
 tourImage: string
 date: string
 time: string
 peopleCount: number
 totalPrice: number
 currency: string
 status: BookingStatus
 meetingPoint?: string
 isConfirmed: boolean
 }
 messages: Message[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CONVERSATION: Conversation = {
 id: 'conv-1',
 otherUser: {
 id: 'trav-123',
 name: 'Ahmed Khan',
 avatar: '/images/travelers/ahmed.jpg',
 role: 'traveler',
 isVerified: true,
 rating: 4.9,
 totalTrips: 12
 },
 booking: {
 id: 'b1',
 tourId: '1',
 tourTitle: 'Ottoman Heritage: Topkapi Palace & Hagia Sophia',
 tourImage: '/images/tours/istanbul-ottoman.jpg',
 date: '2026-04-15',
 time: '09:00',
 peopleCount: 2,
 totalPrice: 178,
 currency: 'USD',
 status: 'confirmed',
 meetingPoint: 'Sultanahmet Square Fountain',
 isConfirmed: true
 },
 messages: [
 {
 id: 'm1',
 senderId: 'trav-123',
 senderName: 'Ahmed Khan',
 senderAvatar: '/images/travelers/ahmed.jpg',
 content:"Hi! I'm interested in the Ottoman Heritage tour. Is it suitable for children? We have two kids aged 8 and 10.",
 timestamp: '2026-04-01T10:15:00Z',
 status: 'read',
 isOwn: false
 },
 {
 id: 'm2',
 senderId: 'guide-123',
 senderName: 'Mehmet Yilmaz',
 senderAvatar: '/images/guides/mehmet.jpg',
 content:"Hello Ahmed! Yes, it's very family-friendly. Kids especially love the Topkapi Palace treasury rooms with all the jewels! I've guided many families with children that age.",
 timestamp: '2026-04-01T10:25:00Z',
 status: 'read',
 isOwn: true
 },
 {
 id: 'm3',
 senderId: 'trav-123',
 senderName: 'Ahmed Khan',
 senderAvatar: '/images/travelers/ahmed.jpg',
 content:"Perfect! We'd like to book for April 15th. Also, my phone is +90 555 111 2233 in case of any changes.",
 timestamp: '2026-04-01T10:35:00Z',
 status: 'read',
 isOwn: false,
 hasBlurredContent: true
 },
 {
 id: 'm4',
 senderId: 'guide-123',
 senderName: 'Mehmet Yilmaz',
 senderAvatar: '/images/guides/mehmet.jpg',
 content:"Great! I've confirmed your booking. Looking forward to meeting you at Sultanahmet Square Fountain at 9 AM. I'll be holding an orange sign.",
 timestamp: '2026-04-01T10:45:00Z',
 status: 'read',
 isOwn: true
 },
 {
 id: 'm5',
 senderId: 'trav-123',
 senderName: 'Ahmed Khan',
 senderAvatar: '/images/travelers/ahmed.jpg',
 content:"See you then!",
 timestamp: '2026-04-01T10:50:00Z',
 status: 'read',
 isOwn: false
 }
 ]
}

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================

const MessageBubble = ({ message, showAvatar }: { message: Message; showAvatar: boolean }) => {
 const [showBlurred, setShowBlurred] = useState(false)
 const [showFlagMenu, setShowFlagMenu] = useState(false)

 const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
 hour: 'numeric',
 minute: '2-digit'
 })

 const shouldBlur = message.hasBlurredContent && !showBlurred

 const handleFlag = () => {
 toast.success('Message reported to admin')
 setShowFlagMenu(false)
 }

 return (
 <div className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : ''}`}>
 {/* Avatar */}
 {showAvatar && (
 <div className="flex-shrink-0 w-8 h-8 rounded-full surface-section overflow-hidden">
 {message.senderAvatar ? (
 <Image src={message.senderAvatar} alt={message.senderName} width={32} height={32} className="object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <User className="w-4 h-4 text-theme-muted" />
 </div>
 )}
 </div>
 )}

 {/* Message */}
 <div className={`flex-1 max-w-[70%] ${message.isOwn ? 'text-right' : ''}`}>
 {/* Sender name */}
 {!message.isOwn && showAvatar && (
 <p className="text-xs text-theme-muted mb-1">
 {message.senderName}
 </p>
 )}

 {/* Message content with blur */}
 <div className="relative group">
 {shouldBlur && (
 <div className="absolute inset-0  surface-card rounded-2xl flex items-center justify-center z-10">
 <button
 onClick={() => setShowBlurred(true)}
 className="flex items-center gap-1 px-2 py-1 surface-base text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <Eye className="w-3 h-3" />
 Reveal contact info
 </button>
 </div>
 )}

 <div className={`
 inline-block max-w-full p-3 rounded-2xl
 ${message.isOwn 
 ? 'bg-primary-light dark:bg-primary-dark text-white' 
 : 'surface-section text-theme-primary'
 }
 ${message.isFlagged ? 'border-2 border-red-500' : ''}
 `}>
 <p className="text-sm whitespace-pre-wrap break-words">
 {message.content}
 </p>
 </div>
 </div>

 {/* Timestamp and status */}
 <div className={`flex items-center gap-1 mt-1 text-xs text-theme-muted ${message.isOwn ? 'justify-end' : ''}`}>
 <span>{time}</span>
 {message.isOwn && message.status === 'read' && (
 <CheckCircle className="w-3 h-3 text-primary-light dark:text-primary-dark dark:text-primary-dark " />
 )}
 </div>

 {/* Flag button */}
 {!message.isOwn && !message.isFlagged && (
 <div className="relative inline-block">
 <button
 onClick={() => setShowFlagMenu(!showFlagMenu)}
 className="mt-1 text-xs text-theme-muted hover:text-red-600 transition-colors"
 >
 <Flag className="w-3 h-3" />
 </button>

 {showFlagMenu && (
 <div className="absolute left-0 mt-1 w-48 surface-card border border-theme rounded-lg shadow-xl z-10 p-1">
 <button
 onClick={handleFlag}
 className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
 >
 Report message
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function MessageThreadPage() {
 const params = useParams()
 const router = useRouter()
 const [conversation, setConversation] = useState<Conversation>(MOCK_CONVERSATION)
 const [newMessage, setNewMessage] = useState('')
 const [showBookingInfo, setShowBookingInfo] = useState(true)
 const messagesEndRef = useRef<HTMLDivElement>(null)

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
 }

 useEffect(() => {
 scrollToBottom()
 }, [conversation.messages])

 const handleSendMessage = (e: React.FormEvent) => {
 e.preventDefault()
 if (!newMessage.trim()) return

 const message: Message = {
 id: Date.now().toString(),
 senderId: 'guide-123',
 senderName: 'Mehmet Yilmaz',
 senderAvatar: '/images/guides/mehmet.jpg',
 content: newMessage,
 timestamp: new Date().toISOString(),
 status: 'sent',
 isOwn: true
 }

 setConversation(prev => ({
 ...prev,
 messages: [...prev.messages, message]
 }))
 setNewMessage('')
 toast.success('Message sent')
 }

 return (
 <PageLayout>
 <div className="pt-14 sm:pt-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] surface-section overflow-hidden">
 <div className="h-full flex flex-col">
 
 {/* Header */}
 <div className="surface-card border-b border-theme px-4 py-3">
 <div className="flex items-center gap-3">
 <button
 onClick={() => router.back()}
 className="p-1 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200"
 >
 <ChevronLeft className="w-5 h-5" />
 </button>

 <div className="flex-1 flex items-center gap-3">
 <div className="relative">
 <div className="w-10 h-10 rounded-full surface-section overflow-hidden">
 {conversation.otherUser.avatar ? (
 <Image src={conversation.otherUser.avatar} alt={conversation.otherUser.name} width={40} height={40} className="object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <User className="w-5 h-5 text-theme-muted" />
 </div>
 )}
 </div>
 {conversation.otherUser.isVerified && (
 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-light rounded-full border-2 border-white flex items-center justify-center">
 <Shield className="w-2 h-2 text-white" />
 </div>
 )}
 </div>

 <div>
 <h1 className="font-semibold text-theme-primary">
 {conversation.otherUser.name}
 </h1>
 <p className="text-xs text-theme-muted ">
 {conversation.otherUser.role === 'traveler' ? 'Traveler' : 'Guide'} • {conversation.otherUser.totalTrips} trips
 </p>
 </div>
 </div>

 <button
 onClick={() => setShowBookingInfo(!showBookingInfo)}
 className="p-2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 hover:surface-section dark:hover:surface-card rounded-lg lg:hidden"
 >
 <Info className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Main Content */}
 <div className="flex-1 flex overflow-hidden">
 
 {/* Messages Area */}
 <div className="flex-1 flex flex-col overflow-hidden surface-card">
 <div className="flex-1 overflow-y-auto p-4 space-y-4">
 {conversation.messages.map((message, index) => {
 const showAvatar = index === 0 || 
 conversation.messages[index - 1].senderId !== message.senderId
 return (
 <MessageBubble
 key={message.id}
 message={message}
 showAvatar={showAvatar}
 />
 )
 })}
 <div ref={messagesEndRef} />
 </div>

 {/* Message Input */}
 <form onSubmit={handleSendMessage} className="p-4 border-t border-theme">
 <div className="flex gap-2">
 <button
 type="button"
 className="p-2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 rounded-lg hover:surface-section dark:hover:surface-card"
 >
 <Paperclip className="w-5 h-5" />
 </button>
 <input
 type="text"
 value={newMessage}
 onChange={(e) => setNewMessage(e.target.value)}
 placeholder="Type a message..."
 className="flex-1 px-4 py-2 surface-section border border-theme rounded-lg text-sm text-theme-primary placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 />
 <button
 type="submit"
 disabled={!newMessage.trim()}
 className="p-2 bg-primary-light hover:bg-primary-light-hover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <Send className="w-5 h-5" />
 </button>
 </div>

 {!conversation.booking?.isConfirmed && (
 <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
 <Shield className="w-3 h-3" />
 Contact info is blurred until booking is confirmed
 </p>
 )}
 </form>
 </div>

 {/* Booking Info Sidebar */}
 {conversation.booking && (
 <div className={`
 w-80 border-l border-theme surface-section p-4 overflow-y-auto
 ${showBookingInfo ? 'block' : 'hidden lg:block'}
 `}>
 <div className="space-y-4">
 <h3 className="font-semibold text-theme-primary">
 Booking Details
 </h3>

 <div className="surface-card border border-theme rounded-xl p-4">
 <div className="relative w-full h-32 rounded-lg surface-section mb-3">
 <Image src={conversation.booking.tourImage} alt={conversation.booking.tourTitle} fill className="object-cover rounded-lg" />
 </div>

 <h4 className="font-medium text-theme-primary mb-2 line-clamp-2">
 {conversation.booking.tourTitle}
 </h4>

 <div className="space-y-2 text-sm">
 <div className="flex items-center gap-2 text-theme-secondary ">
 <Calendar className="w-4 h-4" />
 <span>{conversation.booking.date} at {conversation.booking.time}</span>
 </div>
 <div className="flex items-center gap-2 text-theme-secondary ">
 <Users className="w-4 h-4" />
 <span>{conversation.booking.peopleCount} {conversation.booking.peopleCount === 1 ? 'person' : 'people'} • ${conversation.booking.totalPrice}</span>
 </div>
 {conversation.booking.meetingPoint && (
 <div className="flex items-center gap-2 text-theme-secondary ">
 <MapPin className="w-4 h-4" />
 <span>{conversation.booking.meetingPoint}</span>
 </div>
 )}
 </div>

 <div className="mt-3 pt-3 border-t border-theme">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs text-theme-muted ">Status</span>
 <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
 conversation.booking.status === 'confirmed'
 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
 : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
 }`}>
 {conversation.booking.status}
 </span>
 </div>
 <Link
 href={`/bookings/${conversation.booking.id}`}
 className="text-sm text-primary-light dark:text-primary-dark dark:text-primary-dark hover:underline"
 >
 View booking details
 </Link>
 </div>
 </div>

 <div className="bg-primary-light/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
 <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-1">
 <Shield className="w-4 h-4" />
 Safe Chat
 </h4>
 <p className="text-xs text-blue-800 dark:text-blue-300">
 Phone numbers and emails are automatically blurred until booking is confirmed. Never share payment details.
 </p>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </PageLayout>
 )
}
