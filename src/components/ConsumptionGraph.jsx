import React from 'react';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import { Activity, Droplet } from 'lucide-react';

const ConsumptionGraph = ({ orders }) => {
  // Generate last 7 days array (oldest first, ending with today)
  const last7Days = Array.from({ length: 7 })
    .map((_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'))
    .reverse();

  // Get data for the last 7 days
  const data = last7Days.map(dateStr => {
    const order = orders[dateStr] || { milk: 0, paneer: 0 };
    return {
      date: dateStr,
      milk: order.milk || 0,
      paneer: order.paneer || 0
    };
  });

  const totalMilkThisWeek = data.reduce((sum, day) => sum + day.milk, 0);
  
  // 1 Litre of cow/buffalo milk is roughly 34g of protein
  const estimatedProtein = totalMilkThisWeek * 34;

  // Find max milk to scale the bars (minimum max of 2 to avoid tiny bars when ordering 1L)
  const maxMilk = Math.max(...data.map(d => d.milk), 2);

  if (totalMilkThisWeek === 0) {
    return null; // Don't show the graph if they haven't ordered anything recently
  }

  return (
    <div className="widget-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--secondary)" /> Weekly Health
          </h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last 7 days milk consumption</p>
        </div>
        <div style={{ background: '#f0fdf4', padding: '0.5rem 1rem', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--secondary)', lineHeight: '1' }}>{totalMilkThisWeek}L</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TOTAL</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '0.5rem', marginTop: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        {data.map((day, idx) => {
          const dateObj = new Date(day.date);
          let label = format(dateObj, 'EEE'); // Mon, Tue
          if (isToday(dateObj)) label = 'Today';
          
          const heightPercent = (day.milk / maxMilk) * 100;
          const isZero = day.milk === 0;

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
              <div style={{ position: 'relative', width: '100%', height: '100px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                {/* Background bar */}
                <div style={{ position: 'absolute', bottom: 0, width: '100%', maxWidth: '32px', height: '100%', background: 'var(--bg-main)', borderRadius: '6px' }}></div>
                
                {/* Fill bar */}
                <div style={{ 
                  width: '100%', maxWidth: '32px', height: isZero ? '4px' : `${heightPercent}%`, 
                  background: isZero ? 'var(--border)' : 'linear-gradient(180deg, var(--secondary) 0%, #10b981 100%)', 
                  borderRadius: '6px', transition: 'height 0.5s ease', zIndex: 1,
                  boxShadow: isZero ? 'none' : '0 4px 10px rgba(16, 185, 129, 0.3)'
                }}></div>
                
                {/* Tooltip value */}
                {!isZero && (
                  <span style={{ position: 'absolute', top: `calc(${100 - heightPercent}% - 20px)`, fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--secondary)', zIndex: 2 }}>
                    {day.milk}L
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: isToday(dateObj) ? 'var(--secondary)' : 'var(--text-secondary)', fontWeight: isToday(dateObj) ? 'bold' : '500' }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* AI Health Insight */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '12px' }}>
        <div style={{ background: 'white', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <Droplet size={24} color="#ef4444" />
        </div>
        <div>
          <h5 style={{ margin: '0 0 0.2rem 0', color: '#991b1b', fontSize: '0.9rem' }}>Health Insight</h5>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#b91c1c', lineHeight: '1.4' }}>
            Awesome! Your family consumed approx <strong>{estimatedProtein}g of pure protein</strong> this week from Babu Dairy Milk.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ConsumptionGraph;
