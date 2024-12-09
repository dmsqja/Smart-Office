import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';

const OCRUpload = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState('');

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.size > 10 * 1024 * 1024) {
                setError('파일 크기가 10MB를 초과합니다.');
                return;
            }
            setSelectedFile(file);
            setError('');

            // 이미지 파일인 경우에만 미리보기 생성
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result);
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                setPreviewUrl(null); // PDF는 미리보기 없음
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/gif': ['.gif'],
            'application/pdf': ['.pdf']
        },
        multiple: false
    });

    const handleUpload = async () => {
        if (!selectedFile) return;
        try {
            // OCR 처리 로직 구현 예정
            onUploadSuccess && onUploadSuccess(selectedFile);
            setSelectedFile(null);
            setPreviewUrl(null);
            setError('');
        } catch (error) {
            console.error('OCR Upload failed:', error);
            setError('이미지 업로드에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError('');
    };

    return (
        <div className="w-full">
            {!selectedFile ? (
                <div
                    {...getRootProps()}
                    className={`upload-dropzone ${isDragActive ? 'active' : ''}`}
                >
                    <input {...getInputProps()} />
                    <ImageIcon size={48} className="upload-icon" />
                    <h3 className="text-lg font-semibold mb-2">
                        {isDragActive ? '파일을 여기에 놓으세요' : '이미지나 PDF를 드래그하거나 클릭하여 선택'}
                    </h3>
                    <p className="upload-hint">
                        지원 형식: JPG, PNG, GIF, PDF<br />최대 10MB
                    </p>
                </div>
            ) : (
                <div className="selected-file">
                    {previewUrl && (
                        <div className="file-preview">
                            <img
                                src={previewUrl}
                                alt="OCR 이미지 미리보기"
                                className="preview-image"
                            />
                        </div>
                    )}
                    <div className="file-info">
                        <span className="file-name">선택된 파일:</span>
                        <span>{selectedFile.name}</span>
                        <span className="file-size">({formatFileSize(selectedFile.size)})</span>
                    </div>
                    <div className="file-actions">
                        <button onClick={handleUpload} className="upload-btn">
                            OCR 시작
                        </button>
                        <button onClick={handleCancel} className="cancel-btn">
                            취소
                        </button>
                    </div>
                </div>
            )}
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default OCRUpload;