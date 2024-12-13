import React, { useState, useEffect } from 'react';
import ProfileSection from './ProfileSection';
import StatusGrid from './StatusGrid';
import ActivityCard from './ActivityCard';
import CalendarForm from '../calendar/CalendarForm';
import MapWidget from './MapWidget';
import MsgWidget from './MsgWidget';
import WeatherWidget from './WeatherWidget';
import WidgetSelector from './WidgetSelector';
import { mockUser, mockStats, mockActivities } from '../../mock/mockData';
import '../../styles/dashboard.css';

// 위젯 구성 객체
const WIDGET_CONFIG = {
    status: {
        id: 'status',
        title: '근태 현황',
        description: '출근, 퇴근, 휴가 등 근태 현황을 확인할 수 있습니다.',
        component: StatusGrid,
        props: (data) => ({ stats: data.stats })
    },
    activity: {
        id: 'activity',
        title: '최근 활동',
        description: '최근 업무 활동과 진행 상황을 확인할 수 있습니다.',
        component: ActivityCard,
        props: (data) => ({ activities: data.activities })
    },
    map: {
        id: 'map',
        title: '사무실 맵',
        description: '사무실 내 좌석 배치와 현재 상태를 확인할 수 있습니다.',
        component: MapWidget,
        props: () => ({})
    },
    message: {
        id: 'message',
        title: '메시지',
        description: '팀원들과의 메시지를 주고받을 수 있습니다.',
        component: MsgWidget,
        props: () => ({})
    }
};

// EmptyCell 컴포넌트
const EmptyCell = ({ onAddWidget, availableWidgets }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="empty-cell" onClick={() => setIsOpen(true)}>
                <div className="flex flex-col items-center justify-center h-full text-gray-400 hover:text-primary">
                    <span className="text-3xl mb-2">+</span>
                    <span>위젯 추가하기</span>
                </div>
            </div>
            <WidgetSelector
                open={isOpen}
                onClose={() => setIsOpen(false)}
                onSelectWidget={onAddWidget}
                availableWidgets={availableWidgets}
            />
        </>
    );
};

// Widget 컴포넌트
const Widget = ({ widgetId, data, onRemove }) => {
    const config = WIDGET_CONFIG[widgetId];
    const WidgetComponent = config.component;

    return (
        <div className="widget-container">
            <div className="widget-header">
                <h3>{config.title}</h3>
                <div className="widget-controls">
                    <button onClick={onRemove} title="위젯 제거">✕</button>
                </div>
            </div>
            <div className="widget-content">
                <WidgetComponent {...config.props(data)} />
            </div>
        </div>
    );
};

const Main = () => {
    const [user, setUser] = useState(mockUser);
    const [stats, setStats] = useState(mockStats);
    const [activities, setActivities] = useState(mockActivities);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gridCells, setGridCells] = useState(Array(4).fill(null));

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

        const savedWidgets = localStorage.getItem('gridWidgets');
        if (savedWidgets) {
            setGridCells(JSON.parse(savedWidgets));
        }

        fetchUserData();
    }, []);

    const getAvailableWidgets = () => {
        return Object.values(WIDGET_CONFIG).filter(
            widget => !gridCells.includes(widget.id)
        );
    };

    const handleAddWidget = (index, widgetId) => {
        const newGridCells = [...gridCells];
        newGridCells[index] = widgetId;
        setGridCells(newGridCells);
        localStorage.setItem('gridWidgets', JSON.stringify(newGridCells));
    };

    const handleRemoveWidget = (index) => {
        const newGridCells = [...gridCells];
        newGridCells[index] = null;
        setGridCells(newGridCells);
        localStorage.setItem('gridWidgets', JSON.stringify(newGridCells));
    };

    if (loading) return <div className="dashboard-content container"><div className="loading">Loading...</div></div>;
    if (error) return <div className="dashboard-content container"><div className="error">{error}</div></div>;

    const widgetData = { stats, activities };

    return (
        <div className="dashboard-content container">
            <div className="dashboard-grid">
                {/* Left Column */}
                <div className="dashboard-column">
                    <div className="profile-card">
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

                {/* Right Column - Grid Layout */}
                <div className="dashboard-column">
                    <div className="grid-layout">
                        {gridCells.map((widgetId, index) => (
                            <div key={index} className={`grid-cell ${widgetId ? 'occupied' : ''}`}>
                                {widgetId ? (
                                    <Widget
                                        widgetId={widgetId}
                                        data={widgetData}
                                        onRemove={() => handleRemoveWidget(index)}
                                    />
                                ) : (
                                    <EmptyCell
                                        onAddWidget={(widgetId) => handleAddWidget(index, widgetId)}
                                        availableWidgets={getAvailableWidgets()}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;