import apiClient from './client';

export type NotificationType = 
    | 'ACCOUNT_CREATED'
    | 'EMAIL_VERIFIED'
    | 'PASSWORD_CHANGED'
    | 'VERIFICATION_SUBMITTED'
    | 'VERIFICATION_APPROVED'
    | 'VERIFICATION_REJECTED'
    | 'BOOKING_CREATED'
    | 'BOOKING_CONFIRMED'
    | 'BOOKING_CANCELLED'
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'NEW_MESSAGE'
    | 'ACCOUNT_SUSPENDED'
    | 'ACCOUNT_REACTIVATED'
    | 'PROFILE_COMPLETED'
    | 'SYSTEM_ALERT';

export interface NotificationResponse {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    referenceId?: string;
    referenceType?: string;
    createdAtUtc: string;
    isRead: boolean;
}

export const notificationsApi = {
    getNotifications: async (page: number = 0, size: number = 10) => {
        const response = await apiClient.get<{ content: NotificationResponse[], totalElements: number, totalPages: number }>(`/api/notifications?page=${page}&size=${size}`);
        return response.data;
    },
    
    getUnreadCount: async () => {
        const response = await apiClient.get<{ unreadCount: number }>('/api/notifications/unread-count');
        return response.data.unreadCount;
    },

    getUnreadCountsByCategory: async () => {
        const response = await apiClient.get<Record<string, number>>('/api/notifications/unread-categories');
        return response.data;
    },
    
    markAsRead: async (id: number) => {
        await apiClient.put(`/api/notifications/${id}/read`);
    },
    
    markAllAsRead: async () => {
        await apiClient.put('/api/notifications/read-all');
    },

    markByReference: async (type: string, referenceId: string) => {
        await apiClient.put(`/api/notifications/read-by-reference?type=${type}&referenceId=${referenceId}`);
    }
};
