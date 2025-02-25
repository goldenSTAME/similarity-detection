import React, { useState } from "react";
import UploadZone from "../UploadZone/UploadZone";
import "./SelectImageWindow.css";
import { convertToBase64, uploadImage } from "../../Utils/ImageUtils.js";

function SelectImageWindow() {
  // 控制拖拽状态
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [base64Image, setBase64Image] = useState("");
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0]; // 获取拖拽的文件
    if (file) {
      await processFile(file);
    }
    // 处理文件
    console.log("文件拖拽放下：", e.dataTransfer.files);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0]; // 获取用户选择的文件
    if (file) {
      await processFile(file);
    }
    console.log("文件选择：", e.target.files);
  };

  // 处理文件转换为Base64
  const processFile = async (file) => {
    setSelectedFile(file); // 存储文件信息
    try {
      const base64 = await convertToBase64(file); // 转换为Base64
      setBase64Image(base64);
    } catch (error) {
      console.error("Base64转换失败:", error);
    }
  };

  // 处理上传
  const handleUpload = async () => {
    if (!base64Image) {
      alert("请先选择或拖拽图片！");
      return;
    }
    const result = await uploadImage(base64Image);
    alert(result.message);
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
        />

        {/* 显示文件信息 */}
        {selectedFile && <p>已选择文件: {selectedFile.name}</p>}
        {base64Image && <img src={base64Image} alt="预览" width="200" />}

        {/* 上传按钮 */}
        <button onClick={handleUpload}>上传</button>
      </div>
  );
}

export default SelectImageWindow;