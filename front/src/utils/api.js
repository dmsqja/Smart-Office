// utils/api.js
import axios from 'axios';

const API_BASE_URL = '/api';

// axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
    config => {
        const sessionUserInfo = sessionStorage.getItem('userInfo');
        let userId;

        if (sessionUserInfo) {
            try {
                const parsedUserInfo = JSON.parse(sessionUserInfo);
                userId = parsedUserInfo.employeeId;
                console.log('Found userId in sessionStorage:', userId);
            } catch (e) {
                console.error('Failed to parse sessionStorage userInfo:', e);
            }
        }

        // 헤더에 userId 설정
        config.headers['X-User-Id'] = userId || 'anonymous';
        console.log('Setting X-User-Id header:', config.headers['X-User-Id']);

        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response.data;
    },
    error => {
        console.error('Response Error:', error.response || error);
        const message = error.response?.data?.message ||
            error.message ||
            'API request failed';
        throw new Error(message);
    }
);


export const api = {
    // 회의실 목록 조회
    async getRooms() {
        try {
            return await axiosInstance.get('/rooms');
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            throw error;
        }
    },

    // 회의실 생성
    async createRoom(roomData) {
        try {
            console.log('Creating room with data:', roomData);
            const response = await axiosInstance.post('/rooms', {
                roomName: roomData.roomName,
                description: roomData.description,
                maxParticipants: roomData.maxParticipants,
                password: roomData.password
            });
            console.log('Room created:', response);
            return response;
        } catch (error) {
            console.error('Failed to create room:', error);
            throw error;
        }
    },

    // 회의실 참여
    async joinRoom(roomId, joinData) {
        try {
            console.log('Joining room:', { roomId, joinData });
            const sessionUserInfo = sessionStorage.getItem('userInfo');
            let employeeId = null;

            if (sessionUserInfo) {
                const parsedUserInfo = JSON.parse(sessionUserInfo);
                employeeId = parsedUserInfo.employeeId;
                console.log('Using session storage employeeId:', employeeId);
            }

            if (!employeeId) {
                console.error('No employeeId found in sessionStorage');
                throw new Error('로그인이 필요한 서비스입니다.');
            }

            const response = await axiosInstance.post(`/rooms/${roomId}/join`, {
                roomId: roomId,
                employeeId: employeeId,
                password: joinData?.password
            });

            console.log('Join room response:', response);
            return response;
        } catch (error) {
            console.error('Failed to join room:', error);
            throw error;
        }
    },

    // 회의실 나가기
    async leaveRoom(roomId) {
        try {
            return await axiosInstance.post(`/rooms/${roomId}/leave`);
        } catch (error) {
            console.error('Failed to leave room:', error);
            throw error;
        }
    },

    // 회의실 종료 (방장만 가능)
    async closeRoom(roomId) {
        try {
            return await axiosInstance.post(`/rooms/${roomId}/close`);
        } catch (error) {
            console.error('Failed to close room:', error);
            throw error;
        }
    },

    // 회의실 상세 정보 조회
    async getRoomDetails(roomId) {
        try {
            return await axiosInstance.get(`/rooms/${roomId}`);
        } catch (error) {
            console.error('Failed to get room details:', error);
            throw error;
        }
    },

    // 회의실 접근 권한 확인
    async verifyRoomAccess(roomId) {
        try {
            const response = await axiosInstance.get(`/rooms/${roomId}/access`);
            return {
                hasAccess: response.hasAccess,
                message: response.message
            };
        } catch (error) {
            console.error('Failed to verify room access:', error);
            throw error;
        }
    },
    // 채팅 메시지 조회
    async getChatMessages(roomId, page = 0, size = 50) {
        try {
            return await axiosInstance.get(`/meetings/chat/rooms/${roomId}/messages`, {
                params: { page, size }
            });
        } catch (error) {
            console.error('Failed to fetch chat messages:', error);
            throw error;
        }
    },

    // 채팅 메시지 삭제
    async deleteChatMessage(messageId) {
        try {
            return await axiosInstance.delete(`/meetings/chat/messages/${messageId}`);
        } catch (error) {
            console.error('Failed to delete chat message:', error);
            throw error;
        }
    }


};