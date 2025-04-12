// src/App.tsx
import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import SelectImageWindow from "./components/SelectImageWindow/SelectImageWindow";
import DetailWindow from "./components/DetailWindow/DetailWindow";
import HistoryWindow from "./components/HistoryWindow/HistoryWindow";
import LoginOverlay from "./components/Auth/LoginOverlay";
import UserProfile from "./components/Auth/UserProfile";
import { checkAuth, getUser, UserData } from "./Utils/AuthUtils";
import { HISTORY_STORAGE_KEY } from "./Utils/HistoryUtil"; // 导入历史记录存储键
import "./App.css";

// Improved loading animation component
const LoadingAnimation = ({ isDark }: { isDark: boolean }) => (
  <div className={`loading-screen ${isDark ? "dark" : "light"}`}>
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Integrated login prompt for authenticated content
const AuthRequired = ({
  isAuthenticated,
  onLoginClick,
  children
}: {
  isAuthenticated: boolean,
  onLoginClick: () => void,
  children: React.ReactNode
}) => {
  if (!isAuthenticated) {
    // Show only the auth prompt without rendering original content
    return (
      <div className="auth-required-container">
        <div className="auth-required-message">
          <h3>Authentication Required</h3>
          <p>Please log in to access this feature</p>
          <button className="login-prompt-button" onClick={onLoginClick}>
            Login
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

function App() {
  const [activeWindow, setActiveWindow] = useState<string>("Select Image");
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme !== null) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [showLoginOverlay, setShowLoginOverlay] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Create a memoized toggleTheme function to avoid re-renders
  const toggleTheme = useCallback(() => {
    console.log("toggleTheme called, current isDark:", isDark);
    setIsDark(prev => {
      const newTheme = !prev;
      console.log("Setting theme to:", newTheme ? "dark" : "light");
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  }, [isDark]); // Include isDark in dependencies

  // Verify authentication status
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);

      // 检查是否存在历史记录但没有有效的认证信息
      const historyExists = localStorage.getItem(HISTORY_STORAGE_KEY) !== null;
      const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      // 如果有历史记录但没有认证信息，说明是会话结束后的重新访问
      // 这种情况下我们应该清除历史记录
      if (historyExists && !authToken) {
        console.log("检测到历史记录但没有认证信息，清除历史记录");
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      }

      // Try to get user from localStorage or sessionStorage
      const localUser = getUser();

      if (localUser) {
        // If user info exists, use it first
        setUser(localUser);
        setIsAuthenticated(true);

        // Then verify token validity with server
        const serverUser = await checkAuth();
        if (!serverUser) {
          // If server verification fails, log out the user
          handleLogout();
        }
      } else {
        setIsAuthenticated(false);
      }

      setIsCheckingAuth(false);
    };

    verifyAuth();
  }, []);

  const handleLogin = (userData: UserData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setShowLoginOverlay(false);
  };

  const handleLogout = () => {
    // Clear localStorage/sessionStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem(HISTORY_STORAGE_KEY);

    setIsAuthenticated(false);
    setUser(null);
  };

  const handleLoginClick = () => {
    setShowLoginOverlay(true);
  };

  return (
    <Router>
      <div className={`app-container ${isDark ? "dark" : "light"}`}>
        {/* Login button (text only) or user profile in the top-right corner */}
        <div className="top-right-auth">
          {isAuthenticated && user ? (
            <UserProfile user={user} onLogout={handleLogout} />
          ) : (
            <button
              className="login-text-button"
              onClick={handleLoginClick}
              aria-label="Login"
            >
              Login
            </button>
          )}
        </div>

        {/* Login overlay */}
        {showLoginOverlay && (
          <LoginOverlay
            onLogin={handleLogin}
            onClose={() => setShowLoginOverlay(false)}
            isDark={isDark}
          />
        )}

        <Sidebar
          isDark={isDark}
          toggleTheme={toggleTheme}
          activeWindow={activeWindow}
          setActiveWindow={isAuthenticated ? setActiveWindow : () => handleLoginClick()}
          user={user}
          onLogout={handleLogout}
          allowThemeToggleOnly={!isAuthenticated}
        />

        <main className="main-content">
          {isCheckingAuth ? (
            <LoadingAnimation isDark={isDark} />
          ) : (
            <Routes>
              <Route path="/" element={
                <AuthRequired isAuthenticated={isAuthenticated} onLoginClick={handleLoginClick}>
                  <SelectImageWindow />
                </AuthRequired>
              } />
              <Route path="/select-image" element={
                <AuthRequired isAuthenticated={isAuthenticated} onLoginClick={handleLoginClick}>
                  <SelectImageWindow />
                </AuthRequired>
              } />
              <Route path="/history" element={
                <AuthRequired isAuthenticated={isAuthenticated} onLoginClick={handleLoginClick}>
                  <HistoryWindow />
                </AuthRequired>
              } />
              <Route path="/details/:imageId?" element={
                <AuthRequired isAuthenticated={isAuthenticated} onLoginClick={handleLoginClick}>
                  <DetailWindow />
                </AuthRequired>
              } />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;