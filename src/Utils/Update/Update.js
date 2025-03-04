// src/components/DetailWindow/Update.js
import React, { useState } from 'react';
import './Update.css';
import Response from '../Response/Response'; // 引入 Response 组件

function Update() {
    const [imageId, setImageId] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [features, setFeatures] = useState('');
    const [response, setResponse] = useState(null); // 存储 API 返回的数据

    const apiBaseUrl = 'http://localhost:5001/image_features';

    const handleUpdate = async () => {
        const res = await fetch(`${apiBaseUrl}/${imageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_path: imagePath, new_features: features })
        });
        const data = await res.json();
        setResponse(data); // 存储 response 以传递给 Response 组件
    };

    return (
        <div className="update">
            <input type="text" placeholder="Image ID" value={imageId} onChange={e => setImageId(e.target.value)} />
            <input type="text" placeholder="New Image Path" value={imagePath} onChange={e => setImagePath(e.target.value)} />
            <input type="text" placeholder="New Features" value={features} onChange={e => setFeatures(e.target.value)} />
            <button onClick={handleUpdate}>Update</button>

            {/* 只有当 response 存在时，才渲染 Response 组件 */}
            {response && <Response data={response} />}

            {/* 添加右下角 Tips */}
            <span className="tips">Tips: The purpose of this component is to update the ID and path of a dataset image (must be updated at the same time)</span>
        </div>
    );
}

export default Update;
