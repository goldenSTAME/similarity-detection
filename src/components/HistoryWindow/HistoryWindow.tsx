import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SimilarImagesGallery from "../SelectImageWindow/SimilarityImagesComponent";
import './HistoryWindow.css';

// Define the interface for history item data
export interface HistoricalSearch {
  id: string;
  timestamp: number;
  imageName: string;
  highestSimilarity: number;
  searchResults: {
    id: string;
    similarity: number;
    processed_image_base64: string;
  }[];
  thumbnailBase64: string; // Base64 of the uploaded image thumbnail
}

// Define interface for the localStorage history manager
interface HistoryManager {
  saveSearch: (historyItem: HistoricalSearch) => void;
  getAllSearches: () => HistoricalSearch[];
  deleteSearch: (id: string) => void;
  clearAllHistory: () => void;
}

// Create history manager for localStorage operations
const createHistoryManager = (): HistoryManager => {
  const STORAGE_KEY = 'image_search_history';

  // Helper to get history from localStorage
  const getHistoryFromStorage = (): HistoricalSearch[] => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Error reading history from localStorage:', error);
      return [];
    }
  };

  // Helper to save history to localStorage
  const saveHistoryToStorage = (history: HistoricalSearch[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  };

  return {
    saveSearch: (historyItem: HistoricalSearch): void => {
      const history = getHistoryFromStorage();

      // Check if the item with the same ID already exists
      const existingIndex = history.findIndex(item => item.id === historyItem.id);

      if (existingIndex !== -1) {
        // Update existing item
        history[existingIndex] = historyItem;
      } else {
        // Add new item
        history.push(historyItem);
      }

      // Save updated history
      saveHistoryToStorage(history);
    },

    getAllSearches: (): HistoricalSearch[] => {
      return getHistoryFromStorage();
    },

    deleteSearch: (id: string): void => {
      const history = getHistoryFromStorage();
      const updatedHistory = history.filter(item => item.id !== id);
      saveHistoryToStorage(updatedHistory);
    },

    clearAllHistory: (): void => {
      saveHistoryToStorage([]);
    }
  };
};

const HistoryWindow: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoricalSearch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showHighSimilarityOnly, setShowHighSimilarityOnly] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<HistoricalSearch | null>(null);

  // Create history manager instance
  const historyManager = React.useMemo(() => createHistoryManager(), []);

  // Define high similarity threshold
  const HIGH_SIMILARITY_THRESHOLD = 0.8;

  useEffect(() => {
    // Load history data from localStorage
    const loadHistoryData = () => {
      setIsLoading(true);
      try {
        // Get all searches from localStorage
        const searches = historyManager.getAllSearches();

        // Sort by timestamp descending (newest first)
        const sortedData = [...searches].sort(
          (a, b) => b.timestamp - a.timestamp
        );

        setHistoryData(sortedData);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoryData();
  }, [historyManager]);

  // Filter data based on similarity threshold
  const filteredData = showHighSimilarityOnly
    ? historyData.filter(item => item.highestSimilarity >= HIGH_SIMILARITY_THRESHOLD)
    : historyData;

  // Format date from timestamp
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle history item click
  const handleHistoryItemClick = (item: HistoricalSearch) => {
    setSelectedHistory(selectedHistory?.id === item.id ? null : item);
  };

  // Handle history item deletion
  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent item expansion when clicking delete

    if (window.confirm('Are you sure you want to delete this history item?')) {
      historyManager.deleteSearch(id);

      // Update the state to reflect the change
      setHistoryData(prev => prev.filter(item => item.id !== id));

      // If the deleted item was selected, clear selection
      if (selectedHistory?.id === id) {
        setSelectedHistory(null);
      }
    }
  };

  // Handle clearing all history
  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      historyManager.clearAllHistory();
      setHistoryData([]);
      setSelectedHistory(null);
    }
  };

  return (
    <div className="history-window">
      <h2>Search History</h2>

      <div className="history-controls">
        <button
          className={`filter-button ${showHighSimilarityOnly ? 'active' : ''}`}
          onClick={() => setShowHighSimilarityOnly(!showHighSimilarityOnly)}
        >
          {showHighSimilarityOnly
            ? "Filter: High Similarity Only"
            : "Filter: All History"}
        </button>

        {historyData.length > 0 && (
          <button
            className="clear-all-button"
            onClick={handleClearAllHistory}
          >
            Clear All History
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="no-history">
          <p>No search history found.</p>
          {showHighSimilarityOnly && historyData.length > 0 && (
            <p>Try showing all history instead of just high similarity results.</p>
          )}
        </div>
      ) : (
        <div className="history-list">
          {filteredData.map((item) => (
            <motion.div
              key={item.id}
              className={`history-item ${selectedHistory?.id === item.id ? 'expanded' : ''}`}
              onClick={() => handleHistoryItemClick(item)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="history-item-header">
                <div className="history-thumbnail">
                  <img
                    src={`data:image/png;base64,${item.thumbnailBase64}`}
                    alt={`Thumbnail for ${item.imageName}`}
                  />
                </div>
                <div className="history-details">
                  <h3>{item.imageName}</h3>
                  <div className="history-meta">
                    <span className="history-similarity">
                      Highest Similarity:
                      <span className={item.highestSimilarity >= HIGH_SIMILARITY_THRESHOLD ? 'high-similarity' : ''}>
                        {(item.highestSimilarity * 100).toFixed(1)}%
                      </span>
                    </span>
                    <span className="history-time">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="history-actions">
                  <button
                    className="delete-button"
                    onClick={(e) => handleDeleteHistory(e, item.id)}
                    aria-label="Delete"
                  >
                    ×
                  </button>
                  <div className="history-expand-icon">
                    {selectedHistory?.id === item.id ? '▼' : '▶'}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedHistory?.id === item.id && (
                  <motion.div
                    className="history-item-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="similar-results-container">
                      <h4>Similar Items Found:</h4>
                      <SimilarImagesGallery images={item.searchResults} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryWindow;