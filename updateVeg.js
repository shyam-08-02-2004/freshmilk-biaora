import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function update() {
  const ref = doc(db, 'store', 'globalVegetables');
  const snap = await getDoc(ref);
  let data = snap.exists() ? snap.data().data : [];
  
  if(data.length === 0) {
    data = [
      { id: 'v1', name: 'Aloo (Potato)', price: 40, unit: 'kg', inStock: true, emoji: '🥔', image: '/sabzi/potato.png' },
      { id: 'v2', name: 'Tamatar (Tomato)', price: 60, unit: 'kg', inStock: true, emoji: '🍅', image: '/sabzi/tomato.jpg' },
      { id: 'v3', name: 'Mirchi (Green Chilli)', price: 10, unit: '100g', inStock: true, emoji: '🌶️', image: '/sabzi/chilli.png' },
      { id: 'v4', name: 'Dhaniya (Coriander)', price: 10, unit: 'bunch', inStock: true, emoji: '🌿', image: '/sabzi/coriander.png' },
      { id: 'v5', name: 'Nimboo (Lemon)', price: 5, unit: 'piece', inStock: true, emoji: '🍋', image: '/sabzi/lemon.png' }
    ];
  } else {
    data = data.map(v => {
      if(v.id === 'v1' || v.name.includes('Aloo')) v.image = '/sabzi/potato.png';
      if(v.id === 'v2' || v.name.includes('Tamatar')) v.image = '/sabzi/tomato.jpg';
      if(v.id === 'v3' || v.name.includes('Mirchi')) v.image = '/sabzi/chilli.png';
      if(v.id === 'v4' || v.name.includes('Dhaniya')) v.image = '/sabzi/coriander.png';
      if(v.id === 'v5' || v.name.includes('Nimboo')) v.image = '/sabzi/lemon.png';
      return v;
    });
  }
  
  await setDoc(ref, { data });
  console.log('Updated successfully');
}
update().catch(console.error);
