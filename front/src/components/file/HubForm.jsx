import React, { useRef } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';

const HubForm = () => {
    // FileList 컴포넌트에 대한 ref 생성
    const fileListRef = useRef(null);

    const handleUploadSuccess = () => {
        // ref를 통해 FileList 컴포넌트의 fetchFiles 메서드 호출
        if (fileListRef.current) {
            fileListRef.current.fetchFiles();
        }
    };

    return (
        <div className="hub-form">
            <div className="upload-section">
                <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>
            <div className="file-section">
                <FileList ref={fileListRef} />
            </div>
        </div>
    );
};

export default HubForm;