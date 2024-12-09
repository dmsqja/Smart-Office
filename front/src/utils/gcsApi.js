import axios from 'axios';

const getUserId = () => {
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) {
        const { employeeId } = JSON.parse(userInfo);
        return employeeId;
    }
    return null;
};

const gcsApi = axios.create({
    baseURL: '/api/gcs',
    headers: {
        'X-User-Id': getUserId() // 세션스토리지의 userInfo에서 employeeId 가져오기
    }
});

// 요청 인터셉터 추가 - 매 요청마다 최신 userId 가져오기
gcsApi.interceptors.request.use((config) => {
    config.headers['X-User-Id'] = getUserId();
    return config;
});

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return gcsApi.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            return percentCompleted;
        }
    });
};

export const getFileList = () => gcsApi.get('/list');
export const downloadFile = (fileName) => gcsApi.get(`/download/${fileName}`);
export const deleteFile = (fileName) => gcsApi.delete(`/${fileName}`);

export const getUserFileList = () => {
    const userId = getUserId();
    return gcsApi.get(`/user/${userId}`);
};