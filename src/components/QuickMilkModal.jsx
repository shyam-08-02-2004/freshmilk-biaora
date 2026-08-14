import React, { useState } from 'react';
import { X, Check, Minus, Plus } from 'lucide-react';
import { format, startOfDay, addDays } from 'date-fns';

const QuickMilkModal = ({ onClose, onSaveOrder, currentOrders, prices }) => {
  const now = new Date();
  const isPast1130AM = now.getHours() > 11 || (now.getHours() === 11 && now.getMinutes() >= 30);
  
  // Determine the default target date
  const targetDate = isPast1130AM ? addDays(startOfDay(new Date()), 1) : startOfDay(new Date());
  const dateKey = format(targetDate, 'yyyy-MM-dd');
  
  const existingOrder = currentOrders[dateKey] || {};
  const existingMilk = existingOrder.milk || 0;
  const [milkQty, setMilkQty] = useState(existingMilk || 1); // Default to 1 litre if they have 0
  const [isSaved, setIsSaved] = useState(false);
  
  const isTodayDate = format(targetDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isPast7AM = now.getHours() >= 7;
  const isDecreaseLocked = isTodayDate && isPast7AM;

  const handleConfirm = () => {
    // Keep existing items, just update milk
    const updatedOrder = {
      ...existingOrder,
      milk: milkQty
    };
    onSaveOrder(targetDate, updatedOrder, true); // replaceMode
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-content" style={{ maxWidth: '400px', padding: 0, overflow: 'hidden' }}>
        {/* Header Image Area */}
        <div style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', padding: '2rem 1rem', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={20} color="#0369a1" />
          </button>
          
          <img src="/assets/milk.png" alt="Milk" style={{ width: '80px', height: '120px', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }} />
          <h2 style={{ margin: '1rem 0 0 0', color: '#0369a1', fontSize: '1.5rem' }}>Fresh Cow Milk</h2>
          <p style={{ margin: '0.2rem 0 0 0', color: '#0284c7', fontSize: '0.9rem' }}>Delivery for {isPast1130AM ? 'Tomorrow' : 'Today'}</p>
          <span style={{ display: 'inline-block', marginTop: '0.5rem', background: '#38bdf8', color: 'white', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>
            {format(targetDate, 'dd MMM yyyy')}
          </span>
        </div>

        {/* Controls Area */}
        <div style={{ padding: '2rem 1.5rem' }}>
          {isSaved ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ background: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Check size={32} color="#16a34a" />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#16a34a' }}>Order Confirmed!</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Your milk is on the way.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Select Quantity</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--secondary)' }}>₹{prices.milk} / L</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                <button 
                  onClick={() => setMilkQty(Math.max(0, milkQty - 0.5))}
                  style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (isDecreaseLocked && milkQty <= existingMilk) ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', opacity: (isDecreaseLocked && milkQty <= existingMilk) ? 0.5 : 1 }}
                  disabled={isDecreaseLocked && milkQty <= existingMilk}
                >
                  <Minus size={24} />
                </button>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', width: '60px', textAlign: 'center' }}>
                  {milkQty}
                </div>
                <button 
                  onClick={() => setMilkQty(milkQty + 0.5)}
                  style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}
                >
                  <Plus size={24} />
                </button>
              </div>

              {isDecreaseLocked && existingMilk > 0 && (
                <div style={{ textAlign: 'center', color: '#dc2626', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                  Past 7 AM: Cannot reduce existing quantity.
                </div>
              )}

              <button 
                onClick={handleConfirm}
                style={{ width: '100%', padding: '1rem', background: milkQty > 0 ? 'var(--secondary)' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: milkQty > 0 ? 'pointer' : 'not-allowed', boxShadow: milkQty > 0 ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                disabled={milkQty === 0}
              >
                <span>Confirm Order</span>
                <span>₹{milkQty * prices.milk}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickMilkModal;
