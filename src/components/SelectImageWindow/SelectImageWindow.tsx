import React, { useState, useRef } from 'react';
import { ImageUtils } from '../../Utils/ImageUtils';
import './SelectImageWindow.css';
import UploadZone from "../UploadZone/UploadZone";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SimilarImagesGallery from "./SimilarityImagesComponent";

// 定义图片数据接口
interface ImageData {
  id: string;
  similarity: number;
  processed_image_base64: string;
}

// 底部操作区域组件
interface ActionSectionProps {
  isLoading: boolean;
  handleCancel: () => void;
  handleSearch: () => void;
}

const ActionSection: React.FC<ActionSectionProps> = ({ isLoading, handleCancel, handleSearch }) => {
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
            {isLoading ? 'Searching...' : 'Search'}
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

  // AbortController 引用
  const abortControllerRef = useRef<AbortController | null>(null);

  // 处理拖拽进入事件
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  // 处理拖拽离开事件
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  // 处理拖拽释放文件事件
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  // 处理文件选择事件
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateFile(file)) return;
      await processFile(file);
    }
  };

  // 文件处理函数：转换为 Base64 并设置预览
  const processFile = async (file: File) => {
    if (!validateFile(file)) return;
    setImage(file);
    try {
      const base64 = await ImageUtils.fileToBase64(file);
      console.log("Base64 preview image:", base64.substring(0, 50) + "...");
      setImagePreview(base64);
    } catch (error) {
      console.error("File conversion failed:", error);
      toast.error("File conversion failed, please try again!");
    }
  };

  // 处理搜索动作：使用 AbortController 支持取消请求
  const handleSearch = async () => {
    if (!image) {
      toast.warn("Please select an image first!");
      return;
    }

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setSimilarImages([]);
    setSearched(false);

    try {
      const base64Image = await ImageUtils.fileToBase64(image);
      console.log('Starting image search...');

      // 传递 AbortSignal 到 uploadImage 方法
      const results = await ImageUtils.uploadImage(base64Image, numResults, signal);

      // 如果请求成功完成
      setSimilarImages(results);
      setSearched(true);
      toast.success("Search completed successfully!");
    } catch (error: any) {
      // 处理各种错误情况
      if (error.message === '请求已取消') {
        toast.info("Search cancelled");
      } else {
        console.error("Image search failed:", error);
        toast.error("Search failed: " + (error.message || "Unknown error"));
        setSearched(true);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // 处理取消搜索动作：使用 AbortController 取消请求
  const handleCancel = () => {
    if (!isLoading || !abortControllerRef.current) return;

    // 取消网络请求
    abortControllerRef.current.abort();

    // UI 状态更新会在请求的 catch 块中处理
  };

  // 校验文件类型（仅支持 JPG/JPEG）
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

          {/* 显示搜索结果 */}
          {similarImages.length > 0 && (
              <SimilarImagesGallery images={similarImages} />
          )}

          {/* 搜索后无结果提示 */}
          {searched && similarImages.length === 0 && (
              <p className="no-results-message">No similar images found.</p>
          )}
        </div>

        {/* 底部操作区域组件 */}
        <ActionSection
            isLoading={isLoading}
            handleCancel={handleCancel}
            handleSearch={handleSearch}
        />

        <ToastContainer />
      </div>
  );
}

export default SelectImageWindow;