import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { env } from './env.js';

let db = null;
let auth = null;
let isMock = false;

// Attempt real Firebase Admin initialization
try {
  let credential = null;

  if (env.firebase.serviceAccountBase64) {
    const jsonStr = Buffer.from(env.firebase.serviceAccountBase64, 'base64').toString('utf8');
    credential = admin.credential.cert(JSON.parse(jsonStr));
  } else if (env.firebase.serviceAccountKey) {
    const keyPath = path.resolve(process.cwd(), env.firebase.serviceAccountKey);
    if (fs.existsSync(keyPath)) {
      const fileData = fs.readFileSync(keyPath, 'utf8');
      credential = admin.credential.cert(JSON.parse(fileData));
    }
  }

  if (credential) {
    if (!admin.apps.length) {
      admin.initializeApp({ credential });
    }
    db = admin.firestore();
    auth = admin.auth();
    console.log('[Firebase Admin] Connected to Cloud Firestore successfully.');
  } else {
    // If running in development or test without serviceAccountKey, provide graceful fallback
    console.warn('[Firebase Admin] No service account key found. Initializing in dev/mock mode.');
    isMock = true;
  }
} catch (error) {
  console.warn('[Firebase Admin] Initialization warning:', error.message);
  isMock = true;
}

export { admin, db, auth, isMock };
