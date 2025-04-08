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
  const [showLoginOverlay, setShowLoginOverlay] = useState<boolean>(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Verify authentication status
  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);

      // Try to get user from localStorage
      const localUser = getUser();

      if (localUser) {
        // If user info exists in localStorage, use it first
        setUser(localUser);
        setIsAuthenticated(true);
        setShowLoginOverlay(false);

        // Then verify token validity with server
        const serverUser = await checkAuth();
        if (!serverUser) {
          // If server verification fails, log out the user
          setIsAuthenticated(false);
          setUser(null);
          setShowLoginOverlay(true);

          // Clear localStorage
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } else {
        setIsAuthenticated(false);
        setShowLoginOverlay(true);
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
    setIsAuthenticated(false);
    setUser(null);
    setShowLoginOverlay(true);
  };

  if (isCheckingAuth) {
    // Show loading indicator
    return (
      <div className={`app-container ${isDark ? "dark" : "light"}`}>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`app-container ${isDark ? "dark" : "light"}`}>
        {showLoginOverlay && (
          <LoginOverlay
            onLogin={handleLogin}
            onClose={() => {}} // Login overlay cannot be closed
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

        <main className={`main-content ${!isAuthenticated ? 'blurred' : ''}`}>
          <Routes>
            <Route path="/" element={<SelectImageWindow />} />
            <Route path="/select-image" element={<SelectImageWindow />} />
            <Route path="/history" element={<HistoryWindow />} />
            <Route path="/details/:imageId?" element={<DetailWindow />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;