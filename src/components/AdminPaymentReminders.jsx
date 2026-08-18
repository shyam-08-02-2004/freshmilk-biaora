import React, { useState, useMemo, useEffect } from 'react';
import { BellRing, Send, UserCircle, IndianRupee, MessageSquareShare, X } from 'lucide-react';
import { format } from 'date-fns';
import { playCash, playClick, playSwoosh } from '../utils/haptics';

const AdminPaymentReminders = ({ registeredUsers, globalOrders, globalPayments, setGlobalPayments, prices }) => {
  const [settlingUser, setSettlingUser] = useState(null);
  const [displayedBalance, setDisplayedBalance] = useState(0);
  const [isSettling, setIsSettling] = useState(false);
  const [settled, setSettled] = useState(false);
  const [confirmUser, setConfirmUser] = useState(null);
  
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkIndex, setBulkIndex] = useState(0);

  const defaulters = useMemo(() => {
    const list = [];
    registeredUsers.forEach(user => {
      if (user.role === 'admin') return;
      const mobile = user.mobile;
      
      // Calculate total bill
      let totalBill = 0;
      const userOrders = globalOrders[mobile] || {};
      Object.keys(userOrders).forEach(date => {
        const o = userOrders[date];
        if (o.status !== 'rejected') {
          totalBill += (o.milk || 0) * prices.milk + (o.ghee || 0) * prices.ghee + (o.chach || 0) * prices.chach + (o.paneer || 0) * prices.paneer + (o.curd || 0) * prices.curd;
        }
      });

      // Calculate total paid
      let totalPaid = 0;
      const userPayments = globalPayments[mobile] || [];
      userPayments.forEach(p => {
        if (p.status === 'approved') {
          totalPaid += parseFloat(p.amount);
        }
      });

      const balance = totalBill - totalPaid;
      if (balance > 0) {
        list.push({ ...user, balance });
      }
    });
    return list.sort((a, b) => b.balance - a.balance);
  }, [registeredUsers, globalOrders, globalPayments, prices]);

  const sendReminder = (user) => {
    const message = `Namaste ${user.name},\n\nAapka FreshMilk Biaora ka pichla bill ₹${user.balance} baaki hai. Kripya jald se jald jama karein.\n\nThank you!`;
    const url = `https://wa.me/91${user.mobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const startSettlement = (user) => {
    setSettlingUser(user);
    setDisplayedBalance(user.balance);
    setIsSettling(true);
    setSettled(false);
    playSwoosh();
  };

  useEffect(() => {
    if (isSettling && displayedBalance > 0) {
      const step = Math.max(1, Math.floor(settlingUser.balance / 30)); // 30 steps roughly
      const timer = setInterval(() => {
        setDisplayedBalance(prev => {
          if (prev - step <= 0) {
            clearInterval(timer);
            completeSettlement();
            return 0;
          }
          playClick();
          return prev - step;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isSettling, displayedBalance]);

  const completeSettlement = () => {
    setIsSettling(false);
    setSettled(true);
    playCash();
    
    // Process the payment
    const amount = settlingUser.balance;
    const payment = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount),
      utr: 'CASH-SETTLE',
      timestamp: new Date().toISOString(),
      paymentMonth: format(new Date(), 'yyyy-MM'),
      status: 'approved'
    };

    setGlobalPayments(prev => ({
      ...prev,
      [settlingUser.mobile]: [...(prev[settlingUser.mobile] || []), payment]
    }));

    // Auto close after showing success
    setTimeout(() => {
      setSettlingUser(null);
      setSettled(false);
    }, 2000);
  };

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Confirmation Modal */}
      {confirmUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--surface)', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '400px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center', border: '1px solid var(--border)'
          }}>
            <div style={{ width: '64px', height: '64px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <IndianRupee size={32} color="#d97706" />
            </div>
            <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Clear Dues?</h2>
            <p style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.5' }}>
              Are you sure you want to mark <strong>₹{confirmUser.balance}</strong> as paid for <strong>{confirmUser.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setConfirmUser(null)} 
                style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '2px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const user = confirmUser;
                  setConfirmUser(null);
                  startSettlement(user);
                }} 
                style={{ flex: 1, padding: '0.8rem', background: '#10b981', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Casino Overlay */}
      {settlingUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#94a3b8', marginBottom: '1rem' }}>Clearing Dues for {settlingUser.name}</h2>
            <div style={{ 
              fontSize: '5rem', fontWeight: '900', color: settled ? '#10b981' : '#f59e0b', 
              fontFamily: 'monospace', background: '#0f172a', padding: '2rem 4rem', 
              borderRadius: '24px', border: `4px solid ${settled ? '#10b981' : '#334155'}`,
              boxShadow: settled ? '0 0 40px rgba(16,185,129,0.5)' : 'inset 0 10px 20px rgba(0,0,0,0.5)',
              textShadow: settled ? '0 0 20px rgba(16,185,129,0.8)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              ₹{displayedBalance}
            </div>
            {settled && (
              <div style={{ marginTop: '2rem', fontSize: '2rem', color: '#10b981', animation: 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
                ✅ Cleared! Cha-Ching! 💰
              </div>
            )}
            {!isSettling && !settled && (
               <div style={{ marginTop: '2rem' }}>Loading...</div>
            )}
          </div>
        </div>
      )}

      {/* BULK BILLING OVERLAY */}
      {isBulkMode && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '2rem', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setIsBulkMode(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            <div style={{ background: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
               <MessageSquareShare size={30} color="#16a34a" />
            </div>
            <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Speed Billing Wizard</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Send bills one by one instantly.</p>
            
            {bulkIndex < defaulters.length ? (
              <>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Sending to</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)', margin: '0.3rem 0' }}>{defaulters[bulkIndex].name}</div>
                  <div style={{ color: '#ef4444', fontWeight: 'bold' }}>Due: ₹{defaulters[bulkIndex].balance}</div>
                </div>
                
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Progress: {bulkIndex + 1} / {defaulters.length}
                </div>
                
                <button 
                  onClick={() => {
                    playSwoosh();
                    sendReminder(defaulters[bulkIndex]);
                    setBulkIndex(prev => prev + 1);
                  }}
                  style={{ width: '100%', padding: '1rem', background: '#25d366', color: 'white', borderRadius: '12px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)' }}
                >
                  <Send size={20} /> Send to {defaulters[bulkIndex].name.split(' ')[0]}
                </button>
                <button 
                  onClick={() => setBulkIndex(prev => prev + 1)}
                  style={{ width: '100%', padding: '0.8rem', background: 'transparent', color: 'var(--text-secondary)', borderRadius: '12px', border: 'none', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
                >
                  Skip User
                </button>
              </>
            ) : (
              <div>
                <h3 style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '1rem' }}>🎉 All Done!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>You've gone through all pending bills.</p>
                <button onClick={() => setIsBulkMode(false)} style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
                  Close Wizard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--text-primary)' }}>
          <BellRing size={24} color="var(--primary)" /> Payment Reminders
        </h2>
        {defaulters.length > 0 && (
          <button onClick={() => { setBulkIndex(0); setIsBulkMode(true); }} style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
            <MessageSquareShare size={18} /> Speed Bulk Billing
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {defaulters.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>All customers have paid their bills! 🎉</p>
        ) : (
          defaulters.map((user, idx) => (
            <div key={idx} style={{ background: 'var(--surface)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#fee2e2', padding: '0.6rem', borderRadius: '50%' }}>
                  <UserCircle size={28} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.2rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{user.name}</h3>
                  <p style={{ margin: 0, color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold' }}>Unpaid Balance: ₹{user.balance}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button onClick={() => sendReminder(user)} style={{ flex: 1, minWidth: '140px', background: 'white', color: '#25d366', border: '1px solid #25d366', padding: '0.8rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Send size={16} /> Reminder
                </button>
                <button onClick={() => setConfirmUser(user)} style={{ flex: 1, minWidth: '140px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', padding: '0.8rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)' }}>
                  <IndianRupee size={16} /> Settle Dues
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPaymentReminders;
