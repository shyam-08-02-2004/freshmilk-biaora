import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Users, Milk, CheckCircle, Trash2, KeyRound, UserCheck, XCircle, Phone, Clock, ArrowLeft, Truck, DownloadCloud, BellRing, Package, BarChart3, Megaphone, Receipt, Camera, FileText, Plane, Plus, MessageCircle, Search, Download, Bell } from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import AdminHistoryModal from './AdminHistoryModal';
import AdminDeliverySheet from './AdminDeliverySheet';
import AdminBroadcasts from './AdminBroadcasts';
import AdminExpenses from './AdminExpenses';
import AdminAnalytics from './AdminAnalytics';
import AdminExportData from './AdminExportData';
import AdminPaymentReminders from './AdminPaymentReminders';
import AdminInventory from './AdminInventory';
import AdminVacations from './AdminVacations';
import CustomerPassbook from './CustomerPassbook';
import QRScannerModal from './QRScannerModal';
import AdminBulkCashEntry from './AdminBulkCashEntry';
import MilkCalendar from './MilkCalendar';
import AdminSabziPanel from './AdminSabziPanel';
import { useLanguage } from '../LanguageContext';

const AdminDashboard = ({ 
  activeTab, setActiveTab,
  prices, registeredUsers, globalOrders, 
  onApproveOrder, 
  onDeliverOrder,
  onDeliverAll,
  onRejectOrder, onEditUserOrder, onToggleUserStatus,
  profileRequests, onApproveProfile, onRejectProfile,
  paymentRequests, onApprovePayment, onRejectPayment,
  globalPayments, setGlobalPayments, adminLogs,
  monthlyOverrides, setMonthlyOverrides,
  broadcasts, setBroadcasts,
  globalExpenses, setGlobalExpenses,
  globalInventory, setGlobalInventory,
  globalVegetables, setGlobalVegetables,
  globalSabziOrders, setGlobalSabziOrders,
  onSuccessAnimation
}) => {
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('admin_selectedUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    if (selectedUser) {
      sessionStorage.setItem('admin_selectedUser', JSON.stringify(selectedUser));
    } else {
      sessionStorage.removeItem('admin_selectedUser');
    }
  }, [selectedUser]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [showAllMoreFeatures, setShowAllMoreFeatures] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPassbookOpen, setIsPassbookOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isBulkCashOpen, setIsBulkCashOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallCard, setShowInstallCard] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Compute all active orders
  const allActiveOrders = useMemo(() => {
    const active = [];
    registeredUsers.forEach(user => {
      Object.entries(globalOrders[user.mobile] || {}).forEach(([dateStr, order]) => {
        if (order.status === 'pending' || order.status === 'approved') {
          active.push({ date: dateStr, user: user, order: order });
        }
      });
    });
    return active;
  }, [registeredUsers, globalOrders]);

  const prevActiveCount = useRef(allActiveOrders.length);

  useEffect(() => {
    if (prevActiveCount.current > 0 && allActiveOrders.length === 0) {
      // Trigger Celebration!
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
      });
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4500);
    }
    prevActiveCount.current = allActiveOrders.length;
  }, [allActiveOrders.length]);

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

  const touchTimer = React.useRef(null);

  const handleTouchStart = (e, orderKey) => {
    touchTimer.current = setTimeout(() => {
      toggleOrderSelection(orderKey);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
  };

  const handleTouchMove = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
  };

  const toggleOrderSelection = (orderKey) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderKey)) return prev.filter(k => k !== orderKey);
      return [...prev, orderKey];
    });
  };

  const handleBulkApprove = () => {
    if (!window.confirm(`Approve ${selectedOrders.length} selected orders?`)) return;
    selectedOrders.forEach(key => {
      const [mobile, date] = key.split('_');
      // Only approve if it's currently pending (status check is done in parent, but safe to call)
      onApproveOrder(mobile, date);
    });
    setSelectedOrders([]);
  };

  const handleBulkDeliver = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let hasFuture = false;
    let countToDeliver = 0;

    selectedOrders.forEach(key => {
      const [, date] = key.split('_');
      if (date > todayStr) {
        hasFuture = true;
      } else {
        countToDeliver++;
      }
    });

    if (hasFuture) {
      alert('One or more selected orders are for a future date. They cannot be delivered today. They will be skipped.');
    }

    if (countToDeliver === 0) return;

    if (!window.confirm(`Mark ${countToDeliver} selected orders as Delivered?`)) return;
    
    selectedOrders.forEach(key => {
      const [mobile, date] = key.split('_');
      if (date <= todayStr) {
        onDeliverOrder(mobile, date);
      }
    });
    setSelectedOrders([]);
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} selected orders completely?`)) return;
    selectedOrders.forEach(key => {
      const [mobile, date] = key.split('_');
      onRejectOrder(mobile, date);
    });
    setSelectedOrders([]);
  };

  React.useEffect(() => {
    sessionStorage.setItem('admin_activeTab', activeTab);
  }, [activeTab]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const [editingOrderDate, setEditingOrderDate] = useState(null);
  const [editOrderValues, setEditOrderValues] = useState({ milk: 0, ghee: 0, chach: 0, paneer: 0, curd: 0 });
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [expandedPaymentUsers, setExpandedPaymentUsers] = useState({});
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editSummaryValues, setEditSummaryValues] = useState({ mTotal: 0, mPaid: 0, mRemain: 0 });

  const togglePaymentUser = (mobile) => {
    setExpandedPaymentUsers(prev => ({...prev, [mobile]: !prev[mobile]}));
  };

  const startEditOrder = (date, order) => {
    setEditingOrderDate(date);
    setEditOrderValues({ milk: order.milk || 0, ghee: order.ghee || 0, chach: order.chach || 0, paneer: order.paneer || 0, curd: order.curd || 0 });
  };

  const saveEditOrder = (userMobile, date) => {
    onEditUserOrder(userMobile, date, editOrderValues);
    setEditingOrderDate(null);
  };

  const handleBulkCashSubmit = (entries) => {
    setGlobalPayments(prev => {
      const next = { ...prev };
      entries.forEach(e => {
        const userPayments = next[e.mobile] || [];
        next[e.mobile] = [...userPayments, {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          amount: parseFloat(e.amount),
          utr: 'CASH',
          timestamp: new Date().toISOString(),
          paymentMonth: format(new Date(), 'yyyy-MM'),
          status: 'approved'
        }];
      });
      return next;
    });
    setIsBulkCashOpen(false);
  };

  const calculateUserDue = (user) => {
    let due = 0;
    const userOrders = globalOrders[user.mobile] || {};
    Object.values(userOrders).forEach(order => {
      if (order.status === 'delivered') {
        due += (order.milk || 0) * prices.milk;
        due += (order.ghee || 0) * prices.ghee;
        due += (order.chach || 0) * prices.chach;
      }
    });
    
    let paid = 0;
    const userPayments = globalPayments[user.mobile] || [];
    userPayments.forEach(payment => {
      if (payment.status === 'approved') {
        paid += parseFloat(payment.amount);
      }
    });
    
    return Math.max(0, due - paid);
  };

  const calculateMonthlyUserSummary = (userMobile, monthStr) => {
    let mTotal = 0;
    let mPaid = 0;
    
    let mPrevBill = 0;
    let mPrevPaid = 0;

    const userOrders = globalOrders[userMobile] || {};
    Object.entries(userOrders).forEach(([dateStr, order]) => {
      if (dateStr.startsWith(monthStr) && order.status === 'delivered') {
        mTotal += (order.milk || 0) * prices.milk;
        mTotal += (order.ghee || 0) * prices.ghee;
        mTotal += (order.chach || 0) * prices.chach;
        mTotal += (order.paneer || 0) * prices.paneer;
        mTotal += (order.curd || 0) * prices.curd;
      } else if (dateStr < monthStr && order.status === 'delivered') {
        mPrevBill += (order.milk || 0) * prices.milk;
        mPrevBill += (order.ghee || 0) * prices.ghee;
        mPrevBill += (order.chach || 0) * prices.chach;
        mPrevBill += (order.paneer || 0) * prices.paneer;
        mPrevBill += (order.curd || 0) * prices.curd;
      }
    });

    const userPayments = globalPayments[userMobile] || [];
    userPayments.forEach(payment => {
      const pMonth = payment.paymentMonth || payment.timestamp.substring(0, 7);
      if (payment.status === 'approved') {
        if (pMonth === monthStr) {
          mPaid += parseFloat(payment.amount);
        } else if (pMonth < monthStr) {
          mPrevPaid += parseFloat(payment.amount);
        }
      }
    });

    Object.entries(monthlyOverrides?.[userMobile] || {}).forEach(([pMonth, adj]) => {
      if (pMonth < monthStr) {
        if (adj.mTotal !== undefined && adj.mTotalAdj === undefined) {
           // Skip complex historical override replace
        } else {
           mPrevBill += (adj.mTotalAdj || 0);
           mPrevPaid += (adj.mPaidAdj || 0);
        }
      }
    });
    
    const mPreviousDues = mPrevBill - mPrevPaid;

    const adj = monthlyOverrides?.[userMobile]?.[monthStr];
    if (adj) {
      if (adj.mTotal !== undefined && adj.mTotalAdj === undefined) {
        return { mTotal: adj.mTotal, mPaid: adj.mPaid, mPreviousDues, mRemain: mPreviousDues + adj.mRemain };
      }
      mTotal += (adj.mTotalAdj || 0);
      mPaid += (adj.mPaidAdj || 0);
    }

    return { mTotal, mPaid, mPreviousDues, mRemain: Math.max(0, mPreviousDues + mTotal - mPaid) };
  };

  const pendingOrdersCount = Object.values(globalOrders || {}).reduce((total, userOrders) => {
    return total + Object.values(userOrders || {}).filter(order => order.status === 'pending').length;
  }, 0);



  const handleWhatsAppBill = (user, customMonthStr = null) => {
    const monthStr = customMonthStr || new Date().toISOString().slice(0, 7);
    // Parse "2026-08" to Date
    const [year, month] = monthStr.split('-');
    const dateObj = new Date(year, month - 1, 1);
    const monthName = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const due = calculateUserDue(user);
    const { mTotal, mPaid } = calculateMonthlyUserSummary(user.mobile, monthStr);
    
    const message = `Hello ${user.name} ,\n\nThis is your FreshMilk Biaora bill for ${monthName}.\n\nTotal Bill: ₹${mTotal}\nPaid: ₹${mPaid}\nRemaining Due: ₹${due}\n\nPlease pay the pending amount.`;
    
    window.open(`https://wa.me/91${user.mobile}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="admin-container">
      {/* CELEBRATION OVERLAY */}
      {showCelebration && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{ textAlign: 'center', animation: 'bounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
            <h1 style={{ color: '#10b981', fontSize: '3rem', margin: '0 0 1rem', textShadow: '0 4px 20px rgba(16,185,129,0.5)' }}>Great Job! 🎉</h1>
            <p style={{ color: 'white', fontSize: '1.2rem', margin: '0' }}>Aaj ki sabhi deliveries poori ho gayi!</p>
          </div>
          
          <div style={{ position: 'absolute', bottom: '20%', width: '100%', height: '100px', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: '-20%', animation: 'driveAcross 3s cubic-bezier(0.4, 0, 0.2, 1) forwards', display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
              <Truck size={80} color="#3b82f6" />
              <div style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}>
                Babu Fresh Milk
              </div>
            </div>
            {/* Road */}
            <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '4px', background: '#334155', borderTop: '2px dashed #475569' }}></div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && <div className="admin-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* LEFT SIDEBAR */}
      <div className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src="/assets/admin_photo.jpg" alt="Admin Avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.3rem', color: 'var(--text-primary)' }}>Super Admin Panel</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Welcome, Shyam Dangi</p>
        </div>
        
        <div className="admin-sidebar-links" style={{ paddingBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 1rem 0.2rem', marginTop: '0.5rem' }}>Main Menu</div>
          <button 
            onClick={() => { setIsHistoryOpen(true); setIsMobileMenuOpen(false); }}
            className="admin-sidebar-btn"
          >
            <Clock size={20} /> History Log
          </button>
          <button 
            onClick={() => handleTabClick('users')}
            className={`admin-sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            <Users size={20} /> Customers
          </button>
          <button 
            onClick={() => handleTabClick('orders')}
            className={`admin-sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            <Milk size={20} /> Orders
            {pendingOrdersCount > 0 && (
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)' }}>
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => handleTabClick('profiles')}
            className={`admin-sidebar-btn ${activeTab === 'profiles' ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            <UserCheck size={20} /> Profiles
            {Object.keys(profileRequests || {}).length > 0 && (
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)' }}>
                {Object.keys(profileRequests).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => handleTabClick('payments')}
            className={`admin-sidebar-btn ${activeTab === 'payments' ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', width: '20px', textAlign: 'center' }}>₹</span> Payments
            {Object.keys(paymentRequests || {}).length > 0 && (
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)' }}>
                {Object.keys(paymentRequests).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => handleTabClick('sabzi')}
            className={`admin-sidebar-btn ${activeTab === 'sabzi' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.2rem', width: '20px', textAlign: 'center' }}>🥬</span> Sabzi Orders
          </button>

          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', padding: '1rem 1rem 0.2rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)' }}>More Features</div>
          <button 
            onClick={() => handleTabClick('delivery')}
            className={`admin-sidebar-btn ${activeTab === 'delivery' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.2rem', width: '20px', textAlign: 'center' }}>📦</span> Delivery Sheet
          </button>
          <button 
            onClick={() => handleTabClick('broadcasts')}
            className={`admin-sidebar-btn ${activeTab === 'broadcasts' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.2rem', width: '20px', textAlign: 'center' }}>📢</span> Broadcasts
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', height: showAllMoreFeatures ? 'auto' : '0', overflow: 'hidden', opacity: showAllMoreFeatures ? 1 : 0, transition: 'all 0.3s ease-in-out' }}>
            <button 
              onClick={() => handleTabClick('expenses')}
              className={`admin-sidebar-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.2rem', width: '20px', textAlign: 'center' }}>💵</span> Expenses
            </button>
            <button 
              onClick={() => handleTabClick('vacations')}
              className={`admin-sidebar-btn ${activeTab === 'vacations' ? 'active' : ''}`}
            >
              <Plane size={20} /> Vacations
            </button>
            <button 
              onClick={() => handleTabClick('analytics')}
              className={`admin-sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.2rem', width: '20px', textAlign: 'center' }}>🗺️</span> Analytics Map
            </button>
            <button 
              onClick={() => handleTabClick('export')}
              className={`admin-sidebar-btn ${activeTab === 'export' ? 'active' : ''}`}
            >
              <DownloadCloud size={20} /> Export Data
            </button>
            <button 
              onClick={() => handleTabClick('reminders')}
              className={`admin-sidebar-btn ${activeTab === 'reminders' ? 'active' : ''}`}
            >
              <BellRing size={20} /> Payment Reminders
            </button>
            <button 
              onClick={() => handleTabClick('inventory')}
              className={`admin-sidebar-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            >
              <Package size={20} /> Inventory
            </button>
          </div>

          <button 
            onClick={() => setShowAllMoreFeatures(!showAllMoreFeatures)}
            style={{ 
              background: 'none', border: 'none', color: 'var(--primary)', 
              fontSize: '0.85rem', fontWeight: 'bold', padding: '0.6rem 1rem', 
              cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.3rem', width: '100%', marginTop: '0.2rem' 
            }}
          >
            {showAllMoreFeatures ? '▲ Show Less' : '▼ View More (6)'}
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="admin-content-area">
        <div className="admin-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="admin-back-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span style={{fontSize:'1.5rem', lineHeight:1}}>☰</span>
            </button>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {activeTab === 'sabzi' ? 'Sabzi Orders (Updated)' : `${activeTab} Management`}
            </h2>
          </div>
        </div>
        
        <div className="admin-layout" style={{ display: 'block', overflowY: 'auto', flex: 1 }}>
        {activeTab === 'users' && (
          <div style={{ padding: '1rem' }}>
            {/* Daily To-Do Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div onClick={() => handleTabClick('payments')} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '1.2rem', borderRadius: '16px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '50%' }}><Receipt size={24} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.4rem' }}>{Object.keys(paymentRequests || {}).length}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Pending Payments</p>
                </div>
              </div>
              <div onClick={() => handleTabClick('profiles')} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '1.2rem', borderRadius: '16px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '50%' }}><UserCheck size={24} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.4rem' }}>{Object.keys(profileRequests || {}).length}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Profile Approvals</p>
                </div>
              </div>
              <div onClick={() => handleTabClick('vacations')} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '1.2rem', borderRadius: '16px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '50%' }}><Plane size={24} /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.4rem' }}>
                    {registeredUsers.filter(u => u.vacationStart && u.vacationEnd && new Date() >= new Date(u.vacationStart) && new Date() <= new Date(u.vacationEnd)).length}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>On Vacation</p>
                </div>
              </div>
            </div>

            <div style={{ position: 'sticky', top: '0', zIndex: 10, background: 'var(--surface)', padding: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>All Customers ({registeredUsers.length})</h3>
                <button 
                  onClick={() => setIsQRScannerOpen(true)}
                  style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}
                >
                  <Camera size={18} /> Scan QR
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search by name, mobile, or flat..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {registeredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <Users size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                <p>No registered users yet.</p>
              </div>
            ) : (
              <div className="customers-grid">
                {registeredUsers.filter(user => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (user.name?.toLowerCase() || '').includes(query) || 
                         (user.mobile || '').includes(query) || 
                         (user.flat?.toLowerCase() || '').includes(query);
                }).map(user => {
                  const due = calculateUserDue(user);
                  const userPayments = globalPayments[user.mobile] || [];
                  const lastPayment = userPayments.length > 0 ? userPayments[userPayments.length - 1] : null;
                  const daysSinceLastPayment = lastPayment ? Math.floor((new Date() - new Date(lastPayment.date)) / (1000 * 60 * 60 * 24)) : Infinity;
                  const isDefaulter = due > 1500 || (daysSinceLastPayment > 30 && due > 500);

                  return (
                  <div key={user.mobile} style={{ background: isDefaulter ? '#fef2f2' : 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${isDefaulter ? '#fca5a5' : 'var(--border)'}`, boxShadow: isDefaulter ? '0 4px 12px rgba(239, 68, 68, 0.1)' : '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img src={user.avatar || "/assets/babu_logo_new.jpg"} alt="User Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${isDefaulter ? '#ef4444' : 'var(--primary-light)'}` }} />
                        <div>
                          <h4 
                            onClick={() => { setSelectedUser(user); }}
                            style={{ fontSize: '1.2rem', color: isDefaulter ? '#b91c1c' : 'var(--primary)', marginBottom: '0.2rem', cursor: 'pointer', textDecoration: 'underline' }}
                            title="View Orders and Details"
                          >
                            {user.name}
                          </h4>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                            <a href={`tel:${user.mobile}`} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', background: 'var(--background)', border: '1px solid var(--border)', padding: '0.3rem 0.6rem', borderRadius: '12px' }}>
                              <Phone size={14} color="#2563eb" /> Call
                            </a>
                            <button onClick={(e) => { e.preventDefault(); handleWhatsAppBill(user); }} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--background)', border: '1px solid var(--border)', padding: '0.3rem 0.6rem', borderRadius: '12px', cursor: 'pointer' }}>
                              <MessageCircle size={14} color="#25D366" /> WhatsApp
                            </button>
                          </div>
                        </div>
                      </div>
                      <div style={{ background: isDefaulter ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isDefaulter ? '#ef4444' : '#10b981', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 'bold' }}>
                        Due: ₹{due}
                      </div>
                    </div>
                    {isDefaulter && (
                      <div style={{ background: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '6px', display: 'inline-flex', marginBottom: '1rem', fontWeight: 'bold' }}>
                        ⚠️ {due > 1500 ? 'High Outstanding Due' : 'Payment Overdue (>30 Days)'}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', background: 'var(--background)', padding: '1rem', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', alignItems: 'center', flexWrap: 'wrap' }}>
                        <strong style={{ minWidth: '70px' }}>Location:</strong> 
                        <span>{user.location || 'N/A'}</span>
                        {user.location && (
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.location + (user.location.includes(',') ? '' : ', Biaora'))}`} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ marginLeft: 'auto', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '0.4rem 0.8rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}
                            >
                              🗺️ Navigate
                            </a>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ minWidth: '70px' }}>Flat:</strong> <span>{user.flat || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ minWidth: '70px' }}>Password:</strong> 
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><KeyRound size={12} /> {user.password}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to permanently delete ${user.name}'s account and all their orders?`)) {
                          onDeleteUser(user.mobile);
                        }
                      }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                      <Trash2 size={18} /> Delete Account
                    </button>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <>
            <div style={{ padding: '1rem', flex: 1, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Order Requests & Delivery</h3>
              </div>
              
              {selectedOrders.length > 0 && (
                <div style={{ position: 'sticky', top: '0', zIndex: 100, background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {selectedOrders.length}
                    </div>
                    <strong style={{ color: 'var(--text-primary)' }}>Selected</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={handleBulkApprove} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={16}/> Approve</button>
                    <button onClick={handleBulkDeliver} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Truck size={16}/> Deliver</button>
                    <button onClick={handleBulkDelete} style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Trash2 size={16}/> Reject</button>
                    <button onClick={() => setSelectedOrders([])} style={{ padding: '0.5rem 1rem', background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              {(() => {
                if (allActiveOrders.length === 0) {
                  return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}><Package size={48} color="var(--border)" style={{ marginBottom: '1rem' }} /><p>No pending or approved order requests.</p></div>;
                }

                // 2. Group by date
                const groupedByDate = {};
                allActiveOrders.forEach(item => {
                  if (!groupedByDate[item.date]) groupedByDate[item.date] = [];
                  groupedByDate[item.date].push(item);
                });

                // Sort dates ascending
                const sortedDates = Object.keys(groupedByDate).sort();
                
                return sortedDates.map(dateStr => {
                  const ordersForDate = groupedByDate[dateStr];
                  const dateObj = new Date(dateStr + 'T00:00:00');
                  
                  // Check if this date is strictly in the future (tomorrow or later)
                  const todayStr = format(new Date(), 'yyyy-MM-dd');
                  const isFuture = dateStr > todayStr;
                  const isPast = dateStr < todayStr;
                  
                  const pendingCount = ordersForDate.filter(item => item.order.status === 'pending').length;
                  const approvedCount = ordersForDate.filter(item => item.order.status === 'approved').length;

                  return (
                    <div key={dateStr} style={{ marginBottom: '2rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '2px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ background: isFuture ? '#eff6ff' : (isPast ? '#fef3c7' : '#dcfce7'), padding: '0.6rem 1.2rem', borderRadius: '12px', textAlign: 'center', border: `1px solid ${isFuture ? '#bfdbfe' : (isPast ? '#fde68a' : '#bbf7d0')}` }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isFuture ? 'var(--primary)' : (isPast ? '#d97706' : '#16a34a'), lineHeight: 1.1 }}>{format(dateObj, 'dd')}</div>
                            <div style={{ fontSize: '0.85rem', color: isFuture ? '#3b82f6' : (isPast ? '#d97706' : '#16a34a'), fontWeight: 'bold' }}>{format(dateObj, 'MMM')}</div>
                          </div>
                          <div>
                            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>{format(dateObj, 'EEEE')}</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              <span style={{ color: pendingCount > 0 ? '#ef4444' : 'inherit', fontWeight: pendingCount > 0 ? 'bold' : 'normal' }}>{pendingCount} pending</span> • <span style={{ color: approvedCount > 0 ? '#10b981' : 'inherit', fontWeight: approvedCount > 0 ? 'bold' : 'normal' }}>{approvedCount} approved</span>
                            </p>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {pendingCount > 0 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Approve all ${pendingCount} pending orders for ${format(dateObj, 'dd MMM')}?`)) {
                                  ordersForDate.forEach(item => {
                                    if (item.order.status === 'pending') onApproveOrder(item.user.mobile, dateStr);
                                  });
                                }
                              }}
                              style={{ padding: '0.6rem 1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <CheckCircle size={18} /> Approve All
                            </button>
                          )}
                          
                          {approvedCount > 0 && (
                            <button
                              onClick={() => {
                                if (isFuture) {
                                  alert(`You cannot deliver future orders. Wait until ${format(dateObj, 'dd MMM')}!`);
                                  return;
                                }
                                if (window.confirm(`Mark all ${approvedCount} approved orders as Delivered for ${format(dateObj, 'dd MMM')}?`)) {
                                  ordersForDate.forEach(item => {
                                    if (item.order.status === 'approved') onDeliverOrder(item.user.mobile, dateStr);
                                  });
                                }
                              }}
                              style={{ padding: '0.6rem 1.2rem', background: isFuture ? '#cbd5e1' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: isFuture ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                              title={isFuture ? "Cannot deliver future orders" : "Mark Delivered"}
                            >
                              <Truck size={18} /> Deliver All
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {ordersForDate.map((item, idx) => {
                          const { user, order } = item;
                          const total = (order.milk || 0) * prices.milk + (order.ghee || 0) * prices.ghee + (order.chach || 0) * prices.chach + (order.paneer || 0) * prices.paneer + (order.curd || 0) * prices.curd;
                          const itemsList = [];
                          if (order.milk) itemsList.push(`${order.milk}L Milk`);
                          if (order.ghee) itemsList.push(`${order.ghee}Kg Ghee`);
                          if (order.chach) itemsList.push(`${order.chach}L Chach`);
                          if (order.paneer) itemsList.push(`${order.paneer} Paneer`);
                          if (order.curd) itemsList.push(`${order.curd} Curd`);
                          
                          const isPending = order.status === 'pending';
                          const orderKey = `${user.mobile}_${dateStr}`;
                          const isSelected = selectedOrders.includes(orderKey);
                          const isSelectionMode = selectedOrders.length > 0;

                          return (
                            <div 
                              key={orderKey + idx} 
                              style={{ background: isSelected ? '#eff6ff' : 'white', border: `2px solid ${isSelected ? 'var(--primary)' : isPending ? 'transparent' : 'transparent'}`, borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', cursor: isSelectionMode ? 'pointer' : 'default', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                              onTouchStart={(e) => handleTouchStart(e, orderKey)}
                              onTouchEnd={handleTouchEnd}
                              onTouchMove={handleTouchMove}
                              onClick={() => {
                                if (isSelectionMode) toggleOrderSelection(orderKey);
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div 
                                  onClick={(e) => { e.stopPropagation(); toggleOrderSelection(orderKey); }}
                                  style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, background: isSelected ? 'var(--primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                  {isSelected && <CheckCircle size={14} color="white" />}
                                </div>
                                <img src={user.avatar || '/assets/babu_logo_new.jpg'} alt="Avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} />
                                <div>
                                  <h4 
                                    onClick={() => { setSelectedUser(user); setShowAllOrders(false); setShowAllPayments(false); }}
                                    style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                  >
                                    {user.name}
                                  </h4>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Phone size={12} /> {user.mobile} {user.flat && `• Flat: ${user.flat}`}
                                  </div>
                                </div>
                              </div>
                              
                              <div style={{ flex: 1, minWidth: '200px', padding: '0 1rem' }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{itemsList.join(', ')}</div>
                                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold', marginTop: '0.2rem' }}>₹{total} {order.status === 'approved' && <span style={{fontSize: '0.75rem', color: '#16a34a', marginLeft: '0.5rem', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '8px'}}>Approved</span>}</div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {isPending ? (
                                  <>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onApproveOrder(user.mobile, dateStr); }}
                                      style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                      <CheckCircle size={16} /> Approve
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onRejectOrder(user.mobile, dateStr); }}
                                      style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isFuture) {
                                        alert(`Cannot deliver future orders. Wait until ${format(dateObj, 'dd MMM')}`);
                                        return;
                                      }
                                      onDeliverOrder(user.mobile, dateStr);
                                    }}
                                    style={{ padding: '0.5rem 1rem', background: isFuture ? '#cbd5e1' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: isFuture ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                  >
                                    <Truck size={16} /> Mark Delivered
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            
            {/* Floating Action Button for Orders */}
            <button
              onClick={() => {
                const todayStr = format(new Date(), 'yyyy-MM-dd');
                if (window.confirm(`Mark all approved orders for TODAY (${todayStr}) and PAST as Delivered?`)) {
                  // We only deliver for <= today
                  let count = 0;
                  registeredUsers.forEach(user => {
                    Object.entries(globalOrders[user.mobile] || {}).forEach(([dateStr, order]) => {
                      if (order.status === 'approved' && dateStr <= todayStr) {
                        onDeliverOrder(user.mobile, dateStr);
                        count++;
                      }
                    });
                  });
                  if (count === 0) alert("No approved orders found for today or past dates.");
                }
              }}
              style={{
                position: 'fixed',
                bottom: '80px',
                right: '20px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                cursor: 'pointer',
                zIndex: 100,
                transition: 'transform 0.2s',
              }}
            >
              <CheckCircle size={20} /> Deliver All Today
            </button>
          </>
        )}
        {activeTab === 'profiles' && (
          <div style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Pending Profile Update Requests</h3>
            {Object.keys(profileRequests || {}).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <UserCheck size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                <p>No pending profile requests.</p>
              </div>
            ) : (
              <div className="customers-grid">
                {Object.entries(profileRequests).map(([mobile, updates]) => {
                  const user = registeredUsers.find(u => u.mobile === mobile);
                  return (
                    <div 
                      key={mobile} 
                      onClick={() => {
                        const foundUser = registeredUsers.find(u => u.mobile === mobile);
                        if (foundUser) { setSelectedUser(foundUser); setShowAllOrders(false); setShowAllPayments(false); }
                      }}
                      style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <img src={user?.avatar || "/assets/babu_logo_new.jpg"} alt="User Avatar" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} />
                        <div>
                          <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem' }}>{user?.name || mobile}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>{mobile}</p>
                        </div>
                        <div style={{ marginLeft: 'auto', background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>Pending</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                        {updates.location !== undefined && updates.location !== user?.location && (
                          <div style={{ padding: '0.8rem', background: 'var(--background)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Location Change</span>
                            <s style={{ color: '#ef4444', marginRight: '0.5rem' }}>{user?.location}</s>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{updates.location}</span>
                          </div>
                        )}
                        {updates.flat !== undefined && updates.flat !== user?.flat && (
                          <div style={{ padding: '0.8rem', background: 'var(--background)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Flat Change</span>
                            <s style={{ color: '#ef4444', marginRight: '0.5rem' }}>{user?.flat}</s>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{updates.flat}</span>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem' }} onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => onApproveProfile(mobile)}
                          style={{ flex: 1, padding: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button 
                          onClick={() => onRejectProfile(mobile)}
                          style={{ flex: 1, padding: '0.8rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'payments' && (
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3>Payments Management</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>View pending requests and payment history</p>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  onClick={() => setIsBulkCashOpen(true)}
                  style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                >
                  <Plus size={18} /> Fast Cash Entry
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Filter Month:</label>
                  <input 
                    type="month" 
                    value={filterMonth} 
                    onChange={(e) => setFilterMonth(e.target.value)} 
                    style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {(() => {
              const usersWithPendingPayments = registeredUsers.filter(u => paymentRequests[u.mobile]);

              if (usersWithPendingPayments.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                    <p>No pending payment requests.</p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {usersWithPendingPayments.map(user => {
                    const req = paymentRequests[user.mobile];
                    
                    const monthlyPayments = (globalPayments[user.mobile] || [])
                      .filter(p => {
                        const pMonth = p.paymentMonth || p.timestamp.substring(0, 7);
                        return pMonth === filterMonth;
                      })
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                    return (
                      <div 
                        key={user.mobile} 
                        style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}
                      >
                        {/* User Info Header */}
                        <div 
                          onClick={() => { setSelectedUser(user); setShowAllOrders(false); setShowAllPayments(false); }}
                          style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <img src={user.avatar || "/assets/babu_logo_new.jpg"} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                            <div>
                              <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>{user.name}</h4>
                              <a href={`tel:${user.mobile}`} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--background)', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '0.2rem', width: 'fit-content' }}>
                                <Phone size={12} color="#2563eb" /> {user.mobile}
                              </a>
                            </div>
                          </div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>View profile →</span>
                        </div>

                        {/* Pending Payment Request */}
                        {req && (
                          <div style={{ padding: '1rem', background: '#fffbeb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                              <div style={{ flex: '1 1 200px' }}>
                                <p style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>⚠ Pending Payment</p>
                                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#b45309', marginBottom: '0.3rem' }}>₹{req.amount}</p>
                                <p style={{ fontSize: '0.8rem', color: '#92400e' }}>UTR: {req.utr}</p>
                                <p style={{ fontSize: '0.8rem', color: '#92400e' }}>For: {req.paymentMonth ? format(new Date(req.paymentMonth + '-01'), 'MMMM yyyy') : 'N/A'}</p>
                                <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.2rem' }}>{format(new Date(req.timestamp), 'dd MMM yyyy, hh:mm a')}</p>
                                {req.screenshot && (
                                  <div style={{ marginTop: '0.5rem' }}>
                                    <p style={{ fontSize: '0.7rem', color: '#b45309', marginBottom: '0.2rem' }}>Screenshot:</p>
                                    <img src={req.screenshot} alt="Screenshot" style={{ height: '80px', borderRadius: '6px', border: '1px solid #d97706', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); const w = window.open(); w.document.write(`<img src="${req.screenshot}" style="max-width:100%;display:block;margin:auto;" />`); }} />
                                  </div>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignSelf: 'center' }}>
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if(window.confirm(`Approve payment of ₹${req.amount}?`)) {
                                      onApprovePayment(user.mobile);
                                      if (onSuccessAnimation) onSuccessAnimation(`₹${req.amount} Payment Approved!`);
                                    }
                                  }}
                                  style={{ padding: '0.6rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                                >
                                  <CheckCircle size={15} /> Approve
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete this payment request?')) onRejectPayment(user.mobile); }}
                                  style={{ padding: '0.6rem 1rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                                >
                                  <Trash2 size={15} /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'expenses' && (
          <AdminExpenses
            globalExpenses={globalExpenses}
            setGlobalExpenses={setGlobalExpenses}
            globalPayments={globalPayments}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
          />
        )}

        {activeTab === 'sabzi' && (
          <AdminSabziPanel
            globalVegetables={globalVegetables}
            setGlobalVegetables={setGlobalVegetables}
            globalSabziOrders={globalSabziOrders}
            setGlobalSabziOrders={setGlobalSabziOrders}
            registeredUsers={registeredUsers}
            onBack={() => setActiveTab('users')}
          />
        )}
      </div>

      {isHistoryOpen && (
        <AdminHistoryModal 
          onClose={() => setIsHistoryOpen(false)}
          adminLogs={adminLogs}
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
        />
      )}
    
      {/* FULL PAGE USER DETAILS MODAL */}
      {selectedUser && (
        <div className="admin-profile-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, background: 'var(--background)', overflowY: 'auto' }} onClick={() => setIsEditingSummary(false)}>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedUser(null); setShowAllOrders(false); setShowAllPayments(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}
            >
              <ArrowLeft size={24} /> Back
            </button>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', flex: 1 }}>User Details</h2>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsPassbookOpen(true); }}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              <FileText size={16} /> Passbook
            </button>
          </div>
          
          <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }} onClick={(e) => { e.stopPropagation(); setShowAllOrders(false); setShowAllPayments(false); setIsEditingSummary(false); }}>

            {/* Milk Delivery Calendar for Admin */}
            <div style={{ marginBottom: '1.5rem' }} onClick={e => e.stopPropagation()}>
              <MilkCalendar
                orders={globalOrders[selectedUser.mobile] || {}}
                currentUser={selectedUser}
                isAdmin={true}
              />
            </div>

<div className="detail-header" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{selectedUser.name}'s Profile</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                          <strong>Location:</strong> {selectedUser.location} | <strong>Flat:</strong> {selectedUser.flat} | <KeyRound size={12} style={{ display: 'inline' }}/> <strong>Pass:</strong> {selectedUser.password}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          if (window.confirm(selectedUser.isActive === false ? 'Are you sure you want to activate this user?' : 'Are you sure you want to deactivate this user? Their login will be blocked, but data will be safe.')) {
                            onToggleUserStatus(selectedUser.mobile);
                            setSelectedUser({...selectedUser, isActive: selectedUser.isActive === false ? true : false});
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: selectedUser.isActive === false ? '#dcfce7' : '#fef3c7', color: selectedUser.isActive === false ? '#15803d' : '#b45309', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                      >
                        {selectedUser.isActive === false ? <UserCheck size={16} /> : <XCircle size={16} />} 
                        {selectedUser.isActive === false ? 'Activate Account' : 'Deactivate Account'}
                      </button>
                    </div>

                    <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Filter by Month:</label>
                        <input 
                          type="month" 
                          value={filterMonth} 
                          onChange={(e) => setFilterMonth(e.target.value)} 
                          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--primary-light)', outline: 'none', fontSize: '1rem' }}
                        />
                      </div>
                      
                      {(() => {
                        const { mTotal, mPaid, mPreviousDues, mRemain } = calculateMonthlyUserSummary(selectedUser.mobile, filterMonth);
                        
                        if (isEditingSummary) {
                          return (
                            <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <h4 style={{ margin: 0, color: 'var(--primary)' }}>Edit Monthly Summary</h4>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Month Bill (₹)</label>
                                  <input type="number" value={editSummaryValues.mTotal} onChange={e => setEditSummaryValues({...editSummaryValues, mTotal: Number(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Paid (₹)</label>
                                  <input type="number" value={editSummaryValues.mPaid} onChange={e => setEditSummaryValues({...editSummaryValues, mPaid: Number(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Remaining (₹)</label>
                                  <input type="number" value={editSummaryValues.mRemain} onChange={e => setEditSummaryValues({...editSummaryValues, mRemain: Number(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }} />
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button onClick={() => setIsEditingSummary(false)} style={{ padding: '0.5rem 1rem', background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                <button onClick={() => {
                                  const diffTotal = editSummaryValues.mTotal - mTotal;
                                  const diffPaid = editSummaryValues.mPaid - mPaid;
                                  
                                  setMonthlyOverrides(prev => {
                                    const userOverrides = prev[selectedUser.mobile] || {};
                                    const currentAdj = userOverrides[filterMonth] || {};
                                    
                                    // Handle legacy absolute override conversion
                                    let baseTotalAdj = currentAdj.mTotalAdj || 0;
                                    let basePaidAdj = currentAdj.mPaidAdj || 0;
                                    if (currentAdj.mTotal !== undefined && currentAdj.mTotalAdj === undefined) {
                                       // It was a legacy absolute override, so we just start fresh with the new diffs 
                                       // relative to the absolute value we just displayed.
                                       // Actually, the simplest is to just start adjusting from whatever they type.
                                       baseTotalAdj = diffTotal;
                                       basePaidAdj = diffPaid;
                                    } else {
                                       baseTotalAdj += diffTotal;
                                       basePaidAdj += diffPaid;
                                    }

                                    return {
                                      ...prev,
                                      [selectedUser.mobile]: {
                                        ...userOverrides,
                                        [filterMonth]: {
                                          mTotalAdj: baseTotalAdj,
                                          mPaidAdj: basePaidAdj
                                        }
                                      }
                                    };
                                  });
                                  setIsEditingSummary(false);
                                }} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                                <button onClick={() => {
                                  if(window.confirm('Reset to auto-calculated values?')) {
                                    setMonthlyOverrides(prev => {
                                      const next = { ...prev };
                                      if (next[selectedUser.mobile]) {
                                        delete next[selectedUser.mobile][filterMonth];
                                      }
                                      return next;
                                    });
                                    setIsEditingSummary(false);
                                  }
                                }} style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Reset Auto</button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {/* Action buttons row */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                  onClick={(e) => { e.preventDefault(); handleWhatsAppBill(selectedUser, filterMonth); }}
                                  style={{ padding: '0.35rem 0.75rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold', fontSize: '0.82rem' }}
                                  title="Send Bill via WhatsApp"
                                >
                                  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                  WhatsApp
                                </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditSummaryValues({ mTotal, mPaid, mRemain });
                                  setIsEditingSummary(true);
                                }}
                                style={{ padding: '0.35rem 0.75rem', background: '#f1f5f9', color: 'var(--text-secondary)', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                title="Edit summary"
                              >
                                ✏️ Edit
                              </button>
                            </div>

                            {/* Billing cards */}
                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                              <div style={{ flex: '1 1 80px', background: 'var(--surface)', padding: '0.8rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 'bold', textTransform: 'uppercase' }}>Arrears</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#b45309' }}>₹{mPreviousDues}</p>
                              </div>
                              <div style={{ flex: '1 1 80px', background: 'var(--surface)', padding: '0.8rem', borderRadius: '8px', borderLeft: '4px solid var(--text-secondary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Month Bill</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>₹{mTotal}</p>
                              </div>
                              <div style={{ flex: '1 1 80px', background: 'var(--surface)', padding: '0.8rem', borderRadius: '8px', borderLeft: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>Paid</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>₹{mPaid}</p>
                              </div>
                              <div style={{ flex: '1 1 80px', background: 'var(--surface)', padding: '0.8rem', borderRadius: '8px', borderLeft: '4px solid #ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' }}>Payable</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ef4444' }}>₹{mRemain}</p>
                              </div>
                            </div>

                            {monthlyOverrides?.[selectedUser.mobile]?.[filterMonth] && (
                              <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 'bold', textAlign: 'right' }}>* Manually Overridden</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Pending Payment Request in full page */}
                    {paymentRequests[selectedUser.mobile] && (
                      <div style={{ padding: '1.2rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fbbf24' }} onClick={e => e.stopPropagation()}>
                        <p style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>⚠ Pending Payment Request</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <p style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#b45309', marginBottom: '0.3rem' }}>₹{paymentRequests[selectedUser.mobile].amount}</p>
                            <p style={{ fontSize: '0.85rem', color: '#92400e' }}>UTR: {paymentRequests[selectedUser.mobile].utr}</p>
                            <p style={{ fontSize: '0.85rem', color: '#92400e' }}>For: {paymentRequests[selectedUser.mobile].paymentMonth ? format(new Date(paymentRequests[selectedUser.mobile].paymentMonth + '-01'), 'MMMM yyyy') : 'N/A'}</p>
                            <p style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '0.2rem' }}>Submitted: {format(new Date(paymentRequests[selectedUser.mobile].timestamp), 'dd MMM yyyy, hh:mm a')}</p>
                            {paymentRequests[selectedUser.mobile].screenshot && (
                              <div style={{ marginTop: '0.8rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#b45309', marginBottom: '0.3rem', fontWeight: 'bold' }}>Payment Screenshot:</p>
                                <img src={paymentRequests[selectedUser.mobile].screenshot} alt="Screenshot" style={{ height: '120px', borderRadius: '8px', border: '1px solid #d97706', cursor: 'zoom-in' }} onClick={(e) => { e.stopPropagation(); const w = window.open(); w.document.write(`<img src="${paymentRequests[selectedUser.mobile].screenshot}" style="max-width:100%;display:block;margin:auto;" />`); }} />
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => { 
                                if(window.confirm(`Approve payment of ₹${paymentRequests[selectedUser.mobile].amount}?`)) {
                                  onApprovePayment(selectedUser.mobile);
                                  if (onSuccessAnimation) onSuccessAnimation(`₹${paymentRequests[selectedUser.mobile].amount} Payment Approved!`);
                                }
                              }}
                              style={{ padding: '0.7rem 1.2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                            >
                              <CheckCircle size={16} /> Approve
                            </button>
                            <button 
                              onClick={() => { if(window.confirm('Delete this payment request?')) onRejectPayment(selectedUser.mobile); }}
                              style={{ padding: '0.7rem 1.2rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="order-history">
                      <h4 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-light)', display: 'inline-block' }}>Orders for {format(new Date(filterMonth + '-01'), 'MMMM yyyy')}</h4>
                      {(() => {
                        const monthlyOrders = Object.entries(globalOrders[selectedUser.mobile] || {})
                          .filter(([date]) => date.startsWith(filterMonth))
                          .sort((a, b) => new Date(b[0]) - new Date(a[0]));

                        if (monthlyOrders.length === 0) {
                          return <p className="no-data" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No orders in this month.</p>;
                        }

                        const displayedOrders = showAllOrders ? monthlyOrders : monthlyOrders.slice(0, 2);

                        return (
                          <div onClick={(e) => e.stopPropagation()}>
                            {displayedOrders.map(([date, order]) => {
                              const totalForDay = (order.milk || 0) * prices.milk + (order.ghee || 0) * prices.ghee + (order.chach || 0) * prices.chach + (order.paneer || 0) * prices.paneer + (order.curd || 0) * prices.curd;
                          const isPending = order.status === 'pending';
                          
                          return (
                            <div key={date} className={`history-item ${isPending ? 'pending' : ''}`} style={{ marginBottom: '1rem' }}>
                              <div className="history-date">
                                <span className="day">{format(new Date(date), 'dd')}</span>
                                <span className="month">{format(new Date(date), 'MMM')}</span>
                              </div>
                              <div className="history-details" style={{ flex: 1 }}>
                                {editingOrderDate === date ? (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%', alignItems: 'flex-start' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', flex: '1 1 50px' }}>M(L) <input type="number" min="0" step="any" value={editOrderValues.milk} onChange={e => setEditOrderValues({...editOrderValues, milk: Number(e.target.value)})} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }} /></label>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', flex: '1 1 50px' }}>G(Kg) <input type="number" min="0" step="any" value={editOrderValues.ghee} onChange={e => setEditOrderValues({...editOrderValues, ghee: Number(e.target.value)})} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }} /></label>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', flex: '1 1 50px' }}>C(L) <input type="number" min="0" step="any" value={editOrderValues.chach} onChange={e => setEditOrderValues({...editOrderValues, chach: Number(e.target.value)})} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }} /></label>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', flex: '1 1 50px' }}>P(Kg) <input type="number" min="0" step="any" value={editOrderValues.paneer} onChange={e => setEditOrderValues({...editOrderValues, paneer: Number(e.target.value)})} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }} /></label>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', flex: '1 1 50px' }}>D(Kg) <input type="number" min="0" step="any" value={editOrderValues.curd} onChange={e => setEditOrderValues({...editOrderValues, curd: Number(e.target.value)})} style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }} /></label>
                                  </div>
                                ) : (
                                  <>
                                    {order.milk > 0 && <span className="item-pill">{order.milk}L Milk</span>}
                                    {order.ghee > 0 && <span className="item-pill">{order.ghee}Kg Ghee</span>}
                                    {order.chach > 0 && <span className="item-pill">{order.chach}L Chach</span>}
                                    {order.paneer > 0 && <span className="item-pill">{order.paneer}Kg Paneer</span>}
                                    {order.curd > 0 && <span className="item-pill">{order.curd}Kg Curd</span>}
                                  </>
                                )}
                              </div>
                              <div className="history-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                <span>₹{totalForDay}</span>
                                {editingOrderDate === date ? (
                                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button onClick={() => saveEditOrder(selectedUser.mobile, date)} style={{ padding: '0.3rem 0.6rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                                    <button onClick={() => setEditingOrderDate(null)} style={{ padding: '0.3rem 0.6rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <button onClick={() => startEditOrder(date, order)} style={{ padding: '0.2rem 0.6rem', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500' }}>Edit Data</button>
                                    {isPending ? (
                                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button 
                                          className="approve-btn"
                                          onClick={() => onApproveOrder(selectedUser.mobile, date)}
                                          style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                          <CheckCircle size={14} /> Approve
                                        </button>
                                        <button 
                                          onClick={() => { if(window.confirm('Are you sure you want to delete this pending order?')) onRejectOrder(selectedUser.mobile, date); }}
                                          style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.4rem 0.8rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        <CheckCircle size={14} /> Approved
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                            {monthlyOrders.length > 2 && !showAllOrders && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setShowAllOrders(true); }}
                                style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
                              >
                                View More ({monthlyOrders.length - 2})
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="payment-history">
                      <h4 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #10b981', display: 'inline-block' }}>Payments for {format(new Date(filterMonth + '-01'), 'MMMM yyyy')}</h4>
                      {(() => {
                        const monthlyPayments = (globalPayments[selectedUser.mobile] || [])
                          .filter(payment => {
                            const pMonth = payment.paymentMonth || payment.timestamp.substring(0, 7);
                            return pMonth === filterMonth;
                          })
                          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                        if (monthlyPayments.length === 0) {
                          return <p className="no-data" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No payments approved in this month.</p>;
                        }

                        const displayedPayments = showAllPayments ? monthlyPayments : monthlyPayments.slice(0, 2);

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
                            {displayedPayments.map((pay, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #10b981', borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                                <div>
                                  <span style={{ display: 'block', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.3rem', fontSize: '1.1rem' }}>₹{pay.amount}</span>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>UTR: {pay.utr}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem', color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.3rem' }}><CheckCircle size={14} /> Paid</span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{format(new Date(pay.timestamp), 'dd MMM yyyy, hh:mm a')}</span>
                                </div>
                              </div>
                            ))}
                            {monthlyPayments.length > 2 && !showAllPayments && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setShowAllPayments(true); }}
                                style={{ width: '100%', padding: '0.8rem', background: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
                              >
                                View More ({monthlyPayments.length - 2})
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
          </div>
        </div>
      )}
      
      {activeTab === 'delivery' && (
        <AdminDeliverySheet 
          registeredUsers={registeredUsers} 
          globalOrders={globalOrders}
          prices={prices}
        />
      )}
      
      {activeTab === 'broadcasts' && (
        <AdminBroadcasts 
          broadcasts={broadcasts} 
          setBroadcasts={setBroadcasts} 
        />
      )}
      
      {activeTab === 'expenses' && (
        <AdminExpenses 
          globalExpenses={globalExpenses} 
          setGlobalExpenses={setGlobalExpenses} 
          globalPayments={globalPayments}
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
        />
      )}
      
      {activeTab === 'analytics' && (
        <AdminAnalytics 
          registeredUsers={registeredUsers}
          globalOrders={globalOrders}
        />
      )}

      {activeTab === 'export' && (
        <AdminExportData 
          registeredUsers={registeredUsers} 
          globalOrders={globalOrders} 
          globalPayments={globalPayments} 
          prices={prices} 
        />
      )}
      {activeTab === 'reminders' && (
        <AdminPaymentReminders 
          registeredUsers={registeredUsers} 
          globalOrders={globalOrders} 
          globalPayments={globalPayments} 
          setGlobalPayments={setGlobalPayments}
          prices={prices} 
        />
      )}
      {activeTab === 'inventory' && (
        <AdminInventory 
          globalOrders={globalOrders} 
          globalInventory={globalInventory} 
          setGlobalInventory={setGlobalInventory} 
          prices={prices} 
        />
      )}
      {activeTab === 'vacations' && (
        <AdminVacations 
          registeredUsers={registeredUsers} 
        />
      )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="admin-bottom-nav">
        <button className={`admin-bnav-btn ${activeTab==='users'?'active':''}`} onClick={()=>handleTabClick('users')}>
          <Users size={22}/><span>Customers</span>
        </button>
        <button className={`admin-bnav-btn ${activeTab==='orders'?'active':''}`} onClick={()=>handleTabClick('orders')} style={{position:'relative'}}>
          <Milk size={22}/><span>Orders</span>
          {pendingOrdersCount > 0 && <span className="bnav-badge">{pendingOrdersCount}</span>}
        </button>
        <button className={`admin-bnav-btn ${activeTab==='payments'?'active':''}`} onClick={()=>handleTabClick('payments')} style={{position:'relative'}}>
          <span style={{fontSize:'1.3rem',lineHeight:1}}>₹</span><span>Payments</span>
          {Object.keys(paymentRequests||{}).length > 0 && <span className="bnav-badge">{Object.keys(paymentRequests).length}</span>}
        </button>
        <button className={`admin-bnav-btn`} onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span style={{fontSize:'1.2rem'}}>☰</span><span>More</span>
        </button>
      </div>

      {selectedUser && (
        <CustomerPassbook
          isOpen={isPassbookOpen}
          onClose={() => setIsPassbookOpen(false)}
          userName={selectedUser.name}
          userMobile={selectedUser.mobile}
          globalOrders={globalOrders}
          globalPayments={globalPayments}
          prices={prices}
        />
      )}

      <QRScannerModal 
        isOpen={isQRScannerOpen} 
        onClose={() => setIsQRScannerOpen(false)} 
        onScanSuccess={(mobileNumber) => {
          setIsQRScannerOpen(false);
          const foundUser = registeredUsers.find(u => u.mobile === mobileNumber);
          if (foundUser) {
            setSelectedUser(foundUser);
            setActiveTab('users');
          } else {
            alert(`User with mobile ${mobileNumber} not found.`);
          }
        }} 
      />

      {isBulkCashOpen && (
        <AdminBulkCashEntry 
          registeredUsers={registeredUsers} 
          onSubmit={handleBulkCashSubmit} 
          onClose={() => setIsBulkCashOpen(false)} 
        />
      )}

    </div>
  );
};

export default AdminDashboard;
