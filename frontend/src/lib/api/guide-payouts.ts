import client from './client'
import { PaymentResponse } from '../types/tour.types'

export interface GuideWalletResponse {
    availableBalance: number
    pendingBalance: number
    totalEarned: number
    currency: string
    stripeAccountId: string | null
    onboardingComplete: boolean
    payoutMethodLast4: string | null
    payoutMethodBrand: string | null
    payoutMethodType: string | null
}

export const getGuideWalletSummary = async (): Promise<GuideWalletResponse> => {
    const response = await client.get('/api/guide/earnings/summary')
    return response.data
}

export const getGuidePayoutHistory = async (): Promise<PaymentResponse[]> => {
    const response = await client.get('/api/guide/earnings/payouts')
    return response.data
}

export const mockOnboardStripe = async (data?: { brand: string; last4: string; type: string }): Promise<any> => {
    const response = await client.post('/api/guide/earnings/mock-onboard', data || {})
    return response.data
}
