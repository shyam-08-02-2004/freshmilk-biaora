import React from 'react';
import { User, Phone, MapPin, X, CreditCard } from 'lucide-react';

const AdminContactModal = ({ onClose, onOpenPayment }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content admin-contact-modal" style={{ maxWidth: '400px', position: 'relative' }}>
        <button onClick={onClose} className="close-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={20} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
          <div style={{ width: 'clamp(120px, 40vw, 180px)', height: 'clamp(120px, 40vw, 180px)', margin: '0 auto 1.5rem', borderRadius: '50%', padding: '5px', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <img src="/assets/admin_photo.jpg" alt="Shyam Dangi" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>Shyam Dangi</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>Admin / Owner</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: '12px' }}>
            <Phone size={20} color="var(--primary)" />
            <span style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>7509766655</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: '12px' }}>
            <MapPin size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: '500', fontSize: '1rem', color: 'var(--text-primary)' }}>Babu dairy farm</span>
          </div>
        </div>

        <button 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s' }}
          onClick={onOpenPayment}
        >
          <CreditCard size={20} />
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default AdminContactModal;
