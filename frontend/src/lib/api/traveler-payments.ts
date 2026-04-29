import client from './client'

export interface TravelerPaymentMethod {
 id: number
 brand: string
 last4: string
 cardholderName: string
 expiryMonth: number
 expiryYear: number
 isDefault: boolean
 createdAtUtc: string
}

export const getTravelerPaymentMethods = async (): Promise<TravelerPaymentMethod[]> => {
 const response = await client.get('/api/traveler/payment-methods')
 return response.data
}

export const saveTravelerPaymentMethod = async (data: { 
 brand: string, 
 last4: string, 
 cardholderName: string,
 expiryMonth: number, 
 expiryYear: number, 
 isDefault?: boolean 
}): Promise<TravelerPaymentMethod> => {
 const response = await client.post('/api/traveler/payment-methods', data)
 return response.data
}

export const deleteTravelerPaymentMethod = async (id: number): Promise<void> => {
 await client.delete(`/api/traveler/payment-methods/${id}`)
}

export const payWithSavedCard = async (bookingId: number, paymentMethodId: number): Promise<any> => {
 const response = await client.post('/api/payments/pay-with-saved-card', { bookingId, paymentMethodId })
 return response.data
}

export const setDefaultPaymentMethod = async (id: number): Promise<TravelerPaymentMethod> => {
 const response = await client.patch(`/api/traveler/payment-methods/${id}/default`)
 return response.data
}
