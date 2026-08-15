import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtc3NegSsl7ztrzNhsJH4NiddUApcmSkc",
  projectId: "biaoramilk",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixDB() {
  const mobile = "9755334721";
  const ordersRef = doc(db, 'store', 'globalOrders');
  
  const snap = await getDoc(ordersRef);
  if (snap.exists()) {
      const fullData = snap.data();
      const oData = fullData.data || {};
      
      if (oData[mobile]) {
          const keys = Object.keys(oData[mobile]);
          for (const key of keys) {
              if (key.includes('-adjustment-')) {
                  const badOrder = oData[mobile][key];
                  delete oData[mobile][key];
                  oData[mobile]['2026-08-16'] = badOrder;
                  console.log("Fixed key " + key + " to 2026-08-16");
              }
          }
          await setDoc(ordersRef, { data: oData });
          console.log("SUCCESS");
      }
  }
  process.exit(0);
}

fixDB();
