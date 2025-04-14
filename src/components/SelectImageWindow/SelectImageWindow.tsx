// React 核心
import React, { useState, useRef, useEffect } from 'react';

// 动画库
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import pleaseWaitAnimation from '../../animations/pleasewait.json';

// 工具类
import { ImageUtils } from '../../Utils/ImageUtils';
import { HistoryUtil, HistoricalSearch } from '../../Utils/HistoryUtil';

// 组件
import UploadZone from "../UploadZone/UploadZone";
import SimilarImagesGallery from "./SimilarityImagesComponent";
import ProgressTracker, { LoadingState } from './ProgressTracker';

// Toast 相关
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 样式文件 (确保custom样式在最后)
import './SelectImageWindow.css';
import './toast-custom.css';

// Define image data interface
interface ImageData {
  id: string;
  similarity: number;
  processed_image_base64: string;
}

// Bottom action section component
interface ActionSectionProps {
  isLoading: boolean;
  loadingState: LoadingState;
  handleCancel: () => void;
  handleSearch: () => void;
}

const ActionSection: React.FC<ActionSectionProps> = ({
                                                       isLoading,
                                                       loadingState,
                                                       handleCancel,
                                                       handleSearch
                                                     }) => {
  return (
      <motion.div
          className="action-section"
          layout
          transition={{ duration: 0.3 }}
      >
        <motion.hr
            className="divider"
            layout
            transition={{ duration: 0.3 }}
        />
        <div className="action-buttons">
          <motion.span
              key="cancel"
              className={`cancel-text ${isLoading ? 'active' : 'disabled'}`}
              onClick={isLoading ? handleCancel : undefined}
              layout
              transition={{ duration: 0.3 }}
              whileHover={{ scale: isLoading ? 1.05 : 1 }}
          >
            Cancel
          </motion.span>
          <motion.button
              key="search"
              onClick={handleSearch}
              disabled={isLoading}
              className={isLoading ? 'loading' : ''}
              layout
              transition={{ duration: 0.3 }}
              whileHover={{ scale: !isLoading ? 1.05 : 1 }}
          >
            {isLoading ? 'Processing...' : 'Search'}
          </motion.button>
        </div>
      </motion.div>
  );
};

