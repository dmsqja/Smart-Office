import React, { createContext, useState, useContext, useEffect } from 'react';

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
    // LocalStorage에서 저장된 이벤트를 불러오거나, 없으면 빈 배열로 시작
    const [events, setEvents] = useState(() => {
        const savedEvents = localStorage.getItem('calendar-events');
        return savedEvents ? JSON.parse(savedEvents) : [];
    });

    // events가 변경될 때마다 LocalStorage에 저장
    useEffect(() => {
        localStorage.setItem('calendar-events', JSON.stringify(events));
    }, [events]);

    const addEvent = (newEvent) => {
        setEvents(prev => [...prev, newEvent]);
    };

    const updateEvent = (updatedEvent) => {
        setEvents(prev => prev.map(event =>
            event.id === updatedEvent.id ? updatedEvent : event
        ));
    };

    const deleteEvent = (eventId) => {
        setEvents(prev => prev.filter(event => event.id !== eventId));
    };

    const resetEvent = () => {
        setEvents([]);
        localStorage.removeItem('calendar-events');
    };

    return (
        <CalendarContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, resetEvent }}> {/* event -> events */}
            {children}
        </CalendarContext.Provider>
    );
};

export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};