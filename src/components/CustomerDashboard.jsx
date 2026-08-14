import React, { useState } from 'react';
import { format, addDays, startOfDay } from 'date-fns';
import { Clock, CreditCard, ShieldCheck } from 'lucide-react';
import HorizontalCalendar from './HorizontalCalendar';
import OrderCard from './OrderCard';

const CustomerDashboard = ({
  selectedDate,
  setCurrentDate,
  orders,
  onDayClick,
  currentUser,
  prices,
  onSaveOrder,
  monthTotalBill,
  monthPaidBill,
  totalBill,
  onOpenPayment
}) => {
  const tomorrow = format(addDays(startOfDay(new Date()), 1), 'yyyy-MM-dd');
  const tomorrowOrder = orders[tomorrow] || { milk: 0, ghee: 0, chach: 0, paneer: 0, curd: 0 };
  const hasTomorrowOrder = tomorrowOrder.milk > 0 || tomorrowOrder.ghee > 0 || tomorrowOrder.chach > 0 || tomorrowOrder.paneer > 0 || tomorrowOrder.curd > 0;

  const tomorrowTotal = (tomorrowOrder.milk * prices.milk) + 
                        (tomorrowOrder.ghee * prices.ghee) + 
                        (tomorrowOrder.chach * prices.chach) + 
                        ((tomorrowOrder.paneer || 0) * prices.paneer) + 
                        ((tomorrowOrder.curd || 0) * prices.curd);

  return (
    <div className="dashboard-grid">
      <div className="left-column">
        {/* Top Widgets Row */}
        <div className="widget-row">
          <div className="widget-card" style={{ flex: 1.2, background: '#f0fdf4', border: '1px solid #dcfce7' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--secondary)' }}>Total This Month</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)', lineHeight: 1 }}>₹{totalBill}</span>
              <button 
                onClick={onOpenPayment}
                style={{ background: 'var(--secondary)', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                <CreditCard size={18} /> Pay Bill
              </button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Paid: ₹{monthPaidBill}</span>
              <span style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>Remaining: ₹{totalBill}</span>
              <span 
                style={{ marginLeft: 'auto', color: 'var(--secondary)', cursor: 'pointer', fontWeight: 600 }}
                onClick={onOpenPayment}
              >
                View Details &gt;
              </span>
            </div>
          </div>

          <div className="widget-card timing-widget">
            <div className="timing-icon">
              <Clock size={24} />
            </div>
            <div className="timing-text">
              <h4>Order Time: 6:00 AM to 11:30 AM</h4>
              <p>Orders placed after 11:30 AM will be added for tomorrow.</p>
            </div>
            <img src="/assets/milk.png" alt="Milk" className="timing-img" />
          </div>
        </div>

        {/* Horizontal Calendar */}
        <HorizontalCalendar 
          selectedDate={selectedDate}
          setSelectedDate={setCurrentDate}
          orders={orders}
          onDayClick={onDayClick}
          currentUser={currentUser}
        />

        {/* Order Card */}
        <OrderCard 
          selectedDate={selectedDate}
          currentOrder={orders[format(selectedDate, 'yyyy-MM-dd')] || {}}
          onSaveOrder={onSaveOrder}
          prices={prices}
          currentUser={currentUser}
        />
      </div>

      <div className="right-column">
        {/* Tomorrow's Delivery Summary */}
        <div className="widget-card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', background: '#f0fdf4', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ background: '#dcfce7', padding: '0.6rem', borderRadius: '50%' }}>
              <span style={{ fontSize: '1.5rem' }}>🛵</span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--secondary)' }}>Tomorrow's Delivery</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{format(addDays(new Date(), 1), 'EEEE, d MMMM yyyy')}</p>
              <span style={{ display: 'inline-block', marginTop: '0.4rem', background: '#dcfce7', color: 'var(--secondary)', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>
                Delivery between 6 AM - 11:30 AM
              </span>
            </div>
          </div>
          
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Order Summary</h4>
            
            {!hasTomorrowOrder ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>No items ordered for tomorrow yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tomorrowOrder.milk > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <img src="/assets/milk.png" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                      <div>
                        <h5 style={{ margin: 0 }}>Milk</h5>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tomorrowOrder.milk} Litre</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>₹{tomorrowOrder.milk * prices.milk}</span>
                  </div>
                )}
                {tomorrowOrder.ghee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <img src="/assets/ghee.png" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                      <div>
                        <h5 style={{ margin: 0 }}>Ghee</h5>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tomorrowOrder.ghee} Kg</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>₹{tomorrowOrder.ghee * prices.ghee}</span>
                  </div>
                )}
                {tomorrowOrder.chach > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <img src="/assets/chach.png" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                      <div>
                        <h5 style={{ margin: 0 }}>Chach</h5>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tomorrowOrder.chach} Litre</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>₹{tomorrowOrder.chach * prices.chach}</span>
                  </div>
                )}
                {tomorrowOrder.paneer > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <img src="/assets/paneer.png" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                      <div>
                        <h5 style={{ margin: 0 }}>Paneer</h5>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tomorrowOrder.paneer} Kg</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>₹{tomorrowOrder.paneer * prices.paneer}</span>
                  </div>
                )}
                {tomorrowOrder.curd > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <img src="/assets/curd.jpg" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                      <div>
                        <h5 style={{ margin: 0 }}>Dahi</h5>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tomorrowOrder.curd} Kg</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>₹{tomorrowOrder.curd * prices.curd}</span>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>Total Amount</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>₹{tomorrowTotal}</span>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShieldCheck size={14} color="var(--secondary)" /> Safe</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} color="var(--secondary)" /> On Time Delivery</span>
            </div>
          </div>
        </div>

        <div className="promo-card" style={{ padding: '2rem 1.5rem', background: 'linear-gradient(135deg, #a7f3d0, #6ee7b7)', color: '#064e3b', border: 'none', position: 'relative', overflow: 'hidden', textAlign: 'left' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', position: 'relative', zIndex: 1 }}>Fresh & Pure<br/>Everyday</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8, maxWidth: '140px', position: 'relative', zIndex: 1 }}>We deliver purity at your doorstep.</p>
          <img src="/assets/milk.png" style={{ position: 'absolute', right: '-20px', bottom: '-20px', height: '140px', transform: 'rotate(-15deg)' }} />
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
