import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { uploadFile } from '../../utils/gcsApi';

const FileUpload = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            const response = await uploadFile(selectedFile);
            onUploadSuccess(response.data);
            setUploadProgress(0);
            setSelectedFile(null);
            setPreviewUrl(null);
            setError('');
        } catch (error) {
            console.error('Upload failed:', error);
            setError('파일 업로드에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        setError('');
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // 파일 크기 체크
            if (file.size > 10 * 1024 * 1024) {
                setError('파일 크기가 10MB를 초과합니다.');
                return;
            }

            setSelectedFile(file);
            setError('');

            // 이미지 파일인 경우 미리보기 생성
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/pdf': ['.pdf']
        },
        multiple: false
    });

    return (
        <div>
            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={`upload-dropzone ${isDragActive ? 'active' : ''}`}
                >
                    <input {...getInputProps()} />
                    <Upload size={48} className="upload-icon" />
                    <h3>
                        {isDragActive ?
                            '파일을 여기에 놓으세요' :
                            '파일을 드래그하거나 클릭하여 선택'
                        }
                    </h3>
                    <p className="upload-hint">
                        지원 형식: JPG, PNG, PDF (최대 10MB)
                    </p>
                </div>
            ) : (
                <div className="selected-file">
                    {previewUrl && (
                        <div className="file-preview">
                            <img
                                src={previewUrl}
                                alt="파일 미리보기"
                                className="preview-image"
                            />
                        </div>
                    )}
                    <div className="file-info">
                        <span className="file-name">{selectedFile.name}</span>
                        <span className="file-size">({formatFileSize(selectedFile.size)})</span>
                    </div>
                    <div className="file-actions">
                        <button onClick={handleUpload} className="upload-btn">
                            업로드
                        </button>
                        <button onClick={handleCancel} className="cancel-btn">
                            취소
                        </button>
                    </div>
                </div>
            )}
            {error && <div className="error-message">{error}</div>}
            {uploadProgress > 0 && (
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export default FileUpload;