import React from "react";
import { motion } from "framer-motion";
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
    <motion.div
      className={`upload-zone ${dragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      initial={{
        scale: 1,
        boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
        borderColor: "#ccc",
      }}
      animate={{
        scale: dragOver ? 1.05 : 1,
        boxShadow: dragOver
          ? "0px 4px 12px rgba(0, 0, 0, 0.2)"
          : "0px 0px 0px rgba(0, 0, 0, 0)",
        borderColor: dragOver ? "#007bff" : "#ccc",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.2,
      }}
    >
      {uploadedImage ? (
        <motion.img
          src={uploadedImage}
          alt="Uploaded preview"
          className="uploaded-image"
          initial={{ opacity: 0 }}
          animate={{ opacity: dragOver ? 0 : 1 }}  // 根据 dragOver 状态控制透明度
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      ) : (
        <>
          <p>{dragOver ? "Drop it here!" : "Select a file or drag and drop here"}</p>
          <p>JPG/JPEG only, file size no more than 10MB</p>
        </>
      )}
      <label htmlFor="fileInput" className="select-file-btn">
        {uploadedImage ? "Change Image" : "Select Image"}
      </label>
      <input
        id="fileInput"
        type="file"
        accept="image/jpeg"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </motion.div>
  );
}

export default UploadZone;
