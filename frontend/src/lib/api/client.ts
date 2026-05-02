import axios from 'axios';

const getApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
  if (typeof window !== 'undefined' && url.includes('localhost') && window.location.hostname !== 'localhost') {
    url = url.replace('localhost', window.location.hostname);
  }
  return url;
};

const apiClient = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // required for refresh cookie
  paramsSerializer: {
    indexes: null // serialize arrays as ?key=val1&key=val2
  }
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

// Request interceptor: attach access token
// Request interceptor: attach access token (except for auth endpoints)
apiClient.interceptors.request.use(
 config => {
 // Skip token for login and register endpoints
 if (config.url?.includes('/api/auth/login') || config.url?.includes('/api/auth/register')) {
 return config;
 }
 const token = getAccessToken();
 // Include token if available. Even for public endpoints, we want 
 // the backend to know the user (e.g. to return activeBookingId).
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
 },
 error => Promise.reject(error)
);
// ... (previous code remains the same)

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

 // If error is not 401 or request already retried, reject
 if (error.response?.status !== 401 || originalRequest._retry) {
 return Promise.reject(error);
 }

 // If we have no token at all, it's a pure 401 (unauthorized), don't try to refresh
 if (!getAccessToken()) {
 return Promise.reject(error);
 }

 if (isRefreshing) {
 // Queue this request
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
 // Refresh failed – clear token and reject (do NOT redirect)
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

export default apiClient;