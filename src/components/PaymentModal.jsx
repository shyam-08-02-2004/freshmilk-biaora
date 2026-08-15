import React, { useState, useEffect } from 'react';
import { X, Copy, QrCode, Clock, CheckCircle, Upload, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';

const PaymentModal = ({ onClose, totalBill, onSubmitPayment, pendingRequest, currentUser, selectedDate, userOrders, userPayments, prices }) => {
  const [utr, setUtr] = useState('');
  const [paymentMonth, setPaymentMonth] = useState(() => {
    const d = selectedDate || new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [displayAmount, setDisplayAmount] = useState(totalBill);
  
  useEffect(() => {
    if (!userOrders || !prices) {
      setDisplayAmount(totalBill);
      return;
    }
    
    let monthTotal = 0;
    Object.entries(userOrders).forEach(([dateStr, order]) => {
      if (order.status !== 'delivered') return;
      if (dateStr.startsWith(paymentMonth)) {
         let dTotal = order.totalPrice;
         if (dTotal === undefined) {
             dTotal = 0;
             if (order.milk) dTotal += order.milk * prices.milk;
             if (order.ghee) dTotal += order.ghee * prices.ghee;
             if (order.chach) dTotal += order.chach * prices.chach;
             if (order.paneer) dTotal += order.paneer * prices.paneer;
             if (order.curd) dTotal += order.curd * prices.curd;
         }
         monthTotal += dTotal;
      }
    });

    let monthPaid = 0;
    if (userPayments) {
      userPayments.forEach(p => {
         if (p.status === 'approved' && p.paymentMonth === paymentMonth) {
            monthPaid += p.amount;
         }
      });
    }

    let remainingForMonth = monthTotal - monthPaid;
    let safeTotalBill = Math.max(0, totalBill);
    setDisplayAmount(Math.min(safeTotalBill, Math.max(0, remainingForMonth)));
  }, [paymentMonth, userOrders, userPayments, prices, totalBill]);

  const [screenshot, setScreenshot] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState('');
  const upiId = "shyamdangi084@okicici";
  const payAmount = displayAmount > 0 ? Number(displayAmount).toFixed(2) : '1.00';
  const upiLink = `upi://pay?pa=${upiId}&pn=Fresh%20Milk&am=${payAmount}&cu=INR`;
  const phonePeLink = `phonepe://pay?pa=${upiId}&pn=Fresh%20Milk&am=${payAmount}&cu=INR`;
  const gpayLink = `tez://upi/pay?pa=${upiId}&pn=Fresh%20Milk&am=${payAmount}&cu=INR`;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    alert("UPI ID copied to clipboard!");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Screenshot size should be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (utr.length !== 12 || !/^\d+$/.test(utr)) {
      setError("Please enter a valid 12-digit UTR number.");
      return;
    }
    if (!screenshot) {
      setError("Please upload the payment screenshot.");
      return;
    }
    onSubmitPayment(currentUser.mobile, utr, displayAmount, paymentMonth, screenshot);
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Amount Due for {paymentMonth}: <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>₹{displayAmount.toFixed(2)}</strong>
            {displayAmount !== totalBill && <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: '#ef4444' }}>(Overall Due: ₹{totalBill})</div>}
          </p>
        </div>

        <div style={{ padding: '0 1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Select Month to Pay:</label>
          <input 
            type="month" 
            value={paymentMonth}
            onChange={(e) => setPaymentMonth(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--surface)', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}
            required
          />
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <a href={phonePeLink} style={{ flex: 1, minWidth: '140px', padding: '0.8rem', background: '#5f259f', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <Smartphone size={18} /> PhonePe
          </a>
          <a href={gpayLink} style={{ flex: 1, minWidth: '140px', padding: '0.8rem', background: '#1a73e8', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <Smartphone size={18} /> GPay
          </a>
          <a href={upiLink} style={{ flex: 1, minWidth: '140px', padding: '0.8rem', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <Smartphone size={18} /> Other UPI
          </a>
        </div>

        {showQR ? (
          <div style={{ background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', display: 'inline-block' }}>
              <QRCode value={upiLink} size={180} level="H" />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.8rem', textAlign: 'center' }}>Scan to pay exact <strong>₹{displayAmount.toFixed(2)}</strong></p>
          </div>
        ) : (
          <button 
            onClick={() => setShowQR(true)}
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px dashed var(--border)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <QrCode size={18} /> Show QR Code for another device
          </button>
        )}

        <div style={{ marginTop: '1rem', background: 'var(--background)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
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
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Enter 12-digit UTR Number after payment:</label>
              <input 
                type="text" 
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="e.g. 123456789012"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', marginBottom: '0.8rem' }}
                maxLength={12}
              />
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Upload Payment Screenshot:</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px dashed var(--primary)', background: 'rgba(16, 185, 129, 0.05)', color: 'var(--text-primary)' }}
                required
              />
              {screenshot && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14}/> Image selected</div>}
              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
            </div>
            <button 
              type="submit" 
              disabled={utr.length !== 12 || !screenshot}
              style={{ width: '100%', padding: '0.8rem', background: (utr.length === 12 && screenshot) ? 'var(--primary)' : 'var(--border)', color: (utr.length === 12 && screenshot) ? 'white' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (utr.length === 12 && screenshot) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
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
