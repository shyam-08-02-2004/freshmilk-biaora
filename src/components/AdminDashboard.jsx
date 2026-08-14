import React, { useState } from 'react';
import { Users, Milk, CheckCircle, Trash2, KeyRound, UserCheck, XCircle, Phone, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import AdminHistoryModal from './AdminHistoryModal';
import AdminDeliverySheet from './AdminDeliverySheet';
import AdminBroadcasts from './AdminBroadcasts';
import AdminExpenses from './AdminExpenses';
import AdminAnalytics from './AdminAnalytics';
import { useLanguage } from '../LanguageContext';

const AdminDashboard = ({ prices, registeredUsers, globalOrders, onApproveOrder, onRejectOrder, onEditUserOrder, onDeleteUser, profileRequests, onApproveProfile, onRejectProfile, paymentRequests, onApprovePayment, onRejectPayment, globalPayments, adminLogs, monthlyOverrides, setMonthlyOverrides, broadcasts, setBroadcasts, globalExpenses, setGlobalExpenses }) => {
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('admin_activeTab') || 'users'); // 'users' | 'orders' | 'profiles' | 'payments' | 'delivery' | 'broadcasts' | 'expenses' | 'analytics'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    sessionStorage.setItem('admin_activeTab', activeTab);
  }, [activeTab]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const [editingOrderDate, setEditingOrderDate] = useState(null);
  const [editOrderValues, setEditOrderValues] = useState({ milk: 0, ghee: 0, chach: 0 });
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [paymentTabFilterMonth, setPaymentTabFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [expandedPaymentUsers, setExpandedPaymentUsers] = useState({});
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editSummaryValues, setEditSummaryValues] = useState({ mTotal: 0, mPaid: 0, mRemain: 0 });

  const togglePaymentUser = (mobile) => {
    setExpandedPaymentUsers(prev => ({...prev, [mobile]: !prev[mobile]}));
  };

  const startEditOrder = (date, order) => {
    setEditingOrderDate(date);
    setEditOrderValues({ milk: order.milk || 0, ghee: order.ghee || 0, chach: order.chach || 0 });
  };

  const saveEditOrder = (userMobile, date) => {
    onEditUserOrder(userMobile, date, editOrderValues);
    setEditingOrderDate(null);
  };

  const calculateUserDue = (user) => {
    let due = 0;
    const userOrders = globalOrders[user.mobile] || {};
    Object.values(userOrders).forEach(order => {
      if (order.status === 'approved') {
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
    
    const userOrders = globalOrders[userMobile] || {};
    Object.entries(userOrders).forEach(([dateStr, order]) => {
      if (dateStr.startsWith(monthStr) && order.status === 'approved') {
        mTotal += (order.milk || 0) * prices.milk;
        mTotal += (order.ghee || 0) * prices.ghee;
        mTotal += (order.chach || 0) * prices.chach;
      }
    });

    const userPayments = globalPayments[userMobile] || [];
    userPayments.forEach(payment => {
      const pMonth = payment.paymentMonth || payment.timestamp.substring(0, 7);
      if (payment.status === 'approved' && pMonth === monthStr) {
        mPaid += parseFloat(payment.amount);
      }
    });

    const adj = monthlyOverrides?.[userMobile]?.[monthStr];
    if (adj) {
      if (adj.mTotal !== undefined && adj.mTotalAdj === undefined) {
        return { mTotal: adj.mTotal, mPaid: adj.mPaid, mRemain: adj.mRemain };
      }
      mTotal += (adj.mTotalAdj || 0);
      mPaid += (adj.mPaidAdj || 0);
    }

    return { mTotal, mPaid, mRemain: Math.max(0, mTotal - mPaid) };
  };

  const pendingOrdersCount = Object.values(globalOrders || {}).reduce((total, userOrders) => {
    return total + Object.values(userOrders || {}).filter(order => order.status === 'pending').length;
  }, 0);



  return (
    <div className="admin-container">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && <div className="admin-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* LEFT SIDEBAR */}
      <div className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src="/assets/admin_photo.jpg" alt="Admin Avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.3rem', color: 'var(--text-primary)' }}>Super Admin Panel</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Welcome, Shyam Dangi</p>
        </div>
        
        <div className="admin-sidebar-links">
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
          <button 
            onClick={() => handleTabClick('expenses')}
            className={`admin-sidebar-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.2rem', width: '20px', textAlign: 'center' }}>💵</span> Expenses
          </button>
          <button 
            onClick={() => handleTabClick('analytics')}
            className={`admin-sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.2rem', width: '20px', textAlign: 'center' }}>🗺️</span> Analytics Map
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="admin-content-area">
        <div className="admin-content-header">
          <button className="admin-back-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span style={{fontSize:'1.5rem', lineHeight:1}}>☰</span>
          </button>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
            {activeTab} Management
          </h2>
        </div>
        
        <div className="admin-layout" style={{ display: 'block', overflowY: 'auto' }}>
        {activeTab === 'users' && (
          <div style={{ padding: '1rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>All Registered Customers ({registeredUsers.length})</h3>
            {registeredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <Users size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                <p>No registered users yet.</p>
              </div>
            ) : (
              <div className="customers-grid">
                {registeredUsers.map(user => (
                  <div key={user.mobile} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img src={user.avatar || "/assets/babu_logo.png"} alt="User Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} />
                        <div>
                          <h4 
                            onClick={() => { setSelectedUser(user); }}
                            style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.2rem', cursor: 'pointer', textDecoration: 'underline' }}
                            title="View Orders and Details"
                          >
                            {user.name}
                          </h4>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Phone size={14} /> {user.mobile}
                          </span>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 'bold' }}>
                        Due: ₹{calculateUserDue(user)}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', background: 'var(--background)', padding: '1rem', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ minWidth: '70px' }}>Location:</strong> <span>{user.location || 'N/A'}</span>
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
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="users-list">
              <h3>Pending Order Requests</h3>
              {(() => {
                const pendingOrderUsers = registeredUsers.filter(user => {
                  return Object.values(globalOrders[user.mobile] || {}).some(order => order.status === 'pending');
                });
                
                if (pendingOrderUsers.length === 0) {
                  return <p style={{ color: 'var(--text-secondary)', padding: '1rem' }}>No pending order requests.</p>;
                }

                return pendingOrderUsers.map(user => {
                  const pendingOrders = Object.entries(globalOrders[user.mobile] || {})
                    .filter(([, order]) => order.status === 'pending')
                    .sort((a, b) => new Date(b[0]) - new Date(a[0]));

                  return (
                    <div key={user.mobile} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                      {/* User header - clickable to open full detail */}
                      <div
                        onClick={() => { setSelectedUser(user); setShowAllOrders(false); setShowAllPayments(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}
                      >
                        <img src={user.avatar || '/assets/babu_logo.png'} alt="User Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0 }}>{user.name}</h4>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.mobile} · {pendingOrders.length} pending order{pendingOrders.length > 1 ? 's' : ''}</p>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>View Details →</span>
                      </div>

                      {/* Pending orders list with quick approve */}
                      {pendingOrders.map(([date, order]) => {
                        const total = (order.milk || 0) * prices.milk + (order.ghee || 0) * prices.ghee + (order.chach || 0) * prices.chach + (order.paneer || 0) * prices.paneer + (order.curd || 0) * prices.curd;
                        const items = [];
                        if (order.milk) items.push(`${order.milk}L Milk`);
                        if (order.ghee) items.push(`${order.ghee}Kg Ghee`);
                        if (order.chach) items.push(`${order.chach}L Chach`);
                        if (order.paneer) items.push(`${order.paneer} Paneer`);
                        if (order.curd) items.push(`${order.curd} Curd`);
                        return (
                          <div key={date} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                            <div style={{ background: '#eff6ff', padding: '0.4rem 0.7rem', borderRadius: '8px', textAlign: 'center', minWidth: '48px' }}>
                              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{format(new Date(date + 'T00:00:00'), 'dd')}</div>
                              <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 'bold' }}>{format(new Date(date + 'T00:00:00'), 'MMM')}</div>
                            </div>
                            <div style={{ flex: 1, minWidth: '120px' }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{items.join(', ')}</div>
                              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>₹{total}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); onApproveOrder(user.mobile, date); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onRejectOrder(user.mobile, date); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.4rem 0.7rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
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
                        <img src={user?.avatar || "/assets/babu_logo.png"} alt="User Avatar" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <label style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Filter Month:</label>
                <input 
                  type="month" 
                  value={paymentTabFilterMonth} 
                  onChange={(e) => setPaymentTabFilterMonth(e.target.value)} 
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                />
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
                    const isExpanded = expandedPaymentUsers[user.mobile];
                    
                    const monthlyPayments = (globalPayments[user.mobile] || [])
                      .filter(p => {
                        const pMonth = p.paymentMonth || p.timestamp.substring(0, 7);
                        return pMonth === paymentTabFilterMonth;
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
                            <img src={user.avatar || "/assets/babu_logo.png"} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                            <div>
                              <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>{user.name}</h4>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.mobile}</span>
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
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignSelf: 'center' }}>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); if(window.confirm(`Approve payment of ₹${req.amount}?`)) onApprovePayment(user.mobile); }}
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
      </div>

      {isHistoryOpen && (
        <AdminHistoryModal 
          onClose={() => setIsHistoryOpen(false)}
          adminLogs={adminLogs}
        />
      )}
    
      {/* FULL PAGE USER DETAILS MODAL */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, background: 'var(--background)', overflowY: 'auto' }} onClick={() => setIsEditingSummary(false)}>
          <div style={{ padding: '1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedUser(null); setShowAllOrders(false); setShowAllPayments(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}
            >
              <ArrowLeft size={24} /> Back
            </button>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>User Details</h2>
          </div>
          
          <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }} onClick={(e) => { e.stopPropagation(); setShowAllOrders(false); setShowAllPayments(false); setIsEditingSummary(false); }}>
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
                          if (window.confirm('Are you sure you want to delete this user?')) {
                            onDeleteUser(selectedUser.mobile);
                            setSelectedUser(null);
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                      >
                        <Trash2 size={16} /> Delete Account
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
                        const { mTotal, mPaid, mRemain } = calculateMonthlyUserSummary(selectedUser.mobile, filterMonth);
                        
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
                              <a
                                href={`https://wa.me/91${selectedUser.mobile}?text=${encodeURIComponent(`Hello ${selectedUser.name},\n\nThis is your FreshMilk Biaora bill for *${format(new Date(filterMonth + '-01'), 'MMMM yyyy')}*.\n\nTotal Bill: ₹${mTotal}\nPaid: ₹${mPaid}\n*Remaining Due: ₹${mRemain}*\n\nPlease pay the pending amount.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ padding: '0.35rem 0.75rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold', fontSize: '0.82rem' }}
                                title="Send Bill via WhatsApp"
                              >
                                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                WhatsApp
                              </a>
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
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                              <div style={{ flex: '1 1 100px', background: 'var(--surface)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--text-secondary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Month Bill</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>₹{mTotal}</p>
                              </div>
                              <div style={{ flex: '1 1 100px', background: 'var(--surface)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>Paid</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>₹{mPaid}</p>
                              </div>
                              <div style={{ flex: '1 1 100px', background: 'var(--surface)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' }}>Remaining</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>₹{mRemain}</p>
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
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => { if(window.confirm(`Approve payment of ₹${paymentRequests[selectedUser.mobile].amount}?`)) onApprovePayment(selectedUser.mobile); }}
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
                                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>M: <input type="number" min="0" value={editOrderValues.milk} onChange={e => setEditOrderValues({...editOrderValues, milk: Number(e.target.value)})} style={{ width: '45px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)' }} /></label>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>G: <input type="number" min="0" value={editOrderValues.ghee} onChange={e => setEditOrderValues({...editOrderValues, ghee: Number(e.target.value)})} style={{ width: '45px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)' }} /></label>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>C: <input type="number" min="0" value={editOrderValues.chach} onChange={e => setEditOrderValues({...editOrderValues, chach: Number(e.target.value)})} style={{ width: '45px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)' }} /></label>
                                  </div>
                                ) : (
                                  <>
                                    {order.milk > 0 && <span className="item-pill">{order.milk}L Milk</span>}
                                    {order.ghee > 0 && <span className="item-pill">{order.ghee}Kg Ghee</span>}
                                    {order.chach > 0 && <span className="item-pill">{order.chach}L Chach</span>}
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
        />
      )}
      
      {activeTab === 'analytics' && (
        <AdminAnalytics 
          registeredUsers={registeredUsers}
          globalOrders={globalOrders}
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
        <button className={`admin-bnav-btn ${activeTab==='delivery'?'active':''}`} onClick={()=>handleTabClick('delivery')}>
          <span style={{fontSize:'1.2rem'}}>📦</span><span>Delivery</span>
        </button>
        <button className={`admin-bnav-btn`} onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span style={{fontSize:'1.2rem'}}>☰</span><span>More</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
