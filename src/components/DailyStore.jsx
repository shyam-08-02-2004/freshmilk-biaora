import React, { useState, useEffect } from 'react';
import { format, isBefore, startOfDay, addDays, isAfter, isSameDay } from 'date-fns';
import { Minus, Plus, CalendarCheck, ReceiptText, ShieldCheck, X, ShoppingBag, Pencil } from 'lucide-react';

const DailyStore = ({ selectedDate, currentOrder, onSaveOrder, onClearOrder, prices, currentUser }) => {
  const today = startOfDay(new Date());
  const now = new Date();
  const tomorrow = addDays(today, 1);
  const isPastDate = isBefore(startOfDay(selectedDate), today);
  const isFutureBeyondTomorrow = isAfter(startOfDay(selectedDate), tomorrow);
  
  const isTodayDate = isSameDay(selectedDate, today);
  const isTomorrowDate = isSameDay(selectedDate, tomorrow);

  // Vacation Mode check
  let isOnVacation = false;
  if (currentUser?.vacationStart && currentUser?.vacationEnd) {
    const vStart = startOfDay(new Date(currentUser.vacationStart));
    const vEnd = startOfDay(new Date(currentUser.vacationEnd));
    const sDate = startOfDay(selectedDate);
    if ((isAfter(sDate, vStart) || isSameDay(sDate, vStart)) && 
        (isBefore(sDate, vEnd) || isSameDay(sDate, vEnd))) {
      isOnVacation = true;
    }
  }

  // Today locked after 10:30 AM today
  // Tomorrow locked after 10:30 AM tomorrow (i.e., never locked today for tomorrow)
  const isPast1030AM = now.getHours() > 10 || (now.getHours() === 10 && now.getMinutes() >= 30);
  const isTodayLocked = isTodayDate && isPast1030AM;
  // Tomorrow is never locked (10:30 AM tomorrow hasn't arrived yet today)
  const isTomorrowLocked = false;
  
  const isApproved = currentOrder?.status === 'approved';
  const isOrderable = !isPastDate && !isApproved && !isFutureBeyondTomorrow && !isTodayLocked && !isTomorrowLocked && !isOnVacation;
  const hasOrder = (currentOrder.milk > 0 || currentOrder.ghee > 0 || currentOrder.chach > 0);

  
  const [localOrder, setLocalOrder] = useState({ milk: 0, ghee: 0, chach: 0 });
  const [isAddingMore, setIsAddingMore] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    setLocalOrder({
      milk: currentOrder.milk || 0,
      ghee: currentOrder.ghee || 0,
      chach: currentOrder.chach || 0,
    });
    setIsEditing(true);
    setIsAddingMore(true);
  };

  useEffect(() => {
    setLocalOrder({ milk: 0, ghee: 0, chach: 0 });
    setIsAddingMore(false);
    setIsEditing(false);
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
    if (isEditing) {
      // In edit mode: replace entire order with new quantities
      onSaveOrder(selectedDate, localOrder, true); // true = replace mode
    } else {
      onSaveOrder(selectedDate, localOrder);
    }
    setLocalOrder({ milk: 0, ghee: 0, chach: 0 });
    setIsAddingMore(false);
    setIsEditing(false);
  };

  const handleCancelSelection = () => {
    setLocalOrder({ milk: 0, ghee: 0, chach: 0 });
  };

  const localDayTotal = (localOrder.milk * prices.milk) + (localOrder.ghee * prices.ghee) + (localOrder.chach * prices.chach);

  // ---- RECEIPT VIEW (has order, not editing) ----
  if (hasOrder && !isAddingMore) {
    const dayTotal = (currentOrder.milk || 0) * prices.milk + 
                     (currentOrder.ghee || 0) * prices.ghee + 
                     (currentOrder.chach || 0) * prices.chach;

    return (
      <div className="luxury-receipt" style={{ padding: '1.5rem' }}>
        <div className="receipt-header">
          <ReceiptText size={32} className="receipt-icon" />
          <h2>Order Receipt</h2>
          <p className="receipt-date">{format(selectedDate, 'EEEE, d MMMM')}</p>
          {currentOrder.status === 'pending' ? (
             <p className="no-order-msg" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'inline-block', marginTop: '1rem' }}>
               ⏳ Pending Admin Approval
             </p>
          ) : currentOrder.status === 'approved' ? (
             <p className="no-order-msg" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'inline-block', marginTop: '1rem' }}>
               ✅ Order Approved
             </p>
          ) : null}
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

        {/* Add Items & Edit Items buttons — shown only if ordering is still allowed */}
        {isOrderable ? (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button 
              onClick={() => { setIsEditing(false); setLocalOrder({ milk: 0, ghee: 0, chach: 0 }); setIsAddingMore(true); }}
              style={{
                flex: 1, padding: '0.9rem',
                background: 'linear-gradient(135deg, var(--primary), #6366f1)',
                color: 'white', border: 'none', borderRadius: '14px',
                fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
                fontSize: '0.95rem', transition: 'all 0.2s'
              }}
            >
              <ShoppingBag size={17} /> Add
            </button>
            <button 
              onClick={startEditing}
              style={{
                flex: 1, padding: '0.9rem',
                background: 'var(--surface)',
                color: 'var(--text-primary)', border: '2px solid var(--primary)', borderRadius: '14px',
                fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontSize: '0.95rem', transition: 'all 0.2s'
              }}
            >
              <Pencil size={17} /> Edit
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)', textAlign: 'center' }}>
            {isOnVacation && (
              <div style={{ padding: '0.5rem', marginBottom: '0.5rem', background: '#e0f2fe', borderRadius: '8px', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.8rem' }}>
                🏖️ Vacation mode is active for this date.
              </div>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isApproved ? '🔒 Order is approved and locked'
                : isPastDate ? '📅 Past date — cannot modify'
                : isTodayLocked ? '⏰ Today\'s window closed at 10:30 AM'
                : isFutureBeyondTomorrow ? '📆 Only Today & Tomorrow orders allowed'
                : '🔒 Order locked'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ---- EMPTY STATE (no order, not orderable) ----
  if (!isOrderable && !hasOrder) {
    return (
      <div className="empty-history" style={{ padding: '2rem 1rem' }}>
        <CalendarCheck size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
        <h3>No Orders Found</h3>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>You didn't place any orders on {format(selectedDate, 'do MMMM yyyy')}.</p>
        <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: 'var(--primary)' }}>
          {isApproved ? 'This order is already approved and locked.' 
            : isPastDate ? 'This is a past date. Orders cannot be placed or modified.'
            : isTodayLocked ? 'Orders for today are closed after 10:30 AM.'
            : isFutureBeyondTomorrow ? 'You can only place orders for Today and Tomorrow.'
            : ''}
        </p>
      </div>
    );
  }

  // ---- ADD ITEMS FORM ----
  return (
    <>
      <div className="sidebar-store">
        {/* Header with back button when adding more to existing order */}
        <div className="store-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
              <CalendarCheck style={{ color: '#d97706', flexShrink: 0 }} size={24} />
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', lineHeight: '1.5' }}>
                We deliver between 6 AM and 10:30 AM daily. 
                {isTodayLocked ? ' Orders for today are now locked.' : ' Any edits for tomorrow must be done before 10:30 AM today.'}
              </p>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {isEditing ? 'Edit Order' : hasOrder ? 'Add More Items' : 'Order Items'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{format(selectedDate, 'EEEE, do MMMM yyyy')}</p>
            {isEditing && (
              <p style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.3rem', fontWeight: 600 }}>✏️ Editing existing order — adjust quantities and confirm</p>
            )}
            {!isEditing && isTodayDate && (
              <p style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.3rem', fontWeight: 600 }}>⏰ Today: Add before 10:30 AM</p>
            )}
            {!isEditing && isTomorrowDate && (
              <p style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.3rem', fontWeight: 600 }}>📅 Tomorrow: Add before 10:30 AM tomorrow</p>
            )}
          </div>
          {hasOrder && (
            <button
              onClick={() => { 
                handleCancelSelection(); 
                setIsAddingMore(false); 
                setIsEditing(false);
              }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <X size={18} />
            </button>
          )}
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
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Already</span>
                        <div style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {alreadyOrdered}{p.unit}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="sidebar-product-controls">
                    <span className="subtotal">
                      {isEditing
                        ? qty > 0 ? `₹${qty * p.price}` : 'Set to 0'
                        : qty > 0 ? `+ ₹${qty * p.price} new` : 'Add to order'
                      }
                    </span>
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
                onClick={() => {
                  handleCancelSelection();
                  if (hasOrder) { setIsAddingMore(false); setIsEditing(false); }
                }}
                style={{ flex: 1, padding: '1rem 0.5rem', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0.5rem', background: isEditing ? '#f59e0b' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: `0 4px 12px ${isEditing ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`, transition: 'all 0.2s' }}
              >
                <ShieldCheck size={20} />
                {isEditing ? `Save Changes ₹${localDayTotal}` : `Confirm ₹${localDayTotal}`}
              </button>
            </div>
          ) : (
            !hasOrder ? (
              <button 
                disabled
                style={{ width: '100%', padding: '1rem', background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '12px', fontWeight: 'bold', cursor: 'not-allowed' }}
              >
                Select items to add
              </button>
            ) : (
              <button 
                onClick={() => { setIsAddingMore(false); setIsEditing(false); }}
                style={{ width: '100%', padding: '1rem', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Back to Receipt
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default DailyStore;
