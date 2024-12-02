import React from 'react';
import profileImage from '../../assets/profile1.png';
import '../../styles/home.css';

const Main = () => {
    const user = {
        name: "이은범",
        position: "프론트엔드 개발자",
        team: "5팀(취업시켜조)",
        tasks: 5,
        messages: 3,
        meetings: 2,
        profileImage: profileImage
    };

    return (
        <section className="dashboard-content container">
            {/* 유저 환영 섹션 */}
            <div className="welcome-section">
                <div className="welcome-header">
                    <div className="welcome-info">
                        <div className="profile-container">
                            <div className="profile-image-wrapper">
                                <img 
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="profile-image"
                                />
                            </div>
                            <div className="user-info">
                                <h1>안녕하세요, <span className="gradient-text">{user.name}</span>님</h1>
                                <p className="position-text">{user.team} · {user.position}</p>
                            </div>
                        </div>
                    </div>
                    <button className="notification-button">
                        <i className="fas fa-bell"></i>
                    </button>
                </div>
            </div>

            {/* 상태 카드 */}
            <div className="status-grid">
                <div className="status-card">
                    <div className="status-content">
                        <i className="fas fa-tasks text-primary"></i>
                        <div className="status-info">
                            <h3>할 일</h3>
                            <p className="text-primary">{user.tasks}개</p>
                        </div>
                    </div>
                </div>
                <div className="status-card">
                    <div className="status-content">
                        <i className="fas fa-envelope text-success"></i>
                        <div className="status-info">
                            <h3>새 메시지</h3>
                            <p className="text-success">{user.messages}개</p>
                        </div>
                    </div>
                </div>
                <div className="status-card">
                    <div className="status-content">
                        <i className="fas fa-video text-secondary"></i>
                        <div className="status-info">
                            <h3>오늘 회의</h3>
                            <p className="text-secondary">{user.meetings}개</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Main;