// Meeting.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import WebRTCComponent from '../components/meeting/WebRTCComponent';  //
import '../styles/pages.css';

const Meeting = () => {
    const { roomId } = useParams();  // URL 파라미터에서 roomId 가져오기

    return (
        <div className="page meeting-page">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">Meeting</span>
                </h1>
            </div>
            <div className="meeting-container">
                <WebRTCComponent roomId={roomId || 'test-room'} />
            </div>
        </div>
    );
};

export default Meeting;