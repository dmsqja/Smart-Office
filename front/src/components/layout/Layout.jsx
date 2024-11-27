import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../../styles/layout.css';
import { useEffect, useState } from 'react';

const Layout = () => {
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
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/>
            <main className={`main-content ${isMenuOpen ? 'menu-open' : ''}`}>
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
            <Footer />
            {/* 모바일에서 사이드바가 열릴 때 오버레이 추가 */}
            {isMenuOpen && (
                <div 
                    className={`sidebar-overlay ${isMenuOpen ? 'show' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;