import React, { useState } from "react";
import UploadZone from "../UploadZone/UploadZone";
import "./SelectImageWindow.css";

function SelectImageWindow() {
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
    // 处理文件
    console.log("文件拖拽放下：", e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    console.log("文件选择：", e.target.files);
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
      {/* 你可以在这里添加其它布局或提示内容 */}
    </div>
  );
}

export default SelectImageWindow;