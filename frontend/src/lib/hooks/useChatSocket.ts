'use client'

import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { MessageResponse } from '../api/chat'
import { getAccessToken } from '../api/client'
import { getWebSocketUrl } from '../api/websocket-url'

export const useChatSocket = (
 conversationId: number | null, 
 onMessageReceived: (message: MessageResponse) => void,
 onReadReceipt?: (receipt: { conversationId: number; readerId: number; readAt: string }) => void
) => {
 const stompClientRef = useRef<Client | null>(null)
 const [connected, setConnected] = useState(false)

 useEffect(() => {
 if (!conversationId) return

 const client = new Client({
 webSocketFactory: () => new SockJS(`${getWebSocketUrl()}/ws-chat`),
 connectHeaders: {
 Authorization: `Bearer ${getAccessToken()}`
 },
 debug: (str) => {
 console.log('STOMP: ' + str)
 },
 onConnect: () => {
 console.log('Connected to WebSocket')
 setConnected(true)
 
 client.subscribe(`/topic/chat/${conversationId}`, (message) => {
 if (message.body) {
 const data = JSON.parse(message.body)
 
 // Check if it's a read receipt or a message
 if (data.type === 'READ_RECEIPT') {
 onReadReceipt?.(data)
 } else {
 onMessageReceived(data as MessageResponse)
 }
 }
 })
 },
 onStompError: (frame) => {
 console.error('Broker reported error: ' + frame.headers['message'])
 console.error('Additional details: ' + frame.body)
 },
 onDisconnect: () => {
 console.log('Disconnected from WebSocket')
 setConnected(false)
 }
 })

 client.activate()
 stompClientRef.current = client

 return () => {
 if (stompClientRef.current) {
 stompClientRef.current.deactivate()
 }
 }
 }, [conversationId]) // Re-subscribe if conversationId changes

 return { connected }
}
