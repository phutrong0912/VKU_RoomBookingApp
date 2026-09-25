import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { INITIAL_ROOMS, INITIAL_USER_BOOKINGS } from '../api/mockData';
import { FIREBASE_CONFIG, isFirebaseConfigured } from './firebaseConfig';

let app: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

// Only initialize Firebase if valid project credentials have been configured
if (isFirebaseConfigured()) {
  try {
    if (!getApps().length) {
      app = initializeApp(FIREBASE_CONFIG);
    } else {
      app = getApp();
    }
    firestoreDb = getFirestore(app);
    console.log('[Firebase] Connected to Firebase Project:', FIREBASE_CONFIG.projectId);
  } catch (err) {
    console.warn('[Firebase] Initialization error, falling back to local storage:', (err as any)?.message);
  }
} else {
  console.log('[Firebase] Running in Local Mode with preloaded VKU rooms catalog.');
}

export const db: Firestore | null = firestoreDb;

let isSeeded = false;

/**
 * Helper to wrap any promise with a strict timeout so Firebase queries never freeze the UI
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Auto-seeds Firestore database with initial VKU campus rooms and slots if not already populated.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (isSeeded || !db || !isFirebaseConfigured()) return;

  try {
    const roomsCol = collection(db, 'rooms');
    const snapshot = await withTimeout(getDocs(roomsCol), 2000);

    if (snapshot.empty) {
      console.log('[Firebase] Seeding initial VKU campus rooms into Firestore...');
      for (const room of INITIAL_ROOMS) {
        await withTimeout(setDoc(doc(db, 'rooms', room.id), room), 1500);
      }

      console.log('[Firebase] Seeding initial booking reservations...');
      for (const booking of INITIAL_USER_BOOKINGS) {
        await withTimeout(setDoc(doc(db, 'bookings', booking.id), booking), 1500);
      }
      console.log('[Firebase] Seed completed successfully.');
    }
    isSeeded = true;
  } catch (error) {
    console.warn('[Firebase] Firestore auto-seed skipped/offline fallback:', (error as any)?.message);
    isSeeded = true; // Avoid re-attempting in same session
  }
}
