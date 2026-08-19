import React, { useState, useMemo } from 'react';
import { Leaf, CheckCircle2, Package, Plus, ArrowLeft, Edit3, ClipboardList, CheckSquare, Clock, History } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const [selectedOrderTab, setSelectedOrderTab] = useState('pending');
  const [newVeg, setNewVeg] = useState({ name: '', price: '', originalPrice: '', stockQty: '', unit: 'kg', emoji: '🥬', inStock: true, image: '' , category: 'हरी सब्जियां'});
  const [isEditing, setIsEditing] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkEdits, setBulkEdits] = useState({});

  // Computed Orders for "orders" tab (pending today/tomorrow)
  const pendingOrders = useMemo(() => {
    const orders = [];
    Object.keys(globalSabziOrders || {}).forEach(mobile => {
      Object.keys(globalSabziOrders[mobile] || {}).forEach(date => {
        const order = globalSabziOrders[mobile][date];
        if (order && order.status === 'pending') {
          const user = (registeredUsers || []).find(u => u.mobile === mobile);
          orders.push({ mobile, user, ...order, date });
        }
      });
    });
    return orders.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
  }, [globalSabziOrders, registeredUsers]);

  const todayDeliveries = useMemo(() => {
    const orders = [];
    const nowLocal = new Date();
    const tStr = format(nowLocal, 'yyyy-MM-dd');
    const h = nowLocal.getHours();
    const m = nowLocal.getMinutes();
    
    Object.keys(globalSabziOrders || {}).forEach(mobile => {
      Object.keys(globalSabziOrders[mobile] || {}).forEach(date => {
        const order = globalSabziOrders[mobile][date];
        if (order && order.status === 'approved') {
          if (date < tStr) return;
          if (date === tStr && (h > 15 || (h === 15 && m >= 50))) return;
          
          const user = (registeredUsers || []).find(u => u.mobile === mobile);
          orders.push({ mobile, user, ...order, date });
        }
      });
    });
    return orders.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [globalSabziOrders, registeredUsers]);

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

  const handleApprove = async (mobile, order, date) => {
    const updatedUserOrders = {
      ...globalSabziOrders[mobile],
      [date]: { ...order, status: 'approved' }
    };
    const newGlobalOrders = {
      ...globalSabziOrders,
      [mobile]: updatedUserOrders
    };
    setGlobalSabziOrders(newGlobalOrders);
    await setDoc(doc(db, "store", "globalSabziOrders"), { data: newGlobalOrders });
  };

  const handleDownloadPDF = () => {
    const docPdf = new jsPDF();
    docPdf.setFontSize(16);
    docPdf.text('Today Delivery - Sabzi Orders', 14, 15);
    
    const itemTotals = {};
    todayDeliveries.forEach(order => {
      order.items.forEach(item => {
        if (!itemTotals[item.name]) itemTotals[item.name] = 0;
        itemTotals[item.name] += item.qty;
      });
    });

    const itemsSummary = Object.keys(itemTotals).map(name => [name, itemTotals[name]]);
    
    autoTable(docPdf, {
      startY: 25,
      head: [['Item Name', 'Total Qty']],
      body: itemsSummary,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    let startY = docPdf.lastAutoTable.finalY + 15;
    docPdf.setFontSize(14);
    docPdf.text('Customer Wise Orders', 14, startY);

    const customerData = todayDeliveries.map(order => {
      const itemsList = order.items.map(i => `${i.name} ` + (i.unit === 'kg' && i.qty < 1 ? `(${i.qty * 1000}g)` : `(${i.qty}${i.unit === 'kg' ? 'kg' : (i.unit !== 'piece' ? i.unit : '')})`)).join(', ');
      return [
        order.user?.name || 'Unknown',
        order.mobile,
        order.user?.address || '',
        itemsList,
        `Rs.${order.total}`
      ];
    });

    autoTable(docPdf, {
      startY: startY + 5,
      head: [['Name', 'Mobile', 'Address', 'Items', 'Amount']],
      body: customerData,
      theme: 'grid',
      headStyles: { fillColor: [3, 105, 161] }
    });

    docPdf.save('Sabzi_Today_Delivery.pdf');
  };

  const handleTogglePaid = async (mobile, order, date) => {
    const updatedUserOrders = {
      ...globalSabziOrders[mobile],
      [date]: { ...order, isPaid: !order.isPaid }
    };
    const newGlobalOrders = {
      ...globalSabziOrders,
      [mobile]: updatedUserOrders
    };
    setGlobalSabziOrders(newGlobalOrders);
    await setDoc(doc(db, "store", "globalSabziOrders"), { data: newGlobalOrders });
  };

  
  const startBulkUpdate = () => {
    const initialEdits = {};
    (globalVegetables || []).forEach(v => {
      initialEdits[v.id] = { price: v.price, stockQty: v.stockQty || '', inStock: v.inStock };
    });
    setBulkEdits(initialEdits);
    setIsBulkUpdating(true);
  };

  const handleBulkChange = (id, field, value) => {
    setBulkEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const saveBulkUpdate = async () => {
    const updated = (globalVegetables || []).map(v => {
      const edit = bulkEdits[v.id];
      if (edit) {
        const newPrice = Number(edit.price);
        let origPrice = v.originalPrice;
        if (v.price && newPrice < v.price) {
          if (!origPrice || v.price > origPrice) origPrice = v.price;
        } else if (origPrice && newPrice >= origPrice) {
          origPrice = '';
        }
        return { 
          ...v, 
          price: newPrice, 
          stockQty: edit.stockQty ? Number(edit.stockQty) : '', 
          inStock: edit.inStock, 
          originalPrice: origPrice 
        };
      }
      return v;
    });
    setGlobalVegetables(updated);
    await setDoc(doc(db, "store", "globalVegetables"), { data: JSON.parse(JSON.stringify(updated)) });
    setIsBulkUpdating(false);
  };

  const handleUpdateInventory = async (id, field, value) => {
    const updated = (globalVegetables || []).map(v => {
      if (v.id === id) {
        let updates = { ...v, [field]: value };
        if (field === 'price') {
          if (v.price && value < v.price) {
            // Automatically set original price to current price if dropping
            // Only if originalPrice is not already higher
            if (!v.originalPrice || v.price > v.originalPrice) {
               updates.originalPrice = v.price;
            }
          } else if (v.originalPrice && value >= v.originalPrice) {
            // Price increased back to normal
            updates.originalPrice = '';
          }
        }
        return updates;
      }
      return v;
    });
    setGlobalVegetables(updated);
    await setDoc(doc(db, "store", "globalVegetables"), { data: JSON.parse(JSON.stringify(updated)) });
  };

  const handleAddVegetable = async () => {
    if (!newVeg.name || !newVeg.price) return;
    const newId = 'v' + Date.now();
    const vegObj = { ...newVeg, id: newId, price: Number(newVeg.price), originalPrice: newVeg.originalPrice ? Number(newVeg.originalPrice) : '', stockQty: newVeg.stockQty ? Number(newVeg.stockQty) : '' , category: newVeg.category || 'अन्य' };
    const updated = [...(globalVegetables || []), vegObj];
    setGlobalVegetables(updated);
    await setDoc(doc(db, "store", "globalVegetables"), { data: JSON.parse(JSON.stringify(updated)) });
    setNewVeg({ name: '', price: '', originalPrice: '', stockQty: '', unit: 'kg', emoji: '🥬', inStock: true, image: '' , category: 'हरी सब्जियां'});
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
        {/* Top Analytics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', padding: '1rem', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(14,165,233,0.2)' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '0.2rem' }}>💰 Expected Revenue</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>₹{analytics.expectedRevenue}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', padding: '1rem', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '0.2rem' }}>🏆 Top Selling</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{analytics.topSelling}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)', padding: '1rem', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '0.2rem' }}>⚠️ Low Stock Items</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{analytics.lowStockCount}</div>
          </div>
        </div>
        
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setSelectedOrderTab('pending')}
                style={{ flex: '1 1 min-content', whiteSpace: 'nowrap', padding: '0.6rem', borderRadius: '8px', border: selectedOrderTab === 'pending' ? 'none' : '1px solid #cbd5e1', background: selectedOrderTab === 'pending' ? '#0369a1' : 'white', color: selectedOrderTab === 'pending' ? 'white' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Pending Approvals
              </button>
              <button 
                onClick={() => setSelectedOrderTab('approved')}
                style={{ flex: '1 1 min-content', whiteSpace: 'nowrap', padding: '0.6rem', borderRadius: '8px', border: selectedOrderTab === 'approved' ? 'none' : '1px solid #cbd5e1', background: selectedOrderTab === 'approved' ? '#10b981' : 'white', color: selectedOrderTab === 'approved' ? 'white' : '#475569', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Today Delivery
              </button>
            </div>

            {selectedOrderTab === 'pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '16px' }}>
                    <Package size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: '#475569', margin: 0 }}>No pending sabzi approvals.</h3>
                  </div>
                ) : (
                  pendingOrders.map(order => (
                    <div key={order.mobile + order.date} style={{ background: 'white', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '6px solid #f59e0b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
                        <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
                          <h3 style={{ margin: '0 0 0.2rem 0', color: '#1e293b' }}>{order.user?.name || 'Unknown User'}</h3>
                          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{order.mobile} • {order.user?.address || 'No Address'}</p>
                          <p style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '0.8rem', fontWeight: 'bold' }}>For Delivery: {order.date}</p>
                        </div>
                        <button 
                          onClick={() => handleApprove(order.mobile, order, order.date)}
                          style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          <CheckCircle2 size={16} /> Approve
                        </button>
                      </div>
                      
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                        {order.items.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#334155' }}>
                            <span>{item.name} {item.unit === 'kg' && item.qty < 1 ? `(${item.qty * 1000}g)` : `x ${item.qty} ${item.unit !== 'piece' && item.unit !== 'kg' ? item.unit : ''}${item.unit === 'kg' && item.qty >= 1 ? 'kg' : ''}`}</span>
                            <span style={{ fontWeight: 'bold' }}>₹{item.total}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px dashed #cbd5e1', color: '#0f172a', fontWeight: '900', fontSize: '1.1rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>Total Amount:</span>
                            <span>₹{order.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedOrderTab === 'approved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                  <button onClick={handleDownloadPDF} style={{ background: '#0284c7', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    Download PDF
                  </button>
                </div>
                {todayDeliveries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '16px' }}>
                    <Package size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: '#475569', margin: 0 }}>No orders for Today Delivery.</h3>
                  </div>
                ) : (
                  todayDeliveries.map(order => (
                    <div key={order.mobile + order.date} style={{ background: 'white', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '6px solid #10b981' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
                        <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
                          <h3 style={{ margin: '0 0 0.2rem 0', color: '#1e293b' }}>{order.user?.name || 'Unknown User'}</h3>
                          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{order.mobile} • {order.user?.address || 'No Address'}</p>
                          <p style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '0.8rem', fontWeight: 'bold' }}>Delivery: {order.date}</p>
                        </div>
                        <button 
                          onClick={() => handleMarkDelivered(order.mobile, order, order.date)}
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          <CheckCircle2 size={16} /> Mark Delivered
                        </button>
                      </div>
                      
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                        {order.items.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#334155' }}>
                            <span>{item.name} {item.unit === 'kg' && item.qty < 1 ? `(${item.qty * 1000}g)` : `x ${item.qty} ${item.unit !== 'piece' && item.unit !== 'kg' ? item.unit : ''}${item.unit === 'kg' && item.qty >= 1 ? 'kg' : ''}`}</span>
                            <span style={{ fontWeight: 'bold' }}>₹{item.total}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px dashed #cbd5e1', color: '#0f172a', fontWeight: '900', fontSize: '1.1rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Status:</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', background: order.isPaid ? '#dcfce7' : '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '8px', border: `1px solid ${order.isPaid ? '#22c55e' : '#cbd5e1'}`, transition: 'all 0.2s' }}>
                              <input 
                                type="checkbox" 
                                checked={!!order.isPaid} 
                                onChange={() => handleTogglePaid(order.mobile, order, order.date)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '0.9rem', color: order.isPaid ? '#15803d' : '#475569', fontWeight: 'bold' }}>Paid</span>
                            </label>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>Total Collect:</span>
                            <span style={{ color: order.isPaid ? '#22c55e' : '#0f172a' }}>₹{order.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
              {!isBulkUpdating && (
                <button 
                  onClick={startBulkUpdate}
                  style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  ⚡ Morning Price Update
                </button>
              )}
              {!isBulkUpdating && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ background: '#0369a1', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <Plus size={18} /> Add New Veggie
                </button>
              )}
            </div>

            {isBulkUpdating && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#1e293b' }}>⚡ Quick Update Table</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setIsBulkUpdating(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={saveBulkUpdate} style={{ background: '#10b981', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Save All</button>
                  </div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '0.8rem', color: '#475569' }}>Item</th>
                        <th style={{ padding: '0.8rem', color: '#475569', width: '120px' }}>Price (₹)</th>
                        <th style={{ padding: '0.8rem', color: '#475569', width: '120px' }}>Stock Qty</th>
                        <th style={{ padding: '0.8rem', color: '#475569', width: '100px' }}>In Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(globalVegetables || []).map(veg => (
                        <tr key={veg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: 'bold', color: '#1e293b' }}>{veg.name} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>({veg.unit})</span></td>
                          <td style={{ padding: '0.6rem 0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <button onClick={() => handleBulkChange(veg.id, 'price', Math.max(0, Number(bulkEdits[veg.id]?.price || 0) - 5))} style={{ padding: '0.2rem 0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>-5</button>
                              <input 
                                type="number" 
                                value={bulkEdits[veg.id]?.price || ''} 
                                onChange={e => handleBulkChange(veg.id, 'price', e.target.value)}
                                style={{ width: '60px', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                              />
                              <button onClick={() => handleBulkChange(veg.id, 'price', Number(bulkEdits[veg.id]?.price || 0) + 5)} style={{ padding: '0.2rem 0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>+5</button>
                            </div>
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem' }}>
                            <input 
                              type="number" 
                              value={bulkEdits[veg.id]?.stockQty || ''} 
                              onChange={e => handleBulkChange(veg.id, 'stockQty', e.target.value)}
                              style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                              placeholder="Empty=∞"
                            />
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem' }}>
                            <input 
                              type="checkbox" 
                              checked={bulkEdits[veg.id]?.inStock || false} 
                              onChange={e => handleBulkChange(veg.id, 'inStock', e.target.checked)}
                              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {isEditing && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Add Vegetable</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                    <input type="text" placeholder="Name (e.g. Aloo)" value={newVeg.name} onChange={e => setNewVeg({...newVeg, name: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <input type="number" placeholder="Offer Price" value={newVeg.price} onChange={e => setNewVeg({...newVeg, price: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <input type="number" placeholder="Original Price (Optional)" value={newVeg.originalPrice} onChange={e => setNewVeg({...newVeg, originalPrice: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <input type="number" placeholder="Stock Qty (Optional)" value={newVeg.stockQty} onChange={e => setNewVeg({...newVeg, stockQty: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    <select value={newVeg.category || 'हरी सब्जियां'} onChange={e => setNewVeg({...newVeg, category: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="हरी सब्जियां">हरी सब्जियां (Green/Leafy)</option>
                    <option value="रोजाना">रोजाना (Aloo/Pyaz/Tamatar)</option>
                    <option value="सलाद">सलाद (Salad)</option>
                    <option value="मसाले">मसाले (अदरक/लहसुन/मिर्ची)</option>
                    <option value="फल">फल (Fruits)</option>
                    <option value="अन्य">अन्य (Others)</option>
                  </select>
                  <select value={newVeg.unit} onChange={e => setNewVeg({...newVeg, unit: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="kg">kg</option>
                    <option value="500g">500g</option>
                    <option value="250g">250g</option>
                    <option value="100g">100g</option>
                    <option value="piece">piece</option>
                    <option value="bunch">bunch</option>
                  </select>
                  <input type="text" placeholder="Emoji (e.g. 🥔)" value={newVeg.emoji} onChange={e => setNewVeg({...newVeg, emoji: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <input type="text" placeholder="Image URL (optional)" value={newVeg.image || ''} onChange={e => setNewVeg({...newVeg, image: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', gridColumn: '1 / -1' }} />
                </div>
                {newVeg.image && (
                  <div style={{ marginTop: '1rem' }}>
                    <img src={newVeg.image} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button onClick={handleAddVegetable} style={{ background: '#10b981', color: 'white', padding: '0.8rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setIsEditing(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '0.8rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            {!isBulkUpdating && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
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
                      <h4 style={{ margin: '0 0 0.2rem 0', color: '#1e293b', display:'flex', gap:'0.5rem', alignItems:'center' }}>{veg.name} <span style={{background:'#e0e7ff', color:'#4f46e5', fontSize:'0.7rem', padding:'2px 8px', borderRadius:'12px', fontWeight:'normal'}}>{veg.category || 'अन्य'}</span> {veg.originalPrice && veg.originalPrice > veg.price && <span style={{background:'#dcfce7',color:'#16a34a',fontSize:'0.7rem',padding:'2px 6px',borderRadius:'4px',fontWeight:'bold',display:'flex',alignItems:'center',gap:'2px'}}>📉 Price Dropped by ₹{veg.originalPrice - veg.price}</span>}</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>ID: {veg.id} {veg.stockQty !== '' && veg.stockQty !== undefined ? `| Stock: ${veg.stockQty} ${veg.unit}` : ''}</p>
     {veg.stockQty !== '' && veg.stockQty !== undefined && veg.stockQty <= 2 && <p style={{ margin: '0.2rem 0 0 0', color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>⚠️ Low Stock Alert</p>}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ color: '#475569', fontSize: '0.85rem' }}>Stock:</span>
                      <input 
                        type="number" 
                        value={veg.stockQty || ''}
                        placeholder="Qty"
                        onChange={e => handleUpdateInventory(veg.id, 'stockQty', e.target.value ? Number(e.target.value) : '')}
                        style={{ width: '60px', padding: '0.3rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{veg.unit}</span>
                    </div>
                </div>
              ))}
            </div>}
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
                      <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
                        <h3 style={{ margin: '0 0 0.2rem 0', color: '#1e293b' }}>{order.user?.name || 'Unknown User'}</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{order.mobile} • {order.user?.address || 'No Address'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#334155' }}>{format(new Date(order.date), 'dd MMM yyyy')}</div>
                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>DELIVERED</span>
                      </div>
                    </div>
                    <div>
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#475569', marginBottom: '0.2rem' }}>
                          <span>{item.name} {item.unit === 'kg' && item.qty < 1 ? `(${item.qty * 1000}g)` : `x ${item.qty} ${item.unit !== 'piece' && item.unit !== 'kg' ? item.unit : ''}${item.unit === 'kg' && item.qty >= 1 ? 'kg' : ''}`}</span>
                          <span>₹{item.total}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px dashed #cbd5e1', color: '#0f172a', fontWeight: '900', fontSize: '1.1rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Status:</span>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', background: order.isPaid ? '#dcfce7' : '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '8px', border: `1px solid ${order.isPaid ? '#22c55e' : '#cbd5e1'}`, transition: 'all 0.2s' }}>
                            <input 
                              type="checkbox" 
                              checked={!!order.isPaid} 
                              onChange={() => handleTogglePaid(order.mobile, order, order.date)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: order.isPaid ? '#15803d' : '#475569', fontWeight: 'bold' }}>Paid</span>
                          </label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>Total Amount:</span>
                          <span style={{ color: order.isPaid ? '#22c55e' : '#0f172a' }}>₹{order.total}</span>
                        </div>
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
