import React, { useEffect } from 'react';
import '../../styles/map.css';

const KakaoMapForm = () => {
    useEffect(() => {
        let map = null; // 지도 인스턴스를 저장할 변수

        const loadKakaoMap = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById('map');
                const options = {
                    center: new window.kakao.maps.LatLng(36.798828, 127.075915),
                    level: 3,
                };

                const map = new window.kakao.maps.Map(container, options);
                const markerPosition = new window.kakao.maps.LatLng(36.798828, 127.075915);
                const marker = new window.kakao.maps.Marker({
                    position: markerPosition,
                    clickable: true,
                });
                marker.setMap(map);

                const iwContent = `
                    <div class="info-window">
                        <div class="info-window-title">선문대학교 인문관</div>
                        <img
                            src="/assets/company.png"
                            alt="선문대학교 인문관"
                            class="info-window-image"
                        />
                        <div class="info-window-links">
                            <a href="https://map.kakao.com/link/map/선문대학교,36.799032,127.074978"
                                class="info-window-link"
                                target="_blank">
                                큰지도
                            </a>
                            <a href="https://lily.sunmoon.ac.kr/MainDefault3.aspx"
                                class="info-window-link"
                                target="_blank">
                                홈페이지
                            </a>
                        </div>
                    </div>
                `;

                const infowindow = new window.kakao.maps.InfoWindow({
                    content: iwContent,
                    removeable: true,
                });

                window.kakao.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(map,marker);
                });

                window.kakao.maps.event.addListener(map, 'click', function() {
                    infowindow.close();
                })
            });
        };


        // 윈도우 리사이즈 이벤트 핸들러
        const handleResize = () => {
            if (map) {
                map.relayout(); // 지도 레이아웃 재설정
            }
        }

        const script = document.createElement('script');
        script.src = `http://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&autoload=false`;
        script.async = true;
        
        script.onload = loadKakaoMap;
        document.head.appendChild(script);

        // 리사이즈 이벤트 리스너 추가
        window.addEventListener('resize', handleResize);

        return () => {
            // 컴포넌트 언마운트 시 이벤트 리스너 제거
            window.removeEventListener('resize', handleResize);
            const script = document.querySelector('script[src*="dapi.kakao.com"]');
            if (script) {
                script.remove();
            }
        };
    }, []);

    return <div id="map"></div>;
};

export default KakaoMapForm;