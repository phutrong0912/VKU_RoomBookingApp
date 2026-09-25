/**
 * Firebase Project Configuration for VKU Campus Room Booking
 *
 * To connect your own Firebase project:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Create a new Firebase project (e.g. "vku-room-booking")
 * 3. Go to Project Settings -> General -> Your apps -> Web app (</>) -> Register app
 * 4. Copy the `firebaseConfig` object and paste its values below.
 * 5. In Firebase Console -> Build -> Firestore Database -> Create database (select "Start in test mode").
 */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCs8nWvAImdotNeZrIyUKPDVWebgXB_TM8",
  authDomain: "vku-booking-room-63680.firebaseapp.com",
  projectId: "vku-booking-room-63680",
  storageBucket: "vku-booking-room-63680.firebasestorage.app",
  messagingSenderId: "961904821462",
  appId: "1:961904821462:web:e8ad3f18f381621551b577",
  measurementId: "G-B6N40X9NQ4"
};

/**
 * Checks whether user has provided real Firebase credentials.
 * If not, the app operates smoothly in Local/Demo mode so rooms always display instantly!
 */
export function isFirebaseConfigured(): boolean {
  return (
    Boolean(FIREBASE_CONFIG.apiKey) &&
    !FIREBASE_CONFIG.apiKey.includes('YOUR_FIREBASE_API_KEY') &&
    !FIREBASE_CONFIG.apiKey.startsWith('AIzaSyDummy') &&
    !FIREBASE_CONFIG.apiKey.startsWith('AIzaSyDemo') &&
    Boolean(FIREBASE_CONFIG.projectId) &&
    FIREBASE_CONFIG.projectId !== 'YOUR_PROJECT_ID'
  );
}
