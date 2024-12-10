import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ProfileSection from './ProfileSection';
import StatusGrid from './StatusGrid';
import ActivityCard from './ActivityCard';
import CalendarForm from '../calendar/CalendarForm';
import defaultProfileImage from '../../assets/profile1.png';
import '../../styles/home.css';
import { DragDropContext, Draggable } from '@hello-pangea/dnd';
import MapWidget from './MapWidget';
import MsgWidget from './MsgWidget';
import StrictModeDroppable from './StrictModeDroppable';
import WeatherWidget from './WeatherWidget';

const AVAILABLE_WIDGETS = {
    status: {
        id: 'status',
        title: '근태 현황',
        component: StatusGrid
    },
    activity: {
        id: 'activity',
        title: '최근 활동',
        component: ActivityCard
    },
    map: {
        id: 'map',
        title: '사무실 맵',
        component: MapWidget
    },
    message: {
        id: 'message',
        title: '메시지',
        component: MsgWidget
    }
};

const Main = () => {

    {/* 실제 코드 */}
    // const [user, setUser] = useState({
    //     name: "",
    //     position: "",
    //     department: "",
    //     employeeId: "",
    //     email: "",
    //     profileImage: defaultProfileImage
    // });
    {/* 실제 코드 */}


    {/* 테스트 정보 */}
    const mockUser = {
        name: "김지원",
        position: "선임연구원",
        department: "AI연구소",
        employeeId: "EMP2024001",
        email: "jiwon.kim@company.com",
        profileImage: defaultProfileImage
    };
    {/* 테스트 정보 */}

    // // 목업 통계 데이터
    const mockStats = {
        attendanceStats: {
            title: '근태 현황',
            mainStat: { value: '15', unit: '일', label: '정상 출근' },
            stats: [
                { label: '지각', value: '1', unit: '회' },
                { label: '조퇴', value: '0', unit: '회' },
                { label: '결근', value: '0', unit: '회' }
            ]
        },
        leaveStats: {
            title: '휴가 현황',
            mainStat: { value: '10', unit: '일', label: '잔여 휴가' },
            stats: [
                { label: '총 휴가', value: '15', unit: '일' },
                { label: '사용 휴가', value: '5', unit: '일' }
            ]
        },
        overtimeStats: {
            title: '초과근무 현황',
            mainStat: { value: '12', unit: '시간', label: '이번달 초과근무' },
            stats: [
                { label: '승인됨', value: '10', unit: '시간' },
                { label: '수당 지급 예정', value: '10', unit: '시간' }
            ]
        }
    };

    // // 목업 활동 데이터
    const mockActivities = [
        {
            id: 1,
            type: '휴가',
            title: '연차 휴가 신청',
            status: '승인완료',
            date: '2024-12-05',
            description: '12월 5일 연차 휴가'
        },
        {
            id: 2,
            type: '초과근무',
            title: '초과근무 신청',
            status: '승인대기',
            date: '2024-12-03',
            description: '프로젝트 마감으로 인한 초과근무 2시간'
        },
        {
            id: 3,
            type: '근태',
            title: '지각 사유서',
            status: '제출완료',
            date: '2024-12-02',
            description: '교통 체증으로 인한 지각'
        },
        {
            id: 4,
            type: '휴가',
            title: '반차 신청',
            status: '승인완료',
            date: '2024-12-01',
            description: '오후 반차'
        },
        {
            id: 5,
            type: '초과근무',
            title: '초과근무 신청',
            status: '승인완료',
            date: '2024-11-30',
            description: '긴급 장애 대응으로 인한 초과근무 3시간'
        }
    ];
    
    const [user, setUser] = useState(mockUser);    // 이거 테스트 정보니까 주석처리
    const [stats, setStats] = useState(mockStats); // 나중에 이 mockStats 실제 데이터로 가져오기
    const [activities, setActivities] = useState(mockActivities);


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeWidgets, setActiveWidgets] = useState(['status', 'activity']);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setTimeout(() => {
                    setUser(mockUser);
                    setStats(mockStats);
                    setActivities(mockActivities);
                    setLoading(false);
                }, 500);
            } catch (error) {
                setError('사용자 정보를 불러오는데 실패했습니다.');
                setLoading(false);
            }
        };

        // 저장된 위젯 설정 불러오기
        const savedWidgets = localStorage.getItem('userWidgets');
        if (savedWidgets) {
            setActiveWidgets(JSON.parse(savedWidgets));
        }

        fetchUserData();
    }, []);

    // 위젯 관리 함수들
    const handleAddWidget = (widgetId) => {
        if (!activeWidgets.includes(widgetId)) {
            const newWidgets = [...activeWidgets, widgetId];
            setActiveWidgets(newWidgets);
            localStorage.setItem('userWidgets', JSON.stringify(newWidgets));
        }
    };

    const handleRemoveWidget = (widgetId) => {
        const newWidgets = activeWidgets.filter(id => id !== widgetId);
        setActiveWidgets(newWidgets);
        localStorage.setItem('userWidgets', JSON.stringify(newWidgets));
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(activeWidgets);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setActiveWidgets(items);
        localStorage.setItem('userWidgets', JSON.stringify(items));
    };

    if (loading) return <div className="dashboard-content container"><div className="loading">Loading...</div></div>;
    if (error) return <div className="dashboard-content container"><div className="error">{error}</div></div>;

    return (
        <div className="dashboard-content container">
            <div className="dashboard-grid">
                {/* Left Column */}
                <div className="dashboard-column">
                    <div className="status-card">
                        <ProfileSection user={user} />
                    </div>
                    <div className="mini-calendar-card">
                        <h2 className="card-title">일정</h2>
                        <div style={{ height: '400px' }}>
                            <CalendarForm height="100%" minimode={true} />
                        </div>
                    </div>
                    <div className="weather-card">
                        <WeatherWidget />
                    </div>
                </div>

                {/* Right Column */}
                <div className="dashboard-column">
                    <div className="widget-selector">
                        <h3 style={{ marginBottom: 'var(--spacing-3)' }}>위젯 추가</h3>
                        {Object.values(AVAILABLE_WIDGETS).map(widget => (
                            <button
                                key={widget.id}
                                onClick={() => handleAddWidget(widget.id)}
                                disabled={activeWidgets.includes(widget.id)}
                                style={{ opacity: activeWidgets.includes(widget.id) ? 0.5 : 1 }}
                            >
                                {widget.title}
                            </button>
                        ))}
                    </div>

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="widgets-wrapper">
                            <StrictModeDroppable droppableId="widgets">
                                {activeWidgets.map((widgetId, index) => {
                                    const Widget = AVAILABLE_WIDGETS[widgetId].component;
                                    return (
                                        <Draggable
                                            key={widgetId}
                                            draggableId={widgetId}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`widget-container ${snapshot.isDragging ? 'dragging' : ''}`}
                                                >
                                                    <div 
                                                        className="widget-controls"
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <span title="드래그하여 위치 변경">⋮⋮</span>
                                                        <button
                                                            onClick={() => handleRemoveWidget(widgetId)}
                                                            title="��젯 제거"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                    <Widget
                                                        {...(widgetId === 'status' ? { stats } : {})}
                                                        {...(widgetId === 'activity' ? { activities } : {})}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                            </StrictModeDroppable>
                        </div>
                    </DragDropContext>
                </div>
            </div>
        </div>
    );
};

export default Main;