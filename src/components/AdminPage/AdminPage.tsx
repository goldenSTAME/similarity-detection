import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../Utils/AuthUtils";
import ImageUploader from "./ImageUploader";
import "./AdminPage.css";

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if user is an admin
  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    setIsAdmin(true);
  }, [navigate]);

  // Add class to body when component mounts to prevent scrollbars
  useEffect(() => {
    document.body.classList.add("admin-view");

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove("admin-view");
    };
  }, []);

  // Check for dark mode
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      setIsDarkMode(prefersDark);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme to page
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  if (!isAdmin) {
    return null; // Don't render anything if not admin
  }

  return (
    <div className={`admin-page ${isDarkMode ? "dark" : "light"}`}>
      <div className="admin-header">
        <h1>Administrator Panel</h1>
        <p>Upload and manage images in the database</p>
      </div>
      <div className="admin-content">
        <ImageUploader />
      </div>
    </div>
  );
};

export default AdminPage;
