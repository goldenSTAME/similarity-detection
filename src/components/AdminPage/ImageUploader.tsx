import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken } from '../../Utils/AuthUtils';
import './ImageUploader.css';

// 为了解决滚动问题，添加内联样式
const styles = {
    container: {
        width: '100%',
        height: '100%',
        overflowY: 'auto' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
        paddingRight: '10px'
    },
    segmentsSection: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: '10px',
        padding: '20px',
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    segmentsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        width: '100%',
        margin: '20px 0'
    },
    processingOverlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0, 
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
        backdropFilter: 'blur(5px)'
    }
};

interface SegmentType {
    segment_id: string;
    segment_base64: string;
    selected: boolean;
}

interface UploadResultType {
    success: boolean;
    message: string;
    data?: {
        splitted_image_id: string;
        splitted_image_path: string;
    };
}

const ImageUploader: React.FC = () => {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [segments, setSegments] = useState<SegmentType[]>([]);
    const [requestId, setRequestId] = useState<string | null>(null);
    const [uploadResults, setUploadResults] = useState<UploadResultType[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle drag over event
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    // Handle drag leave event
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
    };

    // Handle file drop
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            await processFile(file);
        }
    };

    // Handle file selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    // Process the uploaded file
    const processFile = async (file: File) => {
        // Validate file type
        if (!file.type.includes('image/')) {
            alert('Please upload an image file');
            return;
        }

        try {
            setUploading(true);
            // Convert file to base64
            const base64 = await fileToBase64(file);
            setImagePreview(base64);
            
            // Reset previous state
            setSegments([]);
            setRequestId(null);
            setUploadResults([]);
            
            setUploading(false);
        } catch (error) {
            console.error('File processing error:', error);
            setUploading(false);
            alert('Error processing the file. Please try again.');
        }
    };

    // Convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve(base64String);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    };

    // Split the image into segments
    const splitImage = async () => {
        if (!imagePreview) return;
        
        try {
            setProcessing(true);
            
            // Get authentication token
            const authToken = await getAuthToken();
            
            // API call to split image
            const response = await fetch('http://127.0.0.1:5001/split_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                },
                body: JSON.stringify({
                    image_base64: imagePreview,
                    force_process: true
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to split image');
            }
            
            const data = await response.json();
            
            if (data.success) {
                setRequestId(data.request_id);
                
                // Format segments with selection state
                const formattedSegments = data.data.segments.map((segment: any) => ({
                    ...segment,
                    selected: true // Default all segments to selected
                }));
                
                setSegments(formattedSegments);
            } else {
                throw new Error(data.message || 'Failed to split image');
            }
        } catch (error: any) {
            console.error('Image splitting error:', error);
            alert(`Error splitting image: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    // Toggle segment selection
    const toggleSegment = (index: number) => {
        setSegments(prev => 
            prev.map((segment, i) => 
                i === index ? { ...segment, selected: !segment.selected } : segment
            )
        );
    };

    // Upload selected segments to database
    const uploadSelectedSegments = async () => {
        const selectedSegments = segments.filter(segment => segment.selected);
        
        if (selectedSegments.length === 0) {
            alert('Please select at least one segment to upload');
            return;
        }
        
        try {
            setProcessing(true);
            setUploadResults([]);
            
            // Generate a unique ID for the original image
            const originalImageId = `original_${Date.now()}`;
            const results: UploadResultType[] = [];
            
            // Upload each selected segment
            for (let i = 0; i < selectedSegments.length; i++) {
                // Update progress
                setUploadProgress(Math.round((i / selectedSegments.length) * 100));
                
                const segment = selectedSegments[i];
                
                // Get authentication token
                const authToken = await getAuthToken();
                
                // API call to upload segment
                const response = await fetch('http://127.0.0.1:5001/upload_single_image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                    },
                    body: JSON.stringify({
                        image_base64: `data:image/png;base64,${segment.segment_base64}`,
                        original_image_id: originalImageId,
                        segment_id: segment.segment_id
                    })
                });
                
                const result = await response.json();
                results.push(result);
            }
            
            // Complete the progress
            setUploadProgress(100);
            
            // Set results
            setUploadResults(results);
            
            // Reset progress after a delay
            setTimeout(() => {
                setUploadProgress(0);
            }, 2000);
            
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Error uploading images: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    // Reset the uploader
    const handleReset = () => {
        setImagePreview(null);
        setSegments([]);
        setRequestId(null);
        setUploadResults([]);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Cancel an ongoing request
    const cancelRequest = async () => {
        if (!requestId) return;
        
        try {
            // Get authentication token
            const authToken = await getAuthToken();
            
            // API call to cancel request
            await fetch(`http://127.0.0.1:5001/cancel_processing/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                }
            });
            
            setProcessing(false);
        } catch (error) {
            console.error('Error cancelling request:', error);
        }
    };

    return (
        <div style={styles.container} className="image-uploader">
            {!imagePreview && (
                <motion.div 
                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="upload-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </div>
                    <p>{dragOver ? 'Drop your image here!' : 'Drag & drop an image here, or click to browse'}</p>
                    <button 
                        className="upload-button"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Select Image
                    </button>
                    <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </motion.div>
            )}

            {imagePreview && (
                <div className="upload-content">
                    <div className="preview-section">
                        <h2>Image Preview</h2>
                        <div className="image-preview-container">
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="preview-image"
                            />
                        </div>
                        <div className="action-buttons">
                            <button 
                                className="action-button"
                                onClick={handleReset}
                                disabled={processing || uploading}
                            >
                                Reset
                            </button>
                            <button 
                                className="action-button primary"
                                onClick={splitImage}
                                disabled={processing || uploading || !imagePreview}
                            >
                                {processing ? 'Processing...' : 'Split Image'}
                            </button>
                        </div>
                    </div>

                    {segments.length > 0 && (
                        <motion.div 
                            style={styles.segmentsSection}
                            className="segments-section"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="segments-header">
                                <h2>Image Segments</h2>
                                <div className="selection-controls">
                                    <button 
                                        className="select-button"
                                        onClick={() => setSegments(prev => prev.map(seg => ({ ...seg, selected: true })))}
                                    >
                                        Select All
                                    </button>
                                    <button 
                                        className="select-button"
                                        onClick={() => setSegments(prev => prev.map(seg => ({ ...seg, selected: false })))}
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>
                            <div style={styles.segmentsGrid} className="segments-grid">
                                {segments.map((segment, index) => (
                                    <motion.div 
                                        key={segment.segment_id}
                                        className={`segment-item ${segment.selected ? 'selected' : ''}`}
                                        onClick={() => toggleSegment(index)}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <img 
                                            src={`data:image/png;base64,${segment.segment_base64}`} 
                                            alt={`Segment ${index + 1}`}
                                            className="segment-image"
                                        />
                                        <div className="segment-select">
                                            <input 
                                                type="checkbox" 
                                                checked={segment.selected}
                                                onChange={() => toggleSegment(index)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span>Segment {index + 1}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="upload-controls">
                                {uploadProgress > 0 && (
                                    <div className="progress-bar-container">
                                        <div 
                                            className="progress-bar" 
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                        <span className="progress-text">{uploadProgress}%</span>
                                    </div>
                                )}
                                <button 
                                    className="upload-button"
                                    onClick={uploadSelectedSegments}
                                    disabled={processing || segments.filter(s => s.selected).length === 0}
                                >
                                    {processing ? 'Uploading...' : 'Upload Selected Segments'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {uploadResults.length > 0 && (
                            <motion.div 
                                className="results-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2>Upload Results</h2>
                                <div className="results-list">
                                    {uploadResults.map((result, index) => (
                                        <div 
                                            key={index}
                                            className={`result-item ${result.success ? 'success' : 'error'}`}
                                        >
                                            <div className="result-status">
                                                {result.success ? (
                                                    <svg className="success-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                    </svg>
                                                ) : (
                                                    <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <line x1="15" y1="9" x2="9" y2="15"></line>
                                                        <line x1="9" y1="9" x2="15" y2="15"></line>
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="result-info">
                                                <span className="result-message">{result.message}</span>
                                                {result.success && result.data && (
                                                    <span className="result-detail">ID: {result.data.splitted_image_id}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {processing && (
                <div style={styles.processingOverlay} className="processing-overlay">
                    <div className="processing-content">
                        <div className="spinner"></div>
                        <p>Processing your image...</p>
                        <button 
                            className="cancel-button"
                            onClick={cancelRequest}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader; 