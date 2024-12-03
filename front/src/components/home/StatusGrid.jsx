// StatusGrid.jsx
import React from 'react';
import StatusCard from './StatusCard';
import '../../styles/home.css';

const StatusGrid = ({ stats }) => {
    const { attendanceStats, leaveStats, overtimeStats } = stats;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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