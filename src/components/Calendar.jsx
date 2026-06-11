import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, isSunday } from 'date-fns';

const Calendar = ({ currentDate, setCurrentDate, orders, onDayClick, selectedDate }) => {
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="calendar-container">
      <div className="month-selector">
        <button onClick={prevMonth} className="icon-btn">
          <ChevronLeft size={24} />
        </button>
        <h2 className="month-title">{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} className="icon-btn">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className={`weekday-header ${day === 'Sun' ? 'sunday' : ''}`}>
            {day}
          </div>
        ))}

        {days.map(day => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          const dayOrder = orders[formattedDate];
          const hasOrder = dayOrder && (dayOrder.milk > 0 || dayOrder.ghee > 0 || dayOrder.chach > 0);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isActive = isSameDay(day, selectedDate);

          if (!isCurrentMonth) {
            return <div key={day.toString()} className="day-card empty"></div>;
          }

          let classes = "day-card";
          if (isActive) classes += " active-day";
          if (hasOrder) classes += " has-order";
          if (isSunday(day)) classes += " sunday-card";

          return (
            <div 
              key={day.toString()} 
              className={classes}
              onClick={() => onDayClick(day)}
            >
              <span className="day-number">{format(day, dateFormat)}</span>
              {hasOrder && (
                <div className="day-indicators">
                  {dayOrder.milk > 0 && <div className="indicator milk"></div>}
                  {dayOrder.ghee > 0 && <div className="indicator ghee"></div>}
                  {dayOrder.chach > 0 && <div className="indicator chach"></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
