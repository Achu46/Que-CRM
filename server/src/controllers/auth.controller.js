import { db } from '../config/firebase.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * Returns current authenticated user and role profile
 */
export async function getMe(req, res, next) {
  try {
    return sendSuccess(res, req.user, 'Current user session profile');
  } catch (error) {
    next(error);
  }
}

/**
 * Synchronizes user record in Firestore after Firebase Auth signup/login
 */
export async function syncUser(req, res, next) {
  try {
    const { uid, email, name, role } = req.user;

    const userData = {
      id: uid,
      email,
      name: name || email.split('@')[0],
      role: role || 'sales_rep',
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      const userRef = db.collection('users').doc(uid);
      const doc = await userRef.get();
      if (!doc.exists) {
        userData.createdAt = new Date().toISOString();
        await userRef.set(userData);
      } else {
        await userRef.update({
          email: userData.email,
          name: userData.name,
          updatedAt: userData.updatedAt,
        });
      }
    }

    return sendSuccess(res, userData, 'User synced successfully');
  } catch (error) {
    next(error);
  }
}
