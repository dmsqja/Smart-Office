import React, { useEffect, useState, useRef } from 'react';
import '../../styles/map.css';

const KakaoMapForm = () => {
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [showMemoForm, setShowMemoForm] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const mapContainerRef = useRef(null);
    const [openInfowindow, setOpenInfowindow] = useState(null);
    const [userMarkers, setUserMarkers] = useState([]);

    useEffect(() => {
        const loadKakaoMap = () => {
            window.kakao.maps.load(() => {
                // 기존 맵 컨테이너 제거 및 재생성
                if (mapContainerRef.current) {
                    mapContainerRef.current.innerHTML = '';
                    const mapDiv = document.createElement('div');
                    mapDiv.id = 'map';
                    mapContainerRef.current.appendChild(mapDiv);
                }

                const container = document.getElementById('map');
                const options = {
                    center: new window.kakao.maps.LatLng(36.798828, 127.075915),
                    level: 3,
                };

                // 이전 맵 인스턴스가 있다면 정리
                if (map) {
                    markers.forEach(({ marker, infowindow }) => {
                        marker.setMap(null);
                        infowindow.close();
                    });
                    setMarkers([]);
                }

                const newMap = new window.kakao.maps.Map(container, options);
                setMap(newMap);

                // 지도 클릭 이벤트
                window.kakao.maps.event.addListener(newMap, 'click', function(mouseEvent) {
                    const latlng = mouseEvent.latLng;
                    setCurrentPosition(latlng);
                    setShowMemoForm(true);
                });
            });
        };

        const script = document.createElement('script');
        script.src = `http://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
        script.async = true;
        script.onload = loadKakaoMap;
        document.head.appendChild(script);

        return () => {
            // 컴포넌트 언마운트 시 정리
            if (map) {
                markers.forEach(({ marker, infowindow }) => {
                    marker.setMap(null);
                    infowindow.close();
                });
                setMarkers([]);
                setMap(null);
            }
            const script = document.querySelector('script[src*="dapi.kakao.com"]');
            if (script) script.remove();
        };
    }, []);

    // localStorage에서 마커 불러오기
    useEffect(() => {
        const loadUserMarkers = () => {
            const savedMarkers = JSON.parse(localStorage.getItem('userMarkers') || '[]');
            if (map && savedMarkers.length > 0) {
                const loadedMarkers = savedMarkers.map(markerData => {
                    const position = new window.kakao.maps.LatLng(
                        markerData.position.lat,
                        markerData.position.lng
                    );
                    
                    const marker = new window.kakao.maps.Marker({
                        position: position,
                        map: map
                    });

                    const infowindow = new window.kakao.maps.InfoWindow({
                        content: `
                            <div class="info-window">
                                <div>${markerData.memo}</div>
                                <button onclick="window.deleteMarker('${markerData.id}')">삭제</button>
                            </div>
                        `,
                        removable: true
                    });

                    window.kakao.maps.event.addListener(marker, 'click', () => {
                        if (openInfowindow) openInfowindow.close();
                        infowindow.open(map, marker);
                        setOpenInfowindow(infowindow);
                    });

                    return { id: markerData.id, marker, infowindow, memo: markerData.memo };
                });
                setUserMarkers(loadedMarkers);
            }
        };

        loadUserMarkers();
    }, [map]);

    // 마커 삭제 함수를 전역으로 등록
    useEffect(() => {
        window.deleteMarker = (markerId) => {
            const markerToDelete = userMarkers.find(m => m.id === markerId);
            if (markerToDelete) {
                markerToDelete.marker.setMap(null);
                markerToDelete.infowindow.close();
                
                const updatedMarkers = userMarkers.filter(m => m.id !== markerId);
                setUserMarkers(updatedMarkers);
                
                // localStorage 업데이트
                const markerData = updatedMarkers.map(m => ({
                    id: m.id,
                    position: {
                        lat: m.marker.getPosition().getLat(),
                        lng: m.marker.getPosition().getLng()
                    },
                    memo: m.memo
                }));
                localStorage.setItem('userMarkers', JSON.stringify(markerData));
            }
        };

        return () => {
            delete window.deleteMarker;
        };
    }, [userMarkers]);

    const handleSearch = (e) => {
        e.preventDefault();
        const searchValue = e.target.search.value.toLowerCase();
        
        if (!searchValue.trim()) return;

        // Close previous infowindow if open
        if (openInfowindow) {
            openInfowindow.close();
            setOpenInfowindow(null);
        }

        // Clear previous markers
        markers.forEach(({ marker, infowindow }) => {
            marker.setMap(null);
            infowindow.close();
        });
        setMarkers([]);

        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(searchValue, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setSearchResults(data);
                const bounds = new window.kakao.maps.LatLngBounds();
                
                const newMarkers = data.map(place => {
                    const position = new window.kakao.maps.LatLng(place.y, place.x);
                    bounds.extend(position);
                    
                    const marker = new window.kakao.maps.Marker({
                        position: position,
                        map: map
                    });

                    const infowindow = new window.kakao.maps.InfoWindow({
                        content: `<div class="info-window">
                            <div class="info-window-title">${place.place_name}</div>
                            <div>${place.address_name}</div>
                        </div>`,
                        removable: true // ��기 버튼 표시
                    });

                    window.kakao.maps.event.addListener(marker, 'click', () => {
                        if (openInfowindow) openInfowindow.close();
                        infowindow.open(map, marker);
                        setOpenInfowindow(infowindow);
                    });

                    return { marker, infowindow };
                });

                setMarkers(newMarkers);
                map.setBounds(bounds);
            }
        });

        // 사용자 마커 검색
        const matchingUserMarkers = userMarkers.filter(
            marker => marker.memo.toLowerCase().includes(searchValue)
        );

        if (matchingUserMarkers.length > 0) {
            const bounds = new window.kakao.maps.LatLngBounds();
            matchingUserMarkers.forEach(({ marker }) => {
                bounds.extend(marker.getPosition());
            });
            map.setBounds(bounds);

            setSearchResults(prev => [
                ...prev,
                ...matchingUserMarkers.map(m => ({
                    id: m.id,
                    place_name: m.memo,
                    address_name: '사용자 마커',
                    y: m.marker.getPosition().getLat(),
                    x: m.marker.getPosition().getLng(),
                    isUserMarker: true
                }))
            ]);
        }
    };

    const handleClearSearch = () => {
        // 검색 마커 초기화
        markers.forEach(({ marker, infowindow }) => {
            marker.setMap(null);
            infowindow.close();
        });
        setMarkers([]);
        
        // 검색 결과 초기화
        setSearchResults([]);
        
        // 열린 인포윈도우 닫기
        if (openInfowindow) {
            openInfowindow.close();
            setOpenInfowindow(null);
        }
    };

    const handleMemoSubmit = (e) => {
        e.preventDefault();
        const memo = e.target.memo.value;
        
        if (!memo.trim() || !currentPosition) return;

        const newMarkerId = Date.now().toString();
        const marker = new window.kakao.maps.Marker({
            position: currentPosition,
            map: map
        });

        // 저장할 데이터 구성
        const markerData = {
            position: {
                lat: currentPosition.getLat(),
                lng: currentPosition.getLng()
            },
            memo: memo
        };

        // API 호출 시뮬레이션
        console.log('마커 데이터 저장:', markerData);
        alert(`저장된 데이터:\n위치: ${JSON.stringify(markerData.position)}\n메모: ${markerData.memo}`);

        const infowindow = new window.kakao.maps.InfoWindow({
            content: `
                <div class="info-window">
                    <div>${memo}</div>
                    <button onclick="window.deleteMarker('${newMarkerId}')">삭제</button>
                </div>
            `,
            removable: true
        });

        window.kakao.maps.event.addListener(marker, 'click', () => {
            if (openInfowindow) openInfowindow.close();
            infowindow.open(map, marker);
            setOpenInfowindow(infowindow);
        });

        const newMarker = {
            id: newMarkerId,
            marker,
            infowindow,
            memo
        };

        setUserMarkers(prev => [...prev, newMarker]);

        // localStorage에 저장 - 순수 데이터만 저장
        const savedMarkers = JSON.parse(localStorage.getItem('userMarkers') || '[]');
        const markerToSave = {
            id: newMarkerId,
            position: {
                lat: currentPosition.getLat(),
                lng: currentPosition.getLng()
            },
            memo: memo
        };
        localStorage.setItem('userMarkers', JSON.stringify([...savedMarkers, markerToSave]));

        setShowMemoForm(false);
        e.target.reset();
    };

    const handlePlaceClick = (place) => {
        const position = new window.kakao.maps.LatLng(place.y, place.x);
        map.setCenter(position);
        map.setLevel(3);
        
        // Close previous infowindow if open
        if (openInfowindow) {
            openInfowindow.close();
        }
        
        if (place.isUserMarker) {
            // 사용자 마커인 경우
            const userMarker = userMarkers.find(m => m.id === place.id);
            if (userMarker) {
                userMarker.infowindow.open(map, userMarker.marker);
                setOpenInfowindow(userMarker.infowindow);
            }
        } else {
            // 일반 검색 결과 마커인 경우
            const markerIndex = searchResults.findIndex(r => r.id === place.id);
            if (markerIndex !== -1 && markers[markerIndex]) {
                const { infowindow, marker } = markers[markerIndex];
                infowindow.open(map, marker);
                setOpenInfowindow(infowindow);
            }
        }
    };

    // 컴포넌트 cleanup 시 인포윈도우도 정리
    useEffect(() => {
        return () => {
            if (openInfowindow) {
                openInfowindow.close();
            }
        };
    }, [openInfowindow]);

    return (
        <div style={{ position: 'relative' }}>
            <div className="map-search-container">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        name="search"
                        className="map-search-input"
                        placeholder="위치 검색..."
                    />
                    <button type="submit">검색</button>
                    <button type="button" onClick={handleClearSearch}>초기화</button>
                </form>
            </div>
            
            {searchResults.length > 0 && (
                <div className="search-results-container">
                    {searchResults.map((place) => (
                        <div
                            key={place.id}
                            className="search-result-item"
                            onClick={() => handlePlaceClick(place)}
                        >
                            <div><strong>{place.place_name}</strong></div>
                            <div>{place.address_name}</div>
                        </div>
                    ))}
                </div>
            )}

            <form 
                className={`memo-form ${showMemoForm ? 'active' : ''}`}
                onSubmit={handleMemoSubmit}
            >
                <textarea
                    name="memo"
                    className="memo-input"
                    placeholder="메모를 입력하세요..."
                    rows="3"
                ></textarea>
                <button type="submit">저장</button>
                <button type="button" onClick={() => setShowMemoForm(false)}>취소</button>
            </form>

            <div ref={mapContainerRef}>
                <div id="map"></div>
            </div>
        </div>
    );
};

export default KakaoMapForm;