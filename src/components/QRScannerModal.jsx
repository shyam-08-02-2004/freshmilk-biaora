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
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
            <Camera size={20} color="var(--primary)" /> Scan Customer QR
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scanner Area */}
        <div style={{ padding: '1rem', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          {error ? (
            <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>{error}</div>
          ) : (
            <div id="reader" style={{ width: '100%', height: '100%' }}></div>
          )}
        </div>

        <div style={{ padding: '1rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
          Point your camera at the customer's QR code.
        </div>

      </div>

    </div>
  );
};

export default QRScannerModal;
