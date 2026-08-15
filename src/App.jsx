import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import HistoryModal from './components/HistoryModal';
import AdminDashboard from './components/AdminDashboard';
import AdminRevenueModal from './components/AdminRevenueModal';
import ProfileModal from './components/ProfileModal';
import AuthPage from './components/AuthPage';
import AdminContactModal from './components/AdminContactModal';
import PaymentModal from './components/PaymentModal';
import QuickMilkModal from './components/QuickMilkModal';
import CustomerDashboard from './components/CustomerDashboard';
import CustomerLayout from './components/CustomerLayout';
import CustomerPassbook from './components/CustomerPassbook';
import CustomerVacationModal from './components/CustomerVacationModal';
import SuccessAnimation from './components/SuccessAnimation';
import { format } from 'date-fns';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Megaphone } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import './index.css';
import './customer-ui.css';

const PRICES = {
  milk: 80, // per liter
  ghee: 800, // per kg/liter
  chach: 35, // per liter
  paneer: 320, // per kg
  curd: 200 // per kg
};

function useFirestoreSync(docName, initialState) {
  const [state, setState] = useState(() => {
     const cached = localStorage.getItem(`biaora_${docName}`);
     return cached ? JSON.parse(cached) : initialState;
  });
  const [isLoaded, setIsLoaded] = useState(() => !!localStorage.getItem(`biaora_${docName}`));

  const isRemote = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "store", docName), (docSnap) => {
      if (docSnap.exists()) {
        isRemote.current = true;
        const remoteData = docSnap.data().data;
        setState(remoteData);
        localStorage.setItem(`biaora_${docName}`, JSON.stringify(remoteData));
        setIsLoaded(true);
      } else {
        setDoc(doc(db, "store", docName), { data: state });
        setIsLoaded(true);
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

  return [state, setState, isLoaded];
}


function App() {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [globalOrders, setGlobalOrders] = useFirestoreSync('globalOrders', {});
  const [totalBill, setTotalBill] = useState(0); // Grand total (previousDues + bill - paid)
  const [previousDues, setPreviousDues] = useState(0);
  const [monthTotalBill, setMonthTotalBill] = useState(0);
  const [monthPaidBill, setMonthPaidBill] = useState(0);
  const [billUpdated, setBillUpdated] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminContactOpen, setIsAdminContactOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isQuickMilkOpen, setIsQuickMilkOpen] = useState(false);
  const [isAdminRevenueOpen, setIsAdminRevenueOpen] = useState(false);
  const [isPassbookOpen, setIsPassbookOpen] = useState(false);
  const [isVacationOpen, setIsVacationOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [adminActiveTab, setAdminActiveTab] = useState(() => sessionStorage.getItem('admin_activeTab') || 'users');
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => JSON.parse(localStorage.getItem('biaora_isLoggedIn')) || false);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('biaora_currentUser')) || null);
  const [registeredUsers, setRegisteredUsers, usersLoaded] = useFirestoreSync('registeredUsers', []);
  const [profileRequests, setProfileRequests] = useFirestoreSync('profileRequests', {});
  const [paymentRequests, setPaymentRequests] = useFirestoreSync('paymentRequests', {});
  const [globalPayments, setGlobalPayments] = useFirestoreSync('globalPayments', {});
  const [adminLogs, setAdminLogs] = useFirestoreSync('adminLogs', []);
  const [monthlyOverrides, setMonthlyOverrides] = useFirestoreSync('monthlyOverrides', {});
  const [globalExpenses, setGlobalExpenses] = useFirestoreSync('globalExpenses', []);
  const [broadcasts, setBroadcasts] = useFirestoreSync('broadcasts', []);
  const [globalInventory, setGlobalInventory] = useFirestoreSync('globalInventory', { milk: true, ghee: true, chach: true, paneer: true, curd: true });
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

  const handleToggleUserStatus = (mobile) => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.mobile === mobile) {
        return { ...u, isActive: u.isActive === false ? true : false };
      }
      return u;
    }));
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsProfileOpen(false);
    localStorage.removeItem('biaora_isLoggedIn');
    localStorage.removeItem('biaora_currentUser');
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



  // Auto-logout if user is deleted by admin, or sync profile updates
  useEffect(() => {
    if (isLoggedIn && currentUser && currentUser.role !== 'admin' && usersLoaded) {
      const serverUser = registeredUsers.find(u => u.mobile === currentUser.mobile);
      if (!serverUser) {
        handleLogout();
        alert("Aapka account Admin dwara delete ya block kar diya gaya hai. Kripya Admin se sampark karein.");
      } else {
        // If admin approved a profile update, sync it to the local user
        if (JSON.stringify(currentUser) !== JSON.stringify(serverUser)) {
          setCurrentUser(serverUser);
        }
      }
    }
  }, [registeredUsers, isLoggedIn, currentUser, usersLoaded]);

  // Effect for triggering animation when a new payment is approved for the customer
  useEffect(() => {
    if (isLoggedIn && currentUser && currentUser.role !== 'admin' && globalPayments[currentUser.mobile]) {
      const userPayments = globalPayments[currentUser.mobile];
      const approvedCount = userPayments.filter(p => p.status === 'approved').length;
      
      const lastCountStr = localStorage.getItem(`biaora_lastApprovedCount_${currentUser.mobile}`);
      const lastCount = lastCountStr ? parseInt(lastCountStr, 10) : 0;
      
      if (approvedCount > lastCount) {
        // Find the latest approved payment amount for the message
        const approvedPayments = userPayments.filter(p => p.status === 'approved');
        const latestPayment = approvedPayments[approvedPayments.length - 1];
        
        setSuccessMessage(`₹${latestPayment.amount} Payment Received Successfully!`);
        localStorage.setItem(`biaora_lastApprovedCount_${currentUser.mobile}`, approvedCount.toString());
      } else if (approvedCount < lastCount) {
        // Just in case it was reset or deleted
        localStorage.setItem(`biaora_lastApprovedCount_${currentUser.mobile}`, approvedCount.toString());
      }
    }
  }, [globalPayments, currentUser, isLoggedIn]);

  const handleProfileRequest = (mobile, updates) => {
    setProfileRequests(prev => ({ ...prev, [mobile]: updates }));
  };

  const handleApproveProfile = (mobile) => {
    const details = profileRequests[mobile];
    if (details) {
      const user = registeredUsers.find(u => u.mobile === mobile);
      setRegisteredUsers(prev => prev.map(u => u.mobile === mobile ? { ...u, ...details } : u));
      if (currentUser?.mobile === mobile) {
         setCurrentUser(prev => ({ ...prev, ...details }));
      }
      setProfileRequests(prev => {
        const next = { ...prev };
        delete next[mobile];
        return next;
      });
      
      if (user) {
        logAdminAction('profile', mobile, user.name || 'Unknown', 'approved', `Profile details updated: ${Object.keys(details).join(', ')}`);
      }
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

  const handlePaymentSubmit = (mobile, utr, amount, paymentMonth, screenshot) => {
    setPaymentRequests(prev => ({
      ...prev,
      [mobile]: {
        utr,
        amount,
        paymentMonth,
        screenshot,
        timestamp: new Date().toISOString()
      }
    }));
    setSuccessMessage(`₹${amount} Payment Request Sent!`);
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
    let paid = 0;
    let prevBill = 0;
    let prevPaid = 0;

    Object.entries(orders).forEach(([dateStr, dayOrder]) => {
      const [y, m] = dateStr.split('-');
      if (parseInt(m, 10) === currentMonth && parseInt(y, 10) === currentYear) {
        if (dayOrder.status === 'delivered') {
          bill += (dayOrder.milk || 0) * PRICES.milk;
          bill += (dayOrder.ghee || 0) * PRICES.ghee;
          bill += (dayOrder.chach || 0) * PRICES.chach;
          bill += (dayOrder.paneer || 0) * PRICES.paneer;
          bill += (dayOrder.curd || 0) * PRICES.curd;
        }
      } else if (dateStr < currentMonthStr) {
        if (dayOrder.status === 'delivered') {
          prevBill += (dayOrder.milk || 0) * PRICES.milk;
          prevBill += (dayOrder.ghee || 0) * PRICES.ghee;
          prevBill += (dayOrder.chach || 0) * PRICES.chach;
          prevBill += (dayOrder.paneer || 0) * PRICES.paneer;
          prevBill += (dayOrder.curd || 0) * PRICES.curd;
        }
      }
    });

    const userPayments = globalPayments[currentUser.mobile] || [];
    userPayments.forEach(payment => {
      if (payment.status === 'approved') {
        const pMonth = payment.paymentMonth || payment.timestamp.substring(0, 7);
        if (pMonth === currentMonthStr) {
          paid += parseFloat(payment.amount);
        } else if (pMonth < currentMonthStr) {
          prevPaid += parseFloat(payment.amount);
        }
      }
    });

    // Check for overrides in previous months to adjust previous dues?
    // Actually, overrides are per month. To make it perfect, we'd iterate over all past overrides.
    Object.entries(monthlyOverrides[currentUser.mobile] || {}).forEach(([pMonth, adj]) => {
      if (pMonth < currentMonthStr) {
        if (adj.mTotal !== undefined && adj.mTotalAdj === undefined) {
           // We'd have to subtract the original month's calculated bill/paid and add the override.
           // That might be complex. Let's just do total simple adjustment for now.
        } else {
           prevBill += (adj.mTotalAdj || 0);
           prevPaid += (adj.mPaidAdj || 0);
        }
      }
    });

    const calculatedPreviousDues = prevBill - prevPaid;

    const override = monthlyOverrides[currentUser.mobile]?.[currentMonthStr];
    if (override) {
      if (override.mTotal !== undefined && override.mTotalAdj === undefined) {
        setMonthTotalBill(override.mTotal);
        setMonthPaidBill(override.mPaid);
        setPreviousDues(calculatedPreviousDues);
        setTotalBill(calculatedPreviousDues + override.mRemain);
        return;
      }
      bill += (override.mTotalAdj || 0);
      paid += (override.mPaidAdj || 0);
    }

    setMonthTotalBill(bill);
    setMonthPaidBill(paid);
    setPreviousDues(calculatedPreviousDues);
    setTotalBill(Math.max(0, calculatedPreviousDues + bill - paid));

  }, [orders, selectedDate, currentUser, globalPayments, monthlyOverrides]);

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleSaveDayOrder = (date, localOrder, replaceMode = false) => {
    if (!currentUser) return;
    const dateKey = format(date, 'yyyy-MM-dd');
    const mobile = currentUser.mobile;

    // Compute new state using current globalOrders from closure (correct React pattern)
    const prevUserOrders = globalOrders[mobile] || {};
    const prevDayOrder = prevUserOrders[dateKey] || { milk: 0, ghee: 0, chach: 0, status: 'pending' };

    const newDayOrder = replaceMode ? {
      milk: localOrder.milk || 0,
      ghee: localOrder.ghee || 0,
      chach: localOrder.chach || 0,
      paneer: localOrder.paneer || 0,
      curd: localOrder.curd || 0,
      status: 'pending'
    } : {
      milk: (prevDayOrder.milk || 0) + (localOrder.milk || 0),
      ghee: (prevDayOrder.ghee || 0) + (localOrder.ghee || 0),
      chach: (prevDayOrder.chach || 0) + (localOrder.chach || 0),
      paneer: (prevDayOrder.paneer || 0) + (localOrder.paneer || 0),
      curd: (prevDayOrder.curd || 0) + (localOrder.curd || 0),
      status: 'pending'
    };

    let newGlobalOrders;
    if (newDayOrder.milk === 0 && newDayOrder.ghee === 0 && newDayOrder.chach === 0 && newDayOrder.paneer === 0 && newDayOrder.curd === 0) {
      const newUserOrders = { ...prevUserOrders };
      delete newUserOrders[dateKey];
      newGlobalOrders = { ...globalOrders, [mobile]: newUserOrders };
    } else {
      newGlobalOrders = { ...globalOrders, [mobile]: { ...prevUserOrders, [dateKey]: newDayOrder } };
    }

    // Update React state
    setGlobalOrders(newGlobalOrders);
    // Write to Firestore OUTSIDE setState — guaranteed to fire
    setDoc(doc(db, 'store', 'globalOrders'), { data: newGlobalOrders });
    localStorage.setItem('biaora_globalOrders', JSON.stringify(newGlobalOrders));
  };

  const handleClearDayOrder = (date) => {
    if (!currentUser) return;
    const dateKey = format(date, 'yyyy-MM-dd');
    const mobile = currentUser.mobile;
    const newUserOrders = { ...(globalOrders[mobile] || {}) };
    delete newUserOrders[dateKey];
    const newGlobalOrders = { ...globalOrders, [mobile]: newUserOrders };
    setGlobalOrders(newGlobalOrders);
    setDoc(doc(db, 'store', 'globalOrders'), { data: newGlobalOrders });
    localStorage.setItem('biaora_globalOrders', JSON.stringify(newGlobalOrders));
  };

  const handleApproveUserOrder = (userMobile, dateKey) => {
    const userOrders = globalOrders[userMobile] || {};
    const dayOrder = userOrders[dateKey];
    if (!dayOrder) return;
    const newGlobalOrders = {
      ...globalOrders,
      [userMobile]: { ...userOrders, [dateKey]: { ...dayOrder, status: 'approved' } }
    };
    setGlobalOrders(newGlobalOrders);
    setDoc(doc(db, 'store', 'globalOrders'), { data: newGlobalOrders });
    localStorage.setItem('biaora_globalOrders', JSON.stringify(newGlobalOrders));
  };

  const handleDeliverUserOrder = (userMobile, dateKey) => {
    const userOrders = globalOrders[userMobile] || {};
    const dayOrder = userOrders[dateKey];
    if (!dayOrder) return;
    const newGlobalOrders = {
      ...globalOrders,
      [userMobile]: { ...userOrders, [dateKey]: { ...dayOrder, status: 'delivered' } }
    };
    setGlobalOrders(newGlobalOrders);
    setDoc(doc(db, 'store', 'globalOrders'), { data: newGlobalOrders });
    localStorage.setItem('biaora_globalOrders', JSON.stringify(newGlobalOrders));
    const user = registeredUsers.find(u => u.mobile === userMobile);
    const parts = [];
    if (dayOrder.milk) parts.push(`${dayOrder.milk}L Milk`);
    if (dayOrder.ghee) parts.push(`${dayOrder.ghee}Kg Ghee`);
    if (dayOrder.chach) parts.push(`${dayOrder.chach}L Chach`);
    logAdminAction('order', userMobile, user?.name || 'Unknown', 'approved', `Delivered: ${dateKey}, Items: ${parts.join(', ')}`);
  };

  const handleDeliverAllApproved = () => {
    let newGlobalOrders = { ...globalOrders };
    let changed = false;
    Object.entries(newGlobalOrders).forEach(([mobile, userOrders]) => {
      Object.entries(userOrders).forEach(([dateKey, order]) => {
        if (order.status === 'approved') {
          newGlobalOrders[mobile] = {
            ...newGlobalOrders[mobile],
            [dateKey]: { ...order, status: 'delivered' }
          };
          changed = true;
        }
      });
    });
    if (changed) {
      setGlobalOrders(newGlobalOrders);
      setDoc(doc(db, 'store', 'globalOrders'), { data: newGlobalOrders });
      localStorage.setItem('biaora_globalOrders', JSON.stringify(newGlobalOrders));
    }
  };

  const handleRejectUserOrder = (userMobile, dateKey) => {
    const userOrders = globalOrders[userMobile] || {};
    const dayOrder = userOrders[dateKey];
    if (!dayOrder) return;
    const newUserOrders = { ...userOrders };
    delete newUserOrders[dateKey];
    const newGlobalOrders = { ...globalOrders, [userMobile]: newUserOrders };
    setGlobalOrders(newGlobalOrders);
    setDoc(doc(db, 'store', 'globalOrders'), { data: newGlobalOrders });
    localStorage.setItem('biaora_globalOrders', JSON.stringify(newGlobalOrders));
    const user = registeredUsers.find(u => u.mobile === userMobile);
    const parts = [];
    if (dayOrder.milk) parts.push(`${dayOrder.milk}L Milk`);
    if (dayOrder.ghee) parts.push(`${dayOrder.ghee}Kg Ghee`);
    if (dayOrder.chach) parts.push(`${dayOrder.chach}L Chach`);
    logAdminAction('order', userMobile, user?.name || 'Unknown', 'deleted', `Date: ${dateKey}, Items: ${parts.join(', ')}`);
  };

  const handleEditUserOrder = (userMobile, dateKey, updatedOrder) => {
    const userOrders = globalOrders[userMobile] || {};
    const newGlobalOrders = {
      ...globalOrders,
      [userMobile]: { ...userOrders, [dateKey]: { ...userOrders[dateKey], ...updatedOrder } }
    };
    setGlobalOrders(newGlobalOrders);
    setDoc(doc(db, 'store', 'globalOrders'), { data: newGlobalOrders });
    localStorage.setItem('biaora_globalOrders', JSON.stringify(newGlobalOrders));
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
      if (data.mobile === '7509766655' && data.password === 'shyam@66655') {
        setCurrentUser({ name: 'Shyam Dangi (Admin)', mobile: '7509766655', role: 'admin' });
        setIsLoggedIn(true);
        return { success: true };
      }
      
      const user = registeredUsers.find(u => u.mobile === data.mobile && u.password === data.password);
      if (user) {
        if (user.isActive === false) {
          return { success: false, error: 'Aapka account deactivate kar diya gaya hai. Kripya Admin se sampark karein.' };
        }
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
    const isMobile = window.innerWidth <= 768;
    const hideHeader = isMobile && adminActiveTab !== 'users';

    return (
      <div className="app-container" style={{ paddingBottom: '0' }}>
        {!hideHeader && (
          <Header 
            totalBill={adminTotalReceived} 
          monthTotalBill={0}
          monthPaidBill={0}
          billUpdated={false} 
          onOpenHistory={() => {}} 
          onOpenProfile={() => setIsProfileOpen(true)}
          onAdminContactToggle={() => {}}
          onOpenAdminRevenue={() => setIsAdminRevenueOpen(true)}
          onOpenVacation={() => setIsVacationOpen(true)}
          currentUser={currentUser}
        />
        )}
        <main className="app-layout" style={{ padding: 0 }}>
          <AdminDashboard 
            activeTab={adminActiveTab}
            setActiveTab={setAdminActiveTab}
            prices={PRICES} 
            registeredUsers={registeredUsers}
            globalOrders={globalOrders} 
            onApproveOrder={handleApproveUserOrder} 
            onDeliverOrder={handleDeliverUserOrder}
            onDeliverAll={handleDeliverAllApproved}
            onRejectOrder={handleRejectUserOrder}
            onEditUserOrder={handleEditUserOrder}
            onToggleUserStatus={handleToggleUserStatus}
            profileRequests={profileRequests}
            onApproveProfile={handleApproveProfile}
            onRejectProfile={handleRejectProfile} 
            paymentRequests={paymentRequests}
            onApprovePayment={handleApprovePayment}
            onRejectPayment={handleRejectPayment}
            globalPayments={globalPayments}
            setGlobalPayments={setGlobalPayments}
            adminLogs={adminLogs}
            monthlyOverrides={monthlyOverrides}
            setMonthlyOverrides={setMonthlyOverrides}
            broadcasts={broadcasts}
            setBroadcasts={setBroadcasts}
            globalExpenses={globalExpenses}
            setGlobalExpenses={setGlobalExpenses}
            globalInventory={globalInventory}
            setGlobalInventory={setGlobalInventory}
            onSuccessAnimation={setSuccessMessage}
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
    <>
      <CustomerLayout
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPayment={() => setIsPaymentOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenQuickMilk={() => setIsQuickMilkOpen(true)}
        onOpenVacation={() => setIsVacationOpen(true)}
        onAdminContactToggle={() => setIsAdminContactOpen(true)}
      >
        {/* User Broadcast Banners */}
        {(() => {
          const activeBroadcasts = (broadcasts || []).filter(b => new Date(b.expiresAt) > new Date());
          if (activeBroadcasts.length === 0) return null;
          return (
            <div className="broadcast-container">
              {activeBroadcasts.map(b => (
                <div key={b.id} className="notification-banner info-banner">
                  <div className="banner-icon info-icon">
                    <Megaphone size={20} />
                  </div>
                  <div className="banner-text">
                    <h4 style={{ color: '#1e40af' }}>Important Announcement</h4>
                    <p style={{ color: '#1e3a8a' }}>{b.message}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        <CustomerDashboard 
          selectedDate={selectedDate}
          setCurrentDate={setSelectedDate}
          orders={orders}
          onDayClick={setSelectedDate}
          currentUser={currentUser}
          prices={PRICES}
          onSaveOrder={handleSaveDayOrder}
          monthPaidBill={monthPaidBill}
          totalBill={totalBill}
          previousDues={previousDues}
          onOpenPayment={() => setIsPaymentOpen(true)}
          onOpenPassbook={() => setIsPassbookOpen(true)}
          globalInventory={globalInventory}
        />
      </CustomerLayout>

      {isHistoryOpen && (
        <HistoryModal 
          orders={orders} 
          payments={globalPayments[currentUser?.mobile] || []}
          pendingPayment={paymentRequests[currentUser?.mobile]}
          onClose={() => setIsHistoryOpen(false)} 
          prices={PRICES}
          selectedDate={selectedDate}
          onChangeMonth={setSelectedDate}
          currentUser={currentUser}
        />
      )}

      {isPassbookOpen && (
        <CustomerPassbook
          isOpen={isPassbookOpen}
          onClose={() => setIsPassbookOpen(false)}
          userName={currentUser?.name}
          userMobile={currentUser?.mobile}
          globalOrders={globalOrders}
          globalPayments={globalPayments}
          prices={PRICES}
        />
      )}

      <CustomerVacationModal 
        isOpen={isVacationOpen}
        onClose={() => setIsVacationOpen(false)}
        currentUser={currentUser}
        onVacationUpdate={handleVacationUpdate}
      />

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
          userOrders={globalOrders[currentUser?.mobile]}
          userPayments={globalPayments[currentUser?.mobile]}
          prices={PRICES}
        />
      )}

      {isQuickMilkOpen && (
        <QuickMilkModal 
          onClose={() => setIsQuickMilkOpen(false)}
          onSaveOrder={handleSaveDayOrder}
          currentOrders={orders}
          prices={PRICES}
        />
      )}

      {successMessage && (
        <SuccessAnimation 
          message={successMessage} 
          onClose={() => setSuccessMessage(null)} 
        />
      )}
    </>
  );
}

export default App;
