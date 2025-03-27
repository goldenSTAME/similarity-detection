import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import pleaseWaitAnimation from '../../animations/pleasewait.json';
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
    <motion.div
      className="action-section"
      layout
      transition={{ duration: 0.3 }}
    >
      <motion.hr
        className="divider"
        layout
        transition={{ duration: 0.3 }}
      />
      <div className="action-buttons">
        <motion.span
          key="cancel"
          className={`cancel-text ${isLoading ? 'active' : 'disabled'}`}
          onClick={isLoading ? handleCancel : undefined}
          layout
          transition={{ duration: 0.3 }}
          whileHover={{ scale: isLoading ? 1.05 : 1 }}
        >
          Cancel
        </motion.span>
        <motion.button
          key="search"
          onClick={handleSearch}
          disabled={isLoading}
          className={isLoading ? 'loading' : ''}
          layout
          transition={{ duration: 0.3 }}
          whileHover={{ scale: !isLoading ? 1.05 : 1 }}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </motion.button>
      </div>
    </motion.div>
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

  // 用于自动滚动的引用
  const contentRef = useRef<HTMLDivElement>(null);
  const animationContainerRef = useRef<HTMLDivElement>(null);

  // 使用 useRef 保存取消标记
  // TODO: 如果后端更新后实现真实取消接口，请删除前端 cancelRequestRef 相关代码
  const cancelRequestRef = useRef(false);

  // 根据 isLoading 状态自动滚动
  useEffect(() => {
    if (isLoading && animationContainerRef.current) {
      // 搜索时自动滚动到动画区域
      animationContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!isLoading && contentRef.current) {
      // 搜索完成或取消后，自动滚动到内容顶部
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isLoading]);

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

        {/* 根据 isLoading 状态决定是否固定动画容器高度 */}
        <div ref={animationContainerRef} className={`animation-container ${isLoading ? 'fixed-height' : ''}`}>
          {/* Lottie加载动画，采用绝对定位包装 */}
          <AnimatePresence mode={"wait"}>
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* 显示搜索结果 */}
          <AnimatePresence mode={"wait"}>
            {!isLoading && similarImages.length > 0 && (
              <motion.div
                key="results"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SimilarImagesGallery images={similarImages} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 搜索后无结果提示 */}
          <AnimatePresence mode={"wait"}>
            {!isLoading && searched && similarImages.length === 0 && (
              <motion.p
                key="noResults"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="no-results-message"
              >
                No similar images found.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
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
