import React, { useState, useEffect } from 'react';
import { X, Copy, QrCode, Clock, CheckCircle, Upload, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';

const PaymentModal = ({ onClose, totalBill, onSubmitPayment, pendingRequest, currentUser, selectedDate, userOrders, userPayments, prices }) => {
  const [utr, setUtr] = useState('');
  const [paymentMonth, setPaymentMonth] = useState(() => {
    const d = selectedDate || new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [displayAmount, setDisplayAmount] = useState(0);
  const [step, setStep] = useState(1);
  
  const computeMonthTotal = (month) => {
    if (!userOrders || !prices) return 0;
    let monthTotal = 0;
    Object.entries(userOrders).forEach(([dateStr, order]) => {
      if (order.status !== 'delivered') return;
      if (dateStr.startsWith(month)) {
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
    return monthTotal;
  };

  const computeMonthPaid = (month) => {
    if (!userPayments) return 0;
    let monthPaid = 0;
    userPayments.forEach(p => {
       if (p.status === 'approved' && p.paymentMonth === month) {
          monthPaid += p.amount;
       }
    });
    return monthPaid;
  };

  // Recompute amount whenever month or relevant data changes
  useEffect(() => {
    const monthTotal = computeMonthTotal(paymentMonth);
    const monthPaid = computeMonthPaid(paymentMonth);
    setDisplayAmount(Math.max(0, monthTotal - monthPaid));
  }, [paymentMonth, userOrders, userPayments, prices]);

  const [screenshot, setScreenshot] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState('');
  const upiId = "shyamdangi084-1@okicici";
  const payAmount = displayAmount > 0 ? Number(displayAmount).toFixed(2) : '1.00';
  const trRef = `FM${Date.now()}`;
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
    <div className="modal-overlay">
      <div className="modal-content profile-modal" style={{ maxWidth: '400px', width: '100%', position: 'relative' }}>
        <button onClick={onClose} className="close-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={20} />
        </button>
        <div style={{ padding: '0 1rem' }}>
          {step === 1 ? (
            <div style={{ textAlign: 'center', padding: '1rem 0 2rem 0' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Clock size={34} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Select Billing Month</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>Choose the month to clear your dues</p>
              
              <input 
                type="month" 
                value={paymentMonth}
                onChange={(e) => {
                  const newMonth = e.target.value;
                  setPaymentMonth(newMonth);
                  // recompute amount instantly
                  const monthTotal = computeMonthTotal(newMonth);
                  const monthPaid = computeMonthPaid(newMonth);
                  setDisplayAmount(Math.max(0, monthTotal - monthPaid));
                }}
                style={{ width: '100%', padding: '1.2rem', borderRadius: '14px', border: '2px solid var(--primary)', background: 'var(--surface)', color: 'var(--text-primary)', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.3rem', textAlign: 'center', outline: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}
                required
              />
              
              <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                 <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Amount Due for {paymentMonth}</span>
                 <strong style={{ color: displayAmount > 0 ? '#10b981' : 'var(--text-primary)', fontSize: '2.5rem', display: 'block' }}>₹{displayAmount.toFixed(2)}</strong>
                 {displayAmount === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginTop: '0.5rem' }}>(No pending dues for this month)</span>}
              </div>

              <button 
                onClick={() => {
                    if(displayAmount <= 0) {
                        alert('There is no pending amount for this month!');
                        return;
                    }
                    setStep(2);
                }}
                style={{ width: '100%', padding: '1.2rem', background: displayAmount > 0 ? 'var(--primary)' : 'var(--border)', color: displayAmount > 0 ? 'white' : 'var(--text-secondary)', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: displayAmount > 0 ? 'pointer' : 'not-allowed', fontSize: '1.2rem', boxShadow: displayAmount > 0 ? '0 4px 14px rgba(16, 185, 129, 0.3)' : 'none', transition: 'all 0.2s' }}
              >
                Proceed to Pay ₹{displayAmount.toFixed(2)}
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                <button 
                  onClick={() => setStep(1)} 
                  style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  ← Back
                </button>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
                  <QrCode size={26} />
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>Pay Bill</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                  Amount Due for {paymentMonth}: <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>₹{displayAmount.toFixed(2)}</strong>
                </p>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <a 
                  href={phonePeLink} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.6rem', 
                    width: '100%', 
                    padding: '0.9rem', 
                    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(91, 33, 182, 0.3)',
                  }}
                >
                  <Smartphone size={20} /> PhonePe
                </a>

                <a 
                  href={gpayLink} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.6rem', 
                    width: '100%', 
                    padding: '0.9rem', 
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
                  }}
                >
                  <Smartphone size={20} /> Google Pay
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
                    style={{ width: '100%', padding: '0.8rem', background: (utr.length === 12 && screenshot) ? 'var(--primary)' : 'var(--border)', color: (utr.length === 12 && screenshot) ? 'white' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (utr.length === 12 && screenshot) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', marginBottom: '1rem' }}
                  >
                    <CheckCircle size={18} /> Submit UTR
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
