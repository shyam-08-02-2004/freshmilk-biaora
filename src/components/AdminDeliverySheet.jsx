import React, { useState } from 'react';
import { format } from 'date-fns';
import { Printer, MapPin, Download, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminDeliverySheet = ({ registeredUsers, globalOrders, prices }) => {
  const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expandedItems, setExpandedItems] = useState({});

  const deliveries = registeredUsers.map(user => {
    const todayOrder = globalOrders[user.mobile]?.[targetDate];
    return {
      user,
      order: todayOrder
    };
  }).filter(d => d.order && (d.order.milk > 0 || d.order.ghee > 0 || d.order.chach > 0 || d.order.paneer > 0 || d.order.curd > 0) && d.order.status === 'approved');

  const handlePrint = () => {
    window.print();
  };

  const calculateTotal = (order) => {
    let total = 0;
    if (order.milk && prices?.milk) total += order.milk * prices.milk;
    if (order.ghee && prices?.ghee) total += order.ghee * prices.ghee;
    if (order.chach && prices?.chach) total += order.chach * prices.chach;
    if (order.paneer && prices?.paneer) total += order.paneer * prices.paneer;
    if (order.curd && prices?.curd) total += order.curd * prices.curd;
    return total;
  };

  const toggleExpand = (mobile) => {
    setExpandedItems(prev => ({...prev, [mobile]: !prev[mobile]}));
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Delivery Sheet - ${targetDate}`, 14, 20);

      const tableColumn = ["Customer Name", "Location / Flat", "Milk (L)", "Ghee (Kg)", "Chach (L)", "Extras", "Status"];
      const tableRows = [];

      deliveries.forEach(d => {
        let extras = [];
        if (d.order.paneer > 0) extras.push(`Paneer: ${d.order.paneer}kg`);
        if (d.order.curd > 0) extras.push(`Curd: ${d.order.curd}kg`);
        const extrasText = extras.length > 0 ? extras.join('\n') : '-';

        const rowData = [
          d.user.name,
          `${d.user.flat}, ${d.user.location}`,
          d.order.milk || 0,
          d.order.ghee || 0,
          d.order.chach || 0,
          extrasText,
          ''
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235] },
        columnStyles: {
          6: { cellWidth: 20 }
        }
      });

      doc.save(`Delivery_Sheet_${targetDate}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <div className="delivery-container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Delivery Sheet</h3>
        <div className="header-actions" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="date" 
            value={targetDate} 
            onChange={(e) => setTargetDate(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
          />
          <button 
            onClick={handleDownloadPDF}
            style={{ padding: '0.6rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <Download size={18} /> Download PDF
          </button>
          <button 
            onClick={handlePrint}
            style={{ padding: '0.6rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            <Printer size={18} /> Print Sheet
          </button>
        </div>
      </div>

      <style>
        {`
          .accordion-details {
            display: none;
          }
          .accordion-details.expanded {
            display: grid;
          }
          
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-delivery-sheet, #printable-delivery-sheet * {
              visibility: visible;
            }
            #printable-delivery-sheet {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0 !important;
              border: none !important;
            }
            .accordion-details {
              display: grid !important;
              border-top: 1px dashed #ccc !important;
              padding: 1rem 0 !important;
            }
            .accordion-card {
              border: none !important;
              border-bottom: 2px solid #000 !important;
              border-radius: 0 !important;
              margin-bottom: 1rem !important;
              page-break-inside: avoid;
            }
            .chevron-icon {
              display: none !important;
            }
          }
          
          @media (max-width: 768px) {
            .delivery-container {
              padding: 1rem !important;
            }
            .delivery-card {
              padding: 1rem !important;
            }
            .header-actions {
              width: 100%;
            }
            .header-actions input {
              width: 100%;
            }
            .header-actions button {
              flex: 1;
              justify-content: center;
              padding: 0.8rem !important;
            }
          }
        `}
      </style>

      <div id="printable-delivery-sheet" className="delivery-card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem', color: 'var(--text-primary)' }}>
          Delivery Route - {format(new Date(targetDate), 'dd MMM yyyy')}
        </h2>
        
        {deliveries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No deliveries scheduled for this date.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {deliveries.map((d, i) => {
              const isExpanded = expandedItems[d.user.mobile];
              const totalAmount = calculateTotal(d.order);
              
              return (
                <div key={i} className="accordion-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  {/* Header - Always visible */}
                  <div 
                    onClick={() => toggleExpand(d.user.mobile)}
                    style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? '#f8fafc' : 'transparent', transition: 'background 0.2s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>
                          {i + 1}
                       </div>
                       <div>
                         <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{d.user.name}</h4>
                         <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.user.mobile}</div>
                       </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                       <div style={{ textAlign: 'right' }}>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total</span>
                         <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>₹{totalAmount}</div>
                       </div>
                       <div className="chevron-icon" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: 'var(--text-secondary)' }}>
                          <ChevronDown size={20} />
                       </div>
                    </div>
                  </div>

                  {/* Details - Collapsible */}
                  <div 
                    className={`accordion-details ${isExpanded ? 'expanded' : ''}`}
                    style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', background: 'var(--background)' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>LOCATION / FLAT</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                        <MapPin size={16} color="var(--primary)" /> {d.user.flat}, {d.user.location}
                      </div>
                    </div>
                    
                    {d.order.milk > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>MILK</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>{d.order.milk} L</span>
                      </div>
                    )}
                    
                    {d.order.ghee > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>GHEE</span>
                        <span style={{ fontWeight: 'bold', color: '#d97706', fontSize: '1.1rem' }}>{d.order.ghee} Kg</span>
                      </div>
                    )}
                    
                    {d.order.chach > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>CHACH</span>
                        <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>{d.order.chach} L</span>
                      </div>
                    )}
                    
                    {(d.order.paneer > 0 || d.order.curd > 0) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>EXTRAS</span>
                        <div style={{ fontWeight: 'bold', color: '#047857', fontSize: '1rem' }}>
                          {d.order.paneer > 0 && <div>Paneer: {d.order.paneer}kg</div>}
                          {d.order.curd > 0 && <div>Curd: {d.order.curd}kg</div>}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>STATUS</span>
                      <div style={{ width: '28px', height: '28px', border: '2px solid var(--text-secondary)', borderRadius: '6px' }}></div>
                    </div>
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

export default AdminDeliverySheet;
