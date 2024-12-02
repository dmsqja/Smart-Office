import React from 'react';
import '../../styles/home.css';

const ActivityCard = ({ activities }) => {
  return (
    <div className="activity-card">
      <h2 className="card-title">최근 활동</h2>
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <span className="activity-text">{activity.title}</span>
            <span className="activity-time">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityCard;