import React, { useState } from 'react';
import { format } from 'date-fns';
import { Printer, MapPin, CheckCircle, Save, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminDeliverySheet = ({ registeredUsers, globalOrders }) => {
  const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));

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

  const handleDownloadPDF = () => {
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

    doc.autoTable({
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
  };

  return (
    <div className="delivery-container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Delivery Sheet</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
            .table-responsive {
              overflow-x: visible !important;
            }
          }
          @media (max-width: 768px) {
            .delivery-container {
              padding: 1rem !important;
            }
            .delivery-card {
              padding: 1rem !important;
            }
            /* Table to Card Mobile View */
            .responsive-table, .responsive-table thead, .responsive-table tbody, .responsive-table th, .responsive-table td, .responsive-table tr {
              display: block;
            }
            .responsive-table thead tr {
              position: absolute;
              top: -9999px;
              left: -9999px;
            }
            .responsive-table tr {
              border: 1px solid var(--border) !important;
              border-radius: 12px;
              margin-bottom: 1.5rem;
              padding: 0.5rem;
              background: #f8fafc;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .responsive-table td {
              border: none !important;
              border-bottom: 1px dashed var(--border) !important;
              position: relative;
              padding: 0.8rem 1rem 0.8rem 50% !important;
              text-align: right !important;
              display: flex;
              justify-content: flex-end;
              align-items: center;
              min-height: 40px;
            }
            .responsive-table td:last-child {
              border-bottom: 0 !important;
            }
            .responsive-table td::before {
              position: absolute;
              top: 50%;
              left: 1rem;
              width: 45%;
              padding-right: 10px;
              white-space: nowrap;
              text-align: left;
              font-weight: 600;
              color: var(--text-secondary);
              transform: translateY(-50%);
            }
            .responsive-table td:nth-of-type(1)::before { content: "Customer Name"; }
            .responsive-table td:nth-of-type(2)::before { content: "Location / Flat"; }
            .responsive-table td:nth-of-type(3)::before { content: "Milk (L)"; }
            .responsive-table td:nth-of-type(4)::before { content: "Ghee (Kg)"; }
            .responsive-table td:nth-of-type(5)::before { content: "Chach (L)"; }
            .responsive-table td:nth-of-type(6)::before { content: "Extras"; }
            .responsive-table td:nth-of-type(7)::before { content: "Status"; }
            
            .responsive-table {
              min-width: 100% !important;
            }
            .table-responsive {
              overflow-x: hidden !important;
            }
            /* Adjust content to right on mobile */
            .responsive-table td > div {
              justify-content: flex-end;
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
          <div className="table-responsive" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <table className="responsive-table" style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
              <tr style={{ background: 'var(--background)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Customer Name</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Location / Flat</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Milk (L)</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Ghee (Kg)</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Chach (L)</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Extras</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: 'transparent' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    {d.user.name}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} />
                      {d.user.flat}, {d.user.location}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{d.order.milk || 0}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#d97706' }}>{d.order.ghee || 0}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#10b981' }}>{d.order.chach || 0}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#047857', fontSize: '0.8rem' }}>
                    {d.order.paneer > 0 && <div>Paneer: {d.order.paneer}kg</div>}
                    {d.order.curd > 0 && <div>Curd: {d.order.curd}kg</div>}
                    {!d.order.paneer && !d.order.curd && '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '20px', height: '20px', border: '2px solid var(--border)', borderRadius: '4px' }}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDeliverySheet;
