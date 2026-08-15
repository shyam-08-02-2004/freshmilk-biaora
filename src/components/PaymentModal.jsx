import React, { useState } from 'react';
import { X, Copy, QrCode, Clock, CheckCircle } from 'lucide-react';

const PaymentModal = ({ onClose, totalBill, onSubmitPayment, pendingRequest, currentUser, selectedDate }) => {
  const [utr, setUtr] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(totalBill > 0 ? totalBill : '');
  const [paymentMonth, setPaymentMonth] = useState(() => {
    const d = selectedDate || new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [error, setError] = useState('');
  const upiId = "shyamdangi084@okicici";

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    alert("UPI ID copied to clipboard!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (utr.length !== 12 || !/^\d+$/.test(utr)) {
      setError("Please enter a valid 12-digit UTR number.");
      return;
    }
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    onSubmitPayment(currentUser.mobile, utr, Number(paymentAmount), paymentMonth);
    setError('');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 300 }}>
      <div className="modal-content profile-modal" style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
        <button onClick={onClose} className="close-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={20} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <QrCode size={30} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>Pay Bill</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Amount Due: <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>₹{totalBill}</strong></p>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src="/assets/payment_qr.jpg" alt="Payment QR Code" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div style={{ marginTop: '1.5rem', background: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center' }}>Or pay using UPI ID</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--primary-light)' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{upiId}</span>
            <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}>
              <Copy size={16} /> Copy
            </button>
          </div>
        </div>

        {pendingRequest ? (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '12px', textAlign: 'center', border: '1px solid #fde68a' }}>
            <Clock size={24} color="#d97706" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ color: '#d97706', fontWeight: 'bold', marginBottom: '0.3rem' }}>Payment Verification Pending</p>
            <p style={{ color: '#92400e', fontSize: '0.85rem' }}>UTR: {pendingRequest.utr}</p>
            <p style={{ color: '#92400e', fontSize: '0.85rem' }}>Amount: ₹{pendingRequest.amount}</p>
            <p style={{ color: '#92400e', fontSize: '0.85rem' }}>For Month: {pendingRequest.paymentMonth}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Paying For Month:</label>
              <input 
                type="month" 
                value={paymentMonth}
                onChange={(e) => setPaymentMonth(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', marginBottom: '0.8rem' }}
                required
              />
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Amount Paid (₹):</label>
              <input 
                type="number" 
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={`e.g. ${totalBill > 0 ? totalBill : 1000}`}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', marginBottom: '0.8rem' }}
                required
              />
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Enter 12-digit UTR Number after payment:</label>
              <input 
                type="text" 
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="e.g. 123456789012"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
                maxLength={12}
              />
              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>{error}</p>}
            </div>
            <button 
              type="submit" 
              disabled={utr.length !== 12 || !paymentAmount}
              style={{ width: '100%', padding: '0.8rem', background: (utr.length === 12 && paymentAmount) ? 'var(--primary)' : 'var(--border)', color: (utr.length === 12 && paymentAmount) ? 'white' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (utr.length === 12 && paymentAmount) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <CheckCircle size={18} /> Submit UTR
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
