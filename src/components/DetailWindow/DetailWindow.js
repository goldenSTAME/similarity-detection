// src/components/DetailWindow/DetailWindow.js
import React, { useState } from 'react';
import Create from '../../Utils/Create/Create';
import Read from '../../Utils/Read/Read';
import Update from '../../Utils/Update/Update';
import Delete from '../../Utils/Delete/Delete';
import Response from '../../Utils/Response/Response';
import './DetailWindow.css';

function DetailWindow() {
    const [responseData, setResponseData] = useState(null);

    const handleResponse = (data) => {
        setResponseData(data); // 保存返回数据
    };

    return (
        <div className="detail-window">
            <h2>Image Features CRUD</h2>
            <Create onResponse={handleResponse} />
            <Read onResponse={handleResponse} />
            <Update onResponse={handleResponse} />
            <Delete onResponse={handleResponse} />
            {responseData && <Response data={responseData} />}
        </div>
    );
}

export default DetailWindow;
