import React from 'react';
import { Truck, Plus, UserCircle } from 'lucide-react';

const AdminDeliveryStaff = () => {
  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--text-primary)' }}>
          <Truck size={24} color="var(--primary)" /> Delivery Staff
        </h2>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)' }}>
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: '#1e40af', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0, fontWeight: '500' }}>This feature is coming soon. You will be able to create separate login accounts for your delivery staff here.</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {/* Placeholder Staff Card */}
        <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '1.2rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#f1f5f9', padding: '0.8rem', borderRadius: '50%' }}>
            <UserCircle size={32} color="#64748b" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.2rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>Demo Boy</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ID: DEL-001</p>
            <span style={{ display: 'inline-block', marginTop: '0.4rem', background: '#dcfce7', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '10px', fontWeight: 'bold' }}>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDeliveryStaff;
