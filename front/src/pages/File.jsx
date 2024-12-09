import React from 'react';
import UploadForm from '../components/file/UploadForm';
import '../styles/filePage.css';

const File = () => {
    return (
        <div className="min-h-screen">
            <div className="border-b border-gray-200">
                <div className="px-4 py-4">
                    <h1 className="text-xl font-semibold text-gray-900">Hub</h1>
                </div>
            </div>
            <UploadForm />
        </div>
    );
};

export default File;