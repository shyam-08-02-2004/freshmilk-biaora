import React, { useState, useEffect } from 'react';
import { Home, ShoppingBag, Plus, FileText, User, Menu, Bell, CreditCard, HelpCircle, Plane, Download, Leaf } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const CustomerLayout = ({ 
  children, 
  currentUser, 
  activeTab, 
  setActiveTab,
  onOpenHistory,
  onOpenPayment,
  onOpenProfile,
  onOpenQuickMilk,
  onOpenVacation,
  onAdminContactToggle
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallCard, setShowInstallCard] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    const installedHandler = () => { setIsInstalled(true); setDeferredPrompt(null); setShowInstallCard(false); };
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
      setShowInstallCard(false);
      return;
    }
    setShowInstallCard(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { setDeferredPrompt(null); }
  };

  const handleNavClick = (tab) => {
    if (tab === 'history') onOpenHistory();
    else if (tab === 'payment') onOpenPayment();
    else if (tab === 'profile') onOpenProfile();
    else if (tab === 'vacation') onOpenVacation();
    else {
      setActiveTab(tab);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="customer-layout">
      {/* Mobile Top Header */}
      <div className="mobile-top-header">
        <button className="icon-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu size={24} color="var(--text-primary)" />
        </button>
        <div className="brand" style={{ gap: '0.5rem', cursor: 'pointer' }} onClick={onAdminContactToggle}>
          <img src="/assets/babu_logo_new.jpg" alt="Logo" style={{ height: '36px', width: '36px', borderRadius: '8px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--secondary)', lineHeight: '1' }}>FreshMilk</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1' }}>Biaora</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            onClick={toggleLanguage}
            style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.3rem 0.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {language === 'en' ? 'अ/A' : 'A/अ'}
          </button>

          {/* Bell/Download icon */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowInstallCard(prev => !prev)}
              style={{
                position: 'relative', width: '36px', height: '36px', borderRadius: '50%',
                background: (!isInstalled) ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.2)',
                border: (!isInstalled) ? 'none' : '1px solid rgba(255, 255, 255, 0.4)',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: (!isInstalled) ? '0 2px 8px rgba(16,185,129,0.4)' : 'none',
              }}
              title={!isInstalled ? "App Download Karen" : "Notifications"}
            >
              {!isInstalled ? (
                <>
                  <Download size={18} color="white" />
                  <span style={{
                    position: 'absolute', top: '0px', right: '0px', width: '10px', height: '10px',
                    background: '#ef4444', borderRadius: '50%', border: '2px solid white',
                    animation: 'pulse 2s infinite'
                  }} />
                </>
              ) : (
                <Bell size={20} color="white" />
              )}
            </button>

            {/* Install card dropdown */}
            {showInstallCard && !isInstalled && (
              <div style={{
                position: 'absolute', top: '44px', right: 0, zIndex: 9999,
                background: 'white', borderRadius: '16px', padding: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)', minWidth: '220px',
                border: '1px solid #e5e7eb', animation: 'slideDown 0.2s ease'
              }}>
                <img src="/icon.jpg" alt="App" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', display: 'block', margin: '0 auto 10px' }} />
                <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.95rem', color: '#1a1a1a', margin: '4px 0' }}>FreshMilk Biaora</div>
                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#6b7280', marginBottom: '14px' }}>Apne phone mein install karo!</div>
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

            {/* Normal notification card when already installed or no prompt */}
            {showInstallCard && isInstalled && (
              <div style={{
                position: 'absolute', top: '44px', right: 0, zIndex: 9999,
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
        </div>
      </div>


      {/* Desktop Sidebar */}
      <aside className={`desktop-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand" style={{ cursor: 'pointer' }} onClick={onAdminContactToggle}>
          <img src="/assets/babu_logo_new.jpg" alt="Logo" style={{ height: '48px', width: '48px', borderRadius: '12px', objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--secondary)', lineHeight: '1' }}>FreshMilk</span>
            <span style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1' }}>Biaora</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>
            <Home size={20} /> Dashboard
          </button>
          <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleNavClick('history')}>
            <ShoppingBag size={20} /> My Orders
          </button>
          <button className={`nav-item ${activeTab === 'bill' ? 'active' : ''}`} onClick={() => handleNavClick('payment')}>
            <FileText size={20} /> My Bill
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => handleNavClick('history')}>
            <CreditCard size={20} /> Payment History
          </button>
          <button className="nav-item" onClick={() => handleNavClick('profile')}>
            <User size={20} /> Profile
          </button>
          <button className="nav-item" onClick={() => handleNavClick('vacation')}>
            <Plane size={20} /> Vacation
          </button>
          <button className="nav-item" onClick={() => alert('Support line: 7509766655')}>
            <HelpCircle size={20} /> Help & Support
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <div className="promo-card">
            <h4>Fresh & Pure Everyday</h4>
            <p>We deliver purity at your doorstep.</p>
            <img src="/assets/milk.png" alt="Milk" style={{ height: '60px', marginTop: '1rem' }} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="customer-main-content">
        {/* Desktop Header */}
        <header className="desktop-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.2rem' }}>Hi, {currentUser?.name?.split(' ')[0] || 'Customer'} 👋</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Good Morning! Fresh milk, every day.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="lang-btn" onClick={toggleLanguage}>
              🌐 {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
            <button className="desktop-btn" onClick={() => onOpenHistory()}>
              <ShoppingBag size={18} /> History
            </button>
            
            {/* Desktop Install Bell */}
            <div style={{ position: 'relative' }}>
              <button
                className="desktop-btn"
                style={{ position: 'relative', padding: '0.4rem', borderRadius: '50%', background: 'white', color: 'var(--primary)', border: '1px solid var(--border)' }}
                onClick={() => setShowInstallCard(prev => !prev)}
                title={!isInstalled ? 'App Download Karen' : 'Notifications'}
              >
                {!isInstalled ? (
                  <>
                    <Download size={20} />
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                  </>
                ) : (
                  <Bell size={20} />
                )}
              </button>

              {/* Install card dropdown */}
              {showInstallCard && !isInstalled && (
                <div style={{
                  position: 'absolute', top: '50px', right: 0, zIndex: 9999,
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
              
              {/* Normal notification card when already installed */}
              {showInstallCard && isInstalled && (
                <div style={{
                  position: 'absolute', top: '50px', right: 0, zIndex: 9999,
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
          </div>
        </header>

        <div className="content-scroll-area">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => handleNavClick('home')}>
          <Home size={22} />
          <span>Home</span>
        </button>
        <button className={`bottom-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleNavClick('history')}>
          <ShoppingBag size={22} />
          <span>Orders</span>
        </button>
        <button className={`bottom-nav-item ${activeTab === 'sabzi' ? 'active' : ''}`} onClick={() => setActiveTab('sabzi')}>
          <Leaf size={22} color={activeTab === 'sabzi' ? 'var(--primary)' : 'currentColor'} />
          <span style={{ color: activeTab === 'sabzi' ? 'var(--primary)' : 'currentColor' }}>Sabzi</span>
        </button>
        <div className="bottom-nav-fab-container">
          <button className="bottom-nav-fab" onClick={() => onOpenQuickMilk()}>
            <Plus size={28} color="white" />
          </button>
          <span>Order</span>
        </div>
        <button className={`bottom-nav-item ${activeTab === 'bill' ? 'active' : ''}`} onClick={() => handleNavClick('payment')}>
          <FileText size={22} />
          <span>My Bill</span>
        </button>
        <button className="bottom-nav-item" onClick={() => handleNavClick('profile')}>
          <User size={22} />
          <span>Profile</span>
        </button>

      </nav>
    </div>
  );
};

export default CustomerLayout;
