// AI 챗봇 화면
import AiForm from '../components/ai/AiForm';
import '../styles/pages.css';

const Ai = () => {
    return (
        <div className="page ai-page">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">Ai</span>
                </h1>
            </div>
            <div className="ai-container">
                <AiForm />
            </div>
        </div>
    );
};

export default Ai;