import React from 'react';
import WebRTCComponent from '../components/webrtc/WebRTCComponents';

const WebRTCPage: React.FC = () => {
    const roomId = "default-room"; // 시연을 위해 default-room으로 설정

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Video Chat Room</h1>
                    <WebRTCComponent roomId={roomId} />
                </div>
            </div>
        </div>
    );
};

export default WebRTCPage;