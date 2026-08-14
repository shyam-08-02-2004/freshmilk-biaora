import React, { useEffect, useRef, useState } from 'react';
import { format, addDays, subDays, isSameDay, isBefore, startOfDay, isAfter, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parse } from 'date-fns';
import { CheckCircle, Circle, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const HorizontalCalendar = ({ 
  selectedDate, 
  setSelectedDate, 
  orders, 
  onDayClick,
  currentUser
}) => {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const scrollRef = useRef(null);

  // Track the month currently being viewed in the calendar strip
  const [viewMonth, setViewMonth] = useState(startOfMonth(selectedDate));

  // Update viewMonth if selectedDate changes to a different month
  useEffect(() => {
    if (!isSameMonth(selectedDate, viewMonth)) {
      setViewMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate]);

  // Generate all days for the currently viewed month
  const dates = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth)
  });

  useEffect(() => {
    // Scroll to the selected date element
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('.selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate, viewMonth]);

  const handleMonthChange = (e) => {
    if (!e.target.value) return;
    const newMonthDate = parse(e.target.value, 'yyyy-MM', new Date());
    setViewMonth(startOfMonth(newMonthDate));
  };

  return (
    <div style={{ marginBottom: '1.5rem', background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={20} color="var(--primary)" /> Delivery Date
        </h3>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem', gap: '0.2rem', cursor: 'pointer', background: '#f0fdf4', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
          {format(viewMonth, 'MMMM yyyy')} <ChevronRight size={16} />
          <input 
            type="month" 
            value={format(viewMonth, 'yyyy-MM')}
            onChange={handleMonthChange}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          />
        </div>
      </div>

      <div className="horizontal-calendar" ref={scrollRef}>
        {dates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const isPast = isBefore(startOfDay(date), today);
          const isBeyondTomorrow = isAfter(startOfDay(date), tomorrow);
          
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayOrder = orders[dateStr];
          
          // Determine status icon
          let StatusIcon = null;
          let statusColor = '';
          
          if (dayOrder && (dayOrder.milk > 0 || dayOrder.ghee > 0 || dayOrder.chach > 0 || dayOrder.paneer > 0 || dayOrder.curd > 0)) {
            if (dayOrder.status === 'approved') {
              StatusIcon = CheckCircle;
              statusColor = '#10b981';
            } else if (dayOrder.status === 'pending') {
              StatusIcon = CheckCircle;
              statusColor = '#f59e0b'; // Amber for pending
            }
          } else {
            // Default unselected state icon if needed, or dash
            if (isPast) {
              StatusIcon = () => <span style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 'bold' }}>—</span>;
            } else {
              StatusIcon = Circle;
              statusColor = '#cbd5e1';
            }
          }

          let wrapperClass = 'date-pill';
          if (isSelected) wrapperClass += ' selected';
          if (isPast) wrapperClass += ' disabled';

          return (
            <div 
              key={dateStr}
              className={wrapperClass}
              onClick={() => onDayClick(date)}
            >
              <span className="day-name">{format(date, 'EEE')}</span>
              <span className="date-num">{format(date, 'dd')}</span>
              
              {isToday ? (
                <span className="status" style={{ fontWeight: 'bold', color: isSelected ? 'var(--secondary)' : 'var(--text-secondary)' }}>Today</span>
              ) : (
                <span className="status" style={{ marginTop: '0.3rem' }}>
                  {StatusIcon && <StatusIcon size={14} color={statusColor} />}
                </span>
              )}
              
              {isSelected && StatusIcon && isToday && (
                <div style={{ marginTop: '0.2rem' }}>
                  <StatusIcon size={14} color={statusColor} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalCalendar;
