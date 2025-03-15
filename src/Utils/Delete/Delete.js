import React, { useState } from 'react';
import Response from '../Response/Response'; // 引入 Response 组件
import './Delete.css';

function Delete() {
    const [imageId, setImageId] = useState('');
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const apiBaseUrl = 'http://localhost:5001/image_features';

    const handleDelete = async () => {
        if (!imageId.trim()) {
            alert("Image ID!");
            return;
        }

        try {
            const res = await fetch(`${apiBaseUrl}/${imageId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error(`Delete Failed: ${res.status}`);
            }

            const data = await res.json();
            setResponse(data);
            setError(null); // 清除错误信息
        } catch (err) {
            setError(err.message);
            setResponse(null);
        }
    };

    return (
        <div className="delete">
            <input
                type="text"
                placeholder="Image ID"
                value={imageId}
                onChange={e => setImageId(e.target.value)}
            />
            <button onClick={handleDelete}>Delete</button>

            {/* 使用 Response 组件来显示返回数据 */}
            {response && <Response data={response} />}

            {/* 显示错误消息 */}
            {error && <p className="error-message">Error: {error}</p>}

            {/* 添加右下角 Tips */}
            <span className="tips">Tips: The purpose of this component is to delete images from a data set with a specific ID</span>
        </div>
    );
}

export default Delete;
