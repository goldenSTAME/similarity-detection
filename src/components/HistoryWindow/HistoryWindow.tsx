import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SimilarImagesGallery from "../SelectImageWindow/SimilarityImagesComponent";
import "./HistoryWindow.css";
// 导入HistoryUtil
import {
  HistoryUtil,
  HistoricalSearch,
  HISTORY_PAGE_SIZE,
} from "../../Utils/HistoryUtil";

const HistoryWindow: React.FC = () => {
  const [allHistoryData, setAllHistoryData] = useState<HistoricalSearch[]>([]); // 存储所有历史记录用于过滤
  const [historyData, setHistoryData] = useState<HistoricalSearch[]>([]); // 当前显示的历史记录
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showHighSimilarityOnly, setShowHighSimilarityOnly] =
    useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] =
    useState<HistoricalSearch | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // 定义高相似度阈值
  const HIGH_SIMILARITY_THRESHOLD = 0.8;

  // 加载所有历史数据
  useEffect(() => {
    const loadHistoryData = () => {
      setIsLoading(true);
      try {
        // 获取所有搜索历史用于过滤
        const allSearches: HistoricalSearch[] = HistoryUtil.getAllSearches();
        console.log(
          "HistoryWindow: Loaded all history count:",
          allSearches.length
        );

        // 按时间戳排序（最新的在前）
        const sortedData = [...allSearches].sort(
          (a, b) => b.timestamp - a.timestamp
        );

        setAllHistoryData(sortedData);
        setTotalItems(sortedData.length);

        // 调试信息
        if (sortedData.length > 0) {
          setDebugInfo(
            `共${
              sortedData.length
            }条记录，每页${HISTORY_PAGE_SIZE}条，共${Math.ceil(
              sortedData.length / HISTORY_PAGE_SIZE
            )}页`
          );
        } else {
          setDebugInfo("暂无历史记录");
        }
      } catch (error) {
        console.error("HistoryWindow: Error loading history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoryData();
  }, []);

  // 根据高相似度过滤数据
  useEffect(() => {
    const filteredData = showHighSimilarityOnly
      ? allHistoryData.filter(
          (item) => item.highestSimilarity >= HIGH_SIMILARITY_THRESHOLD
        )
      : allHistoryData;

    // 设置过滤后的总数和总页数
    setTotalItems(filteredData.length);
    const calculatedTotalPages =
      Math.ceil(filteredData.length / HISTORY_PAGE_SIZE) || 1;
    setTotalPages(calculatedTotalPages);

    // 更新调试信息
    if (filteredData.length > 0) {
      const filter = showHighSimilarityOnly ? "高相似度" : "全部";
      setDebugInfo(
        `筛选: ${filter}, 共${filteredData.length}条记录，每页${HISTORY_PAGE_SIZE}条，共${calculatedTotalPages}页`
      );
    } else {
      setDebugInfo(
        showHighSimilarityOnly ? "没有高相似度的历史记录" : "暂无历史记录"
      );
    }

    // 确保当前页有效
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1);
    } else {
      // 加载当前页数据
      loadCurrentPageData(filteredData);
    }
  }, [allHistoryData, showHighSimilarityOnly]);

  // 当页码改变时加载数据
  useEffect(() => {
    const filteredData = showHighSimilarityOnly
      ? allHistoryData.filter(
          (item) => item.highestSimilarity >= HIGH_SIMILARITY_THRESHOLD
        )
      : allHistoryData;

    loadCurrentPageData(filteredData);
  }, [currentPage]);

  // 加载当前页数据
  const loadCurrentPageData = (filteredData: HistoricalSearch[]) => {
    const startIndex = (currentPage - 1) * HISTORY_PAGE_SIZE;
    const endIndex = Math.min(
      startIndex + HISTORY_PAGE_SIZE,
      filteredData.length
    );
    const pageData = filteredData.slice(startIndex, endIndex);

    setHistoryData(pageData);
    console.log(
      `Showing page ${currentPage} with ${pageData.length} items (${
        startIndex + 1
      }-${endIndex} of ${filteredData.length})`
    );
  };

  // 页面导航
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSelectedHistory(null); // 切换页面时关闭展开项
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedHistory(null); // 切换页面时关闭展开项
    }
  };

  // 跳转到指定页
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      setSelectedHistory(null);
    }
  };

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 处理历史项目点击
  const handleHistoryItemClick = (item: HistoricalSearch) => {
    setSelectedHistory(selectedHistory?.id === item.id ? null : item);
  };

  // 处理删除历史记录
  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 防止项目展开

    if (window.confirm("Are you sure you want to delete this history item?")) {
      // 使用HistoryUtil删除
      HistoryUtil.deleteSearch(id);

      // 更新状态
      setAllHistoryData((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        return updated;
      });

      // 如果删除的是当前选中的项目，清除选择
      if (selectedHistory?.id === id) {
        setSelectedHistory(null);
      }
    }
  };

  // 处理清空所有历史
  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all search history?")) {
      // 使用HistoryUtil清空
      HistoryUtil.clearAllHistory();
      setAllHistoryData([]);
      setHistoryData([]);
      setSelectedHistory(null);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalItems(0);
      setDebugInfo("已清空所有历史记录");
    }
  };

  // 强制重新加载历史记录
  const handleReloadHistory = () => {
    setIsLoading(true);
    try {
      const allSearches: HistoricalSearch[] = HistoryUtil.getAllSearches();
      console.log("手动重新加载，历史记录数量:", allSearches.length);

      const sortedData = [...allSearches].sort(
        (a, b) => b.timestamp - a.timestamp
      );

      setAllHistoryData(sortedData);
      setTotalItems(sortedData.length);

      const calculatedTotalPages =
        Math.ceil(sortedData.length / HISTORY_PAGE_SIZE) || 1;
      setTotalPages(calculatedTotalPages);

      // 确保当前页有效
      if (currentPage > calculatedTotalPages) {
        setCurrentPage(1);
      }

      // 更新调试信息
      if (sortedData.length > 0) {
        setDebugInfo(
          `刷新完成: 共${sortedData.length}条记录，每页${HISTORY_PAGE_SIZE}条，共${calculatedTotalPages}页`
        );
      } else {
        setDebugInfo("刷新完成: 暂无历史记录");
      }
    } catch (error) {
      console.error("重新加载历史记录出错:", error);
      setDebugInfo(`刷新出错: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 生成页码列表
  const renderPaginationItems = () => {
    // 如果总页数少于等于7，直接显示所有页码
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`pagination-number ${
            currentPage === page ? "active" : ""
          }`}
        >
          {page}
        </button>
      ));
    }

    // 否则创建一个包含首页、尾页和当前页附近页码的数组
    const items = [];

    // 总是添加第一页
    items.push(
      <button
        key={1}
        onClick={() => goToPage(1)}
        className={`pagination-number ${currentPage === 1 ? "active" : ""}`}
      >
        1
      </button>
    );

    // 确定中间页码的范围
    let startPage: number, endPage: number;
    if (currentPage <= 3) {
      startPage = 2;
      endPage = 5;
      items.push(
        ...Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => i + startPage
        ).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`pagination-number ${
              currentPage === page ? "active" : ""
            }`}
          >
            {page}
          </button>
        ))
      );
      items.push(
        <span key="ellipsis1" className="pagination-ellipsis">
          ...
        </span>
      );
    } else if (currentPage >= totalPages - 2) {
      items.push(
        <span key="ellipsis1" className="pagination-ellipsis">
          ...
        </span>
      );
      startPage = totalPages - 4;
      endPage = totalPages - 1;
      items.push(
        ...Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => i + startPage
        ).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`pagination-number ${
              currentPage === page ? "active" : ""
            }`}
          >
            {page}
          </button>
        ))
      );
    } else {
      items.push(
        <span key="ellipsis1" className="pagination-ellipsis">
          ...
        </span>
      );
      startPage = currentPage - 1;
      endPage = currentPage + 1;
      items.push(
        ...Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => i + startPage
        ).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`pagination-number ${
              currentPage === page ? "active" : ""
            }`}
          >
            {page}
          </button>
        ))
      );
      items.push(
        <span key="ellipsis2" className="pagination-ellipsis">
          ...
        </span>
      );
    }

    // 总是添加最后一页
    items.push(
      <button
        key={totalPages}
        onClick={() => goToPage(totalPages)}
        className={`pagination-number ${
          currentPage === totalPages ? "active" : ""
        }`}
      >
        {totalPages}
      </button>
    );

    return items;
  };

  return (
    <div className="history-window">
      <h2>Search History</h2>

      {/* 调试信息区域 */}
      {debugInfo && (
        <div className="debug-info">
          <p>{debugInfo}</p>
          <button onClick={handleReloadHistory} className="reload-button">
            刷新历史记录
          </button>
        </div>
      )}

      {/* 筛选控制区域 */}
      <div className="history-controls">
        <div className="pagination-info-text">
          第 {currentPage} 页 / 共 {totalPages} 页
        </div>
        <div className="controls-right">
          <button
            className={`filter-button ${
              showHighSimilarityOnly ? "active" : ""
            }`}
            onClick={() => setShowHighSimilarityOnly(!showHighSimilarityOnly)}
          >
            {showHighSimilarityOnly
              ? "Filter: High Similarity Only"
              : "Filter: All History"}
          </button>

          {allHistoryData.length > 0 && (
            <button
              className="clear-all-button"
              onClick={handleClearAllHistory}
            >
              Clear All History
            </button>
          )}
        </div>
      </div>

      {/* 增强的分页控制器 */}
      {!isLoading && totalItems > 0 && (
        <div className="pagination-controls enhanced">
          <button
            className={`pagination-button ${
              currentPage <= 1 ? "disabled" : ""
            }`}
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
          >
            &lt;
          </button>

          <div className="pagination-numbers">{renderPaginationItems()}</div>

          <button
            className={`pagination-button ${
              currentPage >= totalPages ? "disabled" : ""
            }`}
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            &gt;
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      ) : totalItems === 0 ? (
        <div className="no-history">
          <p>No search history found.</p>
          {showHighSimilarityOnly && allHistoryData.length > 0 && (
            <p>
              Try showing all history instead of just high similarity results.
            </p>
          )}
        </div>
      ) : (
        <div className="history-list">
          {historyData.map((item) => (
            <motion.div
              key={item.id}
              className={`history-item ${
                selectedHistory?.id === item.id ? "expanded" : ""
              }`}
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
                    {selectedHistory?.id === item.id ? "▼" : "▶"}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedHistory?.id === item.id && (
                  <motion.div
                    className="history-item-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
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

      {/* 底部分页控制器 (仅当有多个历史记录且不是正在加载时显示) */}
      {!isLoading && totalItems > HISTORY_PAGE_SIZE && (
        <div className="pagination-controls bottom enhanced">
          <button
            className={`pagination-button ${
              currentPage <= 1 ? "disabled" : ""
            }`}
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
          >
            &lt;
          </button>

          <div className="pagination-numbers">{renderPaginationItems()}</div>

          <button
            className={`pagination-button ${
              currentPage >= totalPages ? "disabled" : ""
            }`}
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryWindow;
