// src/components/Auth/UserProfile.tsx
import React, { useState, useRef, useEffect } from 'react';
import './UserProfile.css';

interface UserData {
  id: string;
  email: string;
  role: string;
}

interface UserProfileProps {
  user: UserData;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside of the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Remove event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, avatarRef]);

  const handleLogout = async () => {
    // Clear history records from localStorage first
    localStorage.removeItem('image_search_history');

    // Call logout API
    try {
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
    } catch (error) {
      console.error('Logout request error:', error);
    }

    // Close dropdown
    setShowDropdown(false);

    // Call parent component's logout handler
    onLogout();
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="user-profile">
      <div
        className="user-avatar"
        onClick={toggleDropdown}
        ref={avatarRef}
        data-testid="user-avatar"
      >
        {user.email.charAt(0).toUpperCase()}
        <div className={`role-indicator ${user.role === 'admin' ? 'admin' : 'user'}`}>
          {user.role === 'admin' ? 'A' : 'U'}
        </div>
      </div>

      {showDropdown && (
        <div
          className="profile-dropdown"
          ref={dropdownRef}
          data-testid="profile-dropdown"
        >
          <div className="user-info">
            <div className="user-email">{user.email}</div>
            <div className="user-role">
              {user.role === 'admin' ? 'Administrator' : 'Regular User'}
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <button className="logout-button" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;