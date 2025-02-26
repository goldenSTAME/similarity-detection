import React, { useState } from 'react';
import { ImageUtils } from '../../Utils/ImageUtils';
import './SelectImageWindow.css';
import UploadZone from "../UploadZone/UploadZone";

function SelectImageWindow() {
  const [image, setImage] = useState(null); // 当前选择的图像
  const [similarImages, setSimilarImages] = useState([]); // 存储相似图像结果
  const [numResults, setNumResults] = useState(5); // 默认显示 5 张相似图像
const [imagePreview, setImagePreview] = useState(null); // 用于网页中显示图像
const [searched, setSearched] = useState(false); //判断是否搜索过
  // 控制拖拽状态
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0]; // 获取拖拽的文件
    if (file) {
      setImage(file);
    }
    // 处理文件
    console.log("文件拖拽放下：", e.dataTransfer.files);
  };
  // 处理文件选择
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file);
    }
  };

  // 处理文件
  const processFile = async (file) => {
    setImage(file);
    try {
      const base64 = await ImageUtils.fileToBase64(file); // 调用 ImageUtils 转换 Base64
      console.log("Base64 预览图:", base64); // 添加日志查看
      setImagePreview(base64); // 更新预览
    } catch (error) {
      console.error("文件转换失败:", error);
    }
  };

  // 上传并显示相似图像
  const handleSearch = async () => {
    if (!image) {
      alert("请先选择一张图片！");
      return;
    }
    try {
      const base64Image = await ImageUtils.fileToBase64(image); // 将图片转换为 Base64
      console.log('上传的图片Base64:', base64Image);

      // 向后端发送请求，获取相似图像
      const results = await ImageUtils.uploadImage(base64Image, numResults);
      setSimilarImages(results); // 更新相似图像结果
      setSearched(true); // 标记为已搜索
    } catch (error) {
      console.error("图片上传失败:", error);
      setSearched(true); // 即使失败，标记为已搜索
    }
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
              <p>请先上传并搜索图像。</p>
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
              <p>没有找到相似图像。</p>
          )}
        </div>
      </div>
  );
}

export default SelectImageWindow;
