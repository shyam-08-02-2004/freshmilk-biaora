import React from 'react';
import { DownloadCloud, Users, Milk, IndianRupee } from 'lucide-react';

const AdminExportData = () => {
  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>
        <DownloadCloud size={24} color="var(--primary)" /> Export Data
      </h2>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: '#1e40af', marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontWeight: '500' }}>This feature is coming soon. You will be able to export your system data to Excel/CSV for accounting purposes.</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <button style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '50%', color: '#0284c7' }}>
            <Users size={32} />
          </div>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Export Customers List</span>
        </button>
        
        <button style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#d97706' }}>
            <Milk size={32} />
          </div>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Export Monthly Orders</span>
        </button>

        <button style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '50%', color: '#16a34a' }}>
            <IndianRupee size={32} />
          </div>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Export Payments & Billing</span>
        </button>
      </div>
    </div>
  );
};

export default AdminExportData;
