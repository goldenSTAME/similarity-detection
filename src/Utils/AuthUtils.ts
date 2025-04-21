// src/utils/AuthUtils.ts
export interface UserData {
  id: string;
  email: string;
  role: string;
}

// 添加Token过期时间和刷新Token的函数
const TOKEN_EXPIRY_BUFFER = 60 * 1000; // 1分钟缓冲区
let refreshPromise: Promise<boolean> | null = null;

export const getAuthToken = async (): Promise<string | null> => {
  // 检查token是否需要刷新
  await checkAndRefreshToken();

  // 先检查sessionStorage（非"记住我"的会话）
  const sessionToken = sessionStorage.getItem('authToken');
  
  if (sessionToken) {
    return sessionToken;
  }

  // 然后检查localStorage（"记住我"的会话）
  return localStorage.getItem('authToken');
};

export const getUser = (): UserData | null => {
  // 先从sessionStorage获取用户
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    try {
      return JSON.parse(sessionUser);
    } catch (error) {
      console.error('Failed to parse user data from sessionStorage:', error);
    }
  }

  // 然后从localStorage获取
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

// 判断token是否接近过期
const isTokenExpiring = (): boolean => {
  try {
    const token = getAuthTokenSync(); // 使用同步版本避免循环调用
    if (!token) return false;
    
    // 从JWT中提取过期时间（不验证签名，仅解析）
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    
    const expiresAt = payload.exp * 1000; // 转换为毫秒
    const now = Date.now();
    
    // 如果token将在缓冲区时间内过期，返回true
    return expiresAt - now < TOKEN_EXPIRY_BUFFER;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return false;
  }
};

// 同步版本的getAuthToken
const getAuthTokenSync = (): string | null => {
  const sessionToken = sessionStorage.getItem('authToken');
  if (sessionToken) {
    return sessionToken;
  }
  return localStorage.getItem('authToken');
};

// 检查并刷新token
const checkAndRefreshToken = async (): Promise<void> => {
  // 避免多次并发刷新请求
  if (refreshPromise) {
    await refreshPromise;
    return;
  }
  
  if (isTokenExpiring()) {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (!refreshToken) return;
    
    console.log('Token expiring soon, attempting to refresh...');
    
    refreshPromise = (async () => {
      try {
        const response = await fetch('http://localhost:5001/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log('Token refreshed successfully');
          
          // 更新存储
          if (localStorage.getItem('authToken')) {
            localStorage.setItem('authToken', data.data.access_token);
            localStorage.setItem('refreshToken', data.data.refresh_token || refreshToken);
          }
          
          if (sessionStorage.getItem('authToken')) {
            sessionStorage.setItem('authToken', data.data.access_token);
            sessionStorage.setItem('refreshToken', data.data.refresh_token || refreshToken);
          }
          
          return true;
        } else {
          console.error('Failed to refresh token:', data.message);
          // 如果刷新失败且token确实过期，可以考虑清除认证
          if (isTokenTotallyExpired()) {
            clearAuth();
          }
          return false;
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
    
    await refreshPromise;
  }
};

// 检查token是否完全过期（不仅是即将过期）
const isTokenTotallyExpired = (): boolean => {
  try {
    const token = getAuthTokenSync();
    if (!token) return true;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    
    const expiresAt = payload.exp * 1000;
    return Date.now() > expiresAt;
  } catch (error) {
    return true;
  }
};

export const checkAuth = async (): Promise<UserData | null> => {
  await checkAndRefreshToken(); // 确保在验证之前检查并刷新token
  const authToken = getAuthTokenSync();

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
    
    // 验证失败，可能是token已失效
    if (response.status === 401) {
      clearAuth();
    }
    
    return null;
  } catch (error) {
    console.error('Failed to verify authentication:', error);
    return null;
  }
};

export const clearAuth = (): void => {
  // 清除两个存储以确保完全登出
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
};