// src/components/DetailWindow/Read.js
import React, { useState } from 'react';
import ProcessBase64 from '../ProcessBase64';
import './Read.css';


function Read() {
    const [imageId, setImageId] = useState('');
    const [response, setResponse] = useState(null);



    const apiBaseUrl = 'http://localhost:5001/image_features';

    const handleRead = async () => {
        // const res = await fetch(`${apiBaseUrl}/${imageId}`);
        // const data = await res.json();
        const response1 = await fetch('/mockBase64_1.txt');
        const base64Data1 = await response1.text();  // 获取文件内容（base64编码的字符串）
        const response2 = await fetch('/mockBase64_2.txt');
        const base64Data2 = await response2.text();  // 获取文件内容（base64编码的字符串）

        // 模拟的JSON数据
        const mockResponse = {
            results: [
                {
                    id: "img_001",
                    processed_image_base64: base64Data1
                },
                {
                    id: "img_002",
                    processed_image_base64: base64Data2
                }
            ]
        };
        // setResponse(data); // 将获取的响应数据设置到状态中
        setResponse(mockResponse); // 将获取的模拟响应数据设置到状态中
    };

    return (
        <div className="read">
            <input type="text" placeholder="输入图片 ID" value={imageId} onChange={e => setImageId(e.target.value)} />
            <button onClick={handleRead}>读取</button>

            {/* 将获取到的响应数据传递给 ProcessBase64 组件 */}
            {response && <ProcessBase64 response={response} />}
        </div>
    );
}

export default Read;
