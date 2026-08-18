import React, { useState, useMemo } from 'react';
import { Package, TrendingUp, TrendingDown, Database, Save, Power, BrainCircuit, CalendarDays } from 'lucide-react';
import { format, addDays } from 'date-fns';

const AdminInventory = ({ globalOrders, globalInventory, setGlobalInventory, prices }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayInventory = globalInventory[todayStr] || { milkBrought: '' };
  
  const [milkInput, setMilkInput] = useState(todayInventory.milkBrought);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate milk delivered today
  let milkDelivered = 0;
  Object.keys(globalOrders || {}).forEach(mobile => {
    const userOrders = globalOrders[mobile];
    if (userOrders[todayStr] && userOrders[todayStr].status !== 'rejected') {
      milkDelivered += parseFloat(userOrders[todayStr].milk || 0);
    }
  });

  const handleSave = () => {
    setIsSaving(true);
    const val = parseFloat(milkInput);
    setGlobalInventory(prev => ({
      ...prev,
      [todayStr]: { ...prev[todayStr], milkBrought: isNaN(val) ? 0 : val }
    }));
    setTimeout(() => setIsSaving(false), 500);
  };

  const toggleItemStock = (itemKey) => {
    setGlobalInventory(prev => ({
      ...prev,
      [itemKey]: prev[itemKey] === false ? true : false
    }));
  };

  const milkBrought = parseFloat(todayInventory.milkBrought) || 0;
  const remainingStock = milkBrought - milkDelivered;

  // AI Predictor Logic
  const tomorrow = addDays(new Date(), 1);
  const tomorrowDayIndex = tomorrow.getDay(); // 0 is Sunday
  
  const prediction = useMemo(() => {
    const dateTotals = {};
    let totalDays = 0;

    Object.values(globalOrders || {}).forEach(userOrders => {
      Object.entries(userOrders).forEach(([dateStr, order]) => {
         if (dateStr < format(new Date(), 'yyyy-MM-dd') && (order.status === 'delivered' || order.status === 'approved' || order.status === 'pending')) {
            if (!dateTotals[dateStr]) {
              dateTotals[dateStr] = { milk: 0, paneer: 0, chach: 0, ghee: 0, curd: 0 };
              totalDays++;
            }
            dateTotals[dateStr].milk += (order.milk || 0);
            dateTotals[dateStr].paneer += (order.paneer || 0);
            dateTotals[dateStr].chach += (order.chach || 0);
            dateTotals[dateStr].ghee += (order.ghee || 0);
            dateTotals[dateStr].curd += (order.curd || 0);
         }
      });
    });

    const dates = Object.keys(dateTotals);
    if (dates.length === 0) return { milk: 20, paneer: 1, chach: 5, ghee: 1, curd: 2 }; // Default baseline

    let sumMilk = 0, sumPaneer = 0, sumChach = 0, sumGhee = 0, sumCurd = 0;
    dates.forEach(d => {
       sumMilk += dateTotals[d].milk;
       sumPaneer += dateTotals[d].paneer;
       sumChach += dateTotals[d].chach;
       sumGhee += dateTotals[d].ghee;
       sumCurd += dateTotals[d].curd;
    });

    let avgMilk = sumMilk / dates.length;
    let avgPaneer = sumPaneer / dates.length;
    let avgChach = sumChach / dates.length;
    let avgGhee = sumGhee / dates.length;
    let avgCurd = sumCurd / dates.length;

    // Apply Sunday Multiplier
    if (tomorrowDayIndex === 0) {
       avgPaneer *= 1.8; // 80% more demand on Sunday
       avgChach *= 1.3;
       avgCurd *= 1.5;
    }

    // Apply 5% safe buffer to avoid stockouts
    return {
       milk: Math.ceil(avgMilk * 1.05),
       paneer: Math.ceil(avgPaneer * 1.05),
       chach: Math.ceil(avgChach * 1.05),
       ghee: Math.ceil(avgGhee * 1.05),
       curd: Math.ceil(avgCurd * 1.05)
    };
  }, [globalOrders, tomorrowDayIndex]);


  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* AI PREDICTOR CARD */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.1, transform: 'scale(2)' }}>
           <BrainCircuit size={100} color="#10b981" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
           <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '12px' }}>
              <BrainCircuit size={24} color="#10b981" />
           </div>
           <div>
             <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
               AI Stock Predictor <span style={{ background: '#10b981', color: 'white', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Pro</span>
             </h3>
             <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Auto-calculated with 5% safety buffer</p>
           </div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CalendarDays size={16}/> Expected Demand for Tomorrow</span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{format(tomorrow, 'EEEE, dd MMM')}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6', minWidth: '100px' }}>
               <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Milk</div>
               <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{prediction.milk}<span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>L</span></div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '3px solid #f59e0b', minWidth: '100px' }}>
               <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Paneer</div>
               <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{prediction.paneer}<span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>kg</span></div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '3px solid #10b981', minWidth: '100px' }}>
               <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Chach</div>
               <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{prediction.chach}<span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>L</span></div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '3px solid #eab308', minWidth: '100px' }}>
               <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Ghee</div>
               <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{prediction.ghee}<span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>kg</span></div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.8rem 1.2rem', borderRadius: '8px', borderLeft: '3px solid #a855f7', minWidth: '100px' }}>
               <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Curd</div>
               <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{prediction.curd}<span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>kg</span></div>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>
        <Package size={24} color="var(--primary)" /> Daily Inventory ({format(new Date(), 'dd MMM yyyy')})
      </h2>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Milk Brought Today (Liters)</label>
          <input 
            type="number" 
            value={milkInput} 
            onChange={(e) => setMilkInput(e.target.value)} 
            placeholder="e.g. 100"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1.1rem', boxSizing: 'border-box' }}
          />
        </div>
        <button onClick={handleSave} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', height: '47px' }}>
          {isSaving ? 'Saved!' : <><Save size={18} /> Save</>}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        
        {/* Statistics Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Milk Produced/Brought</span>
              <TrendingUp size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{milkBrought} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>L</span></div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Milk Delivered</span>
              <TrendingDown size={20} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{milkDelivered} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>L</span></div>
          </div>
        </div>

        {/* Live Liquid Tank */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Remaining Stock</span>
            <Database size={20} color={remainingStock < (milkBrought * 0.1) ? '#ef4444' : 'var(--primary)'} />
          </div>
          
          <div className="liquid-tank-container" style={{ border: remainingStock < (milkBrought * 0.1) ? '4px solid rgba(239, 68, 68, 0.5)' : '4px solid rgba(16, 185, 129, 0.3)' }}>
            {/* Height percentage calculation */}
            <div className="liquid-tank-fill" style={{ 
              height: milkBrought > 0 ? `${Math.max(0, Math.min(100, (remainingStock / milkBrought) * 100))}%` : '0%',
              background: remainingStock < (milkBrought * 0.1) ? 'linear-gradient(180deg, #fecaca 0%, #f87171 100%)' : 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)'
            }}></div>
            
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', color: '#0f172a', textShadow: '0 2px 4px rgba(255,255,255,0.8)', zIndex: 10 }}>
              {remainingStock} <span style={{ fontSize: '1rem', marginLeft: '2px' }}>L</span>
            </div>
          </div>
          {remainingStock < (milkBrought * 0.1) && milkBrought > 0 && (
            <div style={{ marginTop: '0.8rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>LOW STOCK WARNING</div>
          )}
        </div>

      </div>

      <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>Out of Stock Control (Applies to Customers)</h3>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {['milk', 'ghee', 'chach', 'paneer', 'curd'].map(item => {
          // If not strictly false, consider it true (in stock)
          const isAvailable = globalInventory[item] !== false; 
          return (
            <div key={item} style={{ background: isAvailable ? 'white' : '#f8fafc', border: `2px solid ${isAvailable ? '#10b981' : 'var(--border)'}`, borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s', opacity: isAvailable ? 1 : 0.6 }} onClick={() => toggleItemStock(item)}>
              <div style={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: '1.1rem', color: isAvailable ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item}</div>
              <div style={{ background: isAvailable ? '#dcfce7' : '#e2e8f0', color: isAvailable ? '#15803d' : '#64748b', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Power size={14} />
                {isAvailable ? 'IN STOCK' : 'SOLD OUT'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminInventory;
