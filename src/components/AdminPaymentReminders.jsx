import React from 'react';
import { BellRing, Send, UserCircle } from 'lucide-react';

const AdminPaymentReminders = () => {
  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>
        <BellRing size={24} color="var(--primary)" /> Payment Reminders
      </h2>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: '#1e40af', marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontWeight: '500' }}>This feature is coming soon. You will be able to send WhatsApp or SMS reminders to users who haven't paid their bills.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Placeholder Reminder Card */}
        <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#fee2e2', padding: '0.6rem', borderRadius: '50%' }}>
              <UserCircle size={24} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.2rem', color: 'var(--text-primary)', fontSize: '1rem' }}>Demo Customer</h3>
              <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>Unpaid Balance: ₹1,450</p>
            </div>
          </div>
          <button style={{ background: '#25d366', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(37, 211, 102, 0.2)' }}>
            <Send size={16} /> Send Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentReminders;
