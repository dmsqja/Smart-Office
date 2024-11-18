import PropTypes from 'prop-types';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import '../../styles/layout.css';

const Layout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'visible';
        }
        return () => {
            document.body.style.overflow = 'visible';
        };
    }, [isMenuOpen]);


    return(
        <div className="layout">
            <Header setIsMenuOpen={setIsMenuOpen} />
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <main className="main-content">
                <div className="page-container">
                    {children}
                </div>
            </main>
            <BottomNav />
            <Footer />
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;