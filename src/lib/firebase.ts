import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDrl_pko4EEgNKTAJCRAErn0QIVZr4GbMI",
  authDomain: "time-flow-6cda7.firebaseapp.com",
  databaseURL: "https://time-flow-6cda7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "time-flow-6cda7",
  storageBucket: "time-flow-6cda7.firebasestorage.app",
  messagingSenderId: "119215165776",
  appId: "1:119215165776:web:67f1cf7d7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
