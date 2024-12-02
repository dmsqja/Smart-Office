import React from 'react';
import ProfileSection from './ProfileSection';
import StatusGrid from './StatusGrid';
import CalendarForm from '../calendar/CalendarForm';
import ActivityCard from './ActivityCard';
import profileimage from '../../assets/profile1.png';
import '../../styles/home.css';

const Main = () => {
    const user = {
      name: "이은범",
      position: "프론트엔드 개발자",
      team: "5팀(취업시켜조)",
      tasks: 5,
      messages: 3,
      meetings: 2,
      profileImage: profileimage
    };
  
    const activities = [
      { title: '새로운 프로젝트 할당', time: '1시간 전' },
      { title: '팀 미팅 스케줄 변경', time: '3시간 전' },
      { title: '문서 업데이트', time: '어제' }
    ];
  
    return (
      <div className="dashboard-content container">
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 'var(--spacing-4)' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <div className="status-card">
                    <ProfileSection user={user} />
                </div>
                <div className="mini-calendar-card">
                    <h2 className="card-title">일정</h2>
                    <div style={{ height: '400px' }}>
                        <CalendarForm height="100%" minimode={true} />
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <StatusGrid stats={user} />
                <ActivityCard activities={activities} />
            </div>
        </div>
      </div>
    );
};

export default Main;