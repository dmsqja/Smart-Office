import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { getUserFileList, downloadFile, deleteFile } from '../../utils/gcsApi';
import FileListItem from './FileListItem';

const FileList = forwardRef((props, ref) => {
    const [files, setFiles] = useState([]);

    const fetchFiles = async () => {
        try {
            const response = await getUserFileList();
            console.log('Files response:', response.data);
            setFiles(response.data);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        }
    };

    // ref를 통해 외부에서 접근할 수 있는 메서드 정의
    useImperativeHandle(ref, () => ({
        fetchFiles
    }));

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDownload = async (fileName) => {
        try {
            const response = await downloadFile(fileName);

            // Blob으로 데이터를 받아서 처리
            const blob = await fetch(response.data.downloadUrl).then(r => r.blob());
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', response.data.originalFileName);
            document.body.appendChild(link);
            link.click();

            // 정리
            window.URL.revokeObjectURL(url);
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleDelete = async (fileName) => {
        try {
            await deleteFile(fileName);
            fetchFiles(); // 파일 삭제 후 목록 갱신
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    return (
        <table className="file-table">
            <thead>
            <tr>
                <th>파일명</th>
                <th>크기</th>
                <th>타입</th>
                <th>업로드 일자</th>
                <th>작업</th>
            </tr>
            </thead>
            <tbody>
            {files.map((file) => (
                <FileListItem
                    key={file.fileName}
                    file={file}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                />
            ))}
            {files.length === 0 && (
                <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                        업로드된 파일이 없습니다.
                    </td>
                </tr>
            )}
            </tbody>
        </table>
    );
});

// 컴포넌트 이름 지정 (디버깅을 위해)
FileList.displayName = 'FileList';

export default FileList;