// 화상 회의 화면
import MeetingForm from '../components/meeting/MeetingForm';
import '../styles/pages.css';

const Meeting = () => {
    return (
        <div className="page meeting-page">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">Meeting</span>
                </h1>
            </div>
            <div className="meeting-container">
                <MeetingForm />
            </div>
        </div>
    );
};

export default Meeting;