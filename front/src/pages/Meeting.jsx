// 화상 회의 화면
// @ts-ignore
import React from 'react';
// @ts-ignore
import WebRTCComponent from '../components/webrtc/WebRTCComponents.tsx';
import '../styles/pages.css';

const Meeting = () => {
    return (
        <div className="page meeting-page">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">Meeting</span>
                </h1>
            </div>
            <div className="meeting-container">
                <WebRTCComponent roomId="test-room" />
            </div>
        </div>
    );
};

export default Meeting;