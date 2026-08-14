import React, { useMemo } from 'react';
import { BellRing, Send, UserCircle } from 'lucide-react';

const AdminPaymentReminders = ({ registeredUsers, globalOrders, globalPayments, prices }) => {
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

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>
        <BellRing size={24} color="var(--primary)" /> Payment Reminders
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {defaulters.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>All customers have paid their bills! 🎉</p>
        ) : (
          defaulters.map((user, idx) => (
            <div key={idx} style={{ background: 'var(--surface)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#fee2e2', padding: '0.6rem', borderRadius: '50%' }}>
                  <UserCircle size={24} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.2rem', color: 'var(--text-primary)', fontSize: '1rem' }}>{user.name}</h3>
                  <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>Unpaid Balance: ₹{user.balance}</p>
                </div>
              </div>
              <button onClick={() => sendReminder(user)} style={{ background: '#25d366', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(37, 211, 102, 0.2)' }}>
                <Send size={16} /> Send Reminder
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPaymentReminders;
