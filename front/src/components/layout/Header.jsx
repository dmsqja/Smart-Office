import { NavLink, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../styles/layout.css';

const Header = ({ setIsMenuOpen }) => {
    const navigate = useNavigate();

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

    return(
        <header className="header">
            <div className="header-container">
                <NavLink to="/home" className="brand">
                    <span className="brand-text">Dashboard</span>
                </NavLink>
                <div className="header-right">
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