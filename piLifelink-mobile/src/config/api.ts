/**
 * API configuration and utilities for piLifeLink following Azure best practices
 * for mobile applications with intermittent connectivity
 */

/**
 * Custom API error class for better error handling with status codes
 * Follows Azure SDK error pattern
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * API Configuration with Azure best practices for mobile applications
 */
export const API_CONFIG = {
  // API endpoint configuration - development vs production
  // IMPORTANT: For mobile apps, never use 'localhost' as it refers to the device itself
  baseUrl: __DEV__ 
    ? 'http://192.168.0.23:3005' // Replace with your computer's actual IP address
    : 'https://pilifeline-api.azurewebsites.net',
  
  // API endpoints
  endpoints: {
    location: '/api/location',
    health: '/api/health',
    telemetry: '/api/telemetry'
  },
  
  // Request configuration - Azure recommended timeouts
  timeout: 10000, // 10 seconds
  
  // Azure-recommended retry policy for mobile apps
  retry: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 8000,
    backoffFactor: 1.5,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
  },
  
  // Network state
  isNetworkConnected: true, // Will be updated by the app based on NetInfo
  
  // Offline queue settings
  offlineQueue: {
    maxItems: 50,
    persistenceKey: 'piLifelink_offline_queue'
  }
};

/**
 * Extended fetch options with timeout support
 */
interface EnhancedRequestInit extends RequestInit {
  timeout?: number;
}

/**
 * Enhanced fetch with proper error handling and fallbacks for mobile environments
 * Implements Azure best practices for mobile connectivity
 */
export const enhancedFetch = async (
  url: string, 
  options: EnhancedRequestInit = {}
): Promise<Response> => {
  // Check network connectivity first (uses stored state from App.tsx)
  if (!API_CONFIG.isNetworkConnected) {
    console.log(`Network is disconnected. Cannot fetch ${url}`);
    throw new ApiError('No network connection available', 0);
  }
  
  // Extract timeout
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;
  
  let attempts = 0;
  let lastError: Error | null = null;
  
  while (attempts < API_CONFIG.retry.maxAttempts) {
    try {
      attempts++;
      console.log(`Attempt ${attempts} to fetch ${url}`);
      
      // Set up abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`Request timeout for ${url} after ${timeout}ms`);
        controller.abort();
      }, timeout);
      
      // Correlation ID for tracing (Azure best practice for distributed telemetry)
      const correlationId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
        'X-Client-Version': '1.0.0',
        ...(fetchOptions.headers || {})
      } as Record<string, string>;
      
      // Add retry information if this is a retry
      if (attempts > 1) {
        headers['X-Retry-Attempt'] = attempts.toString();
      }

      // Execute the fetch
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check for retryable status codes
      if (!response.ok && 
          API_CONFIG.retry.retryableStatusCodes.includes(response.status) && 
          attempts < API_CONFIG.retry.maxAttempts) {
        
        // Calculate backoff with jitter (Azure recommendation for mobile)
        const backoffTime = Math.min(
          API_CONFIG.retry.initialDelayMs * Math.pow(API_CONFIG.retry.backoffFactor, attempts - 1),
          API_CONFIG.retry.maxDelayMs
        );
        
        // Add jitter to prevent synchronized retries
        const jitteredBackoff = backoffTime * (0.8 + Math.random() * 0.4);
        
        console.log(`Retrying after ${Math.round(jitteredBackoff)}ms due to status ${response.status}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, jitteredBackoff));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Fetch error (attempt ${attempts}):`, lastError.message);
      
      // Don't retry if we've reached max attempts
      if (attempts >= API_CONFIG.retry.maxAttempts) {
        console.log(`Max retry attempts (${API_CONFIG.retry.maxAttempts}) reached`);
        break;
      }
      
      // Special handling for abort errors (timeouts)
      const isTimeout = lastError.name === 'AbortError';
      
      // Skip retrying for certain errors, or continue with backoff for others
      if (isTimeout || lastError.message.includes('Network request failed')) {
        // Calculate backoff with jitter (Azure recommendation for mobile)
        const backoffTime = Math.min(
          API_CONFIG.retry.initialDelayMs * Math.pow(API_CONFIG.retry.backoffFactor, attempts - 1),
          API_CONFIG.retry.maxDelayMs
        );
        
        // Add jitter to prevent synchronized retries
        const jitteredBackoff = backoffTime * (0.8 + Math.random() * 0.4);
        
        console.log(`Retrying after ${Math.round(jitteredBackoff)}ms due to ${isTimeout ? 'timeout' : 'network error'}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, jitteredBackoff));
      } else {
        // For other errors, don't retry
        console.log(`Not retrying due to non-retryable error: ${lastError.message}`);
        break;
      }
    }
  }
  
  // If all retries failed, throw the last error
  throw lastError || new Error('Unknown fetch error');
};

/**
 * Sends emergency location data to the backend
 * Implements Azure best practices for critical mobile communications
 */
export const sendEmergencyLocation = async (locationData: any): Promise<Response> => {
  try {
    console.log('Sending emergency location:', locationData.lat, locationData.lng);
    
    // Add request metadata for traceability and future reconciliation
    const enhancedData = {
      ...locationData,
      clientTimestamp: new Date().toISOString(),
      requestId: `emergency-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    };
    
    // Attempt to send the emergency data
    return await enhancedFetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.location}`, {
      method: 'POST',
      body: JSON.stringify(enhancedData)
    });
  } catch (error) {
    console.error('Failed to send emergency location:', error);
    
    // Rethrow with more specific error type
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('The request timed out. Server may be unreachable.', 408);
      } else if (error.message.includes('Network request failed')) {
        throw new ApiError('Network connectivity issue', 0);
      }
    }
    throw error;
  }
};

/**
 * Checks if backend is healthy and accessible
 * Implements Azure best practices for service health monitoring
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    console.log('Checking backend health');
    
    // Health checks should be fast with a shorter timeout
    const response = await enhancedFetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`, {
      method: 'GET',
      timeout: 5000 // Shorter timeout for health checks (Azure best practice)
    });
    
    const isHealthy = response.ok;
    console.log('Backend health check result:', isHealthy);
    return isHealthy;
  } catch (error) {
    console.warn('Health check failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
};

/**
 * Updates the network connectivity state
 * Used by the App component to keep API layer informed of connectivity
 */
export const updateNetworkState = (isConnected: boolean): void => {
  console.log('Network state updated:', isConnected);
  API_CONFIG.isNetworkConnected = isConnected;
};