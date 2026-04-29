'use client'

import { useEffect } from 'react'
import { notificationsApi } from '../api/notifications'

/**
 * Category types for dashboard notifications.
 * These keys are used in localStorage to store"last viewed" timestamps.
 */
export type NotificationCategory = 
 | 'guide-bookings'
 | 'guide-messages'
 | 'admin-verifications'
 | 'admin-tours'
 | 'traveler-bookings'
 | 'traveler-messages'

/**
 * Hook to reset notification badges for a specific category when a page is visited.
 * Stores the current timestamp in localStorage for the layout to compare against.
 * 
 * @param category The dashboard section being visited
 */
export const useBadgeReset = (category: NotificationCategory) => {
 useEffect(() => {
 const key = `safaribub-last-viewed-${category}`
 const now = new Date().toISOString()
 
 // Update the timestamp to"now"
 localStorage.setItem(key, now)
 
 // PERSISTENT SYNC: Removed bulk category reset to support precision marking
 
 // Dispatch a custom event so other components (like Sidebars) can react immediately

 }, [category])
}

/**
 * Utility to get the last viewed timestamp for a category.
 */
export const getLastViewed = (category: NotificationCategory): string | null => {
 if (typeof window === 'undefined') return null
 return localStorage.getItem(`safaribub-last-viewed-${category}`)
}
