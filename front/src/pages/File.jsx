import React from 'react';
import HubForm from '../components/file/HubForm';
import '../styles/filePage.css';

const File = () => {
    return (
        <div className="page hub-page">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">Hub</span>
                </h1>
            </div>
            <div className="hub-container">
                <HubForm />
            </div>
        </div>
    );
};

export default File;