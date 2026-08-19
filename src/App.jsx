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
import CustomerSabziMarket from './components/CustomerSabziMarket';
import CustomerLayout from './components/CustomerLayout';
import CustomerPassbook from './components/CustomerPassbook';
import CustomerVacationModal from './components/CustomerVacationModal';
import SuccessAnimation from './components/SuccessAnimation';
import { format } from 'date-fns';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Megaphone } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { playClick, playSuccess, playSwoosh } from './utils/haptics';
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
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('user_activeTab') || 'home');
  const [adminActiveTab, setAdminActiveTab] = useState(() => sessionStorage.getItem('admin_activeTab') || 'users');

  React.useEffect(() => {
    sessionStorage.setItem('user_activeTab', activeTab);
  }, [activeTab]);
  
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
  const [globalVegetables, setGlobalVegetables] = useFirestoreSync('globalVegetables', [
    { id: 'v1', name: 'Aloo (Potato)', price: 40, unit: 'kg', inStock: true, emoji: '🥔', image: '/sabzi/potato.png' },
    { id: 'v2', name: 'Tamatar (Tomato)', price: 60, unit: 'kg', inStock: true, emoji: '🍅', image: '/sabzi/tomato.jpg' },
    { id: 'v3', name: 'Mirchi (Green Chilli)', price: 10, unit: '100g', inStock: true, emoji: '🌶️', image: '/sabzi/chilli.png' },
    { id: 'v4', name: 'Dhaniya (Coriander)', price: 10, unit: 'bunch', inStock: true, emoji: '🌿', image: '/sabzi/coriander.png' },
    { id: 'v5', name: 'Nimboo (Lemon)', price: 5, unit: 'piece', inStock: true, emoji: '🍋', image: '/sabzi/lemon.png' }
  ]);
  
  useEffect(() => {
    if (globalVegetables && globalVegetables.length > 0) {
      let needsMigration = false;
      const migrated = globalVegetables.map(v => {
        if (!v.image) {
          needsMigration = true;
          let img = '';
          if (v.id === 'v1' || v.name.includes('Aloo')) img = '/sabzi/potato.png';
          if (v.id === 'v2' || v.name.includes('Tamatar')) img = '/sabzi/tomato.jpg';
          if (v.id === 'v3' || v.name.includes('Mirchi')) img = '/sabzi/chilli.png';
          if (v.id === 'v4' || v.name.includes('Dhaniya')) img = '/sabzi/coriander.png';
          if (v.id === 'v5' || v.name.includes('Nimboo')) img = '/sabzi/lemon.png';
          return { ...v, image: img };
        }
        return v;
      });
      if (needsMigration) {
        setGlobalVegetables(migrated);
      }
    }
  }, [globalVegetables, setGlobalVegetables]);

  const [globalSabziOrders, setGlobalSabziOrders] = useFirestoreSync('globalSabziOrders', {});
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

  const handleUpdateFamily = (familyMembers) => {
    if (!currentUser) return;
    const mobile = currentUser.mobile;
    setRegisteredUsers(prev => prev.map(u => u.mobile === mobile ? { ...u, familyMembers } : u));
    setCurrentUser(prev => ({ ...prev, familyMembers }));
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
      
      let dTotal = dayOrder.totalPrice;
      if (dTotal === undefined) {
        dTotal = 0;
        dTotal += (dayOrder.milk || 0) * PRICES.milk;
        dTotal += (dayOrder.ghee || 0) * PRICES.ghee;
        dTotal += (dayOrder.chach || 0) * PRICES.chach;
        dTotal += (dayOrder.paneer || 0) * PRICES.paneer;
        dTotal += (dayOrder.curd || 0) * PRICES.curd;
      }

      if (parseInt(m, 10) === currentMonth && parseInt(y, 10) === currentYear) {
        if (dayOrder.status === 'delivered') {
          bill += dTotal;
        }
      } else if (dateStr < currentMonthStr) {
        if (dayOrder.status === 'delivered') {
          prevBill += dTotal;
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
    
    if (!currentUser || currentUser.role !== 'admin') {
       if (newDayOrder.milk === 0 && newDayOrder.ghee === 0 && newDayOrder.chach === 0 && newDayOrder.paneer === 0 && newDayOrder.curd === 0) {
         playClick();
       } else {
         playSuccess();
       }
    }
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
    playSwoosh();
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
    playSuccess();
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
      playSuccess();
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

  const handleDeleteUser = (mobile) => {
    const user = registeredUsers.find(u => u.mobile === mobile);
    if (!user) return;
    
    // Remove from registered users
    setRegisteredUsers(prev => prev.filter(u => u.mobile !== mobile));
    
    // Remove orders
    setGlobalOrders(prev => {
      const next = { ...prev };
      delete next[mobile];
      setDoc(doc(db, 'store', 'globalOrders'), { data: next });
      return next;
    });
    
    // Remove payments
    setGlobalPayments(prev => {
      const next = { ...prev };
      delete next[mobile];
      setDoc(doc(db, 'store', 'globalPayments'), { data: next });
      return next;
    });
    
    logAdminAction('profile', mobile, user.name, 'deleted', 'Account permanently deleted');
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

  if (isLoggedIn && !usersLoaded) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="skeleton-box" style={{ width: '48px', height: '48px', borderRadius: '12px' }}></div>
            <div>
              <div className="skeleton-box" style={{ width: '120px', height: '20px', marginBottom: '8px' }}></div>
              <div className="skeleton-box" style={{ width: '80px', height: '16px' }}></div>
            </div>
          </div>
          <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
        </div>

        {/* Main Content Skeleton */}
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: window.innerWidth > 768 ? '1fr 380px' : '1fr' }}>
          <div>
            <div className="skeleton-box" style={{ width: '100%', height: '80px', borderRadius: '16px', marginBottom: '1.5rem' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '1.5rem' }}>
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="skeleton-box" style={{ aspectRatio: '1', borderRadius: '12px' }}></div>
              ))}
            </div>
          </div>
          <div className="skeleton-box" style={{ width: '100%', height: '300px', borderRadius: '20px' }}></div>
        </div>
      </div>
    );
  }

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
            onDeleteUser={handleDeleteUser}
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
            globalVegetables={globalVegetables}
            setGlobalVegetables={setGlobalVegetables}
            globalSabziOrders={globalSabziOrders}
            setGlobalSabziOrders={setGlobalSabziOrders}
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
            onUpdateFamily={handleUpdateFamily}
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

  const checkIsReminderDay = () => {
    const today = new Date();
    const date = today.getDate();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    // Mid month: 14th to 16th
    if (date >= 14 && date <= 16) return true;
    // End month: Last 3 days or 1st day of next month
    if (date >= lastDay - 2 || date === 1) return true;
    return false;
  };
  const isReminderDay = checkIsReminderDay();

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
        {/* Floating Bill Payment Reminder */}
        {totalBill > 0 && isReminderDay && !sessionStorage.getItem('dismissedDue') && (
          <div className="floating-balloon-notification" style={{
            position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,1)',
            borderRadius: '24px', padding: '1rem', zIndex: 1000, width: '90%', maxWidth: '350px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }}>
            <button onClick={() => { sessionStorage.setItem('dismissedDue', 'true'); setActiveTab('home'); /* force re-render if needed but this works on next click anyway */ document.querySelector('.floating-balloon-notification').style.display='none'; }} style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✖</button>
            <div style={{ fontSize: '2rem', marginBottom: '0.2rem', animation: 'bounce 2s infinite' }}>🎈</div>
            <h4 style={{ margin: '0 0 0.2rem', color: '#1e293b', fontSize: '1rem' }}>Namaste! 🙏</h4>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.85rem' }}>Aapka pichla doodh ka hisab due hai.</p>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ef4444', marginBottom: '1rem' }}>₹{totalBill.toFixed(0)}</div>
            <button onClick={() => { setIsPaymentOpen(true); sessionStorage.setItem('dismissedDue', 'true'); }} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '100px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(16,185,129,0.4)', cursor: 'pointer' }}>
              Pay Now
            </button>
          </div>
        )}

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

        {activeTab === 'home' && (
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
        )}
        
        {activeTab === 'sabzi' && (
          <CustomerSabziMarket 
            currentUser={currentUser}
            globalVegetables={globalVegetables}
            globalSabziOrders={globalSabziOrders}
            orders={orders}
          />
        )}
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
          onUpdateFamily={handleUpdateFamily}
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
          currentUser={currentUser}
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
