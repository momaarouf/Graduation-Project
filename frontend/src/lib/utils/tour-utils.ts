/**
 * Utility to get country flag emoji from code.
 */
export const getCountryFlag = (code: string | null | undefined): string => {
    if (!code) return '🌍'
    const normalized = code.toLowerCase()
    if (normalized === 'lb' || normalized === 'lebanon') return '🇱🇧'
    if (normalized === 'tr' || normalized === 'turkey') return '🇹🇷'
    return '🌍'
}

/**
 * Formats price with currency symbol.
 */
export const formatPrice = (amount: number, currency: string): string => {
    switch (currency) {
        case 'USD':
            return `$${amount}`
        case 'TRY':
            return `₺${amount}`
        case 'LBP':
            return `ل.ل ${amount.toLocaleString()}`
        default:
            return `${amount} ${currency}`
    }
}
/**
 * Checks if a URL points to a video file.
 */
export const isVideoUrl = (url: string | null | undefined): boolean => {
    if (!url) return false
    // Handle data URLs
    if (url.startsWith('data:video/')) return true
    
    // Check common video extensions or YouTube
    const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg', '.m4v']
    const lowerUrl = url.toLowerCase()
    
    return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('youtube.com') || 
           lowerUrl.includes('youtu.be')
}
