import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import UploadZone from "./components/UploadZone";
import "./App.css";

function App() {
  // 1. 主题状态：true 表示暗色模式，false 表示浅色模式
  const [isDark, setIsDark] = useState(false);

  // 2. 拖拽悬浮状态
  const [dragOver, setDragOver] = useState(false);

  // 3. 存储上传的文件
  const [uploadedFile, setUploadedFile] = useState(null);

  // 切换主题
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // 拖拽进入
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  // 拖拽离开
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  // 文件放下
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      console.log("Dropped file:", file.name);
      // TODO: 在这里可调用后端进行图像分割或其他操作
    }
  };

  // “SELECT FILE” 按钮选择文件
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      console.log("Selected file:", file.name);
      // TODO: 在这里可调用后端进行图像分割或其他操作
    }
  };

  // “Detect” 按钮
  const handleDetect = () => {
    if (!uploadedFile) {
      alert("No file selected!");
      return;
    }
    // TODO: 调用后端或执行图像分割/相似度检测逻辑
    console.log("Detecting with file:", uploadedFile.name);
  };

  // “Cancel” 按钮
  const handleCancel = () => {
    setUploadedFile(null);
  };

  return (
    <div className={`app-container ${isDark ? "dark" : "light"}`}>
      {/* 左侧侧边栏 */}
      <Sidebar isDark={isDark} toggleTheme={toggleTheme} />

      {/* 右侧主内容 */}
      <main className="main-content">
        <h2 className="main-title">Please verify your identity</h2>
        <p className="main-subtitle">
          Select relevant documents to complete your kyc
        </p>

        <UploadZone
          dragOver={dragOver}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleFileChange={handleFileChange}
        />

        {/* 底部按钮行 */}
        <div className="action-row">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="detect-btn" onClick={handleDetect}>
            Detect
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;