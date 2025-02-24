import React, { useState } from 'react';
import './DetailWindow.css';

function DetailWindow() {
    const [imageId, setImageId] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [features, setFeatures] = useState('');
    const [response, setResponse] = useState('');

    const apiBaseUrl = 'http://localhost:5001/image_features';

    const handleCreate = async () => {
        const res = await fetch(apiBaseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_id: imageId, image_path: imagePath, features })
        });
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
    };

    const handleRead = async () => {
        const res = await fetch(`${apiBaseUrl}/${imageId}`);
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
    };

    const handleUpdate = async () => {
        console.log("imagePath:", imagePath);
        console.log("features:", features);

        // const bodyData = {};
        //
        // // 判断 imagePath 是否有值，如果有就加入请求数据
        // if (imagePath) {
        //     bodyData.new_path = imagePath;
        // }
        //
        // // 判断 features 是否有值，如果有就加入请求数据
        // if (features) {
        //     bodyData.new_features = features;
        // }


        const res = await fetch(`${apiBaseUrl}/${imageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_path: imagePath, new_features: features }) // 发送动态生成的bodyData
        });
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
    };

    const handleDelete = async () => {
        const res = await fetch(`${apiBaseUrl}/${imageId}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
    };

    return (
        <div className="detail-window">
            <h2>Image Features CRUD</h2>
            <input type="text" placeholder="Image ID" value={imageId} onChange={e => setImageId(e.target.value)} />
            <input type="text" placeholder="Image Path" value={imagePath} onChange={e => setImagePath(e.target.value)} />
            <input type="text" placeholder="Features" value={features} onChange={e => setFeatures(e.target.value)} />
            <button onClick={handleCreate}>Create</button>
            <button onClick={handleRead}>Read</button>
            <button onClick={handleUpdate}>Update</button>
            <button onClick={handleDelete}>Delete</button>
            <pre>{response}</pre>
        </div>
    );
}

export default DetailWindow;
