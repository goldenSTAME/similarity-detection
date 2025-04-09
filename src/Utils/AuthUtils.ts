// src/utils/AuthUtils.ts
export interface UserData {
  id: string;
  email: string;
  role: string;
}

export const getAuthToken = (): string | null => {
  // Try sessionStorage first (for non-remember-me sessions)
  const sessionToken = sessionStorage.getItem('authToken');
  if (sessionToken) {
    return sessionToken;
  }

  // Then try localStorage (for remember-me sessions)
  return localStorage.getItem('authToken');
};

export const getUser = (): UserData | null => {
  // Try to get user from sessionStorage first
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    try {
      return JSON.parse(sessionUser);
    } catch (error) {
      console.error('Failed to parse user data from sessionStorage:', error);
    }
  }

  // Then try localStorage
  const localUser = localStorage.getItem('user');
  if (localUser) {
    try {
      return JSON.parse(localUser);
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
    }
  }

  return null;
};

export const checkAuth = async (): Promise<UserData | null> => {
  const authToken = getAuthToken();

  if (!authToken) {
    return null;
  }

  try {
    const response = await fetch('http://localhost:5001/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to verify authentication:', error);
    return null;
  }
};

export const clearAuth = (): void => {
  // Clear both storages to ensure complete logout
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('user');
};