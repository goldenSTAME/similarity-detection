import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../Utils/AuthUtils';
import ImageUploader from './ImageUploader';
import './AdminPage.css';

// 添加内联样式以解决滚动问题
const styles = {
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        padding: '20px',
        transition: 'all 0.3s ease'
    },
    header: {
        marginBottom: '20px',
        borderBottom: '1px solid',
        paddingBottom: '15px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        flexShrink: 0 as const
    },
    content: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        height: 'calc(100% - 100px)', 
        minHeight: '500px'
    }
};

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Check if user is an admin
    useEffect(() => {
        const user = getUser();
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        setIsAdmin(true);
    }, [navigate]);

    // Check for dark mode
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            setIsDarkMode(prefersDark);
        }
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Apply theme to page
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    if (!isAdmin) {
        return null; // Don't render anything if not admin
    }

    return (
        <div 
            style={{
                ...styles.container,
                backgroundColor: isDarkMode ? '#1e1e2f' : '#f8f9fa',
                color: isDarkMode ? '#f1f1f1' : '#333'
            }} 
            className={`admin-page ${isDarkMode ? 'dark' : 'light'}`}
        >
            <div 
                style={{
                    ...styles.header, 
                    borderColor: isDarkMode ? '#444' : '#ddd'
                }} 
                className="admin-header"
            >
                <h1>Administrator Panel</h1>
                <p>Upload and manage images in the database</p>
            </div>
            <div style={styles.content} className="admin-content">
                <ImageUploader />
            </div>
        </div>
    );
};

export default AdminPage; 