// src/components/DetailWindow/Response.js
import React from 'react';
import './Response.css'

function Response({ data }) {
    return (
        <div className="response">
            <h3>Response:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}

export default Response;
