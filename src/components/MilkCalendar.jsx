import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, isFuture } from 'date-fns';
import { ChevronLeft, ChevronRight, Truck, Droplets, Pause, X, Clock } from 'lucide-react';

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
    
    // Check if it's a vacation/pause day
    if (currentUser?.vacationStart && currentUser?.vacationEnd) {
      const vStart = new Date(currentUser.vacationStart);
      vStart.setHours(0,0,0,0);
      const vEnd = new Date(currentUser.vacationEnd);
      vEnd.setHours(23,59,59,999);
      if (date >= vStart && date <= vEnd) return 'paused';
    }
    
    // If there is an order, show its status even if it's a future date
    if (order) {
      if (order.status === 'delivered') return 'delivered';
      if (order.status === 'approved') return 'approved';
      if (order.status === 'pending') return 'pending';
    }
    
    // If no order and it's in the future, mark as future (empty/white)
    if (isFuture(date) && !isToday(date)) return 'future';
    
    return 'no-order';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered': return { bg: '#ebfdf0', color: '#16a34a', dotColor: '#16a34a', icon: <div style={{width: '4px', height: '4px', borderRadius: '50%', background: '#16a34a'}}></div> };
      case 'approved': return { bg: '#eff6ff', color: '#2563eb', dotColor: '#2563eb', icon: <Truck size={10} color="#2563eb"/> };
      case 'paused':   return { bg: '#f3f4f6', color: '#6b7280', dotColor: '#9ca3af', icon: <div style={{width: '4px', height: '4px', borderRadius: '50%', background: '#9ca3af'}}></div> };
      case 'pending':  return { bg: '#fef9c3', color: '#d97706', dotColor: '#d97706', icon: <div style={{width: '4px', height: '4px', borderRadius: '50%', background: '#d97706'}}></div> };
      case 'future':   return { bg: 'transparent', color: '#9ca3af', dotColor: 'transparent', icon: null };
      default:         return { bg: '#fef2f2', color: '#ef4444', dotColor: '#ef4444', icon: <div style={{width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444'}}></div> };
    }
  };

  // Stats
  const monthOrders = daysInMonth.filter(d => {
    const dateStr = format(d, 'yyyy-MM-dd');
    return orders[dateStr]?.status === 'delivered';
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
      background: 'white',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Dark Green Header */}
      <div style={{
        background: 'linear-gradient(to right, #064e3b, #15803d)',
        padding: '1.5rem 1.2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px'
      }}>
        {/* Subtle background decoration */}
        <div style={{ position: 'absolute', right: '10%', opacity: 0.1, fontSize: '4rem', pointerEvents: 'none' }}>🥛</div>

        <button
          onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>
            {format(viewMonth, 'MMMM yyyy')}
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: '500' }}>
            Doodh Delivery Calendar
          </p>
        </div>
        <button
          onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        padding: '1rem',
        marginTop: '-1rem', // Pull up slightly
        position: 'relative',
        zIndex: 2
      }}>
        {[
          { label: 'Delivered', value: monthOrders.length, color: '#16a34a', bg: '#f0fdf4', icon: <Truck size={18} color="#16a34a"/>, iconBg: '#dcfce7' },
          { label: 'Total Litres', value: `${totalLiters}L`, color: '#2563eb', bg: '#eff6ff', icon: <Droplets size={18} color="#2563eb"/>, iconBg: '#dbeafe' },
          { label: 'Paused Days', value: pausedDays.length, color: '#d97706', bg: '#fffbeb', icon: <Pause size={18} color="#d97706"/>, iconBg: '#fef3c7' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white',
            padding: '0.8rem 0.5rem',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div style={{ background: stat.iconBg, padding: '0.4rem', borderRadius: '50%', display: 'flex' }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</span>
            </div>
            <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.5rem 1rem 1.5rem 1rem' }}>
        {/* Week Day Labels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
          marginBottom: '10px'
        }}>
          {weekDays.map(d => (
            <div key={d} style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#374151',
              padding: '4px 0'
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px'
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
            
            // Special styling for Today if delivered
            const isTodayDelivered = today && status === 'delivered';

            return (
              <div
                key={date.toISOString()}
                title={style.label}
                style={{
                  background: isTodayDelivered ? '#15803d' : (status === 'future' ? '#f8fafc' : style.bg),
                  borderRadius: '12px',
                  padding: '8px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  height: '46px',
                  cursor: 'default'
                }}
              >
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: isTodayDelivered ? 'white' : '#374151',
                  lineHeight: 1
                }}>
                  {format(date, 'd')}
                </div>
                {status !== 'future' && (
                  isTodayDelivered ? 
                    <div style={{ fontSize: '0.6rem', color: 'white', lineHeight: 1 }}>✓</div> :
                    style.icon
                )}
              </div>
            );
          })}
        </div>

        {/* Legend Pill Container */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1.5rem',
          padding: '0.8rem 1rem',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          justifyContent: 'center',
          background: '#fafafa'
        }}>
          {[
            { color: '#16a34a', icon: <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#16a34a'}}></div>, label: 'Delivered' },
            { color: '#2563eb', icon: <Truck size={10} color="#2563eb"/>, label: 'Approved' },
            { color: '#6b7280', icon: <Pause size={10} color="#6b7280" fill="#6b7280"/>, label: 'Paused' },
            { color: '#ef4444', icon: <X size={10} color="#ef4444"/>, label: 'No Order' },
            { color: '#d97706', icon: <Clock size={10} color="#d97706"/>, label: 'Pending' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: item.color,
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {item.icon} <span style={{color: '#4b5563'}}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MilkCalendar;
