import React, { useState } from 'react';
import { Package, TrendingUp, TrendingDown, Database, Save } from 'lucide-react';
import { format } from 'date-fns';

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

  const milkBrought = parseFloat(todayInventory.milkBrought) || 0;
  const remainingStock = milkBrought - milkDelivered;

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
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

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
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

        <div style={{ background: remainingStock < 0 ? '#ef4444' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.9 }}>Remaining Stock</span>
            <Database size={20} color="white" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{remainingStock} <span style={{ fontSize: '1rem', opacity: 0.8 }}>L</span></div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
