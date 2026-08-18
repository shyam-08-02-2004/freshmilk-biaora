import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode;

    const startScanning = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText, decodedResult) => {
            if (html5QrCode) {
              html5QrCode.stop().then(() => {
                html5QrCode.clear();
                // Haptic feedback (if supported)
                if (navigator.vibrate) {
                  navigator.vibrate([200, 100, 200]);
                }
                onScanSuccess(decodedText);
              }).catch(err => console.error("Failed to stop scanner", err));
            }
          },
          (errorMessage) => {
            // Ignore ongoing scan errors (like 'no qr code found')
          }
        );
      } catch (err) {
        console.error("Error starting scanner", err);
        setError("Failed to start camera. Please ensure permissions are granted.");
      }
    };

    startScanning();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
        }).catch(err => console.error("Failed to stop scanner on cleanup", err));
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      
      <div style={{ background: '#1e293b', width: '100%', maxWidth: '400px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: 'white' }}>
            <Camera size={20} color="#10b981" /> Scan Customer QR
          </h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scanner Area */}
        <div style={{ padding: '2rem', background: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
          {error ? (
            <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>{error}</div>
          ) : (
            <div className="scanner-container-scifi" style={{ width: '100%', aspectRatio: '1', position: 'relative' }}>
               <div className="scanner-laser"></div>
               <div id="reader" style={{ width: '100%', height: '100%', background: 'black' }}></div>
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', background: '#1e293b' }}>
          Point your camera at the customer's QR code.
        </div>

      </div>

    </div>
  );
};

export default QRScannerModal;
