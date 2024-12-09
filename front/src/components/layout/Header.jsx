import { NavLink, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useFetch from '../../hooks/useFetch';
import '../../styles/layout.css';

const Header = ({ setIsMenuOpen }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [displayedResults, setDisplayedResults] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 5;

    const [notifications, setNotifications] = useState([
        // 알림이 있을 경우
        // { id: 1, message: "새로운 공지사항이 등록되었습니다.", date: "2024-12-09" }
    ]);

    // JSON 서버에서 데이터 가져오기
    const userData = useFetch('http://localhost:3001/user');

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

    // 검색 모달 토글
    const toggleSearchModal = () => {
        setShowSearchModal(!showSearchModal);
        if(!showSearchModal) {
            setSearchTerm('');
            setDisplayedResults([]);
        }
    };

    // EmployeeForm.jsx의 검색 로직
    const handleSearch = (e) => {
        e.preventDefault();
        if (!Array.isArray(userData)) return;

        let results = userData.filter(item => {
            return (
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.position.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        console.log(`검색어 "${searchTerm}"에 대한 검색 결과: ${results.length}건`);
        
        setSearchResults(results);
        setDisplayedResults(results.slice(0, itemsPerPage));
        setPage(1);
    };

    // loadMore 함수 수정
    const loadMore = useCallback(() => {
        if (isLoading || displayedResults.length >= searchResults.length) return;

        setIsLoading(true);

        setTimeout(() => {
            const nextIndex = page * itemsPerPage;
            const newResults = searchResults.slice(nextIndex, nextIndex + itemsPerPage);
            
            setDisplayedResults(prev => [...prev, ...newResults]);
            setPage(prev => prev + 1);
            setIsLoading(false);
        }, 1000);
    }, [page, searchResults, displayedResults.length, isLoading]);

    // 검색어 변경 시 검색 실행
    useEffect(() => {
        if (searchTerm) {
            handleSearch({ preventDefault: () => {} });
        }
    }, [searchTerm]);

    // 스크롤 이벤트 처리기 수정
    useEffect(() => {
        if (!searchTerm) return;

        const handleScroll = (e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            if (scrollHeight - (scrollTop + clientHeight) < 50 && !isLoading) {
                loadMore();
            }
        };

        const resultsElement = document.querySelector('.search-results');
        if (resultsElement) {
            resultsElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (resultsElement) {
                resultsElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, [searchTerm, loadMore, isLoading]);

    return(
        <header className="header">
            <div className="header-container">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="이름, 부서, 직급으로 직원 검색 (예: 홍길동, 인사팀, 과장)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    />
                    {searchTerm && (
                        <div className="search-modal">
                            <div className="search-modal-content">
                                <div className="search-results">
                                    {displayedResults.length > 0 ? (
                                        <>
                                            <ul className="results-list">
                                                {displayedResults.map((employee) => (
                                                    <li key={employee.id} className="result-item">
                                                        <div className="employee-info">
                                                            <strong>{employee.name}</strong>
                                                            <span>{employee.department} - {employee.position}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            {/* 로딩 UI를 리스트 아래로 이동 */}
                                            {isLoading && (
                                                <div className="search-loading">
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    <p>Loading more results...</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        searchTerm && <p className="no-results">검색 결과가 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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