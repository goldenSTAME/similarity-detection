// src/components/SettingsWindow/SettingsWindow.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { getUser, getAuthToken } from '../../Utils/AuthUtils';
import 'react-toastify/dist/ReactToastify.css';
import './SettingsWindow.css';

// User preferences interface
interface UserPreferences {
    notificationsEnabled: boolean;
    searchHistoryEnabled: boolean;
    defaultResultCount: number;
    autoSplitEnabled: boolean;
    highContrastMode: boolean;
    language: string;
}

// Privacy settings interface
interface PrivacySettings {
    shareSearchData: boolean;
    allowAnalytics: boolean;
    showProfileToOthers: boolean;
    saveSearchHistory: boolean;
}

const SettingsWindow: React.FC = () => {
    // User data
    const [email, setEmail] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [userId, setUserId] = useState<string>('');

    // Active setting section
    const [activeSection, setActiveSection] = useState<string>('general');

    // User preferences
    const [preferences, setPreferences] = useState<UserPreferences>({
        notificationsEnabled: true,
        searchHistoryEnabled: true,
        defaultResultCount: 5,
        autoSplitEnabled: false,
        highContrastMode: false,
        language: 'en'
    });

    // Privacy settings
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        shareSearchData: false,
        allowAnalytics: true,
        showProfileToOthers: false,
        saveSearchHistory: true
    });

    // Loading states
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Available languages
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'Français' },
        { code: 'es', name: 'Español' },
        { code: 'de', name: 'Deutsch' },
        { code: 'zh', name: 'Chinese (中文)' },
        { code: 'ja', name: 'Japanese (日本語)' }
    ];

    // Cleanup local data option
    const [showCleanupConfirm, setShowCleanupConfirm] = useState<boolean>(false);

    // Account deletion confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [deleteEmail, setDeleteEmail] = useState<string>('');

    // Load user data and settings
    useEffect(() => {
        const loadUserData = async () => {
            setIsLoading(true);
            try {
                // Get user info from auth utils
                const user = getUser();
                if (user) {
                    setEmail(user.email);
                    setRole(user.role);
                    setUserId(user.id);
                }

                // In a real implementation, we would fetch user preferences from the backend
                // For now, we'll use mock data with a delay to simulate API call
                await new Promise(resolve => setTimeout(resolve, 800));

                // Load preferences from localStorage if available
                const savedPreferences = localStorage.getItem('userPreferences');
                if (savedPreferences) {
                    setPreferences(JSON.parse(savedPreferences));
                }

                const savedPrivacySettings = localStorage.getItem('privacySettings');
                if (savedPrivacySettings) {
                    setPrivacySettings(JSON.parse(savedPrivacySettings));
                }

            } catch (error) {
                console.error('Error loading user settings:', error);
                toast.error('Failed to load settings. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    // Handle preference changes
    const handlePreferenceChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        // Handle checkbox vs other inputs
        const newValue = type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : type === 'number'
                ? Number(value)
                : value;

        setPreferences({
            ...preferences,
            [name]: newValue
        });
    };

    // Handle privacy setting changes
    const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;

        setPrivacySettings({
            ...privacySettings,
            [name]: checked
        });
    };

    // Save all settings
    const saveSettings = async () => {
        setIsSaving(true);
        try {
            // In a real implementation, we'd send these settings to the backend
            // For now, we'll simulate a delay and save to localStorage
            await new Promise(resolve => setTimeout(resolve, 1000));

            localStorage.setItem('userPreferences', JSON.stringify(preferences));
            localStorage.setItem('privacySettings', JSON.stringify(privacySettings));

            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Clear all local data
    const clearLocalData = async () => {
        try {
            // Clear all localStorage items except auth tokens
            const authToken = localStorage.getItem('authToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const user = localStorage.getItem('user');

            localStorage.clear();

            // Restore auth data
            if (authToken) localStorage.setItem('authToken', authToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            if (user) localStorage.setItem('user', user);

            // Reset preferences to defaults but don't save them
            setPreferences({
                notificationsEnabled: true,
                searchHistoryEnabled: true,
                defaultResultCount: 5,
                autoSplitEnabled: false,
                highContrastMode: false,
                language: 'en'
            });

            setPrivacySettings({
                shareSearchData: false,
                allowAnalytics: true,
                showProfileToOthers: false,
                saveSearchHistory: true
            });

            toast.success('All local data has been cleared successfully!');
            setShowCleanupConfirm(false);
        } catch (error) {
            console.error('Error clearing local data:', error);
            toast.error('Failed to clear local data. Please try again.');
        }
    };

    // Handle account deletion
    const deleteAccount = async () => {
        if (deleteEmail !== email) {
            toast.error('Email does not match. Please try again.');
            return;
        }

        try {
            // In a real implementation, we'd call an API to delete the account
            // For now, we'll simulate a response
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.info('Account deletion request submitted. You will be logged out.');

            // Clear all localStorage items
            localStorage.clear();
            sessionStorage.clear();

            // In a real app, we would redirect to logout page
            // For now, just reload the page
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);

        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Failed to delete account. Please try again.');
        }
    };

    // Render loading spinner when data is loading
    if (isLoading) {
        return (
            <div className="settings-window">
                <div className="settings-loading">
                    <div className="settings-spinner"></div>
                    <p>Loading your settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-window">
            <h1>Account Settings</h1>

            <div className="settings-layout">
                {/* Settings navigation sidebar */}
                <div className="settings-sidebar">
                    <button
                        className={`settings-nav-button ${activeSection === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveSection('general')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        General
                    </button>

                    <button
                        className={`settings-nav-button ${activeSection === 'account' ? 'active' : ''}`}
                        onClick={() => setActiveSection('account')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Account
                    </button>

                    <button
                        className={`settings-nav-button ${activeSection === 'privacy' ? 'active' : ''}`}
                        onClick={() => setActiveSection('privacy')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Privacy
                    </button>

                    <button
                        className={`settings-nav-button ${activeSection === 'appearance' ? 'active' : ''}`}
                        onClick={() => setActiveSection('appearance')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                        Appearance
                    </button>

                    <button
                        className={`settings-nav-button ${activeSection === 'advanced' ? 'active' : ''}`}
                        onClick={() => setActiveSection('advanced')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="21" x2="4" y2="14"></line>
                            <line x1="4" y1="10" x2="4" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12" y2="3"></line>
                            <line x1="20" y1="21" x2="20" y2="16"></line>
                            <line x1="20" y1="12" x2="20" y2="3"></line>
                            <line x1="1" y1="14" x2="7" y2="14"></line>
                            <line x1="9" y1="8" x2="15" y2="8"></line>
                            <line x1="17" y1="16" x2="23" y2="16"></line>
                        </svg>
                        Advanced
                    </button>
                </div>

                {/* Settings content area */}
                <div className="settings-content">
                    <AnimatePresence mode="wait">
                        {/* General Settings */}
                        {activeSection === 'general' && (
                            <motion.div
                                key="general"
                                className="settings-section"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2>General Settings</h2>

                                <div className="settings-group">
                                    <div className="settings-row">
                                        <label htmlFor="language">Language</label>
                                        <select
                                            id="language"
                                            name="language"
                                            value={preferences.language}
                                            onChange={handlePreferenceChange}
                                        >
                                            {languages.map(lang => (
                                                <option key={lang.code} value={lang.code}>
                                                    {lang.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="settings-row">
                                        <label htmlFor="defaultResultCount">Default Results Count</label>
                                        <select
                                            id="defaultResultCount"
                                            name="defaultResultCount"
                                            value={preferences.defaultResultCount}
                                            onChange={handlePreferenceChange}
                                        >
                                            <option value={5}>5 Results</option>
                                            <option value={10}>10 Results</option>
                                            <option value={20}>20 Results</option>
                                            <option value={50}>50 Results</option>
                                        </select>
                                    </div>

                                    <div className="settings-row checkbox-row">
                                        <label htmlFor="notificationsEnabled">
                                            Enable Notifications
                                        </label>
                                        <input
                                            type="checkbox"
                                            id="notificationsEnabled"
                                            name="notificationsEnabled"
                                            checked={preferences.notificationsEnabled}
                                            onChange={handlePreferenceChange}
                                        />
                                    </div>

                                    <div className="settings-row checkbox-row">
                                        <label htmlFor="searchHistoryEnabled">
                                            Enable Search History
                                        </label>
                                        <input
                                            type="checkbox"
                                            id="searchHistoryEnabled"
                                            name="searchHistoryEnabled"
                                            checked={preferences.searchHistoryEnabled}
                                            onChange={handlePreferenceChange}
                                        />
                                    </div>

                                    <div className="settings-row checkbox-row">
                                        <label htmlFor="autoSplitEnabled">
                                            Auto-Split Images When Searching
                                        </label>
                                        <input
                                            type="checkbox"
                                            id="autoSplitEnabled"
                                            name="autoSplitEnabled"
                                            checked={preferences.autoSplitEnabled}
                                            onChange={handlePreferenceChange}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Account Settings */}
                        {activeSection === 'account' && (
                            <motion.div
                                key="account"
                                className="settings-section"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2>Account Information</h2>

                                <div className="settings-group">
                                    <div className="settings-row info-row">
                                        <span className="label">Email Address</span>
                                        <span className="value">{email}</span>
                                    </div>

                                    <div className="settings-row info-row">
                                        <span className="label">Account Type</span>
                                        <span className="value account-type">
                      {role === 'admin' ? 'Administrator' : 'Standard User'}
                    </span>
                                    </div>

                                    <div className="settings-row info-row">
                                        <span className="label">Account Created</span>
                                        <span className="value">January 15, 2024</span>
                                    </div>
                                </div>

                                <div className="account-actions">
                                    <h3>Account Actions</h3>

                                    <button className="account-action-button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                        Change Password
                                    </button>

                                    <button className="account-action-button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                        </svg>
                                        Edit Profile
                                    </button>

                                    <button
                                        className="account-action-button danger"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                        Delete Account
                                    </button>
                                </div>

                                {/* Account deletion confirmation dialog */}
                                {showDeleteConfirm && (
                                    <div className="settings-modal-overlay">
                                        <motion.div
                                            className="settings-modal"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                        >
                                            <h3>Delete Account</h3>
                                            <p>This action is permanent and cannot be undone. All your data will be permanently deleted.</p>
                                            <p>To confirm, please enter your email address: <strong>{email}</strong></p>

                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                value={deleteEmail}
                                                onChange={(e) => setDeleteEmail(e.target.value)}
                                            />

                                            <div className="modal-actions">
                                                <button
                                                    className="cancel-button"
                                                    onClick={() => {
                                                        setShowDeleteConfirm(false);
                                                        setDeleteEmail('');
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={deleteAccount}
                                                    disabled={deleteEmail !== email}
                                                >
                                                    Delete Permanently
                                                </button>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Privacy Settings */}
                        {activeSection === 'privacy' && (
                            <motion.div
                                key="privacy"
                                className="settings-section"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2>Privacy Settings</h2>

                                <div className="settings-group">
                                    <div className="settings-row checkbox-row">
                                        <label htmlFor="saveSearchHistory">
                                            Save Search History
                                            <span className="setting-description">Save your search history for easier access to previous searches</span>
                                        </label>
                                        <input
                                            type="checkbox"
                                            id="saveSearchHistory"
                                            name="saveSearchHistory"
                                            checked={privacySettings.saveSearchHistory}
                                            onChange={handlePrivacyChange}
                                        />
                                    </div>

                                    <div className="settings-row checkbox-row">
                                        <label htmlFor="shareSearchData">
                                            Share Search Data for Improvement
                                            <span className="setting-description">Share anonymized search data to help improve our algorithms</span>
                                        </label>
                                        <input
                                            type="checkbox"
                                            id="shareSearchData"
                                            name="shareSearchData"
                                            checked={privacySettings.shareSearchData}
                                            onChange={handlePrivacyChange}
                                        />
                                    </div>

                                    <div className="settings-row checkbox-row">
                                        <label htmlFor="allowAnalytics">
                                            Allow Analytics
                                            <span className="setting-description">Allow us to collect usage data to improve user experience</span>
                                        </label>
                                        <input
                                            type="checkbox"
                                            id="allowAnalytics"
                                            name="allowAnalytics"
                                            checked={privacySettings.allowAnalytics}
                                            onChange={handlePrivacyChange}
                                        />
                                    </div>

                                    <div className="settings-row checkbox-row">
                                        <label htmlFor="showProfileToOthers">
                                            Show Profile to Others
                                            <span className="setting-description">Allow other users to see your profile and search history</span>
                                        </label>
                                        <input
                                            type="checkbox"
                                            id="showProfileToOthers"
                                            name="showProfileToOthers"
                                            checked={privacySettings.showProfileToOthers}
                                            onChange={handlePrivacyChange}
                                        />
                                    </div>
                                </div>

                                <div className="privacy-links">
                                    <a href="#" className="privacy-link">Privacy Policy</a>
                                    <a href="#" className="privacy-link">Terms of Service</a>
                                    <a href="#" className="privacy-link">Data Management</a>
                                </div>
                            </motion.div>
                        )}

                        {/* Appearance Settings */}
                        {activeSection === 'appearance' && (
                            <motion.div
                                key="appearance"
                                className="settings-section"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2>Appearance Settings</h2>

                                <div className="settings-group">
                                    <div className="settings-row checkbox-row">
                                        <label htmlFor="highContrastMode">
                                            High Contrast Mode
                                            <span className="setting-description">Improve visibility with higher contrast colors</span>
                                        </label>
                                        <input
                                            type="checkbox"
                                            id="highContrastMode"
                                            name="highContrastMode"
                                            checked={preferences.highContrastMode}
                                            onChange={handlePreferenceChange}
                                        />
                                    </div>

                                    <div className="theme-selector">
                                        <h3>Theme</h3>
                                        <div className="theme-options">
                                            <div className="theme-option light">
                                                <div className="theme-preview"></div>
                                                <span>Light</span>
                                            </div>
                                            <div className="theme-option dark active">
                                                <div className="theme-preview"></div>
                                                <span>Dark</span>
                                            </div>
                                            <div className="theme-option system">
                                                <div className="theme-preview"></div>
                                                <span>System</span>
                                            </div>
                                        </div>
                                        <p className="theme-note">
                                            Note: Theme can also be toggled from the sidebar.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Advanced Settings */}
                        {activeSection === 'advanced' && (
                            <motion.div
                                key="advanced"
                                className="settings-section"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2>Advanced Settings</h2>

                                <div className="settings-group">
                                    <div className="data-management">
                                        <h3>Data Management</h3>

                                        <button
                                            className="data-action-button danger"
                                            onClick={() => setShowCleanupConfirm(true)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18"></path>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                            Clear Local Data
                                        </button>

                                        <button className="data-action-button">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                <line x1="12" y1="3" x2="12" y2="15"></line>
                                            </svg>
                                            Export Data
                                        </button>
                                    </div>

                                    <div className="api-settings">
                                        <h3>API Settings</h3>
                                        <div className="settings-row">
                                            <label htmlFor="apiEndpoint">API Endpoint</label>
                                            <input
                                                type="text"
                                                id="apiEndpoint"
                                                name="apiEndpoint"
                                                value="http://127.0.0.1:5001"
                                                readOnly
                                            />
                                        </div>

                                        <div className="settings-row">
                                            <label htmlFor="apiTimeout">API Timeout (seconds)</label>
                                            <input
                                                type="number"
                                                id="apiTimeout"
                                                name="apiTimeout"
                                                min="5"
                                                max="60"
                                                value="30"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Confirmation dialog for clearing data */}
                                {showCleanupConfirm && (
                                    <div className="settings-modal-overlay">
                                        <motion.div
                                            className="settings-modal"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                        >
                                            <h3>Clear Local Data</h3>
                                            <p>This will clear all your local data including search history, preferences, and cached results. This action cannot be undone.</p>
                                            <p>Your account information will remain intact.</p>

                                            <div className="modal-actions">
                                                <button
                                                    className="cancel-button"
                                                    onClick={() => setShowCleanupConfirm(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={clearLocalData}
                                                >
                                                    Clear All Data
                                                </button>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Simple Save button */}
            <button
                className={`settings-save-button ${isSaving ? 'saving' : ''}`}
                onClick={saveSettings}
                disabled={isSaving}
            >
                {isSaving ? (
                    <>
                        Saving...
                        <span className="save-spinner"></span>
                    </>
                ) : (
                    'Save Settings'
                )}
            </button>

            {/* Toast notifications */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default SettingsWindow;