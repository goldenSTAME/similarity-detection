import React, { useEffect, useState } from 'react';
import './SimilarImagesGallery.css';

interface ImageData {
  id: string;
  similarity: number;
  processed_image_base64: string;
}

interface SimilarImagesGalleryProps {
  images: ImageData[];
}

const SimilarImagesGallery: React.FC<SimilarImagesGalleryProps> = ({ images }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (images.length === 0) return null;

  return (
    <div className={`similar-images-gallery ${isVisible ? 'visible' : ''}`}>
      <div className="gallery-scroll-container">
        {images.map((imageData, index) => (
          <div key={index} className="image-card">
            <div className="image-container">
              <img 
                src={`data:image/png;base64,${imageData.processed_image_base64}`} 
                alt={imageData.id} 
                className="similar-image"
              />
            </div>
            <div className="image-info">
              <h4>ID: {imageData.id}</h4>
              <h5>相似度: {imageData.similarity.toFixed(4)}</h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarImagesGallery;