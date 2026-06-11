import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import DailyStore from './components/DailyStore';
import HistoryModal from './components/HistoryModal';
import AdminDashboard from './components/AdminDashboard';
import ProfileModal from './components/ProfileModal';
import { format } from 'date-fns';
import './index.css';

const PRICES = {
  milk: 80, // per liter
  ghee: 800, // per kg/liter
  chach: 35 // per liter
};

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState({});
  const [totalBill, setTotalBill] = useState(0);
  const [billUpdated, setBillUpdated] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    let bill = 0;
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    Object.entries(orders).forEach(([dateStr, dayOrder]) => {
      const [y, m] = dateStr.split('-');
      if (parseInt(m, 10) === currentMonth && parseInt(y, 10) === currentYear) {
        bill += (dayOrder.milk || 0) * PRICES.milk;
        bill += (dayOrder.ghee || 0) * PRICES.ghee;
        bill += (dayOrder.chach || 0) * PRICES.chach;
      }
    });
    setTotalBill(bill);
    setBillUpdated(true);
    const timer = setTimeout(() => setBillUpdated(false), 400);
    return () => clearTimeout(timer);
  }, [orders, currentDate]);

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleSaveDayOrder = (date, localOrder) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setOrders(prev => {
      const prevDayOrder = prev[dateKey] || { milk: 0, ghee: 0, chach: 0 };
      const newDayOrder = {
        milk: prevDayOrder.milk + localOrder.milk,
        ghee: prevDayOrder.ghee + localOrder.ghee,
        chach: prevDayOrder.chach + localOrder.chach
      };
      
      if (newDayOrder.milk === 0 && newDayOrder.ghee === 0 && newDayOrder.chach === 0) {
        const newOrders = { ...prev };
        delete newOrders[dateKey];
        return newOrders;
      }
      return { ...prev, [dateKey]: newDayOrder };
    });
  };

  const handleClearDayOrder = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[dateKey];
      return newOrders;
    });
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const currentOrder = orders[selectedDateStr] || { milk: 0, ghee: 0, chach: 0 };

  return (
    <div className="app-container">
      <Header 
        totalBill={totalBill} 
        billUpdated={billUpdated} 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        onOpenProfile={() => setIsProfileOpen(true)}
        isAdminMode={isAdminMode}
        toggleAdminMode={() => setIsAdminMode(!isAdminMode)}
      />
      
      {isAdminMode ? (
        <main className="app-layout" style={{ padding: 0 }}>
          <AdminDashboard prices={PRICES} />
        </main>
      ) : (
        <main className="app-layout">
          <div className="left-panel">
            <DailyStore 
              selectedDate={selectedDate}
              currentOrder={currentOrder}
              onSaveOrder={handleSaveDayOrder}
              onClearOrder={handleClearDayOrder}
              prices={PRICES}
            />
          </div>
          
          <div className="right-panel">
            <Calendar 
              currentDate={currentDate} 
              setCurrentDate={setCurrentDate} 
              orders={orders}
              onDayClick={handleDayClick}
              selectedDate={selectedDate}
            />
          </div>
        </main>
      )}

      {isHistoryOpen && (
        <HistoryModal 
          orders={orders} 
          onClose={() => setIsHistoryOpen(false)} 
          prices={PRICES} 
        />
      )}

      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </div>
  );
}

export default App;
