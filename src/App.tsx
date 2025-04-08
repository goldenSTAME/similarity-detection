// src/App.tsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import SelectImageWindow from "./components/SelectImageWindow/SelectImageWindow";
import DetailWindow from "./components/DetailWindow/DetailWindow";
import HistoryWindow from "./components/HistoryWindow/HistoryWindow";
import LoginOverlay from "./components/Auth/LoginOverlay";
import UserProfile from "./components/Auth/UserProfile";
import { checkAuth, getUser, UserData } from "./Utils/AuthUtils";
import "./App.css";

// Improved loading animation component
const LoadingAnimation = ({ isDark }: { isDark: boolean }) => (
  <div className={`loading-screen ${isDark ? "dark" : "light"}`}>
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// Login Prompt component for unauthenticated pages
const LoginPrompt = ({ onLoginClick }: { onLoginClick: () => void }) => (
  <div className="login-prompt">
    <div className="login-prompt-content">
      <h2>Please Login First</h2>
      <p>You need to login to access this feature.</p>
      <button className="login-prompt-button" onClick={onLoginClick}>
        Login
      </button>
    </div>
  </div>
);

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

  // Verify authentication status
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);

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

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

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
    localStorage.removeItem('image_search_history');

    setIsAuthenticated(false);
    setUser(null);
  };

  const handleLoginClick = () => {
    setShowLoginOverlay(true);
  };

  // Content component that either shows actual content or login prompt
  const AuthenticatedContent = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <LoginPrompt onLoginClick={handleLoginClick} />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <div className={`app-container ${isDark ? "dark" : "light"}`}>
        {/* Login button or user profile in the top-right corner */}
        <div className="top-right-auth">
          {isAuthenticated && user ? (
            <UserProfile user={user} onLogout={handleLogout} />
          ) : (
            <button
              className="login-button-topright"
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
          setActiveWindow={setActiveWindow}
          user={user}
          onLogout={handleLogout}
        />

        <main className="main-content">
          {isCheckingAuth ? (
            <LoadingAnimation isDark={isDark} />
          ) : (
            <Routes>
              <Route path="/" element={
                <AuthenticatedContent>
                  <SelectImageWindow />
                </AuthenticatedContent>
              } />
              <Route path="/select-image" element={
                <AuthenticatedContent>
                  <SelectImageWindow />
                </AuthenticatedContent>
              } />
              <Route path="/history" element={
                <AuthenticatedContent>
                  <HistoryWindow />
                </AuthenticatedContent>
              } />
              <Route path="/details/:imageId?" element={
                <AuthenticatedContent>
                  <DetailWindow />
                </AuthenticatedContent>
              } />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;