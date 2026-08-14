import React, { useState } from 'react';
import { ArrowLeft, Search, Calendar, User, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminHistoryModal = ({ onClose, adminLogs, filterMonth, setFilterMonth }) => {
  const filteredLogs = adminLogs.filter(log => {
    // The timestamp of the action itself
    const logMonth = format(new Date(log.timestamp), 'yyyy-MM');
    return logMonth === filterMonth;
  });

  return (
    <div className="modal-overlay" style={{ zIndex: 500 }} onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="responsive-modal-content"
        style={{ 
          width: '100%', 
          maxWidth: '650px', 
          height: '90vh', 
          maxHeight: '800px', 
          background: 'var(--background)', 
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ width: '100%', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ position: 'sticky', top: 0, background: 'var(--surface)', padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 10 }}>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', fontWeight: 'bold' }}>Activity History</h2>
        </div>

        {/* Filters */}
        <div style={{ padding: '1.5rem 1rem' }}>
          <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Search size={16} /> Search by Month
            </label>
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', fontWeight: 'bold' }}
            />
          </div>
        </div>

        {/* Logs */}
        <div style={{ padding: '0 1rem 2rem' }}>
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
              <Calendar size={48} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
              <p>No activity recorded in this month.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredLogs.map(log => {
                const isApproved = log.action === 'approved';
                const isOrder = log.type === 'order';
                const isProfile = log.type === 'profile';
                
                return (
                  <div key={log.id} style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0.8rem 1rem', background: isApproved ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isApproved ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'uppercase' }}>
                        {isApproved ? <CheckCircle size={14} /> : <Trash2 size={14} />}
                        {isOrder ? 'Order' : isProfile ? 'Profile' : 'Payment'} {isApproved ? 'Approved' : 'Deleted'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} /> {format(new Date(log.timestamp), 'dd MMM, hh:mm a')}
                      </span>
                    </div>
                    
                    <div style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                        <User size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{log.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({log.mobile})</span>
                      </div>
                      
                      <div style={{ background: 'var(--background)', padding: '0.8rem', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                          {log.details}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default AdminHistoryModal;
