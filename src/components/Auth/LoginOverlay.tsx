import React, { useState } from 'react';
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
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ onLogin, onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Support cross-domain cookies
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // Store user information in cookies
        document.cookie = `authToken=${data.data.access_token}; path=/; max-age=86400; secure; samesite=strict`;
        document.cookie = `refreshToken=${data.data.refresh_token}; path=/; max-age=604800; secure; samesite=strict`;
        document.cookie = `user=${JSON.stringify({
          id: data.data.user_id,
          email: data.data.email,
          role: data.data.role
        })}; path=/; max-age=86400; secure; samesite=strict`;

        onLogin(data.data);
      } else {
        setError(data.message || 'Login failed, please check your credentials');
      }
    } catch (err) {
      setError('Network error, please try again later');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <h2>Image Similarity Detection System</h2>
        <div className="login-subtitle">Please login to continue</div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginOverlay;