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

// 底部操作区域组件，包含分割线和操作按钮（Search 与 Cancel）
// 注意：Cancel 功能目前采用前端模拟取消逻辑，后续后端更新后可删除部分前端取消代码
interface ActionSectionProps {
  isLoading: boolean;
  handleCancel: () => void;
  handleSearch: () => void;
}

const ActionSection: React.FC<ActionSectionProps> = ({ isLoading, handleCancel, handleSearch }) => {
  return (
    <div className="action-section">
      {/* 分割线：用于分隔搜索结果与操作区域 */}
      <hr className="divider" />
      <div className="action-buttons">
        {/* Cancel 文本控件：搜索进行时可点击，否则禁用 */}
        <span
          className={`cancel-text ${isLoading ? 'active' : 'disabled'}`}
          onClick={isLoading ? handleCancel : undefined}
        >
          Cancel
        </span>
        {/* Search 按钮：搜索进行中显示 Searching... 并禁用按钮 */}
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

  // 使用 useRef 保存取消标记
  // TODO: 如果后端更新后实现真实取消接口，请删除前端 cancelRequestRef 相关代码
  const cancelRequestRef = useRef(false);

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
      console.log("Base64 preview image:", base64);
      setImagePreview(base64);
    } catch (error) {
      console.error("File conversion failed:", error);
      toast.error("File conversion failed, please try again!");
    }
  };

  // 处理搜索动作：增加取消标记判断，如果在搜索过程中点击 Cancel，则不更新搜索结果
  const handleSearch = async () => {
    if (!image) {
      toast.warn("Please select an image first!");
      return;
    }
    // 每次搜索前重置取消标记
    cancelRequestRef.current = false;
    setIsLoading(true);
    try {
      const base64Image = await ImageUtils.fileToBase64(image);
      // TODO: 当后端实现取消请求后，删除下面这段取消检查代码
      if (cancelRequestRef.current) return;
      console.log('Uploaded image Base64:', base64Image);
      const results: ImageData[] = await ImageUtils.uploadImage(base64Image, numResults);
      // TODO: 当后端实现取消请求后，删除下面这段取消检查代码
      if (cancelRequestRef.current) return;
      setSimilarImages(results);
      setSearched(true);
    } catch (error) {
      // 若未取消，处理错误
      if (!cancelRequestRef.current) {
        console.error("Image upload failed:", error);
        setSimilarImages([]);
        setSearched(true);
        toast.error("Image upload failed!");
      }
    } finally {
      if (!cancelRequestRef.current) {
        setIsLoading(false);
      }
    }
  };

  // 处理取消搜索动作：设置取消标记并清空正在加载状态
  const handleCancel = () => {
    if (!isLoading) return;
    // 设置取消标记，前端模拟取消请求（后端实现后请移除此逻辑）
    cancelRequestRef.current = true;
    setIsLoading(false);
    // 根据需求决定是否清空已显示的搜索结果
    setSimilarImages([]);
    setSearched(false);
    toast.info("Search cancelled");
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

      {/* 底部操作区域组件：分割线与按钮组合在一起 */}
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
