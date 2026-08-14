import React, { useState } from 'react';
import { MapPin, KeyRound, Phone, Home, X, Save, Eye, EyeOff, User, LogOut, Clock } from 'lucide-react';

const ProfileModal = ({ onClose, currentUser, onLogout, onProfileRequest, profileRequestStatus, onUpdateAvatar }) => {
  const [location, setLocation] = useState(currentUser?.location || '');
  const [flatNo, setFlatNo] = useState(currentUser?.flat || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const userPassword = currentUser?.password || "";
  
  const hasChanges = location !== currentUser?.location || flatNo !== currentUser?.flat;

  const handleRequestClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      if (hasChanges) {
        if (window.confirm("Are you sure you want to submit this profile update request to the admin?")) {
          onProfileRequest(currentUser.mobile, { location, flat: flatNo });
          setIsEditing(false);
        }
      } else {
        setIsEditing(false);
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 300 }}>
      <div className="modal-content profile-modal" style={{ maxWidth: '400px', position: 'relative' }}>
        <button onClick={onClose} className="close-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={20} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src={currentUser?.avatar || "/assets/babu_logo.png"} 
              alt="Profile Avatar" 
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', padding: '3px', marginBottom: '0.5rem' }} 
            />
            <label style={{ position: 'absolute', bottom: '10px', right: '0', background: 'var(--primary)', width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <span style={{ color: 'white', fontSize: '18px', lineHeight: 1, marginTop: '-2px' }}>+</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </label>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>{currentUser?.name || 'Your Profile'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your account details</p>
        </div>

        <div className="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div className="profile-field">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <User size={16} /> Name
            </label>
            <div style={{ padding: '0.6rem 1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '500', color: 'var(--text-secondary)' }}>
              {currentUser?.name || 'N/A'} (Cannot be changed)
            </div>
          </div>

          <div className="profile-field">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <Phone size={16} /> Mobile Number
            </label>
            <div style={{ padding: '0.6rem 1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '500', color: 'var(--text-secondary)' }}>
              {currentUser?.mobile} (Cannot be changed)
            </div>
          </div>

          {currentUser?.role !== 'admin' && (
            <>
              <div className="profile-field">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <MapPin size={16} /> Current Location
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--primary-light)', fontWeight: '500', outline: 'none', color: 'var(--text-primary)' }}
                  />
                ) : (
                  <div style={{ padding: '0.6rem 1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '500', color: 'var(--text-secondary)' }}>
                    {currentUser?.location || 'N/A'}
                  </div>
                )}
              </div>

              <div className="profile-field">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <Home size={16} /> Flat / House Number
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--primary-light)', fontWeight: '500', outline: 'none', color: 'var(--text-primary)' }}
                  />
                ) : (
                  <div style={{ padding: '0.6rem 1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '500', color: 'var(--text-secondary)' }}>
                    {currentUser?.flat || 'N/A'}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="profile-field">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <KeyRound size={16} /> Password
            </label>
            <div style={{ padding: '0.6rem 1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ letterSpacing: showPassword ? 'normal' : '2px', color: showPassword ? 'var(--text-primary)' : 'inherit' }}>
                {showPassword ? userPassword : '••••••••'}
              </span>
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {currentUser?.role !== 'admin' && (
            profileRequestStatus ? (
              <div style={{ marginTop: '0.5rem', padding: '0.8rem', background: '#fef3c7', color: '#d97706', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '600', justifyContent: 'center' }}>
                <Clock size={16} /> Profile update pending admin approval
              </div>
            ) : (
              <button 
                onClick={handleRequestClick}
                style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', background: (isEditing && !hasChanges) ? 'var(--border)' : 'var(--primary)', color: (isEditing && !hasChanges) ? 'var(--text-secondary)' : 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Save size={18} />
                {isEditing ? (hasChanges ? 'Submit Request' : 'Cancel Edit') : 'Request Update'}
              </button>
            )
          )}

          <button 
            onClick={onLogout}
            style={{ width: '100%', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
