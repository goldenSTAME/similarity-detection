import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SimilarImagesGallery from "../SelectImageWindow/SimilarityImagesComponent";
import './HistoryWindow.css';

// Define the interface for history item data
interface HistoricalSearch {
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

// Mock data for development
const mockHistoryData: HistoricalSearch[] = [
  {
    id: '1',
    timestamp: Date.now() - 3600000, // 1 hour ago
    imageName: 'blue_dress.jpg',
    highestSimilarity: 0.92,
    searchResults: [
      { id: '123', similarity: 0.92, processed_image_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
      { id: '124', similarity: 0.85, processed_image_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
    ],
    thumbnailBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  },
  {
    id: '2',
    timestamp: Date.now() - 7200000, // 2 hours ago
    imageName: 'red_shirt.jpg',
    highestSimilarity: 0.78,
    searchResults: [
      { id: '223', similarity: 0.78, processed_image_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
      { id: '224', similarity: 0.65, processed_image_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
    ],
    thumbnailBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  },
  {
    id: '3',
    timestamp: Date.now() - 86400000, // 1 day ago
    imageName: 'black_pants.jpg',
    highestSimilarity: 0.89,
    searchResults: [
      { id: '323', similarity: 0.89, processed_image_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
      { id: '324', similarity: 0.76, processed_image_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
    ],
    thumbnailBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  }
];

const HistoryWindow: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoricalSearch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showHighSimilarityOnly, setShowHighSimilarityOnly] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<HistoricalSearch | null>(null);

  // Define high similarity threshold
  const HIGH_SIMILARITY_THRESHOLD = 0.8;

  useEffect(() => {
    // In a real app, fetch data from API
    // For now, use mock data with a small delay to simulate loading
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/history');
        // const data = await response.json();

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Sort by timestamp descending (newest first)
        const sortedData = [...mockHistoryData].sort(
          (a, b) => b.timestamp - a.timestamp
        );

        setHistoryData(sortedData);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      </div>

      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="no-history">
          <p>No search history found.</p>
          {showHighSimilarityOnly && (
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
                <div className="history-expand-icon">
                  {selectedHistory?.id === item.id ? '▼' : '▶'}
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