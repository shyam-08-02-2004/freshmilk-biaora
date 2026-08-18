import React, { useMemo, useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, FileText, Wallet, Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerPassbook = ({ isOpen, onClose, userName, userMobile, globalOrders, globalPayments, prices }) => {
  const [filterMonth, setFilterMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const { fullTransactions, filteredTransactions, openingBalance } = useMemo(() => {
    if (!userMobile || !globalOrders || !globalPayments) return { fullTransactions: [], filteredTransactions: [], openingBalance: 0 };

    const userOrders = globalOrders[userMobile] || {};
    const userPayments = globalPayments[userMobile] || [];
    const items = [];

    // Process Orders
    Object.entries(userOrders).forEach(([dateStr, order]) => {
      if (order.status !== 'delivered') return;
      
      let dailyTotal = order.totalPrice;
      const details = [];
      
      if (order.items && order.items.length > 0) {
        order.items.forEach(i => details.push(`${i.quantity} ${i.name}`));
      } else {
        if (order.milk) details.push(`${order.milk}L Milk`);
        if (order.ghee) details.push(`${order.ghee}Kg Ghee`);
        if (order.chach) details.push(`${order.chach}L Chach`);
        if (order.paneer) details.push(`${order.paneer}Kg Paneer`);
        if (order.curd) details.push(`${order.curd} Curd`);
      }

      if (dailyTotal === undefined) {
        dailyTotal = 0;
        if (order.milk) dailyTotal += order.milk * prices.milk;
        if (order.ghee) dailyTotal += order.ghee * prices.ghee;
        if (order.chach) dailyTotal += order.chach * prices.chach;
        if (order.paneer) dailyTotal += order.paneer * prices.paneer;
        if (order.curd) dailyTotal += order.curd * prices.curd;
      }

      if (dailyTotal > 0) {
        items.push({
          id: `order-${dateStr}`,
          date: new Date(dateStr + 'T00:00:00'),
          dateStr: dateStr,
          type: 'order',
          description: details.join(', '),
          amount: dailyTotal
        });
      }
    });

    // Process Payments
    userPayments.forEach((payment, idx) => {
      if (payment.status !== 'approved') return;
      
      const pDate = new Date(payment.timestamp);
      items.push({
        id: `pay-${idx}-${payment.timestamp}`,
        date: pDate,
        dateStr: format(pDate, 'yyyy-MM-dd'),
        type: 'payment',
        description: `Payment (UTR: ${payment.utr || 'Cash'})`,
        amount: parseFloat(payment.amount)
      });
    });

    // Sort chronologically (oldest to newest)
    items.sort((a, b) => a.date - b.date);

    // Calculate Running Balance (Due Balance)
    let runningDue = 0;
    const computedItems = items.map(item => {
      if (item.type === 'order') {
        runningDue += item.amount;
      } else if (item.type === 'payment') {
        runningDue -= item.amount;
      }
      return { ...item, balance: runningDue };
    });

    // Filter by month
    let filtered = computedItems;
    let openBal = 0;
    
    if (filterMonth) {
      filtered = [];
      for (let item of computedItems) {
        const itemMonth = item.dateStr.substring(0, 7);
        if (itemMonth < filterMonth) {
          openBal = item.balance;
        } else if (itemMonth === filterMonth) {
          filtered.push(item);
        }
      }
    }

    // Reverse filtered so newest is at the top, avoid mutating in place
    return { 
      fullTransactions: [...computedItems].reverse(), 
      filteredTransactions: [...filtered].reverse(), 
      openingBalance: openBal 
    };
  }, [userMobile, globalOrders, globalPayments, prices, filterMonth]);

  if (!isOpen) return null;

  const currentDue = fullTransactions.length > 0 ? fullTransactions[0].balance : 0;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor('#1e40af');
    doc.text("FreshMilk Biaora", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor('#333333');
    doc.text("Passbook Statement", pageWidth / 2, 28, { align: 'center' });
    
    // Customer Info
    doc.setFontSize(11);
    doc.text(`Customer Name: ${userName}`, 14, 40);
    doc.text(`Mobile Number: ${userMobile}`, 14, 46);
    doc.text(`Statement Period: ${filterMonth ? format(new Date(filterMonth + '-01'), 'MMMM yyyy') : 'All Time'}`, 14, 52);
    doc.text(`Generated On: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 14, 58);
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(currentDue > 0 ? '#ef4444' : '#10b981');
    doc.text(`Total Due Balance: Rs. ${currentDue.toFixed(2)}`, pageWidth - 14, 58, { align: 'right' });

    const tableRows = [];
    
    if (filterMonth) {
      tableRows.push([
        "01 " + format(new Date(filterMonth + '-01'), 'MMM yyyy'),
        "Opening Balance (Pichla Baki)",
        "",
        "",
        `Rs. ${openingBalance.toFixed(2)}`
      ]);
    }

    // Transactions ascending for PDF
    const ascendingTransactions = [...filteredTransactions].reverse();
    ascendingTransactions.forEach(t => {
      const isOrder = t.type === 'order';
      tableRows.push([
        format(t.date, 'dd MMM yyyy'),
        isOrder ? 'Bill: ' + t.description : t.description,
        isOrder ? `Rs. ${t.amount}` : '-',
        !isOrder ? `Rs. ${t.amount}` : '-',
        `Rs. ${t.balance.toFixed(2)}`
      ]);
    });

    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Description', 'Bill Amount', 'Paid Amount', 'Balance']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: '#1e40af' },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 30 }
      }
    });

    doc.save(`Passbook_${userName.replace(/\s+/g, '_')}_${filterMonth || 'All'}.pdf`);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
      <div className="modal-content receipt-modal" onClick={e => e.stopPropagation()} style={{ 
        background: '#fff', 
        width: '100%', 
        maxWidth: '450px', 
        maxHeight: '90vh', 
        borderRadius: '12px', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        
        {/* Receipt Header */}
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '2px dashed #cbd5e1', position: 'relative' }}>
          {/* Top Zig-Zag effect via radial gradients (optional, we use dashed border instead for simplicity) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: '800', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <FileText size={20} color="#0f172a" /> INVOICE
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>CUST: {userName}</p>
              <p style={{ margin: '0', fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>MOB: {userMobile}</p>
            </div>
            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} color="#64748b" />
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{ flex: 1, padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', outline: 'none', background: 'white' }}
            />
            <button 
              onClick={handleDownloadPDF}
              style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.85rem' }}
            >
              <Download size={16} /> PDF
            </button>
          </div>
        </div>


        {/* Ledger List (Receipt Body) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#fafafa', fontFamily: 'monospace' }}>
          
          {filterMonth && (
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>OPENING BAL:</span>
              <strong style={{ fontSize: '1rem', color: openingBalance > 0 ? '#ef4444' : '#10b981' }}>
                ₹{Math.max(0, openingBalance).toFixed(2)}
              </strong>
            </div>
          )}

          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
              <p style={{ fontSize: '0.9rem' }}>NO TRANSACTIONS</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTransactions.map((t, index) => {
                const isOrder = t.type === 'order';
                return (
                  <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>{format(t.date, 'dd MMM yy')}</span>
                        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>
                          {isOrder ? 'BILL' : 'PAID'} - {t.description}
                        </span>
                      </div>
                      <strong style={{ fontSize: '0.9rem', color: isOrder ? '#ef4444' : '#10b981', marginLeft: '1rem' }}>
                        {isOrder ? '' : '-'}₹{t.amount.toFixed(2)}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>
                      BAL: ₹{Math.max(0, t.balance).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Receipt Footer */}
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '2px dashed #cbd5e1' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1rem', color: '#64748b', fontFamily: 'monospace', fontWeight: 'bold' }}>TOTAL DUE</span>
              <strong style={{ fontSize: '1.5rem', color: currentDue > 0 ? '#ef4444' : '#10b981', fontFamily: 'monospace' }}>
                ₹{Math.max(0, currentDue).toFixed(2)}
              </strong>
           </div>
           {/* Mock Barcode */}
           <div style={{ height: '30px', width: '100%', background: 'repeating-linear-gradient(90deg, #1e293b, #1e293b 2px, transparent 2px, transparent 4px, #1e293b 4px, #1e293b 5px, transparent 5px, transparent 8px, #1e293b 8px, #1e293b 12px, transparent 12px, transparent 14px)', opacity: 0.8, marginBottom: '0.5rem' }}></div>
           <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace', margin: 0, letterSpacing: '2px' }}>{userMobile.substring(0,4)} {Math.random().toString().slice(2,8)} {userMobile.substring(4)}</p>
        </div>

      </div>
    </div>
  );
};

export default CustomerPassbook;
