import React from 'react';
import MessengerForm from '../messenger/MessengerForm';
import '../../styles/dashboard.css';

const MsgWidget = () => {
    return (
        <div className="widget-content">
            <h3 className="widget-title">메시지</h3>
            <div className="messenger-widget-container">
                <MessengerForm />
            </div>
        </div>
    );
};

export default MsgWidget;
