import { NavLink, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState } from 'react';
import axios from 'axios';
import '../../styles/layout.css';

const Header = ({ setIsMenuOpen }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        // 알림이 있을 경우
        // { id: 1, message: "새로운 공지사항이 등록되었습니다.", date: "2024-12-09" }
    ]);

    const handleLogout = async () => {
        try {
            const response = await axios.post('/logout', {}, {
                withCredentials: true // 쿠키 포함
            });

            if (response.status === 200) {
                // 세션스토리지에서 사용자 정보 제거
                sessionStorage.removeItem('userInfo');
                navigate('/');
            }
        } catch (error) {
            console.error('Logout failed:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    }

    return(
        <header className="header">
            <div className="header-container">
                <NavLink to="/home" className="brand">
                    <span className="brand-text">Dashboard</span>
                </NavLink>
                <div className="header-right">
                    <div className="notification-wrapper">
                        <button className="notification-btn" onClick={toggleNotifications}>
                            <i className="fas fa-bell"></i>
                            {notifications.length > 0 && <span className="notification-badge"></span>}
                        </button>

                        {showNotifications && (
                            <div className="notification-modal">
                                <div className="notification-header">
                                    <h3>알림</h3>
                                    <button className="close-btn" onClick={toggleNotifications}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <div className="notification-content">
                                    {notifications.length > 0 ? (
                                        <ul className="notification-list">
                                            {notifications.map(notification => (
                                                <li key={notification.id} className="notification-item">
                                                    <p>{notification.message}</p>
                                                    <span className="notification-date">
                                                        {notification.date}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="no-notifications">
                                            <p>새로운 알림이 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>로그아웃</span>
                    </button>
                    <button
                        className="menu-toggle"
                        onClick={() => setIsMenuOpen(prev => !prev)}
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    setIsMenuOpen: PropTypes.func.isRequired
}

export default Header;