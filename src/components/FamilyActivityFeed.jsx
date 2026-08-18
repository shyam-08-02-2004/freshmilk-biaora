import React from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Users } from 'lucide-react';

const FamilyActivityFeed = ({ orders, currentUser }) => {
  // Extract and process orders into an array
  const activityList = Object.entries(orders || {})
    .filter(([date, order]) => {
      // Parse date properly to handle local timezones
      const [year, month, day] = date.split('-');
      const dateObj = new Date(year, month - 1, day);
      
      const isTod = isToday(dateObj);
      const isYest = isYesterday(dateObj);

      // Only show Today and Yesterday
      if (!isTod && !isYest) return false;

      // Only show if there is Milk
      return order.milk > 0;
    })
    .map(([date, order]) => ({
      dateStr: date,
      timestamp: order.timestamp ? new Date(order.timestamp).getTime() : new Date(date).getTime(),
      ...order
    }))
    .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

  if (activityList.length === 0) return null;

  return (
    <div className="widget-card" style={{ marginTop: '1.5rem', padding: '1.2rem', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
        <div style={{ background: '#fef3c7', padding: '0.6rem', borderRadius: '50%', flexShrink: 0 }}>
          <Users size={20} color="#d97706" />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: 'clamp(1rem, 4vw, 1.1rem)', color: 'var(--text-primary)' }}>Family Activity Feed</h4>
          <p style={{ margin: 0, fontSize: 'clamp(0.75rem, 3vw, 0.85rem)', color: 'var(--text-secondary)' }}>Recent milk orders</p>
        </div>
      </div>

      <div style={{ position: 'relative', paddingLeft: '1rem' }}>
        {/* Vertical line connecting timeline dots */}
        <div style={{ position: 'absolute', top: '0.5rem', bottom: '1.5rem', left: '1.3rem', width: '2px', background: 'var(--border)' }}></div>
        
        {activityList.map((activity) => {
          // Parse date properly to handle local timezones
          const [year, month, day] = activity.dateStr.split('-');
          const dateObj = new Date(year, month - 1, day);
          
          let dateLabel = format(dateObj, 'MMM d, yyyy');
          if (isToday(dateObj)) dateLabel = 'Today';
          else if (isYesterday(dateObj)) dateLabel = 'Yesterday';

          const orderedByName = activity.orderedBy || currentUser?.name || 'You';
          
          let items = [];
          if (activity.milk > 0) items.push(`${activity.milk}L Milk`);

          return (
            <div key={activity.dateStr} style={{ position: 'relative', paddingLeft: '2rem', paddingBottom: '1.5rem' }}>
              <div style={{ position: 'absolute', left: '-1px', top: '0.2rem', width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', border: '3px solid var(--surface)', boxShadow: '0 0 0 1px #d97706' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.3rem' }}>
                <h5 style={{ margin: '0 0 0.2rem', fontSize: 'clamp(0.9rem, 3.5vw, 0.95rem)', fontWeight: 'bold', wordBreak: 'break-word' }}>{orderedByName}</h5>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--background)', padding: '0.2rem 0.5rem', borderRadius: '12px', whiteSpace: 'nowrap' }}>{dateLabel}</span>
              </div>
              <p style={{ margin: 0, fontSize: 'clamp(0.85rem, 3.5vw, 0.95rem)', color: 'var(--text-secondary)' }}>
                Ordered: <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{items.join(', ')}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FamilyActivityFeed;
