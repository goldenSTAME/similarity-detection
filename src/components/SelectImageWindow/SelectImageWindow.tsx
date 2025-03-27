import React, { useState, useRef, useEffect } from 'react';
import { ImageUtils } from '../../Utils/ImageUtils';
import './SelectImageWindow.css';
import UploadZone from "../UploadZone/UploadZone";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SimilarImagesGallery from "./SimilarityImagesComponent";

// Define image data interface
interface ImageData {
  id: string;
  similarity: number;
  processed_image_base64: string;
}

// Define loading states as an enum
enum LoadingState {
  IDLE = 'idle',
  CONVERTING = 'converting',
  EXTRACTING = 'extracting',
  SEARCHING = 'searching',
  FETCHING = 'fetching',
  CANCELLED = 'cancelled',
  ERROR = 'error'
}

// Bottom action section component
interface ActionSectionProps {
  isLoading: boolean;
  loadingState: LoadingState;
  handleCancel: () => void;
  handleSearch: () => void;
  progressMessage: string;
}

const ActionSection: React.FC<ActionSectionProps> = (
    {
      isLoading,
      loadingState,
      handleCancel,
      handleSearch,
      progressMessage
    }) =>
{
  // Get appropriate button text based on state
  const getButtonText = () => {
    if (!isLoading) return "Search";

    return progressMessage || "Processing...";
  };

  return (
      <div className="action-section">
        <hr className="divider" />
        <div className="action-buttons">
        <span
            className={`cancel-text ${isLoading ? 'active' : 'disabled'}`}
            onClick={isLoading ? handleCancel : undefined}
        >
          Cancel
        </span>
          <button
              onClick={handleSearch}
              disabled={isLoading}
              className={isLoading ? 'loading' : ''}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
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

  // AbortController reference
  const abortControllerRef = useRef<AbortController | null>(null);

  // Progress message timeout reference
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update progress message with a slight delay
  const updateProgressWithDelay = (message: string) => {
    // Clear existing timeout
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }

    // Set after a short delay to avoid flickering
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

  // Handle file drop event
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  // Handle file input change event
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
        <div className="content">
          <h2>Select Image</h2>
          <UploadZone
              dragOver={dragOver}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              handleFileChange={handleFileChange}
              uploadedImage={imagePreview}
          />

          {/* Show loading indicator based on state */}
          {isLoading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p className="loading-text">{progressMessage}</p>
              </div>
          )}

          {/* Show search results */}
          {similarImages.length > 0 && (
              <SimilarImagesGallery images={similarImages} />
          )}

          {/* Search completed but no results */}
          {searched && similarImages.length === 0 && !isLoading && (
              <p className="no-results-message">No similar images found.</p>
          )}
        </div>

        {/* Bottom action section */}
        <ActionSection
            isLoading={isLoading}
            loadingState={loadingState}
            handleCancel={handleCancel}
            handleSearch={handleSearch}
            progressMessage={progressMessage}
        />

        <ToastContainer />
      </div>
  );
}

export default SelectImageWindow;