import React, { useMemo, useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, FileText, Wallet, Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerPassbook = ({ isOpen, onClose, userName, userMobile, globalOrders, globalPayments, prices }) => {
  const [filterMonth, setFilterMonth] = useState('');

  const { fullTransactions, filteredTransactions, openingBalance } = useMemo(() => {
    if (!userMobile || !globalOrders || !globalPayments) return { fullTransactions: [], filteredTransactions: [], openingBalance: 0 };

    const userOrders = globalOrders[userMobile] || {};
    const userPayments = globalPayments[userMobile] || [];
    const items = [];

    // Process Orders
    Object.entries(userOrders).forEach(([dateStr, order]) => {
      if (order.status !== 'delivered') return;
      
      let dailyTotal = 0;
      const details = [];
      if (order.milk) { dailyTotal += order.milk * prices.milk; details.push(`${order.milk}L Milk`); }
      if (order.ghee) { dailyTotal += order.ghee * prices.ghee; details.push(`${order.ghee}Kg Ghee`); }
      if (order.chach) { dailyTotal += order.chach * prices.chach; details.push(`${order.chach}L Chach`); }
      if (order.paneer) { dailyTotal += order.paneer * prices.paneer; details.push(`${order.paneer}Kg Paneer`); }
      if (order.curd) { dailyTotal += order.curd * prices.curd; details.push(`${order.curd} Curd`); }

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

    // Reverse filtered so newest is at the top
    return { fullTransactions: computedItems.reverse(), filteredTransactions: filtered.reverse(), openingBalance: openBal };
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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'white', width: '100%', maxWidth: '600px', height: '90vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={24} color="var(--primary)" />
                Passbook (Khata)
              </h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{userName} ({userMobile})</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
              <X size={24} color="var(--text-secondary)" />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
            />
            <button 
              onClick={handleDownloadPDF}
              style={{ width: '100%', background: '#f3e8ff', color: '#9333ea', border: '1px solid #d8b4fe', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}
            >
              <Download size={18} /> Download PDF
            </button>
            {filterMonth && (
              <button 
                onClick={() => setFilterMonth('')} 
                style={{ width: '100%', padding: '0.6rem 1rem', background: '#f1f5f9', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
          <div style={{ background: currentDue <= 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #b91c1c)', padding: '1.2rem', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '0.2rem' }}>
                {currentDue <= 0 ? 'Extra Paid / Balance' : 'Total Due Amount'}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                ₹{Math.abs(currentDue).toFixed(2)}
              </div>
            </div>
            <Wallet size={48} opacity={0.2} />
          </div>
        </div>

        {/* Ledger List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          {filterMonth && (
            <div style={{ padding: '1rem 1.5rem', background: '#fffbeb', borderBottom: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#b45309' }}>Opening Balance (Pichla Baki):</span>
              <strong style={{ fontSize: '1.1rem', color: openingBalance > 0 ? '#ef4444' : '#10b981' }}>
                {openingBalance > 0 ? `₹${openingBalance} Due` : `₹${Math.abs(openingBalance)} Extra Paid`}
              </strong>
            </div>
          )}

          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <FileText size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
              <p>No transactions found for this period.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredTransactions.map((t, index) => {
                const isOrder = t.type === 'order';
                return (
                  <div key={t.id} style={{ display: 'flex', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                    
                    {/* Icon & Date */}
                    <div style={{ marginRight: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isOrder ? '#fee2e2' : '#dcfce7', color: isOrder ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.3rem' }}>
                        {isOrder ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {isOrder ? 'Bill (Debit)' : 'Payment (Credit)'}
                        </strong>
                        <strong style={{ fontSize: '1rem', color: isOrder ? '#ef4444' : '#10b981' }}>
                          {isOrder ? '-' : '+'}₹{t.amount}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        {format(t.date, 'dd MMM yyyy')} • {t.description}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'flex-end', borderTop: '1px dashed var(--border)', paddingTop: '0.4rem' }}>
                        Balance: <strong style={{ color: t.balance > 0 ? '#ef4444' : '#10b981', marginLeft: '0.3rem' }}>
                           {t.balance > 0 ? `₹${t.balance} Due` : `₹${Math.abs(t.balance)} Extra Paid`}
                        </strong>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerPassbook;
