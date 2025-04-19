// React 核心
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 动画库
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import pleaseWaitAnimation from "../../animations/pleasewait.json";

// 工具类
import { ImageUtils } from "../../Utils/ImageUtils";
import { HistoryUtil, HistoricalSearch } from "../../Utils/HistoryUtil";

// 组件
import UploadZone from "../UploadZone/UploadZone";
import SimilarImagesGallery from "./SimilarityImagesComponent";
import ProgressTracker, { LoadingState } from "./ProgressTracker";

// Toast 相关
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 样式文件 (确保custom样式在最后)
import "./SelectImageWindow.css";
import "./toast-custom.css";

// Define image data interface
interface ImageData {
  id: string;
  similarity: number;
  processed_image_base64: string;
}

// Define split image segment interface
interface ImageSegment {
  image_base64: string;
  results?: ImageData[];
  isSearching?: boolean;
  searchError?: string;
}

// Bottom action section component
interface ActionSectionProps {
  isLoading: boolean;
  loadingState: LoadingState;
  handleCancel: () => void;
  handleSearch: () => void;
  handleSplitImage: () => void;
  isSplitMode: boolean;
}

const ActionSection: React.FC<ActionSectionProps> = ({
  isLoading,
  loadingState,
  handleCancel,
  handleSearch,
  handleSplitImage,
  isSplitMode,
}) => {
  return (
    <motion.div
      className="action-section"
      layout
      transition={{ duration: 0.3 }}
    >
      <motion.hr className="divider" layout transition={{ duration: 0.3 }} />
      <div className="action-buttons">
        <motion.span
          key="cancel"
          className={`cancel-text ${isLoading ? "active" : "disabled"}`}
          onClick={isLoading ? handleCancel : undefined}
          layout
          transition={{ duration: 0.3 }}
          whileHover={{ scale: isLoading ? 1.05 : 1 }}
        >
          Cancel
        </motion.span>
        <motion.button
          key="split"
          onClick={handleSplitImage}
          disabled={isLoading}
          className={`split-button ${isSplitMode ? "active" : ""}`}
          layout
          transition={{ duration: 0.3 }}
          whileHover={{ scale: !isLoading ? 1.05 : 1 }}
        >
          Split and Search
        </motion.button>
        <motion.button
          key="search"
          onClick={handleSearch}
          disabled={isLoading}
          className={isLoading ? "loading" : ""}
          layout
          transition={{ duration: 0.3 }}
          whileHover={{ scale: !isLoading ? 1.05 : 1 }}
        >
          {isLoading ? "Processing..." : "Search"}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Component to display single segment with its search results
const SegmentWithResults: React.FC<{
  segment: ImageSegment;
  index: number;
  onSearch: (segmentIndex: number) => void;
}> = ({ segment, index, onSearch }) => {
  const navigate = useNavigate();

  const imgSrc = segment.image_base64.startsWith("data:")
    ? segment.image_base64
    : `data:image/jpeg;base64,${segment.image_base64}`;

  const handleImageClick = (imageId: string) => {
    navigate(`/details/${imageId}`);
  };

  return (
    <div className="segment-with-results">
      <div className="segment-container">
        <h3>Segment {index + 1}</h3>
        <div className="segment-image-container">
          <img
            src={imgSrc}
            alt={`Segment ${index + 1}`}
            className="segment-image-large"
            onError={(e) => {
              console.error(`Error loading segment ${index} image`, e);
              e.currentTarget.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgZXJyb3I8L3RleHQ+PC9zdmc+";
            }}
          />
          {!segment.results && !segment.isSearching && (
            <button
              className="search-segment-button"
              onClick={() => onSearch(index)}
            >
              Search Similar Items
            </button>
          )}
          {segment.isSearching && (
            <div className="segment-searching">
              <div className="spinner"></div>
              <span>Searching...</span>
            </div>
          )}
        </div>
      </div>

      {segment.results && segment.results.length > 0 && (
        <div className="segment-results">
          <h4>Similar Items</h4>
          <div className="results-grid">
            {segment.results.map((result, resultIndex) => (
              <div
                key={resultIndex}
                className="result-item clickable"
                onClick={() => handleImageClick(result.id)}
              >
                <img
                  src={`data:image/jpeg;base64,${result.processed_image_base64}`}
                  alt={`Similar item ${resultIndex + 1}`}
                  className="result-image"
                />
                <div className="result-similarity">
                  {(result.similarity * 100).toFixed(1)}% match
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {segment.searchError && (
        <div className="segment-error">
          <p>Error: {segment.searchError}</p>
          <button onClick={() => onSearch(index)}>Retry</button>
        </div>
      )}

      {segment.results && segment.results.length === 0 && (
        <div className="no-segment-results">
          <p>No similar items found</p>
        </div>
      )}
    </div>
  );
};

function SelectImageWindow() {
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [similarImages, setSimilarImages] = useState<ImageData[]>([]);
  const [numResults, setNumResults] = useState<number>(5);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.IDLE
  );
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [imageSegments, setImageSegments] = useState<ImageSegment[]>([]);
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);
  const [currentSearchingIndex, setCurrentSearchingIndex] =
    useState<number>(-1);

  const contentRef = useRef<HTMLDivElement>(null);
  const animationContainerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const STORAGE_KEY_RESULTS = "savedSearchResults";
  const STORAGE_KEY_PREVIEW = "savedImagePreview";
  const STORAGE_KEY_PRESERVE = "preserveSearchResults";

  const saveResultsToSessionStorage = (
    results: ImageData[],
    preview: string | null
  ) => {
    if (results.length > 0 && preview) {
      sessionStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
      sessionStorage.setItem(STORAGE_KEY_PREVIEW, preview);
    }
  };

  const loadResultsFromSessionStorage = () => {
    const resultsJSON = sessionStorage.getItem(STORAGE_KEY_RESULTS);
    const savedPreview = sessionStorage.getItem(STORAGE_KEY_PREVIEW);
    const shouldPreserve = sessionStorage.getItem(STORAGE_KEY_PRESERVE);

    if (shouldPreserve === "true" && resultsJSON && savedPreview) {
      try {
        const loadedResults = JSON.parse(resultsJSON);
        setSimilarImages(loadedResults);
        setImagePreview(savedPreview);
        setSearched(true);
        sessionStorage.removeItem(STORAGE_KEY_PRESERVE);
        return true;
      } catch (error) {
        console.error("Failed to parse saved results:", error);
      }
    }
    return false;
  };

  useEffect(() => {
    loadResultsFromSessionStorage();
  }, []);

  // Updated saveSearchToHistory function
  const saveSearchToHistory = (
    searchResults: ImageData[],
    imagePreview: string,
    imageName: string,
    isSegmentSearch = false
  ) => {
    if (!searchResults || searchResults.length === 0 || !imagePreview) {
      console.log("Cannot save history: Missing data");
      return;
    }

    const highestSimilarity = Math.max(
      ...searchResults.map((result) => result.similarity)
    );

    const searchId = `search_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    let thumbnailBase64 = imagePreview;
    if (imagePreview.startsWith("data:")) {
      thumbnailBase64 = imagePreview.split(",")[1];
    }

    const historyItem: HistoricalSearch = {
      id: searchId,
      timestamp: Date.now(),
      imageName: imageName || `Image_${new Date().toISOString().split("T")[0]}`,
      highestSimilarity: highestSimilarity,
      searchResults: searchResults,
      thumbnailBase64: thumbnailBase64,
      isSegmentSearch: isSegmentSearch
    };

    const savedCount = HistoryUtil.saveSearch(historyItem);
    console.log(`Search saved to history successfully (total: ${savedCount})`);
  };

  // Updated searchSegment function
  const searchSegment = async (segmentIndex: number) => {
    if (segmentIndex < 0 || segmentIndex >= imageSegments.length) {
      console.error("Invalid segment index:", segmentIndex);
      return;
    }

    setImageSegments((prevSegments) => {
      const updatedSegments = [...prevSegments];
      updatedSegments[segmentIndex] = {
        ...updatedSegments[segmentIndex],
        isSearching: true,
        searchError: undefined,
      };
      return updatedSegments;
    });

    setCurrentSearchingIndex(segmentIndex);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const segment = imageSegments[segmentIndex];
      let imageData = segment.image_base64;
      if (imageData.startsWith("data:")) {
        imageData = imageData.split(",")[1];
      }

      if (!imageData) {
        throw new Error("Invalid image data");
      }

      console.log(
        `Searching for segment ${segmentIndex} (data length: ${imageData.length})`
      );

      const results = await ImageUtils.uploadImage(
        imageData,
        numResults,
        signal
      );

      setImageSegments((prevSegments) => {
        const updatedSegments = [...prevSegments];
        updatedSegments[segmentIndex] = {
          ...updatedSegments[segmentIndex],
          results: results,
          isSearching: false,
        };
        return updatedSegments;
      });

      const imgSrc = segment.image_base64.startsWith("data:")
        ? segment.image_base64
        : `data:image/jpeg;base64,${segment.image_base64}`;

      saveSearchToHistory(
        results,
        imgSrc,
        `Split Segment ${segmentIndex + 1}`,
        true
      );

      setTimeout(() => {
        if (segmentRefs.current[segmentIndex]) {
          segmentRefs.current[segmentIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);

      if (segmentIndex < imageSegments.length - 1) {
        setTimeout(() => {
          searchSegment(segmentIndex + 1);
        }, 500);
      } else {
        setCurrentSearchingIndex(-1);
      }
    } catch (error: any) {
      console.error(`Search failed for segment ${segmentIndex}:`, error);

      setImageSegments((prevSegments) => {
        const updatedSegments = [...prevSegments];
        updatedSegments[segmentIndex] = {
          ...updatedSegments[segmentIndex],
          isSearching: false,
          searchError: error.message || "Search failed",
        };
        return updatedSegments;
      });

      setCurrentSearchingIndex(-1);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleSplitImage = async () => {
    if (!imagePreview) {
      toast.warn("Please select an image first!");
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setLoadingState(LoadingState.CONVERTING);
    setImageSegments([]);
    setIsSplitMode(true);
    setCurrentSearchingIndex(-1);
    updateProgressWithDelay("Converting image...");

    try {
      let base64Image = imagePreview;
      if (base64Image.startsWith("data:")) {
        base64Image = base64Image.split(",")[1];
      }

      if (!base64Image) {
        throw new Error("Invalid image data");
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      setLoadingState(LoadingState.SPLITTING);
      updateProgressWithDelay("Splitting image...");

      console.log(`Sending image for split (length: ${base64Image.length})`);

      const segments = await ImageUtils.splitImage(base64Image, signal);

      setLoadingState(LoadingState.EXTRACTING);
      updateProgressWithDelay("Extracting features...");

      await new Promise((resolve) => setTimeout(resolve, 300));

      setLoadingState(LoadingState.SEARCHING);
      updateProgressWithDelay("Finding similar images...");

      await new Promise((resolve) => setTimeout(resolve, 300));

      setLoadingState(LoadingState.FETCHING);
      updateProgressWithDelay("Loading segments...");

      if (segments && segments.length > 0) {
        console.log(`Found ${segments.length} segments`);

        segmentRefs.current = Array(segments.length).fill(null);

        setImageSegments(segments);

        setLoadingState(LoadingState.IDLE);
        setIsLoading(false);

        toast.success(
          `Image split into ${segments.length} segments successfully!`
        );

        setTimeout(() => {
          searchSegment(0);
        }, 500);
      } else {
        setImageSegments([]);
        toast.warn("No segments found in the image");
        setLoadingState(LoadingState.IDLE);
        setIsLoading(false);
      }
    } catch (error: any) {
      setLoadingState(
        error.message === "Request cancelled"
          ? LoadingState.CANCELLED
          : LoadingState.ERROR
      );

      if (error.message === "Request cancelled") {
        toast.info("Split operation cancelled");
        setProgressMessage("Cancelled");
      } else {
        console.error("Image split failed:", error);
        toast.error("Split failed: " + (error.message || "Unknown error"));
        setProgressMessage("Failed");
      }

      setIsLoading(false);
    } finally {
      abortControllerRef.current = null;

      if (
        loadingState === LoadingState.CANCELLED ||
        loadingState === LoadingState.ERROR
      ) {
        setTimeout(() => {
          setLoadingState(LoadingState.IDLE);
          setProgressMessage("");
        }, 1500);
      }
    }
  };

  const updateProgressWithDelay = (message: string) => {
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }

    progressTimeoutRef.current = setTimeout(() => {
      setProgressMessage(message);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading && animationContainerRef.current) {
      animationContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (!isLoading && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isLoading]);

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

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;
    setImage(file);
    setIsSplitMode(false);
    setImageSegments([]);
    try {
      const base64 = await ImageUtils.fileToBase64(file);
      setImagePreview(base64);
    } catch (error) {
      console.error("File conversion failed:", error);
      toast.error("File conversion failed, please try again!");
    }
  };

  const handleSearch = async () => {
    if (!imagePreview) {
      toast.warn("Please select an image first!");
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setLoadingState(LoadingState.CONVERTING);
    setSimilarImages([]);
    setSearched(false);
    setIsSplitMode(false);
    setCurrentSearchingIndex(-1);
    updateProgressWithDelay("Converting image...");

    try {
      let base64Image = imagePreview;
      if (base64Image.startsWith("data:")) {
        base64Image = base64Image.split(",")[1];
      }

      setLoadingState(LoadingState.EXTRACTING);
      updateProgressWithDelay("Extracting features...");

      await new Promise((resolve) => setTimeout(resolve, 300));

      setLoadingState(LoadingState.SEARCHING);
      updateProgressWithDelay("Searching similar images...");

      const results = await ImageUtils.uploadImage(
        base64Image,
        numResults,
        signal
      );

      setLoadingState(LoadingState.FETCHING);
      updateProgressWithDelay("Loading results...");

      setSimilarImages(results);
      setSearched(true);
      setLoadingState(LoadingState.IDLE);
      toast.success("Search completed successfully!");

      if (results && imagePreview) {
        const fileName = image ? image.name : "Unknown Image";
        saveSearchToHistory(results, imagePreview, fileName);

        saveResultsToSessionStorage(results, imagePreview);
      }
    } catch (error: any) {
      setLoadingState(
        error.message === "Request cancelled"
          ? LoadingState.CANCELLED
          : LoadingState.ERROR
      );

      if (error.message === "Request cancelled") {
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
      setTimeout(() => {
        if (
          loadingState === LoadingState.CANCELLED ||
          loadingState === LoadingState.ERROR
        ) {
          setLoadingState(LoadingState.IDLE);
          setProgressMessage("");
        }
      }, 1500);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (!isLoading || !abortControllerRef.current) return;

    updateProgressWithDelay("Cancelling...");

    abortControllerRef.current.abort();
  };

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

        <div
          ref={animationContainerRef}
          className={`animation-container ${
            isLoading && !isSplitMode ? "fixed-height" : ""
          } ${isSplitMode ? "split-mode" : ""} ${isLoading ? "loading" : ""}`}
        >
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
                  isSplitMode={isSplitMode}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isSplitMode && imageSegments.length > 0 && (
              <motion.div
                key="splitResultsVertical"
                className="split-results-vertical"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="segments-title">
                  Split Image Results ({imageSegments.length} segments)
                </h3>

                <div className="segments-list">
                  {imageSegments.map((segment, index) => (
                    <div
                      key={index}
                      ref={(el: HTMLDivElement | null) => {
                        segmentRefs.current[index] = el;
                      }}
                      className={`segment-wrapper ${
                        currentSearchingIndex === index
                          ? "currently-searching"
                          : ""
                      }`}
                    >
                      <SegmentWithResults
                        segment={segment}
                        index={index}
                        onSearch={() => searchSegment(index)}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isLoading && !isSplitMode && similarImages.length > 0 && (
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

          <AnimatePresence mode="wait">
            {!isLoading &&
              searched &&
              similarImages.length === 0 &&
              !isSplitMode && (
                <motion.div
                  key="noResults"
                  className="no-results-wrapper"
                  initial={{ opacity: 0, x: "100%" }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: "100%" }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="no-results-message">No similar images found.</p>
                </motion.div>
              )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isLoading && isSplitMode && imageSegments.length === 0 && (
              <motion.div
                key="noSegments"
                className="no-results-wrapper"
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ duration: 0.3 }}
              >
                <p className="no-results-message">
                  No image segments found. The image may not contain multiple
                  clothing items.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ActionSection
        isLoading={isLoading}
        loadingState={loadingState}
        handleCancel={handleCancel}
        handleSearch={handleSearch}
        handleSplitImage={handleSplitImage}
        isSplitMode={isSplitMode}
      />

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