// src/components/DetailWindow/Create.js
import React, { useState } from 'react';
import './Create.css';

function Create({ onResponse }) {
    const [imageId, setImageId] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [features, setFeatures] = useState('');

    const apiBaseUrl = 'http://localhost:5001/image_features';

    const handleCreate = async () => {
        const res = await fetch(apiBaseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_id: imageId, image_path: imagePath, features })
        });
        const data = await res.json();
        onResponse(data); // 将返回的 response 传递到父组件
    };

    return (
        <div className="create">
            <input type="text" placeholder="Image ID" value={imageId} onChange={e => setImageId(e.target.value)} />
            <input type="text" placeholder="Image Path" value={imagePath} onChange={e => setImagePath(e.target.value)} />
            <input type="text" placeholder="Features" value={features} onChange={e => setFeatures(e.target.value)} />
            <button onClick={handleCreate}>Create</button>
        </div>
    );
}

export default Create;
