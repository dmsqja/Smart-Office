import React, { useState, useEffect } from 'react';
import MessengerForm from '../messenger/MessengerForm';
import '../../styles/dashboard.css';

const MsgWidget = () => {
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={`messenger-widget-container ${isMobileView ? 'mobile-style' : ''}`}>
            <div className="widget-content">
                <MessengerForm isWidget={true} isMobileStyle={isMobileView} />
            </div>
        </div>
    );
};

export default MsgWidget;
