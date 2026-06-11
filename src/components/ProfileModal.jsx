import React, { useState } from 'react';
import { MapPin, KeyRound, Phone, Home, X, Save, Eye, EyeOff } from 'lucide-react';

const ProfileModal = ({ onClose }) => {
  const [flatNo, setFlatNo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dummyPassword = "Secret@123";
  
  return (
    <div className="modal-overlay" style={{ zIndex: 300 }}>
      <div className="modal-content profile-modal" style={{ maxWidth: '400px', position: 'relative' }}>
        <button onClick={onClose} className="close-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={20} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src="/assets/avatar.png" 
              alt="Profile Avatar" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', padding: '3px', marginBottom: '0.5rem' }} 
            />
            <div style={{ position: 'absolute', bottom: '10px', right: '0', background: 'var(--secondary)', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--surface)' }}></div>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>Your Profile</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your account details</p>
        </div>

        <div className="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="profile-field">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Phone size={16} /> Mobile Number
            </label>
            <div style={{ padding: '0.75rem 1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '500' }}>
              +91 98765 43210
            </div>
          </div>

          <div className="profile-field">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <KeyRound size={16} /> Password
            </label>
            <div style={{ padding: '0.75rem 1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ letterSpacing: showPassword ? 'normal' : '2px', color: showPassword ? 'var(--text-primary)' : 'inherit' }}>
                {showPassword ? dummyPassword : '••••••••'}
              </span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
                <span style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Change</span>
              </div>
            </div>
          </div>

          <div className="profile-field">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MapPin size={16} /> Current Location (Auto-detected)
            </label>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: '600' }}>
              Biaora, Madhya Pradesh 465674
            </div>
          </div>

          <div className="profile-field">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Home size={16} /> Flat / House Number
            </label>
            <input 
              type="text" 
              value={flatNo}
              onChange={(e) => setFlatNo(e.target.value)}
              placeholder="e.g. Flat 402, Block A"
              style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--primary-light)', fontWeight: '500', outline: 'none', color: 'var(--text-primary)', transition: 'all 0.2s' }}
            />
          </div>

          <button 
            onClick={onClose}
            style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' }}
          >
            <Save size={20} />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
