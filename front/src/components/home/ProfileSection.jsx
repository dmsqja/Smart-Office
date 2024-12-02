import React from 'react';
import '../../styles/home.css';

const ProfileSection = ({ user }) => {
    return (
        <div className="welcome-info">
            <div className="profile-container" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div className="profile-image-wrapper" style={{ width: '120px', height: '120px', marginBottom: 'var(--spacing-3)' }}>
                    <img src={user.profileImage} alt="profile" className="profile-image" />
                </div>
                <div className="user-info">
                    <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-2)' }}>
                        <span className="gradient-text">{user.name}</span>님
                    </h1>
                    <p className="position-text">{user.team}</p>
                    <p className="position-text">{user.position}</p>
                </div>
                <button className="notification-button" style={{ marginTop: 'var(--spacing-3)' }}>
                    <i className="fas fa-bell"></i>
                </button>
            </div>
        </div>
    );
};

export default ProfileSection;