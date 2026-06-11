import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const QuantityDrawer = ({ isOpen, onClose, selectedDate, currentQuantity, onSave, onRemove, pricePerLiter }) => {
  const [selectedQty, setSelectedQty] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedQty(currentQuantity || 1); // Default to 1L if opening fresh
    }
  }, [isOpen, currentQuantity]);

  if (!selectedDate) return null;

  const quantities = [0.5, 1, 1.5, 2, 2.5, 3];

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => {
      if (e.target.classList.contains('modal-overlay')) onClose();
    }}>
      <div className="bottom-drawer">
        <div className="drawer-header">
          <h3 className="drawer-title">
            {format(selectedDate, 'EEEE, d MMMM')}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Select milk quantity for this day. (₹{pricePerLiter}/Liter)
        </p>

        <div className="quantity-options">
          {quantities.map(qty => (
            <button
              key={qty}
              className={`qty-btn ${selectedQty === qty ? 'active' : ''}`}
              onClick={() => setSelectedQty(qty)}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{qty} L</span>
              <span className="qty-price">₹{qty * pricePerLiter}</span>
            </button>
          ))}
        </div>

        <div className="drawer-actions">
          {currentQuantity > 0 && (
            <button className="btn-danger" onClick={() => onRemove(selectedDate)}>
              Remove
            </button>
          )}
          <button className="btn-primary" onClick={() => onSave(selectedDate, selectedQty)}>
            {currentQuantity > 0 ? 'Update Quantity' : 'Confirm Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantityDrawer;
