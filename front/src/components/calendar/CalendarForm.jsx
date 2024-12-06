import React, { useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { useCalendar } from '../../context/CalendarContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import '../../styles/calendar.css'

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const CalendarForm = ({ height = 'calc(100vh - 2rem)', minimode = false }) => {
  const { events, addEvent, updateEvent, deleteEvent, resetEvent } = useCalendar();

  // 이벤트 이동 핸들러
  const moveEvent = useCallback(({ event, start, end }) => {
    updateEvent({ ...event, start, end });
  }, [updateEvent]);

  // 이벤트 크기 조절 핸들러
  const resizeEvent = useCallback(({ event, start, end }) => {
    updateEvent({ ...event, start, end });
  }, [updateEvent]);

  // 새 이벤트 생성 핸들러
  const handleSelectSlot = useCallback((slotInfo) => {
    const title = window.prompt('새 일정을 입력하세요');
    if (title) {
      addEvent({
        id: Date.now(), // unique ID 생성
        title,
        start: slotInfo.start,
        end: slotInfo.end,
      });
    }
  }, [addEvent]);

  // 이벤트 선택 핸들러
  const handleSelectEvent = useCallback((event) => {
    const confirmDelete = window.confirm(
      `${event.title}\n\n이 일정을 삭제하시겠습니까?`
    );

    if (confirmDelete) {
      deleteEvent(event.id);
    }
  }, [deleteEvent]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    if(window.confirm('모든 일정을 초기화하시겠습니까?')) {
      resetEvent();
    }
  }, [resetEvent]);

  return (
    <div className={minimode ? "p-2" : "h-screen p-4"} style={{ height: height }}>
      {!minimode && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            모든 일정 초기화
          </button>
        </div>
      )}
      <DnDCalendar
        localizer={localizer}
        events={events}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        resizable
        selectable
        style={{ height: !minimode ? 'calc(100% - 3rem)' : '100%' }}
        defaultView="month"
        views={minimode ? ['month'] : ['month', 'week', 'day']}
        toolbar={!minimode}
      />
    </div>
  );
};

export default CalendarForm;