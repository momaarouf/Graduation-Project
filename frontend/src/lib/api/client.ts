import axios from 'axios';

/**
 * Returns the backend base URL.
 *
 * Strategy (same-WiFi / local network only):
 *  - SSR:       http://127.0.0.1:8081  (direct, always fast)
 *  - localhost: http://localhost:8081   (dev browser on same machine)
 *  - local IP:  http://<same-ip>:8081  (phone on same WiFi — backend on laptop)
 *
 * No tunnels, no discovery, no async wait.
 */
export const getApiUrl = (): string => {
  if (typeof window === 'undefined') {
    // SSR: Call backend directly via localhost/127.0.0.1
    return 'http://localhost:8081';
  }
  // Browser: Use relative path. 
  // Next.js config (rewrites) will proxy /api to the backend.
  // This solves same-WiFi IP issues and CORS.
  return ''; 
};

const apiClient = axios.create({
  withCredentials: true,
  paramsSerializer: { indexes: null }
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiUrl();
  if (config.url && !config.url.startsWith('/') && !config.url.startsWith('http')) {
    config.url = `/${config.url}`;
  }
  return config;
});


let isRefreshing = false;
let failedQueue: Array<{
 resolve: (value: any) => void;
 reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
 failedQueue.forEach(prom => {
 if (error) {
 prom.reject(error);
 } else {
 prom.resolve(token);
 }
 });
 failedQueue = [];
};

// Request interceptor: attach access token (except for auth endpoints)
apiClient.interceptors.request.use(
 config => {
 if (config.url?.includes('/api/auth/login') || config.url?.includes('/api/auth/register')) {
 return config;
 }
 const token = getAccessToken();
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 error => Promise.reject(error)
);

apiClient.interceptors.response.use(
 response => response,
 async error => {
 const originalRequest = error.config;

 // Special cases: never retry or refresh for login, register, or /me
 const isAuthEndpoint = originalRequest.url?.includes('/api/auth/login') || 
 originalRequest.url?.includes('/api/auth/register') ||
 originalRequest.url?.includes('/api/auth/me');

 if (isAuthEndpoint && error.response?.status === 401) {
 return Promise.reject(error);
 }

  if (!error.response) {
    // Network Error — tunnel may be down or URL changed.
    // Don't auto-reload (causes infinite loop). Let the component show an error state.
    console.warn('📡 Network Error — cannot reach backend. Check tunnel is running.');
    return Promise.reject(error);
  }

  if (error.response?.status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }

 if (!getAccessToken()) {
 return Promise.reject(error);
 }

 if (isRefreshing) {
 return new Promise((resolve, reject) => {
 failedQueue.push({ resolve, reject });
 })
 .then(token => {
 originalRequest.headers.Authorization = `Bearer ${token}`;
 return apiClient(originalRequest);
 })
 .catch(err => Promise.reject(err));
 }

 originalRequest._retry = true;
 isRefreshing = true;

 try {
 const { data } = await axios.post(
 `${getApiUrl()}/api/auth/refresh`,
 {},
 { withCredentials: true }
 );
 const newToken = data.token;
 setAccessToken(newToken);
 apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
 processQueue(null, newToken);
 return apiClient(originalRequest);
 } catch (refreshError) {
 processQueue(refreshError, null);
 clearAccessToken();
 return Promise.reject(refreshError);
 } finally {
 isRefreshing = false;
 }
 }
);

// Helper functions to manage the access token (in memory)
let accessToken: string | null =
 typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

export const getAccessToken = () => {
 if (accessToken) return accessToken;
 if (typeof window !== 'undefined') {
 accessToken = localStorage.getItem('accessToken');
 }
 return accessToken;
};

export const setAccessToken = (token: string) => {
 accessToken = token;
 if (typeof window !== 'undefined') {
 localStorage.setItem('accessToken', token);
 }
};

export const clearAccessToken = () => {
 accessToken = null;
 if (typeof window !== 'undefined') {
 localStorage.removeItem('accessToken');
 }
};

export default apiClient;apiClient;