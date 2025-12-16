/**
 * Axios Configuration with Global Interceptors
 * 
 * This file configures axios with automatic authentication header injection
 * and centralized error handling for all API requests.
 */
import axios from 'axios';

// Get backend URL from environment
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Cache for failed profile lookups (404s) to prevent repeated requests
const failedProfileCache = new Map();

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add authentication token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if this is a profile lookup request that previously failed (404)
    if (config.url.match(/\/api\/profiles\/[a-f0-9-]+$/) && config.method === 'get') {
      const userId = config.url.split('/').pop();
      if (failedProfileCache.has(userId)) {
        // Cancel the request since we know this profile doesn't exist
        const source = axios.CancelToken.source();
        config.cancelToken = source.token;
        source.cancel('Profile not found (cached 404)');
      }
    }
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${config.method.toUpperCase()} ${config.url}`, {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 30) + '...' : 'none'
      });
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle common response scenarios
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.status);
    }
    
    return response;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Cache 404s for profile lookups to prevent repeated requests
      if (status === 404 && error.config.url.match(/\/api\/profiles\/[a-f0-9-]+$/)) {
        const userId = error.config.url.split('/').pop();
        failedProfileCache.set(userId, true);
      }
      
      // Handle 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        console.error('🔒 401 Unauthorized Response:', {
          url: error.config.url,
          method: error.config.method,
          responseData: data,
          hadToken: !!error.config.headers.Authorization
        });
        console.warn('🔒 Clearing auth and redirecting to login');
        
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        console.warn('🚫 Forbidden: Access denied');
      }
      
      // Handle 404 Not Found - suppress logging for expected 404s (like missing profiles)
      if (status === 404) {
        // Don't log 404s - they're expected when profiles/data don't exist yet
      }
      
      // Handle 500 Server Error
      if (status >= 500) {
        console.error('🔥 Server Error:', status);
      }
      
      // Log error details in development (skip 404s as they're expected)
      if (process.env.NODE_ENV === 'development' && status !== 404) {
        console.error(`❌ API Error: ${error.config.method.toUpperCase()} ${error.config.url}`, {
          status,
          data,
          message: data?.detail || data?.message || 'Unknown error',
        });
      }
    } else if (error.request) {
      // Request was made but no response received (skip logging if it was a cancelled request)
      if (error.message !== 'Profile not found (cached 404)') {
        console.error('📡 Network Error: No response from server');
      }
    } else {
      // Something else happened
      if (error.message !== 'Profile not found (cached 404)') {
        console.error('⚠️ Error:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Export configured axios instance
export default axiosInstance;

// Export backend URL for direct use if needed
export { BACKEND_URL };
