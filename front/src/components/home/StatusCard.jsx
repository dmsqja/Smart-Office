import React from 'react';
import '../../styles/home.css';

const StatusCard = ({ icon, title, count, colorClass }) => {
    return (
        <div className="status-card">
            <div className="status-content">
                <i className={`fas ${icon} ${colorClass}`}></i>
                <div className="status-info">
                    <h3>{title}</h3>
                    <p className={colorClass}>{count}개</p>
                </div>
            </div>
        </div>
    );
};

export default StatusCard;