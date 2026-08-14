import React, { useState, useEffect } from 'react';
import { format, isBefore, startOfDay, addDays, isAfter, isSameDay } from 'date-fns';
import { Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const OrderCard = ({ 
  selectedDate, 
  currentOrder, 
  onSaveOrder, 
  prices, 
  currentUser 
}) => {
  const { t } = useLanguage();
  const today = startOfDay(new Date());
  const now = new Date();
  const tomorrow = addDays(today, 1);
  const isPastDate = isBefore(startOfDay(selectedDate), today);
  const isFutureBeyondTomorrow = isAfter(startOfDay(selectedDate), tomorrow);
  
  const isTodayDate = isSameDay(selectedDate, today);
  const isTomorrowDate = isSameDay(selectedDate, tomorrow);
  
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

  const isPast1130AM = now.getHours() > 11 || (now.getHours() === 11 && now.getMinutes() >= 30);
  const isLockedToday = isTodayDate && isPast1130AM;
  const isApproved = currentOrder?.status === 'approved';
  const isOrderable = !isPastDate && !isLockedToday && !isApproved && !isFutureBeyondTomorrow && !isOnVacation;

  const [localOrder, setLocalOrder] = useState({
    milk: currentOrder?.milk || 0,
    ghee: currentOrder?.ghee || 0,
    chach: currentOrder?.chach || 0,
    paneer: currentOrder?.paneer || 0,
    curd: currentOrder?.curd || 0
  });

  useEffect(() => {
    setLocalOrder({
      milk: currentOrder?.milk || 0,
      ghee: currentOrder?.ghee || 0,
      chach: currentOrder?.chach || 0,
      paneer: currentOrder?.paneer || 0,
      curd: currentOrder?.curd || 0
    });
  }, [selectedDate, JSON.stringify(currentOrder)]);

  const products = [
    { id: 'milk', name: t('milk'), desc: 'Pure & Fresh', price: prices.milk, unit: 'litre', img: '/assets/milk.png', step: 1 },
    { id: 'ghee', name: t('ghee'), desc: 'Pure Cow Ghee', price: prices.ghee, unit: '500g', img: '/assets/ghee.png', step: 1 },
    { id: 'chach', name: t('chach'), desc: 'Fresh & Healthy', price: prices.chach, unit: '500ml', img: '/assets/chach.png', step: 1 },
    { id: 'paneer', name: t('paneer'), desc: 'Fresh & Soft', price: prices.paneer, unit: '200g', img: '/assets/paneer.png', step: 1 },
    { id: 'curd', name: t('curd'), desc: 'Thick & Tasty', price: prices.curd, unit: '500g', img: '/assets/curd.jpg', step: 1 }
  ];

  const updateLocalQty = (id, val) => {
    if (!isOrderable) return;
    setLocalOrder(prev => ({ ...prev, [id]: val }));
  };

  const localDayTotal = (localOrder.milk * prices.milk) + 
                        (localOrder.ghee * prices.ghee) + 
                        (localOrder.chach * prices.chach) + 
                        ((localOrder.paneer || 0) * prices.paneer) + 
                        ((localOrder.curd || 0) * prices.curd);
                        
  const totalWithEmergency = localDayTotal;
                        
  const hasChanges = localOrder.milk !== (currentOrder?.milk || 0) ||
                     localOrder.ghee !== (currentOrder?.ghee || 0) ||
                     localOrder.chach !== (currentOrder?.chach || 0) ||
                     localOrder.paneer !== (currentOrder?.paneer || 0) ||
                     localOrder.curd !== (currentOrder?.curd || 0);

  const handleConfirm = () => {
    if (!isOrderable || !hasChanges) return;
    const orderToSave = { ...localOrder };
    onSaveOrder(selectedDate, orderToSave, true); // replaceMode = true
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={20} color="var(--text-primary)" /> Select Items
        </h3>
        <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {isTomorrowDate ? "Add items for tomorrow's delivery" : isTodayDate ? "Add items for today's delivery" : `Orders for ${format(selectedDate, 'do MMM yyyy')}`}
        </p>
      </div>

      <div className="products-grid">
        {!isOrderable && (isPastDate || isApproved) && products.filter(p => (localOrder[p.id] || 0) > 0).length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
            <p>No items were ordered on this date.</p>
          </div>
        ) : (
          products.map((p, idx) => {
            const qty = localOrder[p.id] || 0;
            
            // If it's a historical/locked date and qty is 0, don't show the product
            if (!isOrderable && (isPastDate || isApproved) && qty === 0) return null;

            return (
              <div key={p.id} className="order-item-card">
                <img src={p.img} alt={p.name} className="order-item-img" />
                <div className="order-item-details">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {p.name} {currentOrder?.[p.id] > 0 && <span style={{ background: '#10b981', color: 'white', borderRadius: '50%', width: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✓</span>}
                  </h4>
                  <p>{p.desc}</p>
                  <p style={{ marginTop: '0.2rem', color: 'var(--text-primary)', fontWeight: 500 }}>₹{p.price} / {p.unit}</p>
                </div>
                
                <div className="order-item-controls">
                  {isOrderable || isFutureBeyondTomorrow || isOnVacation ? (
                    <div className="qty-control" style={{ opacity: isOrderable ? 1 : 0.5 }}>
                      <button 
                        className="qty-btn" 
                        onClick={() => updateLocalQty(p.id, Math.max(0, qty - p.step))}
                        disabled={!isOrderable}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="qty-display">{qty}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => updateLocalQty(p.id, qty + p.step)}
                        disabled={!isOrderable}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Qty: {qty}
                    </div>
                  )}
                  <div className="item-total">
                    ₹{qty * p.price}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>



      {!isOrderable && (
        <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isApproved ? '🔒 Order is approved and locked'
            : isPastDate ? '📅 Past date — cannot modify'
            : isLockedToday ? '⏰ Time over — cannot order for today'
            : isFutureBeyondTomorrow ? '📆 Only Today & Tomorrow orders allowed'
            : isOnVacation ? '🏖️ Vacation mode is active'
            : '🔒 Order locked'}
        </div>
      )}

      <div style={{ padding: '1.25rem', background: '#f8fafc', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          onClick={handleConfirm}
          disabled={!isOrderable || !hasChanges}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.5rem',
            background: (!isOrderable || !hasChanges) ? '#cbd5e1' : 'var(--secondary)',
            color: 'white', border: 'none', borderRadius: '12px',
            cursor: (!isOrderable || !hasChanges) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Total Amount</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{totalWithEmergency}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Confirm Order <ArrowRight size={20} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
