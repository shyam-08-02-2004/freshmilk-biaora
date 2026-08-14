import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtc3NegSsl7ztrzNhsJH4NiddUApcmSkc",
  authDomain: "biaoramilk.firebaseapp.com",
  projectId: "biaoramilk",
  storageBucket: "biaoramilk.firebasestorage.app",
  messagingSenderId: "661865963000",
  appId: "1:661865963000:web:b7841c24dda32341064a0d",
  measurementId: "G-BEN89327L2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
