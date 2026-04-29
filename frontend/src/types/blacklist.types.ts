// ============================================================================
// BLACKLIST (REVOKED REGISTRY) - TYPE DEFINITIONS
// ============================================================================
// LOCATION: /frontend/src/types/blacklist.types.ts
// 
// PURPOSE: Type definitions for the public revoked guides registry
// 
// PRIVACY COMPLIANCE:
// - NEVER include personal identifiable information (PII)
// - Only show what's necessary for traveler protection
// - Guide names are hashed/truncated for privacy
// ============================================================================

export enum BanReason {
 FRAUD = 'fraud',
 HARASSMENT = 'harassment',
 NO_SHOW = 'no_show',
 FALSE_ADVERTISING = 'false_advertising',
 SAFETY_VIOLATION = 'safety_violation',
 PAYMENT_DISPUTE = 'payment_dispute',
 OTHER = 'other'
}

export const BanReasonLabels: Record<BanReason, string> = {
 [BanReason.FRAUD]: 'Fraudulent Activity',
 [BanReason.HARASSMENT]: 'Harassment / Misconduct',
 [BanReason.NO_SHOW]: 'Repeated No-Show',
 [BanReason.FALSE_ADVERTISING]: 'False Advertising',
 [BanReason.SAFETY_VIOLATION]: 'Safety Violation',
 [BanReason.PAYMENT_DISPUTE]: 'Payment Fraud',
 [BanReason.OTHER]: 'Policy Violation'
}

export const BanReasonColors: Record<BanReason, { light: string; dark: string }> = {
 [BanReason.FRAUD]: { light: 'text-red-700 bg-red-50', dark: 'dark:text-red-300 dark:bg-red-900/20' },
 [BanReason.HARASSMENT]: { light: 'text-orange-700 bg-orange-50', dark: 'dark:text-orange-300 dark:bg-orange-900/20' },
 [BanReason.NO_SHOW]: { light: 'text-amber-700 bg-amber-50', dark: 'dark:text-amber-300 dark:bg-amber-900/20' },
 [BanReason.FALSE_ADVERTISING]: { light: 'text-blue-700 bg-primary-light/10', dark: 'dark:text-blue-300 ' },
 [BanReason.SAFETY_VIOLATION]: { light: 'text-purple-700 bg-purple-50', dark: 'dark:text-purple-300 dark:bg-purple-900/20' },
 [BanReason.PAYMENT_DISPUTE]: { light: 'text-pink-700 bg-pink-50', dark: 'dark:text-pink-300 dark:bg-pink-900/20' },
 [BanReason.OTHER]: { light: 'text-theme-secondary surface-section', dark: '' }
}

export interface RevokedGuide {
 /** Anonymous identifier - NOT real name */
 guideId: string
 
 /** Truncated/hashed for privacy - e.g.,"GUID-3F8K" */
 displayId: string
 
 /** When the guide was banned */
 bannedAt: string // ISO date
 
 /** Reason category */
 reason: BanReason
 
 /** Optional additional context (sanitized) */
 description?: string
 
 /** Number of confirmed complaints */
 complaintCount: number
 
 /** Is the ban permanent? (always true for public registry) */
 isPermanent: true
}

export interface BlacklistStats {
 totalBanned: number
 bannedThisMonth: number
 mostCommonReason: BanReason
 avgComplaintsPerCase: number
}

// ============================================================================
// MOCK DATA - PHASE 1
// ============================================================================

export const MOCK_REVOKED_GUIDES: RevokedGuide[] = [
 {
 guideId: 'guide-789',
 displayId: 'GUID-7F8K',
 bannedAt: '2026-02-01T10:30:00Z',
 reason: BanReason.NO_SHOW,
 description: 'Failed to show for 3 confirmed bookings within 30 days',
 complaintCount: 3,
 isPermanent: true
 },
 {
 guideId: 'guide-456',
 displayId: 'GUID-4A2C',
 bannedAt: '2026-01-15T14:20:00Z',
 reason: BanReason.FRAUD,
 description: 'Charged travelers outside the platform, then canceled',
 complaintCount: 5,
 isPermanent: true
 },
 {
 guideId: 'guide-101',
 displayId: 'GUID-B9X1',
 bannedAt: '2026-01-05T09:15:00Z',
 reason: BanReason.HARASSMENT,
 description: 'Multiple reports of inappropriate conduct',
 complaintCount: 4,
 isPermanent: true
 },
 {
 guideId: 'guide-202',
 displayId: 'GUID-2D5M',
 bannedAt: '2025-12-20T11:45:00Z',
 reason: BanReason.FALSE_ADVERTISING,
 description: 'Tour description misrepresented amenities and duration',
 complaintCount: 7,
 isPermanent: true
 },
 {
 guideId: 'guide-303',
 displayId: 'GUID-8H3P',
 bannedAt: '2025-12-10T16:30:00Z',
 reason: BanReason.SAFETY_VIOLATION,
 description: 'Conducted tours without required safety equipment',
 complaintCount: 2,
 isPermanent: true
 }
]

export const MOCK_BLACKLIST_STATS: BlacklistStats = {
 totalBanned: 5,
 bannedThisMonth: 1,
 mostCommonReason: BanReason.NO_SHOW,
 avgComplaintsPerCase: 4.2
}