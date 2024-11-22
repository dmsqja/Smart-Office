import { NavLink } from "react-router-dom";
import '../../styles/layout.css';

const BottomNav = () => {
    const menuItems = [
        { path: "/", label: "Home", icon: "fas fa-home" },
        { path: "/projects", label: "Projects", icon: "fas fa-folder-open" },
        { path: "/messenger", label: "Messages", icon: "fas fa-comment" },
        { path: "/calendar", label: "Calendar", icon: "fas fa-calendar" },
        { path: "/profile", label: "Profile", icon: "fas fa-user" }
    ];

    return (
        <nav className="bottom-nav">
            <ul className="nav-list">
                {menuItems.map((item) => (
                    <li key={item.path} className="nav-item">
                        <NavLink
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            end={item.path === '/'}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default BottomNav;