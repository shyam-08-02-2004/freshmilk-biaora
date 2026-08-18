import React from 'react';
import { Plane, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const AdminVacations = ({ registeredUsers }) => {
  const usersOnVacation = registeredUsers.filter(user => user.vacationStart && user.vacationEnd);

  // Sort by vacation start date (soonest first)
  usersOnVacation.sort((a, b) => new Date(a.vacationStart) - new Date(b.vacationStart));

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '1.5rem', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', padding: '1rem', borderRadius: '12px', color: 'white', boxShadow: '0 4px 10px rgba(14, 165, 233, 0.2)' }}>
        <Plane size={28} />
        <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Customer Vacations ({usersOnVacation.length})</h2>
      </div>

      {usersOnVacation.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
          <Plane size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No active vacations</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>None of your customers have set vacation dates.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {usersOnVacation.map(user => {
            const startDate = new Date(user.vacationStart);
            const endDate = new Date(user.vacationEnd);
            const isCurrentlyOnVacation = new Date() >= startDate && new Date() <= endDate;

            return (
              <div key={user.mobile} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={user.avatar || "/assets/babu_logo_new.jpg"} alt={user.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{user.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.mobile}</span>
                  </div>
                </div>

                <div style={{ background: isCurrentlyOnVacation ? '#fef2f2' : '#f0f9ff', border: `1px solid ${isCurrentlyOnVacation ? '#fecaca' : '#bae6fd'}`, padding: '0.8rem 1.2rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Calendar size={20} color={isCurrentlyOnVacation ? '#ef4444' : '#0ea5e9'} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                      {isCurrentlyOnVacation ? '🟢 Currently on Vacation' : '⏳ Upcoming Vacation'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminVacations;
