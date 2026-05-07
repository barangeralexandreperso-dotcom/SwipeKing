import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "swipe-king-6f95b.firebaseapp.com",
  projectId: "swipe-king-6f95b",
  storageBucket: "swipe-king-6f95b.firebasestorage.app",
  messagingSenderId: "149048703091",
  appId: "1:149048703091:web:8bd7b61d44648fd4a7d206"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.saveScore = async (name, score)=>{
  await addDoc(collection(db,"scores"),{
    name,
    score,
    date:Date.now()
  });
};

window.getScores = async ()=>{
  const q = query(
    collection(db,"scores"),
    orderBy("score","desc"),
    limit(10)
  );

  const snap = await getDocs(q);

  let html="";

  snap.forEach(d=>{
    let s=d.data();
    html += `<div>${s.name} - ${s.score} cm</div>`;
  });

  return html;
};

window.incrementVisits = async ()=>{
  const ref = collection(db,"visits");

  await addDoc(ref,{t:Date.now()});

  const snap = await getDocs(ref);

  return snap.size;
};