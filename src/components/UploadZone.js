import React from "react";

/**
 * 上传区域组件：可拖拽或点击选择文件
 * @param {boolean} dragOver - 是否处于拖拽悬浮状态
 * @param {Function} handleDragOver - 拖拽进入回调
 * @param {Function} handleDragLeave - 拖拽离开回调
 * @param {Function} handleDrop - 文件放下回调
 * @param {Function} handleFileChange - 选择文件回调
 */
function UploadZone({
  dragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange
}) {
  return (
    <div
      className={`upload-zone ${dragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p>Select a file or drag and drop here</p>
      <p>JPG, PNG, file size no more than 10MB</p>
      <label htmlFor="fileInput" className="select-file-btn">
        SELECT FILE
      </label>
      <input
        id="fileInput"
        type="file"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default UploadZone;