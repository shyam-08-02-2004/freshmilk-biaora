import React from 'react';
import { Milk, History, ShieldAlert } from 'lucide-react';

const Header = ({ totalBill, billUpdated, onOpenHistory, onOpenProfile, isAdminMode, toggleAdminMode }) => {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={onOpenProfile}>
          <div className="brand-icon">
            <Milk size={20} />
          </div>
          <h1>FreshMilk Biaora</h1>
        </div>
        <div 
          onClick={onOpenProfile}
          style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: '2px solid var(--primary-light)', padding: '2px' }}
        >
          <img src="/assets/avatar.png" alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      </div>
      
      <div className="header-right">
        <button 
          className="btn-history" 
          onClick={toggleAdminMode}
          style={{ background: isAdminMode ? 'var(--primary)' : 'transparent', color: isAdminMode ? 'white' : 'var(--text-primary)' }}
        >
          <ShieldAlert size={18} />
          <span>{isAdminMode ? 'Exit Admin' : 'Admin'}</span>
        </button>
        {!isAdminMode && (
          <button className="btn-history" onClick={onOpenHistory}>
            <History size={18} />
            <span>History</span>
          </button>
        )}
        {!isAdminMode && (
          <div className={`bill-card ${billUpdated ? 'bill-updated' : ''}`}>
            <span className="bill-label">Total Bill</span>
            <div className="bill-amount">
              <span>₹</span>{totalBill}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
