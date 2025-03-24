import React, { useState } from 'react';
import { ImageUtils } from '../../Utils/ImageUtils';
import './SelectImageWindow.css';
import UploadZone from "../UploadZone/UploadZone";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ImageData {
  id: string;
  similarity: number;
  processed_image_base64: string;
}

function SelectImageWindow() {
  const [image, setImage] = useState<File | null>(null);
  const [similarImages, setSimilarImages] = useState<ImageData[]>([]);
  const [numResults, setNumResults] = useState<number>(5);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateFile(file)) return;
      await processFile(file);
    }
  };

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

  const handleSearch = async () => {
    if (!image) {
      toast.warn("Please select an image first!");
      return;
    }
    setIsLoading(true);
    try {
      const base64Image = await ImageUtils.fileToBase64(image);
      console.log('Uploaded image Base64:', base64Image);
      const results: ImageData[] = await ImageUtils.uploadImage(base64Image, numResults);
      setSimilarImages(results);
      setSearched(true);
    } catch (error) {
      console.error("Image upload failed:", error);
      setSimilarImages([]);
      setSearched(true);
      toast.error("Image upload failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG/JPEG format is supported!");
      return false;
    }
    return true;
  };

  return (
      <div
          className="select-image-window"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ border: dragOver ? '2px dashed #000' : '2px solid transparent' }}
      >
        <h2>Select Image</h2>
        <UploadZone
            dragOver={dragOver}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleFileChange={handleFileChange}
            uploadedImage={imagePreview} // 传递Base64预览
        />
        {/*{imagePreview && (*/}
        {/*    <div>*/}
        {/*      <h3>Preview:</h3>*/}
        {/*      <img src={imagePreview} alt="Selected" style={{ maxWidth: '200px' }} />*/}
        {/*    </div>*/}
        {/*)}*/}
        <button
            onClick={handleSearch}
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        <div className="similar-images">
          {!searched ? (
              <p>Please upload and search an image.</p>
          ) : similarImages.length > 0 ? (
              similarImages.map((imageData, index) => (
                  <div key={index} className="image-item">
                    <h4>ID: {imageData.id}</h4>
                    <h5>相似度: {imageData.similarity.toFixed(4)}</h5>
                    <img src={`data:image/png;base64,${imageData.processed_image_base64}`} alt={imageData.id} />
                  </div>
              ))
          ) : (
              <p>No similar images found.</p>
          )}
        </div>
        <ToastContainer />
      </div>
  );
}

export default SelectImageWindow;