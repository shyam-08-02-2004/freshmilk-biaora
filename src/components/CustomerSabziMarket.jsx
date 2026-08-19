import React, { useState, useMemo, useEffect } from 'react';
import { Leaf, ShoppingCart, Clock, CheckCircle2, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const CustomerSabziMarket = ({ 
  currentUser, 
  globalVegetables = [], 
  globalSabziOrders = {}, 
  orders = {} 
}) => {
  const [cart, setCart] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [cartInitialized, setCartInitialized] = useState(false);

  // Time & Date logic
  const now = new Date();
  const currentHour = now.getHours();
  const isTooEarly = currentHour < 16; // Before 4 PM
  const isTooLate = currentHour >= 22; // After 10 PM
  const isMarketClosed = isTooEarly || isTooLate;
  const tomorrowDate = addDays(now, 1);
  const tomorrowStr = format(tomorrowDate, 'yyyy-MM-dd');
  
  // Dependency Check
  const hasMilkForTomorrow = (orders[tomorrowStr]?.milk > 0);

  const existingOrder = globalSabziOrders[currentUser?.mobile]?.[tomorrowStr];

  useEffect(() => {
    if (existingOrder && existingOrder.status === 'pending' && !cartInitialized) {
      const initialCart = {};
      existingOrder.items.forEach(item => {
        initialCart[item.id] = item.qty;
      });
      setCart(initialCart);
      setCartInitialized(true);
    }
  }, [existingOrder, cartInitialized]);

  // Cart total
  const cartTotal = useMemo(() => {
    return Object.keys(cart).reduce((total, id) => {
      const veg = globalVegetables.find(v => v.id === id);
      if (veg) total += veg.price * cart[id];
      return total;
    }, 0);
  }, [cart, globalVegetables]);

  const handleSetCart = (id, val) => {
    setCart(prev => {
      const nw = { ...prev };
      if (val <= 0) delete nw[id];
      else nw[id] = val;
      return nw;
    });
  };
  
  const handleUpdateCart = (id, delta) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const newCart = { ...prev };
        delete newCart[id];
        return newCart;
      }
      return { ...prev, [id]: next };
    });
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userMobile = currentUser.mobile;
      const userOrders = globalSabziOrders[userMobile] || {};
      let updatedUserOrders = { ...userOrders };

      if (Object.keys(cart).length === 0) {
        // Delete the order if cart is empty
        delete updatedUserOrders[tomorrowStr];
      } else {
        // Build order details
        const orderDetails = Object.keys(cart).map(id => {
          const veg = globalVegetables.find(v => v.id === id);
          return {
            id,
            name: veg.name,
            qty: cart[id],
            unit: veg.unit,
            price: veg.price,
            total: veg.price * cart[id]
          };
        });

        const newOrder = {
          items: orderDetails,
          total: cartTotal,
          status: 'pending', // pending -> delivered
          placedAt: new Date().toISOString()
        };
        
        updatedUserOrders[tomorrowStr] = newOrder;
      }

      const newGlobalSabziOrders = {
        ...globalSabziOrders,
        [userMobile]: updatedUserOrders
      };

      await setDoc(doc(db, "store", "globalSabziOrders"), { data: newGlobalSabziOrders });
      
      setOrderSuccess(true);
      setShowHistory(true);
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (e) {
      alert("Error placing order: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get History
  const historyList = useMemo(() => {
    const userOrders = globalSabziOrders[currentUser?.mobile] || {};
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = subDays(new Date(), i);
      const ds = format(d, 'yyyy-MM-dd');
      if (userOrders[ds]) {
        list.push({ date: ds, ...userOrders[ds] });
      }
    }
    return list;
  }, [globalSabziOrders, currentUser]);

  return (
    <div style={{ padding: '1rem', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Leaf size={24} /> Sabzi Market
        </h2>
        {!showHistory && (
          <button 
            onClick={() => setShowHistory(true)}
            style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            History
          </button>
        )}
      </div>

      {showHistory ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <button 
              onClick={() => setShowHistory(false)}
              style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ArrowLeft size={20} color="#475569" />
            </button>
            <h3 style={{ margin: 0, color: '#334155', fontSize: '1.2rem' }}>Last 7 Days History</h3>
          </div>
          
          {historyList.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: '2rem 0' }}>No recent sabzi orders.</p>
          ) : (
            historyList.map(item => (
              <div key={item.date} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{format(new Date(item.date), 'dd MMM yyyy')}</span>
                  <span style={{ 
                    color: item.status === 'delivered' ? '#10b981' : '#f59e0b',
                    background: item.status === 'delivered' ? '#d1fae5' : '#fef3c7',
                    padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold'
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
                {item.items.map(v => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569' }}>
                    <span>{v.name} {v.unit === 'kg' && v.qty < 1 ? `(${v.qty * 1000}g)` : `x ${v.qty} ${v.unit !== 'piece' && v.unit !== 'kg' ? v.unit : ''}${v.unit === 'kg' && v.qty >= 1 ? 'kg' : ''}`}</span>
                    <span>₹{v.total}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Total</span>
                    {item.isPaid ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <span style={{ fontSize: '1rem' }}>✅</span> Paid
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <span style={{ fontSize: '0.9rem' }}>🔲</span> Unpaid
                      </span>
                    )}
                  </div>
                  <span style={{ color: item.isPaid ? '#15803d' : '#0f172a', fontSize: '1.1rem' }}>₹{item.total}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Status Checks */}
          {isMarketClosed && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontWeight: 'bold' }}>
              <Clock size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                {isTooEarly ? 'Sabzi market sham 4:00 baje khulega (kal ki delivery ke liye).' : 'Market closes at 10 PM. Ordering is closed for tomorrow.'}
              </div>
            </div>
          )}

          {!hasMilkForTomorrow && !isMarketClosed && (
            <div style={{ background: '#fffbeb', color: '#b45309', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontWeight: 'bold' }}>
              <AlertCircle size={24} style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: '0 0 0.3rem 0' }}>Action Required!</p>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'normal' }}>Aapko sabzi mangwane ke liye pehle kal ka doodh (Milk) order karna hoga. Delivery free rakhne ke liye ye zaroori hai.</p>
              </div>
            </div>
          )}

          {/* Existing Order Notice (Editable until 10 PM) */}
          {existingOrder && existingOrder.status === 'pending' && !isMarketClosed && (
             <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontWeight: 'bold' }}>
               <AlertCircle size={24} style={{ flexShrink: 0 }} />
               <div>
                 <p style={{ margin: '0 0 0.3rem 0' }}>Order Placed!</p>
                 <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'normal' }}>Aap apna order 10:00 PM tak edit kar sakte hain. Item hatane ke liye quantity 0 karke Update dabayen.</p>
               </div>
             </div>
          )}
          
          {existingOrder && existingOrder.status === 'delivered' && !isMarketClosed && (
             <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
               <CheckCircle2 size={20} />
               Aapka order deliver ho chuka hai, ab edit nahi ho sakta.
             </div>
          )}

          {/* Veggie List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '100px' }}>
            {globalVegetables.map(veg => (
              <div key={veg.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', opacity: veg.inStock ? 1 : 0.5 }}>
                <div style={{ marginRight: '1rem', background: '#f8fafc', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', overflow: 'hidden' }}>
                  {veg.image ? (
                    <img src={veg.image} alt={veg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2.5rem' }}>{veg.emoji}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem', color: '#1e293b', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
       {veg.name} 
       {veg.originalPrice && veg.originalPrice > veg.price && (
         <span style={{background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px'}}>SALE</span>
       )}
    </h4>
                  <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>
       {veg.originalPrice && veg.originalPrice > veg.price ? (
          <>
             <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: '0.5rem', fontSize: '0.9rem' }}>₹{veg.originalPrice}</span>
             <span>₹{veg.price} / {veg.unit}</span>
          </>
       ) : (
          <span>₹{veg.price} / {veg.unit}</span>
       )}
    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!veg.inStock ? (
                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }}>Out of Stock</span>
                  ) : (
                    
                    <>
                      {veg.unit === 'kg' ? (
                        <select 
                          value={cart[veg.id] || 0} 
                          onChange={(e) => handleSetCart(veg.id, Number(e.target.value))}
                          disabled={isMarketClosed || !hasMilkForTomorrow || existingOrder?.status === 'delivered'}
                          style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #10b981', background: cart[veg.id] ? '#10b981' : 'white', color: cart[veg.id] ? 'white' : '#10b981', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none' }}
                        >
                          <option value={0}>Add</option>
                          <option value={0.1}>100g</option>
                          <option value={0.25}>250g</option>
                          <option value={0.5}>500g</option>
                          <option value={1}>1 kg</option>
                          <option value={1.5}>1.5 kg</option>
                          <option value={2}>2 kg</option>
                        </select>
                      ) : veg.unit === 'g' || veg.unit === '100g' || veg.unit === '250g' || veg.unit === '500g' ? (
                        <select 
                          value={cart[veg.id] || 0} 
                          onChange={(e) => handleSetCart(veg.id, Number(e.target.value))}
                          disabled={isMarketClosed || !hasMilkForTomorrow || existingOrder?.status === 'delivered'}
                          style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #10b981', background: cart[veg.id] ? '#10b981' : 'white', color: cart[veg.id] ? 'white' : '#10b981', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none' }}
                        >
                          <option value={0}>Add</option>
                          <option value={1}>1 Pack</option>
                          <option value={2}>2 Pack</option>
                          <option value={3}>3 Pack</option>
                        </select>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <button 
                            onClick={() => handleUpdateCart(veg.id, -1)}
                            disabled={!cart[veg.id] || isMarketClosed || !hasMilkForTomorrow || existingOrder?.status === 'delivered'}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >-</button>
                          <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{cart[veg.id] || 0}</span>
                          <button 
                            onClick={() => handleUpdateCart(veg.id, 1)}
                            disabled={isMarketClosed || !hasMilkForTomorrow || existingOrder?.status === 'delivered'}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >+</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Floating Cart Checkout */}
          {(cartTotal > 0 || (existingOrder && existingOrder.status === 'pending')) && (
            <div style={{ position: 'fixed', bottom: '80px', left: '0', right: '0', padding: '1rem', zIndex: 100 }}>
              <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                <div>
                  <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Total Amount</p>
                  <h3 style={{ margin: 0, fontSize: '1.4rem' }}>₹{cartTotal}</h3>
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || existingOrder?.status === 'delivered' || isMarketClosed}
                  style={{ background: cartTotal === 0 ? '#ef4444' : '#10b981', color: 'white', border: 'none', padding: '0.8rem 1.2rem', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  {cartTotal === 0 ? <Trash2 size={20} /> : <ShoppingCart size={20} />}
                  {isSubmitting ? 'Saving...' : (cartTotal === 0 ? 'Cancel Order' : (existingOrder ? 'Update Order' : 'Place Order'))}
                </button>
              </div>
              <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
                * Payment on Delivery (Cash/QR)
              </p>
            </div>
          )}
        </>
      )}

      {orderSuccess && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1000 }}>
          <CheckCircle2 size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Success!</h2>
          <p style={{ margin: 0, textAlign: 'center' }}>Sabzi order updated.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerSabziMarket;
