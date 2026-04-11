'use client'

import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getAccessToken } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { NotificationResponse } from '../api/notifications'

export const useNotificationSocket = (onNotificationReceived: (notification: NotificationResponse) => void) => {
  const { user } = useAuth()
  const stompClientRef = useRef<Client | null>(null)
  const [connected, setConnected] = useState(false)
  const callbackRef = useRef(onNotificationReceived)

  // Update ref whenever callback changes
  useEffect(() => {
    callbackRef.current = onNotificationReceived
  }, [onNotificationReceived])

  useEffect(() => {
    if (!user || !user.userId) return

    const client = new Client({
      // We are reusing the existing /ws-chat endpoint which configures the websocket broker
      webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws-chat`),
      connectHeaders: {
        Authorization: `Bearer ${getAccessToken()}`
      },
      debug: (str) => {
        // console.log('STOMP (Notifications): ' + str)
      },
      onConnect: () => {
        console.log('Connected to Notifications WebSocket')
        setConnected(true)
        
        client.subscribe(`/topic/notifications/${user.userId}`, (message) => {
          if (message.body) {
            const receivedNotification = JSON.parse(message.body) as NotificationResponse
            callbackRef.current(receivedNotification)
          }
        })
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message'])
        console.error('Additional details: ' + frame.body)
      },
      onDisconnect: () => {
        console.log('Disconnected from Notifications WebSocket')
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
  }, [user?.userId]) // Re-subscribe if userId changes

  return { connected }
}
