// StatusGrid.jsx
import React from 'react';
import StatusCard from './StatusCard';
import '../../styles/home.css';

const StatusGrid = ({ stats }) => {
    const { attendanceStats, leaveStats, overtimeStats } = stats;
    
    return (
        <div className="status-grid-container">
            <StatusCard
                title={attendanceStats.title}
                stats={attendanceStats.stats}
            />
            <StatusCard
                title={leaveStats.title}
                stats={leaveStats.stats}
            />
            <StatusCard
                title={overtimeStats.title}
                stats={overtimeStats.stats}
            />
        </div>
    );
};

export default StatusGrid;