// src/components/DetailWindow/Delete.js
import React, { useState } from 'react';
import './Delete.css';

function Delete({ onResponse }) {
    const [imageId, setImageId] = useState('');

    const apiBaseUrl = 'http://localhost:5001/image_features';

    const handleDelete = async () => {
        const res = await fetch(`${apiBaseUrl}/${imageId}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        onResponse(data); // 将返回的 response 传递到父组件
    };

    return (
        <div className="delete">
            <input type="text" placeholder="Image ID" value={imageId} onChange={e => setImageId(e.target.value)} />
            <button onClick={handleDelete}>Delete</button>
        </div>
    );
}

export default Delete;
