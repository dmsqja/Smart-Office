import { NavLink } from "react-router-dom";
import PropTypes from 'prop-types';
import '../../styles/layout.css';

const Header = ({ setIsMenuOpen }) => {
    return(
        <header className="header">
            <div className="header-container">
                <NavLink to="/" className="brand">
                    <span className="brand-text">Dashboard</span>
                </NavLink>
                <button
                    className="menu-toggle"
                    onClick={() => setIsMenuOpen(prev => !prev)}
                >
                    <i className="fas fa-bars"></i>
                </button>
            </div>
        </header>
    );
};

Header.propTypes = {
    setIsMenuOpen: PropTypes.func.isRequired
}

export default Header;