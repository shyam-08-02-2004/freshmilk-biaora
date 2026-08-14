import React from 'react';
import { Milk, History, ShieldAlert, Globe } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Header = ({ totalBill, monthTotalBill, monthPaidBill, billUpdated, onOpenHistory, onOpenProfile, onAdminContactToggle, onOpenPayment, onOpenAdminRevenue, currentUser }) => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={onOpenProfile}>
          <div className="brand-icon">
            <Milk size={20} />
          </div>
          <h1>FreshMilk Biaora</h1>
        </div>
        
        <div className={billUpdated ? 'bill-updated' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.6rem 0.8rem', minWidth: '155px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: 'var(--text-primary)' }}>
          {currentUser?.role !== 'admin' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Month Bill:</span>
                <span style={{ fontWeight: '600' }}>₹{monthTotalBill}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t('paid')}:</span>
                <span style={{ fontWeight: '600', color: '#10b981' }}>-₹{monthPaidBill}</span>
              </div>
              <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '2px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 'bold' }}>Remain:</span>
                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>₹{totalBill}</span>
              </div>
              <button 
                onClick={onOpenPayment}
                style={{ width: '100%', marginTop: '0.3rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {t('pay_bill')}
              </button>
            </>
          ) : (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', cursor: 'pointer', padding: '0.2rem', borderRadius: '8px', transition: 'background 0.2s' }}
              onClick={onOpenAdminRevenue}
              title="Click to view monthly revenue"
            >
              <span className="bill-label">Total Earnings</span>
              <div className="bill-amount" style={{ fontSize: '1.2rem' }}>
                <span>₹</span>{totalBill}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          onClick={toggleLanguage}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-secondary)' }}
        >
          <Globe size={16} color="var(--primary)" />
          {language === 'en' ? 'हिन्दी' : 'English'}
        </button>

        <button 
          className="btn-history" 
          onClick={onAdminContactToggle}
        >
          <ShieldAlert size={18} />
          <span>Admin</span>
        </button>
        <button className="btn-history" onClick={onOpenHistory}>
          <History size={18} />
          <span>{t('history')}</span>
        </button>
        <div 
          onClick={onOpenProfile}
          style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: '2px solid var(--primary-light)', padding: '2px', flexShrink: 0 }}
        >
          <img src={currentUser?.avatar || "/assets/babu_logo.png"} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      </div>
    </header>
  );
};

export default Header;
