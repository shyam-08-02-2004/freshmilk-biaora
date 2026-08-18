import React, { useState } from 'react';
import { X, Check, Minus, Plus } from 'lucide-react';
import { format, startOfDay, addDays } from 'date-fns';

const QuickMilkModal = ({ onClose, onSaveOrder, currentOrders, prices, currentUser }) => {
  const now = new Date();
  const isPast1130AM = now.getHours() > 11 || (now.getHours() === 11 && now.getMinutes() >= 30);
  
  // Determine the default target date
  const targetDate = isPast1130AM ? addDays(startOfDay(new Date()), 1) : startOfDay(new Date());
  const dateKey = format(targetDate, 'yyyy-MM-dd');
  
  const existingOrder = currentOrders[dateKey] || {};
  const existingMilk = existingOrder.milk || 0;
  const [milkQty, setMilkQty] = useState(existingMilk || 1); // Default to 1 litre if they have 0
  const [isSaved, setIsSaved] = useState(false);
  const [orderedBy, setOrderedBy] = useState('Main Account');
  
  const isTodayDate = format(targetDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isPast7AM = now.getHours() >= 7;
  const isDecreaseLocked = isTodayDate && isPast7AM;

  // Slide-to-Order logic
  const [isSliding, setIsSliding] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const sliderRef = React.useRef(null);

  const handleDragStart = (e) => {
    if (milkQty === 0) return;
    setIsSliding(true);
  };

  const handleDrag = (e) => {
    if (!isSliding || !sliderRef.current || milkQty === 0) return;
    
    let clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const rect = sliderRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    
    // Calculate percentage (clamped between 0 and 100)
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(0, Math.min(percentage, 100));
    
    setSlideProgress(percentage);
    
    if (percentage > 95) {
      setIsSliding(false);
      setSlideProgress(100);
      handleConfirm();
    }
  };

  const handleDragEnd = () => {
    if (isSliding) {
      setIsSliding(false);
      // Snap back if not completed
      if (slideProgress <= 95) {
        setSlideProgress(0);
      }
    }
  };

  // Add event listeners for mouse/touch end on window to prevent sticking
  React.useEffect(() => {
    const handleUp = () => handleDragEnd();
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isSliding, slideProgress]);

  const handleConfirm = () => {
    // Keep existing items, just update milk
    const updatedOrder = {
      ...existingOrder,
      milk: milkQty,
      orderedBy: orderedBy !== 'Main Account' ? orderedBy : undefined
    };
    onSaveOrder(targetDate, updatedOrder, true); // replaceMode
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
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

              {currentUser?.familyMembers && currentUser.familyMembers.length > 0 && (
                <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Ordered By (Family Member)</label>
                  <select 
                    value={orderedBy}
                    onChange={(e) => setOrderedBy(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '0.95rem', fontWeight: '500', outline: 'none' }}
                  >
                    <option value="Main Account">Main Account ({currentUser.name})</option>
                    {currentUser.familyMembers.map((member, idx) => (
                      <option key={idx} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Slide to Order Container */}
              <div 
                ref={sliderRef}
                style={{ 
                  width: '100%', 
                  height: '60px', 
                  background: milkQty > 0 ? '#cbd5e1' : '#f1f5f9', 
                  borderRadius: '30px', 
                  position: 'relative', 
                  overflow: 'hidden',
                  marginTop: '1.5rem',
                  cursor: milkQty > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseMove={handleDrag}
                onTouchMove={handleDrag}
              >
                {/* Progress Fill */}
                <div style={{ 
                  position: 'absolute', top: 0, left: 0, height: '100%', 
                  width: `${slideProgress}%`, 
                  background: 'linear-gradient(90deg, var(--secondary) 0%, #34d399 100%)',
                  transition: isSliding ? 'none' : 'width 0.3s ease',
                  borderRadius: '30px 0 0 30px'
                }}></div>
                
                {/* Text Indicator */}
                <div style={{ 
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: slideProgress > 50 ? 'white' : (milkQty > 0 ? '#475569' : '#94a3b8'),
                  fontWeight: 'bold', fontSize: '1rem', zIndex: 1,
                  pointerEvents: 'none',
                  transition: 'color 0.2s'
                }}>
                  {milkQty > 0 ? `Slide to Order (₹${milkQty * prices.milk})` : 'Select Quantity'}
                </div>
                
                {/* Draggable Knob */}
                <div 
                  style={{
                    position: 'absolute', top: '4px', left: `calc(${slideProgress}% - ${slideProgress > 0 ? (slideProgress/100)*52 : 0}px + 4px)`,
                    width: '52px', height: '52px', background: 'white',
                    borderRadius: '50%', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: milkQty > 0 ? (isSliding ? 'grabbing' : 'grab') : 'not-allowed',
                    zIndex: 2, transition: isSliding ? 'none' : 'left 0.3s ease',
                    opacity: milkQty > 0 ? 1 : 0.5
                  }}
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                >
                  <div style={{ color: 'var(--secondary)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="13 17 18 12 13 7"></polyline>
                      <polyline points="6 17 11 12 6 7"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickMilkModal;
