// firebase-init.js
// Module ES6 — dijalankan sebagai <script type="module">
// Mengekspos fungsi addWish() dan subscribeWishes() ke window
// agar bisa dipanggil dari script.js (non-module)

import { initializeApp }                       from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc,
         query, orderBy, onSnapshot,
         serverTimestamp }                      from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// ── Paste konfigurasi Anda di sini ──────────────────────────────────────
// Dapatkan dari: Firebase Console → Project Settings → Your Apps → Web App
const firebaseConfig = {
  apiKey:            "AIzaSyAC-EOsxEMJ3sxUuCqVn25Do8jCqSv6T-A",
  authDomain:        "undangan-thoriq-april.firebaseapp.com",
  projectId:         "undangan-thoriq-april",
  storageBucket:     "undangan-thoriq-april.firebasestorage.app",
  messagingSenderId: "344738743208",
  appId:             "1:344738743208:web:9885105d67fbc1c377939d",
  measurementId:     "G-3H30LQM5Y6"
};
// ────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const COLLECTION = "wishes";

/**
 * Simpan satu ucapan/RSVP ke Firestore.
 * @param {{ name: string, text: string, attendance: string }} entry
 * @returns {Promise<void>}
 */
async function addWish(entry) {
  await addDoc(collection(db, COLLECTION), {
    name:       entry.name,
    text:       entry.text,
    attendance: entry.attendance,
    timestamp:  serverTimestamp()
  });
}

/**
 * Listen real-time ke semua wishes (terbaru dulu).
 * @param {function(Array)} callback — dipanggil setiap ada perubahan
 * @returns {function} unsubscribe
 */
function subscribeWishes(callback) {
  const q = query(collection(db, COLLECTION), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id:         doc.id,
      name:       doc.data().name,
      text:       doc.data().text,
      attendance: doc.data().attendance,
      timestamp:  doc.data().timestamp?.toDate?.()?.toISOString() || null
    }));
    callback(data);
  });
}

// Ekspos ke window agar script.js (non-module) bisa mengakses
window.__firebase = { addWish, subscribeWishes };
window.dispatchEvent(new Event("firebase-ready"));
