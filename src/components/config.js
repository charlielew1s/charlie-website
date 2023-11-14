import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCLHGEFtmGIhFRxxSmfYU0AwcPVyiBTF6c",
  authDomain: "charlie-website-2550b.firebaseapp.com",
  projectId: "charlie-website-2550b",
  storageBucket: "charlie-website-2550b.appspot.com",
  messagingSenderId: "446088738081",
  appId: "1:446088738081:web:8132a82584cea715d8ba60"
};


const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { firestore, auth, provider };