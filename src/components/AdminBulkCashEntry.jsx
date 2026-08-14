import React, { useState } from 'react';
import { X, Plus, Save, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';

const AdminBulkCashEntry = ({ registeredUsers, onSubmit, onClose }) => {
  const [entries, setEntries] = useState([{ id: Date.now(), mobile: '', amount: '', date: format(new Date(), 'yyyy-MM-dd') }]);

  const handleAddRow = () => {
    setEntries([...entries, { id: Date.now(), mobile: '', amount: '', date: format(new Date(), 'yyyy-MM-dd') }]);
  };

  const handleRemoveRow = (id) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const handleEntryChange = (id, field, value) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSave = () => {
    const validEntries = entries.filter(e => e.mobile && e.amount && !isNaN(e.amount) && parseFloat(e.amount) > 0);
    if (validEntries.length === 0) {
      alert("Please fill at least one valid entry.");
      return;
    }
    
    onSubmit(validEntries);
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <style>
        {`
          .cash-entry-row {
            display: grid;
            grid-template-columns: auto 2fr 1.5fr auto;
            gap: 0.8rem;
            align-items: center;
            background: var(--surface);
            padding: 1rem;
            border-radius: 12px;
            border: 1px solid var(--border);
          }
          @media (max-width: 600px) {
            .cash-entry-row {
              grid-template-columns: auto 1fr auto;
              grid-template-areas: 
                "num select select"
                ". amount delete";
              gap: 0.6rem;
            }
            .ce-num { grid-area: num; }
            .ce-select { grid-area: select; }
            .ce-amount { grid-area: amount; }
            .ce-delete { grid-area: delete; }
          }
        `}
      </style>
      <div className="modal-content" style={{ background: 'var(--background)', width: '100%', maxWidth: '600px', borderRadius: '20px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', borderRadius: '20px 20px 0 0' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.3rem' }}>Fast Cash Entry</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Add multiple cash payments quickly</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--background)', border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {entries.map((entry, index) => (
            <div key={entry.id} className="cash-entry-row">
              <div className="ce-num" style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 }}>
                {index + 1}
              </div>
              
              <div className="ce-select" style={{ width: '100%' }}>
                <select 
                  value={entry.mobile}
                  onChange={(e) => handleEntryChange(entry.id, 'mobile', e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                >
                  <option value="">Select Customer...</option>
                  {registeredUsers.map(user => (
                    <option key={user.mobile} value={user.mobile}>
                      {user.name} ({user.mobile.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="ce-amount" style={{ width: '100%', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>₹</span>
                <input 
                  type="number" 
                  placeholder="Amount"
                  value={entry.amount}
                  onChange={(e) => handleEntryChange(entry.id, 'amount', e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 1.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                />
              </div>

              <button 
                className="ce-delete"
                onClick={() => handleRemoveRow(entry.id)}
                disabled={entries.length === 1}
                style={{ background: 'none', border: 'none', color: entries.length === 1 ? 'var(--border)' : '#ef4444', cursor: entries.length === 1 ? 'not-allowed' : 'pointer', padding: '0.5rem', justifySelf: 'center' }}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          <button 
            onClick={handleAddRow}
            style={{ width: '100%', padding: '1rem', border: '2px dashed var(--primary-light)', background: 'transparent', color: 'var(--primary)', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            <Plus size={20} /> Add Another Payment
          </button>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '0 0 20px 20px', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Amount</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>
              ₹{entries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)}
            </span>
          </div>
          <button 
            onClick={handleSave}
            style={{ flex: 1.5, background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', border: 'none', borderRadius: '12px', padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
          >
            <Save size={20} /> Save All Entries
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBulkCashEntry;
