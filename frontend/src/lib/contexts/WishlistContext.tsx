'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getWishlistTourIds, addToWishlist, removeFromWishlist } from '../api/wishlist'
import toast from 'react-hot-toast'

interface WishlistContextType {
 wishlistIds: number[]
 isFavorited: (tourId: number) => boolean
 toggleFavorite: (tourId: number) => Promise<void>
 refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
 const { user } = useAuth()
 const [wishlistIds, setWishlistIds] = useState<number[]>([])

 const refreshWishlist = useCallback(async () => {
 if (!user) {
 setWishlistIds([])
 return
 }
 try {
 const ids = await getWishlistTourIds()
 setWishlistIds(ids)
 } catch (err) {
 console.error('Failed to fetch wishlist:', err)
 }
 }, [user])

 useEffect(() => {
 refreshWishlist()
 }, [refreshWishlist])

 const isFavorited = (tourId: number) => wishlistIds.includes(tourId)

 const toggleFavorite = async (tourId: number) => {
 if (!user) {
 toast.error('Please login to save favorites', { id: 'auth-required' })
 return
 }

 const currentlyFavorited = isFavorited(tourId)
 
 // Optimistic update
 if (currentlyFavorited) {
 setWishlistIds(prev => prev.filter(id => id !== tourId))
 } else {
 setWishlistIds(prev => [...prev, tourId])
 }

 try {
 if (currentlyFavorited) {
 await removeFromWishlist(tourId)
 toast.success('Removed from favorites', { id: `wishlist-${tourId}` })
 } else {
 await addToWishlist(tourId)
 toast.success('Added to favorites', { id: `wishlist-${tourId}` })
 }
 } catch (err) {
 // Rollback on error
 refreshWishlist()
 toast.error('Failed to update favorites')
 }
 }

 return (
 <WishlistContext.Provider value={{ wishlistIds, isFavorited, toggleFavorite, refreshWishlist }}>
 {children}
 </WishlistContext.Provider>
 )
}

export function useWishlist() {
 const context = useContext(WishlistContext)
 if (context === undefined) {
 throw new Error('useWishlist must be used within a WishlistProvider')
 }
 return context
}
