// src/components/DetailWindow/Update.js
import React, { useState } from 'react';
import './Update.css';

function Update({ onResponse }) {
    const [imageId, setImageId] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [features, setFeatures] = useState('');

    const apiBaseUrl = 'http://localhost:5001/image_features';

    const handleUpdate = async () => {
        const res = await fetch(`${apiBaseUrl}/${imageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_path: imagePath, new_features: features })
        });
        const data = await res.json();
        onResponse(data); // 将返回的 response 传递到父组件
    };

    return (
        <div className="update">
            <input type="text" placeholder="Image ID" value={imageId} onChange={e => setImageId(e.target.value)} />
            <input type="text" placeholder="New Image Path" value={imagePath} onChange={e => setImagePath(e.target.value)} />
            <input type="text" placeholder="New Features" value={features} onChange={e => setFeatures(e.target.value)} />
            <button onClick={handleUpdate}>Update</button>
        </div>
    );
}

export default Update;
