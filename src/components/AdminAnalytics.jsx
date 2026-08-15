import React, { useState, useMemo } from 'react';
import { MapPin, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';

const AdminAnalytics = ({ registeredUsers, globalOrders }) => {
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));

  const analyticsData = useMemo(() => {
    const locationData = {};

    registeredUsers.forEach(user => {
      const loc = (user.location || 'Unknown').trim().toLowerCase();
      // Capitalize first letter of each word for clean display
      const cleanLoc = loc.replace(/\b\w/g, l => l.toUpperCase());

      if (!locationData[cleanLoc]) {
        locationData[cleanLoc] = {
          location: cleanLoc,
          customers: 0,
          milk: 0,
          ghee: 0,
          paneer: 0,
          totalRevenue: 0
        };
      }
      
      locationData[cleanLoc].customers += 1;

      const userOrders = globalOrders[user.mobile] || {};
      Object.entries(userOrders).forEach(([dateStr, order]) => {
        if (dateStr.startsWith(filterMonth) && order.status === 'delivered') {
          locationData[cleanLoc].milk += (order.milk || 0);
          locationData[cleanLoc].ghee += (order.ghee || 0);
          locationData[cleanLoc].paneer += (order.paneer || 0);
          // Simplified revenue calculation for visualization purposes
          locationData[cleanLoc].totalRevenue += ((order.milk || 0) * 80) + ((order.ghee || 0) * 800) + ((order.paneer || 0) * 320);
        }
      });
    });

    // Sort by highest milk demand
    return Object.values(locationData).sort((a, b) => b.milk - a.milk);
  }, [registeredUsers, globalOrders, filterMonth]);

  const maxMilk = Math.max(...analyticsData.map(d => d.milk), 1); // prevent division by zero

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={24} color="var(--primary)" /> Area Demand Heatmap
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Discover which colonies have the highest demand to optimize marketing.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <label style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Month:</label>
          <input 
            type="month" 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)} 
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: 'var(--text-primary)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {analyticsData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <p>No data available for this month.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {analyticsData.map((data, index) => {
            const percentage = Math.round((data.milk / maxMilk) * 100);
            
            // Heatmap color logic: red (hot) for top demand, yellow/green for lower
            let barColor = '#10b981'; // Green
            if (percentage > 80) barColor = '#ef4444'; // Red (Hot)
            else if (percentage > 50) barColor = '#f59e0b'; // Orange (Warm)

            return (
              <div key={data.location} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                {index === 0 && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '0.2rem 1rem', borderBottomLeftRadius: '12px' }}>
                    TOP AREA 🔥
                  </div>
                )}
                
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{data.location}</h4>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1, background: 'var(--background)', padding: '0.8rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Users size={20} color="var(--text-secondary)" style={{ marginBottom: '0.3rem' }} />
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{data.customers}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Customers</span>
                  </div>
                  <div style={{ flex: 1, background: 'var(--background)', padding: '0.8rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TrendingUp size={20} color="var(--text-secondary)" style={{ marginBottom: '0.3rem' }} />
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{data.milk}L</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Milk Sold</span>
                  </div>
                </div>

                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                  <span>Milk Demand Heat</span>
                  <span style={{ color: barColor }}>{percentage}% of Max</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'var(--background)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', background: barColor, transition: 'width 1s ease-out' }}></div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Paneer: <strong>{data.paneer}kg</strong></span>
                  <span>Est. Revenue: <strong>₹{data.totalRevenue}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
