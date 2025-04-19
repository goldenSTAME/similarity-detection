import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SimilarImagesGallery from "../SelectImageWindow/SimilarityImagesComponent";
import './HistoryWindow.css';
// 导入HistoryUtil
import { HistoryUtil, HistoricalSearch } from "../../Utils/HistoryUtil";
import { useNavigate } from "react-router-dom";

const HistoryWindow: React.FC = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<HistoricalSearch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showHighSimilarityOnly, setShowHighSimilarityOnly] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<HistoricalSearch | null>(null);

  // 定义高相似度阈值
  const HIGH_SIMILARITY_THRESHOLD = 0.8;

  useEffect(() => {
    // 加载历史数据
    const loadHistoryData = () => {
      setIsLoading(true);
      try {
        // 使用HistoryUtil获取所有搜索历史
        const searches: HistoricalSearch[] = HistoryUtil.getAllSearches();
        console.log('HistoryWindow: Loaded history count:', searches.length);

        // 按时间戳排序（最新的在前）
        const sortedData = [...searches].sort(
          (a, b) => b.timestamp - a.timestamp
        );

        setHistoryData(sortedData);
      } catch (error) {
        console.error('HistoryWindow: Error loading history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoryData();
  }, []);

  // 根据高相似度过滤数据
  const filteredData = showHighSimilarityOnly
    ? historyData.filter(item => item.highestSimilarity >= HIGH_SIMILARITY_THRESHOLD)
    : historyData;

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // 处理历史项目点击
  const handleHistoryItemClick = (item: HistoricalSearch) => {
    setSelectedHistory(selectedHistory?.id === item.id ? null : item);
  };

  // 处理删除历史记录
  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 防止项目展开

    if (window.confirm('Are you sure you want to delete this history item?')) {
      // 使用HistoryUtil删除
      HistoryUtil.deleteSearch(id);

      // 更新状态
      setHistoryData(prev => prev.filter(item => item.id !== id));

      // 如果删除的是当前选中的项目，清除选择
      if (selectedHistory?.id === id) {
        setSelectedHistory(null);
      }
    }
  };

  // 处理清空所有历史
  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      // 使用HistoryUtil清空
      HistoryUtil.clearAllHistory();
      setHistoryData([]);
      setSelectedHistory(null);
    }
  };

  // 处理点击搜索结果图片，导航到详情页
  const handleResultItemClick = (imageId: string) => {
    navigate(`/details/${imageId}`);
  };

  return (
    <div className="history-window">
      <h2>Search History</h2>

      <div className="history-controls">
        <button
          className={`filter-button ${showHighSimilarityOnly ? "active" : ""}`}
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
              className={`history-item ${
                selectedHistory?.id === item.id ? "expanded" : ""
              } ${item.isSegmentSearch ? "segment-search" : ""}`}
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
                    onError={(e) => {
                      // Fallback image if loading fails
                      e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNDAiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBlcnJvcjwvdGV4dD48L3N2Zz4=";
                    }}
                  />
                </div>
                <div className="history-details">
                  <h3>
                    {item.isSegmentSearch && (
                      <span role="img" aria-label="Segment">🔪 </span>
                    )}
                    {item.imageName}
                  </h3>
                  <div className="history-meta">
                    <span className="history-similarity">
                      Highest Similarity:
                      <span
                        className={
                          item.highestSimilarity >= HIGH_SIMILARITY_THRESHOLD
                            ? "high-similarity"
                            : ""
                        }
                      >
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
                      <SimilarImagesGallery
                        images={item.searchResults}
                        onImageClick={handleResultItemClick}
                      />
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