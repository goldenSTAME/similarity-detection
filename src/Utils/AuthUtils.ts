export interface UserData {
  id: string;
  email: string;
  role: string;
}

export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

export const getAuthToken = (): string | null => {
  return getCookie('authToken');
};

export const getUser = (): UserData | null => {
  const userCookie = getCookie('user');
  if (userCookie) {
    try {
      return JSON.parse(userCookie);
    } catch (error) {
      console.error('Failed to parse user data from cookie:', error);
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
      },
      credentials: 'include'
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