// src/components/DetailWindow/Create.js
import React, { useState } from 'react';
import './Create.css';
import Response from '../Response/Response'; // 引入 Response 组件

function Create() {
    const [imageId, setImageId] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [features, setFeatures] = useState('');
    const [response, setResponse] = useState(null); // 存储 API 返回的数据

    const apiBaseUrl = 'http://localhost:5001/image_features';

    const handleCreate = async () => {
        const res = await fetch(apiBaseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_id: imageId, image_path: imagePath, features })
        });
        const data = await res.json();
        setResponse(data); // 存储 response 以传递给 Response 组件
    };

    return (
        <div className="create">
            <input type="text" placeholder="Image ID" value={imageId} onChange={e => setImageId(e.target.value)} />
            <input type="text" placeholder="Image Path" value={imagePath} onChange={e => setImagePath(e.target.value)} />
            <input type="text" placeholder="Features" value={features} onChange={e => setFeatures(e.target.value)} />
            <button onClick={handleCreate}>Create</button>

            {/* 只有当 response 存在时，才渲染 Response 组件 */}
            {response && <Response data={response} />}

            {/* 添加右下角 Tips */}
            <span className="tips">Tips: The purpose of this component is to establish the path and ID for the newly entered dataset image</span>
        </div>
    );
}

export default Create;
