import React, { useState, useEffect } from 'react';
import { Milk, History, ShieldAlert, Globe, Plane, Download, Bell } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Header = ({ totalBill, monthTotalBill, monthPaidBill, billUpdated, onOpenHistory, onOpenProfile, onAdminContactToggle, onOpenPayment, onOpenAdminRevenue, onOpenVacation, currentUser }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    const installedHandler = () => { setIsInstalled(true); setDeferredPrompt(null); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("App install karne ke liye apne browser (Chrome/Safari) ke options me 'Install App' ya 'Add to Home Screen' par click karein. Laptop me URL bar ke right side me Install icon hota hai.");
      setShowTooltip(false);
      return;
    }
    setShowTooltip(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { setDeferredPrompt(null); }
  };
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

        {currentUser?.role !== 'admin' && (
          <button className="btn-history" onClick={onOpenHistory}>
            <History size={18} />
            <span className="hidden-mobile">{t('history')}</span>
          </button>
        )}

        {currentUser?.role !== 'admin' && (
          <button className="btn-history" onClick={onOpenVacation} style={{ background: '#e0f2fe', color: '#0284c7', borderColor: '#bae6fd' }}>
            <Plane size={18} />
            <span className="hidden-mobile">Vacation</span>
          </button>
        )}

        {/* PWA Install Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowTooltip(prev => !prev)}
            style={{
              position: 'relative', width: '40px', height: '40px', borderRadius: '50%',
              background: (!isInstalled) ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white',
              border: (!isInstalled) ? 'none' : '1px solid var(--border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: (!isInstalled) ? '0 2px 8px rgba(16,185,129,0.4)' : 'none',
              flexShrink: 0, transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            title={!isInstalled ? "App Download Karen" : "Notifications"}
          >
            {!isInstalled ? (
              <>
                <Download size={18} color="white" />
                <span style={{
                  position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px',
                  background: '#ef4444', borderRadius: '50%', border: '2px solid white',
                  animation: 'pulse 2s infinite'
                }} />
              </>
            ) : (
              <Bell size={20} color="var(--primary)" />
            )}
          </button>

          {/* Dropdown card on click */}
          {showTooltip && !isInstalled && (
            <div style={{
              position: 'absolute', top: '48px', right: 0, zIndex: 9999,
              background: 'white', borderRadius: '16px', padding: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)', minWidth: '220px',
              border: '1px solid #e5e7eb', animation: 'slideDown 0.2s ease'
            }}>
              <img src="/icon.jpg" alt="App" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', display: 'block', margin: '0 auto 10px' }} />
              <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.95rem', color: '#1a1a1a', marginBottom: '4px' }}>FreshMilk Biaora</div>
              <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#6b7280', marginBottom: '14px' }}>Apne device mein install karo!</div>
              <button
                onClick={handleInstallClick}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white', border: 'none', borderRadius: '10px', padding: '10px',
                  fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Download size={16} /> Download App
              </button>
            </div>
          )}

          {showTooltip && isInstalled && (
            <div style={{
              position: 'absolute', top: '48px', right: 0, zIndex: 9999,
              background: 'white', borderRadius: '16px', padding: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)', minWidth: '200px',
              border: '1px solid #e5e7eb', animation: 'slideDown 0.2s ease',
              textAlign: 'center', color: '#6b7280', fontSize: '0.85rem'
            }}>
              <Bell size={28} color="#10b981" style={{ margin: '0 auto 8px', display: 'block' }} />
              ✅ App installed hai!
            </div>
          )}
        </div>

        <div 
          onClick={onOpenProfile}
          style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: '2px solid var(--primary-light)', padding: '2px', flexShrink: 0 }}
        >
          <img src={currentUser?.avatar || "/assets/babu_logo_new.jpg"} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      </div>
    </header>
  );
};

export default Header;
