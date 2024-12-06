// StatusCard.jsx
import React from 'react';
import '../../styles/home.css';

const StatusCard = ({ title, stats }) => {
    return (
        <div className="status-card p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3">{title}</h3>
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-item">
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusCard;