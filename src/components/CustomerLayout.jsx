import React, { useState } from 'react';
import { Home, ShoppingBag, Plus, FileText, User, Menu, Bell, CreditCard, HelpCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const CustomerLayout = ({ 
  children, 
  currentUser, 
  activeTab, 
  setActiveTab,
  onOpenHistory,
  onOpenPayment,
  onOpenProfile
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    if (tab === 'history') onOpenHistory();
    else if (tab === 'payment') onOpenPayment();
    else if (tab === 'profile') onOpenProfile();
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
        <div className="brand" style={{ gap: '0.5rem' }}>
          <img src="/assets/babu_logo.png" alt="Logo" style={{ height: '32px' }} />
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
          <button className="icon-btn" style={{ position: 'relative' }}>
            <Bell size={22} color="var(--text-primary)" />
            <span style={{ position: 'absolute', top: '0px', right: '2px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }}></span>
          </button>
          <button className="icon-btn profile-btn" onClick={() => onOpenProfile()}>
            <User size={20} color="var(--secondary)" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`desktop-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/assets/babu_logo.png" alt="Logo" style={{ height: '40px' }} />
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="lang-btn">🌐 हिन्दी</button>
            <button className="desktop-btn" onClick={() => onOpenHistory()}>
              <ShoppingBag size={18} /> History
            </button>
            <button className="profile-btn large" onClick={() => onOpenProfile()}>
              <User size={20} color="white" />
            </button>
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
          <span>My Orders</span>
        </button>
        <div className="bottom-nav-fab-container">
          <button className="bottom-nav-fab" onClick={() => handleNavClick('home')}>
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
