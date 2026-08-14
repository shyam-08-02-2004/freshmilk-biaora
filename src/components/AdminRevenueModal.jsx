import React, { useMemo } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const AdminRevenueModal = ({ onClose, globalPayments }) => {
  const monthlyRevenue = useMemo(() => {
    const rev = {};
    Object.values(globalPayments).forEach(userPayments => {
      userPayments.forEach(p => {
        if (p.status === 'approved') {
          const monthStr = p.timestamp.substring(0, 7); // 'yyyy-MM'
          if (!rev[monthStr]) rev[monthStr] = 0;
          rev[monthStr] += parseFloat(p.amount);
        }
      });
    });
    return rev;
  }, [globalPayments]);

  const sortedMonths = Object.keys(monthlyRevenue).sort((a, b) => b.localeCompare(a));
  const totalAllTime = sortedMonths.reduce((sum, m) => sum + monthlyRevenue[m], 0);

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-content" style={{ maxWidth: '400px', width: '90%' }}>
        <div className="modal-header" style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <TrendingUp size={24} color="#10b981" /> Revenue Overview
          </h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 'bold' }}>All-Time Earnings</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>₹{totalAllTime}</p>
        </div>

        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border)', display: 'inline-block' }}>Monthly Breakdown</h3>
        
        {sortedMonths.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No approved payments yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {sortedMonths.map(monthStr => {
              const dateObj = new Date(monthStr + '-01');
              return (
                <div key={monthStr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{format(dateObj, 'MMMM yyyy')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>₹{monthlyRevenue[monthStr]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRevenueModal;
