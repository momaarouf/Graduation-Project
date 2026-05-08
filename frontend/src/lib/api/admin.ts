import apiClient from './client';

// ==================== ADMIN USER MANAGEMENT TYPES ====================
// Matches AdminUserResponse.java record exactly.

export interface AdminUserResponse {
 id: number;
 email: string;
 fullName: string;
 phoneE164?: string;
 role: string;
 isEmailVerified: boolean;
 profileCompleted: boolean;
 accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
 suspendedUntilUtc?: string | null;
 statusReason?: string | null;
 preferredLanguage?: string;
 timezone?: string;
 createdAtUtc: string;
 deletedAtUtc?: string | null;
}

export interface AdminUserListResponse {
 users: AdminUserResponse[];
}

// untilUtc: ISO 8601 future timestamp for timed suspension, or null/omit for indefinite
export interface AdminSuspendUserRequest {
 reason: string;
 untilUtc?: string | null;
}

export interface AdminBanUserRequest {
 reason: string;
}

// ==================== ADMIN GUIDE VERIFICATION TYPES ====================
// Backend returns the raw GuideProfile entity with nested user object.

export interface GuideProfileUser {
 id: number;
 email: string;
 fullName: string;
}

export interface GuideProfileResponse {
 id: number;
 user: GuideProfileUser;
 idDocumentType?: 'NATIONAL_ID' | 'PASSPORT';
 idFrontImage?: string;
 idBackImage?: string;
 selfieImage?: string;
 idVerificationImage?: string;
 idVerified: boolean;
 idVerifiedAtUtc?: string;
 verificationSubmittedAtUtc?: string;
 verificationRejectedReason?: string | null;
 bio?: string;
 baseCountry?: string;
 baseCity?: string;
 createdAtUtc?: string;
}

// ==================== ADMIN AUDIT TYPES ====================
// Matches AdminAuditEventResponse.java record.
// Backend returns Spring Page<AdminAuditEventResponse>.

export interface AuditEventResponse {
 id: number;
 action: string;
 targetType: string;
 targetId: number;
 summary: string;
 detailsJson?: string;
 createdAtUtc: string;
 adminUserId?: number;
 adminEmail?: string;
}

export interface SpringPage<T> {
 content: T[];
 totalElements: number;
 totalPages: number;
 number: number;
 size: number;
}

export type AuditPage = SpringPage<AuditEventResponse>;

// ==================== USER MANAGEMENT ENDPOINTS ====================

export const adminGetUsers = async (emailFilter?: string): Promise<AdminUserListResponse> => {
 const params = emailFilter ? { email: emailFilter } : {};
 const response = await apiClient.get('/api/admin/users', { params });
 return response.data;
};

export const adminGetUser = async (userId: number): Promise<AdminUserResponse> => {
 const response = await apiClient.get(`/api/admin/users/${userId}`);
 return response.data;
};

// untilUtc null/omitted = indefinite; ISO timestamp = timed (must be future)
export const adminSuspendUser = async (userId: number, data: AdminSuspendUserRequest): Promise<AdminUserResponse> => {
 const response = await apiClient.patch(`/api/admin/users/${userId}/suspend`, data);
 return response.data;
};

// Clears accountStatus → ACTIVE, clears suspendedUntilUtc and statusReason
export const adminActivateUser = async (userId: number): Promise<AdminUserResponse> => {
 const response = await apiClient.patch(`/api/admin/users/${userId}/activate`);
 return response.data;
};

export const adminBanUser = async (userId: number, data: AdminBanUserRequest): Promise<AdminUserResponse> => {
 const response = await apiClient.patch(`/api/admin/users/${userId}/ban`, data);
 return response.data;
};

// Soft-delete: sets deletedAtUtc, user cannot log in
export const adminDeactivateUser = async (userId: number): Promise<AdminUserResponse> => {
 const response = await apiClient.patch(`/api/admin/users/${userId}/deactivate`);
 return response.data;
};

// Undo soft-delete: clears deletedAtUtc
export const adminReactivateUser = async (userId: number): Promise<AdminUserResponse> => {
 const response = await apiClient.patch(`/api/admin/users/${userId}/reactivate`);
 return response.data;
};

