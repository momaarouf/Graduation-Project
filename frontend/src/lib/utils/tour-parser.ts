/**
 * Utility to parse newline-separated strings from the backend into arrays.
 * Backend stores list-like data as text with newlines.
 */
export function parseList(text: any): any[] {
    if (!text) return []
    
    // If it's already an array, return it directly
    if (Array.isArray(text)) return text

    // If it's not a string, we can't parse or split it
    if (typeof text !== 'string') return [text]
    
    // Try JSON first
    try {
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) return parsed
        if (typeof parsed === 'string') return [parsed]
        if (typeof parsed === 'object' && parsed !== null) return [parsed]
    } catch (e) {
        // Fallback to legacy newline separation
    }

    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
}

/**
 * Utility to parse itinerary text into ItineraryStop objects.
 * Handles both JSON arrays of objects and simple newline-separated text.
 */
export function parseItinerary(text: string | null | undefined): any[] {
    const list = parseList(text)
    
    return list.map((item: any, index: number) => {
        // Support complex JSON objects from newer TourForm
        if (typeof item === 'object' && item !== null) {
            return {
                id: item.id || `stop-${index}`,
                orderIndex: item.orderIndex || index + 1,
                title: item.title || '',
                description: item.description || '',
                duration: item.duration || '',
                location: item.location || null
            }
        }

        // Support simple strings (Phase 1 legacy or manual text)
        return {
            id: `stop-${index}`,
            orderIndex: index + 1,
            title: String(item),
            description: '',
            duration: '',
        }
    })
}
