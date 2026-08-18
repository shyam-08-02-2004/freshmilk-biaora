import React, { useState } from 'react';
import { MapPin, KeyRound, Phone, Home, X, Save, Eye, EyeOff, User, LogOut, Clock, Users, Plus, Share2 } from 'lucide-react';

const ProfileModal = ({ onClose, currentUser, onLogout, onProfileRequest, profileRequestStatus, onUpdateAvatar, onUpdateFamily }) => {
  const [location, setLocation] = useState(currentUser?.location || '');
  const [flatNo, setFlatNo] = useState(currentUser?.flat || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [vacationStart, setVacationStart] = useState(currentUser?.vacationStart || '');
  const [vacationEnd, setVacationEnd] = useState(currentUser?.vacationEnd || '');
  const [newFamilyMember, setNewFamilyMember] = useState('');
  const userPassword = currentUser?.password || "";
  const familyMembers = currentUser?.familyMembers || [];
  
  const hasChanges = location !== currentUser?.location || flatNo !== currentUser?.flat || name !== currentUser?.name || mobile !== currentUser?.mobile;

  const handleRequestClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      if (hasChanges) {
        if (window.confirm("Are you sure you want to submit this profile update request to the admin?")) {
          onProfileRequest(currentUser.mobile, { name, mobile, location, flat: flatNo });
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
        // Create an image element to read the original dimensions
        const img = new Image();
        img.onload = () => {
          // Set target dimensions (max 150x150)
          const MAX_SIZE = 150;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          // Create a canvas to resize and compress
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // Draw and compress (JPEG 0.6 quality)
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          
          // Update avatar with tiny base64 string
          onUpdateAvatar(compressedBase64);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content profile-modal" style={{ maxWidth: '400px', position: 'relative' }}>
        <button onClick={onClose} className="close-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <X size={20} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src={currentUser?.avatar || "/assets/babu_logo_new.jpg"} 
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
            {isEditing ? (
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--primary-light)', fontWeight: '500', outline: 'none', color: 'var(--text-primary)' }}
              />
            ) : (
              <div style={{ padding: '0.6rem 1rem', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', fontWeight: 'bold', color: '#0369a1', fontSize: '1.05rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}>
                {currentUser?.name || 'N/A'}
              </div>
            )}
          </div>

          <div className="profile-field">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <Phone size={16} /> Mobile Number
            </label>
            {isEditing ? (
              <input 
                type="tel" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--primary-light)', fontWeight: '500', outline: 'none', color: 'var(--text-primary)' }}
              />
            ) : (
              <div style={{ padding: '0.6rem 1rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', fontWeight: 'bold', color: '#b91c1c', fontSize: '1.05rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)', letterSpacing: '0.5px' }}>
                {currentUser?.mobile}
              </div>
            )}
          </div>

          {currentUser?.role !== 'admin' && (
            <>
              <div className="profile-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} /> Current Location
                  </label>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((position) => {
                            const { latitude, longitude } = position.coords;
                            setLocation(`${latitude}, ${longitude}`);
                          }, (error) => {
                            alert("Location access denied or failed.");
                          });
                        } else {
                          alert("Geolocation is not supported by this browser.");
                        }
                      }}
                      style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
                    >
                      📍 Get GPS
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="E.g. 23.5, 76.9 or Address"
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

          {currentUser?.role !== 'admin' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem', padding: '1rem', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your QR Identity Card</p>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentUser?.mobile}`} 
                alt="QR Code" 
                style={{ width: '120px', height: '120px', borderRadius: '8px' }}
              />
            </div>
          )}

          {currentUser?.role !== 'admin' && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Users size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Family Khata Sync</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>Add family members to share this account. They can login with your Mobile & Password on their phones.</p>
              
              {familyMembers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {familyMembers.map((member, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>{member}</span>
                      <button 
                        onClick={() => {
                          const updated = familyMembers.filter((_, i) => i !== idx);
                          onUpdateFamily(updated);
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0', display: 'flex' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  value={newFamilyMember}
                  onChange={(e) => setNewFamilyMember(e.target.value)}
                  placeholder="E.g. Sunita (Wife)"
                  style={{ flex: 1, padding: '0.6rem 0.8rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.9rem' }}
                />
                <button 
                  onClick={() => {
                    if (newFamilyMember.trim() && !familyMembers.includes(newFamilyMember.trim())) {
                      onUpdateFamily([...familyMembers, newFamilyMember.trim()]);
                      setNewFamilyMember('');
                    }
                  }}
                  style={{ padding: '0.6rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <button 
                onClick={() => {
                  const text = `Join my Babu Dairy Family Khata!\n\n📱 Mobile: ${currentUser.mobile}\n🔑 Password: ${userPassword}\n\nDownload the app to order milk together!\n🔗 App Link: https://freshmilk-biaora.vercel.app`;
                  window.open(`whatsapp://send?text=${encodeURIComponent(text)}`);
                }}
                style={{ width: '100%', padding: '0.8rem', background: '#25d366', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)' }}
              >
                <Share2 size={18} /> Share Login via WhatsApp
              </button>
            </div>
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
