import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import DailyStore from './components/DailyStore';
import HistoryModal from './components/HistoryModal';
import AdminDashboard from './components/AdminDashboard';
import AdminRevenueModal from './components/AdminRevenueModal';
import ProfileModal from './components/ProfileModal';
import AuthPage from './components/AuthPage';
import AdminContactModal from './components/AdminContactModal';
import PaymentModal from './components/PaymentModal';
import { format } from 'date-fns';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import './index.css';

const PRICES = {

  milk: 80, // per liter
  ghee: 800, // per kg/liter
  chach: 35 // per liter
};

function useFirestoreSync(docName, initialState) {
  const [state, setState] = useState(() => {
     const cached = localStorage.getItem(`biaora_${docName}`);
     return cached ? JSON.parse(cached) : initialState;
  });
  
  const isRemote = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "store", docName), (docSnap) => {
      if (docSnap.exists()) {
        isRemote.current = true;
        const remoteData = docSnap.data().data;
        setState(remoteData);
        localStorage.setItem(`biaora_${docName}`, JSON.stringify(remoteData));
      } else {
        setDoc(doc(db, "store", docName), { data: state });
      }
    });
    return () => unsub();
  }, [docName]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isRemote.current) {
      isRemote.current = false;
      return;
    }
    localStorage.setItem(`biaora_${docName}`, JSON.stringify(state));
    setDoc(doc(db, "store", docName), { data: state });
  }, [state, docName]);

  return [state, setState];
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [globalOrders, setGlobalOrders] = useFirestoreSync('globalOrders', {});
  const [totalBill, setTotalBill] = useState(0);
  const [monthTotalBill, setMonthTotalBill] = useState(0);
  const [monthPaidBill, setMonthPaidBill] = useState(0);
  const [billUpdated, setBillUpdated] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminContactOpen, setIsAdminContactOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAdminRevenueOpen, setIsAdminRevenueOpen] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => JSON.parse(localStorage.getItem('biaora_isLoggedIn')) || false);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('biaora_currentUser')) || null);
  const [registeredUsers, setRegisteredUsers] = useFirestoreSync('registeredUsers', []);
  const [profileRequests, setProfileRequests] = useFirestoreSync('profileRequests', {});
  const [paymentRequests, setPaymentRequests] = useFirestoreSync('paymentRequests', {});
  const [globalPayments, setGlobalPayments] = useFirestoreSync('globalPayments', {});
  const [adminLogs, setAdminLogs] = useFirestoreSync('adminLogs', []);
  const [monthlyOverrides, setMonthlyOverrides] = useFirestoreSync('monthlyOverrides', {});
  const [globalExpenses, setGlobalExpenses] = useFirestoreSync('globalExpenses', []);
  const [broadcasts, setBroadcasts] = useFirestoreSync('broadcasts', []);


  const adminTotalReceived = useMemo(() => {
    let total = 0;
    Object.values(globalPayments).forEach(userPayments => {
      userPayments.forEach(p => {
        if (p.status === 'approved') total += parseFloat(p.amount);
      });
    });
    return total;
  }, [globalPayments]);

  useEffect(() => {
    localStorage.setItem('biaora_isLoggedIn', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('biaora_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleDeleteUser = (mobile) => {
    setRegisteredUsers(prev => prev.filter(u => u.mobile !== mobile));
    setGlobalOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[mobile];
      return newOrders;
    });
    setGlobalPayments(prev => {
      const next = { ...prev };
      delete next[mobile];
      return next;
    });
    setPaymentRequests(prev => {
      const next = { ...prev };
      delete next[mobile];
      return next;
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsProfileOpen(false);
  };

  const handleVacationUpdate = (startDate, endDate) => {
    if (!currentUser) return;
    
    // Update currentUser local state
    const updatedUser = { ...currentUser, vacationStart: startDate, vacationEnd: endDate };
    setCurrentUser(updatedUser);
    localStorage.setItem('biaora_currentUser', JSON.stringify(updatedUser));
    
    // Update registeredUsers global state
    setRegisteredUsers(prev => prev.map(u => u.mobile === currentUser.mobile ? updatedUser : u));
    
    alert('Vacation mode updated successfully!');
  };

  // Inactivity Auto-Logout (10 minutes)
  useEffect(() => {
    if (!isLoggedIn) return;

    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleLogout();
        alert("Aapka session 10 minute tak inactive hone ki wajah se automatically logout ho gaya hai.");
      }, 10 * 60 * 1000); // 10 minutes
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    
    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isLoggedIn]);

  const handleProfileRequest = (mobile, updates) => {
    setProfileRequests(prev => ({ ...prev, [mobile]: updates }));
  };

  const handleApproveProfile = (mobile) => {
    const details = profileRequests[mobile];
    if (details) {
      setRegisteredUsers(prev => prev.map(u => u.mobile === mobile ? { ...u, ...details } : u));
      if (currentUser?.mobile === mobile) {
         setCurrentUser(prev => ({ ...prev, ...details }));
      }
      setProfileRequests(prev => {
        const next = { ...prev };
        delete next[mobile];
        return next;
      });
    }
  };

  const handleRejectProfile = (mobile) => {
    setProfileRequests(prev => {
      const next = { ...prev };
      delete next[mobile];
      return next;
    });
  };

  const handleUpdateAvatar = (base64Image) => {
    const mobile = currentUser.mobile;
    setRegisteredUsers(prev => prev.map(u => u.mobile === mobile ? { ...u, avatar: base64Image } : u));
    setCurrentUser(prev => ({ ...prev, avatar: base64Image }));
  };

  const handlePaymentSubmit = (mobile, utr, amount, paymentMonth) => {
    setPaymentRequests(prev => ({
      ...prev,
      [mobile]: {
        utr,
        amount,
        paymentMonth,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const logAdminAction = (type, mobile, name, action, details) => {
    setAdminLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type, // 'order' or 'payment'
      mobile,
      name,
      action, // 'approved' or 'deleted'
      details
    }, ...prev]);
  };

  const handleApprovePayment = (mobile) => {
    const req = paymentRequests[mobile];
    if (req) {
      setGlobalPayments(prev => {
        const userPayments = prev[mobile] || [];
        return {
          ...prev,
          [mobile]: [...userPayments, { ...req, status: 'approved' }]
        };
      });
      setPaymentRequests(prev => {
        const next = { ...prev };
        delete next[mobile];
        return next;
      });
      const user = registeredUsers.find(u => u.mobile === mobile);
      logAdminAction('payment', mobile, user?.name || 'Unknown', 'approved', `Amount: ₹${req.amount}, UTR: ${req.utr}, Month: ${req.paymentMonth || 'N/A'}`);
    }
  };

  const handleRejectPayment = (mobile) => {
    const req = paymentRequests[mobile];
    if (req) {
      setPaymentRequests(prev => {
        const next = { ...prev };
        delete next[mobile];
        return next;
      });
      const user = registeredUsers.find(u => u.mobile === mobile);
      logAdminAction('payment', mobile, user?.name || 'Unknown', 'deleted', `Amount: ₹${req.amount}, UTR: ${req.utr}, Month: ${req.paymentMonth || 'N/A'}`);
    }
  };

  const orders = currentUser?.mobile ? (globalOrders[currentUser.mobile] || {}) : {};
  
  const setOrders = (updater) => {
    if (!currentUser || currentUser.role === 'admin') return;
    setGlobalOrders(prev => {
      const prevUserOrders = prev[currentUser.mobile] || {};
      const newUserOrders = typeof updater === 'function' ? updater(prevUserOrders) : updater;
      return { ...prev, [currentUser.mobile]: newUserOrders };
    });
  };

  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') return;
    
    const currentMonth = selectedDate.getMonth() + 1;
    const currentYear = selectedDate.getFullYear();
    const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;


    let bill = 0;

    Object.entries(orders).forEach(([dateStr, dayOrder]) => {
      const [y, m] = dateStr.split('-');
      if (parseInt(m, 10) === currentMonth && parseInt(y, 10) === currentYear) {
        if (dayOrder.status === 'approved') {
          bill += (dayOrder.milk || 0) * PRICES.milk;
          bill += (dayOrder.ghee || 0) * PRICES.ghee;
          bill += (dayOrder.chach || 0) * PRICES.chach;
        }
      }
    });

    let paid = 0;
    const userPayments = globalPayments[currentUser.mobile] || [];
    userPayments.forEach(payment => {
      if (payment.status === 'approved') {
        const pMonth = payment.paymentMonth || payment.timestamp.substring(0, 7);
        if (pMonth === currentMonthStr) {
          paid += parseFloat(payment.amount);
        }
      }
    });

    const override = monthlyOverrides[currentUser.mobile]?.[currentMonthStr];
    if (override) {
      if (override.mTotal !== undefined && override.mTotalAdj === undefined) {
        setMonthTotalBill(override.mTotal);
        setMonthPaidBill(override.mPaid);
        setTotalBill(override.mRemain);
        return;
      }
      bill += (override.mTotalAdj || 0);
      paid += (override.mPaidAdj || 0);
    }

    setMonthTotalBill(bill);
    setMonthPaidBill(paid);
    setTotalBill(Math.max(0, bill - paid));

  }, [orders, selectedDate, currentUser, globalPayments, monthlyOverrides]);

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleSaveDayOrder = (date, localOrder, replaceMode = false) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setOrders(prev => {
      const prevDayOrder = prev[dateKey] || { milk: 0, ghee: 0, chach: 0, status: 'pending' };
      const newDayOrder = replaceMode ? {
        milk: localOrder.milk,
        ghee: localOrder.ghee,
        chach: localOrder.chach,
        status: 'pending'
      } : {
        milk: prevDayOrder.milk + localOrder.milk,
        ghee: prevDayOrder.ghee + localOrder.ghee,
        chach: prevDayOrder.chach + localOrder.chach,
        status: 'pending'
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

  const handleApproveUserOrder = (userMobile, dateKey) => {
    let dayOrder = null;
    setGlobalOrders(prev => {
      const userOrders = prev[userMobile] || {};
      dayOrder = userOrders[dateKey];
      if (!dayOrder) return prev;
      return {
        ...prev,
        [userMobile]: {
          ...userOrders,
          [dateKey]: { ...dayOrder, status: 'approved' }
        }
      };
    });
    if (dayOrder) {
      const user = registeredUsers.find(u => u.mobile === userMobile);
      const parts = [];
      if (dayOrder.milk) parts.push(`${dayOrder.milk}L Milk`);
      if (dayOrder.ghee) parts.push(`${dayOrder.ghee}Kg Ghee`);
      if (dayOrder.chach) parts.push(`${dayOrder.chach}L Chach`);
      logAdminAction('order', userMobile, user?.name || 'Unknown', 'approved', `Date: ${dateKey}, Items: ${parts.join(', ')}`);
    }
  };

  const handleRejectUserOrder = (userMobile, dateKey) => {
    let dayOrder = null;
    setGlobalOrders(prev => {
      const userOrders = prev[userMobile] || {};
      dayOrder = userOrders[dateKey];
      if (!dayOrder) return prev;
      const newUserOrders = { ...userOrders };
      delete newUserOrders[dateKey];
      return {
        ...prev,
        [userMobile]: newUserOrders
      };
    });
    if (dayOrder) {
      const user = registeredUsers.find(u => u.mobile === userMobile);
      const parts = [];
      if (dayOrder.milk) parts.push(`${dayOrder.milk}L Milk`);
      if (dayOrder.ghee) parts.push(`${dayOrder.ghee}Kg Ghee`);
      if (dayOrder.chach) parts.push(`${dayOrder.chach}L Chach`);
      logAdminAction('order', userMobile, user?.name || 'Unknown', 'deleted', `Date: ${dateKey}, Items: ${parts.join(', ')}`);
    }
  };

  const handleEditUserOrder = (userMobile, dateKey, updatedOrder) => {
    setGlobalOrders(prev => {
      const userOrders = prev[userMobile] || {};
      return {
        ...prev,
        [userMobile]: {
          ...userOrders,
          [dateKey]: { ...userOrders[dateKey], ...updatedOrder }
        }
      };
    });
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const currentOrder = orders[selectedDateStr] || { milk: 0, ghee: 0, chach: 0 };

  const handleAuth = ({ action, data }) => {
    if (action === 'register') {
      const exists = registeredUsers.find(u => u.mobile === data.mobile);
      if (exists) {
        return { success: false, error: 'Mobile number already registered. Please login.' };
      }
      setRegisteredUsers(prev => [...prev, data]);
      setCurrentUser(data);
      setIsLoggedIn(true);
      return { success: true };
    } else if (action === 'login') {
      if (data.mobile === '7509766655' && data.password === 'babu@66655') {
        setCurrentUser({ name: 'Shyam Dangi (Admin)', mobile: '7509766655', role: 'admin' });
        setIsLoggedIn(true);
        return { success: true };
      }
      
      const user = registeredUsers.find(u => u.mobile === data.mobile && u.password === data.password);
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid Mobile Number or Password. Please try again or Sign Up.' };
      }
    }
  };

  if (!isLoggedIn) {
    return <AuthPage onAuthAction={handleAuth} />;
  }

  if (currentUser?.role === 'admin') {
    return (
      <div className="app-container">
        <Header 
          totalBill={adminTotalReceived} 
          monthTotalBill={0}
          monthPaidBill={0}
          billUpdated={false} 
          onOpenHistory={() => {}} 
          onOpenProfile={() => setIsProfileOpen(true)}
          onAdminContactToggle={() => {}}
          onOpenAdminRevenue={() => setIsAdminRevenueOpen(true)}
          currentUser={currentUser}
        />
        <main className="app-layout" style={{ padding: 0 }}>
          <AdminDashboard 
            prices={PRICES} 
            registeredUsers={registeredUsers}
            globalOrders={globalOrders} 
            onApproveOrder={handleApproveUserOrder} 
            onRejectOrder={handleRejectUserOrder}
            onEditUserOrder={handleEditUserOrder}
            onDeleteUser={handleDeleteUser}
            profileRequests={profileRequests}
            onApproveProfile={handleApproveProfile}
            onRejectProfile={handleRejectProfile} 
            paymentRequests={paymentRequests}
            onApprovePayment={handleApprovePayment}
            onRejectPayment={handleRejectPayment}
            globalPayments={globalPayments}
            adminLogs={adminLogs}
            monthlyOverrides={monthlyOverrides}
            setMonthlyOverrides={setMonthlyOverrides}
            broadcasts={broadcasts}
            setBroadcasts={setBroadcasts}
            globalExpenses={globalExpenses}
            setGlobalExpenses={setGlobalExpenses}
          />
        </main>
        {isProfileOpen && (
          <ProfileModal 
            onClose={() => setIsProfileOpen(false)} 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            onProfileRequest={handleProfileRequest} 
            profileRequestStatus={profileRequests[currentUser?.mobile]} 
            onUpdateAvatar={handleUpdateAvatar}
            onVacationUpdate={handleVacationUpdate}
          />
        )}
        {isAdminRevenueOpen && (
          <AdminRevenueModal 
            onClose={() => setIsAdminRevenueOpen(false)}
            globalPayments={globalPayments}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header 
        totalBill={totalBill} 
        monthTotalBill={monthTotalBill}
        monthPaidBill={monthPaidBill}
        billUpdated={billUpdated} 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        onOpenProfile={() => setIsProfileOpen(true)}
        onAdminContactToggle={() => setIsAdminContactOpen(true)}
        onOpenPayment={() => setIsPaymentOpen(true)}
        currentUser={currentUser}
      />
      
      <main className="app-layout">
        <div className="left-panel">
          <DailyStore 
            selectedDate={selectedDate}
            currentOrder={currentOrder}
            onSaveOrder={handleSaveDayOrder}
            onClearOrder={handleClearDayOrder}
            prices={PRICES}
            currentUser={currentUser}
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

      {isHistoryOpen && (
        <HistoryModal 
          orders={orders} 
          payments={globalPayments[currentUser?.mobile] || []}
          pendingPayment={paymentRequests[currentUser?.mobile]}
          onClose={() => setIsHistoryOpen(false)} 
          prices={PRICES}
          selectedDate={selectedDate}
        />
      )}

      {isProfileOpen && (
        <ProfileModal 
          onClose={() => setIsProfileOpen(false)} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onProfileRequest={handleProfileRequest} 
          profileRequestStatus={profileRequests[currentUser?.mobile]} 
          onUpdateAvatar={handleUpdateAvatar} 
          onVacationUpdate={handleVacationUpdate} 
        />
      )}

      {isAdminContactOpen && (
        <AdminContactModal 
          onClose={() => setIsAdminContactOpen(false)} 
          onOpenPayment={() => {
            setIsAdminContactOpen(false);
            setIsPaymentOpen(true);
          }}
        />
      )}

      {isPaymentOpen && (
        <PaymentModal 
          onClose={() => setIsPaymentOpen(false)} 
          totalBill={totalBill} 
          onSubmitPayment={handlePaymentSubmit}
          pendingRequest={paymentRequests[currentUser?.mobile]}
          currentUser={currentUser}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}

export default App;
