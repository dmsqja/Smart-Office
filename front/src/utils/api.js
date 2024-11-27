// utils/api.js
const API_BASE_URL = '/api';

// 기본 HTTP 헤더 설정
const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-User-Id': localStorage.getItem('userId') || 'temp-user-id', // 실제 구현시 사용자 인증 시스템에 맞게 수정
};

// 에러 처리 함수
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }
    return response.json();
};

export const api = {
    // 회의실 목록 조회
    getRooms: async () => {
        const response = await fetch(`${API_BASE_URL}/rooms`, {
            headers: defaultHeaders,
        });
        return handleResponse(response);
    },

    // 회의실 생성
    createRoom: async (data) => {
        const response = await fetch(`${API_BASE_URL}/rooms`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // 회의실 참여
    joinRoom: async (roomId, data) => {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // 회의실 나가기
    leaveRoom: async (roomId) => {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/leave`, {
            method: 'POST',
            headers: defaultHeaders,
        });
        return handleResponse(response);
    },

    // 회의실 종료 (방장만 가능)
    closeRoom: async (roomId) => {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/close`, {
            method: 'POST',
            headers: defaultHeaders,
        });
        return handleResponse(response);
    },

    // 회의실 상세 정보 조회
    getRoomDetails: async (roomId) => {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
            headers: defaultHeaders,
        });
        return handleResponse(response);
    }
};