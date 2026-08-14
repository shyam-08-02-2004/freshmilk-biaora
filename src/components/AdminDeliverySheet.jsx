import React, { useState } from 'react';
import { format } from 'date-fns';
import { Printer, MapPin } from 'lucide-react';

const AdminDeliverySheet = ({ registeredUsers, globalOrders }) => {
  const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const deliveries = registeredUsers.map(user => {
    const todayOrder = globalOrders[user.mobile]?.[targetDate];
    return {
      user,
      order: todayOrder
    };
  }).filter(d => d.order && (d.order.milk > 0 || d.order.ghee > 0 || d.order.chach > 0) && d.order.status === 'approved');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '2rem' }}>
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
            onClick={handlePrint}
            style={{ padding: '0.6rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
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
            }
          }
        `}
      </style>

      <div id="printable-delivery-sheet" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem' }}>
          Delivery Route - {format(new Date(targetDate), 'dd MMM yyyy')}
        </h2>
        
        {deliveries.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No deliveries scheduled for this date.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ background: 'var(--background)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Customer Name</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Location / Flat</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Milk (L)</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Ghee (Kg)</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Chach (L)</th>
                <th style={{ padding: '1rem', borderBottom: '2px solid var(--border)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{d.user.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} />
                      {d.user.flat}, {d.user.location}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{d.order.milk || 0}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#d97706' }}>{d.order.ghee || 0}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#10b981' }}>{d.order.chach || 0}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '20px', height: '20px', border: '2px solid var(--border)', borderRadius: '4px' }}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDeliverySheet;
