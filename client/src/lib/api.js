import { supabase } from './supabase';

const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Helper function to make authenticated API calls
 * Automatically attaches the Supabase Bearer token if available
 * Handles 401 by attempting token refresh
 */
export async function apiClient(url, options = {}) {
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Build headers with auth token if available
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  // Make the fetch call
  let response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle 401 - try to refresh token and retry
  if (response.status === 401) {
    console.log('[apiClient] 401 received, attempting token refresh...');
    const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !newSession) {
      console.error('[apiClient] Token refresh failed:', refreshError);
      // Return the original 401 response - don't redirect
      return response;
    }
    
    console.log('[apiClient] Token refreshed, retrying request...');
    // Retry with new token
    headers['Authorization'] = `Bearer ${newSession.access_token}`;
    response = await fetch(url, {
      ...options,
      headers
    });
  }
  
  return response;
}

/**
 * Simple fetch with auth header - for one-off calls
 * Handles 401 by attempting token refresh
 */
export async function fetchWithAuth(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  let response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle 401 - try to refresh token and retry
  if (response.status === 401) {
    console.log('[fetchWithAuth] 401 received, attempting token refresh...');
    const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError || !newSession) {
      console.error('[fetchWithAuth] Token refresh failed:', refreshError);
      // Return the original 401 response - don't redirect
      return response;
    }
    
    console.log('[fetchWithAuth] Token refreshed, retrying request...');
    // Retry with new token
    headers['Authorization'] = `Bearer ${newSession.access_token}`;
    response = await fetch(url, {
      ...options,
      headers
    });
  }
  
  return response;
}

/**
 * Legacy alias for backward compatibility
 */
export const apiFetch = apiClient;
