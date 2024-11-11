import { NavLink } from "react-router-dom";
import '../../styles/layout.css';

const Header = () => {
    return(
        <header className="header">
            <div className="header-container">
                <NavLink to="/" className="brand">
                    <span className="brand-text">Start Bootstrap</span>
                </NavLink>

                <nav className="nav">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <NavLink
                             to="/"
                             className={({ isActive }) =>
                              isActive ? 'nav-link active' : 'nav-link'
                             }
                            >
                                Home
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                             to="/resume"
                             className={({ isActive }) =>
                              isActive ? 'nav-link active' : 'nav-link'
                             }
                            >
                                Resume
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                             to="/projects"
                             className={({ isActive }) =>
                              isActive ? 'nav-link active' : 'nav-link'
                             }
                            >
                                Projects
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                             to="/contact"
                             className={({ isActive }) =>
                              isActive ? 'nav-link active' : 'nav-link'
                             }
                            >
                                Contact
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;