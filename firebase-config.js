import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js"; // Обновлено до 9.22.1
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js"; // Обновлено до 9.22.1
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js"; // Обновлено до 9.22.1

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGEvIce5EF1SFvKXa8xh0gqoCqQca26ag",
  authDomain: "opros-klassa-8b.firebaseapp.com",
  databaseURL: "https://opros-klassa-8b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "opros-klassa-8b",
  storageBucket: "opros-klassa-8b.appspot.com", // Исправлено на opros-klassa-8b.appspot.com
  messagingSenderId: "676010460004",
  appId: "1:676010460004:web:6c3ec22f1066299898f071",
  measurementId: "G-XW8RETP7CS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database, GoogleAuthProvider };
