import React from 'react';
import { Package, TrendingUp, TrendingDown, Database } from 'lucide-react';

const AdminInventory = () => {
  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>
        <Package size={24} color="var(--primary)" /> Daily Inventory
      </h2>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: '#1e40af', marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontWeight: '500' }}>This feature is coming soon. You will be able to track how much milk/products were produced vs delivered daily.</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Milk Produced/Brought</span>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>100 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>L</span></div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Milk Delivered</span>
            <TrendingDown size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>95 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>L</span></div>
        </div>

        <div style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', opacity: 0.9 }}>Remaining Stock</span>
            <Database size={20} color="white" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>5 <span style={{ fontSize: '1rem', opacity: 0.8 }}>L</span></div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