// ==================== GUIDE VERIFICATION ENDPOINTS ====================

export const adminGetPendingVerifications = async (): Promise<GuideProfileResponse[]> => {
 const response = await apiClient.get('/api/admin/guide-verifications/pending');
 return response.data;
};

export const adminGetRejectedVerifications = async (): Promise<GuideProfileResponse[]> => {
 const response = await apiClient.get('/api/admin/guide-verifications/rejected');
 return response.data;
};

// Matches VerifiedGuideAdminResponse.java — flat shape, different from GuideProfileResponse
export interface VerifiedGuideAdminResponse {
 guideProfileId: number;
 userId: number;
 email: string;
 fullName: string;
 baseCountry?: string;
 baseCity?: string;
 verifiedAtUtc?: string;
 verificationSubmittedAtUtc?: string;
}

export const adminGetVerifiedGuides = async (): Promise<VerifiedGuideAdminResponse[]> => {
 const response = await apiClient.get('/api/admin/guide-verifications/verified');
 return response.data;
};

// Backend validates: idFront + selfie required; idBack required for NATIONAL_ID
export const adminApproveVerification = async (guideProfileId: number): Promise<void> => {
 await apiClient.patch(`/api/admin/guide-verifications/${guideProfileId}/approve`);
};

export const adminRejectVerification = async (guideProfileId: number, reason: string): Promise<void> => {
 await apiClient.patch(`/api/admin/guide-verifications/${guideProfileId}/reject`, null, {
 params: { reason },
 });
};

export const adminApproveVerificationOverride = async (guideProfileId: number, note?: string): Promise<void> => {
 const params = note ? { note } : {};
 await apiClient.patch(`/api/admin/guide-verifications/${guideProfileId}/approve-override`, null, { params });
};

// ==================== AUDIT TRAIL ENDPOINTS ====================

// GET /api/admin/audit-events — Spring Page, newest first
export const adminGetAuditEvents = async (page = 0, size = 50): Promise<AuditPage> => {
 const response = await apiClient.get('/api/admin/audit-events', { params: { page, size } });
 return response.data;
};

// GET /api/admin/audit-events/target?type=USER&id=123
export const adminGetAuditEventsByTarget = async (
 targetType: string,
 targetId: number,
 page = 0,
 size = 50
): Promise<AuditPage> => {
 const response = await apiClient.get('/api/admin/audit-events/target', {
 params: { type: targetType, id: targetId, page, size },
 });
 return response.data;
};

// ==================== PAYOUT & FINANCIAL ENDPOINTS ====================

export interface AdminPayoutResponse {
  id: number;
  payoutId: string;
  guideId: number;
  guideName: string;
  guideEmail: string;
  guideAvatar?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'frozen' | 'processing' | 'completed' | 'failed' | 'cancelled';
  method: 'whish' | 'bank' | 'paypal' | 'card' | 'stripe';
  methodDetails: string;
  tourId?: number;
  tourTitle?: string;
  bookingId?: number;
  platformFee: number;
  guideEarnings: number;
  feeTier: string;
  feeMultiplier: number;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  estimatedRelease?: string;
}

export interface AdminPayoutSummaryResponse {
  totalPending: number;
  totalFrozen: number;
  totalProcessing: number;
  totalCompleted: number;
  totalFailed: number;
  totalAmount: number;
  totalFees: number;
  averageProcessingTime: string;
}

export const adminGetPayouts = async (): Promise<AdminPayoutResponse[]> => {
  const response = await apiClient.get('/api/admin/payouts');
  return response.data;
};

export const adminGetPayoutSummary = async (): Promise<AdminPayoutSummaryResponse> => {
  const response = await apiClient.get('/api/admin/payouts/summary');
  return response.data;
};

export const adminUpdateGuideFeeMultiplier = async (
  guideProfileId: number,
  data: { multiplier: number; reason?: string }
): Promise<any> => {
  const response = await apiClient.patch(`/api/admin/guides/${guideProfileId}/fee-multiplier`, data);
  return response.data;
};