import React, { useState } from 'react';
import { Send, Trash2, Megaphone } from 'lucide-react';
import { format } from 'date-fns';

const AdminBroadcasts = ({ broadcasts, setBroadcasts }) => {
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('24'); // hours

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(duration, 10));

    const newBroadcast = {
      id: Date.now().toString(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    setBroadcasts(prev => [newBroadcast, ...(prev || [])]);
    setMessage('');
  };

  const handleDelete = (id) => {
    setBroadcasts(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Megaphone size={24} color="var(--primary)" />
        Broadcast Messages
      </h3>

      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Send a message that will appear at the top of every customer's app. Useful for announcements like delays, new products, or holiday greetings.
        </p>
        
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your broadcast message here..."
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', minHeight: '100px', resize: 'vertical' }}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Keep active for:</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
              >
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
                <option value="48">2 Days</option>
                <option value="168">1 Week</option>
              </select>
            </div>
            <button 
              type="submit"
              disabled={!message.trim()}
              style={{ padding: '0.6rem 1.5rem', background: message.trim() ? 'var(--primary)' : 'var(--border)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: message.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
            >
              <Send size={18} /> Send Broadcast
            </button>
          </div>
        </form>
      </div>

      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Recent Broadcasts</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(!broadcasts || broadcasts.length === 0) ? (
          <p style={{ color: 'var(--text-secondary)' }}>No broadcasts sent yet.</p>
        ) : (
          broadcasts.map(b => {
            const isActive = new Date(b.expiresAt) > new Date();
            return (
              <div key={b.id} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '8px', border: `1px solid ${isActive ? 'var(--primary-light)' : 'var(--border)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', opacity: isActive ? 1 : 0.6 }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontWeight: '500' }}>{b.message}</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Sent: {format(new Date(b.createdAt), 'dd MMM, hh:mm a')}</span>
                    <span style={{ color: isActive ? '#10b981' : '#ef4444' }}>
                      {isActive ? `Active until ${format(new Date(b.expiresAt), 'dd MMM, hh:mm a')}` : 'Expired'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(b.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem' }}
                  title="Delete Broadcast"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminBroadcasts;
