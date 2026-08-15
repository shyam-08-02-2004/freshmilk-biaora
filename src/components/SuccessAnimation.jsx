import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

const SuccessAnimation = ({ message, onClose }) => {
  useEffect(() => {
    // Fire confetti when component mounts
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();

    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleUp {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes drawCheck {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
        `}
      </style>
      
      <div style={{
        width: '120px',
        height: '120px',
        background: '#22c55e',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px rgba(34, 197, 94, 0.5)',
        animation: 'scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
      }}>
        <svg 
          viewBox="0 0 24 24" 
          width="80" 
          height="80" 
          stroke="white" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path 
            d="M20 6L9 17l-5-5" 
            style={{
              strokeDasharray: 100,
              strokeDashoffset: 100,
              animation: 'drawCheck 0.5s ease-out 0.3s forwards'
            }}
          />
        </svg>
      </div>
      
      <h2 style={{
        color: 'white',
        fontSize: '1.8rem',
        margin: 0,
        textAlign: 'center',
        padding: '0 2rem',
        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        animation: 'scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s forwards',
        opacity: 0,
        transform: 'scale(0)'
      }}>
        {message}
      </h2>
    </div>
  );
};

export default SuccessAnimation;
