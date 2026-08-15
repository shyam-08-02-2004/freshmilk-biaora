import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, isFuture } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MilkCalendar = ({ orders = {}, currentUser, isAdmin = false }) => {
  const [viewMonth, setViewMonth] = useState(new Date());

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate starting empty cells (Sunday = 0)
  const startDayOfWeek = getDay(monthStart);

  const getDayStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const order = orders[dateStr];
    
    if (isFuture(date) && !isToday(date)) return 'future';
    
    // Check if it's a vacation/pause day
    if (currentUser?.vacationStart && currentUser?.vacationEnd) {
      const vStart = new Date(currentUser.vacationStart);
      const vEnd = new Date(currentUser.vacationEnd);
      if (date >= vStart && date <= vEnd) return 'paused';
    }
    
    if (!order) return 'no-order';
    if (order.status === 'approved') return 'delivered';
    if (order.status === 'pending') return 'pending';
    return 'no-order';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered': return { bg: '#dcfce7', color: '#16a34a', emoji: '✅', label: 'Delivered' };
      case 'paused':   return { bg: '#f3f4f6', color: '#6b7280', emoji: '⏸', label: 'Paused' };
      case 'pending':  return { bg: '#fef9c3', color: '#ca8a04', emoji: '⏳', label: 'Pending' };
      case 'future':   return { bg: 'transparent', color: '#cbd5e1', emoji: '', label: '' };
      default:         return { bg: '#fef2f2', color: '#ef4444', emoji: '✗', label: 'No Order' };
    }
  };

  // Stats
  const monthOrders = daysInMonth.filter(d => {
    const dateStr = format(d, 'yyyy-MM-dd');
    return orders[dateStr]?.status === 'approved';
  });
  const pausedDays = daysInMonth.filter(d => {
    if (!currentUser?.vacationStart || !currentUser?.vacationEnd) return false;
    const vStart = new Date(currentUser.vacationStart);
    const vEnd = new Date(currentUser.vacationEnd);
    return d >= vStart && d <= vEnd;
  });
  const totalLiters = monthOrders.reduce((sum, d) => {
    const o = orders[format(d, 'yyyy-MM-dd')];
    return sum + (o?.milk || 0);
  }, 0);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '20px',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb, #1e40af)',
        padding: '1.2rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>
            {format(viewMonth, 'MMMM yyyy')}
          </h3>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>
            Doodh Delivery Calendar
          </p>
        </div>
        <button
          onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--background)'
      }}>
        {[
          { label: 'Delivered', value: monthOrders.length, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Total Litres', value: `${totalLiters}L`, color: '#2563eb', bg: '#dbeafe' },
          { label: 'Paused Days', value: pausedDays.length, color: '#6b7280', bg: '#f3f4f6' }
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '0.8rem 0.5rem',
            textAlign: 'center',
            borderRight: i < 2 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{
              display: 'inline-block',
              background: stat.bg,
              color: stat.color,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '8px',
              marginBottom: '0.2rem'
            }}>{stat.value}</div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '1rem' }}>
        {/* Week Day Labels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          marginBottom: '6px'
        }}>
          {weekDays.map(d => (
            <div key={d} style={{
              textAlign: 'center',
              fontSize: '0.68rem',
              fontWeight: 'bold',
              color: 'var(--text-secondary)',
              padding: '4px 0'
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px'
        }}>
          {/* Empty cells for first week */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {daysInMonth.map(date => {
            const status = getDayStatus(date);
            const style = getStatusStyle(status);
            const today = isToday(date);

            return (
              <div
                key={date.toISOString()}
                title={style.label}
                style={{
                  background: today ? '#2563eb' : style.bg,
                  borderRadius: '10px',
                  padding: '6px 2px',
                  textAlign: 'center',
                  border: today ? '2px solid #1e40af' : '1px solid transparent',
                  transition: 'transform 0.15s',
                  cursor: 'default'
                }}
              >
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: today ? 'bold' : '500',
                  color: today ? 'white' : style.color,
                  lineHeight: 1
                }}>
                  {format(date, 'd')}
                </div>
                {status !== 'future' && style.emoji && (
                  <div style={{ fontSize: '0.65rem', lineHeight: 1.2 }}>{style.emoji}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.6rem',
          marginTop: '1rem',
          paddingTop: '0.8rem',
          borderTop: '1px solid var(--border)',
          justifyContent: 'center'
        }}>
          {[
            { emoji: '✅', label: 'Delivered', bg: '#dcfce7', color: '#16a34a' },
            { emoji: '⏸', label: 'Paused', bg: '#f3f4f6', color: '#6b7280' },
            { emoji: '✗', label: 'No Order', bg: '#fef2f2', color: '#ef4444' },
            { emoji: '⏳', label: 'Pending', bg: '#fef9c3', color: '#ca8a04' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: item.bg,
              color: item.color,
              fontSize: '0.72rem',
              fontWeight: '600',
              padding: '0.25rem 0.6rem',
              borderRadius: '20px'
            }}>
              <span>{item.emoji}</span> {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MilkCalendar;
