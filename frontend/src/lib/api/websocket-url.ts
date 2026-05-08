/**
 * Get the WebSocket URL for backend connections.
 *
 * Architecture:
 *  - localhost: direct ws:// to localhost:8081 (fast, no tunnel overhead)
 *  - tunnel: use NEXT_PUBLIC_BACKEND_WS_URL from environment
 *
 * Note: WebSocket connections CANNOT be proxied through Next.js,
 * so we must connect directly to the backend.
 */
export function getWebSocketUrl(): string {
  // Only runs in browser
  if (typeof window === 'undefined') {
    // Server-side shouldn't call this
    return '';
  }

  // On localhost: direct connection to backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8081';
  }

  // On tunnel: use environment variable
  const backendWsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL;
  if (backendWsUrl) {
    // If it's a ws:// URL, convert it back to http for SockJS
    return backendWsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
  }

  // Fallback: use API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (apiUrl) {
    return apiUrl;
  }

  // Last resort fallback
  return 'http://127.0.0.1:8081';
}
