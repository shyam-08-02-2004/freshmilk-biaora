import React, { useState } from 'react';
import { dummyUsers } from '../data/dummyUsers';
import { User, Phone, MapPin, Home, Receipt, CalendarCheck, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = ({ prices }) => {
  const [selectedUserId, setSelectedUserId] = useState(dummyUsers[0].id);
  const [showMobileList, setShowMobileList] = useState(true);

  const selectedUser = dummyUsers.find(u => u.id === selectedUserId);

  const handleSelectUser = (id) => {
    setSelectedUserId(id);
    if (window.innerWidth <= 1024) {
      setShowMobileList(false);
    }
  };

  const calculateTotalBill = (userOrders) => {
    let total = 0;
    Object.values(userOrders).forEach(order => {
      total += (order.milk || 0) * prices.milk;
      total += (order.ghee || 0) * prices.ghee;
      total += (order.chach || 0) * prices.chach;
    });
    return total;
  };

  return (
    <div className="admin-container">
      <div className={`admin-sidebar ${!showMobileList ? 'hide-on-mobile' : ''}`}>
        <h2 style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={24} color="var(--primary)" /> Customers
        </h2>
        <div className="user-list">
          {dummyUsers.map(user => (
            <div 
              key={user.id} 
              className={`user-list-item ${selectedUserId === user.id ? 'active' : ''}`}
              onClick={() => handleSelectUser(user.id)}
            >
              <div className="user-avatar-small">
                {user.name.charAt(0)}
              </div>
              <div className="user-info-lite">
                <h3>{user.name}</h3>
                <span>{user.mobile}</span>
              </div>
              <ChevronRight size={18} className="chevron" />
            </div>
          ))}
        </div>
      </div>

      <div className={`admin-content ${showMobileList ? 'hide-on-mobile' : ''}`}>
        {selectedUser ? (
          <div className="user-detail-view">
            <button 
              className="back-btn-mobile" 
              onClick={() => setShowMobileList(true)}
            >
              <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} /> Back to List
            </button>
            
            <div className="detail-header">
              <div className="avatar-large">{selectedUser.name.charAt(0)}</div>
              <div>
                <h2>{selectedUser.name}</h2>
                <p className="mobile-badge"><Phone size={14} /> {selectedUser.mobile}</p>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                  <Receipt size={24} />
                </div>
                <div>
                  <p>Total Due</p>
                  <h3>₹{calculateTotalBill(selectedUser.orders)}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)' }}>
                  <CalendarCheck size={24} />
                </div>
                <div>
                  <p>Total Orders</p>
                  <h3>{Object.keys(selectedUser.orders).length} Days</h3>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Profile Details</h3>
              <div className="info-row">
                <MapPin size={18} /> <span>{selectedUser.location}</span>
              </div>
              <div className="info-row">
                <Home size={18} /> <span>{selectedUser.flat}</span>
              </div>
            </div>

            <div className="info-card">
              <h3>Order History</h3>
              <div className="order-history-list">
                {Object.entries(selectedUser.orders).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([dateStr, order]) => {
                  const dayTotal = (order.milk * prices.milk) + (order.ghee * prices.ghee) + (order.chach * prices.chach);
                  return (
                    <div key={dateStr} className="history-item">
                      <div className="history-date">
                        <strong>{format(new Date(dateStr), 'dd MMM')}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{format(new Date(dateStr), 'EEEE')}</span>
                      </div>
                      <div className="history-items">
                        {order.milk > 0 && <span className="badge milk">{order.milk}L Milk</span>}
                        {order.ghee > 0 && <span className="badge ghee">{order.ghee}kg Ghee</span>}
                        {order.chach > 0 && <span className="badge chach">{order.chach}L Chach</span>}
                      </div>
                      <div className="history-price">₹{dayTotal}</div>
                    </div>
                  );
                })}
                {Object.keys(selectedUser.orders).length === 0 && (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No orders found for this user.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">Select a user to view details</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
