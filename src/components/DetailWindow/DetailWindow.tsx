import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DetailWindow.css";

interface ImageData {
    imageId: string;
    imageUrl: string;
    originalImageId: string;
    originalImageUrl: string;
}

const DetailWindow: React.FC = () => {
    const { imageId } = useParams<{ imageId: string }>();
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);

    useEffect(() => {
        if (imageId) {
            // 模拟从后端获取数据
            const fetchedData: ImageData = {
                imageId: imageId,
                imageUrl: `https://example.com/images/${imageId}.jpg`, // Replace with the actual image URL
                originalImageId: `original-${imageId}`,
                originalImageUrl: `https://example.com/originals/original-${imageId}.jpg`, // Replace with the original image URL
            };
            setImageData(fetchedData);
        } else {
            setImageData(null);
        }
    }, [imageId]);

    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(false);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("已复制：" + text);
    };

    const toggleImagePreview = () => {
        setShowFullImage((prev) => !prev);
    };

    return (
        <div className="detail-window">
            <h2 className="detail-title">图片详情</h2>

            <div className="image-section">
                {imageData ? (
                    <>
                        <div className="image-container">
                            <div
                                className="image-box"
                                onClick={toggleImagePreview}
                            >
                                {!imageLoaded && !imageError && (
                                    <div className="placeholder">Image is loading...</div>
                                )}
                                {imageError && (
                                    <div className="placeholder">Image Loading Failed</div>
                                )}
                                {!imageError && imageLoaded && (
                                    <img
                                        src={imageData.imageUrl}
                                        alt="Loaded Image"
                                        className={showFullImage ? "zoomed" : ""}
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="info-row">
                            <span>图片 ID: {imageData.imageId}</span>
                            <button onClick={() => handleCopy(imageData.imageId)}>复制</button>
                        </div>

                        <div className="image-container">
                            <div
                                className="image-box"
                                onClick={toggleImagePreview}
                            >
                                {!imageLoaded && !imageError && (
                                    <div className="placeholder">Original Image is loading...</div>
                                )}
                                {imageError && (
                                    <div className="placeholder">Original Image Loading Failed</div>
                                )}
                                {!imageError && imageLoaded && (
                                    <img
                                        src={imageData.originalImageUrl}
                                        alt="Loaded Image"
                                        className={showFullImage ? "zoomed" : ""}
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                    />
                                )}
                            </div>
                        </div>
                        {/*<div className="image-container">*/}
                        {/*    <div className="image-box">*/}
                        {/*        <img*/}
                        {/*            src={imageData.originalImageUrl}*/}
                        {/*            alt="Original Image"*/}
                        {/*            className={showFullImage ? "zoomed" : ""}*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        <div className="info-row">
                            <span>原图 ID: {imageData.originalImageId}</span>
                            <button onClick={() => handleCopy(imageData.originalImageId)}>
                                复制
                            </button>
                        </div>

                        <div className="info-row">
                            <span>原图 URL: {imageData.originalImageUrl}</span>
                            <button onClick={() => handleCopy(imageData.originalImageUrl)}>
                                复制
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="placeholder">
                        <p>请从历史记录或相似图片中选择一张图片查看详情。</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailWindow;
