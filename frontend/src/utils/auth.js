// Authentication utility functions for JWT token management

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// Store tokens in localStorage
export const setTokens = (accessToken, refreshToken = null) => {
  localStorage.setItem(TOKEN_KEY, accessToken)
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

// Get access token
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

// Get refresh token
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

// Remove tokens (logout)
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAccessToken()
}

// Get auth headers for API requests
export const getAuthHeaders = () => {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Refresh access token
export const refreshAccessToken = async (apiUrl) => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  try {
    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    setTokens(data.access_token, data.refresh_token)
    return data.access_token
  } catch (error) {
    clearTokens()
    throw error
  }
}

// Fetch with automatic token refresh on 401
export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  }

  let response = await fetch(url, {
    ...options,
    headers
  })

  // If unauthorized, try to refresh token and retry
  if (response.status === 401) {
    try {
      const apiUrl = url.split('/api')[0] + '/api'
      await refreshAccessToken(apiUrl)

      // Retry with new token
      const newHeaders = {
        ...getAuthHeaders(),
        ...options.headers
      }
      response = await fetch(url, {
        ...options,
        headers: newHeaders
      })
    } catch (error) {
      // Refresh failed, user needs to login again
      clearTokens()
      throw new Error('Session expired. Please login again.')
    }
  }

  return response
}
