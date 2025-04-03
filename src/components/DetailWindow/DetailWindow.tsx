import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DetailWindow.css";

interface ImageDetail {
    id: string;
    original_image_base64: string;
    processed_image_base64: string;
    image_url: string;
}

const DetailWindow: React.FC = () => {
    const { imageId } = useParams<{ imageId: string }>();
    const [imageDetail, setImageDetail] = useState<ImageDetail | null>(null);

    useEffect(() => {
        const fetchImageDetail = async () => {
            try {
                const response = await fetch(`http://localhost:5001/image_details/${imageId}`);
                const data = await response.json();
                setImageDetail(data);
            } catch (error) {
                console.error("Error fetching image details:", error);
            }
        };

        if (imageId) {
            fetchImageDetail();
        }
    }, [imageId]);

    if (!imageDetail) {
        return <p className="loading">加载中...</p>;
    }

    return (
        <div className="detail-window">
            <h2>图片详情</h2>
            <div className="image-section">
                <div className="image-container">
                    <h3>切割前原图</h3>
                    <img
                        src={`data:image/png;base64,${imageDetail.original_image_base64}`}
                        alt="Original"
                        className="original-image"
                    />
                </div>
                <div className="image-container">
                    <h3>处理后图片</h3>
                    <img
                        src={`data:image/png;base64,${imageDetail.processed_image_base64}`}
                        alt="Processed"
                        className="processed-image"
                    />
                </div>
            </div>
            <div className="image-info">
                <p><strong>ID:</strong> {imageDetail.id}</p>
                <p><strong>图片 URL:</strong> <a href={imageDetail.image_url} target="_blank" rel="noopener noreferrer">{imageDetail.image_url}</a></p>
            </div>
        </div>
    );
};

export default DetailWindow;