function SelectImageWindow() {
  const [image, setImage] = useState<File | null>(null);
  const [similarImages, setSimilarImages] = useState<ImageData[]>([]);
  const [numResults, setNumResults] = useState<number>(5);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [progressMessage, setProgressMessage] = useState<string>('');

  // References for scrolling and animation
  const contentRef = useRef<HTMLDivElement>(null);
  const animationContainerRef = useRef<HTMLDivElement>(null);

  // AbortController reference
  const abortControllerRef = useRef<AbortController | null>(null);

  // Progress message timeout reference
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add storage keys
  const STORAGE_KEY_RESULTS = 'savedSearchResults';
  const STORAGE_KEY_PREVIEW = 'savedImagePreview';
  const STORAGE_KEY_PRESERVE = 'preserveSearchResults';

  // Function to save search results to session storage
  const saveResultsToSessionStorage = (results: ImageData[], preview: string | null) => {
    if (results.length > 0 && preview) {
      sessionStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
      sessionStorage.setItem(STORAGE_KEY_PREVIEW, preview);
    }
  };

  // Function to load search results from session storage
  const loadResultsFromSessionStorage = () => {
    const resultsJSON = sessionStorage.getItem(STORAGE_KEY_RESULTS);
    const savedPreview = sessionStorage.getItem(STORAGE_KEY_PREVIEW);
    const shouldPreserve = sessionStorage.getItem(STORAGE_KEY_PRESERVE);

    if (shouldPreserve === 'true' && resultsJSON && savedPreview) {
      try {
        const loadedResults = JSON.parse(resultsJSON);
        setSimilarImages(loadedResults);
        setImagePreview(savedPreview);
        setSearched(true);
        
        // Clear the preserve flag after loading
        sessionStorage.removeItem(STORAGE_KEY_PRESERVE);
        
        return true;
      } catch (error) {
        console.error('Failed to parse saved results:', error);
      }
    }
    return false;
  };

  // Load saved results on component mount
  useEffect(() => {
    loadResultsFromSessionStorage();
  }, []);

  // Function to save search to history
  const saveSearchToHistory = (searchResults: ImageData[], imagePreview: string, imageName: string) => {
    if (!searchResults || searchResults.length === 0 || !imagePreview) {
      console.log('Cannot save history: Missing data');
      return;
    }

    // Find highest similarity from results
    const highestSimilarity = Math.max(...searchResults.map(result => result.similarity));

    // Generate unique ID for this search
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create thumbnail from imagePreview by removing the data URL prefix
    let thumbnailBase64 = imagePreview;
    if (imagePreview.startsWith('data:')) {
      thumbnailBase64 = imagePreview.split(',')[1];
    }

    // Create history item
    const historyItem: HistoricalSearch = {
      id: searchId,
      timestamp: Date.now(),
      imageName: imageName || `Image_${new Date().toISOString().split('T')[0]}`,
      highestSimilarity: highestSimilarity,
      searchResults: searchResults,
      thumbnailBase64: thumbnailBase64
    };

    // Use the shared history manager to save the item
    const savedCount = HistoryUtil.saveSearch(historyItem);
    console.log(`Search saved to history successfully (total: ${savedCount})`);
  };

  // Update progress message with a slight delay
  const updateProgressWithDelay = (message: string) => {
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }

    progressTimeoutRef.current = setTimeout(() => {
      setProgressMessage(message);
    }, 100);
  };

  // Cleanup progress message timeout on unmount
  useEffect(() => {
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll based on loading state
  useEffect(() => {
    if (isLoading && animationContainerRef.current) {
      animationContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!isLoading && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isLoading]);

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateFile(file)) return;
      await processFile(file);
    }
  };

  // Process file: convert to Base64 and set preview
  const processFile = async (file: File) => {
    if (!validateFile(file)) return;
    setImage(file);
    try {
      const base64 = await ImageUtils.fileToBase64(file);
      setImagePreview(base64);
    } catch (error) {
      console.error("File conversion failed:", error);
      toast.error("File conversion failed, please try again!");
    }
  };

  // Handle search action
  const handleSearch = async () => {
    if (!image) {
      toast.warn("Please select an image first!");
      return;
    }

    // Create a new AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Reset state for new search
    setIsLoading(true);
    setLoadingState(LoadingState.CONVERTING);
    setSimilarImages([]);
    setSearched(false);
    updateProgressWithDelay("Converting image...");

    try {
      // Convert image to Base64
      const base64Image = await ImageUtils.fileToBase64(image);

      setLoadingState(LoadingState.EXTRACTING);
      updateProgressWithDelay("Extracting features...");

      // Add a small delay to ensure the UI updates
      await new Promise(resolve => setTimeout(resolve, 300));

      setLoadingState(LoadingState.SEARCHING);
      updateProgressWithDelay("Searching similar images...");

      // Upload and search for similar images
      const results = await ImageUtils.uploadImage(base64Image, numResults, signal);

      setLoadingState(LoadingState.FETCHING);
      updateProgressWithDelay("Loading results...");

      // If search completed successfully
      setSimilarImages(results);
      setSearched(true);
      setLoadingState(LoadingState.IDLE);
      toast.success("Search completed successfully!");

      // Save to history
      if (results && imagePreview) {
        const fileName = image ? image.name : "Unknown Image";
        saveSearchToHistory(results, imagePreview, fileName);
        
        // Save results to session storage for persistence
        saveResultsToSessionStorage(results, imagePreview);
      }
    } catch (error: any) {
      // Handle various error cases
      setLoadingState(error.message === 'Request cancelled' ? LoadingState.CANCELLED : LoadingState.ERROR);

      if (error.message === 'Request cancelled') {
        toast.info("Search cancelled");
        setProgressMessage("Cancelled");
      } else {
        console.error("Image search failed:", error);
        toast.error("Search failed: " + (error.message || "Unknown error"));
        setProgressMessage("Failed");
      }

      setSearched(true);
    } finally {
      setIsLoading(false);
      // Delayed reset of loading state information
      setTimeout(() => {
        if (loadingState === LoadingState.CANCELLED || loadingState === LoadingState.ERROR) {
          setLoadingState(LoadingState.IDLE);
          setProgressMessage('');
        }
      }, 1500);
      abortControllerRef.current = null;
    }
  };

  // Handle cancel search action
  const handleCancel = () => {
    if (!isLoading || !abortControllerRef.current) return;

    updateProgressWithDelay("Cancelling...");

    // Cancel the request
    abortControllerRef.current.abort();
  };

  // Validate file type
  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG/JPEG format is supported!");
      return false;
    }
    return true;
  };

  return (
      <div className="select-image-window">
        <div ref={contentRef} className="content">
          <h2>Select Image</h2>
          <UploadZone
              dragOver={dragOver}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              handleFileChange={handleFileChange}
              uploadedImage={imagePreview}
          />

          {/* Animation and Results Container */}
          <div ref={animationContainerRef} className={`animation-container ${isLoading ? 'fixed-height' : ''}`}>
            {/* Lottie Animation */}
            <AnimatePresence mode="wait">
              {isLoading && (
                  <motion.div
                      key="lottie"
                      className="lottie-wrapper"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                  >
                    <Lottie
                        animationData={pleaseWaitAnimation}
                        loop={true}
                        className="please-wait-lottie"
                    />
                    <p className="loading-text">{progressMessage}</p>
                  </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Tracker */}
            <AnimatePresence mode="wait">
              {isLoading && (
                  <motion.div
                      key="progress"
                      className="progress-wrapper"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                  >
                    <ProgressTracker
                        currentState={loadingState}
                        progressMessage={progressMessage}
                        isLoading={isLoading}
                    />
                  </motion.div>
              )}
            </AnimatePresence>

            {/* Search Results */}
            <AnimatePresence mode="wait">
              {!isLoading && similarImages.length > 0 && (
                  <motion.div
                      key="results"
                      className="results-wrapper"
                      initial={{ opacity: 0, x: "100%" }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: "100%" }}
                      transition={{ duration: 0.3 }}
                  >
                    <SimilarImagesGallery images={similarImages} />
                  </motion.div>
              )}
            </AnimatePresence>

            {/* No Results Message */}
            <AnimatePresence mode="wait">
              {!isLoading && searched && similarImages.length === 0 && (
                  <motion.div
                      key="noResults"
                      className="no-results-wrapper"
                      initial={{ opacity: 0, x: "100%" }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: "100%" }}
                      transition={{ duration: 0.3 }}
                  >
                    <p className="no-results-message">
                      No similar images found.
                    </p>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Action Section */}
        <ActionSection
            isLoading={isLoading}
            loadingState={loadingState}
            handleCancel={handleCancel}
            handleSearch={handleSearch}
        />

        {/* Toast container with custom classes applied */}
        <ToastContainer
            className="custom-toast-container"
            toastClassName="custom-toast"
            progressClassName="custom-progress-bar"
            position="top-right"
            autoClose={1500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
        />
      </div>
  );
}

export default SelectImageWindow;