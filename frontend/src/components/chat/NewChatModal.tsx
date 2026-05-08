'use client'

import React, { useState, useEffect } from 'react'
import { 
 X, 
 Search, 
 MessageSquare, 
 User as UserIcon,
 Loader2,
 ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { chatApi } from '@/src/lib/api/chat'
import { getTravelerBookings, getGuideBookings } from '@/src/lib/api/tours'
import { BookingResponse, GuideBookingResponse } from '@/src/lib/types/tour.types'

interface PotentialContact {
 id: number // User ID
 name: string
 avatarUrl?: string
 tourTitle: string
 tourId: number
 bookingId: number
 date: string
 status: string
}

interface NewChatModalProps {
 isOpen: boolean
 onClose: () => void
 role: 'TRAVELER' | 'GUIDE'
 onConversationInitiated: (conversationId: number) => void
 existingBookingIds?: number[]
}

export default function NewChatModal({ 
 isOpen, 
 onClose, 
 role,
 onConversationInitiated,
 existingBookingIds = []
}: NewChatModalProps) {
 const [searchTerm, setSearchTerm] = useState('')
 const [isLoading, setIsLoading] = useState(true)
 const [contacts, setContacts] = useState<PotentialContact[]>([])
 const [initiatingId, setInitiatingId] = useState<number | null>(null)

 useEffect(() => {
 if (isOpen) {
 fetchPotentialContacts()
 }
 }, [isOpen])

 const fetchPotentialContacts = async () => {
 setIsLoading(true)
 try {
 if (role === 'TRAVELER') {
 const bookings = await getTravelerBookings()
 const potContacts: PotentialContact[] = bookings
 .filter(b => !existingBookingIds.includes(b.id))
 .map(b => ({
 id: b.guideId,
 name: b.guideName,
 tourTitle: b.tourTitle,
 tourId: b.tourId,
 bookingId: b.id,
 date: new Date(b.startTimeUtc).toLocaleDateString(),
 status: b.status
 }))
 setContacts(potContacts)
 } else {
 const bookings = await getGuideBookings()
 const potContacts: PotentialContact[] = bookings
 .filter(b => !existingBookingIds.includes(b.id))
 .filter(b => b.traveler !== null)
 .map(b => ({
 id: b.traveler!.id,
 name: b.traveler!.fullName,
 tourTitle: b.tourTitle,
 tourId: b.tourId,
 bookingId: b.id,
 date: new Date(b.startTimeUtc).toLocaleDateString(),
 status: b.status
 }))
 setContacts(potContacts)
 }
 } catch (error) {
 console.error('Failed to fetch potential contacts:', error)
 } finally {
 setIsLoading(false)
 }
 }

 const handleInitiate = async (contact: PotentialContact) => {
 if (!contact.tourId || isNaN(contact.tourId)) {
 toast.error('Invalid tour selection')
 return
 }

 setInitiatingId(contact.id)
 try {
 console.log('Initiating conversation from modal...', { 
 tourId: contact.tourId, 
 bookingId: contact.bookingId 
 })
 const conv = await chatApi.initiateConversation({
 tourId: contact.tourId,
 bookingId: contact.bookingId || undefined
 })
 toast.success('Conversation started!')
 onConversationInitiated(conv.id)
 onClose()
 } catch (err: any) {
 console.error('Failed to initiate conversation:', err)
 const backendData = err.response?.data
 const backendMessage = backendData?.message || backendData?.error
 const errorMsg = backendMessage || (backendData ? JSON.stringify(backendData) : err.message) || 'Could not start chat'
 toast.error(errorMsg, { duration: 5000 })
 } finally {
 setInitiatingId(null)
 }
 }

 const filteredContacts = contacts.filter(c => 
 c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 c.tourTitle.toLowerCase().includes(searchTerm.toLowerCase())
 )

 if (!isOpen) return null

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 {/* Backdrop */}
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="absolute inset-0 bg-black/60 "
 />

 {/* Modal */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative w-full max-w-lg surface-paper rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
 >
 {/* Header */}
 <div className="px-6 py-4 border-b border-theme flex items-center justify-between surface-paper sticky top-0 z-10">
 <div>
 <h2 className="text-xl font-bold text-theme-primary">New Message</h2>
 <p className="text-sm text-theme-muted ">
 Choose someone from your bookings
 </p>
 </div>
 <button 
 onClick={onClose}
 className="p-2 text-theme-muted hover:text-theme-secondary dark:hover:text-gray-200 hover:surface-section dark:hover:surface-card rounded-full transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Search */}
 <div className="px-6 py-4 surface-section border-b border-theme">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
 <input
 type="text"
 autoFocus
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search by name or tour..."
 className="w-full pl-10 pr-4 py-2 surface-paper border border-theme rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:ring-primary-dark/20"
 />
 </div>
 </div>

 {/* List */}
 <div className="flex-1 overflow-y-auto chat-scrollbar p-2">
 {isLoading ? (
 <div className="flex flex-col items-center justify-center py-12">
 <Loader2 className="w-8 h-8 text-primary-light dark:text-primary-dark animate-spin mb-3" />
 <p className="text-sm text-theme-muted ">Loading your contacts...</p>
 </div>
 ) : filteredContacts.length > 0 ? (
 <div className="space-y-1">
 {filteredContacts.map(contact => (
 <button
 key={contact.bookingId}
 onClick={() => handleInitiate(contact)}
 disabled={initiatingId !== null}
 className="w-full flex items-center gap-4 p-3 hover:bg-primary-light/10 dark:hover:surface-base rounded-xl transition-all group text-left"
 >
 <div className="relative">
 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-primary-light dark:text-primary-dark dark:text-primary-dark ">
 <UserIcon className="w-6 h-6" />
 </div>
 <div className="absolute -bottom-1 -right-1 w-5 h-5 surface-paper rounded-full flex items-center justify-center border-2 border-theme ">
 <MessageSquare className="w-3 h-3 text-primary-light dark:text-primary-dark" />
 </div>
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-0.5">
 <span className="font-bold text-theme-primary group-hover:text-primary-light dark:text-primary-dark dark:group-hover:text-primary-light dark:text-primary-dark transition-colors">
 {contact.name}
 </span>
 <span className="text-[10px] font-medium px-1.5 py-0.5 surface-section text-theme-muted rounded-md">
 {contact.status}
 </span>
 </div>
 <div className="text-xs text-theme-secondary font-medium truncate">
 {contact.tourTitle}
 </div>
 <div className="text-[10px] text-theme-muted mt-0.5">
 {contact.date}
 </div>
 </div>
 {initiatingId === contact.id ? (
 <Loader2 className="w-4 h-4 text-primary-light dark:text-primary-dark animate-spin" />
 ) : (
 <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-light dark:text-primary-dark transition-colors" />
 )}
 </button>
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
 <div className="w-16 h-16 surface-section rounded-full flex items-center justify-center mb-4">
 <UserIcon className="w-8 h-8 text-theme-muted" />
 </div>
 <h3 className="text-lg font-medium text-theme-primary mb-1">No contacts found</h3>
 <p className="text-sm text-theme-muted max-w-xs">
 {searchTerm 
 ? `We couldn't find anyone matching"${searchTerm}"`
 :"You'll see people here once you have shared bookings."}
 </p>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="p-4 surface-section border-t border-theme text-center">
 <p className="text-[10px] uppercase tracking-wider font-bold text-theme-muted ">
 Only people with shared bookings are shown
 </p>
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 )
}
