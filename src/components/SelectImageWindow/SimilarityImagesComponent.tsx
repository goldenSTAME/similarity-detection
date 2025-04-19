import React, { useEffect, useState } from 'react';
import './SimilarImagesGallery.css';
import { useNavigate } from "react-router-dom";

interface ImageData {
  id: string;
  similarity: number;
  processed_image_base64: string;
}

interface SimilarImagesGalleryProps {
  images: ImageData[];
  onImageClick?: (imageId: string) => void; // Optional click handler
}

const SimilarImagesGallery: React.FC<SimilarImagesGalleryProps> = ({ images, onImageClick }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleImageClick = (imageId: string) => {
    // Use the provided click handler, or fall back to default navigation
    if (onImageClick) {
      onImageClick(imageId);
    } else {
      navigate(`/details/${imageId}`);
    }
  };

  if (images.length === 0) return null;

  return (
    <div className={`similar-images-gallery ${isVisible ? 'visible' : ''}`}>
      <div className="gallery-scroll-container">
        {images.map((imageData, index) => (
          <div
            key={index}
            className="image-card"
            onClick={() => handleImageClick(imageData.id)}
          >
            <div className="image-container">
              <img
                src={`data:image/png;base64,${imageData.processed_image_base64}`}
                alt={imageData.id}
                className="similar-image"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjExMCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+";
                }}
              />
            </div>
            <div className="image-info">
              <h4>ID: {imageData.id}</h4>
              <h5>Similarity: {(imageData.similarity * 100).toFixed(2)}%</h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarImagesGallery;