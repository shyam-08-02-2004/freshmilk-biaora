import React, { useState } from 'react';
import { X, Receipt, CheckCircle, Clock, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useLanguage } from '../LanguageContext';

const HistoryModal = ({ orders, payments = [], pendingPayment, onClose, prices, selectedDate, currentUser }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'payments'
  const [expandedDate, setExpandedDate] = useState(null);
  const [viewMonth, setViewMonth] = useState(selectedDate || new Date());

  // Filter by the month the user is currently viewing
  const currentMonthStr = format(viewMonth, 'yyyy-MM');
  const currentMonthLabel = format(viewMonth, 'MMMM yyyy');

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
            <h2 style={{ margin: 0 }}>{t('history')}</h2>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '0.3rem 0 0', color: 'var(--primary)', cursor: 'pointer', background: '#e6f4ea', padding: '0.3rem 0.6rem', borderRadius: '8px', width: 'fit-content' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{currentMonthLabel} ▾</span>
              <input 
                type="month" 
                value={currentMonthStr}
                onChange={(e) => {
                  if (e.target.value) {
                    setViewMonth(parseISO(e.target.value + '-01'));
                  }
                }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={() => {
                const doc = new jsPDF();
                
                // Add Logo/Header
                doc.setFontSize(22);
                doc.setTextColor(30, 58, 138); // Dark blue primary color
                doc.text('FreshMilk Biaora', 14, 20);
                
                doc.setFontSize(14);
                doc.setTextColor(100, 116, 139);
                doc.text('Monthly Invoice', 14, 28);
                
                // Invoice Details (Right Side)
                doc.setFontSize(10);
                doc.setTextColor(15, 23, 42);
                doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 140, 20);
                doc.text(`Billing Month: ${currentMonthLabel}`, 140, 26);
                
                // Customer Details Box
                doc.setFillColor(248, 250, 252);
                doc.rect(14, 35, 182, 30, 'F');
                
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text('Customer Details', 20, 42);
                doc.setFont("helvetica", "normal");
                doc.text(`Name: ${currentUser?.name || 'Customer'}`, 20, 48);
                doc.text(`Mobile: ${currentUser?.mobile || ''}`, 20, 54);
                doc.text(`Location: ${currentUser?.flat || ''}, ${currentUser?.location || ''}`, 20, 60);

                // Calculations
                const tableData = [];
                let totalBill = 0;
                let totalMilk = 0;
                let totalGhee = 0;
                let totalChach = 0;
                let totalPaneer = 0;
                let totalCurd = 0;

                // Sort dates chronologically for the bill
                const chronologicalDates = [...sortedDates].reverse();

                chronologicalDates.forEach(dateStr => {
                  const order = orders[dateStr];
                  if (order.status === 'approved') {
                    const dayTotal = (order.milk || 0) * prices.milk + (order.ghee || 0) * prices.ghee + (order.chach || 0) * prices.chach + (order.paneer || 0) * prices.paneer + (order.curd || 0) * prices.curd;
                    totalBill += dayTotal;
                    totalMilk += (order.milk || 0);
                    totalGhee += (order.ghee || 0);
                    totalChach += (order.chach || 0);
                    totalPaneer += (order.paneer || 0);
                    totalCurd += (order.curd || 0);
                    tableData.push([
                      format(parseISO(dateStr), 'dd MMM yyyy'),
                      order.milk || '-',
                      order.ghee || '-',
                      order.chach || '-',
                      order.paneer || '-',
                      order.curd || '-',
                      `Rs. ${dayTotal}`
                    ]);
                  }
                });
                
                const totalPaid = monthlyPayments.reduce((acc, pay) => acc + Number(pay.amount || 0), 0);
                const remainingDue = Math.max(0, totalBill - totalPaid);
                
                // Draw Table
                doc.autoTable({
                  startY: 75,
                  head: [['Date', 'Milk (L)', 'Ghee (Kg)', 'Chach (L)', 'Paneer (Kg)', 'Curd (Kg)', 'Total']],
                  body: tableData,
                  foot: [['Total', `${totalMilk}`, `${totalGhee}`, `${totalChach}`, `${totalPaneer}`, `${totalCurd}`, `Rs. ${totalBill}`]],
                  theme: 'striped',
                  headStyles: { fillColor: [16, 185, 129] },
                  footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
                  styles: { fontSize: 9 }
                });
                
                const finalY = doc.lastAutoTable.finalY || 100;
                
                // Payment Summary Box
                doc.setDrawColor(226, 232, 240);
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(120, finalY + 10, 75, 35, 3, 3, 'FD');
                
                doc.setFontSize(10);
                doc.text('Total Amount:', 125, finalY + 20);
                doc.text(`Rs. ${totalBill}`, 185, finalY + 20, { align: 'right' });
                
                doc.text('Amount Paid:', 125, finalY + 28);
                doc.text(`Rs. ${totalPaid}`, 185, finalY + 28, { align: 'right' });
                
                doc.setFont("helvetica", "bold");
                doc.setTextColor(220, 38, 38); // Red
                doc.text('Remaining Due:', 125, finalY + 38);
                doc.text(`Rs. ${remainingDue}`, 185, finalY + 38, { align: 'right' });
                
                // Footer
                doc.setFont("helvetica", "normal");
                doc.setTextColor(148, 163, 184);
                doc.setFontSize(9);
                doc.text('Thank you for choosing FreshMilk Biaora!', 105, 280, { align: 'center' });
                
                doc.save(`FreshMilk_Bill_${currentMonthStr}.pdf`);
              }}
              style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}
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
                      {order.milk > 0 && <div className="history-product" style={{ background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>🥛 {t('milk')}: {order.milk}L</div>}
                      {order.ghee > 0 && <div className="history-product" style={{ background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>🧈 {t('ghee')}: {order.ghee}Kg</div>}
                      {order.chach > 0 && <div className="history-product" style={{ background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>🥤 {t('chach')}: {order.chach}L</div>}
                      {order.paneer > 0 && <div className="history-product" style={{ background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)', color: '#047857' }}>🧀 {t('paneer')}: {order.paneer}Kg</div>}
                      {order.curd > 0 && <div className="history-product" style={{ background: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)', color: '#047857' }}>🥣 {t('curd')}: {order.curd}Kg</div>}
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
