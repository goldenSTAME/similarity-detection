// src/components/DetailWindow/Read.js
import React, { useState } from 'react';
import ProcessBase64 from '../ProcessBase64';
import './Read.css';
import Response from "../Response/Response";


function Read() {
    const [imageId, setImageId] = useState('');
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);



    const apiBaseUrl = 'http://localhost:5001/image_features';

    const handleRead = async () => {
        if (!imageId.trim()) {
            alert("Image ID!");
            return;
        }

        try {
            const res = await fetch(`${apiBaseUrl}/${imageId}`);
            if (!res.ok) {
                throw new Error(`Request Failed: ${res.status}`);
            }
            const data = await res.json();
            setResponse(data);
            setError(null); // 清空错误信息
        } catch (err) {
            setError(err.message);
            setResponse(null);
        }
        // const response1 = await fetch('/mockBase64_1.txt');
        // const base64Data1 = await response1.text();  // 获取文件内容（base64编码的字符串）
        // const response2 = await fetch('/mockBase64_2.txt');
        // const base64Data2 = await response2.text();  // 获取文件内容（base64编码的字符串）

        // 模拟的JSON数据
        // const mockResponse = {
        //     results: [
        //         {
        //             id: "img_001",
        //             processed_image_base64: base64Data1
        //         },
        //         {
        //             id: "img_002",
        //             processed_image_base64: base64Data2
        //         }
        //     ]
        // };
        // setResponse(data); // 将获取的响应数据设置到状态中
        // setResponse(mockResponse); // 将获取的模拟响应数据设置到状态中
    };

    return (
        <div className="read">
            <input type="text" placeholder="Image ID" value={imageId} onChange={e => setImageId(e.target.value)} />
            <button onClick={handleRead}>Read</button>

            {error && <p className="error">Error: {error}</p>}

            {/* 将获取到的响应数据传递给 ProcessBase64 组件 */}
            {response && <ProcessBase64 response={response} />}

            {/* 显示 JSON 响应数据 */}
            {response && <Response data={response} />}

            {/* 添加右下角 Tips */}
            <span className="tips">Tips: The purpose of this component is to query images with a specified ID, path, or feature</span>
        </div>
    );
}

export default Read;
