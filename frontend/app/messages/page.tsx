'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageLayout from '@/src/components/layout/PageLayout'
import { chatApi, ConversationResponse } from '@/src/lib/api/chat'
import { useAuth } from '@/src/lib/contexts/AuthContext'
import { MessageSquare, User, Clock, ChevronRight } from 'lucide-react'

export default function MessagesInboxPage() {
 const { user } = useAuth()
 const [conversations, setConversations] = useState<ConversationResponse[]>([])
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 if (!user) return
 
 const fetchConversations = async () => {
 try {
 const data = await chatApi.getConversations()
 setConversations(data)
 } catch (error) {
 console.error("Failed to fetch conversations", error)
 } finally {
 setLoading(false)
 }
 }

 fetchConversations()
 }, [user])

 if (!user) return null

 const userIdNum = parseInt(user.userId, 10)

 return (
 <PageLayout>
 <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 h-[calc(100vh-theme(spacing.16))]">
 <div className="flex items-center gap-3 mb-6">
 <div className="p-2 bg-blue-100 text-primary-light dark:text-primary-dark rounded-lg">
 <MessageSquare className="w-6 h-6" />
 </div>
 <h1 className="text-2xl font-bold text-theme-primary">Messages Inbox</h1>
 </div>
 
 {loading ? (
 <div className="flex justify-center p-8 surface-card rounded-xl border border-theme">
 <span className="animate-pulse text-theme-muted">Loading your conversations...</span>
 </div>
 ) : conversations.length === 0 ? (
 <div className="surface-card border border-theme rounded-xl p-12 text-center text-theme-muted">
 <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300 " />
 <p className="text-lg font-medium text-theme-primary mb-2">No active conversations</p>
 <p className="text-sm">When you chat with a guide or a traveler, the history will appear here.</p>
 </div>
 ) : (
 <div className="surface-card border border-theme rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-800 shadow-sm">
 {conversations.map((conv) => {
 const isTraveler = userIdNum === conv.travelerId
 const otherName = isTraveler ? conv.guideName : conv.travelerName
 
 return (
 <Link 
 key={conv.id} 
 href={`/messages/${conv.id}`}
 className="flex items-center justify-between p-4 hover:surface-section dark:hover:surface-card transition-colors group"
 >
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-primary-light dark:text-primary-dark dark:text-blue-200 shadow-inner">
 <User className="w-6 h-6" />
 </div>
 <div>
 <h3 className="font-semibold text-theme-primary group-hover:text-primary-light dark:text-primary-dark transition-colors">
 {otherName}
 </h3>
 <p className="text-sm text-theme-muted ">
 {conv.tourTitle}
 </p>
 </div>
 </div>
 <div className="flex flex-col items-end gap-2">
 <div className="flex items-center gap-1 text-xs text-theme-muted">
 <Clock className="w-3 h-3" />
 <span>{new Date(conv.updatedAtUtc).toLocaleDateString()}</span>
 </div>
 <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-light dark:text-primary-dark transition-colors" />
 </div>
 </Link>
 )
 })}
 </div>
 )}
 </div>
 </PageLayout>
 )
}
