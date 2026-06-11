import React from 'react';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const HistoryModal = ({ orders, onClose, prices }) => {
  // Sort dates descending
  const sortedDates = Object.keys(orders).sort((a, b) => b.localeCompare(a));

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Order History</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {sortedDates.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            No orders placed yet.
          </p>
        ) : (
          <div className="history-list">
            {sortedDates.map(dateStr => {
              const order = orders[dateStr];
              const dayTotal = (order.milk || 0) * prices.milk + (order.ghee || 0) * prices.ghee + (order.chach || 0) * prices.chach;
              
              return (
                <div key={dateStr} className="history-item">
                  <div className="history-date">
                    {format(parseISO(dateStr), 'EEEE, d MMMM yyyy')} 
                    <span style={{ float: 'right', color: 'var(--primary)' }}>₹{dayTotal}</span>
                  </div>
                  <div className="history-details">
                    {order.milk > 0 && <div className="history-product">🥛 Milk: {order.milk}L</div>}
                    {order.ghee > 0 && <div className="history-product">🧈 Ghee: {order.ghee}Kg</div>}
                    {order.chach > 0 && <div className="history-product">🥤 Chach: {order.chach}L</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
