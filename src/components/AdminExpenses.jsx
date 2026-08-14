import React, { useState, useMemo } from 'react';
import { IndianRupee, Plus, Trash2, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const AdminExpenses = ({ globalExpenses, setGlobalExpenses, globalPayments }) => {
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;

    const newExpense = {
      id: Date.now().toString(),
      desc: desc.trim(),
      amount: parseFloat(amount),
      date: new Date().toISOString()
    };

    setGlobalExpenses(prev => [newExpense, ...(prev || [])]);
    setDesc('');
    setAmount('');
  };

  const handleDelete = (id) => {
    setGlobalExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Calculate Monthly Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    Object.values(globalPayments).forEach(userPayments => {
      userPayments.forEach(p => {
        if (p.status === 'approved') {
          const pMonth = p.paymentMonth || p.timestamp.substring(0, 7);
          if (pMonth === filterMonth) {
            totalRevenue += parseFloat(p.amount);
          }
        }
      });
    });

    let totalExpenses = 0;
    const monthlyExpensesList = (globalExpenses || []).filter(e => e.date.substring(0, 7) === filterMonth);
    monthlyExpensesList.forEach(e => {
      totalExpenses += parseFloat(e.amount);
    });

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalRevenue - totalExpenses,
      list: monthlyExpensesList.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  }, [globalPayments, globalExpenses, filterMonth]);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={24} color="var(--primary)" />
          Expense & Profit Tracker
        </h3>
        <input 
          type="month" 
          value={filterMonth} 
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monthly Revenue (Collected)</p>
          <h2 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center' }}><IndianRupee size={20} />{metrics.revenue.toLocaleString('en-IN')}</h2>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #ef4444' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monthly Expenses</p>
          <h2 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center' }}><IndianRupee size={20} />{metrics.expenses.toLocaleString('en-IN')}</h2>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: `4px solid ${metrics.profit >= 0 ? 'var(--primary)' : '#ef4444'}` }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Net Profit</p>
          <h2 style={{ margin: 0, color: metrics.profit >= 0 ? 'var(--primary)' : '#ef4444', display: 'flex', alignItems: 'center' }}>
            <IndianRupee size={20} />{metrics.profit.toLocaleString('en-IN')}
          </h2>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Add New Expense</h4>
        <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="E.g. Cow Feed, Petrol, Transport..."
            style={{ flex: '1 1 200px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
            required
          />
          <div style={{ position: 'relative', flex: '1 1 120px' }}>
            <IndianRupee size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
              required
              min="1"
            />
          </div>
          <button 
            type="submit"
            disabled={!desc.trim() || !amount}
            style={{ padding: '0.8rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (!desc.trim() || !amount) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={18} /> Add
          </button>
        </form>
      </div>

      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Expense History ({format(new Date(filterMonth + '-01'), 'MMMM yyyy')})</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {metrics.list.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No expenses recorded this month.</p>
        ) : (
          metrics.list.map(exp => (
            <div key={exp.id} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-primary)', fontWeight: 'bold' }}>{exp.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <CalendarIcon size={12} /> {format(new Date(exp.date), 'dd MMM yyyy')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '1.1rem' }}>-₹{exp.amount}</span>
                <button 
                  onClick={() => handleDelete(exp.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem' }}
                  title="Delete Expense"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminExpenses;
