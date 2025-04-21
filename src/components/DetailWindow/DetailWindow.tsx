import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DetailWindow.css";
import { getAuthToken } from "../../Utils/AuthUtils";

interface ImageDetail {
    brand: string;
    image_id: string;
    listing_season: string;
    product_name: string;
    rating: number;
    sale_status: string;
    season: string;
    size: string;
    store_description: string;
    store_name: string;
    tags: string;
    url: string;
    waist_type: string;
}

interface ApiResponse {
    message: ImageDetail;
    success: boolean;
}

const DetailWindow: React.FC = () => {
    const { imageId } = useParams<{ imageId: string }>();
    const navigate = useNavigate();
    const [imageDetail, setImageDetail] = useState<ImageDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check system preference for dark mode
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        const fetchImageDetail = async () => {
            try {
                setLoading(true);
                
                // 获取认证token
                const authToken = await getAuthToken();
                
                const response = await fetch('http://127.0.0.1:5001/image_detail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
                    },
                    body: JSON.stringify({
                        splitted_image_id: imageId
                    })
                });

                const data: ApiResponse = await response.json();
                
                if (data.success) {
                    setImageDetail(data.message);
                    
                    // Save state info to sessionStorage to indicate search results should be preserved
                    sessionStorage.setItem('preserveSearchResults', 'true');
                } else {
                    setError('Failed to fetch image details');
                }
            } catch (err) {
                setError('An error occurred while fetching the details');
            } finally {
                setLoading(false);
            }
        };

        if (imageId) {
            fetchImageDetail();
        }
    }, [imageId]);

    const handleBack = () => {
        navigate(-1);
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    if (loading) {
        return (
            <div className="detail-window">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading image details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="detail-window">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={handleBack} className="back-button">Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="detail-window">
            <div className="header-controls">
                <button onClick={handleBack} className="back-button">
                    ← Back
                </button>
                <button onClick={toggleTheme} className="theme-toggle">
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>
            
            {imageDetail && (
                <div className="detail-content">
                    <div className="detail-header">
                        <h1 className="product-name">{imageDetail.product_name}</h1>
                        <div className="rating">
                            <span className="rating-value">{imageDetail.rating}</span>
                            <span className="rating-stars">★★★★★</span>
                        </div>
                    </div>

                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="label">Brand</span>
                            <span className="value">{imageDetail.brand}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Store</span>
                            <span className="value">{imageDetail.store_name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Season</span>
                            <span className="value">{imageDetail.season}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Listing Season</span>
                            <span className="value">{imageDetail.listing_season}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Waist Type</span>
                            <span className="value">{imageDetail.waist_type}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Sale Status</span>
                            <span className="value">{imageDetail.sale_status}</span>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Available Sizes</h3>
                        <div className="size-tags">
                            {JSON.parse(imageDetail.size).map((size: string, index: number) => (
                                <span key={index} className="size-tag">{size}</span>
                            ))}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Tags</h3>
                        <div className="tag-container">
                            {JSON.parse(imageDetail.tags).map((tag: string, index: number) => (
                                <span key={index} className="tag">{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Store Description</h3>
                        <p className="description">{imageDetail.store_description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailWindow;
