// src/lib/types/guide.types.ts

export interface GuideLanguageItem {
 name: string
 proficiency: string
}

export interface GuideProfileResponse {
 id: string;
 fullName: string;
 phoneE164: string;
 country: string;
 city: string;
 bio: string;
 tagline?: string;
 avatarUrl?: string;
 coverImageUrl?: string;
 tourCount: number;
 expertise?: string[];
 languages?: Array<{ name: string; proficiency: string }>;
 email: string;
 memberSince: string;
 verifiedSince?: string;
 totalTrips: number;
 totalTravelers: number;
 impactScore: number;
 socialLinksJson?: string;
 responseRate?: number;
 responseTimeText?: string;
 verificationStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
 idDocumentType?: string;
 rejectionReason?: string;
}
