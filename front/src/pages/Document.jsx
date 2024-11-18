// 문서 관리 화면
import DocumentForm from '../components/document/DocumentForm';
import '../styles/pages.css';

const Doc = () => {
    return (
        <div className="page doc-page">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">Document</span>
                </h1>
            </div>
            <div className="doc-container">
                <DocumentForm />
            </div>
        </div>
    );
};

export default Doc;