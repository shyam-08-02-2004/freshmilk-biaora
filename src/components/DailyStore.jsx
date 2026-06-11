import React, { useState, useEffect } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { Minus, Plus, CalendarCheck, ReceiptText, ShieldCheck } from 'lucide-react';

const DailyStore = ({ selectedDate, currentOrder, onSaveOrder, onClearOrder, prices }) => {
  const today = startOfDay(new Date());
  const isPastDate = isBefore(startOfDay(selectedDate), today);
  const isOrderable = !isPastDate;
  const hasOrder = (currentOrder.milk > 0 || currentOrder.ghee > 0 || currentOrder.chach > 0);
  
  const [localOrder, setLocalOrder] = useState({ milk: 0, ghee: 0, chach: 0 });

  // Reset inputs when the date changes
  useEffect(() => {
    setLocalOrder({ milk: 0, ghee: 0, chach: 0 });
  }, [selectedDate]);

  const products = [
    { id: 'milk', name: 'Fresh Milk', price: prices.milk, unit: 'L', img: '/assets/milk.png', step: 0.5 },
    { id: 'ghee', name: 'Pure Ghee', price: prices.ghee, unit: 'Kg', img: '/assets/ghee.png', step: 0.5 },
    { id: 'chach', name: 'Spiced Chach', price: prices.chach, unit: 'L', img: '/assets/chach.png', step: 0.5 }
  ];

  const updateLocalQty = (id, val) => {
    setLocalOrder(prev => ({ ...prev, [id]: val }));
  };

  const isChanged = localOrder.milk > 0 || localOrder.ghee > 0 || localOrder.chach > 0;

  const handleConfirm = () => {
    onSaveOrder(selectedDate, localOrder);
    setLocalOrder({ milk: 0, ghee: 0, chach: 0 }); // Reset quantity after confirm
  };

  const handleCancelSelection = () => {
    setLocalOrder({ milk: 0, ghee: 0, chach: 0 });
  };

  const localDayTotal = (localOrder.milk * prices.milk) + (localOrder.ghee * prices.ghee) + (localOrder.chach * prices.chach);

  if (!isOrderable) {
    if (!hasOrder) {
      return (
        <div className="empty-history" style={{ padding: '2rem 1rem' }}>
          <CalendarCheck size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
          <h3>No Orders Found</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>You didn't place any orders on {format(selectedDate, 'do MMMM yyyy')}.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: 'var(--primary)' }}>This is a past date. Orders cannot be placed or modified.</p>
        </div>
      );
    }

    const dayTotal = (currentOrder.milk || 0) * prices.milk + 
                     (currentOrder.ghee || 0) * prices.ghee + 
                     (currentOrder.chach || 0) * prices.chach;

    return (
      <div className="luxury-receipt" style={{ padding: '1.5rem' }}>
        <div className="receipt-header">
          <ReceiptText size={32} className="receipt-icon" />
          <h2>Order Receipt</h2>
          <p className="receipt-date">{format(selectedDate, 'EEEE, d MMMM')}</p>
        </div>
        
        <div className="receipt-items">
          {products.map(p => {
             const qty = currentOrder[p.id] || 0;
             if (qty === 0) return null;
             return (
               <div key={p.id} className="receipt-item" style={{ padding: '0.5rem' }}>
                 <div className="receipt-item-info">
                   <img src={p.img} alt={p.name} className="receipt-img" style={{ width: '40px', height: '40px' }} />
                   <div>
                     <h4 style={{ fontSize: '0.9rem' }}>{p.name}</h4>
                     <span style={{ fontSize: '0.75rem' }}>{qty}{p.unit} × ₹{p.price}</span>
                   </div>
                 </div>
                 <div className="receipt-item-total" style={{ fontSize: '1rem' }}>₹{qty * p.price}</div>
               </div>
             );
          })}
        </div>

        <div className="receipt-total">
          <span>Total</span>
          <span className="amount" style={{ fontSize: '1.25rem' }}>₹{dayTotal}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sidebar-store">
        <div className="store-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Order Items</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{format(selectedDate, 'EEEE, do MMMM yyyy')}</p>
        </div>

        <div className="sidebar-product-list">
          {products.map(p => {
            const qty = localOrder[p.id] || 0;
            const alreadyOrdered = currentOrder[p.id] || 0;
            
            return (
              <div key={p.id} className="sidebar-product-card">
                <img src={p.img} alt={p.name} className="sidebar-product-img" />
                <div className="sidebar-product-details">
                  <div className="sidebar-product-header">
                    <div>
                      <h3>{p.name}</h3>
                      <p>₹{p.price}/{p.unit}</p>
                    </div>
                    {alreadyOrdered > 0 && (
                      <div style={{ textAlign: 'right', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Already Ordered</span>
                        <div style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {alreadyOrdered}{p.unit}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="sidebar-product-controls">
                    <span className="subtotal">{qty > 0 ? `+ ₹${qty * p.price} new` : 'Add to order'}</span>
                    <div className="product-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        className="qty-btn" 
                        onClick={() => updateLocalQty(p.id, Math.max(0, qty - p.step))}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-value" style={{ fontWeight: 600, minWidth: '2ch', textAlign: 'center' }}>{qty}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => updateLocalQty(p.id, qty + p.step)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'sticky', bottom: 0, background: 'var(--background)', paddingTop: '1rem', marginTop: '1rem', paddingBottom: '0.5rem' }}>

          {isChanged ? (
            <div style={{ display: 'flex', gap: '0.75rem', animation: 'fadeIn 0.3s ease' }}>
              <button 
                onClick={handleCancelSelection}
                style={{ flex: 1, padding: '1rem 0.5rem', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' }}
              >
                <ShieldCheck size={20} />
                Confirm ₹{localDayTotal}
              </button>
            </div>
          ) : (
            !hasOrder && (
              <button 
                disabled
                style={{ width: '100%', padding: '1rem', background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '12px', fontWeight: 'bold', cursor: 'not-allowed' }}
              >
                Select items to add
              </button>
            )
          )}
        </div>
      </div>

    </>
  );
};

export default DailyStore;
