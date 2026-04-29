// ============================================================================
// BLACKLIST API SERVICE - PHASE 2 PREPARATION
// ============================================================================
// LOCATION: /frontend/src/lib/api/blacklist.ts
// 
// PURPOSE: Fetch revoked guides data for public registry
// 
// PRIVACY: This API endpoint must NEVER return PII
// ============================================================================

import {
 RevokedGuide,
 BlacklistStats,
 MOCK_REVOKED_GUIDES,
 MOCK_BLACKLIST_STATS
} from '@/src/types/blacklist.types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export interface GetRevokedGuidesParams {
 page?: number
 limit?: number
 reason?: string
 fromDate?: string
 toDate?: string
}

export interface PaginatedResponse<T> {
 items: T[]
 total: number
 page: number
 limit: number
 totalPages: number
 hasNext: boolean
 hasPrev: boolean
}

/**
 * Get paginated list of revoked guides
 * Phase 1: Returns mock data
 * Phase 2: Replace with actual API call
 */
export async function getRevokedGuides({
 page = 1,
 limit = 10,
 reason,
 fromDate,
 toDate
}: GetRevokedGuidesParams = {}): Promise<PaginatedResponse<RevokedGuide>> {
 try {
 // Simulate network delay
 await delay(400)

 let guides = [...MOCK_REVOKED_GUIDES]

 // Filter by reason
 if (reason) {
 guides = guides.filter(g => g.reason === reason)
 }

 // Filter by date range
 if (fromDate) {
 guides = guides.filter(g => g.bannedAt >= fromDate!)
 }
 if (toDate) {
 guides = guides.filter(g => g.bannedAt <= toDate!)
 }

 // Sort by most recent first
 guides = guides.sort((a, b) => 
 new Date(b.bannedAt).getTime() - new Date(a.bannedAt).getTime()
 )

 // Paginate
 const start = (page - 1) * limit
 const end = start + limit
 const paginatedItems = guides.slice(start, end)

 return {
 items: paginatedItems,
 total: guides.length,
 page,
 limit,
 totalPages: Math.ceil(guides.length / limit),
 hasNext: end < guides.length,
 hasPrev: page > 1
 }
 } catch (error) {
 console.error('[API] Failed to fetch revoked guides:', error)
 throw error
 }
}

/**
 * Get blacklist statistics
 */
export async function getBlacklistStats(): Promise<BlacklistStats> {
 try {
 await delay(200)
 return MOCK_BLACKLIST_STATS
 } catch (error) {
 console.error('[API] Failed to fetch blacklist stats:', error)
 throw error
 }
}

/**
 * Verify if a specific guide is revoked
 * Used during booking flow
 */
export async function isGuideRevoked(guideId: string): Promise<boolean> {
 try {
 await delay(150)
 return MOCK_REVOKED_GUIDES.some((g: { guideId: string }) => g.guideId === guideId)
 } catch (error) {
 console.error('[API] Failed to verify guide status:', error)
 return false
 }
}