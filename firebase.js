/* ============================================================
   OMAR ABERTURAS — FIREBASE
   Inicialización de Auth + Firestore
   ============================================================ */

const ADMIN_EMAIL = 'correo.omaraberturas@gmail.com';

firebase.initializeApp({
  apiKey: "AIzaSyCoGU_2TNJni7Aj_VJlYRuYkE43JKpnU94",
  authDomain: "omar-aberturas.firebaseapp.com",
  projectId: "omar-aberturas",
  storageBucket: "omar-aberturas.firebasestorage.app",
  messagingSenderId: "54523594353",
  appId: "1:54523594353:web:3e7c5cbf06be410f27bdd0"
});

const auth = firebase.auth();
const db   = firebase.firestore();
