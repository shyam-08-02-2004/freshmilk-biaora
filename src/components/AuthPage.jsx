import React, { useState } from 'react';
import { Milk, Eye, EyeOff, MapPin, User, Phone, KeyRound, Home } from 'lucide-react';

const AuthPage = ({ onAuthAction }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form States
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register specific states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [flat, setFlat] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  const handleDetectLocation = async () => {
    setIsLocating(true);
    let ipFallbackUsed = false;

    // Fast IP-based detection
    const fetchIpLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.city) {
          setLocation((prev) => prev ? prev : `${data.city}, ${data.region}`);
          ipFallbackUsed = true;
          setCoordinates({ lat: data.latitude, lng: data.longitude });
        }
      } catch (e) {
        console.error("IP Loc error", e);
      }
    };

    fetchIpLocation();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.display_name) {
              const shortAddress = data.address.city || data.address.town || data.address.village || 'Biaora';
              const state = data.address.state || 'Madhya Pradesh';
              setLocation(`${shortAddress}, ${state}`);
            } else if (!ipFallbackUsed) {
              setLocation('Biaora, Madhya Pradesh');
            }
          } catch (error) {
            if (!ipFallbackUsed) setLocation('Biaora, Madhya Pradesh');
          }
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location", error);
          if (!ipFallbackUsed) {
            setLocation('Biaora, Madhya Pradesh');
          }
          setIsLocating(false);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      if (!ipFallbackUsed) setLocation('Biaora, Madhya Pradesh');
      setIsLocating(false);
    }
  };

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (isLogin) {
      if (mobile && password) {
        const result = onAuthAction({ action: 'login', data: { mobile, password } });
        if (!result.success) {
          setErrorMsg(result.error);
        }
      }
    } else {
      if (!name.trim() || !location.trim() || !flat.trim() || !password || !confirmPassword) {
        setErrorMsg("Bhaiya, please saari details (Name, Location, Flat, Password) theek se bhariye.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match!");
        return;
      }
      const result = onAuthAction({ action: 'register', data: { mobile, password, name: name.trim(), location: location.trim(), flat: flat.trim(), coordinates } });
      if (!result.success) {
        setErrorMsg(result.error);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" style={{ background: 'transparent', padding: 0 }}>
            <img src="/assets/babu_logo.png" alt="Babu Dairy Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
          </div>
          <h2>FreshMilk Biaora</h2>
          <p>{isLogin ? 'Welcome back! Please login to your account.' : 'Create an account to get started.'}</p>
        </div>

        <div className="auth-toggle">
          <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
          <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errorMsg && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #fecaca', textAlign: 'center' }}>{errorMsg}</div>}
          {!isLogin && (
            <div className="input-group">
              <label><User size={16} /> Full Name</label>
              <input 
                type="text" 
                placeholder="E.g. Ramesh Kumar" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="input-group">
            <label><Phone size={16} /> Mobile Number</label>
            <input 
              type="tel" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              pattern="[0-9]{10}"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="input-group">
                <label><MapPin size={16} /> Current Location</label>
                <div className="location-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="E.g. Biaora, Madhya Pradesh" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required={!isLogin}
                  />
                  <button type="button" className="btn-detect" onClick={handleDetectLocation} disabled={isLocating}>
                    {isLocating ? 'Locating...' : 'Detect'}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label><Home size={16} /> Flat / House Number</label>
                <input 
                  type="text" 
                  placeholder="E.g. Flat 101, Om Sai Residency" 
                  value={flat}
                  onChange={(e) => setFlat(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label><KeyRound size={16} /> {isLogin ? 'Password' : 'Create Password'}</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label><KeyRound size={16} /> Confirm Password</label>
              <div className="password-wrapper">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                />
                <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
