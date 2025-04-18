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
export const HISTORY_STORAGE_KEY = "image_search_history";

// 分页配置
export const HISTORY_PAGE_SIZE = 5; // 每页显示5条记录
// 不再限制最大页数
// export const MAX_HISTORY_PAGES = 6; // 最多6页

// 历史记录管理工具
export const HistoryUtil = {
  /**
   * 保存搜索历史
   * @param historyItem 要保存的历史记录项
   * @returns 保存后的历史记录数量
   */
  saveSearch: (historyItem: HistoricalSearch): number => {
    try {
      console.log("开始保存历史记录:", historyItem.imageName);

      // 获取现有历史
      const existingData = localStorage.getItem(HISTORY_STORAGE_KEY);
      let historyData: HistoricalSearch[] = [];

      // 安全地解析现有数据
      try {
        historyData = existingData ? JSON.parse(existingData) : [];
        console.log("读取到现有历史记录数量:", historyData.length);

        // 确保historyData是数组
        if (!Array.isArray(historyData)) {
          console.error("History data is not an array, resetting");
          historyData = [];
        }
      } catch (parseError) {
        console.error("Error parsing history data:", parseError);
        historyData = [];
      }

      // 简化history item以减少存储量 - 保留缩略图但压缩搜索结果
      const simplifiedItem = {
        ...historyItem,
        // 最多保留3个高相似度结果，并限制base64长度
        searchResults: historyItem.searchResults
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 3)
          .map((result) => ({
            id: result.id,
            similarity: result.similarity,
            // 保留前1000个字符的base64数据
            processed_image_base64: result.processed_image_base64.substring(
              0,
              1000
            ),
          })),
      };

      // 检查是否已存在相同ID的记录
      const existingIndex = historyData.findIndex(
        (item) => item.id === simplifiedItem.id
      );

      if (existingIndex !== -1) {
        // 更新现有记录
        historyData[existingIndex] = simplifiedItem;
        console.log(`Updated existing history item at index ${existingIndex}`);
      } else {
        // 添加新记录
        historyData.push(simplifiedItem);
        console.log(
          `Added new history item "${simplifiedItem.imageName}", new length: ${historyData.length}`
        );
      }

      // 按时间戳排序（最新的在前）
      historyData.sort((a, b) => b.timestamp - a.timestamp);

      // 移除对总记录数的限制，保存所有历史记录
      // 不再需要这一行: historyData = historyData.slice(0, maxItems);

      try {
        // 保存回localStorage
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyData));
        console.log(
          `HistoryUtil: 成功保存 ${
            historyData.length
          } 条记录到 localStorage (约占用 ${Math.round(
            JSON.stringify(historyData).length / 1024
          )} KB)`
        );

        // 验证已保存的数据
        const verifyData = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (verifyData) {
          const parsedVerify = JSON.parse(verifyData);
          console.log(
            `验证: localStorage现在包含 ${parsedVerify.length} 条记录`
          );
        }
      } catch (storageError) {
        // 存储容量超出时的处理
        console.error(
          "Storage quota exceeded, will try to reduce data size",
          storageError
        );

        // 如果存储失败，尝试仅保留较新的记录
        const reductionFactor = 0.8; // 每次减少20%
        const newLimit = Math.floor(historyData.length * reductionFactor);
        historyData = historyData.slice(0, newLimit || 10); // 确保至少保留10条

        try {
          localStorage.setItem(
            HISTORY_STORAGE_KEY,
            JSON.stringify(historyData)
          );
          console.log(`由于存储配额问题，减少到${historyData.length}条记录`);
        } catch (secondError) {
          // 如果还是失败，只保留最新的10条
          historyData = historyData.slice(0, 10);
          localStorage.setItem(
            HISTORY_STORAGE_KEY,
            JSON.stringify(historyData)
          );
          console.log("第二次存储尝试也失败，已减少到10条记录");
        }
      }

      return historyData.length;
    } catch (error) {
      console.error("HistoryUtil: Error saving search history:", error);
      return 0;
    }
  },

  /**
   * 获取所有搜索历史
   * @returns 所有历史记录项
   */
  getAllSearches: (): HistoricalSearch[] => {
    try {
      console.log("开始获取所有历史记录");
      const storedData = localStorage.getItem(HISTORY_STORAGE_KEY);
      let history: HistoricalSearch[] = [];

      // 安全地解析数据
      try {
        history = storedData ? JSON.parse(storedData) : [];
        console.log(`从localStorage解析出${history.length}条历史记录`);

        // 确保history是数组
        if (!Array.isArray(history)) {
          console.error(
            "HistoryUtil: History data is not an array, returning empty array"
          );
          return [];
        }
      } catch (parseError) {
        console.error("HistoryUtil: Error parsing history data:", parseError);
        return [];
      }

      // 再次按时间戳排序，确保顺序正确
      history.sort((a, b) => b.timestamp - a.timestamp);

      console.log(
        `HistoryUtil: 返回 ${
          history.length
        } 条历史记录, 每页记录数: ${HISTORY_PAGE_SIZE}, 总页数: ${Math.ceil(
          history.length / HISTORY_PAGE_SIZE
        )}`
      );

      return history;
    } catch (error) {
      console.error("HistoryUtil: Error getting search history:", error);
      return [];
    }
  },

  /**
   * 获取分页的搜索历史
   * @param page 页码（从1开始）
   * @returns 当前页的历史记录项
   */
  getSearchesByPage: (
    page: number = 1
  ): {
    items: HistoricalSearch[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  } => {
    try {
      // 获取所有历史记录
      const allHistory = HistoryUtil.getAllSearches();
      const totalItems = allHistory.length;

      // 计算总页数
      const totalPages = Math.ceil(totalItems / HISTORY_PAGE_SIZE) || 1;

      // 验证页码在有效范围内
      const validPage = Math.max(1, Math.min(page, totalPages));

      // 计算当前页的数据
      const startIndex = (validPage - 1) * HISTORY_PAGE_SIZE;
      const endIndex = Math.min(startIndex + HISTORY_PAGE_SIZE, totalItems);
      const pageItems = allHistory.slice(startIndex, endIndex);

      console.log(
        `获取第${validPage}页数据, 共${totalPages}页, ${totalItems}条记录`
      );

      return {
        items: pageItems,
        totalItems,
        totalPages,
        currentPage: validPage,
      };
    } catch (error) {
      console.error("HistoryUtil: Error getting paged search history:", error);
      return { items: [], totalItems: 0, totalPages: 0, currentPage: 1 };
    }
  },

  /**
   * 删除指定ID的搜索历史
   * @param id 要删除的历史记录ID
   * @returns 删除后的历史记录数量
   */
  deleteSearch: (id: string): number => {
    try {
      console.log(`开始删除历史记录: ${id}`);
      // 获取现有历史
      const storedData = localStorage.getItem(HISTORY_STORAGE_KEY);
      let history: HistoricalSearch[] = [];

      // 安全地解析数据
      try {
        history = storedData ? JSON.parse(storedData) : [];
        console.log(`删除前有${history.length}条记录`);
      } catch (parseError) {
        console.error("HistoryUtil: Error parsing history data:", parseError);
        return 0;
      }

      // 过滤掉要删除的项目
      const updatedHistory = history.filter((item) => item.id !== id);

      // 保存回localStorage
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

      console.log(
        `HistoryUtil: Deleted item with ID ${id}, new count: ${updatedHistory.length}`
      );
      return updatedHistory.length;
    } catch (error) {
      console.error("HistoryUtil: Error deleting search history:", error);
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
      console.log("HistoryUtil: Cleared all history");
      return true;
    } catch (error) {
      console.error("HistoryUtil: Error clearing history:", error);
      return false;
    }
  },
};
