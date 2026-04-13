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
import { chatApi } from '@/src/lib/api/chat'
import { getTravelerBookings, getGuideBookings } from '@/src/lib/api/tours'
import { BookingResponse, GuideBookingResponse } from '@/src/lib/types/tour.types'

interface PotentialContact {
  id: number // User ID
  name: string
  avatarUrl?: string
  lastTour?: string
  tourId: number
  bookingId: number
}

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  role: 'TRAVELER' | 'GUIDE'
  onConversationInitiated: (conversationId: number) => void
}

export default function NewChatModal({ 
  isOpen, 
  onClose, 
  role,
  onConversationInitiated 
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
        // Unique guides from bookings
        const uniqueContacts: PotentialContact[] = []
        const guideIds = new Set()

        bookings.forEach(b => {
          if (!guideIds.has(b.guideId)) {
            guideIds.add(b.guideId)
            uniqueContacts.push({
              id: b.guideId,
              name: b.guideName,
              lastTour: b.tourTitle,
              tourId: b.tourId,
              bookingId: b.id
            })
          }
        })
        setContacts(uniqueContacts)
      } else {
        const bookings = await getGuideBookings()
        // Unique travelers from bookings
        const uniqueContacts: PotentialContact[] = []
        const travelerIds = new Set()

        bookings.forEach(b => {
          if (b.traveler && !travelerIds.has(b.traveler.id)) {
            travelerIds.add(b.traveler.id)
            uniqueContacts.push({
              id: b.traveler.id,
              name: b.traveler.fullName,
              lastTour: b.tourTitle,
              tourId: b.tourId,
              bookingId: b.id
            })
          }
        })
        setContacts(uniqueContacts)
      }
    } catch (error) {
      console.error('Failed to fetch potential contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitiate = async (contact: PotentialContact) => {
    setInitiatingId(contact.id)
    try {
      const conv = await chatApi.initiateConversation({
        tourId: contact.tourId,
        bookingId: contact.bookingId
      })
      onConversationInitiated(conv.id)
      onClose()
    } catch (error) {
      console.error('Failed to initiate conversation:', error)
    } finally {
      setInitiatingId(null)
    }
  }

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastTour?.toLowerCase().includes(searchTerm.toLowerCase())
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Message</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose someone from your bookings
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or tour..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto chat-scrollbar p-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading your contacts...</p>
              </div>
            ) : filteredContacts.length > 0 ? (
              <div className="space-y-1">
                {filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => handleInitiate(contact)}
                    disabled={initiatingId !== null}
                    className="w-full flex items-center gap-4 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all group text-left"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {contact.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Tour: {contact.lastTour}
                      </div>
                    </div>
                    {initiatingId === contact.id ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No contacts found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  {searchTerm 
                    ? `We couldn't find anyone matching "${searchTerm}"`
                    : "You'll see people here once you have shared bookings."}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
              Only people with shared bookings are shown
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
