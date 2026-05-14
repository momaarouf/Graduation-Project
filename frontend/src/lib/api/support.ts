import apiClient from './client';

export interface SupportRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SupportMessageResponse {
  id: number;
  senderName: string;
  senderEmail: string;
  adminMessage: boolean;  // renamed from isAdmin to avoid Lombok/Jackson serialization bug
  content: string;
  createdAtUtc: string;
}

export const contactSupport = async (data: SupportRequest) => {
  const response = await apiClient.post('/api/support/contact', data);
  return response.data; // { ticketId, ... }
};

export const getSupportMessages = async (ticketId: number): Promise<SupportMessageResponse[]> => {
  const response = await apiClient.get(`/api/support/tickets/${ticketId}/messages`);
  return response.data;
};

export const sendSupportMessage = async (ticketId: number, content: string, name?: string, email?: string): Promise<SupportMessageResponse> => {
  const response = await apiClient.post(`/api/support/tickets/${ticketId}/messages`, { content, name, email });
  return response.data;
};
