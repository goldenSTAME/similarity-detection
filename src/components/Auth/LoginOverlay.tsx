// src/components/Auth/LoginOverlay.tsx
import React, { useState, useEffect } from 'react';
import './LoginOverlay.css';

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    email: string;
    role: string;
    access_token: string;
    refresh_token: string;
  }
}

interface LoginOverlayProps {
  onLogin: (userData: any) => void;
  onClose: () => void;
  isDark?: boolean;
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ onLogin, onClose, isDark }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{email?: string, password?: string}>({});
  const [fadeIn, setFadeIn] = useState<boolean>(false);

  // Fade in animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = (): boolean => {
    const errors: {email?: string, password?: string} = {};
    let isValid = true;

    // Check email
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!email.includes('@')) {
      errors.email = "Please include '@' in the email address";
      isValid = false;
    }

    // Check password
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent browser validation
    const form = e.target as HTMLFormElement;
    form.noValidate = true;

    // Our custom validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // Only store in localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem('authToken', data.data.access_token);
          localStorage.setItem('refreshToken', data.data.refresh_token);
          localStorage.setItem('user', JSON.stringify({
            id: data.data.user_id,
            email: data.data.email,
            role: data.data.role
          }));
        } else {
          // For session only, use sessionStorage
          sessionStorage.setItem('authToken', data.data.access_token);
          sessionStorage.setItem('refreshToken', data.data.refresh_token);
          sessionStorage.setItem('user', JSON.stringify({
            id: data.data.user_id,
            email: data.data.email,
            role: data.data.role
          }));
        }

        onLogin(data.data);
      } else {
        setError(data.message || 'Invalid login credentials');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 修改背景点击事件，不再关闭登录窗口
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 阻止事件冒泡，背景点击不会导致关闭
    e.stopPropagation();
  };

  return (
    <div
      className={`login-overlay ${fadeIn ? 'fade-in' : ''} ${isDark ? 'dark' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className="login-container">
        <div className="login-header">
          <h2>Login</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-container">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            {validationErrors.email && (
              <div className="input-validation-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {validationErrors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <div className="eye-icon-container">
                  <svg className={`eye-icon ${showPassword ? 'hidden' : 'visible'}`} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg className={`eye-icon ${showPassword ? 'visible' : 'hidden'}`} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </div>
              </button>
            </div>
            {validationErrors.password && (
              <div className="input-validation-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {validationErrors.password}
              </div>
            )}
          </div>

          <div className="form-group remember-me-container">
            <div className="checkbox-wrapper">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  id="remember-me"
                />
                <span className="checkbox-custom"></span>
                <span className="remember-me-text">Remember me</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span>Logging in</span>
                <div className="button-spinner"></div>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginOverlay;