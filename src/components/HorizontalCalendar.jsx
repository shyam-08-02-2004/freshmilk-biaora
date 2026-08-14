import React, { useEffect, useRef } from 'react';
import { format, addDays, subDays, isSameDay, isBefore, startOfDay, isAfter } from 'date-fns';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';

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

  // Generate an array of dates to show: 7 days in past, 7 days in future
  const dates = Array.from({ length: 15 }).map((_, i) => addDays(subDays(today, 3), i));

  useEffect(() => {
    // Scroll to the selected date element
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('.selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  return (
    <div style={{ marginBottom: '1.5rem', background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>📅</span> Select Delivery Date
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem', gap: '0.2rem', cursor: 'pointer' }}>
          {format(selectedDate, 'MMMM yyyy')} <ChevronRight size={16} />
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
