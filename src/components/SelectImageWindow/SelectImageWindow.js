import React, { useState } from 'react';
import { ImageUtils } from '../../Utils/ImageUtils';
import './SelectImageWindow.css';
import UploadZone from "../UploadZone/UploadZone";

function SelectImageWindow() {
  const [image, setImage] = useState(null); // 当前选择的图像
  const [similarImages, setSimilarImages] = useState([]); // 存储相似图像结果
  const [numResults, setNumResults] = useState(5); // 默认显示 5 张相似图像
  const [imagePreview, setImagePreview] = useState(null); // 用于网页中显示图像
  const [searched, setSearched] = useState(false); // 判断是否搜索过
  // 控制拖拽状态
  const [dragOver, setDragOver] = useState(false);

  // 处理拖拽进入
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  // 处理拖拽离开
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  // 处理拖拽释放
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0]; // 获取拖拽的文件
    if (file) {
      await processFile(file); // 调用 processFile 处理文件
    }
    // 处理文件
    console.log("File dropped:", e.dataTransfer.files);
  };

  // 处理文件选择
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateFile(file)) return; // 验证文件格式
      await processFile(file); // 处理文件
    }
  };

  // 处理文件（拖拽和选择共用）
  const processFile = async (file) => {
    if (!validateFile(file)) return;

    setImage(file); // 保存文件对象
    try {
      const base64 = await ImageUtils.fileToBase64(file); // 调用 ImageUtils 转换 Base64
      console.log("Base64 preview image:", base64); // 添加日志查看
      setImagePreview(base64); // 更新预览
    } catch (error) {
      console.error("File conversion failed:", error);
      alert("File conversion failed, please try again!");
    }
  };

  // 上传并显示相似图像
  const handleSearch = async () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }
    try {
      const base64Image = await ImageUtils.fileToBase64(image); // 将图片转换为 Base64
      console.log('Uploaded image Base64:', base64Image);

      // 向后端发送请求，获取相似图像
      const results = await ImageUtils.uploadImage(base64Image, numResults);
      setSimilarImages(results); // 更新相似图像结果
      setSearched(true); // 标记为已搜索
    } catch (error) {
      console.error("Image upload failed:", error);
      setSimilarImages([]); // 清空结果
      setSearched(true); // 即使失败，也标记为已搜索
    }
  };

  // 文件验证（只支持 JPG/JPEG）
  const validateFile = (file) => {
    const validTypes = ["image/jpeg"]; // 只支持 JPG/JPEG
    if (!validTypes.includes(file.type)) {
      alert("Only JPG/JPEG format is supported!");
      return false;
    }
    return true;
  };

  return (
    <div className="select-image-window">
      <h2>Select Image</h2>
      <UploadZone
        dragOver={dragOver}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        handleFileChange={handleFileChange}
        uploadedImage={imagePreview} // 传递Base64预览
      />

      <button onClick={handleSearch}>Search</button>

      <div className="similar-images">
        {!searched ? (
          // 如果没有开始搜索，则什么都不显示
          <p>Please upload and search an image.</p>
        ) : similarImages.length > 0 ? (
          // 如果有返回的图像，展示ID，相似度和图片
          similarImages.map((imageData, index) => (
            <div key={index} className="image-item">
              <h4>ID: {imageData.id}</h4>
              <h5>相似度: {imageData.similarity.toFixed(4)}</h5>
              <img src={`data:image/png;base64,${imageData.processed_image_base64}`} alt={imageData.id} />
            </div>
          ))
        ) : (
          // 如果没有返回图像，显示提示
          <p>No similar images found.</p>
        )}
      </div>
    </div>
  );
}

export default SelectImageWindow;
