import React from 'react';
import StatusCard from './StatusCard';
import '../../styles/home.css';

const StatusGrid = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <StatusCard
                icon="fa-tasks"
                title="할 일"
                count={stats.tasks}
                colorClass="text-primary"
            />
            <StatusCard
                icon="fa-envelope"
                title="새 메시지"
                count={stats.messages}
                colorClass="text-success"
            />
            <StatusCard
                icon="fa-video"
                title="오늘 회의"
                count={stats.meetings}
                colorClass="text-secondary"
            />
        </div>
    );
};

export default StatusGrid;