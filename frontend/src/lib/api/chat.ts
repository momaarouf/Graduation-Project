import api from './client'

export interface ConversationResponse {
  id: number
  travelerId: number
  travelerProfileId?: number
  travelerName: string
  travelerAvatarUrl?: string
  travelerLoyaltyTier?: string
  travelerTripsCount?: number
  guideId: number
  guideProfileId?: number
  guideName: string
  guideAvatarUrl?: string
  guideIsVerified?: boolean
  guideTripsCount?: number
  tourId: number
  tourTitle: string
  bookingId?: number
  bookingStatus?: string
  bookingStartTimeUtc?: string
  peopleCount?: number
  totalPrice?: number
  currency?: string
  updatedAtUtc: string
  lastMessageContent?: string
  unreadCount?: number
  lastMessageRead?: boolean
}

export interface MessageResponse {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  content: string
  createdAtUtc: string
  readAtUtc?: string
}

export interface SendMessageRequest {
  conversationId?: number
  tourId?: number
  bookingId?: number
  content: string
}

export const chatApi = {
  getConversations: async (): Promise<ConversationResponse[]> => {
    const { data } = await api.get('/api/chat/conversations')
    return data
  },

  getMessages: async (conversationId: number): Promise<MessageResponse[]> => {
    const { data } = await api.get(`/api/chat/messages/${conversationId}`)
    return data
  },

  sendMessage: async (request: SendMessageRequest): Promise<MessageResponse> => {
    const { data } = await api.post('/api/chat/send', request)
    return data
  },

  initiateConversation: async (request: { tourId?: number; bookingId?: number }): Promise<ConversationResponse> => {
    const { data } = await api.post('/api/chat/initiate', request)
    return data
  },

  markAsRead: async (conversationId: number): Promise<void> => {
    await api.post(`/api/chat/conversations/${conversationId}/read`)
  }
}
