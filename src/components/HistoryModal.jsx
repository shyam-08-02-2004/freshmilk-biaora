import React, { useState } from 'react';
import { X, Receipt, CheckCircle, Clock, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HistoryModal = ({ orders, payments = [], pendingPayment, onClose, prices, selectedDate }) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'payments'
  const [expandedDate, setExpandedDate] = useState(null);

  // Filter by the month the user is currently viewing
  const currentMonthStr = format(selectedDate || new Date(), 'yyyy-MM');
  const currentMonthLabel = format(selectedDate || new Date(), 'MMMM yyyy');

  const sortedDates = Object.keys(orders || {})
    .filter(d => d.startsWith(currentMonthStr))
    .sort((a, b) => b.localeCompare(a));

  const monthlyPayments = [...payments]
    .filter(p => {
      if (!p.timestamp) return false;
      const pMonth = p.paymentMonth || p.timestamp.substring(0, 7);
      return pMonth === currentMonthStr;
    })
    .reverse();

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-content">
        <div className="modal-header" style={{ paddingBottom: '0.5rem', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0 }}>My History</h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>{currentMonthLabel}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={() => {
                const doc = new jsPDF();
                doc.setFontSize(18);
                doc.text('FreshMilk Biaora - Monthly Bill', 14, 22);
                doc.setFontSize(11);
                doc.text(`Month: ${currentMonthLabel}`, 14, 30);
                
                const tableData = [];
                let totalBill = 0;

                sortedDates.forEach(dateStr => {
                  const order = orders[dateStr];
                  if (order.status === 'approved') {
                    const dayTotal = (order.milk || 0) * prices.milk + (order.ghee || 0) * prices.ghee + (order.chach || 0) * prices.chach;
                    totalBill += dayTotal;
                    tableData.push([
                      format(new Date(dateStr), 'dd MMM yyyy'),
                      order.milk || 0,
                      order.ghee || 0,
                      order.chach || 0,
                      `Rs. ${dayTotal}`
                    ]);
                  }
                });

                doc.autoTable({
                  startY: 40,
                  head: [['Date', 'Milk (L)', 'Ghee (Kg)', 'Chach (L)', 'Daily Total']],
                  body: tableData,
                  foot: [['', '', '', 'Total Bill:', `Rs. ${totalBill}`]],
                  theme: 'striped',
                  headStyles: { fillColor: [16, 185, 129] },
                  footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
                });

                doc.save(`Milk_Bill_${currentMonthStr}.pdf`);
              }}
              style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <Download size={16} /> Bill
            </button>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', padding: '0 1.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('orders')}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'orders' ? 'var(--primary)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Receipt size={16} /> Orders
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'payments' ? 'var(--primary)' : 'transparent', color: activeTab === 'payments' ? 'white' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            ₹ Payments
          </button>
        </div>

        {activeTab === 'orders' ? (
          sortedDates.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            No orders in {currentMonthLabel}.
          </p>
        ) : (
          <div className="history-list">
            {sortedDates.map(dateStr => {
              const order = orders[dateStr];
              const dayTotal = (order.milk || 0) * prices.milk + (order.ghee || 0) * prices.ghee + (order.chach || 0) * prices.chach;
              
              return (
                <div key={dateStr} className="history-item" style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div 
                    className="history-date" 
                    onClick={() => setExpandedDate(expandedDate === dateStr ? null : dateStr)}
                    style={{ cursor: 'pointer', padding: '1rem', background: expandedDate === dateStr ? 'var(--background)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}
                  >
                    <span>{format(parseISO(dateStr), 'EEEE, d MMMM yyyy')}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ color: 'var(--primary)' }}>₹{dayTotal}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {expandedDate === dateStr ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                  {expandedDate === dateStr && (
                    <div className="history-details" style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {order.milk > 0 && <div className="history-product" style={{ background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>🥛 Milk: {order.milk}L</div>}
                      {order.ghee > 0 && <div className="history-product" style={{ background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>🧈 Ghee: {order.ghee}Kg</div>}
                      {order.chach > 0 && <div className="history-product" style={{ background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>🥤 Chach: {order.chach}L</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )) : (
          <div className="history-list">
            {monthlyPayments.length === 0 && !pendingPayment ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No payments found in {currentMonthLabel}.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                {pendingPayment && (
                  <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #d97706', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#b45309' }}>₹{pendingPayment.amount}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#d97706', background: '#fde68a', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}><Clock size={12} /> Pending</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#92400e', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span><strong>UTR:</strong> {pendingPayment.utr}</span>
                      <span><strong>For Month:</strong> {pendingPayment.paymentMonth ? format(new Date(pendingPayment.paymentMonth + '-01'), 'MMMM yyyy') : 'N/A'}</span>
                      <span>{format(new Date(pendingPayment.timestamp), 'dd MMM yyyy, hh:mm a')}</span>
                    </div>
                  </div>
                )}
                {monthlyPayments.map((pay, i) => (
                  <div key={i} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>₹{pay.amount}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}><CheckCircle size={12} /> Paid</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span><strong>UTR:</strong> {pay.utr}</span>
                      <span><strong>For Month:</strong> {pay.paymentMonth ? format(new Date(pay.paymentMonth + '-01'), 'MMMM yyyy') : 'N/A'}</span>
                      <span>{format(new Date(pay.timestamp), 'dd MMM yyyy, hh:mm a')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
