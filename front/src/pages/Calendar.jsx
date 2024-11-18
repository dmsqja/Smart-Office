// 일정 관리 화면
import CalendarForm from '../components/calendar/CalendarForm';
import '../styles/pages.css';

const Calendar = () => {
  return (
    <div className="page calendar-page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="text-gradient">Calendar</span>
        </h1>
      </div>
      <div className="calendar-container">
        <CalendarForm />
      </div>
    </div>
  );
};

export default Calendar;