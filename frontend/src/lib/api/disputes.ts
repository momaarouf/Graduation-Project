import apiClient from './client'

const get = <T>(url: string) => apiClient.get<T>(url).then(res => res.data)
const post = <T>(url: string, data: any) => apiClient.post<T>(url, data).then(res => res.data)
const patch = <T>(url: string, data: any) => apiClient.patch<T>(url, data).then(res => res.data)

export interface OpenDisputeRequest {
 bookingId: number
 reason: 
 | 'POOR_SERVICE'
 | 'NO_SHOW'
 | 'PAYMENT_ISSUE'
 | 'FRAUD'
 | 'SAFETY'
 | 'QUALITY'
 | 'OTHER'
 description: string
}

export interface ResolveDisputeRequest {
 resolutionNote: string
 refundAmount?: number
}

export interface AddDisputeResponseRequest {
 response: string
}

export interface DisputeResponse {
 id: number
 bookingId: number
 openedByUserId: number
 openedByFullName: string
 openedByRole: string
 againstUserId: number
 againstFullName: string
 againstRole: string
 reason: string
 description: string
 againstUserResponse?: string
 status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED'
 resolutionNote?: string
 refundAmount?: number
 createdAtUtc: string
 updatedAtUtc: string
}

export interface PaginatedDisputes {
 content: DisputeResponse[]
 totalPages: number
 totalElements: number
 size: number
 number: number
}

// Traveler / Guide endpoints
export const openDispute = (data: OpenDisputeRequest) => post<DisputeResponse>('/api/disputes', data)

export const getMyDisputes = () => get<DisputeResponse[]>('/api/disputes')

export const getDisputeDetails = (id: number) => get<DisputeResponse>(`/api/disputes/${id}`)

export const addDisputeResponse = (id: number, data: AddDisputeResponseRequest) => patch<DisputeResponse>(`/api/disputes/${id}/response`, data)

// Admin endpoints
export const getAllDisputesAdmin = (page = 0, size = 10) => get<PaginatedDisputes>(`/api/admin/disputes?page=${page}&size=${size}`)

export const getDisputeDetailsAdmin = (id: number) => get<DisputeResponse>(`/api/admin/disputes/${id}`)

export const markUnderReviewAdmin = (id: number) => patch<DisputeResponse>(`/api/admin/disputes/${id}/review`, {})

export const resolveDisputeAdmin = (id: number, data: ResolveDisputeRequest) => patch<DisputeResponse>(`/api/admin/disputes/${id}/resolve`, data)

export const rejectDisputeAdmin = (id: number, reason: string) => patch<DisputeResponse>(`/api/admin/disputes/${id}/reject?reason=${encodeURIComponent(reason)}`, {})
