// src/components/DetailWindow/ProcessBase64.js
import React from 'react';

function ProcessBase64({ response }) {
    if (!response || !response.results) {
        return <div>暂无图片数据。</div>;
    }

    return (
        <div className="image-gallery">
            {response.results.map((item) => (
                <div key={item.id} className="image-container">
                    <h3>{item.id}</h3>
                    <img src={item.processed_image_base64} alt={`Processed image ${item.id}`} />
                </div>
            ))}
        </div>
    );
}

export default ProcessBase64;
