// components/layout/Sidebar.js
import { NavLink } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { BoardAPI } from '../../utils/boardApi';
import '../../styles/layout.css';

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
    const [boards, setBoards] = useState([]);
    const [isBoardOpen, setIsBoardOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const menuItems = [
        { path: "/home", label: "Home", icon: "fas fa-home" },
        { path: "/calendar", label: "Calendar", icon: "fas fa-calendar" },
        { path: "/messenger", label: "Messenger", icon: "fas fa-comment" },
        { path: "/file", label: "File", icon: "fas fa-file" },
        { path: "/meeting", label: "Meeting", icon: "fas fa-video" },
        { path: "/map", label: "Map", icon: "fas fa-map-marked-alt" }
    ];

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                setIsLoading(true);
                const response = await BoardAPI.getAllBoards();
                setBoards(response.data);
            } catch (error) {
                console.error('게시판 목록을 불러오는데 실패했습니다:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isBoardOpen) {
            fetchBoards();
        }
    }, [isBoardOpen]);

    const toggleBoardMenu = () => {
        setIsBoardOpen(!isBoardOpen);
    };

    return (
        <>
            <aside className={`sidebar ${isMenuOpen ? 'show' : ''}`}>
                <div className="sidebar-header">
                    <NavLink to="/home" className="brand">
                        <span className="brand-text">Dashboard</span>
                    </NavLink>
                </div>
                <nav className="nav-menu">
                    <ul className="nav-list">
                        {menuItems.map((item) => (
                            <li key={item.path} className="nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    end={item.path === '/'}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <i className={item.icon}></i>
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                        {/* 게시판 메뉴 추가 */}
                        <li className="nav-item">
                            <div
                                className={`nav-link board-toggle ${isBoardOpen ? 'active' : ''}`}
                                onClick={toggleBoardMenu}
                            >
                                <i className="fas fa-list"></i>
                                <span>게시판</span>
                                <i className={`fas fa-chevron-${isBoardOpen ? 'up' : 'down'} board-arrow`}></i>
                            </div>
                            <ul className={`board-submenu ${isBoardOpen ? 'open' : ''}`}>
                                {isLoading ? (
                                    <li className="board-submenu-item loading">
                                        <i className="fas fa-spinner fa-spin"></i>
                                    </li>
                                ) : (
                                    boards.map((board) => (
                                        <li key={board.id} className="board-submenu-item">
                                            <NavLink
                                                to={`/boards/${board.id}`}
                                                className={({ isActive }) => `board-link ${isActive ? 'active' : ''}`}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <span>{board.name}</span>
                                            </NavLink>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </li>
                    </ul>
                </nav>
            </aside>
            <div
                className={`sidebar-overlay ${isMenuOpen ? 'show' : ''}`}
                onClick={() => setIsMenuOpen(false)}
            />
        </>
    );
};

Sidebar.propTypes = {
    isMenuOpen: PropTypes.bool.isRequired,
    setIsMenuOpen: PropTypes.func.isRequired
};

export default Sidebar;