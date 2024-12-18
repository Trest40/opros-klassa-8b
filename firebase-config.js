import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGEvIce5EF1SFvKXa8xh0gqoCqQca26ag",
    authDomain: "opros-klassa-8b.firebaseapp.com",
    databaseURL: "https://opros-klassa-8b-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "opros-klassa-8b",
    storageBucket: "opros-klassa-8b.appspot.com",
    messagingSenderId: "676010460004",
    appId: "1:676010460004:web:6c3ec22f1066299898f071"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
