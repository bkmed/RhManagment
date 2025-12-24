import { initializeApp } from 'firebase/app';
import { Platform } from 'react-native';

// REPLACE WITH YOUR FIREBASE CONFIG
// You can find these in your Firebase Console -> Project Settings -> General -> Your apps -> Web app
const firebaseConfig = {
  apiKey: 'AIzaSyA5RDVnk0Cd3r2xzEGXKRRpr_DEWxZOmSU',
  authDomain: 'medicare-reminder-b272f.firebaseapp.com',
  projectId: 'medicare-reminder-b272f',
  storageBucket: 'medicare-reminder-b272f.firebasestorage.app',
  messagingSenderId: '643740408782',
  appId: '1:643740408782:web:08adb76c62bc70331aa99f',
  measurementId: 'G-YPJDHPN441',
};

let app: any;

if (Platform.OS === 'web') {
  try {
    app = initializeApp(firebaseConfig);
    console.log('Firebase App initialized for Web');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export { app };
