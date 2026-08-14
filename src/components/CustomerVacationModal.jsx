import React, { useState } from 'react';
import { X, Plane } from 'lucide-react';

const CustomerVacationModal = ({ isOpen, onClose, currentUser, onVacationUpdate }) => {
  const [vacationStart, setVacationStart] = useState(currentUser?.vacationStart || '');
  const [vacationEnd, setVacationEnd] = useState(currentUser?.vacationEnd || '');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content profile-modal" style={{ maxWidth: '400px', width: '90%', position: 'relative', background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} className="close-btn" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} color="var(--text-secondary)" />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: '#e0f2fe', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#0284c7' }}>
            <Plane size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Vacation Mode</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Pause daily milk delivery</p>
        </div>

        <div style={{ background: '#f0f9ff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>From Date</label>
              <input 
                type="date" 
                value={vacationStart} 
                onChange={(e) => setVacationStart(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #7dd3fc', outline: 'none', background: 'white', color: '#0c4a6e' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>To Date</label>
              <input 
                type="date" 
                value={vacationEnd} 
                onChange={(e) => setVacationEnd(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #7dd3fc', outline: 'none', background: 'white', color: '#0c4a6e' }}
              />
            </div>
          </div>
          
          <button 
            onClick={() => {
              onVacationUpdate(vacationStart, vacationEnd);
              onClose();
            }}
            style={{ width: '100%', padding: '0.8rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', fontSize: '1rem' }}
          >
            Save Vacation Dates
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerVacationModal;
