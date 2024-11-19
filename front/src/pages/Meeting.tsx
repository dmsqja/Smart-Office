import React from 'react';
import WebRTCComponent from '../components/webrtc/WebRTCComponents';

const Meeting: React.FC = () => {
    const roomId = "default-room"; // 시연을 위해 default-room으로 설정

    return (
        <div className="page meeting-page">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">Meeting</span>
                </h1>
            </div>
            <div className="meeting-container">
                <WebRTCComponent roomId={roomId} />
            </div>
        </div>
    );
};

export default Meeting;