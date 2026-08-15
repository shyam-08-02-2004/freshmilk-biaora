import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtc3NegSsl7ztrzNhsJH4NiddUApcmSkc",
  projectId: "biaoramilk",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteOrder() {
  const mobile = "9755334721";
  const dateStr = "2026-08-16"; 
  
  const docRef = doc(db, 'store', 'globalOrders');
  try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const fullData = snap.data();
        const data = fullData.data || {};
        if (data[mobile] && data[mobile][dateStr]) {
           delete data[mobile][dateStr];
           await setDoc(docRef, { data });
           console.log("SUCCESS: Deleted order for " + dateStr + " for user " + mobile);
        } else {
           console.log("Order not found for that date. Dates available: " + (data[mobile] ? Object.keys(data[mobile]).join(', ') : 'none'));
        }
      } else {
          console.log("Global Orders doc not found");
      }
  } catch(e) {
      console.error(e);
  }
  process.exit(0);
}

deleteOrder();
