import React from "react";
import "./UploadZone.css";

function UploadZone({
  dragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
    uploadedImage,
}) {
  return (
    <div
      className={`upload-zone ${dragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {uploadedImage ? (
          // 如果有图片，显示预览
          <img src={uploadedImage} alt="Uploaded preview" className="uploaded-image" />
      ) : (
          // 否则显示默认提示文本
          <>
            <p>Select a file or drag and drop here</p>
            <p>JPG, PNG, file size no more than 10MB</p>
          </>
      )}

      {/* 选择文件按钮 */}
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