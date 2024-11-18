// 게시판 화면
import HubForm from '../components/hub/HubForm';
import '../styles/pages.css';

const Hub = () => {
    return(
        <div className="page hub-page">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">Hub</span>
                </h1>
            </div>
            <div className="hub-container">
                <HubForm />
            </div>
        </div>
    );
};

export default Hub;