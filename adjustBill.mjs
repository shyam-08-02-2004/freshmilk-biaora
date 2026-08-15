import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtc3NegSsl7ztrzNhsJH4NiddUApcmSkc",
  projectId: "biaoramilk",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function adjustBill() {
  const mobile = "9755334721";
  const targetBill = 200; // Target due amount
  
  const ordersRef = doc(db, 'store', 'globalOrders');
  const paymentsRef = doc(db, 'store', 'globalPayments');
  
  const [ordersSnap, paymentsSnap] = await Promise.all([getDoc(ordersRef), getDoc(paymentsRef)]);
  
  let currentDue = 0;
  
  if (ordersSnap.exists()) {
      const oData = ordersSnap.data().data || {};
      const userOrders = oData[mobile] || {};
      for (const [date, order] of Object.entries(userOrders)) {
          if (order.status === 'delivered') {
              currentDue += order.totalPrice || 0;
          }
      }
  }
  
  if (paymentsSnap.exists()) {
      const pData = paymentsSnap.data().data || {};
      const userPayments = pData[mobile] || [];
      for (const p of userPayments) {
          if (p.status === 'approved') {
              currentDue -= p.amount || 0;
          }
      }
  }
  
  console.log("Current Due is: " + currentDue);
  
  const difference = targetBill - currentDue;
  console.log("Difference to add: " + difference);
  
  if (difference === 0) {
      console.log("Bill is already 200.");
      process.exit(0);
  }
  
  if (ordersSnap.exists()) {
      const fullData = ordersSnap.data();
      const oData = fullData.data || {};
      if (!oData[mobile]) oData[mobile] = {};
      
      const adjustmentDate = "2026-08-16-adjustment-" + Date.now();
      oData[mobile][adjustmentDate] = {
          date: "2026-08-16",
          items: [{ name: "Manual Admin Adjustment", price: difference, quantity: 1, type: 'adjustment' }],
          totalPrice: difference,
          status: "delivered",
          timestamp: new Date().toISOString()
      };
      
      await setDoc(ordersRef, { data: oData });
      console.log("SUCCESS: Bill adjusted to 200. Added adjustment of: " + difference);
  }
  
  process.exit(0);
}

adjustBill();
