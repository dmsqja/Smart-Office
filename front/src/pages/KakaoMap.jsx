// KakaoMap page
import KakaoMapForm from '../components/map/KakaoMapForm';
import '../styles/pages.css';

const KakaoMap = () => {
    return (
        <div className="page map-page">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="text-gradient">KakaoMap</span>
                </h1>
            </div>
            <div className="map-container">
                <KakaoMapForm />
            </div>
        </div>
    );
};

export default KakaoMap;