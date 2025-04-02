// 定义历史记录项目接口
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
  thumbnailBase64: string;
}

// 统一的存储键
export const HISTORY_STORAGE_KEY = 'image_search_history';

// 历史记录管理工具
export const HistoryUtil = {
  /**
   * 保存搜索历史
   * @param historyItem 要保存的历史记录项
   * @returns 保存后的历史记录数量
   */
  saveSearch: (historyItem: HistoricalSearch): number => {
    try {
      // 获取现有历史
      const existingData = localStorage.getItem(HISTORY_STORAGE_KEY);
      let historyData: HistoricalSearch[] = [];

      // 安全地解析现有数据
      try {
        historyData = existingData ? JSON.parse(existingData) : [];

        // 确保historyData是数组
        if (!Array.isArray(historyData)) {
          console.error('History data is not an array, resetting');
          historyData = [];
        }
      } catch (parseError) {
        console.error('Error parsing history data:', parseError);
        historyData = [];
      }

      // 简化history item以减少存储量 - 保留缩略图但压缩搜索结果
      const simplifiedItem = {
        ...historyItem,
        // 最多保留3个高相似度结果，并限制base64长度
        searchResults: historyItem.searchResults
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 3)
          .map(result => ({
            id: result.id,
            similarity: result.similarity,
            // 保留前1000个字符的base64数据
            processed_image_base64: result.processed_image_base64.substring(0, 1000)
          }))
      };

      // 检查是否已存在相同ID的记录
      const existingIndex = historyData.findIndex(item => item.id === simplifiedItem.id);

      if (existingIndex !== -1) {
        // 更新现有记录
        historyData[existingIndex] = simplifiedItem;
        console.log(`Updated existing history item at index ${existingIndex}`);
      } else {
        // 添加新记录
        historyData.push(simplifiedItem);
        console.log(`Added new history item, new length: ${historyData.length}`);
      }

      // 按时间戳排序，保留最新的5条记录以防止超出配额
      historyData.sort((a, b) => b.timestamp - a.timestamp);
      historyData = historyData.slice(0, 5);

      try {
        // 保存回localStorage
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyData));
        console.log(`HistoryUtil: Saved ${historyData.length} items to localStorage`);
      } catch (storageError) {
        // 如果还是超出配额，只保留最新的2条记录
        console.error('Storage quota exceeded, reducing further', storageError);
        historyData = historyData.slice(0, 2);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyData));
      }

      return historyData.length;
    } catch (error) {
      console.error('HistoryUtil: Error saving search history:', error);
      return 0;
    }
  },

  /**
   * 获取所有搜索历史
   * @returns 所有历史记录项
   */
  getAllSearches: (): HistoricalSearch[] => {
    try {
      const storedData = localStorage.getItem(HISTORY_STORAGE_KEY);
      let history: HistoricalSearch[] = [];

      // 安全地解析数据
      try {
        history = storedData ? JSON.parse(storedData) : [];

        // 确保history是数组
        if (!Array.isArray(history)) {
          console.error('HistoryUtil: History data is not an array, returning empty array');
          return [];
        }
      } catch (parseError) {
        console.error('HistoryUtil: Error parsing history data:', parseError);
        return [];
      }

      console.log(`HistoryUtil: Retrieved ${history.length} items from localStorage`);
      return history;
    } catch (error) {
      console.error('HistoryUtil: Error getting search history:', error);
      return [];
    }
  },

  /**
   * 删除指定ID的搜索历史
   * @param id 要删除的历史记录ID
   * @returns 删除后的历史记录数量
   */
  deleteSearch: (id: string): number => {
    try {
      // 获取现有历史
      const storedData = localStorage.getItem(HISTORY_STORAGE_KEY);
      let history: HistoricalSearch[] = [];

      // 安全地解析数据
      try {
        history = storedData ? JSON.parse(storedData) : [];
      } catch (parseError) {
        console.error('HistoryUtil: Error parsing history data:', parseError);
        return 0;
      }

      // 过滤掉要删除的项目
      const updatedHistory = history.filter(item => item.id !== id);

      // 保存回localStorage
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

      console.log(`HistoryUtil: Deleted item with ID ${id}, new count: ${updatedHistory.length}`);
      return updatedHistory.length;
    } catch (error) {
      console.error('HistoryUtil: Error deleting search history:', error);
      return 0;
    }
  },

  /**
   * 清空所有搜索历史
   * @returns 是否成功清空
   */
  clearAllHistory: (): boolean => {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      console.log('HistoryUtil: Cleared all history');
      return true;
    } catch (error) {
      console.error('HistoryUtil: Error clearing history:', error);
      return false;
    }
  }
};