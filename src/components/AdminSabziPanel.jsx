import React, { useState, useMemo } from 'react';
import { Leaf, CheckCircle2, Package, Plus, ArrowLeft, Edit3, ClipboardList, CheckSquare, Clock, History } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AdminSabziPanel = ({ 
  globalVegetables = [], 
  setGlobalVegetables, 
  globalSabziOrders = {}, 
  setGlobalSabziOrders, 
  registeredUsers = [],
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'stock', 'items', 'history'
  
  // Date logic
  const now = new Date();
  const tomorrowDate = addDays(now, 1);
  const tomorrowStr = format(tomorrowDate, 'yyyy-MM-dd');
  const todayStr = format(now, 'yyyy-MM-dd');

  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  const [newVeg, setNewVeg] = useState({ name: '', price: '', unit: 'kg', emoji: '🥬', inStock: true });
  const [isEditing, setIsEditing] = useState(false);

  // Computed Orders for "orders" tab (pending today/tomorrow)
  const pendingOrders = useMemo(() => {
    const orders = [];
    Object.keys(globalSabziOrders || {}).forEach(mobile => {
      const userDateOrder = globalSabziOrders[mobile]?.[selectedDate];
      if (userDateOrder && userDateOrder.status === 'pending') {
        const user = (registeredUsers || []).find(u => u.mobile === mobile);
        orders.push({ mobile, user, ...userDateOrder, date: selectedDate });
      }
    });
    return orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  }, [globalSabziOrders, selectedDate, registeredUsers]);

  // Computed History for "history" tab (delivered in last 7 days)
  const historyOrders = useMemo(() => {
    const orders = [];
    Object.keys(globalSabziOrders || {}).forEach(mobile => {
      const user = (registeredUsers || []).find(u => u.mobile === mobile);
      for(let i=0; i<7; i++) {
        const dStr = format(subDays(now, i), 'yyyy-MM-dd');
        const order = globalSabziOrders[mobile]?.[dStr];
        if (order && order.status === 'delivered') {
          orders.push({ mobile, user, ...order, date: dStr });
        }
      }
    });
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [globalSabziOrders, registeredUsers]);

  const handleMarkDelivered = async (mobile, order, date) => {
    const updatedUserOrders = {
      ...globalSabziOrders[mobile],
      [date]: { ...order, status: 'delivered' }
    };
    const newGlobalOrders = {
      ...globalSabziOrders,
      [mobile]: updatedUserOrders
    };
    setGlobalSabziOrders(newGlobalOrders);
    await setDoc(doc(db, "store", "globalSabziOrders"), { data: newGlobalOrders });
  };

  const handleUpdateInventory = async (id, field, value) => {
    const updated = (globalVegetables || []).map(v => {
      if (v.id === id) return { ...v, [field]: value };
      return v;
    });
    setGlobalVegetables(updated);
    await setDoc(doc(db, "store", "globalVegetables"), { data: updated });
  };

  const handleAddVegetable = async () => {
    if (!newVeg.name || !newVeg.price) return;
    const newId = 'v' + Date.now();
    const vegObj = { ...newVeg, id: newId, price: Number(newVeg.price) };
    const updated = [...(globalVegetables || []), vegObj];
    setGlobalVegetables(updated);
    await setDoc(doc(db, "store", "globalVegetables"), { data: updated });
    setNewVeg({ name: '', price: '', unit: 'kg', emoji: '🥬', inStock: true });
    setIsEditing(false);
  };

  const tabs = [
    { id: 'orders', label: 'Order Today', icon: <ClipboardList size={18} /> },
    { id: 'stock', label: 'Available Item', icon: <CheckSquare size={18} /> },
    { id: 'items', label: 'Item', icon: <Edit3 size={18} /> },
    { id: 'history', label: 'History', icon: <Clock size={18} /> }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button 
          onClick={onBack}
          style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={24} color="#334155" />
        </button>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Leaf size={24} /> Sabzi Admin
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', padding: '1rem', gap: '0.5rem', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              flex: '1 0 auto',
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', 
              border: activeTab === tab.id ? 'none' : '1px solid #cbd5e1', 
              background: activeTab === tab.id ? '#10b981' : 'white', 
              color: activeTab === tab.id ? 'white' : '#475569', 
              fontWeight: 'bold', cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '1rem', flex: 1, paddingBottom: '100px' }}>
        
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setSelectedDate(todayStr)}
                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: selectedDate === todayStr ? 'none' : '1px solid #cbd5e1', background: selectedDate === todayStr ? '#0369a1' : 'white', color: selectedDate === todayStr ? 'white' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Today's Orders
              </button>
              <button 
                onClick={() => setSelectedDate(tomorrowStr)}
                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: selectedDate === tomorrowStr ? 'none' : '1px solid #cbd5e1', background: selectedDate === tomorrowStr ? '#0369a1' : 'white', color: selectedDate === tomorrowStr ? 'white' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Tomorrow's Orders
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '16px' }}>
                  <Package size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ color: '#475569', margin: 0 }}>No Pending Sabzi orders for {selectedDate === todayStr ? 'Today' : 'Tomorrow'}.</h3>
                </div>
              ) : (
                pendingOrders.map(order => (
                  <div key={order.mobile} style={{ background: 'white', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '6px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
                      <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
                        <h3 style={{ margin: '0 0 0.2rem 0', color: '#1e293b' }}>{order.user?.name || 'Unknown User'}</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{order.mobile} • {order.user?.address || 'No Address'}</p>
                      </div>
                      <button 
                        onClick={() => handleMarkDelivered(order.mobile, order, order.date)}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        <CheckCircle2 size={16} /> Mark Delivered
                      </button>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#334155' }}>
                          <span>{item.name} x {item.qty}</span>
                          <span style={{ fontWeight: 'bold' }}>₹{item.total}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px dashed #cbd5e1', color: '#0f172a', fontWeight: '900', fontSize: '1.1rem' }}>
                        <span>Total Collect</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STOCK TAB */}
        {activeTab === 'stock' && (
          <div>
            <h3 style={{ color: '#334155', marginBottom: '1rem' }}>Quick Stock Toggle</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {(globalVegetables || []).map(veg => (
                <div key={veg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {veg.image ? (
                      <img src={veg.image} alt={veg.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <span style={{ fontSize: '1.8rem' }}>{veg.emoji}</span>
                    )}
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>{veg.name}</span>
                  </div>
                  <button 
                    onClick={() => handleUpdateInventory(veg.id, 'inStock', !veg.inStock)}
                    style={{ 
                      background: veg.inStock ? '#10b981' : '#ef4444', 
                      color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', 
                      fontWeight: 'bold', cursor: 'pointer', width: '120px'
                    }}
                  >
                    {veg.inStock ? 'In Stock' : 'Out of Stock'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ITEMS TAB */}
        {activeTab === 'items' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                style={{ background: '#0369a1', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <Plus size={18} /> Add New Veggie
              </button>
            </div>

            {isEditing && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Add Vegetable</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" placeholder="Name (e.g. Aloo)" value={newVeg.name} onChange={e => setNewVeg({...newVeg, name: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <input type="number" placeholder="Price" value={newVeg.price} onChange={e => setNewVeg({...newVeg, price: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <select value={newVeg.unit} onChange={e => setNewVeg({...newVeg, unit: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="kg">kg</option>
                    <option value="500g">500g</option>
                    <option value="250g">250g</option>
                    <option value="100g">100g</option>
                    <option value="piece">piece</option>
                    <option value="bunch">bunch</option>
                  </select>
                  <input type="text" placeholder="Emoji (e.g. 🥔)" value={newVeg.emoji} onChange={e => setNewVeg({...newVeg, emoji: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button onClick={handleAddVegetable} style={{ background: '#10b981', color: 'white', padding: '0.8rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setIsEditing(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '0.8rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {(globalVegetables || []).map(veg => (
                <div key={veg.id} style={{ background: 'white', padding: '1rem', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    {veg.image ? (
                      <div style={{ marginRight: '1rem' }}>
                        <img src={veg.image} alt={veg.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                      </div>
                    ) : (
                      <div style={{ fontSize: '2rem', marginRight: '1rem' }}>{veg.emoji}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.2rem 0', color: '#1e293b' }}>{veg.name}</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>ID: {veg.id}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#475569' }}>Price:</span>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>₹</span>
                    <input 
                      type="number" 
                      value={veg.price}
                      onChange={e => handleUpdateInventory(veg.id, 'price', Number(e.target.value))}
                      style={{ width: '80px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />
                    <span style={{ color: '#64748b' }}>/ {veg.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            <h3 style={{ color: '#334155', marginBottom: '1rem' }}>Delivered Orders (Last 7 Days)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {historyOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '16px' }}>
                  <History size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ color: '#475569', margin: 0 }}>No delivered sabzi orders.</h3>
                </div>
              ) : (
                historyOrders.map(order => (
                  <div key={`${order.mobile}-${order.date}`} style={{ background: 'white', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '6px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.2rem 0', color: '#1e293b' }}>{order.user?.name || 'Unknown User'}</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{order.mobile}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#334155' }}>{format(new Date(order.date), 'dd MMM yyyy')}</div>
                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>DELIVERED</span>
                      </div>
                    </div>
                    <div>
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569', marginBottom: '0.2rem' }}>
                          <span>{item.name} x {item.qty}</span>
                          <span>₹{item.total}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: 'bold' }}>
                        <span>Total Amount</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminSabziPanel;
