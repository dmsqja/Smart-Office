import React, { useEffect, useRef, useState } from 'react';
import KakaoMapForm from '../map/KakaoMapForm';
import '../../styles/dashboard.css';

const MapWidget = () => {
    const mapContainerRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleResize = () => {
            if (window.kakao && window.kakao.maps) {
                window.dispatchEvent(new Event('resize'));
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="widget-content map-widget" ref={mapContainerRef}>
            <h3 className="widget-title">사무실 맵</h3>
            <div className="map-widget-container">
                {mounted && <KakaoMapForm />}
            </div>
        </div>
    );
};

export default MapWidget;
