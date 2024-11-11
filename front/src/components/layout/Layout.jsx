import PropTypes from 'prop-types';
import Header from './Header';
import Footer from './Footer';
import '../../styles/layout.css';

const Layout = ({ children }) => {
    return(
        <div className="layout">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;