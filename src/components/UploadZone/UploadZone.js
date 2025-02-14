import React from "react";
import "./UploadZone.css";

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